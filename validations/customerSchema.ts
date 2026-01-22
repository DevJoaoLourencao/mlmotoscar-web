import * as yup from "yup";
import { Customer } from "../types";

// Validação de CPF
const validateCPF = (cpf: string | undefined): boolean => {
  if (!cpf) return true; // Opcional
  
  const cleanCPF = cpf.replace(/\D/g, "");
  
  if (cleanCPF.length !== 11) return false;
  
  // CPFs inválidos conhecidos
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  // Validar dígitos verificadores
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleanCPF.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleanCPF.charAt(10))) return false;
  
  return true;
};

// Validação de telefone brasileiro
const validatePhone = (phone: string | undefined): boolean => {
  if (!phone) return false; // Obrigatório
  
  const cleanPhone = phone.replace(/\D/g, "");
  
  // Aceitar 10 ou 11 dígitos (com ou sem 9 no celular)
  return cleanPhone.length === 10 || cleanPhone.length === 11;
};

export const customerSchema: yup.Schema<Partial<Customer>> = yup.object({
  name: yup
    .string()
    .required("Nome é obrigatório")
    .min(3, "Nome deve ter no mínimo 3 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres")
    .test("not-empty", "Nome não pode ser apenas espaços", (value) => {
      return value ? value.trim().length > 0 : false;
    }),

  email: yup
    .string()
    .nullable()
    .optional()
    .test("valid-email", "Email inválido", (value) => {
      if (!value || value.trim() === "") return true; // Opcional
      // Validação básica de email
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    })
    .max(100, "Email deve ter no máximo 100 caracteres"),

  phone: yup
    .string()
    .required("Telefone é obrigatório")
    .test("valid-phone", "Telefone inválido (use formato: (11) 98765-4321)", (value) => {
      return validatePhone(value);
    }),

  cpf: yup
    .string()
    .nullable()
    .optional()
    .test("valid-cpf", "CPF inválido", (value) => {
      if (!value || value.trim() === "") return true; // Opcional
      return validateCPF(value);
    }),

  birth_date: yup
    .string()
    .nullable()
    .optional()
    .test("valid-date", "Data inválida", (value) => {
      if (!value || value.trim() === "") return true; // Opcional
      // Validar formato DD/MM/YYYY
      const regex = /^\d{2}\/\d{2}\/\d{4}$/;
      if (!regex.test(value)) return false;
      
      const [day, month, year] = value.split("/").map(Number);
      const date = new Date(year, month - 1, day);
      
      // Verificar se é uma data válida
      if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
      ) {
        return false;
      }
      
      // Verificar se não é uma data futura
      if (date > new Date()) return false;
      
      // Verificar se a pessoa tem pelo menos 18 anos
      const today = new Date();
      const minDate = new Date(
        today.getFullYear() - 18,
        today.getMonth(),
        today.getDate()
      );
      
      return date <= minDate;
    }),
});

// Função helper para validar cliente
export const validateCustomer = async (
  data: Partial<Customer>
): Promise<{ isValid: boolean; errors: Record<string, string> }> => {
  try {
    await customerSchema.validate(data, { abortEarly: false });
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

// Máscaras para formatação
export const formatPhone = (value: string): string => {
  const numbers = value.replace(/\D/g, "");
  
  if (numbers.length <= 10) {
    // (11) 1234-5678
    return numbers
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  } else {
    // (11) 98765-4321
    return numbers
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .slice(0, 15);
  }
};

export const formatCPF = (value: string): string => {
  const numbers = value.replace(/\D/g, "");
  
  // 123.456.789-01
  return numbers
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1-$2")
    .slice(0, 14);
};

export const formatBirthDate = (value: string): string => {
  const numbers = value.replace(/\D/g, "");
  
  // DD/MM/YYYY
  if (numbers.length <= 2) {
    return numbers;
  } else if (numbers.length <= 4) {
    return numbers.replace(/(\d{2})(\d)/, "$1/$2");
  } else {
    return numbers
      .replace(/(\d{2})(\d{2})(\d)/, "$1/$2/$3")
      .slice(0, 10);
  }
};

