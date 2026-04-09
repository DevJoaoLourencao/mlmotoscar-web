import { Review } from "../types";
import { supabase } from "./supabase";

export const getReviews = async (onlyActive = false): Promise<Review[]> => {
  let query = supabase.from("reviews").select("*").order("created_at", { ascending: false });
  if (onlyActive) query = query.eq("active", true);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

export const createReview = async (review: Omit<Review, "id" | "created_at">): Promise<Review> => {
  const { data, error } = await supabase.from("reviews").insert(review).select().single();
  if (error) throw error;
  return data;
};

export const updateReview = async (id: string, review: Partial<Omit<Review, "id" | "created_at">>): Promise<void> => {
  const { error } = await supabase.from("reviews").update(review).eq("id", id);
  if (error) throw error;
};

export const deleteReview = async (id: string): Promise<void> => {
  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) throw error;
};
