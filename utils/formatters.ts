const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const BRL_FRAC = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
});

/** Formata número para R$ (ex: 1500 → "R$ 1.500,00") */
export const formatCurrencyBRL = (value: number): string => BRL.format(value);

/** Formata número para exibição em campo de preço; retorna "" quando valor é 0 ou undefined */
export const formatCurrencyDisplay = (value: number | undefined): string => {
  if (!value || value === 0) return "";
  return BRL_FRAC.format(value);
};

/** Máscara de input monetário — recebe string bruta do campo, retorna formatada (ex: "15000" → "R$ 150,00") */
export const formatCurrencyInput = (value: string): string => {
  const numbers = value.replace(/\D/g, "");
  const amount = Number(numbers) / 100;
  return BRL_FRAC.format(amount);
};

/** Converte string formatada ou mascarada de volta para número (ex: "R$ 1.500,00" → 1500) */
export const parseCurrencyInput = (value: string): number => {
  const numbers = value.replace(/\D/g, "");
  if (!numbers) return 0;
  return Number(numbers) / 100;
};
