import { AppSettings } from "../types";
import { supabase } from "./supabase";

const DEFAULT_SETTINGS: AppSettings = {
  storeName: "MLMOTOSCAR",
  logoLight: undefined,
  logoDark: undefined,
  favicon: undefined,
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
};

// Função auxiliar para converter snake_case para camelCase
const snakeToCamel = (str: string): string => {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

// Função auxiliar para converter camelCase para snake_case
const camelToSnake = (str: string): string => {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
};

// Mapear objeto de snake_case para camelCase
const mapDbToApp = (dbData: any): AppSettings => {
  const mapped: any = {};
  Object.keys(dbData).forEach((key) => {
    if (key !== "id" && key !== "updated_at") {
      const camelKey = snakeToCamel(key);
      mapped[camelKey] = dbData[key];
    }
  });
  return { ...DEFAULT_SETTINGS, ...mapped };
};

// Mapear objeto de camelCase para snake_case
const mapAppToDb = (appData: AppSettings): any => {
  const mapped: any = {};
  Object.keys(appData).forEach((key) => {
    const snakeKey = camelToSnake(key);
    mapped[snakeKey] = appData[key as keyof AppSettings];
  });
  return mapped;
};

export const getSettings = async (): Promise<AppSettings> => {
  try {
    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .eq("id", "main")
      .single();

    if (error) {
      // Se não existir configuração, retorna as padrões
      if (error.code === "PGRST116") {
        return DEFAULT_SETTINGS;
      }
      console.error("Erro ao buscar configurações:", error);
      return DEFAULT_SETTINGS;
    }

    return mapDbToApp(data);
  } catch (error) {
    console.error("Erro ao buscar configurações:", error);
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = async (settings: AppSettings): Promise<void> => {
  try {
    const dbData = mapAppToDb(settings);
    const { error } = await supabase
      .from("settings")
      .upsert({ id: "main", ...dbData }, { onConflict: "id" });

    if (error) {
      console.error("Erro ao salvar configurações:", error);
      throw error;
    }
  } catch (error) {
    console.error("Erro ao salvar configurações:", error);
    throw error;
  }
};
