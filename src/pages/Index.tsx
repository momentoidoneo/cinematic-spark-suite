import { lazy, Suspense } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import SEOHead, {
  localBusinessSchema,
  getSiteUrl,
  breadcrumbSchema,
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

const Index = () => {
  const siteUrl = getSiteUrl();

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Silvio Costa Photography",
    url: siteUrl,
    description: "Fotografía profesional, vídeo, dron y tours virtuales 360° en España y Portugal.",
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/blog?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Silvio Costa Photography | Fotografía y Audiovisual"
        description="Fotografía, vídeo, dron y tours 360° Matterport en España y Portugal. Calidad cinematográfica para inmobiliaria, arquitectura y eventos."
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
        <ServicesSection />
        <MatterportSection />
        <PortfolioSection />
        <CTASection />
      </Suspense>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Index;
