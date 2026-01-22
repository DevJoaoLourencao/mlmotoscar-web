import { Loader2, Upload, X } from "lucide-react";
import React, { useRef, useState } from "react";
import {
  deleteImage,
  uploadMultipleImages,
  validateImageFile,
} from "../services/imageService";

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  vehicleId?: string;
}

export default function ImageUpload({
  images,
  onChange,
  maxImages = 10,
  vehicleId,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({
    current: 0,
    total: 0,
  });
  const [error, setError] = useState<string | null>(null);

  // Upload real para Supabase
  const handleBatchFiles = async (files: File[]) => {
    setError(null);
    const remainingSlots = maxImages - images.length;
    const filesToUpload = files.slice(0, remainingSlots);

    // Validar todos os arquivos
    const validationResults = filesToUpload.map((file) =>
      validateImageFile(file)
    );
    const invalidFile = validationResults.find((r) => !r.valid);

    if (invalidFile) {
      setError(invalidFile.error || "Arquivo inválido");
      return;
    }

    try {
      setUploading(true);
      setUploadProgress({ current: 0, total: filesToUpload.length });

      const urls = await uploadMultipleImages(
        filesToUpload,
        vehicleId,
        (current, total) => {
          setUploadProgress({ current, total });
        }
      );

      console.log("✅ Upload concluído. URLs:", urls);
      onChange([...images, ...urls]);

      // Limpar input file
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error("Erro ao fazer upload:", err);
      setError("Erro ao fazer upload das imagens. Tente novamente.");
    } finally {
      setUploading(false);
      setUploadProgress({ current: 0, total: 0 });
    }
  };

  const removeImage = async (index: number) => {
    const imageToRemove = images[index];

    // Se for uma URL do Supabase, deletar do storage
    if (imageToRemove.includes("supabase.co/storage")) {
      try {
        await deleteImage(imageToRemove);
        console.log("🗑️ Imagem deletada do storage:", imageToRemove);
      } catch (error) {
        console.error("Erro ao deletar imagem:", error);
        // Continuar mesmo se der erro na deleção
      }
    }

    const newImages = [...images];
    newImages.splice(index, 1);
    onChange(newImages);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleBatchFiles(Array.from(e.dataTransfer.files));
    }
  };

  return (
    <div className="space-y-4">
      {/* Erro de upload */}
      {error && (
        <div className="p-3 rounded-md bg-red-500/10 dark:bg-red-500/20 border border-red-500/30 dark:border-red-500/40">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Dropzone */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center transition-colors ${
          uploading
            ? "border-primary bg-primary/10 cursor-wait"
            : isDragging
            ? "border-primary bg-primary/10 cursor-pointer"
            : "border-border hover:border-primary/50 bg-muted/20 cursor-pointer"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          multiple
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={(e) => {
            if (e.target.files) handleBatchFiles(Array.from(e.target.files));
          }}
          disabled={uploading}
        />

        {uploading ? (
          <>
            <Loader2 className="h-10 w-10 mb-4 text-primary animate-spin" />
            <p className="text-sm font-medium text-foreground">
              Fazendo upload... {uploadProgress.current}/{uploadProgress.total}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Aguarde, não feche esta página
            </p>
          </>
        ) : (
          <>
            <Upload
              className={`h-10 w-10 mb-4 ${
                isDragging ? "text-primary" : "text-muted-foreground"
              }`}
            />
            <p className="text-sm font-medium text-foreground">
              Clique para fazer upload ou arraste e solte
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              PNG, JPG ou WEBP (Max {maxImages} imagens, 5MB cada)
            </p>
          </>
        )}
      </div>

      {/* Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((img, index) => (
            <div
              key={index}
              className="relative aspect-square group rounded-lg overflow-hidden border border-border"
            >
              <img
                src={img}
                alt={`Preview ${index}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error("❌ Erro ao carregar imagem:", img);
                  e.currentTarget.src =
                    "https://via.placeholder.com/300?text=Erro+ao+carregar";
                }}
                onLoad={() => {
                  console.log("✅ Imagem carregada:", img);
                }}
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg hover:shadow-xl opacity-70 group-hover:opacity-100 transition-all hover:scale-110"
                title="Remover imagem (será excluída do storage)"
              >
                <X className="h-4 w-4" />
              </button>
              {index === 0 && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] text-center py-1">
                  Capa Principal
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
