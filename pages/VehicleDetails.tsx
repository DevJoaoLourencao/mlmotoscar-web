import {
  Calculator,
  CreditCard,
  MessageCircle
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
    message: "Olá, tenho interesse no veículo. Por favor entre em contato.",
  });
  const [installmentForm, setInstallmentForm] = useState({
    name: "",
    birthDate: "",
    cpf: "",
    downPayment: "",
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
    const message = `Olá, vi o ${vehicle.title} no site ${settings.storeName}.\n\n${contactForm.message}\n\n*Meus dados:*\n👤 Nome: ${contactForm.name}`;
    const url = `https://wa.me/5514991569560?text=${encodeURIComponent(
      message
    )}`;
    window.open(url, "_blank");
    setContactForm({
      name: "",
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

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    return numbers
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
      .slice(0, 14);
  };

  const formatCurrency = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    const amount = Number(numbers) / 100;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };

  const getMinimumDownPayment = () => {
    return vehicle ? vehicle.price * 0.1 : 0;
  };

  const parseDownPayment = (formatted: string) => {
    return Number(formatted.replace(/[^\d]/g, "")) / 100;
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const isInstallmentFormValid = () => {
    const cleanCPF = installmentForm.cpf.replace(/\D/g, "");
    const age = calculateAge(installmentForm.birthDate);
    const downPaymentValue = parseDownPayment(installmentForm.downPayment);
    const minimumDownPayment = getMinimumDownPayment();
    
    // Validação rigorosa de todos os campos
    const isNameValid = installmentForm.name.trim().length >= 3;
    const isBirthDateValid = installmentForm.birthDate !== "" && age >= 18;
    const isCPFValid = cleanCPF.length === 11;
    const isDownPaymentValid = downPaymentValue >= minimumDownPayment;
    const isCNHValid = installmentForm.hasCNH !== "";
    
    return (
      isNameValid &&
      isBirthDateValid &&
      isCPFValid &&
      isDownPaymentValid &&
      isCNHValid
    );
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setContactForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleInstallmentInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    if (name === "cpf") {
      setInstallmentForm((prev) => ({ ...prev, [name]: formatCPF(value) }));
    } else if (name === "downPayment") {
      setInstallmentForm((prev) => ({ ...prev, [name]: formatCurrency(value) }));
    } else {
      setInstallmentForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const resetInstallmentForm = () => {
    setInstallmentForm({
      name: "",
      birthDate: "",
      cpf: "",
      downPayment: "",
      hasCNH: "sim",
    });
  };

  const handleInstallmentModalClose = (open: boolean) => {
    setIsInstallmentModalOpen(open);
    if (!open) {
      resetInstallmentForm();
    }
  };

  const handleInstallmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isInstallmentFormValid()) {
      return;
    }

    const cleanPhone = settings.phoneSecondary.replace(/\D/g, "");
    const age = calculateAge(installmentForm.birthDate);
    const formattedDate = new Date(installmentForm.birthDate).toLocaleDateString('pt-BR');
    const downPaymentValue = parseDownPayment(installmentForm.downPayment);
    const financeAmount = vehicle.price - downPaymentValue;
    
    const message =
      `*SIMULAÇÃO DE FINANCIAMENTO*\n\n` +
      `*Veículo de Interesse:*\n` +
      `${vehicle.brand} ${vehicle.model} - ${vehicle.year}\n` +
      `• Valor Total: ${new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(vehicle.price)}\n` +
      `• Entrada: ${installmentForm.downPayment}\n` +
      `• Valor a Financiar: ${new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(financeAmount)}\n\n` +
      `*Dados do Cliente:*\n` +
      `• Nome: ${installmentForm.name}\n` +
      `• Data Nasc.: ${formattedDate} (${age} anos)\n` +
      `• CPF: ${installmentForm.cpf}\n` +
      `• Possui CNH: ${installmentForm.hasCNH === "sim" ? "Sim" : "Não"}\n\n` +
      `_Gostaria de saber as condições de financiamento para este veículo._`;

    const url = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Carousel - Full Width, 3 Images */}
      {images.length > 0 && (
        <div className="w-full mt-4 md:mt-6 mb-6 md:mb-8">
          {images.length <= 3 ? (
            <div className="container mx-auto px-6 md:px-10">
              <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                {images.map((img, index) => (
                  <div
                    key={index}
                    className="relative w-full h-[200px] md:h-[350px] cursor-pointer group overflow-hidden rounded-lg border border-border"
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
                      className="relative w-full h-[200px] md:h-[350px] cursor-pointer group overflow-hidden rounded-lg border border-border"
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
      <div className="container mx-auto px-6 md:px-10 pb-8 md:pb-12">
        <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
          {/* Vehicle Details Card */}
          <Card className="bg-card border-border !shadow-sm hover:!shadow-sm hover:!translate-y-0 !transition-none">
            <CardContent className="p-5 md:p-6">
              <div className="mb-5 md:mb-6 border-b border-border pb-4">
                <h1 className="text-2xl md:text-4xl font-bold mb-2 text-foreground">
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
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-5 md:mb-6">
                <div className="space-y-1">
                  <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider">
                    Ano
                  </p>
                  <p className="text-sm md:text-base font-medium text-white">
                    {vehicle.year}/{vehicle.year}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider">
                    Quilometragem
                  </p>
                  <p className="text-sm md:text-base font-medium text-foreground">
                    {vehicle.mileage.toLocaleString()} km
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider">
                    Cor
                  </p>
                  <p className="text-sm md:text-base font-medium text-foreground">
                    {vehicle.color || "Não informado"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider">
                    Tipo
                  </p>
                  <p className="text-sm md:text-base font-medium text-foreground capitalize">
                    {vehicle.type}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider">
                    Marca
                  </p>
                  <p className="text-sm md:text-base font-medium text-foreground">
                    {vehicle.brand}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider">
                    Modelo
                  </p>
                  <p className="text-sm md:text-base font-medium text-white">
                    {vehicle.model}
                  </p>
                </div>
              </div>

              {/* Description */}
              {vehicle.description && vehicle.description.trim() && (
                <div className="mt-5 md:mt-6">
                  <h3 className="text-base md:text-lg font-bold mb-2 md:mb-3 text-foreground">
                    Sobre o veículo
                  </h3>
                  <p className="text-sm md:text-base text-foreground/80 leading-relaxed">
                    {vehicle.description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact & Financing Card */}
          <Card className="bg-card border-border !shadow-sm hover:!shadow-sm hover:!translate-y-0 !transition-none">
            <CardContent className="p-5 md:p-6 space-y-5 md:space-y-6">
              {/* Price & Financing Button */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-border pb-5 md:pb-6">
                <div className="space-y-1 text-center md:text-left">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Valor
                  </p>
                  <p className="text-2xl md:text-3xl font-bold text-primary">
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
                  <CreditCard className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                  Ver Parcelas
                </Button>
              </div>

              {/* Contact Form */}
              <div>
                <h3 className="text-sm md:text-base font-bold mb-3 md:mb-4 text-foreground">
                  Envie uma mensagem ao vendedor
                </h3>
                <form onSubmit={handleContactSubmit} className="space-y-3 md:space-y-4">
                  <div>
                    <Label htmlFor="contact-name" className="text-xs md:text-sm">Nome*</Label>
                    <Input
                      id="contact-name"
                      name="name"
                      required
                      value={contactForm.name}
                      onChange={handleInputChange}
                      placeholder="Seu nome completo"
                      className="mt-1 h-10 md:h-11 text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact-message" className="text-xs md:text-sm">Mensagem*</Label>
                    <textarea
                      id="contact-message"
                      name="message"
                      required
                      value={contactForm.message}
                      onChange={handleInputChange}
                      placeholder="Digite sua mensagem aqui..."
                      rows={3}
                      className="mt-1 flex min-h-[60px] md:min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-xs md:text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 h-10 md:h-11 text-sm md:text-base"
                    disabled={
                      !contactForm.name.trim() ||
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
        onOpenChange={handleInstallmentModalClose}
      >
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Calculator className="h-6 w-6 text-primary" /> Simular
              Financiamento
            </DialogTitle>
            <DialogDescription className="text-sm">
              Preencha seus dados para receber as condições de financiamento pelo WhatsApp.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleInstallmentSubmit} className="space-y-5 py-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold">
                Nome Completo *
              </Label>
              <Input
                id="name"
                name="name"
                required
                value={installmentForm.name}
                onChange={handleInstallmentInputChange}
                placeholder="Digite seu nome completo"
                className={`h-11 ${installmentForm.name && installmentForm.name.trim().length < 3 ? 'border-red-500' : ''}`}
              />
              {installmentForm.name && installmentForm.name.trim().length < 3 && (
                <p className="text-xs text-red-500">⚠️ Nome deve ter pelo menos 3 caracteres</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cpf" className="text-sm font-semibold">
                  CPF *
                </Label>
                <Input
                  id="cpf"
                  name="cpf"
                  required
                  value={installmentForm.cpf}
                  onChange={handleInstallmentInputChange}
                  placeholder="000.000.000-00"
                  className={`h-11 ${installmentForm.cpf && installmentForm.cpf.replace(/\D/g, "").length > 0 && installmentForm.cpf.replace(/\D/g, "").length < 11 ? 'border-red-500' : ''}`}
                  maxLength={14}
                />
                {installmentForm.cpf && installmentForm.cpf.replace(/\D/g, "").length > 0 && installmentForm.cpf.replace(/\D/g, "").length < 11 && (
                  <p className="text-xs text-red-500">⚠️ CPF incompleto (11 dígitos)</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthDate" className="text-sm font-semibold">
                  Data de Nascimento *
                </Label>
                <Input
                  id="birthDate"
                  name="birthDate"
                  type="date"
                  required
                  value={installmentForm.birthDate}
                  onChange={handleInstallmentInputChange}
                  className="h-11"
                  max={new Date().toISOString().split('T')[0]}
                />
                {installmentForm.birthDate && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Idade: {calculateAge(installmentForm.birthDate)} anos
                    {calculateAge(installmentForm.birthDate) < 18 && (
                      <span className="text-red-500 ml-2">⚠️ Menor de idade</span>
                    )}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="downPayment" className="text-sm font-semibold">
                Valor da Entrada *
              </Label>
              <Input
                id="downPayment"
                name="downPayment"
                required
                value={installmentForm.downPayment}
                onChange={handleInstallmentInputChange}
                placeholder="R$ 0,00"
                className={`h-11 ${installmentForm.downPayment && parseDownPayment(installmentForm.downPayment) > 0 && parseDownPayment(installmentForm.downPayment) < getMinimumDownPayment() ? 'border-red-500' : ''}`}
              />
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-xs text-blue-700 dark:text-blue-400 font-medium flex items-start gap-2">
                  <span>ℹ️</span>
                  <span>
                    <strong>Entrada mínima obrigatória:</strong> {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(getMinimumDownPayment())} (10% do valor do veículo)
                  </span>
                </p>
              </div>
              {installmentForm.downPayment && parseDownPayment(installmentForm.downPayment) > 0 && parseDownPayment(installmentForm.downPayment) < getMinimumDownPayment() && (
                <p className="text-xs text-red-500 font-medium">
                  ⚠️ Entrada abaixo do mínimo. Não financiamos sem entrada de pelo menos 10% do valor.
                </p>
              )}
              {installmentForm.downPayment && parseDownPayment(installmentForm.downPayment) >= getMinimumDownPayment() && (
                <p className="text-xs text-green-600 dark:text-green-500 font-medium">
                  ✅ Valor da entrada válido
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Possui CNH? *</Label>
              <select
                name="hasCNH"
                value={installmentForm.hasCNH}
                onChange={handleInstallmentInputChange}
                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 text-foreground"
              >
                <option value="sim">Sim</option>
                <option value="nao">Não</option>
              </select>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 border border-border">
              <p className="text-xs text-muted-foreground mb-3">
                Resumo da Simulação:
              </p>
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">
                  {vehicle.brand} {vehicle.model} - {vehicle.year}
                </p>
                <div className="border-t border-border pt-2 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Valor Total:</span>
                    <span className="text-sm font-semibold text-foreground">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(vehicle.price)}
                    </span>
                  </div>
                  {installmentForm.downPayment && parseDownPayment(installmentForm.downPayment) > 0 && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Entrada:</span>
                        <span className="text-sm font-medium text-green-600 dark:text-green-500">
                          {installmentForm.downPayment}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-1.5 border-t border-border">
                        <span className="text-xs font-medium text-foreground">A Financiar:</span>
                        <span className="text-base font-bold text-primary">
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(vehicle.price - parseDownPayment(installmentForm.downPayment))}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetInstallmentForm();
                  setIsInstallmentModalOpen(false);
                }}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={!isInstallmentFormValid()}
                className="w-full sm:w-auto gap-2 font-bold text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                style={{ backgroundColor: isInstallmentFormValid() ? "var(--whatsapp)" : "hsl(var(--muted))" }}
              >
                <MessageCircle className="h-4 w-4" />
                {isInstallmentFormValid() ? "Enviar para WhatsApp" : "Preencha todos os campos"}
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
