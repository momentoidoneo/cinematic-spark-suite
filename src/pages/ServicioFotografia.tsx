import AdsLandingBody from "@/components/ads/AdsLandingBody";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import SEOHead, {
  breadcrumbSchema,
  faqPageSchema,
  getSiteUrl,
  photographyServiceSchema,
} from "@/components/SEOHead";
import WhatsAppButton from "@/components/WhatsAppButton";
import { photographyServiceAdsConfig } from "@/content/adsLandingConfigs";

const ServicioFotografia = () => {
  const siteUrl = getSiteUrl();

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Fotografía profesional en Madrid y Castilla-La Mancha | Silvio Costa"
        description="Fotografía profesional para inmobiliaria, arquitectura, producto, gastronomía, empresas y eventos en Madrid y Castilla-La Mancha."
        canonical={`${siteUrl}/servicios/fotografia`}
        jsonLd={[
          photographyServiceSchema,
          breadcrumbSchema([
            { name: "Inicio", url: siteUrl },
            {
              name: "Servicios",
              url: `${siteUrl}/servicios/fotografia`,
            },
            {
              name: "Fotografía Profesional",
              url: `${siteUrl}/servicios/fotografia`,
            },
          ]),
          faqPageSchema(photographyServiceAdsConfig.faqs),
        ]}
      />
      <Navbar contactHref="#contacto" />
      <AdsLandingBody config={photographyServiceAdsConfig} />
      <Footer />
      <WhatsAppButton budgetHref="#contacto" />
    </div>
  );
};

export default ServicioFotografia;
