import React, { useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { uploadImage, deleteImage } from "../services/imageService";

interface SingleImageUploadProps {
  image: string | undefined;
  onChange: (imageUrl: string | undefined) => void;
  label?: string;
  folder?: string;
}

export default function SingleImageUpload({
  image,
  onChange,
  label = "Imagem",
  folder = "settings",
}: SingleImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo
    if (!file.type.startsWith("image/")) {
      alert("Por favor, selecione apenas arquivos de imagem.");
      return;
    }

    // Validar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("A imagem deve ter no máximo 5MB.");
      return;
    }

    setUploading(true);
    try {
      const url = await uploadImage(file, folder);
      onChange(url);
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      alert("Erro ao fazer upload da imagem. Tente novamente.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!image) return;

    if (!confirm("Deseja remover esta imagem?")) return;

    try {
      await deleteImage(image);
      onChange(undefined);
    } catch (error) {
      console.error("Erro ao remover imagem:", error);
      alert("Erro ao remover imagem. Tente novamente.");
    }
  };

  return (
    <div className="space-y-3">
      {image ? (
        <div className="relative group">
          <img
            src={image}
            alt={label}
            className="w-full max-w-xs h-32 object-contain rounded-lg border-2 border-border bg-muted/30 p-2"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full max-w-xs h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors bg-muted/30">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {uploading ? (
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            ) : (
              <>
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-xs text-muted-foreground text-center px-4">
                  Clique para fazer upload
                  <br />
                  <span className="text-xs">(PNG, JPG até 5MB)</span>
                </p>
              </>
            )}
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>
      )}
    </div>
  );
}

