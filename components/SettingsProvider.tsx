import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getSettings } from "../services/settingsService";
import { AppSettings } from "../types";
import { hexToHSL } from "../utils/colorUtils";

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: AppSettings) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

interface SettingsProviderProps {
  children?: React.ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, setSettings] = useState<AppSettings>({
    storeName: "MLMOTOSCAR",
    primaryColor: "#ff0000",
    secondaryColor: "#1f2937",
    whatsappColor: "#25D366",
    navbarColor: "",
    sidebarColor: "",
    phonePrimary: "(14) 99703-6375",
    phonePrimaryName: "Wagner Lourenção",
    phoneSecondary: "(14) 99156-9560",
    phoneSecondaryName: "João Lourenção",
    emailContact: "vendas@mlmotoscar.com.br",
    address: "Av. Brasil, 1500 - Jardins, São Paulo - SP",
    openingHoursWeekdays: "Seg - Sex: 09h às 18h",
    openingHoursWeekend: "Sáb: 09h às 13h",
    socialInstagram: "https://instagram.com",
    socialFacebook: "https://facebook.com",
    googleMapsUrl: "",
    defaultTheme: "dark",
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // Carregar configurações do Supabase (apenas uma vez)
  useEffect(() => {
    const loadSettings = async () => {
      const loadedSettings = await getSettings();
      setSettings(loadedSettings);
      setIsLoaded(true);
    };
    loadSettings();
  }, []);

  // Aplicar cores apenas quando mudarem (otimizado)
  useEffect(() => {
    if (!isLoaded) return;

    const root = document.documentElement;

    // Primary Color (HSL for Tailwind compatibility)
    const primaryHSL = hexToHSL(settings.primaryColor);
    root.style.setProperty("--primary", primaryHSL);
    root.style.setProperty("--ring", primaryHSL);

    // Secondary Color (HSL for Tailwind compatibility)
    // We only override if it's set, otherwise keep theme default
    if (settings.secondaryColor) {
      const secondaryHSL = hexToHSL(settings.secondaryColor);
      root.style.setProperty("--secondary", secondaryHSL);
    }

    // WhatsApp Color (Direct Hex)
    root.style.setProperty("--whatsapp", settings.whatsappColor || "#25D366");

    // Navbar Background (Direct Hex)
    if (settings.navbarColor) {
      root.style.setProperty("--navbar-bg", settings.navbarColor);
    } else {
      root.style.removeProperty("--navbar-bg");
    }

    // Admin Sidebar Background (Direct Hex)
    if (settings.sidebarColor) {
      root.style.setProperty("--sidebar-bg", settings.sidebarColor);
    } else {
      root.style.removeProperty("--sidebar-bg");
    }
  }, [
    isLoaded,
    settings.primaryColor,
    settings.secondaryColor,
    settings.whatsappColor,
    settings.navbarColor,
    settings.sidebarColor,
  ]);

  const updateSettings = useCallback((newSettings: AppSettings) => {
    setSettings(newSettings);
  }, []);

  const contextValue = useMemo(
    () => ({ settings, updateSettings }),
    [settings, updateSettings]
  );

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context)
    throw new Error("useSettings must be used within a SettingsProvider");
  return context;
};
