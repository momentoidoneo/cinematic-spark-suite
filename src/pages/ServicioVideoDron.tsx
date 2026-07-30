import AdsLandingBody from "@/components/ads/AdsLandingBody";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import SEOHead, {
  breadcrumbSchema,
  faqPageSchema,
  getSiteUrl,
  videoDronServiceSchema,
} from "@/components/SEOHead";
import WhatsAppButton from "@/components/WhatsAppButton";
import { videoDronAdsConfig } from "@/content/adsLandingConfigs";

const ServicioVideoDron = () => {
  const siteUrl = getSiteUrl();

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Vídeo profesional y dron en Madrid y Castilla-La Mancha | Silvio Costa"
        description="Producción de vídeo 4K y grabación con dron para empresas, publicidad, eventos e inmobiliaria en Madrid y Castilla-La Mancha."
        canonical={`${siteUrl}/servicios/video-dron`}
        jsonLd={[
          videoDronServiceSchema,
          breadcrumbSchema([
            { name: "Inicio", url: siteUrl },
            {
              name: "Servicios",
              url: `${siteUrl}/servicios/fotografia`,
            },
            {
              name: "Vídeo y Dron",
              url: `${siteUrl}/servicios/video-dron`,
            },
          ]),
          faqPageSchema(videoDronAdsConfig.faqs),
        ]}
      />
      <Navbar contactHref="#contacto" />
      <AdsLandingBody config={videoDronAdsConfig} />
      <Footer />
      <WhatsAppButton budgetHref="#contacto" />
    </div>
  );
};

export default ServicioVideoDron;
