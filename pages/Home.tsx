import {
  ArrowRight,
  CheckCircle,
  Clock,
  DollarSign,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSettings } from "../components/SettingsProvider";
import VehicleCard from "../components/VehicleCard";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/core";
import { getVehicles } from "../services/vehicleService";
import { Vehicle } from "../types";

export default function Home() {
  const { settings } = useSettings();
  const [featured, setFeatured] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVehicles().then((data) => {
      const availableVehicles = data.filter((v) => v.status === "available");
      setFeatured(availableVehicles.slice(0, 3));
      setLoading(false);
    });
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section - Keeps dark overlay style regardless of theme */}
      <section className="relative h-[700px] flex items-center overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover object-center z-0"
          style={{ objectPosition: "center 40%" }}
        >
          <source src="/moto.mp4" type="video/mp4" />
          Seu navegador não suporta vídeos HTML5.
        </video>
        <div className="absolute inset-0 bg-black/40 z-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent z-0" />

        <div className="container mx-auto px-4 relative z-10 text-center md:text-left animate-fade-in-up">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-tight">
            <span className="text-white">Sua Liberdade</span>
            <br />
            <span className="text-primary drop-shadow-lg">Começa Aqui.</span>
          </h1>
          <p className="text-base md:text-xl lg:text-2xl text-gray-300 mb-5 max-w-2xl font-light leading-relaxed px-4 md:px-0">
            Descubra veículos que combinam com o seu ritmo. <br className="hidden md:block" /> Praticidade, segurança e preço justo com a {settings.storeName}.
          </p>
          <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-10 px-4 md:px-0">
            <Badge
              variant="secondary"
              className="text-sm md:text-base px-3 md:px-4 py-2 bg-white/10 text-white border-white/20 hover:bg-white/20"
            >
              COMPRA
            </Badge>
            <Badge
              variant="secondary"
              className="text-sm md:text-base px-3 md:px-4 py-2 bg-white/10 text-white border-white/20 hover:bg-white/20"
            >
              VENDA
            </Badge>
            <Badge
              variant="secondary"
              className="text-sm md:text-base px-3 md:px-4 py-2 bg-white/10 text-white border-white/20 hover:bg-white/20"
            >
              TROCA
            </Badge>
            <Badge
              variant="secondary"
              className="text-sm md:text-base px-3 md:px-4 py-2 bg-white/10 text-white border-white/20 hover:bg-white/20"
            >
              FINANCIAMENTO
            </Badge>
          </div>
          <div className="px-4 md:px-0 flex flex-col md:flex-row gap-4 md:gap-6 justify-center md:justify-start">
          <Link to="/contato" className="w-full md:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full md:w-auto text-base md:text-lg px-8 md:px-10 py-5 md:py-6 rounded-full bg-transparent border-white/20 text-white hover:bg-white hover:text-black"
              >
                Fale Conosco
              </Button>
            </Link>
            <Link to="/catalogo" className="w-full md:w-auto">
              <Button size="lg" className="w-full md:w-auto text-base md:text-lg px-8 md:px-10 py-5 md:py-6 rounded-full">
                Ver Estoque <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>            
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="pt-0 pb-12 md:pt-24 md:pb-24 bg-background border-b border-border">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12">
          <div className="flex flex-col items-center text-center p-4 md:p-8 transition-transform hover:-translate-y-2 duration-300">
            <div className="h-12 w-12 md:h-16 md:w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 md:mb-6">
              <ShieldCheck className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-3 text-foreground">
              Transparência Total
            </h3>
            <p className="text-muted-foreground text-sm md:text-lg font-light leading-relaxed">
              Transparência total em todos os processos, desde a compra até a
              venda.
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-4 md:p-8 transition-transform hover:-translate-y-2 duration-300">
            <div className="h-12 w-12 md:h-16 md:w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 md:mb-6">
              <CheckCircle className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-3 text-foreground">
              Garantia de Qualidade
            </h3>
            <p className="text-muted-foreground text-sm md:text-lg font-light leading-relaxed">
              Veículos revisados e com histórico verificado para sua segurança.
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-4 md:p-8 transition-transform hover:-translate-y-2 duration-300">
            <div className="h-12 w-12 md:h-16 md:w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 md:mb-6">
              <DollarSign className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-3 text-foreground">
              Preço Justo
            </h3>
            <p className="text-muted-foreground text-sm md:text-lg font-light leading-relaxed">
              Valores que cabem no bolso, sem surpresas.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      {!loading && featured.length > 0 && (
        <section className="pt-12 md:pt-24 container mx-auto px-10 border-b border-border">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-16 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2 text-foreground">
                Recém Chegados
              </h2>
              <p className="text-muted-foreground text-base md:text-lg">
                As novidades mais quentes do nosso showroom.
              </p>
            </div>
            <Link
              to="/catalogo"
              className="hidden md:flex text-primary hover:text-primary/80 transition-colors items-center font-medium text-sm md:text-base"
            >
              Ver estoque completo <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10 mb-6 md:mb-24">
            {featured.map((vehicle, index) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} index={index} />
            ))}
          </div>
          
          <div className="md:hidden flex justify-center mb-12">
            <Link to="/catalogo" className="w-full max-w-md">
              <Button size="lg" className="w-full text-base px-8 py-6 rounded-full shadow-lg">
                Ver Estoque Completo <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      )}

      {/* Contact Quick Access */}
      <section className="py-12 md:py-24 container mx-auto px-4">
        <div className="relative rounded-2xl md:rounded-3xl overflow-hidden p-6 md:p-16 text-center border border-border bg-card shadow-xl">
          {/* Decorative Background Glow - Adjusted for theme */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

          <div className="relative z-10 max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-5xl font-bold mb-4 md:mb-6 text-foreground">
              Estamos esperando por você
            </h2>
            <p className="text-muted-foreground text-sm md:text-lg mb-8 md:mb-12 max-w-2xl mx-auto">
              Venha nos visitar ou entre em contato. Nossa equipe está pronta para 
              ajudar a encontrar o veículo ideal para você.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 items-stretch">
              <a
                href="https://wa.me/5514991569560"
                target="_blank"
                rel="noopener noreferrer"
                className="block group h-full"
              >
                <div className="h-full p-5 md:p-6 rounded-xl md:rounded-2xl bg-secondary/50 border border-border hover:border-primary/50 transition-all hover:bg-secondary flex flex-col items-center justify-center text-center">
                  <img 
                    src="/zap-logo.png" 
                    alt="WhatsApp" 
                    className="h-8 w-8 md:h-10 md:w-10 mx-auto mb-3 md:mb-4 group-hover:scale-110 transition-transform object-contain"
                  />
                  <h3 className="font-bold text-base md:text-lg mb-1 text-foreground">
                    WhatsApp
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Atendimento Personalizado
                  </p>
                </div>
              </a>

              <a
                href="https://www.google.com/maps/search/?api=1&query=R.+Felipe+Camarão,+113+-+Lorenzetti,+Marília+-+SP,+17506-320"
                target="_blank"
                rel="noopener noreferrer"
                className="block group cursor-pointer h-full"
              >
                <div className="h-full p-5 md:p-6 rounded-xl md:rounded-2xl bg-secondary/50 border border-border hover:border-primary/50 transition-all hover:bg-secondary flex flex-col items-center justify-center text-center">
                  <MapPin className="h-8 w-8 md:h-10 md:w-10 text-primary mx-auto mb-3 md:mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold text-base md:text-lg mb-1 text-foreground">
                    Visite a Loja
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    R. Felipe Camarão, 113 - Lorenzetti, Marília - SP, 17506-320
                  </p>
                </div>
              </a>

              <div className="block group h-full">
                <div className="h-full p-5 md:p-6 rounded-xl md:rounded-2xl bg-secondary/50 border border-border transition-all flex flex-col items-center justify-center text-center">
                  <Clock className="h-8 w-8 md:h-10 md:w-10 text-blue-500 mx-auto mb-3 md:mb-4 transition-transform" />
                  <h3 className="font-bold text-base md:text-lg mb-1 text-foreground">
                    Horários
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {settings.openingHoursWeekdays}
                  </p>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {settings.openingHoursWeekend}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
