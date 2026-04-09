import jsPDF from "jspdf";
import { Building2, Car, Download, FileText, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  AdminPageContainer,
  AdminPageHeader,
} from "../../components/AdminPageComponents";
import { useSettings } from "../../components/SettingsProvider";
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

type PersonData = {
  name: string;
  rg: string;
  cpf: string;
  address: string;
  city: string;
  state: string;
  cep: string;
  phone: string;
};

const EMPTY_PERSON: PersonData = {
  name: "",
  rg: "",
  cpf: "",
  address: "",
  city: "",
  state: "",
  cep: "",
  phone: "",
};

function PersonForm({
  data,
  onChange,
  readonlyName = false,
}: {
  data: PersonData;
  onChange: (d: PersonData) => void;
  readonlyName?: boolean;
}) {
  const field = (key: keyof PersonData) => (
    <Input
      value={data[key]}
      onChange={(e) => onChange({ ...data, [key]: e.target.value })}
      className="bg-background border-input text-foreground"
      readOnly={key === "name" && readonlyName}
    />
  );

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label>Nome Completo *</Label>
        {field("name")}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>RG (número + órgão emissor)</Label>
          <Input
            value={data.rg}
            onChange={(e) => onChange({ ...data, rg: e.target.value })}
            placeholder="6.181.046 SSP/SP"
            className="bg-background border-input text-foreground"
          />
        </div>
        <div className="space-y-2">
          <Label>CPF</Label>
          <Input
            value={data.cpf}
            onChange={(e) => onChange({ ...data, cpf: e.target.value })}
            placeholder="000.000.000-00"
            className="bg-background border-input text-foreground"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Endereço (Rua, número, bairro)</Label>
        <Input
          value={data.address}
          onChange={(e) => onChange({ ...data, address: e.target.value })}
          placeholder="Rua das Flores, 123, Centro"
          className="bg-background border-input text-foreground"
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-2">
          <Label>CEP</Label>
          <Input
            value={data.cep}
            onChange={(e) => onChange({ ...data, cep: e.target.value })}
            placeholder="00000-000"
            className="bg-background border-input text-foreground"
          />
        </div>
        <div className="space-y-2">
          <Label>Cidade</Label>
          <Input
            value={data.city}
            onChange={(e) => onChange({ ...data, city: e.target.value })}
            placeholder="Marília"
            className="bg-background border-input text-foreground"
          />
        </div>
        <div className="space-y-2">
          <Label>Estado</Label>
          <Input
            value={data.state}
            onChange={(e) =>
              onChange({ ...data, state: e.target.value.toUpperCase() })
            }
            placeholder="SP"
            maxLength={2}
            className="bg-background border-input text-foreground uppercase"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Telefone</Label>
        <Input
          value={data.phone}
          onChange={(e) => onChange({ ...data, phone: e.target.value })}
          placeholder="(00) 00000-0000"
          className="bg-background border-input text-foreground"
        />
      </div>
    </div>
  );
}

export default function Contracts() {
  const location = useLocation();
  const { settings } = useSettings();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");

  const [sellerData, setSellerData] = useState<PersonData>(EMPTY_PERSON);
  const [buyerData, setBuyerData] = useState<PersonData>(EMPTY_PERSON);

  const [vehicleData, setVehicleData] = useState({
    brandModel: "",
    plate: "",
    yearMake: "",
    yearModel: "",
    renavam: "",
  });

  const [contractData, setContractData] = useState({
    city: "",
    state: "",
    priceText: "",
    paymentMethod: "",
    contractDate: new Date().toLocaleDateString("pt-BR"),
  });

  // Pre-fill seller from settings
  useEffect(() => {
    setSellerData({
      name: settings.sellerName || "",
      rg: settings.sellerRg || "",
      cpf: settings.sellerCpf || "",
      address: settings.sellerAddress || "",
      city: settings.sellerCity || "",
      state: settings.sellerState || "",
      cep: settings.sellerCep || "",
      phone: settings.sellerPhone || "",
    });
    setContractData((prev) => ({
      ...prev,
      city: settings.city || "",
      state: settings.state || "",
    }));
  }, [settings]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [customersData, vehiclesData] = await Promise.all([
          getCustomers(),
          getVehicles(),
        ]);
        setCustomers(customersData);
        setVehicles(vehiclesData);

        const saleData = (location.state as any)?.saleData;
        if (saleData) {
          if (saleData.customer_id) setSelectedCustomerId(saleData.customer_id);
          if (saleData.vehicle_id) setSelectedVehicleId(saleData.vehicle_id);

          const paymentLabels: Record<string, string> = {
            cash: "À vista",
            financing: "Financiamento",
            trade_in: "Troca",
            promissory: "Carnê / Promissória",
          };
          setContractData((prev) => ({
            ...prev,
            paymentMethod:
              paymentLabels[saleData.payment?.method] ||
              saleData.payment?.method ||
              "",
            priceText: saleData.payment?.total_value
              ? new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(saleData.payment.total_value)
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

  // Auto-fill buyer from customer selection
  useEffect(() => {
    if (selectedCustomerId) {
      const customer = customers.find((c) => c.id === selectedCustomerId);
      if (customer) {
        setBuyerData((prev) => ({
          ...prev,
          name: customer.name || "",
          cpf: customer.cpf || "",
          phone: customer.phone || "",
        }));
      }
    }
  }, [selectedCustomerId, customers]);

  // Auto-fill vehicle from selection
  useEffect(() => {
    if (selectedVehicleId) {
      const vehicle = vehicles.find((v) => v.id === selectedVehicleId);
      if (vehicle) {
        setVehicleData((prev) => ({
          ...prev,
          brandModel: `${vehicle.brand}/${vehicle.model}`.toUpperCase(),
          plate: vehicle.plate_end || prev.plate,
          yearMake: vehicle.year?.toString() || prev.yearMake,
          yearModel: vehicle.year?.toString() || prev.yearModel,
        }));
        setContractData((prev) => ({
          ...prev,
          priceText:
            prev.priceText ||
            new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(vehicle.price),
        }));
      }
    }
  }, [selectedVehicleId, vehicles]);

  const generatePDF = () => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });

    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const mL = 12.7;
    const mR = 12.7;
    const mT = 12.7;
    const contentW = pageW - mL - mR;
    let y = mT;

    const checkPage = (needed = 8) => {
      if (y + needed > pageH - mT) {
        doc.addPage();
        y = mT;
      }
    };

    const setFont = (bold = false) =>
      doc.setFont("helvetica", bold ? "bold" : "normal");

    const writeSegments = (
      segments: { text: string; bold?: boolean }[],
      fontSize: number,
      align: "left" | "center" | "right" = "left",
      indent = 0,
    ) => {
      doc.setFontSize(fontSize);
      const lineH = fontSize * 0.3528 * 1.15;
      const fullText = segments.map((s) => s.text).join("");
      const availW = contentW - indent;
      const lines = doc.splitTextToSize(fullText, availW) as string[];

      let segIdx = 0;
      let charOffset = 0;

      lines.forEach((line: string) => {
        checkPage(lineH + 1);
        let xCursor =
          align === "center"
            ? pageW / 2 - doc.getTextWidth(line) / 2
            : align === "right"
              ? pageW - mR - doc.getTextWidth(line)
              : mL + indent;

        let charsLeft = line.length;
        while (charsLeft > 0 && segIdx < segments.length) {
          const seg = segments[segIdx];
          const available = seg.text.length - charOffset;
          const take = Math.min(available, charsLeft);
          const piece = seg.text.slice(charOffset, charOffset + take);

          setFont(seg.bold);
          doc.text(piece, xCursor, y);
          xCursor += doc.getTextWidth(piece);

          charOffset += take;
          charsLeft -= take;
          if (charOffset >= seg.text.length) {
            segIdx++;
            charOffset = 0;
          }
        }
        y += lineH;
      });
    };

    const addLine = (
      text: string,
      fontSize: number,
      bold = false,
      align: "left" | "center" | "right" = "left",
      indent = 0,
    ) => writeSegments([{ text, bold }], fontSize, align, indent);

    const gap = (mm: number) => {
      y += mm;
    };

    const writeSectionLabel = (label: string) => {
      checkPage(10);
      doc.setFontSize(11);
      setFont(true);
      doc.setTextColor(0, 0, 0);
      doc.text(label, mL, y);
      const lW = doc.getTextWidth(label);
      doc.line(mL, y + 0.4, mL + lW, y + 0.4);
      y += 5.5;
    };

    const buildPersonText = (p: PersonData) => {
      const parts: { text: string; bold?: boolean }[] = [
        { text: `${p.name}, portador do RG nº ${p.rg}, CPF nº ${p.cpf}` },
      ];
      if (p.address || p.city) {
        parts.push({
          text: `, residente e domiciliado na ${p.address}, CEP: ${p.cep}, ${p.city} - ${p.state}`,
        });
      }
      if (p.phone) parts.push({ text: `, telefone: ${p.phone}` });
      parts.push({ text: "." });
      return parts;
    };

    const indent0 = 6;
    const indent1 = 14;
    const bulletLineH = 11 * 0.3528 * 1.15;

    const writeBullet = (
      segments: { text: string; bold?: boolean }[],
      level = 0,
    ) => {
      const bulletChar = level === 0 ? "\u2022" : "\u25E6";
      const indentMm = level === 0 ? indent0 : indent1;
      checkPage(bulletLineH + 2);
      doc.setFontSize(11);
      setFont(false);
      doc.text(bulletChar, mL + indentMm - 4, y);
      writeSegments(segments, 11, "left", indentMm);
    };

    // ─── Título ───────────────────────────────────────────────────────────────
    checkPage(10);
    addLine("CONTRATO DE COMPRA E VENDA DE VEÍCULO", 14, true, "center");
    gap(6);

    // ─── VENDEDOR ─────────────────────────────────────────────────────────────
    writeSectionLabel("VENDEDOR:");
    writeSegments(buildPersonText(sellerData), 11);
    gap(5);

    // ─── COMPRADOR ────────────────────────────────────────────────────────────
    writeSectionLabel("COMPRADOR:");
    writeSegments(buildPersonText(buyerData), 11);
    gap(5);

    // ─── Qualificação do veículo ──────────────────────────────────────────────
    checkPage(14);
    writeSegments(
      [
        {
          text: "Pelo presente instrumento particular, as partes supracitadas têm entre si justas e contratadas a compra e venda do veículo ",
        },
        { text: vehicleData.brandModel, bold: true },
        { text: ", placas " },
        { text: vehicleData.plate, bold: true },
        { text: ", ano de fabricação " },
        { text: vehicleData.yearMake, bold: true },
        ...(vehicleData.yearModel
          ? [{ text: ", ano do modelo " }, { text: vehicleData.yearModel, bold: true }]
          : []),
        ...(vehicleData.renavam
          ? [{ text: ", RENAVAM " }, { text: vehicleData.renavam, bold: true }]
          : []),
        {
          text: `, na cidade de ${contractData.city} – ${contractData.state}, nos seguintes termos:`,
        },
      ],
      11,
    );
    gap(3);

    // ─── Bullets ─────────────────────────────────────────────────────────────
    writeBullet([
      {
        text: "O veículo é de propriedade do Vendedor e está sendo entregue ao Comprador totalmente livre e desembaraçado de quaisquer ônus.",
      },
    ]);

    writeBullet([
      { text: " O preço total do veículo é de " },
      { text: contractData.priceText, bold: true },
      { text: "." },
    ]);

    writeBullet([
      { text: "O Comprador pagará o valor do veículo nas seguintes condições: " },
    ]);

    if (contractData.paymentMethod) {
      writeBullet([{ text: ` ${contractData.paymentMethod}.` }], 1);
    }

    writeBullet(
      [
        {
          text: "Os contratantes assinam o presente contrato por si, em caráter irrevogável e irretratável, elegendo o foro e a comarca de ",
        },
        { text: contractData.city, bold: true },
        {
          text: " para dirimir quaisquer dúvidas, porventura suscitadas, oriundas deste instrumento.",
        },
      ],
      1,
    );

    // ─── Local e data ─────────────────────────────────────────────────────────
    gap(6);
    checkPage(8);
    writeSegments(
      [
        { text: `${contractData.city}, ` },
        { text: contractData.contractDate, bold: true },
        { text: "." },
      ],
      11,
      "right",
    );
    gap(16);

    // ─── Assinaturas ──────────────────────────────────────────────────────────
    checkPage(20);
    doc.setFontSize(11);
    setFont(false);

    const sigY = y;
    const col1X = mL + 10;
    const col2X = pageW / 2 + 15;
    const lineLen = 60;

    doc.text("VENDEDOR:", col1X, sigY);
    doc.text("COMPRADOR:", col2X, sigY);
    y = sigY + 16;

    doc.setDrawColor(0, 0, 0);
    doc.line(col1X, y, col1X + lineLen, y);
    doc.line(col2X, y, col2X + lineLen, y);
    y += 5;

    doc.setFontSize(10);
    doc.text(sellerData.name || settings.storeName, col1X, y);
    doc.text(buyerData.name, col2X, y);
    y += 5;
    if (sellerData.cpf) doc.text(`CPF: ${sellerData.cpf}`, col1X, y);
    if (buyerData.cpf) doc.text(`CPF: ${buyerData.cpf}`, col2X, y);

    const fileName = `Contrato_${buyerData.name.replace(/\s/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
    doc.save(fileName);
  };

  const isFormValid = () =>
    !!(buyerData.name && vehicleData.brandModel && vehicleData.plate && contractData.priceText);

  return (
    <AdminPageContainer>
      <AdminPageHeader
        title="Gerar Contrato de Compra e Venda"
        description="Preencha os dados para gerar o contrato em PDF."
      />

      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vendedor */}
          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" /> Vendedor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-4">
                Pré-preenchido a partir das configurações. Edite se necessário.
              </p>
              <PersonForm data={sellerData} onChange={setSellerData} />
            </CardContent>
          </Card>

          {/* Comprador */}
          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" /> Comprador
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Selecionar cliente cadastrado</Label>
                <Combobox
                  options={customers.map((c) => ({
                    value: c.id,
                    label: `${c.name}${c.cpf ? ` - ${c.cpf}` : ""}`,
                  }))}
                  value={selectedCustomerId}
                  onValueChange={setSelectedCustomerId}
                  placeholder="Selecione para pré-preencher..."
                  emptyText="Nenhum cliente cadastrado"
                  searchPlaceholder="Buscar cliente..."
                />
              </div>
              <PersonForm data={buyerData} onChange={setBuyerData} />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Veículo */}
          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" /> Veículo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Selecionar veículo do estoque</Label>
                <Combobox
                  options={vehicles.map((v) => ({
                    value: v.id,
                    label: `${v.title} - ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v.price)}`,
                  }))}
                  value={selectedVehicleId}
                  onValueChange={setSelectedVehicleId}
                  placeholder="Selecione para pré-preencher..."
                  emptyText="Nenhum veículo disponível"
                  searchPlaceholder="Buscar veículo..."
                />
              </div>

              <div className="space-y-2">
                <Label>Marca + Modelo *</Label>
                <Input
                  value={vehicleData.brandModel}
                  onChange={(e) =>
                    setVehicleData({ ...vehicleData, brandModel: e.target.value.toUpperCase() })
                  }
                  placeholder="HONDA/CG 160 FAN"
                  className="bg-background border-input text-foreground uppercase"
                />
              </div>

              <div className="space-y-2">
                <Label>Placa *</Label>
                <Input
                  value={vehicleData.plate}
                  onChange={(e) =>
                    setVehicleData({ ...vehicleData, plate: e.target.value.toUpperCase() })
                  }
                  placeholder="ABC1D23"
                  className="bg-background border-input text-foreground uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Ano de Fabricação</Label>
                  <Input
                    value={vehicleData.yearMake}
                    onChange={(e) =>
                      setVehicleData({ ...vehicleData, yearMake: e.target.value })
                    }
                    placeholder="2023"
                    maxLength={4}
                    className="bg-background border-input text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ano do Modelo</Label>
                  <Input
                    value={vehicleData.yearModel}
                    onChange={(e) =>
                      setVehicleData({ ...vehicleData, yearModel: e.target.value })
                    }
                    placeholder="2024"
                    maxLength={4}
                    className="bg-background border-input text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>RENAVAM</Label>
                <Input
                  value={vehicleData.renavam}
                  onChange={(e) =>
                    setVehicleData({ ...vehicleData, renavam: e.target.value })
                  }
                  placeholder="00000000000"
                  className="bg-background border-input text-foreground"
                />
              </div>
            </CardContent>
          </Card>

          {/* Contrato */}
          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" /> Dados do Contrato
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Cidade (foro) *</Label>
                  <Input
                    value={contractData.city}
                    onChange={(e) =>
                      setContractData({ ...contractData, city: e.target.value })
                    }
                    placeholder="Marília"
                    className="bg-background border-input text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Estado (foro)</Label>
                  <Input
                    value={contractData.state}
                    onChange={(e) =>
                      setContractData({
                        ...contractData,
                        state: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="SP"
                    maxLength={2}
                    className="bg-background border-input text-foreground uppercase"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Valor Total *</Label>
                <Input
                  value={contractData.priceText}
                  onChange={(e) =>
                    setContractData({ ...contractData, priceText: e.target.value })
                  }
                  placeholder="R$ 124.500,00 (cento e vinte e quatro mil e quinhentos reais)"
                  className="bg-background border-input text-foreground"
                />
                <p className="text-xs text-muted-foreground">
                  Inclua o valor por extenso, ex: R$ 10.000,00 (dez mil reais)
                </p>
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
                  placeholder="À vista"
                  className="bg-background border-input text-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label>Data do Contrato</Label>
                <Input
                  type="date"
                  value={
                    contractData.contractDate
                      ? new Date(
                          contractData.contractDate.split("/").reverse().join("-"),
                        )
                          .toISOString()
                          .split("T")[0]
                      : new Date().toISOString().split("T")[0]
                  }
                  onChange={(e) => {
                    const date = new Date(e.target.value + "T12:00:00");
                    setContractData({
                      ...contractData,
                      contractDate: date.toLocaleDateString("pt-BR"),
                    });
                  }}
                  className="bg-background border-input text-foreground"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
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
      </div>
    </AdminPageContainer>
  );
}
