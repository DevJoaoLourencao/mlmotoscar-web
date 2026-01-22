import {
  Calculator,
  CheckCircle2,
  CreditCard,
  MessageCircle,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSettings } from "../components/SettingsProvider";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../components/ui/carousel";
import {
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Skeleton,
} from "../components/ui/core";
import { getVehicleById } from "../services/vehicleService";
import { Vehicle } from "../types";

export default function VehicleDetails() {
  const { id } = useParams();
  const { settings } = useSettings();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [api, setApi] = useState<any>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  // Installment Modal
  const [isInstallmentModalOpen, setIsInstallmentModalOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    phone: "",
    message: "Olá, tenho interesse no veículo. Por favor entre em contato.",
  });
  const [installmentForm, setInstallmentForm] = useState({
    name: "",
    birthDate: "",
    cpf: "",
    over21: "sim",
    hasCNH: "sim",
  });

  useEffect(() => {
    if (id) {
      getVehicleById(id).then((data) => {
        setVehicle(data || null);
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 animate-pulse">
        <Skeleton className="h-6 w-32 mb-8" />
        <Skeleton className="h-[500px] w-full mb-8" />
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-[500px] w-full" />
        </div>
      </div>
    );
  }

  if (!vehicle)
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 text-foreground">
        <h1>Veículo não encontrado</h1>
        <Link to="/catalogo">
          <Button>Voltar</Button>
        </Link>
      </div>
    );

  const images =
    vehicle.images || (vehicle as any).image_url
      ? vehicle.images || [(vehicle as any).image_url]
      : [];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const message = `Olá, vi o ${vehicle.title} no site ${settings.storeName}.\n\n${contactForm.message}\n\n*Meus dados:*\n👤 Nome: ${contactForm.name}\n📱 Telefone: ${contactForm.phone}`;
    const url = `https://wa.me/5514991569560?text=${encodeURIComponent(
      message
    )}`;
    window.open(url, "_blank");
    setContactForm({
      name: "",
      phone: "",
      message: "Olá, tenho interesse no veículo. Por favor entre em contato.",
    });
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 10) {
      return numbers
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{4})(\d)/, "$1-$2");
    }
    return numbers
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1");
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === "phone") {
      setContactForm((prev) => ({ ...prev, [name]: formatPhone(value) }));
    } else {
      setContactForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleInstallmentInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setInstallmentForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleInstallmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = settings.phonePrimary.replace(/\D/g, "");
    const message =
      `*SIMULAÇÃO DE FINANCIAMENTO*\n\n` +
      `*Veículo:* ${vehicle.title}\n` +
      `*Preço:* ${new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(vehicle.price)}\n\n` +
      `*Dados do Cliente:*\n` +
      `👤 Nome: ${installmentForm.name}\n` +
      `📅 Nasc.: ${installmentForm.birthDate}\n` +
      `📄 CPF: ${installmentForm.cpf}\n` +
      `🔞 Maior de 21: ${installmentForm.over21}\n` +
      `🚗 Possui CNH: ${installmentForm.hasCNH}\n\n` +
      `Gostaria de saber as condições de parcelamento.`;

    const url = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(
      message
    )}`;
    window.open(url, "_blank");
    setIsInstallmentModalOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Carousel - Full Width, 3 Images */}
      {images.length > 0 && (
        <div className="w-full mt-6 mb-8">
          {images.length <= 3 ? (
            <div className="container mx-auto px-10">
              <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {images.map((img, index) => (
                  <div
                    key={index}
                    className="relative w-full h-[250px] md:h-[350px] cursor-pointer group overflow-hidden rounded-lg border border-border"
                    onClick={() => {
                      setSelectedImageIndex(index);
                      setIsImageModalOpen(true);
                    }}
                  >
                    <img
                      src={img}
                      alt={`${vehicle.title} - Imagem ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg" />
                  </div>
                ))}
                </div>
              </div>
            </div>
          ) : (
            <Carousel
              setApi={setApi}
              className="w-full"
              opts={{
                align: "start",
                loop: true,
              }}
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {images.map((img, index) => (
                  <CarouselItem
                    key={index}
                    className="pl-2 md:pl-4 basis-full md:basis-[28.5%] md:min-w-0"
                  >
                    <div
                      className="relative w-full h-[250px] md:h-[350px] cursor-pointer group overflow-hidden rounded-lg border border-border"
                      onClick={() => {
                        setSelectedImageIndex(index);
                        setIsImageModalOpen(true);
                      }}
                    >
                      <img
                        src={img}
                        alt={`${vehicle.title} - Imagem ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg" />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-4 bg-red-600 hover:bg-red-700 text-white border-none shadow-lg" />
              <CarouselNext className="right-4 bg-red-600 hover:bg-red-700 text-white border-none shadow-lg" />
            </Carousel>
          )}
        </div>
      )}

      {/* Two Cards Layout */}
      <div className="container mx-auto px-10 pb-12">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Vehicle Details Card */}
          <Card className="bg-card border-border !shadow-sm hover:!shadow-sm hover:!translate-y-0 !transition-none">
            <CardContent className="p-6">
              <div className="mb-6 border-b border-border pb-4">
                <h1 className="text-3xl md:text-4xl font-bold mb-2 text-foreground">
                  {vehicle.title.split(" ").map((word, index) => {
                    const isModel =
                      word.toLowerCase() === vehicle.model.toLowerCase();
                    const isYear = /^\d{4}$/.test(word);
                    if (isModel || isYear) {
                      return (
                        <span key={index} className="text-red-600">
                          {word}{" "}
                        </span>
                      );
                    }
                    return <span key={index}>{word} </span>;
                  })}
                </h1>
              </div>

              {/* Specifications Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Ano
                  </p>
                  <p className="text-base font-medium text-white">
                    {vehicle.year}/{vehicle.year}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Quilometragem
                  </p>
                  <p className="text-base font-medium text-foreground">
                    {vehicle.mileage.toLocaleString()} km
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Cor
                  </p>
                  <p className="text-base font-medium text-foreground">
                    {vehicle.color || "Não informado"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Tipo
                  </p>
                  <p className="text-base font-medium text-foreground capitalize">
                    {vehicle.type}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Marca
                  </p>
                  <p className="text-base font-medium text-foreground">
                    {vehicle.brand}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Modelo
                  </p>
                  <p className="text-base font-medium text-white">
                    {vehicle.model}
                  </p>
                </div>
              </div>

              {/* Description */}
              {vehicle.description && vehicle.description.trim() && (
                <div className="mt-6">
                  <h3 className="text-lg font-bold mb-3 text-foreground">
                    Sobre o veículo
                  </h3>
                  <p className="text-base text-foreground/80 leading-relaxed">
                    {vehicle.description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact & Financing Card */}
          <Card className="bg-card border-border !shadow-sm hover:!shadow-sm hover:!translate-y-0 !transition-none">
            <CardContent className="p-6 space-y-6">
              {/* Price & Financing Button */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-border pb-6">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Valor
                  </p>
                  <p className="text-3xl font-bold text-primary">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(vehicle.price)}
                  </p>
                </div>
                <Button
                  onClick={() => setIsInstallmentModalOpen(true)}
                  className="bg-primary hover:bg-primary/90 w-full md:w-auto"
                  size="lg"
                >
                  <CreditCard className="mr-2 h-5 w-5" />
                  Ver Parcelas
                </Button>
              </div>

              {/* Contact Form */}
              <div>
                <h3 className="text-base font-bold mb-4 text-foreground">
                  Envie uma mensagem ao vendedor
                </h3>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contact-name">Nome*</Label>
                      <Input
                        id="contact-name"
                        name="name"
                        required
                        value={contactForm.name}
                        onChange={handleInputChange}
                        placeholder="Seu nome completo"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact-phone">Telefone*</Label>
                      <Input
                        id="contact-phone"
                        name="phone"
                        required
                        value={contactForm.phone}
                        onChange={handleInputChange}
                        placeholder="(00) 00000-0000"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="contact-message">Mensagem*</Label>
                    <textarea
                      id="contact-message"
                      name="message"
                      required
                      value={contactForm.message}
                      onChange={handleInputChange}
                      placeholder="Digite sua mensagem aqui..."
                      rows={3}
                      className="mt-1 flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={
                      !contactForm.name.trim() ||
                      !contactForm.phone.trim() ||
                      !contactForm.message.trim()
                    }
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Enviar mensagem
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Installment Dialog */}
      <Dialog
        open={isInstallmentModalOpen}
        onOpenChange={setIsInstallmentModalOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" /> Simular
              Financiamento
            </DialogTitle>
            <DialogDescription>
              Preencha para receber a análise de crédito no seu WhatsApp.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleInstallmentSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                name="name"
                required
                value={installmentForm.name}
                onChange={handleInstallmentInputChange}
                placeholder="Ex: João da Silva"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="birthDate">Data de Nascimento</Label>
                <Input
                  id="birthDate"
                  name="birthDate"
                  type="date"
                  required
                  value={installmentForm.birthDate}
                  onChange={handleInstallmentInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  name="cpf"
                  required
                  value={installmentForm.cpf}
                  onChange={handleInstallmentInputChange}
                  placeholder="000.000.000-00"
                />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="space-y-2">
                <Label>É maior de 21 anos?</Label>
                <select
                  name="over21"
                  value={installmentForm.over21}
                  onChange={handleInstallmentInputChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 text-foreground"
                >
                  <option value="sim">Sim</option>
                  <option value="nao">Não</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Possui CNH?</Label>
                <select
                  name="hasCNH"
                  value={installmentForm.hasCNH}
                  onChange={handleInstallmentInputChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 text-foreground"
                >
                  <option value="sim">Sim</option>
                  <option value="nao">Não</option>
                </select>
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="submit"
                className="w-full gap-2 font-bold text-white hover:opacity-90"
                style={{ backgroundColor: "var(--whatsapp)" }}
              >
                <CheckCircle2 className="h-4 w-4" />
                Ver Parcelas no WhatsApp
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Image Zoom Dialog */}
      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 border-none bg-transparent shadow-none">
          <img
            src={images[selectedImageIndex]}
            alt={`${vehicle.title} - Imagem ${selectedImageIndex + 1}`}
            className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
