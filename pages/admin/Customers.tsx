import {
  AlertTriangle,
  Edit,
  Mail,
  Phone,
  Plus,
  Search,
  Trash2,
  User,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  AdminPageContainer,
  AdminPageHeader,
} from "../../components/AdminPageComponents";
import {
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
import {
  createCustomer,
  deleteCustomer,
  getCustomers,
  updateCustomer,
} from "../../services/customerService";
import { Customer } from "../../types";
import {
  formatBirthDate,
  formatCPF,
  formatPhone,
  validateCustomer,
} from "../../validations/customerSchema";

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Delete Modal State
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Customer>>({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    birth_date: "",
  });
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const loadData = () => {
    setLoading(true);
    getCustomers().then((data) => {
      setCustomers(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const confirmDelete = async () => {
    if (customerToDelete) {
      await deleteCustomer(customerToDelete);
      setCustomerToDelete(null);
      loadData();
    }
  };

  const openNewModal = () => {
    setEditingId(null);
    setValidationErrors({});
    setFormData({
      name: "",
      email: "",
      phone: "",
      cpf: "",
      birth_date: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (customer: Customer) => {
    setEditingId(customer.id);
    setValidationErrors({});
    setFormData({
      name: customer.name,
      email: customer.email || "",
      phone: customer.phone,
      cpf: customer.cpf || "",
      birth_date: customer.birth_date || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Limpar erros anteriores
    setValidationErrors({});

    // Validação básica de campos obrigatórios
    const errors: Record<string, string> = {};

    if (!formData.name || formData.name.trim() === "") {
      errors.name = "Nome completo é obrigatório";
    }

    if (!formData.phone || formData.phone.trim() === "") {
      errors.phone = "Telefone é obrigatório";
    }

    // Se houver erros básicos, exibir e parar
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setTimeout(() => {
        const modalContent = document.querySelector('[role="dialog"]');
        if (modalContent) {
          modalContent.scrollTop = 0;
        }
      }, 100);
      return;
    }

    // Validar com Yup (validações mais complexas)
    const { isValid, errors: yupErrors } = await validateCustomer(formData);

    if (!isValid) {
      setValidationErrors(yupErrors);

      // Rolar para o topo do modal para ver os erros
      setTimeout(() => {
        const modalContent = document.querySelector('[role="dialog"]');
        if (modalContent) {
          modalContent.scrollTop = 0;
        }
      }, 100);

      return;
    }

    try {
      if (editingId) {
        await updateCustomer(editingId, formData);
      } else {
        await createCustomer(formData as any);
      }

      setIsModalOpen(false);
      setValidationErrors({});
      loadData();
    } catch (error: any) {
      console.error("Erro ao salvar cliente:", error);

      // Verificar se é erro de CPF duplicado
      if (
        error?.message?.includes("customers_cpf_unique") ||
        error?.message?.includes("duplicate key")
      ) {
        setValidationErrors({
          cpf: "Este CPF já está cadastrado no sistema",
        });
        setTimeout(() => {
          const modalContent = document.querySelector('[role="dialog"]');
          if (modalContent) {
            modalContent.scrollTop = 0;
          }
        }, 100);
      } else {
        alert("Erro ao salvar cliente. Tente novamente.");
      }
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Limpar erro do campo quando o usuário começar a digitar
    if (validationErrors[name]) {
      const newErrors = { ...validationErrors };
      delete newErrors[name];
      setValidationErrors(newErrors);
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handler específico para telefone com máscara
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setFormData((prev) => ({ ...prev, phone: formatted }));

    if (validationErrors.phone) {
      const newErrors = { ...validationErrors };
      delete newErrors.phone;
      setValidationErrors(newErrors);
    }
  };

  // Handler específico para CPF com máscara
  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setFormData((prev) => ({ ...prev, cpf: formatted }));

    if (validationErrors.cpf) {
      const newErrors = { ...validationErrors };
      delete newErrors.cpf;
      setValidationErrors(newErrors);
    }
  };

  // Handler específico para data de nascimento com máscara
  const handleBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatBirthDate(e.target.value);
    setFormData((prev) => ({ ...prev, birth_date: formatted }));

    if (validationErrors.birth_date) {
      const newErrors = { ...validationErrors };
      delete newErrors.birth_date;
      setValidationErrors(newErrors);
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
      (c.phone && c.phone.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <AdminPageContainer>
      <AdminPageHeader
        title="Gerenciar Clientes"
        description="Cadastre e acompanhe seus leads e clientes."
        actions={
          <Button
            onClick={openNewModal}
            className="w-full md:w-auto gap-2 shadow-md"
          >
            <Plus className="h-4 w-4" /> Novo Cliente
          </Button>
        }
      />

      <Card className="bg-card border-border shadow-sm">
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <CardTitle className="text-foreground">Lista de Clientes</CardTitle>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, email ou telefone..."
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
                    Nome
                  </th>
                  <th className="h-12 px-4 align-middle font-semibold text-foreground/80">
                    Contato
                  </th>
                  <th className="h-12 px-4 align-middle font-semibold text-foreground/80">
                    CPF
                  </th>
                  <th className="h-12 px-4 align-middle font-semibold text-foreground/80">
                    Data Nasc.
                  </th>
                  <th className="h-12 px-4 align-middle font-semibold text-foreground/80 text-right">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {loading ? (
                  [1, 2, 3].map((i) => (
                    <tr key={i} className="border-b border-border">
                      <td className="p-4">
                        <Skeleton className="h-6 w-32" />
                      </td>
                      <td className="p-4">
                        <Skeleton className="h-6 w-40" />
                      </td>
                      <td className="p-4">
                        <Skeleton className="h-6 w-28" />
                      </td>
                      <td className="p-4">
                        <Skeleton className="h-6 w-24" />
                      </td>
                      <td className="p-4 text-right">
                        <Skeleton className="h-8 w-16 ml-auto" />
                      </td>
                    </tr>
                  ))
                ) : filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="border-b border-border transition-colors hover:bg-muted/20"
                    >
                      <td className="p-4 align-middle font-medium text-foreground">
                        <div className="flex items-center gap-2">
                          <div className="bg-primary/10 p-1.5 rounded-full">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          {customer.name}
                        </div>
                      </td>
                      <td className="p-4 align-middle text-muted-foreground">
                        <div className="flex flex-col gap-1 text-xs">
                          {customer.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" /> {customer.email}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {customer.phone}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 align-middle text-muted-foreground">
                        {customer.cpf || "-"}
                      </td>
                      <td className="p-4 align-middle text-muted-foreground">
                        {customer.birth_date || "-"}
                      </td>
                      <td className="p-4 align-middle text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                            onClick={() => openEditModal(customer)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-red-500 hover:bg-destructive/10"
                            onClick={() => setCustomerToDelete(customer.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-8 text-center text-muted-foreground"
                    >
                      Nenhum cliente encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!customerToDelete}
        onOpenChange={(open) => !open && setCustomerToDelete(null)}
      >
        <DialogContent
          className="sm:max-w-md"
          onClose={() => setCustomerToDelete(null)}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" /> Excluir Cliente?
            </DialogTitle>
            <DialogDescription>
              Esta ação não pode ser desfeita. O histórico deste cliente será
              perdido.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCustomerToDelete(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Excluir Agora
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Customer Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent
          className="sm:max-w-lg"
          onClose={() => setIsModalOpen(false)}
        >
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Editar Cliente" : "Novo Cliente"}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados de contato do cliente.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
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

            <div className="space-y-2">
              <Label className="text-foreground">Nome Completo *</Label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="João Silva"
                className={
                  validationErrors.name
                    ? "bg-background border-red-500 dark:border-red-400 text-foreground"
                    : "bg-background border-input text-foreground"
                }
              />
              {validationErrors.name && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {validationErrors.name}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">Telefone *</Label>
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  required
                  placeholder="(11) 98765-4321"
                  maxLength={15}
                  className={
                    validationErrors.phone
                      ? "bg-background border-red-500 dark:border-red-400 text-foreground"
                      : "bg-background border-input text-foreground"
                  }
                />
                {validationErrors.phone && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {validationErrors.phone}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Email</Label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="exemplo@email.com"
                  className={
                    validationErrors.email
                      ? "bg-background border-red-500 dark:border-red-400 text-foreground"
                      : "bg-background border-input text-foreground"
                  }
                />
                {validationErrors.email && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {validationErrors.email}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">CPF</Label>
                <Input
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleCPFChange}
                  placeholder="123.456.789-01"
                  maxLength={14}
                  className={
                    validationErrors.cpf
                      ? "bg-background border-red-500 dark:border-red-400 text-foreground"
                      : "bg-background border-input text-foreground"
                  }
                />
                {validationErrors.cpf && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {validationErrors.cpf}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Data de Nascimento</Label>
                <Input
                  name="birth_date"
                  value={formData.birth_date}
                  onChange={handleBirthDateChange}
                  placeholder="DD/MM/AAAA"
                  maxLength={10}
                  className={
                    validationErrors.birth_date
                      ? "bg-background border-red-500 dark:border-red-400 text-foreground"
                      : "bg-background border-input text-foreground"
                  }
                />
                {validationErrors.birth_date && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {validationErrors.birth_date}
                  </p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={!formData.name?.trim() || !formData.phone?.trim()}
              >
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminPageContainer>
  );
}
