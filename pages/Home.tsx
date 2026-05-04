import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import {
  ArrowRight,
  CheckCircle,
  Clock,
  DollarSign,
  ExternalLink,
  MapPin,
  ShieldCheck,
  Star,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useSettings } from "../components/SettingsProvider";
import VehicleCard from "../components/VehicleCard";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/core";
import { usePageTitle } from "../hooks/usePageTitle";
import { SEO } from "../hooks/useSEO";
import { getReviews } from "../services/reviewsService";
import { getVehicles } from "../services/vehicleService";
import { Review, Vehicle } from "../types";

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`h-4 w-4 ${s <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`}
        />
      ))}
    </div>
  );
}

export default function Home() {
  usePageTitle();
  const { settings } = useSettings();
  const [featured, setFeatured] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);

  const autoplayRef = useRef(
    Autoplay({ delay: 4000, stopOnInteraction: false }),
  );
  const [emblaRef] = useEmblaCarousel({ loop: true, align: "start" }, [
    autoplayRef.current,
  ]);

  useEffect(() => {
    getVehicles().then((data) => {
      const availableVehicles = data.filter((v) => v.status === "available");
      setFeatured(availableVehicles.slice(0, 3));
      setLoading(false);
    });
    getReviews(true).then(setReviews);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <SEO url="/" />
      {/* Hero Section */}
      <section className="relative mt-[-80px] h-[900px] flex items-center overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster="/moto-poster.jpg"
          className="absolute inset-0 w-full h-full object-cover object-center z-0"
          style={{ objectPosition: "center 40%", opacity: 0.5 }}
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
          <p className="text-base md:text-xl lg:text-2xl text-white/80 mb-5 max-w-2xl font-light leading-relaxed px-4 md:px-0">
            Praticidade, segurança e preço justo.
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
          <div className="px-4 md:px-0 flex flex-col md:flex-row gap-6 justify-center md:justify-start">
            <Link
              to="/contato"
              className="inline-flex items-center justify-center w-full md:w-auto text-base md:text-lg px-8 md:px-10 py-6 rounded-full bg-transparent border border-white/50 text-white hover:bg-white hover:text-black transition-all duration-300 min-h-[48px] font-medium"
            >
              Fale Conosco
            </Link>
            <Link
              to="/catalogo"
              className="inline-flex items-center justify-center w-full md:w-auto text-base md:text-lg px-8 md:px-10 py-6 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all duration-300 min-h-[48px] font-medium"
            >
              Ver Estoque <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-12 md:py-24 bg-background border-b border-border">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12">
          <div className="flex flex-col items-center text-center p-4 md:p-8 transition-transform hover:-translate-y-2 duration-300 border-b md:border-b-0 border-border pb-8 md:pb-8">
            <div className="h-12 w-12 md:h-16 md:w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 md:mb-6">
              <ShieldCheck className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold mb-2 md:mb-3 text-foreground">
              Transparência Total
            </h2>
            <p className="text-muted-foreground text-sm md:text-lg font-light leading-relaxed">
              Transparência total em todos os processos, desde a compra até a
              venda.
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-4 md:p-8 transition-transform hover:-translate-y-2 duration-300 border-b md:border-b-0 border-border pb-8 md:pb-8">
            <div className="h-12 w-12 md:h-16 md:w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 md:mb-6">
              <CheckCircle className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold mb-2 md:mb-3 text-foreground">
              Garantia de Qualidade
            </h2>
            <p className="text-muted-foreground text-sm md:text-lg font-light leading-relaxed">
              Veículos revisados e com histórico verificado para sua segurança.
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-4 md:p-8 transition-transform hover:-translate-y-2 duration-300">
            <div className="h-12 w-12 md:h-16 md:w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 md:mb-6">
              <DollarSign className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold mb-2 md:mb-3 text-foreground">
              Preço Justo
            </h2>
            <p className="text-muted-foreground text-sm md:text-lg font-light leading-relaxed">
              Valores que cabem no bolso, sem surpresas.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      {!loading && featured.length > 0 && (
        <section className="pt-12 md:pt-24 container mx-auto px-4 border-b border-border">
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
              className="hidden md:flex text-red-700 dark:text-red-500 hover:text-red-800 dark:hover:text-red-400 transition-colors items-center font-medium text-sm md:text-base"
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
              <Button
                size="lg"
                className="w-full text-base px-8 py-6 rounded-full shadow-lg"
              >
                Ver Estoque Completo <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      )}

      {/* Reviews Carousel */}
      {reviews.length > 0 && (
        <section className="py-12 md:py-24 bg-muted/30 border-b border-border overflow-hidden">
          <div className="container mx-auto px-4 text-center mb-8 md:mb-12">
            <div className="flex items-center justify-center gap-2 mb-3">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className="h-5 w-5 fill-yellow-400 text-yellow-400"
                />
              ))}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              O que nossos clientes dizem
            </h2>
            <p className="text-muted-foreground text-sm md:text-base">
              Experiências reais de quem já comprou conosco.
            </p>
          </div>

          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-4 md:gap-6 px-4 md:px-8">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="flex-none w-[85vw] sm:w-[360px] md:w-[380px] bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-3"
                >
                  <StarDisplay rating={review.rating} />
                  <p className="text-sm md:text-base text-foreground/80 leading-relaxed flex-1">
                    "{review.text}"
                  </p>
                  <div className="flex items-center gap-3 pt-2 border-t border-border">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                      {review.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold text-sm text-foreground">
                      {review.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {(settings.googleReviewsUrl || settings.googleWriteReviewUrl) && (
            <div className="flex flex-wrap justify-center gap-3 mt-8 md:mt-10">
              {settings.googleWriteReviewUrl && (
                <a
                  href={settings.googleWriteReviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="gap-2 rounded-full px-6">
                    <Star className="h-4 w-4" />
                    Avaliar no Google
                  </Button>
                </a>
              )}
              {settings.googleReviewsUrl && (
                <a
                  href={settings.googleReviewsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" className="gap-2 rounded-full px-6">
                    <ExternalLink className="h-4 w-4" />
                    Ver todas as avaliações no Google
                  </Button>
                </a>
              )}
            </div>
          )}
        </section>
      )}

      {/* Contact Quick Access */}
      <section className="py-12 md:py-24 container mx-auto px-4">
        <div className="relative rounded-2xl md:rounded-3xl overflow-hidden p-6 md:p-16 text-center border border-border bg-card shadow-xl">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

          <div className="relative z-10 max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-5xl font-bold mb-4 md:mb-6 text-foreground">
              Estamos esperando por você
            </h2>
            <p className="text-muted-foreground text-sm md:text-lg mb-8 md:mb-12 max-w-2xl mx-auto">
              Venha nos visitar ou entre em contato. Nossa equipe está pronta
              para ajudar a encontrar o veículo ideal para você.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 items-stretch">
              <a
                href={`https://wa.me/55${settings.phoneSecondary?.replace(/\D/g, '') || '14991569560'}`}
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
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address)}`}
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
                    {settings.address}
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
