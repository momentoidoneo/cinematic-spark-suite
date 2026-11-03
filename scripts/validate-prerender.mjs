import { readFile, access } from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
const root=path.resolve("dist");
const sitemap=await readFile(path.join(root,"sitemap.xml"),"utf8");
const urls=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(x=>new URL(x[1]));
assert(urls.length > 20, "Refuse unexpectedly empty public sitemap");
const titles=new Set(); const results=[];
const normalize=text=>text.replace(/\s+/g," ").trim();
for (const url of urls) {
  assert.equal(url.origin,"https://silviocosta.net");
  const html=await readFile(path.join(root,url.pathname,"index.html"),"utf8");
  const doc=new JSDOM(html).window.document; const body=doc.querySelector("#root");
  assert.equal(body.querySelectorAll("h1").length,1,url.pathname);
  assert(doc.title && !titles.has(doc.title),`Duplicate/missing title: ${url.pathname}`);titles.add(doc.title);
  assert(doc.querySelector('meta[name="description"]')?.content,`Description: ${url.pathname}`);
  assert.equal(new URL(doc.querySelector('link[rel="canonical"]').href).pathname.replace(/\/$/,""),url.pathname.replace(/\/$/,""));
  assert(!doc.querySelector('meta[name="robots"]').content.includes("noindex"));
  const snapshot=JSON.parse(doc.querySelector("#sc-public-content").textContent);
  assert(!Object.keys(snapshot).some(key=>/messages|quote_requests|subscribers|downloads|api_keys|auth/.test(key)),"Private table in snapshot");
  for(const row of snapshot.site_settings || [])assert(["hero_bg","landing_pricing_plan_ids"].includes(row.key));
  for(const form of body.querySelectorAll("form")) assert(form.querySelector("fieldset[disabled][data-prerender-form-guard]"),"Unguarded no-JS form");
  for(const image of body.querySelectorAll("img[src]")) {
    assert(image.hasAttribute("alt"),`Missing alt: ${url.pathname}`);
    if(image.getAttribute("src").startsWith("/assets/"))await access(path.join(root,image.getAttribute("src")));
  }
  for(const image of body.querySelectorAll("footer img")) {
    assert(Number(image.getAttribute("width")) > 0 && Number(image.getAttribute("height")) > 0, `Unsized footer image: ${url.pathname}`);
  }
  for(const node of doc.querySelectorAll('script[type="application/ld+json"]')) {
    const data=JSON.parse(node.textContent); const schemas=Array.isArray(data)?data:[data];
    for(const schema of schemas)if(schema["@type"]==="FAQPage")for(const item of schema.mainEntity){
      assert(normalize(body.textContent).includes(normalize(item.name)),`FAQ question missing: ${url.pathname}: ${item.name}`);
      assert(normalize(body.textContent).includes(normalize(item.acceptedAnswer.text)),`FAQ answer missing: ${url.pathname}: ${item.name}`);
    }
  }
  results.push({path:url.pathname,h2:body.querySelectorAll("h2").length,images:body.querySelectorAll("img").length,words:normalize(body.textContent).split(" ").length});
}
for(const route of ["admin","login"]) {
  const html=await readFile(path.join(root,route,"index.html"),"utf8");
  assert(!html.includes('id="sc-public-content"'),"Public snapshot must not be embedded in private shells");
  assert(html.includes("noindex, nofollow, noarchive"));
}
const redirects = (await readFile(path.join(root, "_redirects"), "utf8")).trim().split("\n");
for (const line of redirects) {
  const [from, to, status] = line.split(/\s+/);
  assert.equal(status, "301");
  assert(!from.includes("*"), "Legacy redirects must have a known destination, not a wildcard");
  const target = new URL(to, "https://silviocosta.net");
  assert(urls.some(url => url.pathname === target.pathname), `Redirect to missing/nonpublic page: ${line}`);
  await access(path.join(root, target.pathname, "index.html"));
}
console.log(JSON.stringify({validated:results.length,duplicateTitles:0,pagesWithHeadings:results.filter(x=>x.h2>0).length,pagesWithImages:results.filter(x=>x.images>0).length,home:results.find(x=>x.path==="/")},null,2));
