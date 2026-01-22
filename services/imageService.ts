import { supabase } from "./supabase";

const BUCKET_NAME = "vehicle-images"; // Nome do bucket que você criou

/**
 * Faz upload de uma imagem para o Supabase Storage
 * @param file Arquivo da imagem
 * @param vehicleId ID do veículo (opcional, para organizar por veículo)
 * @returns URL pública da imagem
 */
export async function uploadImage(
  file: File,
  vehicleId?: string
): Promise<string> {
  try {
    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExt = file.name.split(".").pop();
    const fileName = `${timestamp}-${randomString}.${fileExt}`;

    // Definir path do arquivo (organizado por veículo se fornecido)
    const filePath = vehicleId
      ? `${vehicleId}/${fileName}`
      : `temp/${fileName}`;

    // Upload do arquivo
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Erro ao fazer upload:", error);
      throw new Error(`Erro ao fazer upload: ${error.message}`);
    }

    // Obter URL pública da imagem
    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);

    console.log("✅ Upload realizado. URL:", publicUrl);
    console.log("📁 Path:", filePath);

    return publicUrl;
  } catch (error) {
    console.error("Erro no upload da imagem:", error);
    throw error;
  }
}

/**
 * Faz upload de múltiplas imagens
 * @param files Array de arquivos
 * @param vehicleId ID do veículo (opcional)
 * @param onProgress Callback de progresso (opcional)
 * @returns Array de URLs públicas
 */
export async function uploadMultipleImages(
  files: File[],
  vehicleId?: string,
  onProgress?: (current: number, total: number) => void
): Promise<string[]> {
  const urls: string[] = [];

  for (let i = 0; i < files.length; i++) {
    try {
      const url = await uploadImage(files[i], vehicleId);
      urls.push(url);

      // Chamar callback de progresso
      if (onProgress) {
        onProgress(i + 1, files.length);
      }
    } catch (error) {
      console.error(`Erro ao fazer upload da imagem ${i + 1}:`, error);
      // Continuar com as próximas imagens mesmo se uma falhar
    }
  }

  return urls;
}

/**
 * Deleta uma imagem do Supabase Storage
 * @param imageUrl URL pública da imagem
 */
export async function deleteImage(imageUrl: string): Promise<void> {
  try {
    // Extrair o path da imagem da URL
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split(
      `/storage/v1/object/public/${BUCKET_NAME}/`
    );

    if (pathParts.length < 2) {
      console.error("URL inválida:", imageUrl);
      return;
    }

    const filePath = pathParts[1];

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      console.error("Erro ao deletar imagem:", error);
      throw new Error(`Erro ao deletar imagem: ${error.message}`);
    }
  } catch (error) {
    console.error("Erro ao deletar imagem:", error);
    // Não lançar erro para não bloquear a exclusão do veículo
  }
}

/**
 * Deleta múltiplas imagens
 * @param imageUrls Array de URLs públicas
 */
export async function deleteMultipleImages(imageUrls: string[]): Promise<void> {
  const deletePromises = imageUrls.map((url) => deleteImage(url));
  await Promise.allSettled(deletePromises);
}

/**
 * Valida se um arquivo é uma imagem válida
 * @param file Arquivo a ser validado
 * @returns true se válido, false caso contrário
 */
export function validateImageFile(file: File): {
  valid: boolean;
  error?: string;
} {
  // Validar tipo
  if (!file.type.startsWith("image/")) {
    return { valid: false, error: "Arquivo deve ser uma imagem" };
  }

  // Validar tamanho (máximo 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: "Imagem muito grande (máximo 5MB)",
    };
  }

  // Validar formatos aceitos
  const acceptedFormats = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];
  if (!acceptedFormats.includes(file.type)) {
    return {
      valid: false,
      error: "Formato não suportado (use JPG, PNG ou WEBP)",
    };
  }

  return { valid: true };
}
