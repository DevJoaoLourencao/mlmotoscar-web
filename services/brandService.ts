import { supabase } from "./supabase";
import { Brand, Model } from "../types";

export async function getBrands(type?: "carro" | "moto"): Promise<Brand[]> {
  try {
    let query = supabase.from("brands").select("*").eq("active", true);

    if (type) {
      query = query.eq("type", type);
    }

    query = query.order("order_index", { ascending: true }).order("name", { ascending: true });

    const { data, error } = await query;

    if (error) {
      console.error("Erro ao buscar marcas:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Erro ao buscar marcas:", error);
    return [];
  }
}

export async function getModels(
  brandId: string,
  type?: "carro" | "moto"
): Promise<Model[]> {
  try {
    let query = supabase
      .from("models")
      .select("*")
      .eq("brand_id", brandId)
      .eq("active", true);

    if (type) {
      query = query.eq("type", type);
    }

    query = query.order("order_index", { ascending: true }).order("name", { ascending: true });

    const { data, error } = await query;

    if (error) {
      console.error("Erro ao buscar modelos:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Erro ao buscar modelos:", error);
    return [];
  }
}

export async function createBrand(brand: Partial<Brand>): Promise<Brand> {
  const { data, error } = await supabase
    .from("brands")
    .insert([brand])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createModel(model: Partial<Model>): Promise<Model> {
  const { data, error } = await supabase
    .from("models")
    .insert([model])
    .select()
    .single();

  if (error) throw error;
  return data;
}

