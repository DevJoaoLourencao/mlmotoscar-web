import {
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";
import VehicleCard from "../components/VehicleCard";
import {
  Badge,
  Button,
  Input,
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
  const [priceFilter, setPriceFilter] = useState<"all" | "8k" | "10k" | "15k">("all");

  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");

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
  }, [filterType, search, minPrice, maxPrice]);

  // Load vehicles with pagination and filters
  useEffect(() => {
    setLoading(true);
    const filters = {
      type: filterType !== "all" ? filterType : undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
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
  }, [currentPage, filterType, search, minPrice, maxPrice]);

  const clearFilters = () => {
    setFilterType("all");
    setPriceFilter("all");
    setSearch("");
    setMinPrice("");
    setMaxPrice("");
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto px-10 py-10 md:px-4 md:py-10 animate-fade-in-up">
      <div className="mb-8 md:mb-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-3xl md:text-3xl font-bold mb-2 text-foreground">
              Nosso Estoque
            </h1>
            <p className="text-muted-foreground text-sm md:text-base lg:text-lg">
              Encontre o veículo dos seus sonhos.
            </p>
          </div>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar por modelo, marca..."
            className="pl-10 h-11 bg-background border-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Price Filters and Type Filters */}
      <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 lg:gap-3">
          <span className="text-sm font-semibold text-foreground mr-2 w-full md:w-auto mb-1 md:mb-0">
            Faixa de Preço:
          </span>
          <Badge
            variant={priceFilter === "all" ? "default" : "outline"}
            className="cursor-pointer px-4 py-2 text-xs hover:bg-primary hover:text-primary-foreground transition-colors"
            onClick={() => setPriceFilter("all")}
          >
            Todos
          </Badge>
          <Badge
            variant={priceFilter === "8k" ? "default" : "outline"}
            className="cursor-pointer px-4 py-2 text-xs hover:bg-primary hover:text-primary-foreground transition-colors"
            onClick={() => setPriceFilter("8k")}
          >
            Até 8 mil
          </Badge>
          <Badge
            variant={priceFilter === "10k" ? "default" : "outline"}
            className="cursor-pointer px-4 py-2 text-xs hover:bg-primary hover:text-primary-foreground transition-colors"
            onClick={() => setPriceFilter("10k")}
          >
            Até 10 mil
          </Badge>
          <Badge
            variant={priceFilter === "15k" ? "default" : "outline"}
            className="cursor-pointer px-4 py-2 text-xs hover:bg-primary hover:text-primary-foreground transition-colors"
            onClick={() => setPriceFilter("15k")}
          >
            Até 15 mil
          </Badge>
        </div>

        <div className="flex bg-muted rounded-lg p-1 border border-border w-full lg:w-auto h-11">
          <Button
            variant={filterType === "all" ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilterType("all")}
            className="flex-1 lg:flex-initial rounded-md px-6"
          >
            Todos
          </Button>
          <Button
            variant={filterType === "carro" ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilterType("carro")}
            className="flex-1 lg:flex-initial rounded-md px-6"
          >
            Carros
          </Button>
          <Button
            variant={filterType === "moto" ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilterType("moto")}
            className="flex-1 lg:flex-initial rounded-md px-6"
          >
            Motos
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <div key={i} className="flex flex-col gap-3 md:gap-4">
              <Skeleton className="aspect-[16/10] w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-5 md:h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex justify-between pt-2">
                  <Skeleton className="h-7 md:h-8 w-20 md:w-24" />
                  <Skeleton className="h-7 md:h-8 w-14 md:w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
            {vehicles.length > 0 ? (
              vehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))
            ) : (
              <div className="col-span-full py-16 md:py-32 text-center flex flex-col items-center justify-center text-muted-foreground px-4">
                <div className="h-16 w-16 md:h-20 md:w-20 bg-muted rounded-full flex items-center justify-center mb-4 md:mb-6">
                  <Search className="h-8 w-8 md:h-10 md:w-10 opacity-50" />
                </div>
                <p className="text-lg md:text-xl font-medium text-foreground mb-2">
                  Nenhum veículo encontrado
                </p>
                <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6">
                  Tente ajustar seus filtros de busca para encontrar o que
                  procura.
                </p>
                <Button
                  variant="link"
                  onClick={clearFilters}
                  className="text-primary text-sm md:text-lg"
                >
                  Limpar todos os filtros
                </Button>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col items-center justify-center gap-4 mt-8 md:mt-12 pt-6 md:pt-8 border-t border-border">
              <div className="text-xs md:text-sm text-muted-foreground text-center">
                Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} a{" "}
                {Math.min(currentPage * ITEMS_PER_PAGE, total)} de {total}{" "}
                veículos
              </div>
              <div className="flex items-center gap-1 md:gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="h-8 md:h-9 px-2 md:px-3 text-xs md:text-sm"
                >
                  <ChevronLeft className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden md:inline">Anterior</span>
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
                            <span className="px-1 md:px-2 text-muted-foreground text-xs md:text-sm">
                              ...
                            </span>
                          )}
                          <Button
                            variant={
                              currentPage === page ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className="min-w-[32px] md:min-w-[40px] h-8 md:h-9 text-xs md:text-sm"
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
                  className="h-8 md:h-9 px-2 md:px-3 text-xs md:text-sm"
                >
                  <span className="hidden md:inline">Próxima</span>
                  <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
