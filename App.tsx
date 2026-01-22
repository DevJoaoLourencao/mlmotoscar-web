import {
  DollarSign,
  ExternalLink,
  PlusCircle,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { HashRouter, Link, Outlet, Route, Routes } from "react-router-dom";
import FloatingChat from "./components/FloatingChat";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import ScrollToTop from "./components/ScrollToTop";
import { useSettings } from "./components/SettingsProvider";
import { useTheme } from "./components/ThemeProvider";
import { Button, Skeleton } from "./components/ui/core";
import { useFavicon } from "./hooks/useFavicon";
import About from "./pages/About";
import Catalog from "./pages/Catalog";
import Contact from "./pages/Contact";
import Home from "./pages/Home";
import VehicleDetails from "./pages/VehicleDetails";
import AdminLayout from "./pages/admin/AdminLayout";
import AdsGenerator from "./pages/admin/AdsGenerator";
import Customers from "./pages/admin/Customers";
import Financing from "./pages/admin/Financing";
import Inventory from "./pages/admin/Inventory";
import Login from "./pages/admin/Login";
import Payments from "./pages/admin/Payments";
import Sales from "./pages/admin/Sales";
import SettingsPage from "./pages/admin/Settings";
import { getSales } from "./services/salesService";
import { getVehicles } from "./services/vehicleService";

// Layout for public pages
const PublicLayout = () => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
    <FloatingChat />
  </div>
);

const AdminDashboard = () => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVehicles: 0,
    availableVehicles: 0,
    soldVehicles: 0,
    totalValue: 0,
    salesThisMonth: 0,
    salesValueThisMonth: 0,
  });
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    // Garantir que só execute uma vez
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [vehicles, sales] = await Promise.all([
          getVehicles(),
          getSales(),
        ]);

        // Calcular estatísticas de veículos
        const totalVehicles = vehicles.length;
        const availableVehicles = vehicles.filter(
          (v) => v.status === "available"
        ).length;
        const totalValue = vehicles
          .filter((v) => v.status === "available")
          .reduce((sum, v) => sum + v.price, 0);

        // Calcular vendas
        const completedSales = sales.filter((s) => s.status === "completed");
        const soldVehicles = completedSales.length;

        // Calcular vendas do mês atual
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const salesThisMonth = sales.filter((sale) => {
          const saleDate = new Date(sale.created_at);
          return (
            saleDate.getMonth() === currentMonth &&
            saleDate.getFullYear() === currentYear &&
            sale.status === "completed"
          );
        });

        const salesValueThisMonth = salesThisMonth.reduce(
          (sum, sale) => sum + sale.payment.total_value,
          0
        );

        setStats({
          totalVehicles,
          availableVehicles,
          soldVehicles,
          totalValue,
          salesThisMonth: salesThisMonth.length,
          salesValueThisMonth,
        });
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Dashboard Geral</h1>
        <p className="text-muted-foreground hidden md:block">
          Bem-vindo de volta, Admin.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total em Estoque */}
        <div className="p-6 rounded-xl bg-card border border-border shadow-sm hover:border-primary/50 transition-all hover:-translate-y-1 relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Disponíveis
            </h3>
            {loading ? (
              <Skeleton className="h-10 w-20 mt-2" />
            ) : (
              <>
                <p className="text-4xl font-bold mt-2 text-foreground">
                  {stats.availableVehicles}
                </p>
                <span className="text-xs text-muted-foreground flex items-center mt-2">
                  {stats.totalVehicles} veículos no total
                </span>
              </>
            )}
          </div>
          <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-primary/10 to-transparent"></div>
        </div>

        {/* Valor Total Estoque */}
        <div className="p-6 rounded-xl bg-card border border-border shadow-sm hover:border-primary/50 transition-all hover:-translate-y-1 relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Valor em Estoque
            </h3>
            {loading ? (
              <Skeleton className="h-10 w-32 mt-2" />
            ) : (
              <>
                <p className="text-3xl font-bold mt-2 text-primary">
                  {formatCurrency(stats.totalValue)}
                </p>
                <span className="text-xs text-muted-foreground flex items-center mt-2">
                  Veículos disponíveis
                </span>
              </>
            )}
          </div>
          <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-blue-500/10 to-transparent"></div>
        </div>

        {/* Vendas do Mês */}
        <div className="p-6 rounded-xl bg-card border border-border shadow-sm hover:border-green-500/50 transition-all hover:-translate-y-1 relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Vendas do Mês
            </h3>
            {loading ? (
              <Skeleton className="h-10 w-16 mt-2" />
            ) : (
              <>
                <p className="text-4xl font-bold mt-2 text-green-600 dark:text-green-500">
                  {stats.salesThisMonth}
                </p>
                <span className="text-xs text-green-600 dark:text-green-500 flex items-center mt-2 font-medium">
                  <TrendingUp className="h-3 w-3 mr-1" /> {stats.soldVehicles}{" "}
                  vendidos no total
                </span>
              </>
            )}
          </div>
          <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-green-500/10 to-transparent"></div>
        </div>

        {/* Faturamento do Mês */}
        <div className="p-6 rounded-xl bg-card border border-border shadow-sm hover:border-green-500/50 transition-all hover:-translate-y-1 relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Faturamento (Mês)
            </h3>
            {loading ? (
              <Skeleton className="h-10 w-32 mt-2" />
            ) : (
              <>
                <p className="text-3xl font-bold mt-2 text-green-600 dark:text-green-500">
                  {formatCurrency(stats.salesValueThisMonth)}
                </p>
                <span className="text-xs text-muted-foreground flex items-center mt-2">
                  Total em vendas
                </span>
              </>
            )}
          </div>
          <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-green-500/10 to-transparent"></div>
        </div>
      </div>

      {/* Quick Access Menu */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/admin/estoque">
          <Button
            variant="outline"
            className="w-full h-24 flex flex-col gap-2 items-center justify-center border-border hover:border-primary bg-card hover:bg-card text-foreground"
          >
            <PlusCircle className="h-6 w-6 text-primary" />
            <span className="font-semibold">Novo Veículo</span>
          </Button>
        </Link>
        <Link to="/admin/vendas">
          <Button
            variant="outline"
            className="w-full h-24 flex flex-col gap-2 items-center justify-center border-border hover:border-green-500 bg-card hover:bg-card text-foreground"
          >
            <DollarSign className="h-6 w-6 text-green-500" />
            <span className="font-semibold">Nova Venda</span>
          </Button>
        </Link>
        <Link to="/admin/clientes">
          <Button
            variant="outline"
            className="w-full h-24 flex flex-col gap-2 items-center justify-center border-border hover:border-blue-500 bg-card hover:bg-card text-foreground"
          >
            <Users className="h-6 w-6 text-blue-500" />
            <span className="font-semibold">Clientes</span>
          </Button>
        </Link>
        <Link to="/admin/anuncios">
          <Button
            variant="outline"
            className="w-full h-24 flex flex-col gap-2 items-center justify-center border-border hover:border-purple-500 bg-card hover:bg-card text-foreground"
          >
            <ExternalLink className="h-6 w-6 text-purple-500" />
            <span className="font-semibold">Gerar Anúncio</span>
          </Button>
        </Link>
      </div>
    </div>
  );
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/catalogo" element={<Catalog />} />
        <Route path="/catalogo/:id" element={<VehicleDetails />} />
        <Route path="/sobre" element={<About />} />
        <Route path="/contato" element={<Contact />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin/login" element={<Login />} />

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="estoque" element={<Inventory />} />
        <Route path="vendas" element={<Sales />} />
        <Route path="pagamentos" element={<Payments />} />
        <Route path="clientes" element={<Customers />} />
        <Route path="financiamento" element={<Financing />} />
        <Route path="anuncios" element={<AdsGenerator />} />
        <Route path="configuracoes" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  const { settings } = useSettings();

  // Atualizar favicon dinamicamente
  useFavicon(settings.favicon);

  return (
    <HashRouter>
      <ScrollToTop />
      <AppRoutes />
    </HashRouter>
  );
}
