import { Badge } from "./ui/core";

const METHOD_STYLES: Record<string, { label: string; className: string }> = {
  cash: { label: "A Vista", className: "bg-green-500/10 text-green-600 border-green-200" },
  financing: { label: "Financiado", className: "bg-blue-500/10 text-blue-600 border-blue-200" },
  trade_in: { label: "Troca", className: "bg-orange-500/10 text-orange-600 border-orange-200" },
  promissory: { label: "Promissória", className: "bg-purple-500/10 text-purple-600 border-purple-200" },
};

interface PaymentMethodBadgeProps {
  method: string;
}

export default function PaymentMethodBadge({ method }: PaymentMethodBadgeProps) {
  const style = METHOD_STYLES[method] ?? { label: method, className: "bg-gray-100" };
  return (
    <Badge variant="outline" className={style.className}>
      {style.label}
    </Badge>
  );
}
