import { Customer } from "../types";
import { supabase } from "./supabase";

export const getCustomers = async (): Promise<Customer[]> => {
  try {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar clientes:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Erro ao buscar clientes:", error);
    return [];
  }
};

export const createCustomer = async (
  customer: Omit<Customer, "id" | "created_at">
): Promise<Customer> => {
  try {
    const { data, error } = await supabase
      .from("customers")
      .insert([customer])
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar cliente:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Erro ao criar cliente:", error);
    throw error;
  }
};

export const updateCustomer = async (
  id: string,
  customerData: Partial<Customer>
): Promise<Customer | null> => {
  try {
    const { data, error } = await supabase
      .from("customers")
      .update(customerData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Erro ao atualizar cliente:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error);
    return null;
  }
};

export const deleteCustomer = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase.from("customers").delete().eq("id", id);

    if (error) {
      console.error("Erro ao deletar cliente:", error);
      throw error;
    }
  } catch (error) {
    console.error("Erro ao deletar cliente:", error);
    throw error;
  }
};
