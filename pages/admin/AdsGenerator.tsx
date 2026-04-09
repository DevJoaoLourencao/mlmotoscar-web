import { CheckCircle, Copy, Download, ImageDown, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import {
  AdminPageContainer,
  AdminPageHeader,
} from "../../components/AdminPageComponents";
import { useSettings } from "../../components/SettingsProvider";
import { Combobox } from "../../components/ui/combobox";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Label,
} from "../../components/ui/core";
import { getVehicles } from "../../services/vehicleService";
import { Vehicle } from "../../types";

export default function AdsGenerator() {
  const { settings } = useSettings();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");
  const [adText, setAdText] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getVehicles().then((data) => {
      // Filtrar apenas veículos disponíveis
      const availableVehicles = data.filter(
        (v) => !v.status || v.status === "available",
      );
      setVehicles(availableVehicles);
    });
  }, []);

  const handleVehicleSelect = (id: string) => {
    setSelectedVehicleId(id);
    const vehicle = vehicles.find((v) => v.id === id);
    if (vehicle) {
      generateCopy(vehicle);
    }
  };

  const generateCopy = (v: Vehicle) => {
    const priceFormatted = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(v.price);

    const template = `🔥 ${v.title.toUpperCase()} 🔥
📅 Ano: ${v.year}
🏁 Quilometragem: ${v.mileage.toLocaleString()} km
📍 Cor: ${v.color}

💰 VALOR: ${priceFormatted}

${v.description ? `✅ ${v.description}` : ""}
✅ Garantia de procedência
✅ Aceitamos seu usado na troca
✅ Financiamento com as melhores taxas

🔥 ${settings.storeName.toUpperCase()}
📍 Venha nos visitar: ${settings.address}
📲 WhatsApp: ${settings.phoneSecondary} (${settings.phoneSecondaryName})
📲 WhatsApp: ${settings.phonePrimary} (${settings.phonePrimaryName})


Financiamos em até 48x com entrada mínima de 10% do valor do veículo. Parcelamentos no cartão de crédito em até 21x. Aceitamos seu usado na troca (sob análise).




#${settings.storeName.replace(/\s/g, "").toLowerCase()} #vendas #${settings.city.replace(/\s/g, "").toLowerCase()} #${v.brand.replace(/\s/g, "").toLowerCase()} #${v.model.replace(/\s/g, "").toLowerCase()} #oportunidade`;

    setAdText(template);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(adText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    if (!adText) return;
    const phone = settings.phonePrimary?.replace(/\D/g, "");
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(adText)}`;
    window.open(url, "_blank");
  };

  const downloadImage = async (url: string, index: number, vehicleTitle: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const ext = blob.type.split("/")[1] || "jpg";
      const fileName = `${vehicleTitle.replace(/\s+/g, "_")}_foto${index + 1}.${ext}`;
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch {
      // Fallback: abrir em nova aba se CORS bloquear o fetch
      window.open(url, "_blank");
    }
  };

  const downloadAllImages = async (images: string[], vehicleTitle: string) => {
    for (let i = 0; i < images.length; i++) {
      await downloadImage(images[i], i, vehicleTitle);
      // Pequeno delay para não disparar múltiplos downloads simultâneos
      if (i < images.length - 1) await new Promise((r) => setTimeout(r, 400));
    }
  };

  return (
    <AdminPageContainer>
      <AdminPageHeader
        title="Automação de Anúncios"
        description="Gere descrições automáticas e publique em suas redes sociais com um clique."
      />

      {/* Stacked Layout */}
      <div className="flex flex-col space-y-8">
        {/* Step 1: Selection */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-foreground">
              1. Selecione o Veículo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="text-foreground">Veículo do Estoque</Label>
              <Combobox
                options={vehicles.map((v) => ({
                  value: v.id,
                  label: `${v.title} - ${v.year}`,
                }))}
                value={selectedVehicleId}
                onValueChange={handleVehicleSelect}
                placeholder="Selecione um veículo..."
                searchPlaceholder="Buscar veículo..."
                emptyText="Nenhum veículo encontrado."
              />
            </div>

            {selectedVehicleId && (
              <div className="rounded-lg border border-border p-4 bg-muted/30 flex flex-col sm:flex-row gap-4 items-center sm:items-start">
                {(() => {
                  const v = vehicles.find((x) => x.id === selectedVehicleId);
                  if (!v) return null;
                  return (
                    <>
                      <img
                        src={v.images?.[0]}
                        alt={v.title}
                        className="h-32 w-full sm:w-48 object-cover rounded-md border border-border shadow-sm"
                      />
                      <div className="flex-1 space-y-1 text-center sm:text-left">
                        <h3 className="font-bold text-lg text-foreground">
                          {v.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {v.year} • {v.mileage}km
                        </p>
                        <p className="text-primary font-bold text-xl mt-2">
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(v.price)}
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 2: Images */}
        {selectedVehicleId && (() => {
          const v = vehicles.find((x) => x.id === selectedVehicleId);
          if (!v || !v.images?.length) return null;
          return (
            <Card className="bg-card border-border shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-foreground">
                  2. Fotos do Veículo
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    ({v.images.length} {v.images.length === 1 ? "foto" : "fotos"})
                  </span>
                </CardTitle>
                <Button
                  size="sm"
                  className="gap-2 shrink-0"
                  onClick={() => downloadAllImages(v.images, v.title)}
                >
                  <ImageDown className="h-4 w-4" /> Baixar Todas
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {v.images.map((url, idx) => (
                    <div key={idx} className="relative group rounded-lg overflow-hidden border border-border bg-muted aspect-square">
                      <img
                        src={url}
                        alt={`Foto ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="gap-1.5 text-xs font-medium"
                          onClick={() => downloadImage(url, idx, v.title)}
                        >
                          <Download className="h-3.5 w-3.5" /> Baixar
                        </Button>
                      </div>
                      <span className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                        {idx + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })()}

        {/* Step 3: Copy Editor */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-foreground">3. Revisar Copy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <textarea
              className="flex min-h-[300px] w-full rounded-md border border-input bg-background px-4 py-4 text-sm font-mono leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-foreground shadow-sm resize-y"
              value={adText}
              onChange={(e) => setAdText(e.target.value)}
              placeholder="Selecione um veículo acima para gerar o texto automático..."
            />

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleCopy}
                className="flex-1 gap-2 border-input text-foreground hover:bg-muted"
                disabled={!adText}
              >
                {copied ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copied ? "Copiado!" : "Copiar Texto"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Step 4: Actions */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-foreground">4. Compartilhar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleWhatsAppShare}
              disabled={!adText}
              className="h-14 w-full bg-[#25D366] hover:bg-[#20bd5a] text-black font-bold gap-3 text-base shadow-md"
            >
              <MessageCircle className="h-5 w-5" /> Enviar via WhatsApp
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Copie o texto acima e cole manualmente no Instagram, Facebook ou
              OLX.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminPageContainer>
  );
}
