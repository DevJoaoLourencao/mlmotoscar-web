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
import { Badge } from "../components/ui/badge";
import { Button, Card, CardContent } from "../components/ui/core";
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
          <p className="text-xl md:text-2xl text-gray-300 mb-5 max-w-2xl font-light">
            Descubra veículos que combinam com o seu ritmo. <br /> Praticidade, segurança e preço justo com a {settings.storeName}.
          </p>
          <div className="flex flex-wrap gap-3 mb-10">
            <Badge
              variant="secondary"
              className="text-base px-4 py-2 bg-white/10 text-white border-white/20 hover:bg-white/20"
            >
              COMPRA
            </Badge>
            <Badge
              variant="secondary"
              className="text-base px-4 py-2 bg-white/10 text-white border-white/20 hover:bg-white/20"
            >
              VENDA
            </Badge>
            <Badge
              variant="secondary"
              className="text-base px-4 py-2 bg-white/10 text-white border-white/20 hover:bg-white/20"
            >
              TROCA
            </Badge>
            <Badge
              variant="secondary"
              className="text-base px-4 py-2 bg-white/10 text-white border-white/20 hover:bg-white/20"
            >
              FINANCIAMENTO
            </Badge>
          </div>
          <div className="flex flex-col md:flex-row gap-6 justify-center md:justify-start">
            <Link to="/catalogo">
              <Button size="lg" className="text-lg px-10 py-6 rounded-full">
                Ver Estoque <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/contato">
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-10 py-6 rounded-full bg-transparent border-white/20 text-white hover:bg-white hover:text-black"
              >
                Fale Conosco
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 bg-background border-b border-border">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="flex flex-col items-center text-center p-8 transition-transform hover:-translate-y-2 duration-300">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
              <ShieldCheck className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-foreground">
              Transparência Total
            </h3>
            <p className="text-muted-foreground text-lg font-light leading-relaxed">
              Transparência total em todos os processos, desde a compra até a
              venda.
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-8 transition-transform hover:-translate-y-2 duration-300">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-foreground">
              Garantia de Qualidade
            </h3>
            <p className="text-muted-foreground text-lg font-light leading-relaxed">
              Veículos revisados e com histórico verificado para sua segurança.
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-8 transition-transform hover:-translate-y-2 duration-300">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-foreground">
              Preço Justo
            </h3>
            <p className="text-muted-foreground text-lg font-light leading-relaxed">
              Valores que cabem no bolso, sem surpresas.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      {!loading && featured.length > 0 && (
        <section className="pt-24 container mx-auto px-4">
          <div className="flex items-end justify-between mb-16">
            <div>
              <h2 className="text-4xl font-bold mb-2 text-foreground">
                Recém Chegados
              </h2>
              <p className="text-muted-foreground text-lg">
                As novidades mais quentes do nosso showroom.
              </p>
            </div>
            <Link
              to="/catalogo"
              className="hidden md:flex text-primary hover:text-primary/80 transition-colors items-center font-medium"
            >
              Ver estoque completo <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-24">
            {featured.map((vehicle, index) => (
              <Link
                to={`/catalogo/${vehicle.id}`}
                key={vehicle.id}
                className="group block"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Card className="h-full overflow-hidden border-border bg-card hover:border-primary/50">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                      src={vehicle.images?.[0] || (vehicle as any).image_url}
                      alt={vehicle.title}
                      className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute top-4 right-4 bg-black/80 backdrop-blur px-3 py-1 rounded-full text-xs font-bold uppercase text-white border border-white/10">
                      {vehicle.year}
                    </div>
                  </div>
                  <CardContent className="p-6 flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-xl truncate pr-2 text-foreground group-hover:text-primary transition-colors">
                        {vehicle.title}
                      </h3>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground space-x-4">
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-neutral-600"></span>
                        {vehicle.mileage.toLocaleString()} km
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-2 mt-auto">
                      <span className="text-2xl font-bold text-foreground">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(vehicle.price)}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-primary hover:text-primary-foreground hover:bg-primary"
                      >
                        Detalhes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Contact Quick Access */}
      <section className="py-24 container mx-auto px-4">
        <div className="relative rounded-3xl overflow-hidden p-8 md:p-16 text-center border border-border bg-card shadow-xl">
          {/* Decorative Background Glow - Adjusted for theme */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

          <div className="relative z-10 max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-foreground">
              Estamos esperando por você
            </h2>
            <p className="text-muted-foreground text-lg mb-12 max-w-2xl mx-auto">
              Venha nos visitar ou entre em contato. Nossa equipe está pronta para 
              ajudar a encontrar o veículo ideal para você.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
              <a
                href="https://wa.me/5514991569560"
                target="_blank"
                rel="noopener noreferrer"
                className="block group h-full"
              >
                <div className="h-full p-6 rounded-2xl bg-secondary/50 border border-border hover:border-primary/50 transition-all hover:bg-secondary flex flex-col items-center justify-center text-center">
                  <img 
                    src="/zap-logo.png" 
                    alt="WhatsApp" 
                    className="h-10 w-10 mx-auto mb-4 group-hover:scale-110 transition-transform object-contain"
                  />
                  <h3 className="font-bold text-lg mb-1 text-foreground">
                    WhatsApp
                  </h3>
                  <p className="text-sm text-muted-foreground">
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
                <div className="h-full p-6 rounded-2xl bg-secondary/50 border border-border hover:border-primary/50 transition-all hover:bg-secondary flex flex-col items-center justify-center text-center">
                  <MapPin className="h-10 w-10 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold text-lg mb-1 text-foreground">
                    Visite a Loja
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    R. Felipe Camarão, 113 - Lorenzetti, Marília - SP, 17506-320
                  </p>
                </div>
              </a>

              <div className="block group h-full">
                <div className="h-full p-6 rounded-2xl bg-secondary/50 border border-border transition-all flex flex-col items-center justify-center text-center">
                  <Clock className="h-10 w-10 text-blue-500 mx-auto mb-4 transition-transform" />
                  <h3 className="font-bold text-lg mb-1 text-foreground">
                    Horários
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {settings.openingHoursWeekdays}
                  </p>
                  <p className="text-sm text-muted-foreground">
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
