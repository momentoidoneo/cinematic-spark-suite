import { Mail, Phone, MessageCircle } from "lucide-react";
import logo from "@/assets/logo.png";

const Footer = () => {
  return (
    <footer id="contacto" className="border-t border-border bg-card/50 pt-16 pb-8 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <h3 className="font-display text-xl font-bold text-foreground mb-4">Silvio Costa</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Elevando la fotografía a una experiencia cinematográfica. Capturando la esencia de cada momento con una estética premium y atención al detalle.
            </p>
          </div>

          {/* Nav */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Navegación</h4>
            <ul className="space-y-2">
              {["Inicio", "Servicios", "Portafolio", "Contacto"].map((item) => (
                <li key={item}>
                  <a href={`#${item.toLowerCase()}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
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
                  <a href="#portafolio" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
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
                    <p className="text-xs text-muted-foreground">Email</p>
                    <a href="mailto:silvio@silviocosta.net" className="text-sm font-medium text-foreground">silvio@silviocosta.net</a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center">
                    <Phone className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Teléfono</p>
                    <a href="tel:+34640934640" className="text-sm font-medium text-foreground">+34 640 934 640</a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">WhatsApp</p>
                    <a href="https://wa.me/34640934640" className="text-sm font-medium text-foreground">+34 640 934 640</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © 2026 Silvio Costa Photography. Todos los derechos reservados.
          </p>
          <div className="flex gap-4">
            <a href="/legal/privacy-policy" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Privacidad</a>
            <a href="/legal/legal-notice" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Aviso Legal</a>
            <a href="/legal/cookies" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Cookies</a>
            <a href="/legal/terms" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Términos</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
