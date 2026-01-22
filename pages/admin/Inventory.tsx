import {
  AlertTriangle,
  Car,
  CheckCircle,
  Copy,
  CreditCard,
  Edit,
  Eye,
  FileText,
  Filter,
  MoreVertical,
  Plus,
  Search,
  Share2,
  Trash2,
  User,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AdminPageContainer,
  AdminPageHeader,
} from "../../components/AdminPageComponents";
import ImageUpload from "../../components/ImageUpload";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Combobox } from "../../components/ui/combobox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Skeleton } from "../../components/ui/skeleton";
import { Textarea } from "../../components/ui/textarea";
import { cn } from "../../lib/utils";
import { getBrands, getModels } from "../../services/brandService";
import { getSaleByVehicleId } from "../../services/salesService";
import {
  createVehicle,
  deleteVehicle,
  getVehicles,
  updateVehicle,
} from "../../services/vehicleService";
import { Brand, Model, PaymentDetails, Sale, Vehicle } from "../../types";
import { validateVehicle } from "../../validations/vehicleSchema";

export default function Inventory() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Filters
  const [priceFilter, setPriceFilter] = useState<"all" | "8k" | "10k" | "15k">(
    "all"
  );
  const [typeFilter, setTypeFilter] = useState<"all" | "carro" | "moto">("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "available" | "sold"
  >("available");

  // Delete Modal State
  const [vehicleToDelete, setVehicleToDelete] = useState<string | null>(null);

  // Sale Details Modal State
  const [isSaleDetailsModalOpen, setIsSaleDetailsModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [loadingSaleDetails, setLoadingSaleDetails] = useState(false);

  // Vehicle Details Modal State
  const [isVehicleDetailsModalOpen, setIsVehicleDetailsModalOpen] =
    useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Vehicle>>({
    type: "carro",
    brand_id: "",
    model_id: "",
    brand: "",
    model: "",
    price: 0,
    year: new Date().getFullYear(),
    mileage: 0,
    color: "",
    description: "",
    images: [],
    plate_end: "",
    status: "available",
  });
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // Brands and Models State
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);

  // Cores pré-definidas
  const colorOptions = [
    { value: "Preto", label: "Preto" },
    { value: "Branco", label: "Branco" },
    { value: "Prata", label: "Prata" },
    { value: "Cinza", label: "Cinza" },
    { value: "Vermelho", label: "Vermelho" },
    { value: "Azul", label: "Azul" },
    { value: "Verde", label: "Verde" },
    { value: "Amarelo", label: "Amarelo" },
    { value: "Laranja", label: "Laranja" },
    { value: "Marrom", label: "Marrom" },
    { value: "Bege", label: "Bege" },
    { value: "Dourado", label: "Dourado" },
    { value: "Roxo", label: "Roxo" },
    { value: "Rosa", label: "Rosa" },
  ];

  const loadData = () => {
    setLoading(true);
    getVehicles().then((data) => {
      setVehicles(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  // Recarregar marcas quando o tipo mudar
  useEffect(() => {
    if (isModalOpen) {
      loadBrands();
    }
  }, [formData.type, isModalOpen]);

  // Carregar marcas baseado no tipo
  const loadBrands = async () => {
    setLoadingBrands(true);
    try {
      const data = await getBrands(formData.type as "carro" | "moto");
      setBrands(data);
    } catch (error) {
      console.error("Erro ao carregar marcas:", error);
    } finally {
      setLoadingBrands(false);
    }
  };

  // Carregar modelos quando marca for selecionada
  const loadModels = async (
    brandId: string,
    vehicleType?: "carro" | "moto"
  ) => {
    if (!brandId) {
      setModels([]);
      return;
    }
    setLoadingModels(true);
    try {
      const type = vehicleType || formData.type;
      const data = await getModels(brandId, type as "carro" | "moto");
      setModels(data);
    } catch (error) {
      console.error("Erro ao carregar modelos:", error);
    } finally {
      setLoadingModels(false);
    }
  };

  // Gerar título automaticamente
  const generateTitle = (
    brand: string,
    model: string,
    year: number
  ): string => {
    return `${brand} ${model} ${year}`.trim();
  };

  const handleSellVehicle = (vehicleId: string) => {
    navigate("/admin/vendas", { state: { preSelectedVehicleId: vehicleId } });
  };

  const handleMarkAvailable = async (vehicleId: string) => {
    try {
      await updateVehicle(vehicleId, { status: "available" });
      loadData();
    } catch (error) {
      console.error("Erro ao marcar veículo como disponível:", error);
      alert("Erro ao marcar veículo como disponível.");
    }
  };

  const handleViewSaleDetails = async (vehicleId: string) => {
    setLoadingSaleDetails(true);
    setIsSaleDetailsModalOpen(true);
    try {
      const sale = await getSaleByVehicleId(vehicleId);
      setSelectedSale(sale);
    } catch (error) {
      console.error("Erro ao buscar detalhes da venda:", error);
      alert("Erro ao buscar detalhes da venda.");
    } finally {
      setLoadingSaleDetails(false);
    }
  };

  const handleViewVehicleDetails = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsVehicleDetailsModalOpen(true);
  };

  const formatPaymentCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getMethodBadge = (method: string) => {
    const styles: any = {
      cash: {
        label: "A Vista",
        class: "bg-green-500/10 text-green-600 border-green-200",
      },
      financing: {
        label: "Financiado",
        class: "bg-blue-500/10 text-blue-600 border-blue-200",
      },
      trade_in: {
        label: "Troca",
        class: "bg-orange-500/10 text-orange-600 border-orange-200",
      },
      promissory: {
        label: "Promissória",
        class: "bg-purple-500/10 text-purple-600 border-purple-200",
      },
    };
    const style = styles[method] || { label: method, class: "bg-gray-100" };
    return (
      <Badge variant="outline" className={style.class}>
        {style.label}
      </Badge>
    );
  };

  const renderPaymentDetails = (payment: PaymentDetails) => {
    switch (payment.method) {
      case "cash":
        return (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Valor Total:</span>
              <span className="font-bold">
                {formatPaymentCurrency(payment.total_value)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Pagamento integral via Dinheiro, PIX ou Transferência.
            </p>
          </div>
        );
      case "financing":
        return (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Valor Total:</span>
              <span className="font-bold">
                {formatPaymentCurrency(payment.total_value)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Entrada:</span>
              <span>{formatPaymentCurrency(payment.down_payment || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Valor Financiado:</span>
              <span>{formatPaymentCurrency(payment.financed_amount || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Banco:</span>
              <span>{payment.bank_name || "N/A"}</span>
            </div>
          </div>
        );
      case "trade_in":
        return (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Valor Total:</span>
              <span className="font-bold">
                {formatPaymentCurrency(payment.total_value)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Veículo na Troca:</span>
              <span>{payment.trade_in_vehicle || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Valor da Troca:</span>
              <span>{formatPaymentCurrency(payment.trade_in_value || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Saldo a Pagar:</span>
              <span className="font-bold">
                {formatPaymentCurrency(
                  payment.total_value - (payment.trade_in_value || 0)
                )}
              </span>
            </div>
          </div>
        );
      case "promissory":
        return (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Valor Total:</span>
              <span className="font-bold">
                {formatPaymentCurrency(payment.total_value)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Entrada:</span>
              <span>{formatPaymentCurrency(payment.entry_value || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Valor a Parcelar:</span>
              <span>
                {formatPaymentCurrency(
                  payment.total_value - (payment.entry_value || 0)
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Qtd. Parcelas:</span>
              <span>{payment.installment_count || 0}x</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Valor da Parcela:</span>
              <span className="font-bold">
                {formatPaymentCurrency(payment.installment_value || 0)}
              </span>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const confirmDelete = async () => {
    if (vehicleToDelete) {
      await deleteVehicle(vehicleToDelete);
      setVehicleToDelete(null);
      loadData();
    }
  };

  const handleSellAndClose = () => {
    if (vehicleToDelete) {
      handleSellVehicle(vehicleToDelete);
      setVehicleToDelete(null);
    }
  };

  const openNewModal = () => {
    setEditingId(null);
    setValidationErrors({});
    setModels([]);
    setFormData({
      type: "carro",
      brand_id: "",
      model_id: "",
      brand: "",
      model: "",
      price: 0,
      year: new Date().getFullYear(),
      mileage: undefined,
      color: "",
      description: "",
      images: [],
      plate_end: "",
    });
    loadBrands();
    setIsModalOpen(true);
  };

  const openEditModal = async (vehicle: Vehicle) => {
    setEditingId(vehicle.id);
    setValidationErrors({});

    setFormData({
      type: vehicle.type,
      brand_id: vehicle.brand_id || "",
      model_id: vehicle.model_id || "",
      brand: vehicle.brand || "",
      model: vehicle.model || "",
      price: vehicle.price,
      year: vehicle.year,
      mileage: vehicle.mileage,
      color: vehicle.color || "",
      description: vehicle.description,
      images: vehicle.images || [],
      plate_end: vehicle.plate_end || "",
    });

    // Carregar marcas baseado no tipo do veículo
    setLoadingBrands(true);
    try {
      const brandsData = await getBrands(vehicle.type as "carro" | "moto");
      setBrands(brandsData);
    } catch (error) {
      console.error("Erro ao carregar marcas:", error);
    } finally {
      setLoadingBrands(false);
    }

    // Se tiver brand_id, carregar modelos baseado no tipo
    if (vehicle.brand_id) {
      await loadModels(vehicle.brand_id, vehicle.type as "carro" | "moto");
    }

    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Limpar erros anteriores
    setValidationErrors({});

    // Preparar dados para validação (garantir que valores vazios sejam undefined)
    const dataToValidate = {
      ...formData,
      brand_id:
        formData.brand_id && formData.brand_id.trim() !== ""
          ? formData.brand_id
          : undefined,
      model_id:
        formData.model_id && formData.model_id.trim() !== ""
          ? formData.model_id
          : undefined,
      price: formData.price && formData.price > 0 ? formData.price : undefined,
      year: formData.year && formData.year > 0 ? formData.year : undefined,
      mileage:
        formData.mileage !== undefined && formData.mileage >= 0
          ? formData.mileage
          : undefined,
      images:
        formData.images && formData.images.length > 0 ? formData.images : [],
      status: "available",
    };

    // Validar com Yup
    const { isValid, errors } = await validateVehicle(dataToValidate);

    if (!isValid) {
      setValidationErrors(errors);

      // Rolar para o topo do modal para ver os erros
      setTimeout(() => {
        const modalContent = document.querySelector('[role="dialog"]');
        if (modalContent) {
          modalContent.scrollTop = 0;
        }
      }, 100);

      return;
    }

    try {
      // Gerar título automaticamente antes de salvar
      const titleToSave = generateTitle(
        formData.brand || "",
        formData.model || "",
        formData.year || new Date().getFullYear()
      );

      const vehicleData = {
        ...formData,
        title: titleToSave,
        status: editingId ? formData.status : "available",
      };

      if (editingId) {
        await updateVehicle(editingId, vehicleData);
      } else {
        await createVehicle(vehicleData as any);
      }

      setIsModalOpen(false);
      setValidationErrors({});
      loadData();
    } catch (error) {
      console.error("Erro ao salvar veículo:", error);
      alert("Erro ao salvar veículo. Tente novamente.");
    }
  };

  const handleInputChange = async (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    // Limpar erro do campo quando o usuário começar a digitar
    if (validationErrors[name]) {
      const newErrors = { ...validationErrors };
      delete newErrors[name];
      setValidationErrors(newErrors);
    }

    // Se o tipo mudar, recarregar marcas
    if (name === "type") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        brand_id: "",
        model_id: "",
        brand: "",
        model: "",
      }));
      setModels([]);
      await loadBrands();
      return;
    }

    // Se a marca mudar, carregar modelos e limpar modelo selecionado
    if (name === "brand_id") {
      const selectedBrand = brands.find((b) => b.id === value);
      setFormData((prev) => ({
        ...prev,
        brand_id: value,
        brand: selectedBrand?.name || "",
        model_id: "",
        model: "",
      }));
      setModels([]);
      if (value) {
        await loadModels(value, formData.type as "carro" | "moto");
      }
      return;
    }

    // Se o modelo mudar, atualizar nome do modelo
    if (name === "model_id") {
      const selectedModel = models.find((m) => m.id === value);
      setFormData((prev) => ({
        ...prev,
        model_id: value,
        model: selectedModel?.name || "",
      }));
      return;
    }

    setFormData((prev) => {
      const updatedData = {
        ...prev,
        [name]:
          name === "price" || name === "year" || name === "mileage"
            ? value === ""
              ? undefined
              : Number(value)
            : value,
      };

      // Gerar título automaticamente quando brand, model ou year mudarem
      if (name === "year" && updatedData.brand && updatedData.model) {
        updatedData.title = generateTitle(
          updatedData.brand,
          updatedData.model,
          updatedData.year || new Date().getFullYear()
        );
      }

      return updatedData;
    });
  };

  // Função para formatar preço em reais
  const formatCurrency = (value: number | undefined): string => {
    if (!value || value === 0) return "";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Função para converter valor formatado para número
  const parseCurrency = (value: string): number => {
    const numbers = value.replace(/\D/g, "");
    if (!numbers) return 0;
    return parseInt(numbers, 10) / 100;
  };

  // Handler específico para preço com máscara
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const numericValue = parseCurrency(inputValue);

    setFormData((prev) => ({
      ...prev,
      price: numericValue,
    }));

    // Limpar erro do campo
    if (validationErrors.price) {
      const newErrors = { ...validationErrors };
      delete newErrors.price;
      setValidationErrors(newErrors);
    }
  };

  // Filter Logic
  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch = v.title.toLowerCase().includes(search.toLowerCase());

    let matchesPrice = true;
    if (priceFilter === "8k") matchesPrice = v.price <= 8000;
    else if (priceFilter === "10k") matchesPrice = v.price <= 10000;
    else if (priceFilter === "15k") matchesPrice = v.price <= 15000;

    let matchesType = true;
    if (typeFilter !== "all") matchesType = v.type === typeFilter;

    let matchesStatus = true;
    const vStatus = v.status || "available";
    if (statusFilter !== "all") matchesStatus = vStatus === statusFilter;

    return matchesSearch && matchesPrice && matchesType && matchesStatus;
  });

  const handleShareList = () => {
    const header = `📋 *LISTA DE VEÍCULOS* 📋\n\n`;
    const body = filteredVehicles
      .map(
        (v) =>
          `🚗 *${v.title}* (${v.year})\n💰 ${new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(v.price)}\n`
      )
      .join("\n------------------\n");

    const fullText = header + body + `\n\n📍 Venha conferir!`;
    navigator.clipboard.writeText(fullText);
    alert("Lista copiada!");
  };

  const handleShareVehicle = (vehicle: Vehicle) => {
    const text = `🔥 *Oportunidade* 🔥\n\n🚗 ${vehicle.title}\n📅 Ano: ${
      vehicle.year
    }\n🏁 Km: ${vehicle.mileage}\n\n💰 *${new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(vehicle.price)}*\n\nMais informações no WhatsApp!`;
    navigator.clipboard.writeText(text);
    alert(`Anúncio do ${vehicle.title} copiado!`);
  };

  return (
    <AdminPageContainer>
      <AdminPageHeader
        title="Gerenciar Estoque"
        description="Controle total sobre os veículos anunciados."
        actions={
          <>
            <Button
              variant="outline"
              onClick={handleShareList}
              className="flex-1 md:flex-initial gap-2 border-primary/20 hover:bg-primary/5"
            >
              <Share2 className="h-4 w-4" /> Compartilhar Lista
            </Button>
            <Button
              onClick={openNewModal}
              className="flex-1 md:flex-initial gap-2 shadow-md"
            >
              <Plus className="h-4 w-4" /> Novo Veículo
            </Button>
          </>
        }
      />

      {/* Filtros */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader className="space-y-4">
          {/* Cabeçalho com busca */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CardTitle className="text-foreground">Veículos</CardTitle>
              <Badge variant="secondary" className="text-sm">
                {filteredVehicles.length}
              </Badge>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar veículo..."
                  className="pl-9 bg-background border-input text-foreground"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                    title="Ações em massa"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      setPriceFilter("all");
                      setTypeFilter("all");
                      setStatusFilter("all");
                    }}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Limpar todos os filtros
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Filtros organizados */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border/50">
            {/* Filtro de Preço */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Filter className="h-3.5 w-3.5" />
                <span>Preço</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={priceFilter === "all" ? "default" : "outline"}
                  className="cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => setPriceFilter("all")}
                >
                  Todos
                </Badge>
                <Badge
                  variant={priceFilter === "8k" ? "default" : "outline"}
                  className="cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => setPriceFilter("8k")}
                >
                  Até R$ 8k
                </Badge>
                <Badge
                  variant={priceFilter === "10k" ? "default" : "outline"}
                  className="cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => setPriceFilter("10k")}
                >
                  Até R$ 10k
                </Badge>
                <Badge
                  variant={priceFilter === "15k" ? "default" : "outline"}
                  className="cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => setPriceFilter("15k")}
                >
                  Até R$ 15k
                </Badge>
              </div>
            </div>

            {/* Filtro de Tipo */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Filter className="h-3.5 w-3.5" />
                <span>Categoria</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={typeFilter === "all" ? "default" : "outline"}
                  className="cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => setTypeFilter("all")}
                >
                  Todos
                </Badge>
                <Badge
                  variant={typeFilter === "carro" ? "default" : "outline"}
                  className="cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => setTypeFilter("carro")}
                >
                  🚗 Carros
                </Badge>
                <Badge
                  variant={typeFilter === "moto" ? "default" : "outline"}
                  className="cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => setTypeFilter("moto")}
                >
                  🏍️ Motos
                </Badge>
              </div>
            </div>

            {/* Filtro de Status */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Filter className="h-3.5 w-3.5" />
                <span>Status</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={statusFilter === "all" ? "default" : "outline"}
                  className="cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => setStatusFilter("all")}
                >
                  Todos
                </Badge>
                <Badge
                  className={cn(
                    "cursor-pointer hover:scale-105 transition-transform",
                    statusFilter === "available"
                      ? "bg-green-500 hover:bg-green-600 text-white border-green-500"
                      : "border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                  )}
                  variant={statusFilter === "available" ? "default" : "outline"}
                  onClick={() => setStatusFilter("available")}
                >
                  Disponível
                </Badge>
                <Badge
                  className={cn(
                    "cursor-pointer hover:scale-105 transition-transform",
                    statusFilter === "sold"
                      ? "bg-red-500 hover:bg-red-600 text-white border-red-500"
                      : "border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                  )}
                  variant={statusFilter === "sold" ? "default" : "outline"}
                  onClick={() => setStatusFilter("sold")}
                >
                  Vendido
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm text-left">
              <thead className="[&_tr]:border-b">
                <tr className="border-b border-border transition-colors hover:bg-muted/50">
                  <th className="h-12 px-4 align-middle font-semibold text-foreground/80 w-16">
                    Detalhes
                  </th>
                  <th className="h-12 px-4 align-middle font-semibold text-foreground/80">
                    Imagem
                  </th>
                  <th className="h-12 px-4 align-middle font-semibold text-foreground/80">
                    Título
                  </th>
                  <th className="h-12 px-4 align-middle font-semibold text-foreground/80">
                    Tipo
                  </th>
                  <th className="h-12 px-4 align-middle font-semibold text-foreground/80">
                    Status
                  </th>
                  <th className="h-12 px-4 align-middle font-semibold text-foreground/80">
                    Preço
                  </th>
                  <th className="h-12 px-4 align-middle font-semibold text-foreground/80 text-right">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {loading ? (
                  [1, 2, 3, 4].map((i) => (
                    <tr key={i} className="border-b border-border">
                      <td className="p-4">
                        <Skeleton className="h-8 w-8" />
                      </td>
                      <td className="p-4">
                        <Skeleton className="h-10 w-16" />
                      </td>
                      <td className="p-4">
                        <Skeleton className="h-6 w-32" />
                      </td>
                      <td className="p-4">
                        <Skeleton className="h-6 w-16" />
                      </td>
                      <td className="p-4">
                        <Skeleton className="h-6 w-20" />
                      </td>
                      <td className="p-4">
                        <Skeleton className="h-6 w-24" />
                      </td>
                      <td className="p-4 text-right">
                        <Skeleton className="h-8 w-8 ml-auto" />
                      </td>
                    </tr>
                  ))
                ) : filteredVehicles.length > 0 ? (
                  filteredVehicles.map((vehicle) => (
                    <tr
                      key={vehicle.id}
                      className="border-b border-border transition-colors hover:bg-muted/20"
                    >
                      <td className="p-4 align-middle">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewVehicleDetails(vehicle)}
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          title="Ver detalhes"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                      <td className="p-4 align-middle">
                        <img
                          src={vehicle.images?.[0]}
                          alt=""
                          className="h-10 w-16 md:h-12 md:w-20 object-cover rounded bg-muted border border-border"
                        />
                      </td>
                      <td className="p-4 align-middle font-medium text-foreground min-w-[150px]">
                        {vehicle.title}
                      </td>
                      <td className="p-4 align-middle capitalize text-muted-foreground">
                        {vehicle.type}
                      </td>
                      <td className="p-4 align-middle">
                        <Badge
                          variant="secondary"
                          className={`capitalize ${
                            vehicle.status === "sold"
                              ? "bg-red-500/10 text-red-600"
                              : "bg-green-500/10 text-green-600"
                          }`}
                        >
                          {vehicle.status === "sold" ? "vendido" : "disponível"}
                        </Badge>
                      </td>
                      <td className="p-4 align-middle font-semibold text-foreground whitespace-nowrap">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(vehicle.price)}
                      </td>
                      <td className="p-4 align-middle text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {vehicle.status === "sold" ? (
                              <>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleViewSaleDetails(vehicle.id)
                                  }
                                  className="flex items-center gap-2 text-primary hover:bg-primary/10 focus:bg-primary/10"
                                >
                                  <Eye className="h-4 w-4" />
                                  Ver Detalhes da Venda
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleMarkAvailable(vehicle.id)
                                  }
                                  className="flex items-center gap-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                  Marcar como disponível
                                </DropdownMenuItem>
                              </>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => handleSellVehicle(vehicle.id)}
                                className="flex items-center gap-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-950 hover:text-green-700 focus:bg-green-50 focus:text-green-700"
                              >
                                <CheckCircle className="h-4 w-4" />
                                Registrar Venda
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => handleShareVehicle(vehicle)}
                              className="flex items-center gap-2"
                            >
                              <Copy className="h-4 w-4" /> Compartilhar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openEditModal(vehicle)}
                              className="flex items-center gap-2"
                            >
                              <Edit className="h-4 w-4" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setVehicleToDelete(vehicle.id)}
                              className="flex items-center gap-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-700 focus:bg-red-50 focus:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" /> Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="p-8 text-center text-muted-foreground"
                    >
                      Nenhum veículo encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!vehicleToDelete}
        onOpenChange={(open) => !open && setVehicleToDelete(null)}
      >
        <DialogContent
          className="sm:max-w-lg"
          onClose={() => setVehicleToDelete(null)}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 justify-center sm:justify-start">
              <AlertTriangle className="h-5 w-5 text-destructive" /> O que
              deseja fazer?
            </DialogTitle>
            <DialogDescription className="text-center sm:text-left">
              Você pode registrar a venda deste veículo ou excluí-lo
              permanentemente.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 pt-4">
            <Button
              onClick={handleSellAndClose}
              className="w-full bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Registrar Venda
            </Button>
            <Button
              onClick={confirmDelete}
              className="w-full bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir Permanentemente
            </Button>
            <Button
              variant="outline"
              onClick={() => setVehicleToDelete(null)}
              className="w-full"
            >
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Vehicle Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent
          className="w-full max-w-[50vw] sm:max-w-6xl lg:max-w-7xl xl:max-w-[50vw] max-h-[70vh] overflow-y-auto"
          onClose={() => setIsModalOpen(false)}
        >
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Editar Veículo" : "Adicionar Veículo"}
            </DialogTitle>
            <DialogDescription>
              Preencha os detalhes do veículo abaixo.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            {/* Erros de Validação */}
            {Object.keys(validationErrors).length > 0 && (
              <div className="p-4 rounded-md bg-red-500/10 dark:bg-red-500/20 border border-red-500/30 dark:border-red-500/40">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2">
                      Corrija os seguintes erros:
                    </h3>
                    <ul className="text-sm text-red-600 dark:text-red-300 list-disc list-inside space-y-1">
                      {Object.entries(validationErrors).map(
                        ([field, error]) => (
                          <li key={field}>{error}</li>
                        )
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Imagens - Primeira posição */}
            <div className="space-y-2">
              <Label className="text-foreground">
                Imagens do Veículo (Máximo 10) *
              </Label>
              <ImageUpload
                images={formData.images || []}
                onChange={(newImages) => {
                  console.log("📸 Novas imagens recebidas:", newImages);
                  setFormData((prev) => ({ ...prev, images: newImages }));
                }}
                vehicleId={editingId || undefined}
              />
              {validationErrors.images && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {validationErrors.images}
                </p>
              )}
            </div>

            {/* Categoria */}
            <div className="space-y-2">
              <Label className="text-foreground">Categoria *</Label>
              <Select
                name="type"
                value={formData.type}
                onValueChange={(value) =>
                  handleInputChange({
                    target: { name: "type", value },
                  } as React.ChangeEvent<HTMLSelectElement>)
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="carro">Carro</SelectItem>
                  <SelectItem value="moto">Moto</SelectItem>
                </SelectContent>
              </Select>
              {validationErrors.type && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {validationErrors.type}
                </p>
              )}
            </div>

            {/* Marca e Modelo - Combobox com busca */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">Marca/Fabricante *</Label>
                <Combobox
                  options={brands.map((brand) => ({
                    value: brand.id,
                    label: brand.name,
                  }))}
                  value={formData.brand_id || ""}
                  onValueChange={(value) => {
                    const selectedBrand = brands.find((b) => b.id === value);
                    setFormData((prev) => ({
                      ...prev,
                      brand_id: value,
                      brand: selectedBrand?.name || "",
                      model_id: "",
                      model: "",
                    }));
                    setModels([]);
                    if (value) {
                      loadModels(value, formData.type as "carro" | "moto");
                    }
                    if (validationErrors.brand_id || validationErrors.brand) {
                      const newErrors = { ...validationErrors };
                      delete newErrors.brand_id;
                      delete newErrors.brand;
                      setValidationErrors(newErrors);
                    }
                  }}
                  placeholder={
                    loadingBrands ? "Carregando..." : "Selecione a marca"
                  }
                  searchPlaceholder="Buscar marca..."
                  disabled={loadingBrands}
                  error={
                    !!(validationErrors.brand_id || validationErrors.brand)
                  }
                />
                {(validationErrors.brand_id || validationErrors.brand) && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {validationErrors.brand_id || validationErrors.brand}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Modelo *</Label>
                <Combobox
                  options={models.map((model) => ({
                    value: model.id,
                    label: model.name,
                  }))}
                  value={formData.model_id || ""}
                  onValueChange={(value) => {
                    const selectedModel = models.find((m) => m.id === value);
                    setFormData((prev) => ({
                      ...prev,
                      model_id: value,
                      model: selectedModel?.name || "",
                    }));
                    if (validationErrors.model_id || validationErrors.model) {
                      const newErrors = { ...validationErrors };
                      delete newErrors.model_id;
                      delete newErrors.model;
                      setValidationErrors(newErrors);
                    }
                  }}
                  placeholder={
                    !formData.brand_id
                      ? "Selecione a marca primeiro"
                      : loadingModels
                      ? "Carregando..."
                      : "Selecione o modelo"
                  }
                  searchPlaceholder="Buscar modelo..."
                  disabled={!formData.brand_id || loadingModels}
                  error={
                    !!(validationErrors.model_id || validationErrors.model)
                  }
                />
                {(validationErrors.model_id || validationErrors.model) && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {validationErrors.model_id || validationErrors.model}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Preço (R$) *</Label>
              <Input
                type="text"
                name="price"
                value={formatCurrency(formData.price)}
                onChange={handlePriceChange}
                placeholder="R$ 0,00"
                required
                className={
                  validationErrors.price
                    ? "bg-background border-red-500 dark:border-red-400 text-foreground"
                    : "bg-background border-input text-foreground"
                }
              />
              {validationErrors.price && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {validationErrors.price}
                </p>
              )}
            </div>

            {/* Ano e Quilometragem */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">Ano *</Label>
                <Select
                  value={formData.year?.toString()}
                  onValueChange={(value) =>
                    handleInputChange({
                      target: { name: "year", value },
                    } as React.ChangeEvent<HTMLSelectElement>)
                  }
                  required
                >
                  <SelectTrigger
                    className={
                      validationErrors.year
                        ? "bg-background border-red-500 dark:border-red-400 text-foreground"
                        : "bg-background border-input text-foreground"
                    }
                  >
                    <SelectValue placeholder="Selecione o ano" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {Array.from(
                      { length: new Date().getFullYear() + 1 - 1980 + 1 },
                      (_, i) => new Date().getFullYear() + 1 - i
                    ).map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.year && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {validationErrors.year}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Quilometragem (km) *</Label>
                <Input
                  type="number"
                  name="mileage"
                  value={formData.mileage === undefined ? "" : formData.mileage}
                  onChange={handleInputChange}
                  required
                  min="0"
                  placeholder="0"
                  className={
                    validationErrors.mileage
                      ? "bg-background border-red-500 dark:border-red-400 text-foreground"
                      : "bg-background border-input text-foreground"
                  }
                />
                {validationErrors.mileage && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {validationErrors.mileage}
                  </p>
                )}
              </div>
            </div>

            {/* Cor e Placa */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">Cor</Label>
                <Combobox
                  options={colorOptions}
                  value={formData.color || ""}
                  onValueChange={(value) => {
                    setFormData((prev) => ({ ...prev, color: value }));
                  }}
                  placeholder="Selecione a cor"
                  searchPlaceholder="Buscar cor..."
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Placa</Label>
                <Input
                  name="plate_end"
                  value={formData.plate_end}
                  onChange={(e) => {
                    const value = e.target.value
                      .replace(/[^a-zA-Z0-9]/g, "")
                      .toUpperCase();
                    setFormData((prev) => ({ ...prev, plate_end: value }));
                  }}
                  placeholder="Ex: ABC1234"
                  maxLength={7}
                  className="bg-background border-input text-foreground uppercase"
                />
              </div>
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label className="text-foreground">Descrição</Label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Descreva detalhes adicionais do veículo, equipamentos, estado de conservação, histórico, etc."
                className={
                  validationErrors.description
                    ? "border-red-500 dark:border-red-400"
                    : ""
                }
              />
              {validationErrors.description && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {validationErrors.description}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={
                  !formData.type ||
                  !formData.brand_id ||
                  (typeof formData.brand_id === "string" &&
                    formData.brand_id.trim() === "") ||
                  !formData.model_id ||
                  (typeof formData.model_id === "string" &&
                    formData.model_id.trim() === "") ||
                  !formData.price ||
                  formData.price <= 0 ||
                  !formData.year ||
                  formData.year <= 0 ||
                  formData.mileage === undefined ||
                  formData.mileage < 0 ||
                  !formData.images ||
                  formData.images.length === 0
                }
              >
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Sale Details Dialog */}
      <Dialog
        open={isSaleDetailsModalOpen}
        onOpenChange={setIsSaleDetailsModalOpen}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Venda</DialogTitle>
            <DialogDescription>
              Informações completas sobre esta transação
            </DialogDescription>
          </DialogHeader>

          {loadingSaleDetails ? (
            <div className="space-y-4 py-8">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : selectedSale ? (
            <div className="space-y-6 py-4">
              {/* Informações Gerais */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">
                  Informações Gerais
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Data da Venda:
                    </span>
                    <span className="font-medium">
                      {new Date(selectedSale.created_at).toLocaleString(
                        "pt-BR"
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge
                      variant={
                        selectedSale.status === "completed"
                          ? "default"
                          : selectedSale.status === "pending"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {selectedSale.status === "completed"
                        ? "Concluída"
                        : selectedSale.status === "pending"
                        ? "Pendente"
                        : "Cancelada"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Veículo */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2 flex items-center gap-2">
                  <Car className="h-4 w-4" /> Veículo
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Modelo:</span>
                    <span className="font-medium">
                      {selectedSale.vehicle_title}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cliente */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2 flex items-center gap-2">
                  <User className="h-4 w-4" /> Cliente
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nome:</span>
                    <span className="font-medium">
                      {selectedSale.customer_name || "Cliente não informado"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pagamento */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2 flex items-center gap-2">
                  <CreditCard className="h-4 w-4" /> Pagamento
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      Forma de Pagamento:
                    </span>
                    {getMethodBadge(selectedSale.payment.method)}
                  </div>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  {renderPaymentDetails(selectedSale.payment)}
                </div>
              </div>

              {/* Observações */}
              {selectedSale.notes && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Observações
                  </h3>
                  <p className="text-sm text-muted-foreground p-3 bg-muted/30 rounded-lg">
                    {selectedSale.notes}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              Nenhuma venda encontrada para este veículo.
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsSaleDetailsModalOpen(false)}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Vehicle Details Dialog */}
      <Dialog
        open={isVehicleDetailsModalOpen}
        onOpenChange={setIsVehicleDetailsModalOpen}
      >
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Veículo</DialogTitle>
            <DialogDescription>
              Informações completas sobre este veículo
            </DialogDescription>
          </DialogHeader>

          {selectedVehicle && (
            <div className="space-y-6 py-4">
              {/* Imagens */}
              {selectedVehicle.images && selectedVehicle.images.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">
                    Imagens
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedVehicle.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`${selectedVehicle.title} - ${idx + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-border hover:scale-105 transition-transform cursor-pointer"
                        onClick={() => window.open(img, "_blank")}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Informações Básicas */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2 flex items-center gap-2">
                  <Car className="h-4 w-4" /> Informações Básicas
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">
                      Título:
                    </span>
                    <p className="text-sm font-medium">
                      {selectedVehicle.title}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Tipo:</span>
                    <p className="text-sm font-medium capitalize">
                      {selectedVehicle.type === "carro"
                        ? "🚗 Carro"
                        : "🏍️ Moto"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">
                      Marca:
                    </span>
                    <p className="text-sm font-medium">
                      {selectedVehicle.brand}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">
                      Modelo:
                    </span>
                    <p className="text-sm font-medium">
                      {selectedVehicle.model}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Ano:</span>
                    <p className="text-sm font-medium">
                      {selectedVehicle.year}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">
                      Quilometragem:
                    </span>
                    <p className="text-sm font-medium">
                      {selectedVehicle.mileage.toLocaleString("pt-BR")} km
                    </p>
                  </div>
                  {selectedVehicle.color && (
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">
                        Cor:
                      </span>
                      <p className="text-sm font-medium">
                        {selectedVehicle.color}
                      </p>
                    </div>
                  )}
                  {selectedVehicle.plate_end && (
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">
                        Final da Placa:
                      </span>
                      <p className="text-sm font-medium">
                        {selectedVehicle.plate_end}
                      </p>
                    </div>
                  )}
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">
                      Status:
                    </span>
                    <Badge
                      variant="secondary"
                      className={`capitalize ${
                        selectedVehicle.status === "sold"
                          ? "bg-red-500/10 text-red-600"
                          : "bg-green-500/10 text-green-600"
                      }`}
                    >
                      {selectedVehicle.status === "sold"
                        ? "Vendido"
                        : "Disponível"}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">
                      Preço:
                    </span>
                    <p className="text-lg font-bold text-primary">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(selectedVehicle.price)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Descrição */}
              {selectedVehicle.description && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Descrição
                  </h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap p-3 bg-muted/30 rounded-lg">
                    {selectedVehicle.description}
                  </p>
                </div>
              )}

              {/* Data de Criação */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">
                  Informações do Sistema
                </h3>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Cadastrado em:</span>
                  <span className="font-medium">
                    {new Date(selectedVehicle.created_at).toLocaleString(
                      "pt-BR"
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsVehicleDetailsModalOpen(false)}
            >
              Fechar
            </Button>
            {selectedVehicle && selectedVehicle.status === "available" && (
              <Button
                onClick={() => {
                  setIsVehicleDetailsModalOpen(false);
                  openEditModal(selectedVehicle);
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminPageContainer>
  );
}
