const baseUrl = (process.env.SMOKE_BASE_URL || "https://silviocosta.net")
  .replace(/\/+$/, "");

const failures = [];

function expect(condition, message) {
  if (!condition) failures.push(message);
}

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    redirect: options.redirect || "follow",
    headers: {
      "User-Agent": "SilvioCostaMigrationSmokeTest/1.0",
      ...(options.headers || {}),
    },
  });
  return {
    response,
    body: options.body === false ? "" : await response.text(),
  };
}

const publicPages = [
  ["/", "https://silviocosta.net"],
  ["/servicios/fotografia", "https://silviocosta.net/servicios/fotografia"],
  ["/servicios/video-dron", "https://silviocosta.net/servicios/video-dron"],
  ["/servicios/tour-virtual", "https://silviocosta.net/servicios/tour-virtual"],
  ["/precios", "https://silviocosta.net/precios"],
  [
    "/servicios-audiovisuales-madrid",
    "https://silviocosta.net/servicios-audiovisuales-madrid",
  ],
  [
    "/servicios-audiovisuales-castilla-la-mancha",
    "https://silviocosta.net/servicios-audiovisuales-castilla-la-mancha",
  ],
];

for (const [path, canonical] of publicPages) {
  const { response, body } = await request(path);
  expect(response.status === 200, `${path} respondió ${response.status}`);
  expect(
    new URL(response.url).pathname === path,
    `${path} cambió de URL a ${new URL(response.url).pathname}`,
  );
  expect(
    body.includes(`rel="canonical" href="${canonical}"`),
    `${path} no contiene la canonical esperada`,
  );
  expect(
    body.includes("GTM-NCPZ56K2"),
    `${path} no contiene el contenedor GTM`,
  );
  expect(
    body.includes("data-prerendered-route="),
    `${path} no contiene HTML prerenderizado`,
  );
}

for (const path of ["/admin", "/admin/tracking", "/login"]) {
  const { response } = await request(path);
  expect(response.status === 200, `${path} respondió ${response.status}`);
  expect(
    new URL(response.url).pathname === path,
    `${path} cambió de URL a ${new URL(response.url).pathname}`,
  );
}

const legacyChecks = [
  ["/trabajos-realizados", "/portafolio"],
  ["/portfolio", "/portafolio"],
  ["/tour-virtual", "/servicios/tour-virtual"],
];

for (const [from, to] of legacyChecks) {
  const { response } = await request(from, {
    redirect: "manual",
    body: false,
  });
  expect(response.status === 301, `${from} respondió ${response.status}, no 301`);
  expect(
    response.headers.get("location") === to ||
      response.headers.get("location") === `${baseUrl}${to}`,
    `${from} no redirige a ${to}`,
  );
}

const missingPath = `/comprobacion-404-${Date.now()}`;
const { response: missingResponse, body: missingBody } =
  await request(missingPath);
expect(
  missingResponse.status === 404,
  `${missingPath} respondió ${missingResponse.status}, no 404`,
);
expect(
  /noindex,\s*nofollow/i.test(missingBody),
  "La página 404 no incluye noindex, nofollow",
);

const { response: robotsResponse, body: robots } = await request("/robots.txt");
expect(robotsResponse.status === 200, "robots.txt no respondió 200");
for (const crawler of ["Googlebot", "GPTBot", "OAI-SearchBot", "ClaudeBot"]) {
  expect(
    robots.includes(`User-agent: ${crawler}`),
    `robots.txt no declara ${crawler}`,
  );
}

if (failures.length) {
  console.error(`Smoke test fallido en ${baseUrl}:`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(
  `Smoke test correcto en ${baseUrl}: páginas, Admin, GTM, robots, 301 y 404 verificados.`,
);
