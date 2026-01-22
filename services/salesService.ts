import { PaymentHistory, Sale } from "../types";
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

    // Buscar histórico de pagamentos para cada venda
    if (data && data.length > 0) {
      const salesWithPayments = await Promise.all(
        data.map(async (sale) => {
          const { data: paymentHistory } = await supabase
            .from("payment_history")
            .select("*")
            .eq("sale_id", sale.id)
            .order("date", { ascending: true });

          return {
            ...sale,
            payment_history: paymentHistory || [],
          };
        })
      );

      return salesWithPayments;
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

    if (data) {
      const { data: paymentHistory } = await supabase
        .from("payment_history")
        .select("*")
        .eq("sale_id", data.id)
        .order("date", { ascending: true });

      return {
        ...data,
        payment_history: paymentHistory || [],
      };
    }

    return null;
  } catch (error) {
    console.error("Erro ao buscar venda do veículo:", error);
    return null;
  }
};

export const createSale = async (
  sale: Omit<Sale, "id" | "created_at">
): Promise<Sale> => {
  try {
    // Iniciar transação: criar venda
    const { data, error } = await supabase
      .from("sales")
      .insert([sale])
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar venda:", error);
      throw error;
    }

    // Atualizar status do veículo para "sold"
    const { error: vehicleError } = await supabase
      .from("vehicles")
      .update({ status: "sold" })
      .eq("id", sale.vehicle_id);

    if (vehicleError) {
      console.error("Erro ao atualizar status do veículo:", vehicleError);
      // Não falhar a venda, apenas logar o erro
    }

    return {
      ...data,
      payment_history: [],
    };
  } catch (error) {
    console.error("Erro ao criar venda:", error);
    throw error;
  }
};

export const registerPayment = async (
  saleId: string,
  payment: Omit<PaymentHistory, "id">
): Promise<Sale | null> => {
  try {
    // Inserir o pagamento no histórico
    const { data: paymentData, error: paymentError } = await supabase
      .from("payment_history")
      .insert([{ ...payment, sale_id: saleId }])
      .select()
      .single();

    if (paymentError) {
      console.error("Erro ao registrar pagamento:", paymentError);
      throw paymentError;
    }

    // Buscar a venda atualizada com o histórico de pagamentos
    const { data: saleData, error: saleError } = await supabase
      .from("sales")
      .select("*")
      .eq("id", saleId)
      .single();

    if (saleError) {
      console.error("Erro ao buscar venda:", saleError);
      return null;
    }

    // Buscar todo o histórico de pagamentos
    const { data: paymentHistory } = await supabase
      .from("payment_history")
      .select("*")
      .eq("sale_id", saleId)
      .order("date", { ascending: true });

    return {
      ...saleData,
      payment_history: paymentHistory || [],
    };
  } catch (error) {
    console.error("Erro ao registrar pagamento:", error);
    return null;
  }
};
