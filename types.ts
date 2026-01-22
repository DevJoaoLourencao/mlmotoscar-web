export interface Brand {
  id: string;
  created_at: string;
  name: string;
  type: "carro" | "moto";
  active: boolean;
  order_index: number;
}

export interface Model {
  id: string;
  created_at: string;
  brand_id: string;
  name: string;
  type: "carro" | "moto";
  active: boolean;
  order_index: number;
}

export interface Vehicle {
  id: string;
  created_at: string;
  title: string;
  type: "carro" | "moto";
  brand_id?: string; // ID da marca (opcional para compatibilidade)
  model_id?: string; // ID do modelo (opcional para compatibilidade)
  brand: string; // Marca/Fabricante (ex: Chevrolet, Honda)
  model: string; // Modelo (ex: Onix, Civic)
  price: number;
  year: number;
  mileage: number;
  color?: string; // Cor do veículo
  description: string;
  images: string[]; // Changed from single image_url to array
  plate_end?: string;
  status?: "available" | "sold" | "reserved";
}

export interface AppSettings {
  storeName: string;
  logoLight?: string; // URL da logo para tema claro
  logoDark?: string; // URL da logo para tema escuro
  favicon?: string; // URL do favicon
  primaryColor: string; // Hex
  secondaryColor: string; // Hex (used for secondary buttons/accents)
  whatsappColor?: string; // Hex for WhatsApp buttons
  navbarColor?: string; // Hex for Navbar background
  sidebarColor?: string; // Hex for Admin Sidebar background
  phonePrimary: string;
  phonePrimaryName: string;
  phoneSecondary: string;
  phoneSecondaryName: string;
  emailContact: string;
  address: string;
  openingHoursWeekdays: string; // New: Horário de semana
  openingHoursWeekend: string; // New: Horário de fim de semana
  googleMapsUrl?: string;
  socialInstagram?: string;
  socialFacebook?: string;
  defaultTheme: "dark" | "light";
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  cpf?: string;
  birth_date?: string;
  created_at: string;
}

export type PaymentMethodType =
  | "cash"
  | "financing"
  | "trade_in"
  | "promissory";

export interface PaymentDetails {
  method: PaymentMethodType;
  total_value: number;
  // For Financing
  down_payment?: number;
  financed_amount?: number;
  bank_name?: string;
  // For Trade-in
  trade_in_vehicle?: string;
  trade_in_value?: number;
  // For Promissory
  entry_value?: number; // Promissory down payment
  installment_count?: number;
  installment_value?: number;
}

export interface PaymentHistory {
  id: string;
  date: string;
  amount: number;
  note?: string;
  type: "installment" | "settlement";
}

export interface Sale {
  id: string;
  created_at: string;
  vehicle_id: string;
  vehicle_title: string;
  customer_id?: string | null; // Opcional - pode ser null para vendas sem cliente
  customer_name?: string | null; // Opcional - pode ser null para vendas sem cliente
  payment: PaymentDetails;
  payment_history?: PaymentHistory[]; // Track payments for promissory
  status: "pending" | "completed" | "canceled";
  notes?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: { email: string } | null;
}
