import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Portfolio from "./pages/Portfolio";
import Blog from "./pages/Blog";
import BlogPostPage from "./pages/BlogPost";
import ServicioFotografia from "./pages/ServicioFotografia";
import ServicioVideoDron from "./pages/ServicioVideoDron";
import ServicioTourVirtual from "./pages/ServicioTourVirtual";
import ServicioEventos from "./pages/ServicioEventos";
import ServicioRenders from "./pages/ServicioRenders";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminSubcategories from "./pages/admin/AdminSubcategories";
import AdminImages from "./pages/admin/AdminImages";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminStorage from "./pages/admin/AdminStorage";
import AdminMarketing from "./pages/admin/AdminMarketing";
import AdminPromotions from "./pages/admin/AdminPromotions";
import AdminBlog from "./pages/admin/AdminBlog";
import AdminWhatsAppChats from "./pages/admin/AdminWhatsAppChats";
import AdminWhatsAppConfig from "./pages/admin/AdminWhatsAppConfig";
import AdminLegalTexts from "./pages/admin/AdminLegalTexts";
import AdminSocialMedia from "./pages/admin/AdminSocialMedia";
import AdminApiKeys from "./pages/admin/AdminApiKeys";
import AdminLanding from "./pages/admin/AdminLanding";
import AdminTracking from "./pages/admin/AdminTracking";
import AdminMigration from "./pages/admin/AdminMigration";
import AdminMessages from "./pages/admin/AdminMessages";
import Legal from "./pages/Legal";
import Precios from "./pages/Precios";
import TrackingScripts from "./components/TrackingScripts";
import AdminPricing from "./pages/admin/AdminPricing";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <TrackingScripts />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/legal/:slug" element={<Legal />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="/portafolio" element={<Portfolio />} />
            <Route path="/portafolio/:categorySlug" element={<Portfolio />} />
            <Route path="/portafolio/:categorySlug/:subcategorySlug" element={<Portfolio />} />
            <Route path="/servicios/fotografia" element={<ServicioFotografia />} />
            <Route path="/servicios/video-dron" element={<ServicioVideoDron />} />
            <Route path="/servicios/tour-virtual" element={<ServicioTourVirtual />} />
            <Route path="/servicios/eventos" element={<ServicioEventos />} />
            <Route path="/servicios/renders" element={<ServicioRenders />} />
            <Route path="/precios" element={<Precios />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="subcategories" element={<AdminSubcategories />} />
              <Route path="images" element={<AdminImages />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="storage" element={<AdminStorage />} />
              <Route path="marketing" element={<AdminMarketing />} />
              <Route path="promotions" element={<AdminPromotions />} />
              <Route path="blog" element={<AdminBlog />} />
              <Route path="whatsapp-chats" element={<AdminWhatsAppChats />} />
              <Route path="whatsapp-config" element={<AdminWhatsAppConfig />} />
              <Route path="legal" element={<AdminLegalTexts />} />
              <Route path="social" element={<AdminSocialMedia />} />
              <Route path="api-keys" element={<AdminApiKeys />} />
              <Route path="landing" element={<AdminLanding />} />
              <Route path="tracking" element={<AdminTracking />} />
              <Route path="migration" element={<AdminMigration />} />
              <Route path="messages" element={<AdminMessages />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
