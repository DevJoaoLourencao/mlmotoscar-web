import React, { useEffect, useState } from 'react';
import { Calculator, User, Car, DollarSign, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, Label } from '../../components/ui/core';
import { AdminPageContainer, AdminPageHeader } from '../../components/AdminPageComponents';
import { Customer, Vehicle } from '../../types';
import { getCustomers } from '../../services/customerService';
import { getVehicles } from '../../services/vehicleService';

const INSTALLMENT_OPTIONS = [12, 24, 36, 48, 60];

export default function Financing() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  
  // Selection States
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  
  // Manual Input States
  const [isManualCustomer, setIsManualCustomer] = useState(false);
  const [isManualVehicle, setIsManualVehicle] = useState(false);
  
  const [manualCustomerData, setManualCustomerData] = useState({ name: '', cpf: '' });
  const [manualVehicleValue, setManualVehicleValue] = useState<number>(0);
  
  // Calculation States
  const [installments, setInstallments] = useState<number>(48);
  const [result, setResult] = useState<{ total: number, monthly: number } | null>(null);

  useEffect(() => {
    getCustomers().then(setCustomers);
    getVehicles().then(setVehicles);
  }, []);

  const handleCalculate = () => {
    let value = 0;

    if (isManualVehicle) {
        value = Number(manualVehicleValue);
    } else {
        const v = vehicles.find(v => v.id === selectedVehicleId);
        if (v) value = v.price;
    }

    if (value <= 0) {
        alert("Por favor, selecione um veículo válido ou insira um valor.");
        return;
    }

    // Logic defined by user: (Value * 2) / Installments
    const total = value * 2;
    const monthly = total / installments;

    setResult({ total, monthly });
  };

  const getCustomerName = () => {
      if (isManualCustomer) return manualCustomerData.name || 'Cliente';
      const c = customers.find(x => x.id === selectedCustomerId);
      return c ? c.name : 'Cliente';
  };

  const getVehicleTitle = () => {
      if (isManualVehicle) return 'Veículo Personalizado';
      const v = vehicles.find(x => x.id === selectedVehicleId);
      return v ? v.title : 'Veículo';
  };

  return (
    <AdminPageContainer>
       <AdminPageHeader
         title="Simulador de Financiamento"
         description="Estimativa de parcelas para apresentar ao cliente. Valores aproximados — sujeitos à análise do banco."
       />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Inputs */}
        <div className="space-y-6">
            
            {/* Customer Section */}
            <Card className="bg-card border-border shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                        <User className="h-5 w-5 text-primary" /> Dados do Cliente
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <input 
                            type="checkbox" 
                            id="manualCustomer" 
                            checked={isManualCustomer} 
                            onChange={(e) => setIsManualCustomer(e.target.checked)}
                            className="rounded border-input text-primary focus:ring-primary"
                        />
                        <Label htmlFor="manualCustomer" className="text-sm cursor-pointer font-normal">Inserir manualmente</Label>
                    </div>

                    {isManualCustomer ? (
                        <div className="space-y-3 animate-in fade-in">
                             <div className="space-y-2">
                                <Label>Nome Completo</Label>
                                <Input 
                                    value={manualCustomerData.name}
                                    onChange={(e) => setManualCustomerData({...manualCustomerData, name: e.target.value})}
                                    placeholder="Nome do cliente"
                                    className="bg-background border-input text-foreground"
                                />
                             </div>
                             <div className="space-y-2">
                                <Label>CPF</Label>
                                <Input 
                                    value={manualCustomerData.cpf}
                                    onChange={(e) => setManualCustomerData({...manualCustomerData, cpf: e.target.value})}
                                    placeholder="000.000.000-00"
                                    className="bg-background border-input text-foreground"
                                />
                             </div>
                        </div>
                    ) : (
                        <div className="space-y-2 animate-in fade-in">
                            <Label>Selecionar Cliente da Base</Label>
                            <select 
                                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-foreground"
                                value={selectedCustomerId}
                                onChange={(e) => setSelectedCustomerId(e.target.value)}
                            >
                                <option value="">Selecione...</option>
                                {customers.map(c => (
                                    <option key={c.id} value={c.id}>{c.name} - {c.cpf}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Vehicle Section */}
             <Card className="bg-card border-border shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                        <Car className="h-5 w-5 text-primary" /> Veículo e Valor
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex items-center gap-2 mb-2">
                        <input 
                            type="checkbox" 
                            id="manualVehicle" 
                            checked={isManualVehicle} 
                            onChange={(e) => setIsManualVehicle(e.target.checked)}
                            className="rounded border-input text-primary focus:ring-primary"
                        />
                        <Label htmlFor="manualVehicle" className="text-sm cursor-pointer font-normal">Inserir valor manualmente</Label>
                    </div>

                    {isManualVehicle ? (
                        <div className="space-y-3 animate-in fade-in">
                             <div className="space-y-2">
                                <Label>Valor do Veículo (R$)</Label>
                                <Input 
                                    type="number"
                                    value={manualVehicleValue}
                                    onChange={(e) => setManualVehicleValue(Number(e.target.value))}
                                    placeholder="0,00"
                                    className="bg-background border-input text-foreground"
                                />
                             </div>
                        </div>
                    ) : (
                        <div className="space-y-2 animate-in fade-in">
                            <Label>Selecionar do Estoque</Label>
                            <select 
                                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-foreground"
                                value={selectedVehicleId}
                                onChange={(e) => setSelectedVehicleId(e.target.value)}
                            >
                                <option value="">Selecione...</option>
                                {vehicles.map(v => (
                                    <option key={v.id} value={v.id}>
                                        {v.title} - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v.price)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Installments Section */}
            <Card className="bg-card border-border shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                        <Calendar className="h-5 w-5 text-primary" /> Prazo
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-5 gap-2">
                        {INSTALLMENT_OPTIONS.map((n) => (
                          <div
                            key={n}
                            onClick={() => setInstallments(n)}
                            className={`cursor-pointer rounded-xl border-2 p-3 text-center transition-all ${installments === n ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
                          >
                            <span className="block text-xl font-bold text-foreground">{n}x</span>
                            <span className="text-xs text-muted-foreground">meses</span>
                          </div>
                        ))}
                    </div>

                    <Button onClick={handleCalculate} size="lg" className="w-full mt-6 text-lg font-bold gap-2">
                        <Calculator className="h-5 w-5" /> Calcular Agora
                    </Button>
                </CardContent>
            </Card>
        </div>

        {/* Right Column: Result */}
        <div className="lg:h-full">
            <Card className={`bg-card border-border shadow-lg h-full transition-all duration-500 ${result ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-4'}`}>
                <CardHeader className="bg-muted/50 border-b border-border pb-6">
                    <CardTitle className="text-center text-foreground">Resumo da Simulação</CardTitle>
                </CardHeader>
                <CardContent className="p-8 flex flex-col justify-between h-[calc(100%-80px)]">
                    {result ? (
                        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
                            <div className="text-center space-y-2">
                                <p className="text-sm text-muted-foreground uppercase tracking-widest">Valor da Parcela</p>
                                <p className="text-5xl md:text-6xl font-black text-primary">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(result.monthly)}
                                </p>
                                <div className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-bold">
                                    Em {installments}x
                                </div>
                            </div>

                            <div className="space-y-4 pt-8 border-t border-border/50">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Cliente:</span>
                                    <span className="font-medium text-foreground">{getCustomerName()}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Veículo:</span>
                                    <span className="font-medium text-foreground text-right max-w-[200px] truncate">{getVehicleTitle()}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Valor Financiado (Total):</span>
                                    <span className="font-bold text-foreground">
                                         {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(result.total)}
                                    </span>
                                </div>
                            </div>

                            <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                              <p className="text-xs text-yellow-700 dark:text-yellow-400 text-center">
                                Estimativa com taxa aproximada. Valores reais dependem da análise do banco.
                              </p>
                            </div>
                            <div className="pt-2 space-y-3">
                                <Button
                                  className="w-full gap-2 h-12"
                                  onClick={() => navigate("/admin/vendas", {
                                    state: { preSelectedVehicleId: selectedVehicleId || undefined }
                                  })}
                                  disabled={!selectedVehicleId && !isManualVehicle}
                                >
                                    <ArrowRight className="h-5 w-5" /> Registrar Venda
                                </Button>
                                <Button variant="outline" className="w-full border-input text-foreground hover:bg-muted h-12" onClick={() => setResult(null)}>
                                    Nova Simulação
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-muted-foreground opacity-60">
                            <div className="p-6 bg-muted rounded-full">
                                <DollarSign className="h-12 w-12" />
                            </div>
                            <p className="max-w-xs text-lg">Preencha os dados ao lado para visualizar o cálculo do financiamento.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </AdminPageContainer>
  );
}
