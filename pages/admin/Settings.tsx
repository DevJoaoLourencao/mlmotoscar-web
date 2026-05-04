import {
  Clock,
  Eye,
  EyeOff,
  Globe,
  Image,
  Palette,
  Pencil,
  Plus,
  Save,
  Smartphone,
  Star,
  Store,
  Trash2,
  UserCheck,
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
import {
  createReview,
  deleteReview,
  getReviews,
  updateReview,
} from "../../services/reviewsService";
import { AppSettings, Review } from "../../types";

const EMPTY_REVIEW = { name: "", rating: 5, text: "", active: true };

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`h-5 w-5 cursor-pointer ${s <= value ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
          onClick={() => onChange(s)}
        />
      ))}
    </div>
  );
}

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings();
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewForm, setReviewForm] = useState(EMPTY_REVIEW);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [savingReview, setSavingReview] = useState(false);

  const loadReviews = async () => { setReviews(await getReviews()); };

  const openNewReview = () => { setEditingReviewId(null); setReviewForm(EMPTY_REVIEW); setShowReviewForm(true); };
  const openEditReview = (r: Review) => { setEditingReviewId(r.id); setReviewForm({ name: r.name, rating: r.rating, text: r.text, active: r.active }); setShowReviewForm(true); };

  const handleSaveReview = async () => {
    if (!reviewForm.name.trim() || !reviewForm.text.trim()) return;
    setSavingReview(true);
    try {
      if (editingReviewId) await updateReview(editingReviewId, reviewForm);
      else await createReview(reviewForm);
      setShowReviewForm(false);
      await loadReviews();
    } finally { setSavingReview(false); }
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm("Excluir este depoimento?")) return;
    await deleteReview(id);
    await loadReviews();
  };

  const handleToggleReview = async (r: Review) => {
    await updateReview(r.id, { active: !r.active });
    await loadReviews();
  };

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
    loadReviews();
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cidade</Label>
                {loading ? (
                  <Skeleton className="h-11 w-full" />
                ) : (
                  <Input
                    name="city"
                    value={formData.city || ""}
                    onChange={handleInputChange}
                    placeholder="Ex: São Paulo"
                    className="bg-background text-foreground"
                  />
                )}
              </div>
              <div className="space-y-2">
                <Label>Estado (UF)</Label>
                {loading ? (
                  <Skeleton className="h-11 w-full" />
                ) : (
                  <Input
                    name="state"
                    value={formData.state || ""}
                    onChange={handleInputChange}
                    placeholder="Ex: SP"
                    maxLength={2}
                    className="bg-background text-foreground uppercase"
                  />
                )}
              </div>
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
                <Label>Nome — Telefone Principal</Label>
                <Input
                  name="phonePrimaryName"
                  value={formData.phonePrimaryName || ""}
                  onChange={handleInputChange}
                  placeholder="Ex: Wagner Lourenção"
                  className="bg-background text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label>Nome — Telefone Secundário</Label>
                <Input
                  name="phoneSecondaryName"
                  value={formData.phoneSecondaryName || ""}
                  onChange={handleInputChange}
                  placeholder="Ex: João Lourenção"
                  className="bg-background text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label>Telefone Principal (WhatsApp)</Label>
                <Input
                  name="phonePrimary"
                  value={formData.phonePrimary || ""}
                  onChange={handleInputChange}
                  placeholder="(00) 00000-0000"
                  className="bg-background text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label>Telefone Secundário</Label>
                <Input
                  name="phoneSecondary"
                  value={formData.phoneSecondary || ""}
                  onChange={handleInputChange}
                  placeholder="(00) 00000-0000"
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
            <div className="space-y-2">
              <Label>Google Reviews URL</Label>
              <Input
                name="googleReviewsUrl"
                value={formData.googleReviewsUrl || ""}
                onChange={handleInputChange}
                className="bg-background text-foreground"
                placeholder="https://g.page/r/..."
              />
              <p className="text-xs text-muted-foreground">Link para a página de avaliações da loja no Google. Exibido no botão "Ver todas as avaliações".</p>
            </div>
            <div className="space-y-2">
              <Label>Google Escrever Avaliação URL</Label>
              <Input
                name="googleWriteReviewUrl"
                value={formData.googleWriteReviewUrl || ""}
                onChange={handleInputChange}
                className="bg-background text-foreground"
                placeholder="https://g.page/r/.../review"
              />
              <p className="text-xs text-muted-foreground">Link direto para escrever uma avaliação no Google. Exibido no botão "Avaliar no Google".</p>
            </div>
          </CardContent>
        </Card>

        {/* Seller Info */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <UserCheck className="h-5 w-5 text-primary" /> Dados do Vendedor (para Contratos)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground">Esses dados são usados para pré-preencher a seção de Vendedor ao gerar contratos.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome Completo</Label>
                <Input name="sellerName" value={formData.sellerName || ""} onChange={handleInputChange} placeholder="Nome completo do vendedor" className="bg-background text-foreground" />
              </div>
              <div className="space-y-2">
                <Label>RG</Label>
                <Input name="sellerRg" value={formData.sellerRg || ""} onChange={handleInputChange} placeholder="Ex: 6.181.046 SSP/SC" className="bg-background text-foreground" />
              </div>
              <div className="space-y-2">
                <Label>CPF</Label>
                <Input name="sellerCpf" value={formData.sellerCpf || ""} onChange={handleInputChange} placeholder="000.000.000-00" className="bg-background text-foreground" />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input name="sellerPhone" value={formData.sellerPhone || ""} onChange={handleInputChange} placeholder="(00) 00000-0000" className="bg-background text-foreground" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Endereço (Rua, número, bairro)</Label>
              <Input name="sellerAddress" value={formData.sellerAddress || ""} onChange={handleInputChange} placeholder="Rua Felipe Camarão, 113, Lorenzetti" className="bg-background text-foreground" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>CEP</Label>
                <Input name="sellerCep" value={formData.sellerCep || ""} onChange={handleInputChange} placeholder="00000-000" className="bg-background text-foreground" />
              </div>
              <div className="space-y-2">
                <Label>Cidade</Label>
                <Input name="sellerCity" value={formData.sellerCity || ""} onChange={handleInputChange} placeholder="Marília" className="bg-background text-foreground" />
              </div>
              <div className="space-y-2">
                <Label>Estado (UF)</Label>
                <Input name="sellerState" value={formData.sellerState || ""} onChange={handleInputChange} placeholder="SP" maxLength={2} className="bg-background text-foreground uppercase" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reviews */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Star className="h-5 w-5 text-primary" /> Depoimentos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">Gerencie os depoimentos exibidos na página inicial.</p>
              <Button size="sm" onClick={openNewReview} className="gap-2 shrink-0">
                <Plus className="h-4 w-4" /> Novo
              </Button>
            </div>

            {showReviewForm && (
              <div className="border border-border rounded-lg p-4 space-y-3 bg-muted/30">
                <h4 className="font-semibold text-sm text-foreground">{editingReviewId ? "Editar" : "Novo"} Depoimento</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Nome do cliente</Label>
                    <Input value={reviewForm.name} onChange={(e) => setReviewForm((p) => ({ ...p, name: e.target.value }))} placeholder="Ex: Maria Silva" className="bg-background h-9" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Avaliação</Label>
                    <StarPicker value={reviewForm.rating} onChange={(v) => setReviewForm((p) => ({ ...p, rating: v }))} />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Depoimento</Label>
                  <textarea
                    value={reviewForm.text}
                    onChange={(e) => setReviewForm((p) => ({ ...p, text: e.target.value }))}
                    placeholder="Escreva o depoimento..."
                    rows={3}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="rev-active" checked={reviewForm.active} onChange={(e) => setReviewForm((p) => ({ ...p, active: e.target.checked }))} className="h-4 w-4 accent-primary" />
                  <Label htmlFor="rev-active" className="text-xs cursor-pointer">Exibir no site</Label>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSaveReview} disabled={savingReview || !reviewForm.name.trim() || !reviewForm.text.trim()}>
                    {savingReview ? "Salvando..." : "Salvar"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowReviewForm(false)}>Cancelar</Button>
                </div>
              </div>
            )}

            {reviews.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Nenhum depoimento cadastrado.</p>
            ) : (
              <div className="space-y-2">
                {reviews.map((r) => (
                  <div key={r.id} className={`flex items-start gap-3 p-3 rounded-lg border border-border ${!r.active ? "opacity-50" : ""}`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-foreground">{r.name}</span>
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map((s) => <Star key={s} className={`h-3 w-3 ${s <= r.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} />)}
                        </div>
                        {!r.active && <span className="text-xs text-muted-foreground border border-border rounded px-1.5">Oculto</span>}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{r.text}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleToggleReview(r)} title={r.active ? "Ocultar" : "Exibir"}>
                        {r.active ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEditReview(r)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDeleteReview(r.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
