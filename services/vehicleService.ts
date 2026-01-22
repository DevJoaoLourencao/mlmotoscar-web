import { Vehicle } from "../types";
import { deleteMultipleImages } from "./imageService";
import { supabase } from "./supabase";

export const getVehicles = async (): Promise<Vehicle[]> => {
  try {
    const { data, error } = await supabase
      .from("vehicles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar veículos:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Erro ao buscar veículos:", error);
    return [];
  }
};

export interface PaginatedVehiclesResult {
  data: Vehicle[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const getVehiclesPaginated = async (
  page: number = 1,
  pageSize: number = 12,
  filters?: {
    type?: "carro" | "moto";
    minPrice?: number;
    maxPrice?: number;
    minYear?: number;
    maxYear?: number;
    search?: string;
  }
): Promise<PaginatedVehiclesResult> => {
  try {
    let query = supabase
      .from("vehicles")
      .select("*", { count: "exact" })
      .eq("status", "available")
      .order("created_at", { ascending: false });

    // Aplicar filtros
    if (filters?.type) {
      query = query.eq("type", filters.type);
    }
    if (filters?.minPrice) {
      query = query.gte("price", filters.minPrice);
    }
    if (filters?.maxPrice) {
      query = query.lte("price", filters.maxPrice);
    }
    if (filters?.minYear) {
      query = query.gte("year", filters.minYear);
    }
    if (filters?.maxYear) {
      query = query.lte("year", filters.maxYear);
    }
    if (filters?.search) {
      const searchLower = `%${filters.search.toLowerCase()}%`;
      query = query.or(
        `title.ilike.${searchLower},description.ilike.${searchLower},brand.ilike.${searchLower},model.ilike.${searchLower}`
      );
    }

    // Calcular offset
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await query.range(from, to);

    if (error) {
      console.error("Erro ao buscar veículos paginados:", error);
      throw error;
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / pageSize);

    return {
      data: data || [],
      total,
      page,
      pageSize,
      totalPages,
    };
  } catch (error) {
    console.error("Erro ao buscar veículos paginados:", error);
    return {
      data: [],
      total: 0,
      page: 1,
      pageSize,
      totalPages: 0,
    };
  }
};

export const getVehicleById = async (
  id: string
): Promise<Vehicle | undefined> => {
  try {
    const { data, error } = await supabase
      .from("vehicles")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Erro ao buscar veículo:", error);
      return undefined;
    }

    return data || undefined;
  } catch (error) {
    console.error("Erro ao buscar veículo:", error);
    return undefined;
  }
};

export const createVehicle = async (
  vehicle: Omit<Vehicle, "id" | "created_at">
): Promise<Vehicle> => {
  try {
    const { data, error } = await supabase
      .from("vehicles")
      .insert([vehicle])
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar veículo:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Erro ao criar veículo:", error);
    throw error;
  }
};

export const updateVehicle = async (
  id: string,
  vehicleData: Partial<Vehicle>
): Promise<Vehicle | null> => {
  try {
    const { data, error } = await supabase
      .from("vehicles")
      .update(vehicleData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Erro ao atualizar veículo:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Erro ao atualizar veículo:", error);
    return null;
  }
};

export const deleteVehicle = async (id: string): Promise<void> => {
  try {
    // Buscar o veículo para pegar as imagens
    const vehicle = await getVehicleById(id);

    // Deletar o veículo do banco
    const { error } = await supabase.from("vehicles").delete().eq("id", id);

    if (error) {
      console.error("Erro ao deletar veículo:", error);
      throw error;
    }

    // Deletar as imagens do storage (após deletar do banco)
    if (vehicle?.images && vehicle.images.length > 0) {
      await deleteMultipleImages(vehicle.images);
    }
  } catch (error) {
    console.error("Erro ao deletar veículo:", error);
    throw error;
  }
};
