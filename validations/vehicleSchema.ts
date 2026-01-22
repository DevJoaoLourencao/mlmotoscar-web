import * as yup from "yup";
import { Vehicle } from "../types";

export const vehicleSchema: yup.Schema<Partial<Vehicle>> = yup.object({
  title: yup.string().optional().nullable(),

  type: yup
    .string()
    .oneOf(["carro", "moto"], "Tipo inválido")
    .required("Categoria é obrigatória"),

  brand_id: yup
    .string()
    .required("Marca/Fabricante é obrigatória")
    .test("not-empty", "Marca/Fabricante é obrigatória", (value) => {
      return value !== undefined && value !== null && value !== "";
    })
    .uuid("ID da marca inválido"),

  model_id: yup
    .string()
    .required("Modelo é obrigatório")
    .test("not-empty", "Modelo é obrigatório", (value) => {
      return value !== undefined && value !== null && value !== "";
    })
    .uuid("ID do modelo inválido"),

  brand: yup.string().optional().nullable(),

  model: yup.string().optional().nullable(),

  price: yup
    .number()
    .required("Preço é obrigatório")
    .transform((value, originalValue) => {
      if (originalValue === undefined || originalValue === null) {
        return undefined;
      }
      if (typeof originalValue === "string" && originalValue.trim() === "") {
        return undefined;
      }
      const num =
        typeof originalValue === "string"
          ? parseFloat(originalValue.replace(",", "."))
          : originalValue;
      return isNaN(num) ? undefined : num;
    })
    .test("required", "Preço é obrigatório", (value) => {
      return value !== undefined && value !== null && !isNaN(value);
    })
    .positive("Preço deve ser maior que zero")
    .min(1, "Preço mínimo é R$ 1,00")
    .max(99999999.99, "Preço máximo é R$ 99.999.999,99")
    .typeError("Preço deve ser um número válido"),

  year: yup
    .number()
    .required("Ano é obrigatório")
    .transform((value, originalValue) => {
      if (originalValue === undefined || originalValue === null) {
        return undefined;
      }
      if (typeof originalValue === "string" && originalValue.trim() === "") {
        return undefined;
      }
      const num =
        typeof originalValue === "string"
          ? parseInt(originalValue, 10)
          : originalValue;
      return isNaN(num) ? undefined : num;
    })
    .test("required", "Ano é obrigatório", (value) => {
      return value !== undefined && value !== null && !isNaN(value);
    })
    .integer("Ano deve ser um número inteiro")
    .min(1900, "Ano mínimo é 1900")
    .max(
      new Date().getFullYear() + 1,
      `Ano máximo é ${new Date().getFullYear() + 1}`
    )
    .typeError("Ano deve ser um número válido"),

  mileage: yup
    .number()
    .required("Quilometragem é obrigatória")
    .transform((value, originalValue) => {
      if (originalValue === undefined || originalValue === null) {
        return undefined;
      }
      if (typeof originalValue === "string" && originalValue.trim() === "") {
        return undefined;
      }
      const num =
        typeof originalValue === "string"
          ? parseInt(originalValue, 10)
          : originalValue;
      return isNaN(num) ? undefined : num;
    })
    .test("required", "Quilometragem é obrigatória", (value) => {
      return value !== undefined && value !== null && !isNaN(value);
    })
    .min(0, "Quilometragem não pode ser negativa")
    .max(9999999, "Quilometragem máxima é 9.999.999 km")
    .integer("Quilometragem deve ser um número inteiro")
    .typeError("Quilometragem deve ser um número válido"),

  color: yup
    .string()
    .max(30, "Cor deve ter no máximo 30 caracteres")
    .nullable()
    .optional(),

  description: yup
    .string()
    .max(5000, "Descrição deve ter no máximo 5000 caracteres")
    .nullable()
    .optional(),

  images: yup
    .array()
    .of(yup.string().url("Imagem deve ser uma URL válida"))
    .required("Imagens são obrigatórias")
    .min(1, "Adicione pelo menos uma imagem")
    .max(10, "Máximo de 10 imagens"),

  plate_end: yup
    .string()
    .max(7, "Placa deve ter no máximo 7 caracteres")
    .nullable()
    .optional(),

  status: yup
    .string()
    .oneOf(["available", "sold", "reserved"], "Status inválido")
    .required("Status é obrigatório"),
});

// Função helper para validar veículo
export const validateVehicle = async (
  data: Partial<Vehicle>
): Promise<{ isValid: boolean; errors: Record<string, string> }> => {
  try {
    await vehicleSchema.validate(data, { abortEarly: false });
    return { isValid: true, errors: {} };
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      const errors: Record<string, string> = {};
      error.inner.forEach((err) => {
        if (err.path) {
          errors[err.path] = err.message;
        }
      });
      return { isValid: false, errors };
    }
    return { isValid: false, errors: { general: "Erro de validação" } };
  }
};

// Função para obter mensagens de erro formatadas
export const getValidationErrors = (errors: Record<string, string>): string => {
  const errorMessages = Object.values(errors);
  return errorMessages.join("\n");
};
