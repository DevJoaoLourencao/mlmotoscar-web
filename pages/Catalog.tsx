import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Badge,
  Button,
  Card,
  CardContent,
  Input,
  Label,
  Skeleton,
} from "../components/ui/core";
import { getVehiclesPaginated } from "../services/vehicleService";
import { Vehicle } from "../types";

const ITEMS_PER_PAGE = 12;

export default function Catalog() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters
  const [filterType, setFilterType] = useState<"all" | "carro" | "moto">("all");
  const [search, setSearch] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [minYear, setMinYear] = useState<string>("");
  const [maxYear, setMaxYear] = useState<string>("");

  // Quick Price Filter State
  const [priceFilter, setPriceFilter] = useState<"all" | "8k" | "10k" | "15k">(
    "all"
  );

  // Update Min/Max price when Quick Filter changes
  useEffect(() => {
    if (priceFilter === "all") {
      setMinPrice("");
      setMaxPrice("");
    } else if (priceFilter === "8k") {
      setMinPrice("");
      setMaxPrice("8000");
    } else if (priceFilter === "10k") {
      setMinPrice("");
      setMaxPrice("10000");
    } else if (priceFilter === "15k") {
      setMinPrice("");
      setMaxPrice("15000");
    }
  }, [priceFilter]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, search, minPrice, maxPrice, minYear, maxYear]);

  // Load vehicles with pagination and filters
  useEffect(() => {
    setLoading(true);
    const filters = {
      type: filterType !== "all" ? filterType : undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      minYear: minYear ? Number(minYear) : undefined,
      maxYear: maxYear ? Number(maxYear) : undefined,
      search: search || undefined,
    };

    getVehiclesPaginated(currentPage, ITEMS_PER_PAGE, filters).then(
      (result) => {
        setVehicles(result.data);
        setTotal(result.total);
        setTotalPages(result.totalPages);
        setLoading(false);
      }
    );
  }, [currentPage, filterType, search, minPrice, maxPrice, minYear, maxYear]);

  const clearFilters = () => {
    setFilterType("all");
    setPriceFilter("all");
    setSearch("");
    setMinPrice("");
    setMaxPrice("");
    setMinYear("");
    setMaxYear("");
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto px-4 py-24 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-6 gap-6">
        <div>
          <h1 className="text-4xl font-bold mb-2 text-foreground">
            Nosso Estoque
          </h1>
          <p className="text-muted-foreground text-lg">
            Encontre o veículo dos seus sonhos.
          </p>
        </div>

        <div className="flex flex-col items-end gap-4 w-full md:w-auto">
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por modelo, marca..."
                className="pl-10 h-11 bg-background border-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex bg-muted rounded-lg p-1 border border-border w-full sm:w-auto h-11">
              <Button
                variant={filterType === "all" ? "default" : "ghost"}
                size="sm"
                onClick={() => setFilterType("all")}
                className="flex-1 sm:flex-initial rounded-md"
              >
                Todos
              </Button>
              <Button
                variant={filterType === "carro" ? "default" : "ghost"}
                size="sm"
                onClick={() => setFilterType("carro")}
                className="flex-1 sm:flex-initial rounded-md"
              >
                Carros
              </Button>
              <Button
                variant={filterType === "moto" ? "default" : "ghost"}
                size="sm"
                onClick={() => setFilterType("moto")}
                className="flex-1 sm:flex-initial rounded-md"
              >
                Motos
              </Button>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-primary gap-2"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            {showAdvanced ? "Ocultar Filtros" : "Filtros Avançados"}
            {showAdvanced ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>

      {/* Quick Price Filters */}
      <div className="mb-8 flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-muted-foreground mr-2">
          Faixa de Preço:
        </span>
        <Badge
          variant={priceFilter === "all" ? "default" : "outline"}
          className="cursor-pointer px-4 py-1.5"
          onClick={() => setPriceFilter("all")}
        >
          Todos
        </Badge>
        <Badge
          variant={priceFilter === "8k" ? "default" : "outline"}
          className="cursor-pointer px-4 py-1.5"
          onClick={() => setPriceFilter("8k")}
        >
          Até 8 mil
        </Badge>
        <Badge
          variant={priceFilter === "10k" ? "default" : "outline"}
          className="cursor-pointer px-4 py-1.5"
          onClick={() => setPriceFilter("10k")}
        >
          Até 10 mil
        </Badge>
        <Badge
          variant={priceFilter === "15k" ? "default" : "outline"}
          className="cursor-pointer px-4 py-1.5"
          onClick={() => setPriceFilter("15k")}
        >
          Até 15 mil
        </Badge>
      </div>

      {/* Advanced Filters Area */}
      {showAdvanced && (
        <Card className="mb-12 bg-card border-border animate-fade-in-up">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="space-y-3">
                <Label className="text-base">Preço Mínimo (R$)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={minPrice}
                  onChange={(e) => {
                    setMinPrice(e.target.value);
                    setPriceFilter("all");
                  }}
                />
              </div>
              <div className="space-y-3">
                <Label className="text-base">Preço Máximo (R$)</Label>
                <Input
                  type="number"
                  placeholder="Sem limite"
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(e.target.value);
                    setPriceFilter("all");
                  }}
                />
              </div>
              <div className="space-y-3">
                <Label className="text-base">Ano Mínimo</Label>
                <Input
                  type="number"
                  placeholder="2010"
                  value={minYear}
                  onChange={(e) => setMinYear(e.target.value)}
                />
              </div>
              <div className="space-y-3">
                <Label className="text-base">Ano Máximo</Label>
                <Input
                  type="number"
                  placeholder={new Date().getFullYear().toString()}
                  value={maxYear}
                  onChange={(e) => setMaxYear(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end mt-8 pt-4 border-t border-border">
              <Button variant="outline" onClick={clearFilters}>
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="flex flex-col gap-4">
              <Skeleton className="aspect-[4/3] w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex justify-between pt-2">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {vehicles.length > 0 ? (
              vehicles.map((vehicle) => (
                <Link
                  to={`/catalogo/${vehicle.id}`}
                  key={vehicle.id}
                  className="group h-full"
                >
                  <Card className="h-full flex flex-col overflow-hidden border-border bg-card hover:border-primary/50 transition-all duration-300">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={vehicle.images?.[0] || (vehicle as any).image_url}
                        alt={vehicle.title}
                        className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                      />
                      <Badge
                        variant={
                          vehicle.type === "carro" ? "default" : "destructive"
                        }
                        className="absolute top-3 left-3 uppercase text-[10px] tracking-wide font-bold"
                      >
                        {vehicle.type}
                      </Badge>
                    </div>
                    <CardContent className="p-6 flex flex-col justify-between flex-1 gap-4">
                      <div>
                        <h3 className="font-bold text-lg leading-tight mb-3 line-clamp-1 text-foreground group-hover:text-primary transition-colors">
                          {vehicle.title}
                        </h3>
                        <div className="grid grid-cols-2 gap-y-2 text-xs text-muted-foreground">
                          <span>{vehicle.year}</span>
                          <span className="text-right">
                            {vehicle.mileage.toLocaleString()} km
                          </span>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-border flex items-center justify-between">
                        <span className="text-xl font-bold text-foreground">
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(vehicle.price)}
                        </span>
                        <Button
                          size="sm"
                          className="bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-full px-4"
                        >
                          Ver
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="col-span-full py-32 text-center flex flex-col items-center justify-center text-muted-foreground">
                <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mb-6">
                  <Search className="h-10 w-10 opacity-50" />
                </div>
                <p className="text-xl font-medium text-foreground mb-2">
                  Nenhum veículo encontrado
                </p>
                <p className="text-muted-foreground mb-6">
                  Tente ajustar seus filtros de busca para encontrar o que
                  procura.
                </p>
                <Button
                  variant="link"
                  onClick={clearFilters}
                  className="text-primary text-lg"
                >
                  Limpar todos os filtros
                </Button>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 pt-8 border-t border-border">
              <div className="text-sm text-muted-foreground">
                Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} a{" "}
                {Math.min(currentPage * ITEMS_PER_PAGE, total)} de {total}{" "}
                veículos
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      // Mostrar primeira, última, atual e adjacentes
                      return (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      );
                    })
                    .map((page, index, array) => {
                      // Adicionar "..." quando necessário
                      const showEllipsis =
                        index > 0 && array[index] - array[index - 1] > 1;
                      return (
                        <div key={page} className="flex items-center gap-1">
                          {showEllipsis && (
                            <span className="px-2 text-muted-foreground">
                              ...
                            </span>
                          )}
                          <Button
                            variant={
                              currentPage === page ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className="min-w-[40px]"
                          >
                            {page}
                          </Button>
                        </div>
                      );
                    })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Próxima
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
