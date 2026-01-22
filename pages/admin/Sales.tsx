import {
  AlertTriangle,
  Calendar,
  Car,
  CreditCard,
  DollarSign,
  Eye,
  FileText,
  MoreVertical,
  Plus,
  Search,
  User,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AdminPageContainer,
  AdminPageHeader,
} from "../../components/AdminPageComponents";
import { Combobox } from "../../components/ui/combobox";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Skeleton,
} from "../../components/ui/core";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { createCustomer, getCustomers } from "../../services/customerService";
import { createSale, getSales } from "../../services/salesService";
import { getVehicles } from "../../services/vehicleService";
import {
  Customer,
  PaymentDetails,
  PaymentMethodType,
  Sale,
  Vehicle,
} from "../../types";
import { validateSale } from "../../validations/saleSchema";

export default function Sales() {
  const location = useLocation();
  const navigate = useNavigate();
  const hasProcessedPreselection = useRef(false);

  const [sales, setSales] = useState<Sale[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [search, setSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // Calcular métricas
  const getSalesStats = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const salesThisMonth = sales.filter((sale) => {
      const saleDate = new Date(sale.created_at);
      return (
        saleDate.getMonth() === currentMonth &&
        saleDate.getFullYear() === currentYear &&
        sale.status !== "canceled"
      );
    });

    const totalSalesThisMonth = salesThisMonth.reduce(
      (sum, sale) => sum + sale.payment.total_value,
      0
    );

    const completedSales = sales.filter((s) => s.status === "completed");
    const averageTicket =
      completedSales.length > 0
        ? completedSales.reduce((sum, s) => sum + s.payment.total_value, 0) /
          completedSales.length
        : 0;

    return {
      salesThisMonth: totalSalesThisMonth,
      totalSalesCount: completedSales.length,
      salesThisMonthCount: salesThisMonth.length,
      averageTicket,
    };
  };

  const stats = getSalesStats();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Formatar valor monetário para exibição
  const formatCurrencyInput = (value: string): string => {
    const numbers = value.replace(/\D/g, "");
    const amount = Number(numbers) / 100;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Extrair valor numérico de string formatada
  const parseCurrencyInput = (value: string): number => {
    const numbers = value.replace(/\D/g, "");
    return Number(numbers) / 100;
  };

  // Form State
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [formData, setFormData] = useState({
    vehicleId: "",
    customerId: "",
    // New Customer Data
    newCustomerName: "",
    newCustomerEmail: "",
    newCustomerPhone: "",
    newCustomerCpf: "",
    // Payment Data
    paymentMethod: "cash" as PaymentMethodType,
    totalValue: 0,
    // Specific Fields
    downPayment: 0, // Entrada (Financiamento)
    bankName: "", // Banco (Financiamento)
    tradeInVehicle: "", // Veículo de Troca
    tradeInValue: 0, // Valor da Troca
    entryValue: 0, // Entrada (Promissória/Misto)
    installments: 0, // Qtd Parcelas - inicia vazio
    installmentValue: 0, // Valor Parcela
    notes: "",
  });

  const loadData = async () => {
    setLoading(true);
    const [sData, vData, cData] = await Promise.all([
      getSales(),
      getVehicles(),
      getCustomers(),
    ]);
    setSales(sData);
    // Filtrar apenas veículos disponíveis para venda
    setVehicles(vData.filter((v) => v.status === "available"));
    setCustomers(cData);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Detectar veículo pré-selecionado vindo do Inventory
  useEffect(() => {
    const state = location.state as { preSelectedVehicleId?: string };

    if (
      state?.preSelectedVehicleId &&
      vehicles.length > 0 &&
      !hasProcessedPreselection.current
    ) {
      const vehicle = vehicles.find((v) => v.id === state.preSelectedVehicleId);
      if (vehicle) {
        // Marcar como processado
        hasProcessedPreselection.current = true;

        // Resetar formulário antes de selecionar
        setValidationErrors({});
        setIsNewCustomer(false);

        // Selecionar veículo e abrir modal
        handleVehicleSelect(state.preSelectedVehicleId);
        setIsModalOpen(true);

        // Limpar o state da navegação
        navigate("/admin/vendas", { replace: true, state: {} });
      }
    }
  }, [location.state, vehicles, navigate]);

  // Calcular automaticamente o valor da parcela
  useEffect(() => {
    if (formData.paymentMethod === "promissory") {
      if (formData.totalValue > 0 && formData.installments > 0) {
        const remaining = formData.totalValue - formData.entryValue;
        const calculatedInstallment = remaining / formData.installments;

        // Arredondar para 2 casas decimais
        const roundedInstallment =
          Math.round(calculatedInstallment * 100) / 100;

        // Só atualiza se for diferente do valor atual (evita loop infinito)
        if (Math.abs(roundedInstallment - formData.installmentValue) > 0.01) {
          setFormData((prev) => ({
            ...prev,
            installmentValue: roundedInstallment,
          }));
        }
      }
    }
  }, [
    formData.paymentMethod,
    formData.totalValue,
    formData.entryValue,
    formData.installments,
  ]);

  const resetForm = () => {
    setFormData({
      vehicleId: "",
      customerId: "",
      newCustomerName: "",
      newCustomerEmail: "",
      newCustomerPhone: "",
      newCustomerCpf: "",
      paymentMethod: "cash",
      totalValue: 0,
      downPayment: 0,
      bankName: "",
      tradeInVehicle: "",
      tradeInValue: 0,
      entryValue: 0,
      installments: 0,
      installmentValue: 0,
      notes: "",
    });
    setIsNewCustomer(false);
    setValidationErrors({});
    setIsSubmitting(false);
    hasProcessedPreselection.current = false;
  };

  const openNewModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (!isSubmitting) {
      resetForm();
      setIsModalOpen(false);
    }
  };

  // Auto-fill price when vehicle selected
  const handleVehicleSelect = (vId: string) => {
    const vehicle = vehicles.find((v) => v.id === vId);

    // Limpar erros relacionados
    if (validationErrors.vehicleId || validationErrors.totalValue) {
      const newErrors = { ...validationErrors };
      delete newErrors.vehicleId;
      delete newErrors.totalValue;
      setValidationErrors(newErrors);
    }

    setFormData((prev) => ({
      ...prev,
      vehicleId: vId,
      totalValue: vehicle ? vehicle.price : 0,
    }));
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 10) {
      return numbers
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{4})(\d)/, "$1-$2");
    }
    return numbers
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1");
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    // Limpar erro do campo quando o usuário começar a digitar
    if (validationErrors[name]) {
      const newErrors = { ...validationErrors };
      delete newErrors[name];
      setValidationErrors(newErrors);
    }

    let processedValue = value;
    if (name === "newCustomerPhone") {
      processedValue = formatPhone(value);
    } else if (
      [
        "totalValue",
        "downPayment",
        "tradeInValue",
        "entryValue",
        "installments",
        "installmentValue",
      ].includes(name)
    ) {
      processedValue = Number(value) as any;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));
  };

  // Handler para campos monetários com máscara
  const handleCurrencyChange = (name: string, value: string) => {
    const numericValue = parseCurrencyInput(value);

    // Limpar erro do campo
    if (validationErrors[name]) {
      const newErrors = { ...validationErrors };
      delete newErrors[name];
      setValidationErrors(newErrors);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: numericValue,
    }));
  };

  // Validar se os campos obrigatórios estão preenchidos
  const isFormValid = () => {
    // Campos básicos obrigatórios
    if (
      !formData.vehicleId ||
      !formData.paymentMethod ||
      formData.totalValue <= 0
    ) {
      return false;
    }

    // Validar cliente apenas se usuário começou a preencher
    if (isNewCustomer) {
      // Se marcou "Novo Cliente", deve preencher nome e telefone
      if (
        !formData.newCustomerName?.trim() ||
        !formData.newCustomerPhone?.trim()
      ) {
        return false;
      }
    }
    // Se NÃO é novo cliente, não exige seleção (cliente é opcional para desbloquear botão)
    // A validação completa será feita no Yup ao submeter

    // Validar apenas campos obrigatórios (*) por método de pagamento
    switch (formData.paymentMethod) {
      case "financing":
        // Campos obrigatórios: Nome do Banco
        if (!formData.bankName?.trim()) {
          return false;
        }
        break;
      case "trade_in":
        // Campos obrigatórios: Veículo na Troca e Valor Avaliado
        if (!formData.tradeInVehicle?.trim() || formData.tradeInValue <= 0) {
          return false;
        }
        break;
      case "promissory":
        // Campos obrigatórios: Qtd. Parcelas
        if (!formData.installments || formData.installments <= 0) {
          return false;
        }
        break;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevenir múltiplas submissões
    if (isSubmitting) {
      return;
    }

    // Limpar erros anteriores
    setValidationErrors({});

    // Validar com Yup
    const { isValid, errors } = await validateSale(formData, isNewCustomer);

    if (!isValid) {
      setValidationErrors(errors);

      // Rolar para o topo do modal para ver os erros
      setTimeout(() => {
        const modalContent = document.querySelector('[role="dialog"]');
        if (modalContent) {
          modalContent.scrollTop = 0;
        }
      }, 100);

      return;
    }

    setIsSubmitting(true);
    try {
      let finalCustomerId: string | null = formData.customerId || null;
      let finalCustomerName: string | null = null;

      // Handle New Customer Creation
      if (isNewCustomer) {
        const newCust = await createCustomer({
          name: formData.newCustomerName,
          email: formData.newCustomerEmail || undefined,
          phone: formData.newCustomerPhone,
          cpf: formData.newCustomerCpf || undefined,
        });
        finalCustomerId = newCust.id;
        finalCustomerName = newCust.name;
      } else if (finalCustomerId) {
        // Se selecionou cliente existente, buscar o nome
        finalCustomerName =
          customers.find((c) => c.id === finalCustomerId)?.name || null;
      }
      // Se não selecionou cliente e não é novo, deixa null

      const vehicle = vehicles.find((v) => v.id === formData.vehicleId);

      // Build Payment Object
      const paymentDetails: any = {
        method: formData.paymentMethod,
        total_value: formData.totalValue,
      };

      if (formData.paymentMethod === "financing") {
        paymentDetails.down_payment = formData.downPayment;
        paymentDetails.bank_name = formData.bankName;
        paymentDetails.financed_amount =
          formData.totalValue - formData.downPayment;
      } else if (formData.paymentMethod === "trade_in") {
        paymentDetails.trade_in_vehicle = formData.tradeInVehicle;
        paymentDetails.trade_in_value = formData.tradeInValue;
      } else if (formData.paymentMethod === "promissory") {
        paymentDetails.entry_value = formData.entryValue;
        paymentDetails.installment_count = formData.installments;
        paymentDetails.installment_value = formData.installmentValue;
      }

      await createSale({
        vehicle_id: formData.vehicleId,
        vehicle_title: vehicle?.title || "Veículo",
        customer_id: finalCustomerId as any,
        customer_name: finalCustomerName as any,
        payment: paymentDetails,
        status: "completed",
        notes: formData.notes,
      });

      // Resetar formulário e fechar modal
      resetForm();
      setIsModalOpen(false);
      await loadData();
    } catch (error) {
      console.error("Erro ao registrar venda:", error);
      alert("Erro ao registrar venda. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPaymentFields = () => {
    switch (formData.paymentMethod) {
      case "cash":
        return (
          <div className="p-3 bg-muted/50 rounded-md border border-border">
            <p className="text-sm text-muted-foreground">
              Pagamento integral via Dinheiro, PIX ou Transferência.
            </p>
          </div>
        );
      case "financing":
        return (
          <div className="grid grid-cols-2 gap-4 p-3 bg-muted/50 rounded-md border border-border animate-in fade-in">
            <div className="space-y-2">
              <Label>Valor de Entrada *</Label>
              <Input
                type="text"
                name="downPayment"
                value={formatCurrencyInput(String(formData.downPayment * 100))}
                onChange={(e) =>
                  handleCurrencyChange("downPayment", e.target.value)
                }
                placeholder="R$ 0,00"
                className={
                  validationErrors.downPayment
                    ? "bg-background border-red-500 dark:border-red-400"
                    : "bg-background"
                }
              />
              {validationErrors.downPayment && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {validationErrors.downPayment}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Nome do Banco *</Label>
              <Input
                name="bankName"
                value={formData.bankName}
                onChange={handleInputChange}
                placeholder="Ex: Santander"
                className={
                  validationErrors.bankName
                    ? "bg-background border-red-500 dark:border-red-400"
                    : "bg-background"
                }
              />
              {validationErrors.bankName && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {validationErrors.bankName}
                </p>
              )}
            </div>
            <div className="col-span-2">
              <p className="text-sm font-medium">
                Valor Financiado:{" "}
                {formatCurrency(formData.totalValue - formData.downPayment)}
              </p>
            </div>
          </div>
        );
      case "trade_in":
        return (
          <div className="grid grid-cols-2 gap-4 p-3 bg-muted/50 rounded-md border border-border animate-in fade-in">
            <div className="space-y-2">
              <Label>Veículo na Troca *</Label>
              <Input
                name="tradeInVehicle"
                value={formData.tradeInVehicle}
                onChange={handleInputChange}
                placeholder="Modelo e Ano"
                className={
                  validationErrors.tradeInVehicle
                    ? "bg-background border-red-500 dark:border-red-400"
                    : "bg-background"
                }
              />
              {validationErrors.tradeInVehicle && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {validationErrors.tradeInVehicle}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Valor Avaliado *</Label>
              <Input
                type="text"
                name="tradeInValue"
                value={formatCurrencyInput(String(formData.tradeInValue * 100))}
                onChange={(e) =>
                  handleCurrencyChange("tradeInValue", e.target.value)
                }
                placeholder="R$ 0,00"
                className={
                  validationErrors.tradeInValue
                    ? "bg-background border-red-500 dark:border-red-400"
                    : "bg-background"
                }
              />
              {validationErrors.tradeInValue && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {validationErrors.tradeInValue}
                </p>
              )}
            </div>
            <div className="col-span-2">
              <p className="text-sm font-medium">
                Saldo a Pagar:{" "}
                {formatCurrency(formData.totalValue - formData.tradeInValue)}
              </p>
            </div>
          </div>
        );
      case "promissory":
        return (
          <div className="space-y-4 p-3 bg-muted/50 rounded-md border border-border animate-in fade-in">
            {/* 1. Valor de Entrada (linha inteira) */}
            <div className="space-y-2">
              <Label>Valor de Entrada</Label>
              <Input
                type="text"
                name="entryValue"
                value={formatCurrencyInput(String(formData.entryValue * 100))}
                onChange={(e) =>
                  handleCurrencyChange("entryValue", e.target.value)
                }
                placeholder="R$ 0,00"
                className={
                  validationErrors.entryValue
                    ? "bg-background border-red-500 dark:border-red-400"
                    : "bg-background"
                }
              />
              {validationErrors.entryValue && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {validationErrors.entryValue}
                </p>
              )}
            </div>

            {/* 2. Valor a Parcelar e Qtd. Parcelas (lado a lado) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Valor a Parcelar</Label>
                <Input
                  type="text"
                  value={formatCurrency(
                    formData.totalValue - formData.entryValue
                  )}
                  readOnly
                  className="bg-muted text-muted-foreground cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <Label>Qtd. Parcelas *</Label>
                <Input
                  type="number"
                  name="installments"
                  value={formData.installments || ""}
                  onChange={handleInputChange}
                  placeholder="Ex: 12"
                  className={
                    validationErrors.installments
                      ? "bg-background border-red-500 dark:border-red-400"
                      : "bg-background"
                  }
                />
                {validationErrors.installments && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {validationErrors.installments}
                  </p>
                )}
              </div>
            </div>

            {/* 3. Valor da Parcela (linha inteira) */}
            <div className="space-y-2">
              <Label>Valor da Parcela (Calculado)</Label>
              <Input
                type="text"
                name="installmentValue"
                value={formatCurrencyInput(
                  String(formData.installmentValue * 100)
                )}
                readOnly
                placeholder="R$ 0,00"
                className="bg-muted/50 cursor-not-allowed font-semibold"
              />
              <p className="text-xs text-muted-foreground">
                Calculado: (Valor Total - Entrada) ÷ Parcelas
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const getMethodBadge = (method: string) => {
    const styles: any = {
      cash: {
        label: "A Vista",
        class: "bg-green-500/10 text-green-600 border-green-200",
      },
      financing: {
        label: "Financiado",
        class: "bg-blue-500/10 text-blue-600 border-blue-200",
      },
      trade_in: {
        label: "Troca",
        class: "bg-orange-500/10 text-orange-600 border-orange-200",
      },
      promissory: {
        label: "Promissória",
        class: "bg-purple-500/10 text-purple-600 border-purple-200",
      },
    };
    const style = styles[method] || { label: method, class: "bg-gray-100" };
    return (
      <Badge variant="outline" className={style.class}>
        {style.label}
      </Badge>
    );
  };

  const openDetailsModal = (sale: Sale) => {
    setSelectedSale(sale);
    setIsDetailsModalOpen(true);
  };

  const renderPaymentDetails = (payment: PaymentDetails) => {
    switch (payment.method) {
      case "cash":
        return (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Valor Total:</span>
              <span className="font-bold">
                {formatCurrency(payment.total_value)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Pagamento integral via Dinheiro, PIX ou Transferência.
            </p>
          </div>
        );
      case "financing":
        return (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Valor Total:</span>
              <span className="font-bold">
                {formatCurrency(payment.total_value)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Entrada:</span>
              <span>{formatCurrency(payment.down_payment || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Valor Financiado:</span>
              <span>{formatCurrency(payment.financed_amount || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Banco:</span>
              <span>{payment.bank_name || "N/A"}</span>
            </div>
          </div>
        );
      case "trade_in":
        return (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Valor Total:</span>
              <span className="font-bold">
                {formatCurrency(payment.total_value)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Veículo na Troca:</span>
              <span>{payment.trade_in_vehicle || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Valor da Troca:</span>
              <span>{formatCurrency(payment.trade_in_value || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Saldo a Pagar:</span>
              <span className="font-bold">
                {formatCurrency(
                  payment.total_value - (payment.trade_in_value || 0)
                )}
              </span>
            </div>
          </div>
        );
      case "promissory":
        return (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Valor Total:</span>
              <span className="font-bold">
                {formatCurrency(payment.total_value)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Entrada:</span>
              <span>{formatCurrency(payment.entry_value || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Valor a Parcelar:</span>
              <span>
                {formatCurrency(
                  payment.total_value - (payment.entry_value || 0)
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Qtd. Parcelas:</span>
              <span>{payment.installment_count || 0}x</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Valor da Parcela:</span>
              <span className="font-bold">
                {formatCurrency(payment.installment_value || 0)}
              </span>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <AdminPageContainer>
      <AdminPageHeader
        title="Gestão de Vendas"
        description="Registre e controle as vendas de veículos."
        actions={
          <Button
            onClick={openNewModal}
            className="w-full md:w-auto gap-2 shadow-md"
          >
            <Plus className="h-4 w-4" /> Nova Venda
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border-border shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-full bg-green-500/10 text-green-500">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Vendas (Mês)</p>
              {loading ? (
                <Skeleton className="h-8 w-32 mt-1" />
              ) : (
                <>
                  <h3 className="text-2xl font-bold text-foreground">
                    {formatCurrency(stats.salesThisMonth)}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.salesThisMonthCount}{" "}
                    {stats.salesThisMonthCount === 1 ? "venda" : "vendas"}
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-full bg-blue-500/10 text-blue-500">
              <Car className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Vendidos</p>
              {loading ? (
                <Skeleton className="h-8 w-16 mt-1" />
              ) : (
                <>
                  <h3 className="text-2xl font-bold text-foreground">
                    {stats.totalSalesCount}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    veículos concluídos
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-full bg-purple-500/10 text-purple-500">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ticket Médio</p>
              {loading ? (
                <Skeleton className="h-8 w-32 mt-1" />
              ) : (
                <>
                  <h3 className="text-2xl font-bold text-foreground">
                    {formatCurrency(stats.averageTicket)}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    valor médio por venda
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border shadow-sm">
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <CardTitle className="text-foreground">Histórico de Vendas</CardTitle>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cliente ou veículo..."
              className="pl-8 bg-background border-input text-foreground w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm text-left">
              <thead className="[&_tr]:border-b">
                <tr className="border-b border-border transition-colors hover:bg-muted/50">
                  <th className="h-12 px-4 align-middle font-semibold text-foreground/80">
                    Data
                  </th>
                  <th className="h-12 px-4 align-middle font-semibold text-foreground/80">
                    Cliente
                  </th>
                  <th className="h-12 px-4 align-middle font-semibold text-foreground/80">
                    Veículo
                  </th>
                  <th className="h-12 px-4 align-middle font-semibold text-foreground/80">
                    Forma Pagto.
                  </th>
                  <th className="h-12 px-4 align-middle font-semibold text-foreground/80">
                    Valor Total
                  </th>
                  <th className="h-12 px-4 align-middle font-semibold text-foreground/80 text-right">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {loading
                  ? [1, 2, 3].map((i) => (
                      <tr key={i} className="border-b border-border">
                        <td className="p-4">
                          <Skeleton className="h-6 w-24" />
                        </td>
                        <td className="p-4">
                          <Skeleton className="h-6 w-32" />
                        </td>
                        <td className="p-4">
                          <Skeleton className="h-6 w-32" />
                        </td>
                        <td className="p-4">
                          <Skeleton className="h-6 w-24" />
                        </td>
                        <td className="p-4">
                          <Skeleton className="h-6 w-24" />
                        </td>
                        <td className="p-4 text-right">
                          <Skeleton className="h-8 w-8 ml-auto" />
                        </td>
                      </tr>
                    ))
                  : sales
                      .filter((sale) => sale.status !== "canceled")
                      .filter(
                        (sale) =>
                          (sale.customer_name
                            ?.toLowerCase()
                            .includes(search.toLowerCase()) ??
                            false) ||
                          sale.vehicle_title
                            .toLowerCase()
                            .includes(search.toLowerCase())
                      )
                      .map((sale) => (
                        <tr
                          key={sale.id}
                          className="border-b border-border transition-colors hover:bg-muted/20"
                        >
                          <td className="p-4 align-middle text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              {new Date(sale.created_at).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="p-4 align-middle font-medium text-foreground">
                            {sale.customer_name || "Cliente não informado"}
                          </td>
                          <td className="p-4 align-middle text-foreground">
                            {sale.vehicle_title}
                          </td>
                          <td className="p-4 align-middle">
                            {getMethodBadge(sale.payment.method)}
                          </td>
                          <td className="p-4 align-middle font-bold text-foreground">
                            {new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            }).format(sale.payment.total_value)}
                          </td>
                          <td className="p-4 align-middle text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-primary"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => openDetailsModal(sale)}
                                  className="cursor-pointer"
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  Ver Detalhes
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                {!loading &&
                  sales
                    .filter((sale) => sale.status !== "canceled")
                    .filter(
                      (sale) =>
                        (sale.customer_name
                          ?.toLowerCase()
                          .includes(search.toLowerCase()) ??
                          false) ||
                        sale.vehicle_title
                          .toLowerCase()
                          .includes(search.toLowerCase())
                    ).length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="p-8 text-center text-muted-foreground"
                      >
                        {search
                          ? "Nenhuma venda encontrada com esse filtro."
                          : "Nenhuma venda registrada ainda."}
                      </td>
                    </tr>
                  )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* New Sale Dialog */}
      <Dialog open={isModalOpen} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent
          className="w-full max-w-[50vw] sm:max-w-6xl lg:max-w-7xl xl:max-w-[50vw] max-h-[70vh] overflow-y-auto"
          onClose={closeModal}
        >
          <DialogHeader>
            <DialogTitle>Registrar Nova Venda</DialogTitle>
            <DialogDescription>
              Preencha os dados da venda abaixo.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 py-2">
            {/* Erros de Validação */}
            {Object.keys(validationErrors).length > 0 && (
              <div className="p-4 rounded-md bg-red-500/10 dark:bg-red-500/20 border border-red-500/30 dark:border-red-500/40">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2">
                      Corrija os seguintes erros:
                    </h3>
                    <ul className="text-sm text-red-600 dark:text-red-300 list-disc list-inside space-y-1">
                      {Object.entries(validationErrors).map(
                        ([field, error]) => (
                          <li key={field}>{error}</li>
                        )
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* 1. Vehicle Selection */}
            <div className="space-y-2">
              <Label className="text-foreground font-bold flex items-center gap-2">
                <Car className="h-4 w-4" /> Veículo *
              </Label>
              <Combobox
                options={vehicles.map((v) => ({
                  value: v.id,
                  label: `${v.title} - ${formatCurrency(v.price)}`,
                }))}
                value={formData.vehicleId}
                onValueChange={handleVehicleSelect}
                placeholder="Selecione o veículo..."
                emptyText="Nenhum veículo disponível"
                searchPlaceholder="Buscar veículo..."
                error={!!validationErrors.vehicleId}
              />
              {validationErrors.vehicleId && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {validationErrors.vehicleId}
                </p>
              )}
            </div>

            {/* 2. Customer Selection */}
            <div className="space-y-3 border-t border-border pt-4">
              <div className="flex justify-between items-center">
                <Label className="text-foreground font-bold flex items-center gap-2">
                  <User className="h-4 w-4" /> Cliente
                </Label>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="newCust"
                    checked={isNewCustomer}
                    onChange={(e) => setIsNewCustomer(e.target.checked)}
                    className="rounded border-input text-primary focus:ring-primary"
                  />
                  <Label
                    htmlFor="newCust"
                    className="text-xs cursor-pointer text-muted-foreground"
                  >
                    Novo Cadastro
                  </Label>
                </div>
              </div>

              {isNewCustomer ? (
                <div className="p-3 bg-muted/30 rounded-lg space-y-3 animate-in fade-in">
                  <div>
                    <Input
                      name="newCustomerName"
                      value={formData.newCustomerName}
                      onChange={handleInputChange}
                      placeholder="Nome Completo *"
                      className={
                        validationErrors.newCustomerName
                          ? "bg-background border-red-500 dark:border-red-400"
                          : "bg-background"
                      }
                      required
                    />
                    {validationErrors.newCustomerName && (
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                        {validationErrors.newCustomerName}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Input
                        name="newCustomerPhone"
                        value={formData.newCustomerPhone}
                        onChange={handleInputChange}
                        placeholder="Telefone *"
                        className={
                          validationErrors.newCustomerPhone
                            ? "bg-background border-red-500 dark:border-red-400"
                            : "bg-background"
                        }
                        required
                      />
                      {validationErrors.newCustomerPhone && (
                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                          {validationErrors.newCustomerPhone}
                        </p>
                      )}
                    </div>
                    <div>
                      <Input
                        name="newCustomerEmail"
                        value={formData.newCustomerEmail}
                        onChange={handleInputChange}
                        placeholder="Email (opcional)"
                        type="email"
                        className={
                          validationErrors.newCustomerEmail
                            ? "bg-background border-red-500 dark:border-red-400"
                            : "bg-background"
                        }
                      />
                      {validationErrors.newCustomerEmail && (
                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                          {validationErrors.newCustomerEmail}
                        </p>
                      )}
                    </div>
                  </div>
                  <Input
                    name="newCustomerCpf"
                    value={formData.newCustomerCpf}
                    onChange={handleInputChange}
                    placeholder="CPF (opcional)"
                    className="bg-background"
                  />
                </div>
              ) : (
                <div>
                  <Combobox
                    options={customers.map((c) => ({
                      value: c.id,
                      label: `${c.name}${c.cpf ? ` - ${c.cpf}` : ""}`,
                    }))}
                    value={formData.customerId}
                    onValueChange={(value) => {
                      if (validationErrors.customerId) {
                        const newErrors = { ...validationErrors };
                        delete newErrors.customerId;
                        setValidationErrors(newErrors);
                      }
                      setFormData((prev) => ({ ...prev, customerId: value }));
                    }}
                    placeholder="Selecione o cliente..."
                    emptyText="Nenhum cliente cadastrado"
                    searchPlaceholder="Buscar cliente..."
                    error={!!validationErrors.customerId}
                  />
                  {validationErrors.customerId && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      {validationErrors.customerId}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* 3. Payment Details */}
            <div className="space-y-3 border-t border-border pt-4">
              <Label className="text-foreground font-bold flex items-center gap-2">
                <CreditCard className="h-4 w-4" /> Pagamento
              </Label>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Forma de Pagamento *</Label>
                  <Select
                    value={formData.paymentMethod}
                    onValueChange={(value) => {
                      if (validationErrors.paymentMethod) {
                        const newErrors = { ...validationErrors };
                        delete newErrors.paymentMethod;
                        setValidationErrors(newErrors);
                      }
                      setFormData((prev) => ({
                        ...prev,
                        paymentMethod: value as PaymentMethodType,
                      }));
                    }}
                  >
                    <SelectTrigger
                      className={
                        validationErrors.paymentMethod
                          ? "bg-background border-red-500 dark:border-red-400 text-foreground"
                          : "bg-background border-input text-foreground"
                      }
                    >
                      <SelectValue placeholder="Selecione a forma de pagamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">A Vista</SelectItem>
                      <SelectItem value="financing">Financiado</SelectItem>
                      <SelectItem value="trade_in">Troca</SelectItem>
                      <SelectItem value="promissory">Promissória</SelectItem>
                    </SelectContent>
                  </Select>
                  {validationErrors.paymentMethod && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {validationErrors.paymentMethod}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Valor Total da Venda *</Label>
                  <Input
                    type="text"
                    name="totalValue"
                    value={formatCurrencyInput(
                      String(formData.totalValue * 100)
                    )}
                    onChange={(e) =>
                      handleCurrencyChange("totalValue", e.target.value)
                    }
                    placeholder="R$ 0,00"
                    className={`font-bold ${
                      validationErrors.totalValue
                        ? "bg-background border-red-500 dark:border-red-400"
                        : "bg-background"
                    }`}
                  />
                  {validationErrors.totalValue && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {validationErrors.totalValue}
                    </p>
                  )}
                </div>
              </div>

              {/* Dynamic Fields based on method */}
              <div className="mt-4">{renderPaymentFields()}</div>
            </div>

            <div className="space-y-2 border-t border-border pt-4">
              <Label>Observações</Label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary"
                placeholder="Detalhes adicionais..."
              />
            </div>

            <DialogFooter className="pt-4 border-t border-border mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={closeModal}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="gap-2"
                disabled={!isFormValid() || isSubmitting}
              >
                <DollarSign className="h-4 w-4" />
                {isSubmitting ? "Processando..." : "Finalizar Venda"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Venda</DialogTitle>
            <DialogDescription>
              Informações completas sobre esta transação
            </DialogDescription>
          </DialogHeader>

          {selectedSale && (
            <div className="space-y-6 py-4">
              {/* Informações Gerais */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">
                  Informações Gerais
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Data da Venda:
                    </span>
                    <span className="font-medium">
                      {new Date(selectedSale.created_at).toLocaleString(
                        "pt-BR"
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge
                      variant={
                        selectedSale.status === "completed"
                          ? "default"
                          : selectedSale.status === "pending"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {selectedSale.status === "completed"
                        ? "Concluída"
                        : selectedSale.status === "pending"
                        ? "Pendente"
                        : "Cancelada"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Veículo */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2 flex items-center gap-2">
                  <Car className="h-4 w-4" /> Veículo
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Modelo:</span>
                    <span className="font-medium">
                      {selectedSale.vehicle_title}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cliente */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2 flex items-center gap-2">
                  <User className="h-4 w-4" /> Cliente
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nome:</span>
                    <span className="font-medium">
                      {selectedSale.customer_name || "Cliente não informado"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pagamento */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2 flex items-center gap-2">
                  <CreditCard className="h-4 w-4" /> Pagamento
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      Forma de Pagamento:
                    </span>
                    {getMethodBadge(selectedSale.payment.method)}
                  </div>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  {renderPaymentDetails(selectedSale.payment)}
                </div>
              </div>

              {/* Observações */}
              {selectedSale.notes && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Observações
                  </h3>
                  <p className="text-sm text-muted-foreground p-3 bg-muted/30 rounded-lg">
                    {selectedSale.notes}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDetailsModalOpen(false)}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminPageContainer>
  );
}
