import {
  Facebook,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Phone
} from "lucide-react";
import { Link } from "react-router-dom";
import { useSettings } from "./SettingsProvider";
import { useTheme } from "./ThemeProvider";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { settings } = useSettings();
  const { theme } = useTheme();
  const formatPhoneForWhatsApp = (phone: string) => {
    return phone.replace(/\D/g, '');
  };
  return (
    <footer className="px-4 bg-card border-t border-border pt-16 pb-8 text-sm transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center">
              <img
                src={
                  theme === "dark"
                    ? settings.logoDark || "/logo.png"
                    : settings.logoLight || "/logo.png"
                }
                alt={settings.storeName}
                className="h-10 w-auto max-w-[180px] object-contain transition-opacity hover:opacity-90"
              />
            </Link>
            <p className="text-muted-foreground leading-relaxed max-w-xs">
              Sua concessionária de confiança com foco em qualidade, segurança e preço justo. 
              Amplo estoque de veículos novos e seminovos para você encontrar o carro ou moto ideal.
            </p>
            <div className="flex space-x-4 pt-2">
              <a
                href={settings.socialInstagram || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-all"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href={settings.socialFacebook || "#"}
                 target="_blank"
                rel="noopener noreferrer"
                className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-all"
              >
                <Facebook className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-foreground font-bold text-lg mb-6">
              Acesso Rápido
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/"
                  className="text-muted-foreground hover:text-primary transition-colors flex items-center"
                >
                  Início
                </Link>
              </li>
              <li>
                <Link
                  to="/catalogo"
                  className="text-muted-foreground hover:text-primary transition-colors flex items-center"
                >
                  Estoque Completo
                </Link>
              </li>
              <li>
                <Link
                  to="/sobre"
                  className="text-muted-foreground hover:text-primary transition-colors flex items-center"
                >
                  Nossa História
                </Link>
              </li>
              <li>
                <Link
                  to="/contato"
                  className="text-muted-foreground hover:text-primary transition-colors flex items-center"
                >
                  Fale Conosco
                </Link>
              </li>
              <li>
                <Link
                  to="/admin"
                  className="text-muted-foreground hover:text-primary transition-colors flex items-center"
                >
                  Área do Cliente
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-foreground font-bold text-lg mb-6">Contato</h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-semibold text-foreground">Wagner Lourenção</span>
                  <a 
                    href="tel:+5514997036375" 
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    (14) 99703-6375
                  </a>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-semibold text-foreground">João Lourenção</span>
                  <a 
                    href="tel:+5514991569560" 
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    (14) 99156-9560
                  </a>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <MessageCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <a 
                  href={`https://wa.me/55${formatPhoneForWhatsApp('(14) 99156-9560')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  <span>WhatsApp</span>
                </a>
              </li>
              <li className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <a 
                  href={`mailto:${settings.emailContact}`}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {settings.emailContact}
                </a>
              </li>
            </ul>
          </div>

          {/* Location */}
          <div>
            <h3 className="text-foreground font-bold text-lg mb-6">
              Localização
            </h3>
            <div className="flex items-start space-x-3 text-muted-foreground mb-4">
              <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <a
                href="https://www.google.com/maps/search/?api=1&query=R.+Felipe+Camarão,+113+-+Lorenzetti,+Marília+-+SP,+17506-320"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                R. Felipe Camarão, 113 - Lorenzetti, Marília - SP, 17506-320
              </a>
            </div>
            <div className="bg-muted rounded p-3 text-xs text-muted-foreground border border-border">
              <p className="font-semibold text-foreground mb-1">
                Horário de Funcionamento
              </p>
              <p>{settings.openingHoursWeekdays}</p>
              <p>{settings.openingHoursWeekend}</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border pt-8 flex justify-center items-center">
          <p className="text-muted-foreground text-center">
            © {currentYear} {settings.storeName}. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
