import { Clock, ExternalLink, MessageCircle, Phone } from "lucide-react";
import React, { useState } from "react";
import { useSettings } from "../components/SettingsProvider";
import { usePageTitle } from "../hooks/usePageTitle";
import { SEO } from "../hooks/useSEO";
import { Button, Card, CardContent, Input, Label } from "../components/ui/core";

export default function Contact() {
  usePageTitle("Fale Conosco");
  const { settings } = useSettings();
  const [formData, setFormData] = useState({
    name: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const phone = settings.phonePrimary.replace(/\D/g, '');
    const text = `Olá, meu nome é ${formData.name}. ${formData.message}`;
    window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="container mx-auto px-10 md:px-4 py-10 md:py-24 animate-fade-in-up">
      <SEO
        title="Fale Conosco"
        description="Entre em contato com a ML MOTOSCAR. Estamos em Marília, SP, prontos para ajudar você a encontrar o veículo ideal. WhatsApp, telefone e endereço."
        url="/contato"
      />
      <div className="text-center mb-8 md:mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-foreground">
          Fale Conosco
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Estamos prontos para atender você.
        </p>
      </div>

      {/* Top Row: Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
        <Card className="bg-card border-border hover:border-primary/50 transition-all hover:-translate-y-1">
          <CardContent className="p-5 md:p-6 flex flex-col items-center text-center h-full justify-center">
            <div className="p-2 md:p-3 bg-primary/10 rounded-full mb-3 md:mb-4">
              <Phone className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            </div>
            <h3 className="font-bold mb-2 md:mb-3 text-foreground text-base md:text-lg">Telefones</h3>
            <div className="space-y-2">
              <a
                href={`tel:${settings.phonePrimary}`}
                className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors block"
              >
                <div className="font-semibold text-foreground text-xs mb-0.5">
                  {settings.phonePrimaryName}
                </div>
                {settings.phonePrimary}
              </a>
              <a
                href={`tel:${settings.phoneSecondary}`}
                className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors block"
              >
                <div className="font-semibold text-foreground text-xs mb-0.5">
                  {settings.phoneSecondaryName}
                </div>
                {settings.phoneSecondary}
              </a>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border hover:border-primary/50 transition-all hover:-translate-y-1">
          <CardContent className="p-5 md:p-6 flex flex-col items-center text-center h-full justify-center">
            <div className="p-2 md:p-3 bg-green-500/10 rounded-full mb-3 md:mb-4">
              <MessageCircle className="h-5 w-5 md:h-6 md:w-6 text-green-500" />
            </div>
            <h3 className="font-bold mb-2 md:mb-3 text-foreground text-base md:text-lg">WhatsApp</h3>
            <div className="space-y-2">
              <a
                href={`https://wa.me/55${settings.phonePrimary.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs md:text-sm text-muted-foreground hover:text-green-500 transition-colors block"
              >
                <div className="font-semibold text-foreground text-xs mb-0.5">
                  {settings.phonePrimaryName}
                </div>
                {settings.phonePrimary}
              </a>
              <a
                href={`https://wa.me/55${settings.phoneSecondary.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs md:text-sm text-muted-foreground hover:text-green-500 transition-colors block"
              >
                <div className="font-semibold text-foreground text-xs mb-0.5">
                  {settings.phoneSecondaryName}
                </div>
                {settings.phoneSecondary}
              </a>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border hover:border-primary/50 transition-all hover:-translate-y-1">
          <CardContent className="p-5 md:p-6 flex flex-col items-center text-center h-full justify-center">
            <div className="p-2 md:p-3 bg-primary/10 rounded-full mb-3 md:mb-4">
              <Clock className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            </div>
            <h3 className="font-bold mb-2 text-foreground text-base md:text-lg">Horários</h3>
            <p className="text-xs md:text-sm text-muted-foreground">
              {settings.openingHoursWeekdays}
            </p>
            <p className="text-xs md:text-sm text-muted-foreground">
              {settings.openingHoursWeekend}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Left: Map */}
        <Card className="bg-card border-border overflow-hidden h-full min-h-[300px] md:min-h-[400px]">
          <div className="w-full h-full relative">
            <iframe
              src={settings.googleMapsUrl}
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: "300px" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0"
              title="Localização da ML MOTOSCAR no Google Maps"
              aria-label="Mapa com localização da loja ML MOTOSCAR"
            />
            <div className="absolute bottom-3 right-3 md:bottom-4 md:right-4 z-10">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="outline"
                  className="gap-2 border-primary/20 hover:border-primary text-foreground hover:bg-primary/5 bg-background/90 backdrop-blur-sm text-xs md:text-sm px-3 md:px-4 h-9 md:h-10"
                >
                  <ExternalLink className="h-3 w-3 md:h-4 md:w-4" /> Abrir no Google Maps
                </Button>
              </a>
            </div>
          </div>
        </Card>

        {/* Right: Form */}
        <Card className="bg-card border-border h-full">
          <CardContent className="p-5 md:p-8">
            <h2 className="text-xl md:text-2xl font-bold mb-2 text-foreground">
              Envie uma mensagem
            </h2>
            <p className="text-muted-foreground mb-5 md:mb-6 text-xs md:text-sm">
              Preencha o formulário abaixo e retornaremos o mais breve possível.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
              <div className="space-y-2">
                <Label className="text-sm md:text-base">Nome Completo</Label>
                <Input
                  name="name"
                  placeholder="Seu nome"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="h-10 md:h-11 bg-background border-input text-sm md:text-base"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm md:text-base">Mensagem</Label>
                <textarea
                  name="message"
                  className="flex min-h-[100px] md:min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-xs md:text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus:border-primary transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Olá, gostaria de saber mais sobre..."
                  required
                  value={formData.message}
                  onChange={handleChange}
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="w-full font-bold text-sm md:text-base h-11 md:h-12"
                disabled={
                  !formData.name.trim() ||
                  !formData.message.trim()
                }
              >
                <MessageCircle className="mr-2 h-4 w-4" /> Enviar via WhatsApp
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
