import { Award, Shield, Target, Users } from "lucide-react";
import { VehicleGallery } from "../components/VehicleGallery";
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

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero */}
      <section className="relative h-[300px] md:h-[400px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("/camaro.png")',
            filter: "brightness(0.3)",
          }}
        />
        <div className="relative z-10 text-center px-16 sm:px-4">
          <h1 className="text-3xl md:text-6xl font-bold mb-3 md:mb-4 text-white">
            Nossa História
          </h1>
          <p className="text-base md:text-xl text-gray-300 max-w-2xl mx-auto">
            Mais que uma loja de veículos, realizamos sonhos sobre rodas.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-10 md:py-24 mt-0 md:mt-24 container mx-auto px-10 sm:px-6 md:px-4 mb-10 md:mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-20 items-center mb-24 md:mb-32">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-primary">
              Paixão por Motores
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-3 md:mb-4">
              Com mais de 25 anos de experiência no mercado de motocicletas, a ML MOTOSCAR 
              foi fundada em 2020, nascendo da paixão por duas rodas. Iniciamos nossa 
              jornada com um pequeno estoque de motos de baixa cilindrada e, ao longo 
              dos anos, passamos por várias mudanças de nomes e lugares até chegarmos 
              onde estamos hoje.
            </p>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              Atualmente, oferecemos uma grande variedade de veículos com diversos modelos 
              e cilindradas, tanto de motos quanto de carros para venda. Nosso compromisso 
              não é apenas vender um veículo, mas proporcionar uma experiência única de 
              compra, garantindo qualidade e um atendimento personalizado que entende 
              exatamente o que você procura.
            </p>
          </div>

          {/* Gallery com Swiper + Lightbox */}
          {STORE_IMAGES.length > 0 ? (
            <div className="w-full">
              <VehicleGallery 
                images={STORE_IMAGES} 
                vehicleTitle="ML MOTOSCAR"
                showThumbnails={false}
                showPagination={true}
              />
            </div>
          ) : (
            <div className="relative h-[300px] md:h-[500px] rounded-xl overflow-hidden bg-muted border border-border shadow-xl flex items-center justify-center">
              <p className="text-muted-foreground text-center px-4 text-sm md:text-base">
                Adicione imagens na pasta /public/store-images/
              </p>
            </div>
          )}
        </div>

        {/* Values */}
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-10 text-foreground">
          Nossos Pilares
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
          <Card className="bg-card border-border text-center hover:border-primary/50 transition-colors">
            <CardContent className="pt-5 md:pt-6 pb-5 md:pb-6">
              <div className="h-10 w-10 md:h-12 md:w-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-3 md:mb-4">
                <Shield className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
              <h3 className="font-bold mb-2 text-foreground text-base md:text-lg">Confiança</h3>
              <p className="text-xs md:text-sm text-muted-foreground">
                Transparência total em cada negociação.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border text-center hover:border-primary/50 transition-colors">
            <CardContent className="pt-5 md:pt-6 pb-5 md:pb-6">
              <div className="h-10 w-10 md:h-12 md:w-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-3 md:mb-4">
                <Award className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
              <h3 className="font-bold mb-2 text-foreground text-base md:text-lg">Qualidade</h3>
              <p className="text-xs md:text-sm text-muted-foreground">
                Estoque rigorosamente selecionado.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border text-center hover:border-primary/50 transition-colors">
            <CardContent className="pt-5 md:pt-6 pb-5 md:pb-6">
              <div className="h-10 w-10 md:h-12 md:w-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-3 md:mb-4">
                <Target className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
              <h3 className="font-bold mb-2 text-foreground text-base md:text-lg">Foco</h3>
              <p className="text-xs md:text-sm text-muted-foreground">
                Entender para atender sua necessidade.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border text-center hover:border-primary/50 transition-colors">
            <CardContent className="pt-5 md:pt-6 pb-5 md:pb-6">
              <div className="h-10 w-10 md:h-12 md:w-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-3 md:mb-4">
                <Users className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
              <h3 className="font-bold mb-2 text-foreground text-base md:text-lg">Comunidade</h3>
              <p className="text-xs md:text-sm text-muted-foreground">
                Criamos laços duradouros com clientes.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
      {/* Video Background Section */}
      <section className="mb-12 md:mb-24 relative w-full h-[400px] md:h-[800px] lg:h-[900px] flex items-center justify-center overflow-hidden">
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
