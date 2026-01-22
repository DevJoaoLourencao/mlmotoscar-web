import { LayoutDashboard, Menu, Moon, Sun, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSettings } from "./SettingsProvider";
import { useTheme } from "./ThemeProvider";
import { Button } from "./ui/core";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { settings } = useSettings();

  const isActive = (path: string) =>
    location.pathname === path
      ? "text-primary font-bold"
      : "text-foreground/80 hover:text-primary";

  // Use dynamic variable for background, or fallback to default styles if empty
  const navStyle = settings.navbarColor
    ? { backgroundColor: "var(--navbar-bg)" }
    : {};
  const navClass = settings.navbarColor 
    ? "sticky top-0 z-50 w-full border-b border-border transition-colors duration-500 shadow-sm"
    : "sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-colors duration-500";

  return (
    <nav className={navClass} style={navStyle}>
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img
            src={
              theme === "dark"
                ? settings.logoDark || "/logo.png"
                : settings.logoLight || "/logo.png"
            }
            alt={settings.storeName}
            className="h-12 w-auto max-w-[200px] object-contain transition-opacity hover:opacity-90"
          />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/" className={`text-sm transition-colors ${isActive("/")}`}>
            Início
          </Link>
          <Link
            to="/catalogo"
            className={`text-sm transition-colors ${isActive("/catalogo")}`}
          >
            Catálogo
          </Link>
          <Link
            to="/sobre"
            className={`text-sm transition-colors ${isActive("/sobre")}`}
          >
            Sobre
          </Link>
          <Link
            to="/contato"
            className={`text-sm transition-colors ${isActive("/contato")}`}
          >
            Contato
          </Link>
          
          <div className="flex items-center gap-2 pl-4 border-l border-border">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme} 
              className="rounded-full w-9 h-9"
              aria-label="Alternar Tema"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 text-yellow-500 animate-in spin-in-90 duration-300" />
              ) : (
                <Moon className="h-4 w-4 text-slate-700 animate-in spin-in-90 duration-300" />
              )}
            </Button>

            <Link to="/admin">
              <Button variant="outline" size="sm" className="gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Admin
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-4">
           <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme} 
              className="rounded-full w-9 h-9"
            >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 text-yellow-500" />
            ) : (
              <Moon className="h-4 w-4 text-slate-700" />
            )}
           </Button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-foreground p-2"
          >
             {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
           </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="md:hidden border-t border-border bg-background transition-all animate-in slide-in-from-top-5 duration-200 shadow-xl">
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className={`text-sm py-2 px-2 rounded-md hover:bg-muted ${isActive(
                "/"
              )}`}
            >
              Início
            </Link>
            <Link
              to="/catalogo"
              onClick={() => setIsOpen(false)}
              className={`text-sm py-2 px-2 rounded-md hover:bg-muted ${isActive(
                "/catalogo"
              )}`}
            >
              Catálogo
            </Link>
            <Link
              to="/sobre"
              onClick={() => setIsOpen(false)}
              className={`text-sm py-2 px-2 rounded-md hover:bg-muted ${isActive(
                "/sobre"
              )}`}
            >
              Sobre
            </Link>
            <Link
              to="/contato"
              onClick={() => setIsOpen(false)}
              className={`text-sm py-2 px-2 rounded-md hover:bg-muted ${isActive(
                "/contato"
              )}`}
            >
              Contato
            </Link>
            <div className="pt-2 border-t border-border">
                <Link to="/admin" onClick={() => setIsOpen(false)}>
                <Button
                  variant="outline"
                  className="w-full gap-2 justify-start"
                >
                    <LayoutDashboard className="h-4 w-4" />
                    Área Administrativa
                </Button>
                </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
