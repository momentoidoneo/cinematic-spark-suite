import { Suspense } from "react";
import { renderToPipeableStream } from "react-dom/server";
import { PassThrough } from "node:stream";
import { StaticRouter } from "react-router-dom/server";
import { Routes, Route } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PublicContentProvider, type PublicTables, type PageHead } from "./PublicContent";
import Index from "@/pages/Index";
import Portfolio from "@/pages/Portfolio";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import Legal from "@/pages/Legal";
import Precios from "@/pages/Precios";
import CasosEstudio from "@/pages/CasosEstudio";
import CasoEstudio from "@/pages/CasoEstudio";
import ServicioFotografia from "@/pages/ServicioFotografia";
import ServicioVideoDron from "@/pages/ServicioVideoDron";
import ServicioTourVirtual from "@/pages/ServicioTourVirtual";
import ServicioEventos from "@/pages/ServicioEventos";
import ServicioRenders from "@/pages/ServicioRenders";
import ServicioCiudad from "@/pages/ServicioCiudad";
import CoberturaRegional from "@/pages/CoberturaRegional";
import Guia from "@/pages/GuiaServiciosAudiovisuales";
import Glosario from "@/pages/Glosario";
import WorkWithUs from "@/pages/WorkWithUs";

// Render the real public components, not a parallel text-only version.
// No App/TrackingScripts, auth provider, admin route or effect runs at build time.
export function renderPublicPage(url: string, tables: PublicTables): Promise<{html: string; head: PageHead}> {
  return new Promise((resolve, reject) => {
    let head: PageHead | undefined;
    let error: unknown;
    const output = new PassThrough();
    const chunks: Buffer[] = [];
    output.on("data", chunk => chunks.push(Buffer.from(chunk)));
    output.on("error", reject);
    output.on("end", () => {
      clearTimeout(timeout);
      if (error || !head) reject(error || new Error(`Missing SEOHead: ${url}`));
      else resolve({ html: Buffer.concat(chunks).toString("utf8"), head });
    });
    const stream = renderToPipeableStream(
      <PublicContentProvider tables={tables} collectHead={value => { head = value; }}>
        <TooltipProvider><StaticRouter location={url}><Suspense fallback={null}><Routes>
          <Route path="/" element={<Index />} />
          <Route path="/portafolio" element={<Portfolio />} />
          <Route path="/portafolio/:categorySlug" element={<Portfolio />} />
          <Route path="/portafolio/:categorySlug/:subcategorySlug" element={<Portfolio />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/legal/:slug" element={<Legal />} />
          <Route path="/precios" element={<Precios />} />
          <Route path="/casos-estudio" element={<CasosEstudio />} />
          <Route path="/casos-estudio/:slug" element={<CasoEstudio />} />
          <Route path="/servicios/fotografia" element={<ServicioFotografia />} />
          <Route path="/servicios/video-dron" element={<ServicioVideoDron />} />
          <Route path="/servicios/tour-virtual" element={<ServicioTourVirtual />} />
          <Route path="/servicios/eventos" element={<ServicioEventos />} />
          <Route path="/servicios/renders" element={<ServicioRenders />} />
          <Route path="/servicios-audiovisuales-madrid" element={<CoberturaRegional region="madrid" />} />
          <Route path="/servicios-audiovisuales-castilla-la-mancha" element={<CoberturaRegional region="castilla-la-mancha" />} />
          <Route path="/guia-servicios-audiovisuales" element={<Guia />} />
          <Route path="/glosario" element={<Glosario />} />
          <Route path="/trabaja-con-nosotros" element={<WorkWithUs />} />
          <Route path="/:serviceCitySlug" element={<ServicioCiudad />} />
        </Routes></Suspense></StaticRouter></TooltipProvider>
      </PublicContentProvider>,
      { onAllReady() { stream.pipe(output); }, onError(cause) { error = cause; }, onShellError: reject },
    );
    const timeout = setTimeout(() => { stream.abort(); reject(new Error(`SSR timeout: ${url}`)); }, 30000);
  });
}
