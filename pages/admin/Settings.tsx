import {
  Clock,
  Globe,
  Image,
  Palette,
  Save,
  Smartphone,
  Store,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  AdminPageContainer,
  AdminPageHeader,
} from "../../components/AdminPageComponents";
import { useSettings } from "../../components/SettingsProvider";
import SingleImageUpload from "../../components/SingleImageUpload";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Skeleton,
} from "../../components/ui/core";
import { getSettings, saveSettings } from "../../services/settingsService";
import { AppSettings } from "../../types";

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings();
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Buscar configurações do Supabase ao carregar
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const dbSettings = await getSettings();
        setFormData(dbSettings);
      } catch (error) {
        console.error("Erro ao carregar configurações:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    // Cast to unknown then AppSettings to allow dynamic assignment of literal types
    setFormData(
      (prev) => ({ ...prev, [name]: value } as unknown as AppSettings)
    );
    setSaved(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Salvar no Supabase
      await saveSettings(formData);

      // Atualizar contexto local
      updateSettings(formData);

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      alert("Erro ao salvar configurações. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminPageContainer>
      <AdminPageHeader
        title="Configurações Gerais"
        description="Personalize as informações e a aparência da loja."
      />

      {loading && (
        <div className="mb-4 p-4 bg-muted/30 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground animate-pulse">
            Carregando configurações...
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Store className="h-5 w-5 text-primary" /> Identidade da Loja
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nome da Loja</Label>
              {loading ? (
                <Skeleton className="h-11 w-full" />
              ) : (
                <Input
                  name="storeName"
                  value={formData.storeName || ""}
                  onChange={handleInputChange}
                  className="bg-background text-foreground"
                />
              )}
            </div>
            <div className="space-y-2">
              <Label>Endereço Completo</Label>
              {loading ? (
                <Skeleton className="h-11 w-full" />
              ) : (
                <Input
                  name="address"
                  value={formData.address || ""}
                  onChange={handleInputChange}
                  className="bg-background text-foreground"
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Logos and Favicon */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Image className="h-5 w-5 text-primary" /> Logos e Favicon
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>Logo - Tema Claro (Fundo Claro)</Label>
                  <Skeleton className="h-32 w-full max-w-xs" />
                </div>
                <div className="space-y-2">
                  <Label>Logo - Tema Escuro (Fundo Escuro)</Label>
                  <Skeleton className="h-32 w-full max-w-xs" />
                </div>
                <div className="space-y-2">
                  <Label>Favicon (Ícone do Site)</Label>
                  <Skeleton className="h-32 w-full max-w-xs" />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>Logo - Tema Claro (Fundo Claro)</Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Versão escura do logo para usar em fundos claros
                  </p>
                  <SingleImageUpload
                    image={formData.logoLight}
                    onChange={(url) => {
                      setFormData((prev) => ({ ...prev, logoLight: url }));
                      setSaved(false);
                    }}
                    label="Logo Light"
                    folder="settings"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Logo - Tema Escuro (Fundo Escuro)</Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Versão clara do logo para usar em fundos escuros
                  </p>
                  <SingleImageUpload
                    image={formData.logoDark}
                    onChange={(url) => {
                      setFormData((prev) => ({ ...prev, logoDark: url }));
                      setSaved(false);
                    }}
                    label="Logo Dark"
                    folder="settings"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Favicon (Ícone do Site)</Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Ícone quadrado que aparece na aba do navegador
                  </p>
                  <SingleImageUpload
                    image={formData.favicon}
                    onChange={(url) => {
                      setFormData((prev) => ({ ...prev, favicon: url }));
                      setSaved(false);
                    }}
                    label="Favicon"
                    folder="settings"
                  />
                </div>
              </div>
            )}

            <div className="p-4 bg-muted/30 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground">
                <strong>Dica:</strong> Para melhores resultados, use imagens PNG
                com fundo transparente. A logo Light deve ter elementos escuros,
                e a Logo Dark deve ter elementos claros.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Colors & Appearance */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Palette className="h-5 w-5 text-primary" /> Personalização de
              Cores e Tema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Primary */}
              <div className="space-y-2">
                <Label>Cor Primária (Destaques)</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    name="primaryColor"
                    value={formData.primaryColor || "#ff0000"}
                    onChange={handleInputChange}
                    className="w-12 h-11 p-1 bg-card border-input"
                  />
                  <Input
                    name="primaryColor"
                    value={formData.primaryColor || ""}
                    onChange={handleInputChange}
                    className="bg-background text-foreground"
                  />
                </div>
              </div>

              {/* Secondary */}
              <div className="space-y-2">
                <Label>Cor Secundária (Fundos/Detalhes)</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    name="secondaryColor"
                    value={formData.secondaryColor || "#1f2937"}
                    onChange={handleInputChange}
                    className="w-12 h-11 p-1 bg-card border-input"
                  />
                  <Input
                    name="secondaryColor"
                    value={formData.secondaryColor || ""}
                    onChange={handleInputChange}
                    className="bg-background text-foreground"
                  />
                </div>
              </div>

              {/* WhatsApp */}
              <div className="space-y-2">
                <Label>Cor do Botão WhatsApp</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    name="whatsappColor"
                    value={formData.whatsappColor || "#25D366"}
                    onChange={handleInputChange}
                    className="w-12 h-11 p-1 bg-card border-input"
                  />
                  <Input
                    name="whatsappColor"
                    value={formData.whatsappColor || ""}
                    onChange={handleInputChange}
                    placeholder="#25D366"
                    className="bg-background text-foreground"
                  />
                </div>
              </div>

              {/* Navbar */}
              <div className="space-y-2">
                <Label>Fundo do Menu Superior (Site)</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    name="navbarColor"
                    value={formData.navbarColor || "#000000"}
                    onChange={handleInputChange}
                    className="w-12 h-11 p-1 bg-card border-input"
                  />
                  <Input
                    name="navbarColor"
                    value={formData.navbarColor || ""}
                    onChange={handleInputChange}
                    placeholder="Vazio = Padrão (Blur)"
                    className="bg-background text-foreground"
                  />
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-2">
                <Label>Fundo do Menu Lateral (Admin)</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    name="sidebarColor"
                    value={formData.sidebarColor || "#000000"}
                    onChange={handleInputChange}
                    className="w-12 h-11 p-1 bg-card border-input"
                  />
                  <Input
                    name="sidebarColor"
                    value={formData.sidebarColor || ""}
                    onChange={handleInputChange}
                    placeholder="Vazio = Padrão"
                    className="bg-background text-foreground"
                  />
                </div>
              </div>

              {/* Theme Default */}
              <div className="space-y-2">
                <Label>Tema Padrão do Site</Label>
                <select
                  name="defaultTheme"
                  value={formData.defaultTheme || "dark"}
                  onChange={handleInputChange}
                  className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary"
                >
                  <option value="dark">Escuro (Dark Mode)</option>
                  <option value="light">Claro (Light Mode)</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Smartphone className="h-5 w-5 text-primary" /> Contato
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Telefone Principal (WhatsApp)</Label>
                <Input
                  name="phonePrimary"
                  value={formData.phonePrimary || ""}
                  onChange={handleInputChange}
                  className="bg-background text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label>Telefone Secundário</Label>
                <Input
                  name="phoneSecondary"
                  value={formData.phoneSecondary || ""}
                  onChange={handleInputChange}
                  className="bg-background text-foreground"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email de Contato</Label>
              <Input
                name="emailContact"
                value={formData.emailContact || ""}
                onChange={handleInputChange}
                className="bg-background text-foreground"
              />
            </div>
          </CardContent>
        </Card>

        {/* Hours */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Clock className="h-5 w-5 text-primary" /> Horário de
              Funcionamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Dias de Semana</Label>
                <Input
                  name="openingHoursWeekdays"
                  value={formData.openingHoursWeekdays || ""}
                  onChange={handleInputChange}
                  placeholder="Seg - Sex: 09h às 18h"
                  className="bg-background text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label>Fim de Semana</Label>
                <Input
                  name="openingHoursWeekend"
                  value={formData.openingHoursWeekend || ""}
                  onChange={handleInputChange}
                  placeholder="Sáb: 09h às 13h"
                  className="bg-background text-foreground"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social & Integrations */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Globe className="h-5 w-5 text-primary" /> Redes Sociais e
              Integrações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Instagram URL</Label>
                <Input
                  name="socialInstagram"
                  value={formData.socialInstagram || ""}
                  onChange={handleInputChange}
                  className="bg-background text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label>Facebook URL</Label>
                <Input
                  name="socialFacebook"
                  value={formData.socialFacebook || ""}
                  onChange={handleInputChange}
                  className="bg-background text-foreground"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Google Maps URL (Embed)</Label>
              <Input
                name="googleMapsUrl"
                value={formData.googleMapsUrl || ""}
                onChange={handleInputChange}
                className="bg-background text-foreground"
                placeholder="https://..."
              />
            </div>
          </CardContent>
        </Card>

        <div className="sticky bottom-4 z-10 flex justify-end">
          <Button
            type="submit"
            size="lg"
            className="shadow-xl gap-2 font-bold min-w-[200px]"
            disabled={saved || isSaving}
          >
            {saved ? (
              <>
                <span className="animate-pulse">Salvo!</span>
              </>
            ) : isSaving ? (
              <>
                <span className="animate-pulse">Salvando...</span>
              </>
            ) : (
              <>
                <Save className="h-5 w-5" /> Salvar Alterações
              </>
            )}
          </Button>
        </div>
      </form>
    </AdminPageContainer>
  );
}
