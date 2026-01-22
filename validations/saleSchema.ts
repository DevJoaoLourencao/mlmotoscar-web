import * as yup from "yup";

export const saleSchema = yup.object({
  vehicleId: yup.string().required("Selecione um veículo"),

  // Cliente é opcional - pode ser preenchido ou não
  customerId: yup.string().optional(),

  // Novo Cliente
  newCustomerName: yup.string().when("$isNewCustomer", {
    is: true,
    then: (schema) =>
      schema
        .required("Nome do cliente é obrigatório")
        .min(3, "Nome deve ter no mínimo 3 caracteres"),
    otherwise: (schema) => schema.optional(),
  }),

  newCustomerPhone: yup.string().when("$isNewCustomer", {
    is: true,
    then: (schema) => schema.required("Telefone do cliente é obrigatório"),
    otherwise: (schema) => schema.optional(),
  }),

  newCustomerEmail: yup
    .string()
    .optional()
    .test("valid-email", "Email inválido", (value) => {
      if (!value || value.trim() === "") return true;
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }),

  // Pagamento
  paymentMethod: yup
    .string()
    .oneOf(
      ["cash", "financing", "trade_in", "promissory"],
      "Forma de pagamento inválida"
    )
    .required("Selecione a forma de pagamento"),

  totalValue: yup
    .number()
    .required("Valor total é obrigatório")
    .min(1, "Valor total deve ser maior que zero"),

  // Financiamento
  downPayment: yup.number().when("paymentMethod", {
    is: "financing",
    then: (schema) =>
      schema
        .required("Valor de entrada é obrigatório")
        .min(0, "Valor de entrada deve ser positivo")
        .test(
          "less-than-total",
          "Entrada não pode ser maior que o total",
          function (value) {
            return value! <= this.parent.totalValue;
          }
        ),
    otherwise: (schema) => schema.optional(),
  }),

  bankName: yup.string().when("paymentMethod", {
    is: "financing",
    then: (schema) => schema.required("Nome do banco é obrigatório"),
    otherwise: (schema) => schema.optional(),
  }),

  // Troca
  tradeInVehicle: yup.string().when("paymentMethod", {
    is: "trade_in",
    then: (schema) => schema.required("Informe o veículo na troca"),
    otherwise: (schema) => schema.optional(),
  }),

  tradeInValue: yup.number().when("paymentMethod", {
    is: "trade_in",
    then: (schema) =>
      schema
        .required("Valor da troca é obrigatório")
        .min(1, "Valor da troca deve ser maior que zero")
        .test(
          "less-than-total",
          "Troca não pode ser maior que o total",
          function (value) {
            return value! <= this.parent.totalValue;
          }
        ),
    otherwise: (schema) => schema.optional(),
  }),

  // Promissória
  entryValue: yup.number().when("paymentMethod", {
    is: (method: string) => method === "promissory",
    then: (schema) =>
      schema
        .min(0, "Valor de entrada deve ser positivo")
        .test(
          "less-than-total",
          "Entrada não pode ser maior que o total",
          function (value) {
            return value! <= this.parent.totalValue;
          }
        ),
    otherwise: (schema) => schema.optional(),
  }),

  installments: yup.number().when("paymentMethod", {
    is: (method: string) => method === "promissory",
    then: (schema) =>
      schema
        .required("Quantidade de parcelas é obrigatória")
        .min(1, "Deve ter pelo menos 1 parcela")
        .integer("Quantidade deve ser um número inteiro"),
    otherwise: (schema) => schema.optional(),
  }),

  // installmentValue é calculado automaticamente, não precisa validação
});

export const validateSale = async (
  data: any,
  isNewCustomer: boolean
): Promise<{ isValid: boolean; errors: Record<string, string> }> => {
  try {
    await saleSchema.validate(data, {
      abortEarly: false,
      context: { isNewCustomer },
    });
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
