import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import TrackingScripts from "./components/TrackingScripts";
import GlobalCTATracker from "./components/GlobalCTATracker";
import SmartQuoter from "./components/SmartQuoter";
import usePageTracking from "./hooks/usePageTracking";

const PageTracker = () => { usePageTracking(); return null; };

const queryClient = new QueryClient();

const Login = lazy(() => import("./pages/Login"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Portfolio = lazy(() => import("./pages/Portfolio"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPostPage = lazy(() => import("./pages/BlogPost"));
const ServicioFotografia = lazy(() => import("./pages/ServicioFotografia"));
const ServicioVideoDron = lazy(() => import("./pages/ServicioVideoDron"));
const ServicioTourVirtual = lazy(() => import("./pages/ServicioTourVirtual"));
const ServicioEventos = lazy(() => import("./pages/ServicioEventos"));
const ServicioRenders = lazy(() => import("./pages/ServicioRenders"));
const FotografiaCiudad = lazy(() => import("./pages/FotografiaCiudad"));
const ServicioCiudad = lazy(() => import("./pages/ServicioCiudad"));
const Legal = lazy(() => import("./pages/Legal"));
const Precios = lazy(() => import("./pages/Precios"));
const GuiaServiciosAudiovisuales = lazy(() => import("./pages/GuiaServiciosAudiovisuales"));

const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories"));
const AdminSubcategories = lazy(() => import("./pages/admin/AdminSubcategories"));
const AdminImages = lazy(() => import("./pages/admin/AdminImages"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminStorage = lazy(() => import("./pages/admin/AdminStorage"));
const AdminMarketing = lazy(() => import("./pages/admin/AdminMarketing"));
const AdminPromotions = lazy(() => import("./pages/admin/AdminPromotions"));
const AdminBlog = lazy(() => import("./pages/admin/AdminBlog"));
const AdminWhatsAppChats = lazy(() => import("./pages/admin/AdminWhatsAppChats"));
const AdminWhatsAppConfig = lazy(() => import("./pages/admin/AdminWhatsAppConfig"));
const AdminLegalTexts = lazy(() => import("./pages/admin/AdminLegalTexts"));
const AdminSocialMedia = lazy(() => import("./pages/admin/AdminSocialMedia"));
const AdminApiKeys = lazy(() => import("./pages/admin/AdminApiKeys"));
const AdminLanding = lazy(() => import("./pages/admin/AdminLanding"));
const AdminTracking = lazy(() => import("./pages/admin/AdminTracking"));
const AdminMigration = lazy(() => import("./pages/admin/AdminMigration"));
const AdminMessages = lazy(() => import("./pages/admin/AdminMessages"));
const AdminQuoteRequests = lazy(() => import("./pages/admin/AdminQuoteRequests"));
const AdminCommercialQuotes = lazy(() => import("./pages/admin/AdminCommercialQuotes"));
const AdminDronePermits = lazy(() => import("./pages/admin/AdminDronePermits"));
const AdminMarketingTools = lazy(() => import("./pages/admin/AdminMarketingTools"));
const AdminCities = lazy(() => import("./pages/admin/AdminCities"));
const AdminPricing = lazy(() => import("./pages/admin/AdminPricing"));
const AdminSEO = lazy(() => import("./pages/admin/AdminSEO"));
const AdminSEOTechnical = lazy(() => import("./pages/admin/AdminSEOTechnical"));

const RouteFallback = () => (
  <div className="min-h-screen bg-background" aria-label="Cargando" />
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <TrackingScripts />
          <GlobalCTATracker />
          <SmartQuoter />
          <PageTracker />
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/legal/:slug" element={<Legal />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPostPage />} />
              <Route path="/single-post/:slug" element={<Navigate to="/blog" replace />} />
              <Route path="/portafolio" element={<Portfolio />} />
              <Route path="/portafolio/:categorySlug" element={<Portfolio />} />
              <Route path="/portafolio/:categorySlug/:subcategorySlug" element={<Portfolio />} />
              <Route path="/servicios" element={<Navigate to="/servicios/fotografia" replace />} />
              <Route path="/contacto" element={<Navigate to="/#contacto" replace />} />
              <Route path="/tour-virtual" element={<Navigate to="/servicios/tour-virtual" replace />} />
              <Route path="/servicios/fotografia" element={<ServicioFotografia />} />
              <Route path="/servicios/video-dron" element={<ServicioVideoDron />} />
              <Route path="/servicios/tour-virtual" element={<ServicioTourVirtual />} />
              <Route path="/servicios/eventos" element={<ServicioEventos />} />
              <Route path="/servicios/renders" element={<ServicioRenders />} />
              <Route path="/precios" element={<Precios />} />
              <Route path="/guia-servicios-audiovisuales" element={<GuiaServiciosAudiovisuales />} />
              <Route path="/fotografia-:city" element={<FotografiaCiudad />} />
              <Route path="/fotografia-inmobiliaria-:city" element={<ServicioCiudad />} />
              <Route path="/fotografia-arquitectura-:city" element={<ServicioCiudad />} />
              <Route path="/fotografia-gastronomia-:city" element={<ServicioCiudad />} />
              <Route path="/fotografia-producto-:city" element={<ServicioCiudad />} />
              <Route path="/fotografia-eventos-:city" element={<ServicioCiudad />} />
              <Route path="/tour-virtual-:city" element={<ServicioCiudad />} />
              <Route path="/video-dron-:city" element={<ServicioCiudad />} />
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
                <Route path="quote-requests" element={<AdminQuoteRequests />} />
                <Route path="quotes" element={<AdminCommercialQuotes />} />
                <Route path="drone-permits" element={<AdminDronePermits />} />
                <Route path="pricing" element={<AdminPricing />} />
                <Route path="seo" element={<AdminSEO />} />
                <Route path="seo-technical" element={<AdminSEOTechnical />} />
                <Route path="marketing-tools" element={<AdminMarketingTools />} />
                <Route path="cities" element={<AdminCities />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
