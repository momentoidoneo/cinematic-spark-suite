import { lazy, Suspense } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import SEOHead, {
  localBusinessSchema,
  getSiteUrl,
  photographyServiceSchema,
  videoDronServiceSchema,
  tourVirtualServiceSchema,
  personSchema,
  serviceCatalogSchema,
  aiSearchFAQSchema,
} from "@/components/SEOHead";

const ServicesSection = lazy(() => import("@/components/ServicesSection"));
const MatterportSection = lazy(() => import("@/components/MatterportSection"));
const PortfolioSection = lazy(() => import("@/components/PortfolioSection"));
const CTASection = lazy(() => import("@/components/CTASection"));
const ClientLogosStrip = lazy(() => import("@/components/ClientLogosStrip"));
const TestimonialsSection = lazy(
  () => import("@/components/TestimonialsSection"),
);
const CaseStudiesSection = lazy(
  () => import("@/components/CaseStudiesSection"),
);
const LeadMagnetSection = lazy(() => import("@/components/LeadMagnetSection"));
const ProcessSection = lazy(() => import("@/components/ProcessSection"));
const PricingPreviewSection = lazy(
  () => import("@/components/PricingPreviewSection"),
);
const FAQSection = lazy(() => import("@/components/FAQSection"));

const Index = () => {
  const siteUrl = getSiteUrl();

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Silvio Costa Photography",
    url: siteUrl,
    description:
      "Fotografía profesional, vídeo, dron y tours virtuales 360° en España y Portugal.",
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/blog?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Fotografía y producción audiovisual para empresas | Silvio Costa"
        description="Fotografía, vídeo, dron, Matterport y renders 3D para empresas, inmobiliarias y eventos en España y Portugal. Propuesta en menos de 24 horas."
        canonical={`${siteUrl}/`}
        jsonLd={[
          localBusinessSchema,
          websiteSchema,
          personSchema,
          serviceCatalogSchema,
          aiSearchFAQSchema,
          photographyServiceSchema,
          videoDronServiceSchema,
          tourVirtualServiceSchema,
        ]}
      />
      <Navbar />
      <HeroSection />
      <Suspense fallback={null}>
        <ClientLogosStrip />
        <ServicesSection />
        <PortfolioSection />
        <CaseStudiesSection />
        <TestimonialsSection />
        <ProcessSection />
        <MatterportSection />
        <PricingPreviewSection />
        <LeadMagnetSection />
        <FAQSection />
        <CTASection />
      </Suspense>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Index;
