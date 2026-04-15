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
  Package,
  Plus,
  Search,
  Share2,
  Trash2,
  TrendingUp,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AdminPageContainer,
  AdminPageHeader,
} from "../../components/AdminPageComponents";
import PaymentMethodBadge from "../../components/PaymentMethodBadge";
import { VehicleLightbox } from "../../components/VehicleGallery/VehicleLightbox";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Skeleton,
} from "../../components/ui/core";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { getSaleByVehicleId } from "../../services/salesService";
import {
  deleteVehicle,
  getVehicles,
  updateVehicle,
} from "../../services/vehicleService";
import { PaymentDetails, Sale, Vehicle } from "../../types";
import { formatCurrencyBRL } from "../../utils/formatters";

export default function Inventory() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Filters
  const [priceFilter, setPriceFilter] = useState<"all" | "8k" | "10k" | "15k">(
    "all",
  );
  const [typeFilter, setTypeFilter] = useState<"all" | "carro" | "moto">("all");

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

  // Lightbox State
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

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

  // Gerar título automaticamente
  const generateTitle = (
    brand: string,
    model: string,
    year: number,
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

  const renderPaymentDetails = (payment: PaymentDetails) => {
    switch (payment.method) {
      case "cash":
        return (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Valor Total:</span>
              <span className="font-bold">
                {formatCurrencyBRL(payment.total_value)}
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
                {formatCurrencyBRL(payment.total_value)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Entrada:</span>
              <span>{formatCurrencyBRL(payment.down_payment || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Valor Financiado:</span>
              <span>{formatCurrencyBRL(payment.financed_amount || 0)}</span>
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
                {formatCurrencyBRL(payment.total_value)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Veículo na Troca:</span>
              <span>{payment.trade_in_vehicle || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Valor da Troca:</span>
              <span>{formatCurrencyBRL(payment.trade_in_value || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Saldo a Pagar:</span>
              <span className="font-bold">
                {formatCurrencyBRL(
                  payment.total_value - (payment.trade_in_value || 0),
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
                {formatCurrencyBRL(payment.total_value)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Entrada:</span>
              <span>{formatCurrencyBRL(payment.entry_value || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Valor a Parcelar:</span>
              <span>
                {formatCurrencyBRL(
                  payment.total_value - (payment.entry_value || 0),
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
                {formatCurrencyBRL(payment.installment_value || 0)}
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

  // Filter Logic
  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch = v.title.toLowerCase().includes(search.toLowerCase());

    let matchesPrice = true;
    if (priceFilter === "8k") matchesPrice = v.price <= 8000;
    else if (priceFilter === "10k") matchesPrice = v.price <= 10000;
    else if (priceFilter === "15k") matchesPrice = v.price <= 15000;

    let matchesType = true;
    if (typeFilter !== "all") matchesType = v.type === typeFilter;

    const matchesStatus = (v.status || "available") === "available";

    return matchesSearch && matchesPrice && matchesType && matchesStatus;
  });

  const getDaysInStock = (vehicle: Vehicle): number => {
    const created = new Date(vehicle.created_at);
    const now = new Date();
    return Math.floor(
      (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24),
    );
  };

  const getInventoryStats = () => {
    const available = vehicles.filter(
      (v) => (v.status || "available") === "available",
    );
    const totalValue = available.reduce((sum, v) => sum + v.price, 0);
    const maxDays =
      available.length > 0
        ? Math.max(...available.map((v) => getDaysInStock(v)))
        : 0;
    return { availableCount: available.length, totalValue, maxDays };
  };

  const inventoryStats = getInventoryStats();

  const handleShareList = () => {
    const header = `📋 *LISTA DE VEÍCULOS* 📋\n\n`;
    const body = filteredVehicles
      .map(
        (v) =>
          `🚗 *${v.title}* (${v.year})\n💰 ${new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(v.price)}\n`,
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
              onClick={() => navigate("/admin/estoque/novo")}
              className="flex-1 md:flex-initial gap-2 shadow-md"
            >
              <Plus className="h-4 w-4" /> Novo Veículo
            </Button>
          </>
        }
      />

      {/* KPIs de Estoque */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-full bg-blue-500/10 text-blue-500">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Disponíveis</p>
              <h3 className="text-2xl font-bold text-foreground">
                {loading ? "—" : inventoryStats.availableCount}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                veículos em estoque
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-full bg-green-500/10 text-green-500">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Valor do Estoque</p>
              <h3 className="text-2xl font-bold text-foreground">
                {loading
                  ? "—"
                  : new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(inventoryStats.totalValue)}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                soma dos disponíveis
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

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
            </div>
          </div>

          {/* Filtros organizados */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border/50">
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
                  Carros
                </Badge>
                <Badge
                  variant={typeFilter === "moto" ? "default" : "outline"}
                  className="cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => setTypeFilter("moto")}
                >
                  Motos
                </Badge>
              </div>
            </div>

          </div>
        </CardHeader>
        <CardContent>
          {/* Desktop Table View */}
          <div className="hidden lg:block relative w-full overflow-auto">
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
                          alt={`${vehicle.brand} ${vehicle.model}`}
                          className="h-10 w-16 md:h-12 md:w-20 object-cover rounded bg-muted border border-border"
                        />
                      </td>
                      <td className="p-4 align-middle font-medium text-foreground min-w-[150px]">
                        <div>{vehicle.title}</div>
                        {vehicle.status !== "sold" && (
                          <p
                            className={`text-xs mt-0.5 ${getDaysInStock(vehicle) > 60 ? "text-orange-500 font-medium" : "text-muted-foreground"}`}
                          >
                            {getDaysInStock(vehicle)} dias em estoque
                          </p>
                        )}
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
                              onClick={() =>
                                navigate(`/admin/estoque/editar/${vehicle.id}`)
                              }
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

          {/* Mobile/Tablet Card View */}
          <div className="lg:hidden space-y-4">
            {loading ? (
              [1, 2, 3, 4].map((i) => (
                <Card key={i} className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <Skeleton className="h-20 w-28 rounded" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-1/3" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : filteredVehicles.length > 0 ? (
              filteredVehicles.map((vehicle) => (
                <Card
                  key={vehicle.id}
                  className="bg-card border-border hover:border-primary/50 transition-colors"
                >
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <img
                        src={vehicle.images?.[0]}
                        alt={vehicle.title}
                        className="h-20 w-28 object-cover rounded bg-muted border border-border flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-semibold text-foreground text-sm line-clamp-2 flex-1">
                            {vehicle.title}
                          </h3>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-foreground flex-shrink-0"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  handleViewVehicleDetails(vehicle)
                                }
                                className="flex items-center gap-2"
                              >
                                <Eye className="h-4 w-4" /> Ver Detalhes
                              </DropdownMenuItem>
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
                                onClick={() =>
                                  navigate(
                                    `/admin/estoque/editar/${vehicle.id}`,
                                  )
                                }
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
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <Badge
                            variant="outline"
                            className="capitalize text-xs"
                          >
                            {vehicle.type}
                          </Badge>
                          <Badge
                            variant="secondary"
                            className={`capitalize text-xs ${
                              vehicle.status === "sold"
                                ? "bg-red-500/10 text-red-600"
                                : "bg-green-500/10 text-green-600"
                            }`}
                          >
                            {vehicle.status === "sold"
                              ? "vendido"
                              : "disponível"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-foreground text-base">
                            {new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            }).format(vehicle.price)}
                          </p>
                          {vehicle.status !== "sold" && (
                            <p
                              className={`text-xs ${getDaysInStock(vehicle) > 60 ? "text-orange-500 font-medium" : "text-muted-foreground"}`}
                            >
                              {getDaysInStock(vehicle)}d em estoque
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                Nenhum veículo encontrado.
              </div>
            )}
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
                        "pt-BR",
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
                    <PaymentMethodBadge method={selectedSale.payment.method} />
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
                    {selectedVehicle.images.map((img: string, idx: number) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`${selectedVehicle.title} - ${idx + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-border hover:scale-105 transition-transform cursor-pointer"
                        onClick={() => {
                          setLightboxIndex(idx);
                          setLightboxOpen(true);
                        }}
                      />
                    ))}
                  </div>
                  <VehicleLightbox
                    images={selectedVehicle.images}
                    isOpen={lightboxOpen}
                    initialIndex={lightboxIndex}
                    onClose={() => setLightboxOpen(false)}
                    vehicleTitle={selectedVehicle.title}
                  />
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
                    <p className="text-lg font-bold text-green-500">
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
                      "pt-BR",
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
                  navigate(`/admin/estoque/editar/${selectedVehicle.id}`);
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
