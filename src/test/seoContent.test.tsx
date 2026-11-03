import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { PublicContentProvider, usePublicRows, readPublicSnapshot } from "@/seo/PublicContent";
import { portfolioMetadata, portfolioImageAlt } from "@/seo/portfolioMetadata";
import ServiceFAQ from "@/components/ServiceFAQ";
import { landingFaqItems } from "@/content/landingFaq";
import { publicQueries, contentForRoute, serializePublicContent } from "../../scripts/public-content.mjs";

describe("public content prerender contract", () => {
  it("keeps anonymous published content separate from admin and lead data", () => {
    expect(Object.keys(publicQueries)).not.toEqual(expect.arrayContaining(["contact_messages"]));
    expect(Object.keys(publicQueries).some(key => /lead_magnet_downloads|quote_requests|api_keys|auth|tracking/.test(key))).toBe(false);
    expect(publicQueries.site_settings).toContain("key=in.(hero_bg,landing_pricing_plan_ids)");
    expect(publicQueries.blog_posts).toContain("status=eq.published");
    expect(publicQueries.case_studies).toContain("is_published=eq.true");
    Object.values(publicQueries).forEach(query => expect(String(query)).not.toContain("select=*"));
  });
  it("isolates galleries to the current visible category and subcategory", () => {
    const all = { seo_metadata: [], social_links: [], portfolio_categories: [{id:"c1",slug:"fotografia"}], portfolio_subcategories:[{id:"s1",slug:"producto",category_id:"c1"},{id:"s2",slug:"otro",category_id:"c2"}],portfolio_images:[{id:"p1",subcategory_id:"s1"},{id:"p2",subcategory_id:"s2"}] };
    const data = contentForRoute(all, "/portafolio/fotografia/producto");
    expect(data.portfolio_images).toEqual([{id:"p1",subcategory_id:"s1"}]);
    expect(data.portfolio_subcategories).toHaveLength(1);
  });
  it("does not embed complete blog bodies on the listing", () => {
    const all={seo_metadata:[],social_links:[],blog_posts:[{slug:"a",title:"A",content:"body"},{slug:"b",title:"B",content:"other"}]};
    expect(contentForRoute(all,"/blog").blog_posts[0]).not.toHaveProperty("content");
    expect(contentForRoute(all,"/blog/a").blog_posts).toHaveLength(1);
  });
  it("escapes script terminators without losing the original content", () => {
    const data={text:"</script><script>alert(1)</script>\u2028"};
    const result=serializePublicContent(data);
    expect(result).not.toContain("</script>");
    expect(JSON.parse(result)).toEqual(data);
  });
  it("seeds the same actual component during server rendering", () => {
    function Fixture(){return <h1>{usePublicRows<{title:string}>("blog_posts")[0]?.title}</h1>;}
    expect(renderToStaticMarkup(<PublicContentProvider tables={{blog_posts:[{title:"Artículo publicado"}]}}><Fixture /></PublicContentProvider>)).toBe("<h1>Artículo publicado</h1>");
  });
  it("fails safely when the optional browser snapshot is missing or malformed", () => {
    document.body.innerHTML='<script id="sc-public-content" type="application/json">not json</script>';
    expect(readPublicSnapshot()).toEqual({});
    document.body.innerHTML="";
    expect(readPublicSnapshot()).toEqual({});
  });
});
describe("portfolio metadata and alternatives", () => {
  it("distinguishes photography and video product galleries", () => {
    const photo=portfolioMetadata({name:"Fotografía"},{name:"Producto"});
    const video=portfolioMetadata({name:"Vídeo"},{name:"Producto"});
    expect(photo.title).not.toBe(video.title);
    expect(photo.heading).toContain("Fotografía: Producto");
    expect(photo.description).toContain("Madrid");
  });
  it.each(["1R9A9369.jpg","IMG_001.jpg","271A3080-Editar.jpg"])("replaces filename %s with factual gallery context", filename => {
    expect(portfolioImageAlt({alt_text:filename,title:filename},{name:"Fotografía"},{name:"Producto"})).toBe("Fotografía — Producto — portafolio de Silvio Costa");
  });
  it("preserves an authored description instead of overwriting it", () => {
    expect(portfolioImageAlt({alt_text:"Botella de aceite sobre fondo oscuro"})).toBe("Botella de aceite sobre fondo oscuro");
  });
});
describe("answer-engine content", () => {
  it("puts questions and answers in HTML without needing JavaScript", () => {
    const html=renderToStaticMarkup(<ServiceFAQ title="Preguntas frecuentes" items={[{question:"¿Incluye hosting?",answer:"Incluye 12 meses de hosting."}]} />);
    expect(html).toContain("<summary"); expect(html).toContain("Incluye 12 meses de hosting.");
  });
  it("uses the owner's confirmed property photography delivery time", () => {
    const answer=landingFaqItems.find(x=>x.answer.includes("fotografía inmobiliaria"))!.answer;
    expect(answer).toContain("24 a 48 horas");
  });
});
