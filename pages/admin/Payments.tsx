import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  DollarSign,
  Search,
  TrendingUp,
  Wallet,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  AdminPageContainer,
  AdminPageHeader,
} from "../../components/AdminPageComponents";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Skeleton,
} from "../../components/ui/core";
import { getSales, registerPayment } from "../../services/salesService";
import { Sale } from "../../types";

export default function Payments() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal States
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  // Form State
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentNote, setPaymentNote] = useState("");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const loadData = async () => {
    setLoading(true);
    const allSales = await getSales();
    // Filter only sales that involve promissory notes
    // and are not fully canceled (though completed sales still have debts usually)
    const promissorySales = allSales.filter(
      (s) => s.payment.method === "promissory" && s.status !== "canceled"
    );
    setSales(promissorySales);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Utility to calculate debt info
  const getDebtInfo = (sale: Sale) => {
    // Total debt is installments * value
    const totalDebt =
      (sale.payment.installment_count || 0) *
      (sale.payment.installment_value || 0);

    // Sum of all payments made of type 'installment' or 'settlement'
    const totalPaid = (sale.payment_history || []).reduce(
      (acc, curr) => acc + curr.amount,
      0
    );

    const remaining = Math.max(0, totalDebt - totalPaid);
    const progress = totalDebt > 0 ? (totalPaid / totalDebt) * 100 : 0;
    const isPaidOff = remaining <= 0; // Small tolerance might be needed in real float math, but int checks are fine here

    // Next Installment info (simple estimation)
    const paidCount = Math.floor(
      totalPaid / (sale.payment.installment_value || 1)
    );
    const nextInstallmentNumber = Math.min(
      sale.payment.installment_count || 0,
      paidCount + 1
    );

    return {
      totalDebt,
      totalPaid,
      remaining,
      progress,
      isPaidOff,
      nextInstallmentNumber,
    };
  };

  const handleOpenPayment = (sale: Sale) => {
    setSelectedSale(sale);
    setPaymentAmount(sale.payment.installment_value || 0); // Default to installment value
    setPaymentNote(`Pagamento Parcela`);
    setPaymentDate(new Date().toISOString().split("T")[0]);
    setIsPaymentModalOpen(true);
  };

  const handleOpenSettle = (sale: Sale) => {
    const { remaining } = getDebtInfo(sale);
    setSelectedSale(sale);
    setPaymentAmount(remaining);
    setPaymentNote("Quitação Total de Débito");
    setPaymentDate(new Date().toISOString().split("T")[0]);
    setIsSettleModalOpen(true);
  };

  const handleSubmitPayment = async (
    e: React.FormEvent,
    type: "installment" | "settlement"
  ) => {
    e.preventDefault();
    if (!selectedSale) return;

    await registerPayment(selectedSale.id, {
      date: paymentDate,
      amount: Number(paymentAmount),
      note: paymentNote,
      type: type,
    });

    setIsPaymentModalOpen(false);
    setIsSettleModalOpen(false);
    loadData();
  };

  const filteredSales = sales.filter(
    (s) =>
      s.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      s.vehicle_title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminPageContainer>
      <AdminPageHeader
        title="Controle de Pagamentos"
        description="Gerencie recebimentos de promissórias e parcelamentos da loja."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border-border">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-full bg-blue-500/10 text-blue-500">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">A Receber (Total)</p>
              <h3 className="text-2xl font-bold text-foreground">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(
                  sales.reduce(
                    (acc, sale) => acc + getDebtInfo(sale).remaining,
                    0
                  )
                )}
              </h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-full bg-green-500/10 text-green-500">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Recebido (Total)</p>
              <h3 className="text-2xl font-bold text-foreground">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(
                  sales.reduce(
                    (acc, sale) => acc + getDebtInfo(sale).totalPaid,
                    0
                  )
                )}
              </h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-full bg-orange-500/10 text-orange-500">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Carnês Ativos</p>
              <h3 className="text-2xl font-bold text-foreground">
                {sales.filter((s) => !getDebtInfo(s).isPaidOff).length}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border shadow-sm">
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <CardTitle className="text-foreground">
            Carnês e Promissórias
          </CardTitle>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cliente..."
              className="pl-8 bg-background border-input text-foreground w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              [1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full rounded-xl" />
              ))
            ) : filteredSales.length > 0 ? (
              filteredSales.map((sale) => {
                const {
                  totalDebt,
                  totalPaid,
                  remaining,
                  progress,
                  isPaidOff,
                  nextInstallmentNumber,
                } = getDebtInfo(sale);

                return (
                  <div
                    key={sale.id}
                    className="group rounded-xl border border-border bg-background p-4 md:p-6 transition-all hover:border-primary/50 hover:shadow-md"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg text-foreground">
                            {sale.customer_name}
                          </h3>
                          {isPaidOff && (
                            <Badge className="bg-green-500 text-white border-none">
                              <CheckCircle2 className="h-3 w-3 mr-1" /> Quitado
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {sale.vehicle_title}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">
                          Saldo Devedor
                        </p>
                        <p
                          className={`text-2xl font-bold ${
                            isPaidOff ? "text-green-500" : "text-red-500"
                          }`}
                        >
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(remaining)}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>
                          Pago:{" "}
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(totalPaid)}
                        </span>
                        <span>
                          Total:{" "}
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(totalDebt)}
                        </span>
                      </div>
                      <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-1000 ease-out rounded-full ${
                            isPaidOff ? "bg-green-500" : "bg-primary"
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-center text-muted-foreground">
                        {progress.toFixed(0)}% Quitado
                      </p>
                    </div>

                    {/* Actions & Details */}
                    <div className="flex flex-col md:flex-row items-center justify-between pt-4 border-t border-border gap-4">
                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2 text-foreground">
                          <Wallet className="h-4 w-4 text-primary" />
                          <span>
                            Parcela:{" "}
                            <strong>
                              {new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              }).format(sale.payment.installment_value || 0)}
                            </strong>
                          </span>
                        </div>
                        {!isPaidOff && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>
                              Próx: {nextInstallmentNumber}/
                              {sale.payment.installment_count}
                            </span>
                          </div>
                        )}
                      </div>

                      {!isPaidOff && (
                        <div className="flex gap-2 w-full md:w-auto">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 md:flex-initial gap-2 border-primary/20 hover:bg-primary/5"
                            onClick={() => handleOpenSettle(sale)}
                          >
                            <CheckCircle2 className="h-4 w-4" /> Quitar
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1 md:flex-initial gap-2"
                            onClick={() => handleOpenPayment(sale)}
                          >
                            <DollarSign className="h-4 w-4" /> Registrar
                            Pagamento
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                Nenhum carnê ou promissória ativa encontrada.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent
          className="sm:max-w-md"
          onClose={() => setIsPaymentModalOpen(false)}
        >
          <DialogHeader>
            <DialogTitle>Registrar Pagamento</DialogTitle>
            <DialogDescription>
              Lançar uma parcela paga para {selectedSale?.customer_name}.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => handleSubmitPayment(e, "installment")}
            className="space-y-4 py-2"
          >
            <div className="space-y-2">
              <Label>Valor do Pagamento (R$)</Label>
              <Input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(Number(e.target.value))}
                className="text-lg font-bold bg-background border-input text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label>Data do Pagamento</Label>
              <Input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="bg-background border-input text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label>Observação (Opcional)</Label>
              <Input
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
                placeholder="Ex: Ref. Parcela 05/24"
                className="bg-background border-input text-foreground"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPaymentModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">Confirmar Recebimento</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Settle Modal */}
      <Dialog open={isSettleModalOpen} onOpenChange={setIsSettleModalOpen}>
        <DialogContent
          className="sm:max-w-md"
          onClose={() => setIsSettleModalOpen(false)}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" /> Quitar Débito Total
            </DialogTitle>
            <DialogDescription>
              Isto irá registrar o pagamento do valor restante e encerrar o
              débito.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => handleSubmitPayment(e, "settlement")}
            className="space-y-4 py-2"
          >
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-sm text-muted-foreground">
                Valor Restante para Quitação
              </p>
              <p className="text-3xl font-bold text-foreground">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(paymentAmount)}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Data da Quitação</Label>
              <Input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="bg-background border-input text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label>Observação</Label>
              <Input
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
                className="bg-background border-input text-foreground"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsSettleModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Confirmar Quitação
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminPageContainer>
  );
}
