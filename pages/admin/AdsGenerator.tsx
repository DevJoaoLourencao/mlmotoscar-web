import React, { useEffect, useState } from 'react';
import { Facebook, Instagram, Share2, Copy, CheckCircle } from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent, Label } from '../../components/ui/core';
import { AdminPageContainer, AdminPageHeader } from '../../components/AdminPageComponents';
import { Combobox } from '../../components/ui/combobox';
import { Vehicle } from '../../types';
import { getVehicles } from '../../services/vehicleService';
import { useSettings } from '../../components/SettingsProvider';

export default function AdsGenerator() {
  const { settings } = useSettings();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [adText, setAdText] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getVehicles().then((data) => {
      // Filtrar apenas veículos disponíveis
      const availableVehicles = data.filter(
        (v) => !v.status || v.status === "available"
      );
      setVehicles(availableVehicles);
    });
  }, []);

  const handleVehicleSelect = (id: string) => {
    setSelectedVehicleId(id);
    const vehicle = vehicles.find(v => v.id === id);
    if (vehicle) {
      generateCopy(vehicle);
    }
  };

  const generateCopy = (v: Vehicle) => {
    const priceFormatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v.price);
    
    const template = `🔥 NOVIDADE NO ESTOQUE ${settings.storeName.toUpperCase()} 🔥

🚗 ${v.title.toUpperCase()}
📅 Ano: ${v.year}
🏁 Quilometragem: ${v.mileage.toLocaleString()} km

💰 PREÇO ESPECIAL: ${priceFormatted}

✅ ${v.description}
✅ Garantia de procedência
✅ Aceitamos seu usado na troca
✅ Financiamento com as melhores taxas

📍 Venha nos visitar: ${settings.address}
📲 WhatsApp: ${settings.phonePrimary} (${settings.phonePrimaryName})

#mlmotoscar #vendas #${v.type} #${v.title.replace(/\s/g, '').toLowerCase()} #oportunidade`;
    
    setAdText(template);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(adText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSocialPost = (platform: 'facebook' | 'instagram' | 'olx') => {
    if (!selectedVehicleId) return;
    alert(`Iniciando integração automática com ${platform.toUpperCase()}...\n\n(Esta é uma simulação. Na versão completa, isso conectaria à API do ${platform}).`);
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
            <CardTitle className="text-foreground">1. Selecione o Veículo</CardTitle>
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
                  const v = vehicles.find(x => x.id === selectedVehicleId);
                  if(!v) return null;
                  return (
                    <>
                      <img src={v.images?.[0]} alt={v.title} className="h-32 w-full sm:w-48 object-cover rounded-md border border-border shadow-sm" />
                      <div className="flex-1 space-y-1 text-center sm:text-left">
                        <h3 className="font-bold text-lg text-foreground">{v.title}</h3>
                        <p className="text-sm text-muted-foreground">{v.year} • {v.mileage}km</p>
                        <p className="text-primary font-bold text-xl mt-2">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v.price)}
                        </p>
                      </div>
                    </>
                  )
                })()}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 2: Copy Editor */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-foreground">2. Revisar Copy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <textarea 
              className="flex min-h-[300px] w-full rounded-md border border-input bg-background px-4 py-4 text-sm font-mono leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-foreground shadow-sm resize-y"
              value={adText}
              onChange={(e) => setAdText(e.target.value)}
              placeholder="Selecione um veículo acima para gerar o texto automático..."
            />
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCopy} className="flex-1 gap-2 border-input text-foreground hover:bg-muted" disabled={!adText}>
                {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copiado!' : 'Copiar Texto'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Step 3: Actions */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-foreground">3. Publicar Automaticamente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                onClick={() => handleSocialPost('facebook')} 
                disabled={!selectedVehicleId}
                className="h-16 bg-[#1877F2] hover:bg-[#1877F2]/90 text-white gap-3 text-lg font-semibold shadow-md"
              >
                <Facebook className="h-6 w-6" /> Facebook Ads
              </Button>
              
              <Button 
                onClick={() => handleSocialPost('instagram')}
                disabled={!selectedVehicleId} 
                className="h-16 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-90 text-white gap-3 text-lg font-semibold shadow-md"
              >
                <Instagram className="h-6 w-6" /> Instagram Feed
              </Button>

              <Button 
                onClick={() => handleSocialPost('olx')}
                disabled={!selectedVehicleId} 
                className="h-16 bg-[#6E0AD6] hover:bg-[#6E0AD6]/90 text-white gap-3 text-lg font-semibold shadow-md"
              >
                <Share2 className="h-6 w-6" /> Publicar na OLX
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-4 text-center">
              * A integração requer configuração das chaves de API nas configurações do sistema.
            </p>
          </CardContent>
        </Card>

      </div>
    </AdminPageContainer>
  );
}
