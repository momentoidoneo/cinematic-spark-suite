import { useEffect, useState } from "react";
import { Mail, Phone, MessageCircle, Instagram, Facebook, Youtube, Linkedin, Twitter, Globe, Send, Pin, Video, Music, Camera, Twitch } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  label: string | null;
  is_active: boolean;
}

const socialIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  instagram: Instagram,
  facebook: Facebook,
  youtube: Youtube,
  linkedin: Linkedin,
  twitter: Twitter,
  tiktok: Music,
  pinterest: Pin,
  threads: MessageCircle,
  vimeo: Video,
  whatsapp: MessageCircle,
  telegram: Send,
  snapchat: Camera,
  twitch: Twitch,
  behance: Globe,
  dribbble: Globe,
  flickr: Camera,
  website: Globe,
};

const Footer = () => {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

  useEffect(() => {
    supabase
      .from("social_links")
      .select("id, platform, url, label, is_active")
      .eq("is_active", true)
      .order("order")
      .then(({ data }) => {
        if (data) setSocialLinks(data);
      });
  }, []);

  return (
    <footer id="contacto" className="border-t border-border bg-card/50 pt-16 pb-8 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start">
            <img src={logo} alt="Silvio Costa Photography" className="h-24 w-auto mb-4" />
            <p className="text-sm text-foreground/75 leading-relaxed">
              Elevando la fotografía a una experiencia cinematográfica. Capturando la esencia de cada momento con una estética premium y atención al detalle.
            </p>
            {socialLinks.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {socialLinks.map((link) => {
                  const Icon = socialIconMap[link.platform] || Globe;
                  return (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={link.label || link.platform}
                      className="w-9 h-9 rounded-full bg-secondary border border-border flex items-center justify-center text-foreground/75 hover:text-primary hover:border-primary/50 hover:scale-110 transition-all duration-300"
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Nav */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Navegación</h4>
            <ul className="space-y-2">
              {["Inicio", "Servicios", "Portafolio", "Contacto"].map((item) => (
                <li key={item}>
                  <a href={`#${item.toLowerCase()}`} className="text-sm text-foreground/75 hover:text-foreground transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Portfolio */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Portafolio</h4>
            <ul className="space-y-2">
              {["Fotografía", "Dron", "Tours Virtuales", "Video", "Eventos"].map((item) => (
                <li key={item}>
                  <a href="#portafolio" className="text-sm text-foreground/75 hover:text-foreground transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <div className="rounded-xl bg-secondary border border-border p-6">
              <h4 className="font-display font-semibold text-foreground mb-4">Contacto Directo</h4>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-foreground/75">Email</p>
                    <a href="mailto:silvio@silviocosta.net" className="text-sm font-medium text-foreground">silvio@silviocosta.net</a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center">
                    <Phone className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-xs text-foreground/75">Teléfono</p>
                    <a href="tel:+34640934640" className="text-sm font-medium text-foreground">+34 640 934 640</a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-foreground/75">WhatsApp</p>
                    <a href="https://wa.me/34640934640" className="text-sm font-medium text-foreground">+34 640 934 640</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-foreground/75">
            © 2026 Silvio Costa Photography. Todos los derechos reservados.
          </p>
          <div className="flex gap-4">
            <a href="/legal/privacy-policy" className="text-xs text-foreground/75 hover:text-foreground transition-colors">Privacidad</a>
            <a href="/legal/legal-notice" className="text-xs text-foreground/75 hover:text-foreground transition-colors">Aviso Legal</a>
            <a href="/legal/cookies" className="text-xs text-foreground/75 hover:text-foreground transition-colors">Cookies</a>
            <a href="/legal/terms" className="text-xs text-foreground/75 hover:text-foreground transition-colors">Términos</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
