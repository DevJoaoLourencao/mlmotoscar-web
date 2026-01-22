import {
  ArrowLeft,
  Calculator,
  Car,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  Moon,
  Settings,
  Sun,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useSettings } from "../../components/SettingsProvider";
import { useTheme } from "../../components/ThemeProvider";
import { Button } from "../../components/ui/core";
import { authService } from "../../services/authService";

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { settings } = useSettings();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    return saved ? JSON.parse(saved) : false;
  });
  const hasCheckedAuthRef = useRef(false);

  // Auth Guard - só executa uma vez
  useEffect(() => {
    if (hasCheckedAuthRef.current) return;
    hasCheckedAuthRef.current = true;

    const checkAuth = async () => {
      const isAuth = await authService.isAuthenticated();
      if (!isAuth) {
        navigate("/admin/login");
      }
    };
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await authService.logout();
    navigate("/admin/login");
  };

  const toggleSidebar = () => {
    const newState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newState);
    localStorage.setItem("sidebarCollapsed", JSON.stringify(newState));
  };

  const isActive = (path: string) =>
    location.pathname === path
      ? "bg-primary/10 text-primary font-medium"
      : "text-muted-foreground hover:text-foreground hover:bg-muted";

  // Sidebar dynamic style
  const sidebarStyle = settings.sidebarColor
    ? { backgroundColor: settings.sidebarColor }
    : {};

  const NavLinks = () => (
    <>
      <Link to="/admin" className={isSidebarCollapsed ? "block mb-3" : "block"}>
        <div
          className={`flex items-center ${isSidebarCollapsed ? "justify-center gap-0" : "gap-3"} px-3 py-2 rounded-md transition-colors ${isActive(
            "/admin"
          )}`}
          title={isSidebarCollapsed ? "Dashboard" : ""}
        >
          <LayoutDashboard className="h-4 w-4 flex-shrink-0" />
          {!isSidebarCollapsed && <span className="text-sm md:text-base">Dashboard</span>}
        </div>
      </Link>
      <Link to="/admin/estoque" className={isSidebarCollapsed ? "block mb-3" : "block"}>
        <div
          className={`flex items-center ${isSidebarCollapsed ? "justify-center gap-0" : "gap-3"} px-3 py-2 rounded-md transition-colors ${isActive(
            "/admin/estoque"
          )}`}
          title={isSidebarCollapsed ? "Estoque" : ""}
        >
          <Car className="h-4 w-4 flex-shrink-0" />
          {!isSidebarCollapsed && <span className="text-sm md:text-base">Estoque</span>}
        </div>
      </Link>
      <Link to="/admin/vendas" className={isSidebarCollapsed ? "block mb-3" : "block"}>
        <div
          className={`flex items-center ${isSidebarCollapsed ? "justify-center gap-0" : "gap-3"} px-3 py-2 rounded-md transition-colors ${isActive(
            "/admin/vendas"
          )}`}
          title={isSidebarCollapsed ? "Vendas" : ""}
        >
          <DollarSign className="h-4 w-4 flex-shrink-0" />
          {!isSidebarCollapsed && <span className="text-sm md:text-base">Vendas</span>}
        </div>
      </Link>
      <Link to="/admin/pagamentos" className={isSidebarCollapsed ? "block mb-3" : "block"}>
        <div
          className={`flex items-center ${isSidebarCollapsed ? "justify-center gap-0" : "gap-3"} px-3 py-2 rounded-md transition-colors ${isActive(
            "/admin/pagamentos"
          )}`}
          title={isSidebarCollapsed ? "Pagamentos" : ""}
        >
          <Wallet className="h-4 w-4 flex-shrink-0" />
          {!isSidebarCollapsed && <span className="text-sm md:text-base">Pagamentos</span>}
        </div>
      </Link>
      <Link to="/admin/clientes" className={isSidebarCollapsed ? "block mb-3" : "block"}>
        <div
          className={`flex items-center ${isSidebarCollapsed ? "justify-center gap-0" : "gap-3"} px-3 py-2 rounded-md transition-colors ${isActive(
            "/admin/clientes"
          )}`}
          title={isSidebarCollapsed ? "Clientes" : ""}
        >
          <Users className="h-4 w-4 flex-shrink-0" />
          {!isSidebarCollapsed && <span className="text-sm md:text-base">Clientes</span>}
        </div>
      </Link>
      <Link to="/admin/financiamento" className={isSidebarCollapsed ? "block mb-3" : "block"}>
        <div
          className={`flex items-center ${isSidebarCollapsed ? "justify-center gap-0" : "gap-3"} px-3 py-2 rounded-md transition-colors ${isActive(
            "/admin/financiamento"
          )}`}
          title={isSidebarCollapsed ? "Financiamento" : ""}
        >
          <Calculator className="h-4 w-4 flex-shrink-0" />
          {!isSidebarCollapsed && <span className="text-sm md:text-base">Financiamento</span>}
        </div>
      </Link>
      <Link to="/admin/anuncios" className={isSidebarCollapsed ? "block mb-3" : "block"}>
        <div
          className={`flex items-center ${isSidebarCollapsed ? "justify-center gap-0" : "gap-3"} px-3 py-2 rounded-md transition-colors ${isActive(
            "/admin/anuncios"
          )}`}
          title={isSidebarCollapsed ? "Anúncios (Social)" : ""}
        >
          <Megaphone className="h-4 w-4 flex-shrink-0" />
          {!isSidebarCollapsed && <span className="text-sm md:text-base">Anúncios (Social)</span>}
        </div>
      </Link>
      <Link to="/admin/configuracoes" className={isSidebarCollapsed ? "block mb-3" : "block"}>
        <div
          className={`flex items-center ${isSidebarCollapsed ? "justify-center gap-0" : "gap-3"} px-3 py-2 rounded-md transition-colors ${isActive(
            "/admin/configuracoes"
          )}`}
          title={isSidebarCollapsed ? "Configurações" : ""}
        >
          <Settings className="h-4 w-4 flex-shrink-0" />
          {!isSidebarCollapsed && <span className="text-sm md:text-base">Configurações</span>}
        </div>
      </Link>
    </>
  );

  const BottomActions = () => (
    <div className="space-y-1">
      {/* Theme Toggle */}
      <Button
        variant="ghost"
        className={`w-full ${isSidebarCollapsed ? "justify-center" : "justify-start"} gap-3 text-muted-foreground hover:text-foreground`}
        onClick={toggleTheme}
        title={isSidebarCollapsed ? (theme === "dark" ? "Modo Claro" : "Modo Escuro") : ""}
      >
        {theme === "dark" ? (
          <Sun className="h-4 w-4 flex-shrink-0" />
        ) : (
          <Moon className="h-4 w-4 flex-shrink-0" />
        )}
        {!isSidebarCollapsed && <span className="text-sm md:text-base">{theme === "dark" ? "Modo Claro" : "Modo Escuro"}</span>}
      </Button>

      {/* Back to Site */}
      <Link to="/">
        <Button
          variant="ghost"
          className={`w-full ${isSidebarCollapsed ? "justify-center" : "justify-start"} gap-3 text-muted-foreground hover:text-foreground`}
          title={isSidebarCollapsed ? "Voltar ao Site" : ""}
        >
          <ArrowLeft className="h-4 w-4 flex-shrink-0" />
          {!isSidebarCollapsed && <span className="text-sm md:text-base">Voltar ao Site</span>}
        </Button>
      </Link>

      {/* Logout */}
      <Button
        variant="ghost"
        className={`w-full ${isSidebarCollapsed ? "justify-center" : "justify-start"} gap-3 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30`}
        onClick={handleLogout}
        title={isSidebarCollapsed ? "Sair" : ""}
      >
        <LogOut className="h-4 w-4 flex-shrink-0" />
        {!isSidebarCollapsed && <span className="text-sm md:text-base">Sair</span>}
      </Button>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Mobile Header */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-30 bg-card border-b border-border h-16 flex items-center justify-between px-4 shadow-sm"
        style={sidebarStyle} // Consistent with sidebar
      >
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
          <span className="font-bold text-sm md:text-lg text-foreground">
            ML<span className="text-primary">ADMIN</span>
          </span>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-20 bg-background pt-20 px-4 animate-in slide-in-from-left duration-300"
          style={sidebarStyle}
        >
          <div className="space-y-4">
            <div className="flex flex-col space-y-2">
              <NavLinks />
            </div>
            <div className="pt-4 border-t border-border">
              <BottomActions />
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside
        className={`${isSidebarCollapsed ? "w-16" : "w-64"} border-r border-border bg-card hidden md:flex flex-col fixed h-full z-10 shadow-sm transition-all duration-300`}
        style={sidebarStyle}
      >
        <div className={`h-16 flex items-center ${isSidebarCollapsed ? "justify-center px-2" : "px-6"} border-b border-border relative`}>
          {!isSidebarCollapsed && (
            <span className="font-bold text-sm md:text-lg text-foreground">
              ML<span className="text-primary">ADMIN</span>
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={`${isSidebarCollapsed ? "mx-auto" : "absolute right-2"} h-8 w-8`}
            onClick={toggleSidebar}
            title={isSidebarCollapsed ? "Expandir barra lateral" : "Minimizar barra lateral"}
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="flex-1 p-4 overflow-y-auto">
          <NavLinks />
        </div>

        <div className="p-4 border-t border-border">
          <BottomActions />
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ${isSidebarCollapsed ? "md:ml-16" : "md:ml-64"} bg-background min-h-screen pt-16 md:pt-0 transition-all duration-300`}>
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
