import {
  FileText,
  Download,
  User,
  Car,
  Calendar,
  FileCheck,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  AdminPageContainer,
  AdminPageHeader,
} from "../../components/AdminPageComponents";
import { Combobox } from "../../components/ui/combobox";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from "../../components/ui/core";
import { getCustomers } from "../../services/customerService";
import { getVehicles } from "../../services/vehicleService";
import { Customer, Vehicle } from "../../types";
import jsPDF from "jspdf";

export default function Contracts() {
  const location = useLocation();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [isManualCustomer, setIsManualCustomer] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");

  // Manual Customer Data
  const [manualCustomer, setManualCustomer] = useState({
    name: "",
    cpf: "",
    rg: "",
    address: "",
    city: "",
    state: "",
    cep: "",
    phone: "",
    email: "",
  });

  // Vehicle Data
  const [vehicleData, setVehicleData] = useState({
    brand: "",
    model: "",
    year: "",
    color: "",
    plate: "",
    chassis: "",
    mileage: "",
    price: "",
  });

  // Contract Data
  const [contractData, setContractData] = useState({
    contractDate: new Date().toLocaleDateString("pt-BR"),
    paymentMethod: "",
    installments: "",
    downPayment: "",
    remainingValue: "",
    notes: "",
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [customersData, vehiclesData] = await Promise.all([
          getCustomers(),
          getVehicles(), // Carrega todos (inclusive vendidos) para contratos
        ]);
        setCustomers(customersData);
        setVehicles(vehiclesData);

        // Pré-preencher a partir de uma venda se vier com state
        const saleData = (location.state as any)?.saleData;
        if (saleData) {
          if (saleData.customer_id) setSelectedCustomerId(saleData.customer_id);
          if (saleData.vehicle_id) setSelectedVehicleId(saleData.vehicle_id);

          const paymentMethod = saleData.payment?.method || "";
          const paymentLabels: Record<string, string> = {
            cash: "À vista",
            financing: "Financiamento",
            trade_in: "Troca",
            promissory: "Carnê / Promissória",
          };
          setContractData((prev) => ({
            ...prev,
            paymentMethod: paymentLabels[paymentMethod] || paymentMethod,
            remainingValue: saleData.payment?.total_value
              ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(saleData.payment.total_value)
              : "",
            installments: saleData.payment?.installment_count
              ? `${saleData.payment.installment_count}x de ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(saleData.payment.installment_value || 0)}`
              : "",
          }));
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Quando um veículo é selecionado, preencher dados automaticamente
  useEffect(() => {
    if (selectedVehicleId) {
      const vehicle = vehicles.find((v) => v.id === selectedVehicleId);
      if (vehicle) {
        setVehicleData({
          brand: vehicle.brand || "",
          model: vehicle.model || "",
          year: vehicle.year?.toString() || "",
          color: vehicle.color || "",
          plate: vehicle.plate_end || "",
          chassis: "",
          mileage: vehicle.mileage?.toString() || "",
          price: new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(vehicle.price),
        });
      }
    }
  }, [selectedVehicleId, vehicles]);

  // Quando um cliente é selecionado, preencher dados automaticamente
  useEffect(() => {
    if (selectedCustomerId && !isManualCustomer) {
      const customer = customers.find((c) => c.id === selectedCustomerId);
      if (customer) {
        setManualCustomer({
          name: customer.name || "",
          cpf: customer.cpf || "",
          rg: "",
          address: "",
          city: "",
          state: "",
          cep: "",
          phone: customer.phone || "",
          email: customer.email || "",
        });
      }
    }
  }, [selectedCustomerId, customers, isManualCustomer]);

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = margin;

    // Helper para adicionar texto com quebra de linha
    const addText = (text: string, fontSize: number, isBold = false) => {
      doc.setFontSize(fontSize);
      if (isBold) {
        doc.setFont("helvetica", "bold");
      } else {
        doc.setFont("helvetica", "normal");
      }

      const lines = doc.splitTextToSize(text, pageWidth - 2 * margin);
      lines.forEach((line: string) => {
        if (yPosition > pageHeight - 30) {
          doc.addPage();
          yPosition = margin;
        }
        doc.text(line, margin, yPosition);
        yPosition += fontSize * 0.5;
      });
      yPosition += 3;
    };

    // Título
    addText("CONTRATO DE COMPRA E VENDA DE VEÍCULO", 16, true);
    yPosition += 5;

    // Dados do Contrato
    addText(`Data do Contrato: ${contractData.contractDate}`, 10);
    yPosition += 5;

    // Dados do Comprador
    addText("DADOS DO COMPRADOR", 12, true);
    addText(`Nome: ${manualCustomer.name}`, 10);
    addText(`CPF: ${manualCustomer.cpf}`, 10);
    if (manualCustomer.rg) addText(`RG: ${manualCustomer.rg}`, 10);
    if (manualCustomer.address) {
      addText(
        `Endereço: ${manualCustomer.address}, ${manualCustomer.city} - ${manualCustomer.state}, CEP: ${manualCustomer.cep}`,
        10
      );
    }
    if (manualCustomer.phone) addText(`Telefone: ${manualCustomer.phone}`, 10);
    if (manualCustomer.email) addText(`Email: ${manualCustomer.email}`, 10);
    yPosition += 5;

    // Dados do Veículo
    addText("DADOS DO VEÍCULO", 12, true);
    addText(`Marca: ${vehicleData.brand}`, 10);
    addText(`Modelo: ${vehicleData.model}`, 10);
    addText(`Ano: ${vehicleData.year}`, 10);
    if (vehicleData.color) addText(`Cor: ${vehicleData.color}`, 10);
    if (vehicleData.plate) addText(`Placa: ${vehicleData.plate}`, 10);
    if (vehicleData.chassis) addText(`Chassi: ${vehicleData.chassis}`, 10);
    if (vehicleData.mileage)
      addText(`Quilometragem: ${vehicleData.mileage} km`, 10);
    yPosition += 5;

    // Valor e Forma de Pagamento
    addText("VALOR E FORMA DE PAGAMENTO", 12, true);
    addText(`Valor Total: ${vehicleData.price}`, 10, true);
    if (contractData.paymentMethod) {
      addText(`Forma de Pagamento: ${contractData.paymentMethod}`, 10);
    }
    if (contractData.downPayment) {
      addText(`Entrada: ${contractData.downPayment}`, 10);
    }
    if (contractData.remainingValue) {
      addText(`Saldo a Pagar: ${contractData.remainingValue}`, 10);
    }
    if (contractData.installments) {
      addText(`Parcelas: ${contractData.installments}`, 10);
    }
    yPosition += 5;

    // Cláusulas
    addText("CLÁUSULAS", 12, true);
    addText(
      "1. O VENDEDOR declara ser o legítimo proprietário do veículo acima descrito, livre de ônus, impostos e encargos.",
      10
    );
    addText(
      "2. O COMPRADOR declara ter examinado o veículo e o aceita no estado em que se encontra.",
      10
    );
    addText(
      "3. O veículo é vendido 'COMO ESTÁ', sem garantia expressa ou implícita.",
      10
    );
    addText(
      "4. O COMPRADOR se compromete a efetuar a transferência do veículo em até 30 (trinta) dias.",
      10
    );
    addText(
      "5. O VENDEDOR se compromete a entregar toda a documentação necessária para a transferência.",
      10
    );
    yPosition += 5;

    // Observações
    if (contractData.notes) {
      addText("OBSERVAÇÕES", 12, true);
      addText(contractData.notes, 10);
      yPosition += 5;
    }

    // Assinaturas
    yPosition += 10;
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = margin;
    }

    addText("ASSINATURAS", 12, true);
    yPosition += 20;

    // Vendedor
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("VENDEDOR", margin, yPosition);
    yPosition += 20;
    doc.line(margin, yPosition, margin + 80, yPosition);
    yPosition += 5;
    doc.text("ML MOTOSCAR", margin, yPosition);
    yPosition += 15;

    // Comprador
    doc.text("COMPRADOR", margin, yPosition);
    yPosition += 20;
    doc.line(margin, yPosition, margin + 80, yPosition);
    yPosition += 5;
    doc.text(manualCustomer.name, margin, yPosition);
    yPosition += 5;
    if (manualCustomer.cpf) {
      doc.text(`CPF: ${manualCustomer.cpf}`, margin, yPosition);
    }

    // Salvar PDF
    const fileName = `Contrato_${manualCustomer.name.replace(/\s/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
    doc.save(fileName);
  };

  const isFormValid = () => {
    if (!manualCustomer.name) return false;
    if (!vehicleData.brand || !vehicleData.model || !vehicleData.year)
      return false;
    if (!vehicleData.price) return false;
    return true;
  };

  return (
    <AdminPageContainer>
      <AdminPageHeader
        title="Gerar Contrato de Compra e Venda"
        description="Preencha os dados para gerar o contrato em PDF."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dados do Cliente */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" /> Dados do Comprador
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-border">
              <input
                type="checkbox"
                id="manualCustomer"
                checked={isManualCustomer}
                onChange={(e) => setIsManualCustomer(e.target.checked)}
                className="rounded border-input text-primary focus:ring-primary w-4 h-4"
              />
              <Label
                htmlFor="manualCustomer"
                className="text-sm cursor-pointer text-muted-foreground"
              >
                Inserir dados manualmente
              </Label>
            </div>

            {!isManualCustomer ? (
              <div className="space-y-2">
                <Label>Selecionar Cliente</Label>
                <Combobox
                  options={customers.map((c) => ({
                    value: c.id,
                    label: `${c.name}${c.cpf ? ` - ${c.cpf}` : ""}`,
                  }))}
                  value={selectedCustomerId}
                  onValueChange={setSelectedCustomerId}
                  placeholder="Selecione o cliente..."
                  emptyText="Nenhum cliente cadastrado"
                  searchPlaceholder="Buscar cliente..."
                />
              </div>
            ) : null}

            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Nome Completo *</Label>
                <Input
                  value={manualCustomer.name}
                  onChange={(e) =>
                    setManualCustomer({ ...manualCustomer, name: e.target.value })
                  }
                  placeholder="Nome completo"
                  className="bg-background border-input text-foreground"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>CPF</Label>
                  <Input
                    value={manualCustomer.cpf}
                    onChange={(e) =>
                      setManualCustomer({
                        ...manualCustomer,
                        cpf: e.target.value,
                      })
                    }
                    placeholder="000.000.000-00"
                    className="bg-background border-input text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label>RG</Label>
                  <Input
                    value={manualCustomer.rg}
                    onChange={(e) =>
                      setManualCustomer({
                        ...manualCustomer,
                        rg: e.target.value,
                      })
                    }
                    placeholder="00.000.000-0"
                    className="bg-background border-input text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Endereço</Label>
                <Input
                  value={manualCustomer.address}
                  onChange={(e) =>
                    setManualCustomer({
                      ...manualCustomer,
                      address: e.target.value,
                    })
                  }
                  placeholder="Rua, número, complemento"
                  className="bg-background border-input text-foreground"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label>Cidade</Label>
                  <Input
                    value={manualCustomer.city}
                    onChange={(e) =>
                      setManualCustomer({
                        ...manualCustomer,
                        city: e.target.value,
                      })
                    }
                    placeholder="Cidade"
                    className="bg-background border-input text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Input
                    value={manualCustomer.state}
                    onChange={(e) =>
                      setManualCustomer({
                        ...manualCustomer,
                        state: e.target.value,
                      })
                    }
                    placeholder="UF"
                    maxLength={2}
                    className="bg-background border-input text-foreground uppercase"
                  />
                </div>
                <div className="space-y-2">
                  <Label>CEP</Label>
                  <Input
                    value={manualCustomer.cep}
                    onChange={(e) =>
                      setManualCustomer({
                        ...manualCustomer,
                        cep: e.target.value,
                      })
                    }
                    placeholder="00000-000"
                    className="bg-background border-input text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input
                    value={manualCustomer.phone}
                    onChange={(e) =>
                      setManualCustomer({
                        ...manualCustomer,
                        phone: e.target.value,
                      })
                    }
                    placeholder="(00) 00000-0000"
                    className="bg-background border-input text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={manualCustomer.email}
                    onChange={(e) =>
                      setManualCustomer({
                        ...manualCustomer,
                        email: e.target.value,
                      })
                    }
                    placeholder="email@exemplo.com"
                    className="bg-background border-input text-foreground"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dados do Veículo e Contrato */}
        <div className="space-y-6">
          {/* Dados do Veículo */}
          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" /> Dados do Veículo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Selecionar Veículo do Estoque</Label>
                <Combobox
                  options={vehicles.map((v) => ({
                    value: v.id,
                    label: `${v.title} - ${new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(v.price)}`,
                  }))}
                  value={selectedVehicleId}
                  onValueChange={setSelectedVehicleId}
                  placeholder="Selecione o veículo..."
                  emptyText="Nenhum veículo disponível"
                  searchPlaceholder="Buscar veículo..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Marca *</Label>
                  <Input
                    value={vehicleData.brand}
                    onChange={(e) =>
                      setVehicleData({ ...vehicleData, brand: e.target.value })
                    }
                    placeholder="Marca"
                    className="bg-background border-input text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Modelo *</Label>
                  <Input
                    value={vehicleData.model}
                    onChange={(e) =>
                      setVehicleData({ ...vehicleData, model: e.target.value })
                    }
                    placeholder="Modelo"
                    className="bg-background border-input text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label>Ano *</Label>
                  <Input
                    value={vehicleData.year}
                    onChange={(e) =>
                      setVehicleData({ ...vehicleData, year: e.target.value })
                    }
                    placeholder="2024"
                    className="bg-background border-input text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cor</Label>
                  <Input
                    value={vehicleData.color}
                    onChange={(e) =>
                      setVehicleData({ ...vehicleData, color: e.target.value })
                    }
                    placeholder="Cor"
                    className="bg-background border-input text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Placa</Label>
                  <Input
                    value={vehicleData.plate}
                    onChange={(e) =>
                      setVehicleData({
                        ...vehicleData,
                        plate: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="ABC1234"
                    maxLength={7}
                    className="bg-background border-input text-foreground uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Chassi</Label>
                  <Input
                    value={vehicleData.chassis}
                    onChange={(e) =>
                      setVehicleData({
                        ...vehicleData,
                        chassis: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="Chassi"
                    className="bg-background border-input text-foreground uppercase"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Quilometragem</Label>
                  <Input
                    value={vehicleData.mileage}
                    onChange={(e) =>
                      setVehicleData({
                        ...vehicleData,
                        mileage: e.target.value,
                      })
                    }
                    placeholder="0 km"
                    className="bg-background border-input text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Valor Total *</Label>
                <Input
                  value={vehicleData.price}
                  onChange={(e) =>
                    setVehicleData({ ...vehicleData, price: e.target.value })
                  }
                  placeholder="R$ 0,00"
                  className="bg-background border-input text-foreground font-bold text-lg"
                />
              </div>
            </CardContent>
          </Card>

          {/* Dados do Contrato */}
          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" /> Dados do Contrato
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Data do Contrato</Label>
                <Input
                  type="date"
                  value={
                    contractData.contractDate
                      ? new Date(
                          contractData.contractDate.split("/").reverse().join("-")
                        )
                          .toISOString()
                          .split("T")[0]
                      : new Date().toISOString().split("T")[0]
                  }
                  onChange={(e) => {
                    const date = new Date(e.target.value);
                    setContractData({
                      ...contractData,
                      contractDate: date.toLocaleDateString("pt-BR"),
                    });
                  }}
                  className="bg-background border-input text-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label>Forma de Pagamento</Label>
                <Input
                  value={contractData.paymentMethod}
                  onChange={(e) =>
                    setContractData({
                      ...contractData,
                      paymentMethod: e.target.value,
                    })
                  }
                  placeholder="Ex: À vista, Financiado, etc."
                  className="bg-background border-input text-foreground"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Entrada</Label>
                  <Input
                    value={contractData.downPayment}
                    onChange={(e) =>
                      setContractData({
                        ...contractData,
                        downPayment: e.target.value,
                      })
                    }
                    placeholder="R$ 0,00"
                    className="bg-background border-input text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Saldo a Pagar</Label>
                  <Input
                    value={contractData.remainingValue}
                    onChange={(e) =>
                      setContractData({
                        ...contractData,
                        remainingValue: e.target.value,
                      })
                    }
                    placeholder="R$ 0,00"
                    className="bg-background border-input text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Parcelas</Label>
                <Input
                  value={contractData.installments}
                  onChange={(e) =>
                    setContractData({
                      ...contractData,
                      installments: e.target.value,
                    })
                  }
                  placeholder="Ex: 12x de R$ 500,00"
                  className="bg-background border-input text-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label>Observações</Label>
                <textarea
                  value={contractData.notes}
                  onChange={(e) =>
                    setContractData({
                      ...contractData,
                      notes: e.target.value,
                    })
                  }
                  placeholder="Observações adicionais do contrato..."
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary resize-y"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Botão de Gerar PDF */}
      <div className="mt-6 flex justify-end">
        <Button
          onClick={generatePDF}
          disabled={!isFormValid()}
          className="gap-2"
          size="lg"
        >
          <Download className="h-5 w-5" />
          Gerar Contrato em PDF
        </Button>
      </div>
    </AdminPageContainer>
  );
}
