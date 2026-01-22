import Autoplay from "embla-carousel-autoplay";
import { Award, Shield, Target, Users } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "../components/ui/carousel";
import { Card, CardContent } from "../components/ui/core";

// Imagens da loja - imagens reais da ML MOTOSCAR
const STORE_IMAGES = [
  "/store-images/imagem-1.jpeg",
  "/store-images/imagem-2.webp",
  "/store-images/imagem-3.webp",
  "/store-images/imagem-4.webp",
  "/store-images/imagem-5.webp",
  "/store-images/imagem-6.webp",
  "/store-images/imagem-7.webp",
  "/store-images/imagem-8.jpeg",
  "/store-images/imagem-9.jpeg",
  "/store-images/imagem-10.jpeg",
  "/store-images/imagem-11.jpeg",
  "/store-images/imagem-12.jpeg",
  "/store-images/imagem-13.jpeg",
  "/store-images/imagem-14.jpeg",
  "/store-images/imagem-15.jpeg",
  "/store-images/imagem-16.jpeg",
  "/store-images/imagem-17.jpeg",
  "/store-images/imagem-18.jpeg",
  "/store-images/imagem-19.jpeg",
  "/store-images/imagem-20.jpeg",
].filter((img) => img);

export default function About() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  const autoplayPlugin = Autoplay({
    delay: 3000,
    stopOnInteraction: true,
    stopOnMouseEnter: true,
  });

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero */}
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url("/camaro.jpeg")',
            filter: "brightness(0.3)",
          }}
        />
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white">
            Nossa História
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Mais que uma loja de veículos, realizamos sonhos sobre rodas.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-24 mt-24 container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center mb-32">
          <div>
            <h2 className="text-3xl font-bold mb-6 text-primary">
              Paixão por Motores
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Com mais de 25 anos de experiência no mercado de motocicletas, a ML MOTOSCAR 
              foi fundada em 2020, nascendo da paixão por duas rodas. Iniciamos nossa 
              jornada com um pequeno estoque de motos de baixa cilindrada e, ao longo 
              dos anos, passamos por várias mudanças de nomes e lugares até chegarmos 
              onde estamos hoje.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Atualmente, oferecemos uma grande variedade de veículos com diversos modelos 
              e cilindradas, tanto de motos quanto de carros para venda. Nosso compromisso 
              não é apenas vender um veículo, mas proporcionar uma experiência única de 
              compra, garantindo qualidade e um atendimento personalizado que entende 
              exatamente o que você procura.
            </p>
          </div>

          {/* Carousel Shadcn */}
          <Carousel
            setApi={setApi}
            opts={{
              align: "center",
              loop: true,
            }}
            plugins={[autoplayPlugin]}
            className="w-full group"
          >
            <div className="relative h-[500px] rounded-xl overflow-hidden bg-muted border border-border shadow-xl">
              <CarouselContent className="-ml-0 h-full">
                {STORE_IMAGES.length > 0 ? (
                  STORE_IMAGES.map((imgSrc, index) => (
                    <CarouselItem
                      key={index}
                      className="pl-0 basis-full"
                      style={{ height: "500px" }}
                    >
                      <div className="relative w-full h-full bg-muted flex items-center justify-center">
                        <img
                          src={imgSrc}
                          alt={`ML MOTOSCAR - Imagem ${index + 1}`}
                          loading={index === 0 ? "eager" : "lazy"}
                          className="w-full h-full object-cover object-center"
                          style={{
                            objectPosition: "center 60%",
                          }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (!target.dataset.fallback) {
                              target.dataset.fallback = "true";
                              target.src =
                                "https://images.unsplash.com/photo-1562519819-016930d676f6?q=80&w=2000&auto=format&fit=crop";
                            }
                          }}
                        />
                      </div>
                    </CarouselItem>
                  ))
                ) : (
                  <CarouselItem>
                    <div className="flex items-center justify-center h-full bg-muted">
                      <p className="text-muted-foreground text-center px-4">
                        Adicione imagens na pasta /public/store-images/
                      </p>
                    </div>
                  </CarouselItem>
                )}
              </CarouselContent>

              {STORE_IMAGES.length > 1 && (
                <>
                  <CarouselPrevious className="left-4 bg-black/70 hover:bg-primary text-white border-none rounded-full h-12 w-12 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CarouselNext className="right-4 bg-black/70 hover:bg-primary text-white border-none rounded-full h-12 w-12 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Contador de imagens */}
                  <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm z-20">
                    {current} / {count}
                  </div>
                </>
              )}
            </div>

            {/* Indicators - abaixo da imagem */}
            {STORE_IMAGES.length > 1 && (
              <div className="flex justify-center space-x-2 mt-4">
                {STORE_IMAGES.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => api?.scrollTo(index)}
                    className={`rounded-full transition-all duration-300 ${
                      index + 1 === current
                        ? "bg-primary w-8 h-2"
                        : "bg-muted-foreground/50 hover:bg-muted-foreground/80 w-2 h-2"
                    }`}
                    aria-label={`Ir para imagem ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </Carousel>
        </div>

        {/* Values */}
        <h2 className="text-3xl font-bold text-center mb-10 text-foreground">
          Nossos Pilares
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-card border-border text-center hover:border-primary/50 transition-colors">
            <CardContent className="pt-6">
              <div className="h-12 w-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold mb-2 text-foreground">Confiança</h3>
              <p className="text-sm text-muted-foreground">
                Transparência total em cada negociação.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border text-center hover:border-primary/50 transition-colors">
            <CardContent className="pt-6">
              <div className="h-12 w-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold mb-2 text-foreground">Qualidade</h3>
              <p className="text-sm text-muted-foreground">
                Estoque rigorosamente selecionado.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border text-center hover:border-primary/50 transition-colors">
            <CardContent className="pt-6">
              <div className="h-12 w-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold mb-2 text-foreground">Foco</h3>
              <p className="text-sm text-muted-foreground">
                Entender para atender sua necessidade.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border text-center hover:border-primary/50 transition-colors">
            <CardContent className="pt-6">
              <div className="h-12 w-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold mb-2 text-foreground">Comunidade</h3>
              <p className="text-sm text-muted-foreground">
                Criamos laços duradouros com clientes.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
      {/* Video Background Section */}
      <section className="mb-24 relative w-full h-[800px] md:h-[900px] flex items-center justify-center overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover object-center z-0"
          style={{ objectPosition: "center 65%" }}
        >
          <source src="/video.mp4" type="video/mp4" />
          Seu navegador não suporta vídeos HTML5.
        </video>
        <div className="absolute inset-0 bg-black/10 z-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent z-0" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/40 to-transparent z-0" />
      </section>
    </div>
  );
}
