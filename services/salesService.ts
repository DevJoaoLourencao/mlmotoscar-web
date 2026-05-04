import { Sale } from "../types";
import { supabase } from "./supabase";

export const getSales = async (): Promise<Sale[]> => {
  try {
    const { data, error } = await supabase
      .from("sales")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar vendas:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Erro ao buscar vendas:", error);
    return [];
  }
};

export const getSaleByVehicleId = async (
  vehicleId: string
): Promise<Sale | null> => {
  try {
    const { data, error } = await supabase
      .from("sales")
      .select("*")
      .eq("vehicle_id", vehicleId)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error("Erro ao buscar venda do veículo:", error);
      return null;
    }

    return data || null;
  } catch (error) {
    console.error("Erro ao buscar venda do veículo:", error);
    return null;
  }
};

export const createSale = async (
  sale: Omit<Sale, "id" | "created_at">
): Promise<Sale> => {
  try {
    const { data, error } = await supabase
      .from("sales")
      .insert([sale])
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar venda:", error);
      throw error;
    }

    const { error: vehicleError } = await supabase
      .from("vehicles")
      .update({ status: "sold" })
      .eq("id", sale.vehicle_id);

    if (vehicleError) {
      console.error("Erro ao atualizar status do veículo:", vehicleError);
    }

    return data;
  } catch (error) {
    console.error("Erro ao criar venda:", error);
    throw error;
  }
};
