import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import UtmBuilder from "@/components/admin/marketing/UtmBuilder";
import AbTestManager from "@/components/admin/marketing/AbTestManager";
import NewsletterManager from "@/components/admin/marketing/NewsletterManager";
import CompetitorTracker from "@/components/admin/marketing/CompetitorTracker";
import PortfolioSocialGen from "@/components/admin/marketing/PortfolioSocialGen";
import { Link2, FlaskConical, Mail, Target, ImagePlus } from "lucide-react";

const AdminMarketingTools = () => {
  return (
    <div className="p-6 space-y-4">
      <header>
        <h1 className="font-display text-3xl">Herramientas de Marketing</h1>
        <p className="text-muted-foreground">UTM Builder, A/B Testing, Newsletter, Tracker de competidores y generador de imágenes sociales.</p>
      </header>

      <Tabs defaultValue="utm" className="space-y-4">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="utm"><Link2 className="w-4 h-4 mr-1" />UTM + QR</TabsTrigger>
          <TabsTrigger value="ab"><FlaskConical className="w-4 h-4 mr-1" />A/B Testing</TabsTrigger>
          <TabsTrigger value="newsletter"><Mail className="w-4 h-4 mr-1" />Newsletter</TabsTrigger>
          <TabsTrigger value="competitors"><Target className="w-4 h-4 mr-1" />Competidores</TabsTrigger>
          <TabsTrigger value="portfolio-social"><ImagePlus className="w-4 h-4 mr-1" />Portfolio → Redes</TabsTrigger>
        </TabsList>

        <TabsContent value="utm"><UtmBuilder /></TabsContent>
        <TabsContent value="ab"><AbTestManager /></TabsContent>
        <TabsContent value="newsletter"><NewsletterManager /></TabsContent>
        <TabsContent value="competitors"><CompetitorTracker /></TabsContent>
        <TabsContent value="portfolio-social"><PortfolioSocialGen /></TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminMarketingTools;
