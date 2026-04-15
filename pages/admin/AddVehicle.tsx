import {
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AdminPageContainer,
  AdminPageHeader,
} from "../../components/AdminPageComponents";
import ImageUpload from "../../components/ImageUpload";
import { Button, Card, CardContent, Input, Label } from "../../components/ui/core";
import { Combobox } from "../../components/ui/combobox";
import { COLOR_OPTIONS } from "../../constants/colors";
import { formatCurrencyDisplay, parseCurrencyInput } from "../../utils/formatters";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";
import { getBrands, getModels } from "../../services/brandService";
import {
  createVehicle,
  getVehicles,
  updateVehicle,
} from "../../services/vehicleService";
import { Brand, Model, Vehicle } from "../../types";
import { validateVehicle } from "../../validations/vehicleSchema";

export default function AddVehicle() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Vehicle>>({
    type: "moto",
    brand_id: "",
    model_id: "",
    brand: "",
    model: "",
    price: 0,
    purchase_price: 0,
    year: new Date().getFullYear(),
    mileage: 0,
    color: "",
    description: "",
    images: [],
    plate_end: "",
    status: "available",
  });
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // Brands and Models State
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);

  // Carregar dados do veículo se estiver editando
  useEffect(() => {
    if (isEditing && id) {
      loadVehicleData(id);
    } else {
      loadBrands();
    }
  }, [id, isEditing]);

  // Recarregar marcas quando o tipo mudar
  useEffect(() => {
    if (formData.type) {
      loadBrands();
    }
  }, [formData.type]);

  const loadVehicleData = async (vehicleId: string) => {
    setLoading(true);
    try {
      const vehicles = await getVehicles();
      const vehicle = vehicles.find((v) => v.id === vehicleId);
      if (vehicle) {
        setFormData({
          type: vehicle.type,
          brand_id: vehicle.brand_id || "",
          model_id: vehicle.model_id || "",
          brand: vehicle.brand || "",
          model: vehicle.model || "",
          price: vehicle.price,
          year: vehicle.year,
          mileage: vehicle.mileage,
          color: vehicle.color || "",
          description: vehicle.description,
          images: vehicle.images || [],
          plate_end: vehicle.plate_end || "",
          status: vehicle.status,
        });

        // Carregar marcas baseado no tipo do veículo
        setLoadingBrands(true);
        try {
          const brandsData = await getBrands(vehicle.type as "carro" | "moto");
          setBrands(brandsData);
        } catch (error) {
          console.error("Erro ao carregar marcas:", error);
        } finally {
          setLoadingBrands(false);
        }

        // Se tiver brand_id, carregar modelos
        if (vehicle.brand_id) {
          await loadModels(vehicle.brand_id, vehicle.type as "carro" | "moto");
        }
      }
    } catch (error) {
      console.error("Erro ao carregar veículo:", error);
      alert("Erro ao carregar dados do veículo.");
      navigate("/admin/estoque");
    } finally {
      setLoading(false);
    }
  };

  // Carregar marcas baseado no tipo
  const loadBrands = async () => {
    if (!formData.type) return;
    setLoadingBrands(true);
    try {
      const data = await getBrands(formData.type as "carro" | "moto");
      setBrands(data);
    } catch (error) {
      console.error("Erro ao carregar marcas:", error);
    } finally {
      setLoadingBrands(false);
    }
  };

  // Carregar modelos quando marca for selecionada
  const loadModels = async (
    brandId: string,
    vehicleType?: "carro" | "moto",
  ) => {
    if (!brandId) {
      setModels([]);
      return;
    }
    setLoadingModels(true);
    try {
      const type = vehicleType || formData.type;
      const data = await getModels(brandId, type as "carro" | "moto");
      setModels(data);
    } catch (error) {
      console.error("Erro ao carregar modelos:", error);
    } finally {
      setLoadingModels(false);
    }
  };

  // Gerar título automaticamente
  const generateTitle = (
    brand: string,
    model: string,
    year: number,
  ): string => {
    return `${brand} ${model} ${year}`.trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Limpar erros anteriores
    setValidationErrors({});

    // Preparar dados para validação
    const dataToValidate = {
      ...formData,
      brand_id:
        formData.brand_id && formData.brand_id.trim() !== ""
          ? formData.brand_id
          : undefined,
      model_id:
        formData.model_id && formData.model_id.trim() !== ""
          ? formData.model_id
          : undefined,
      price: formData.price && formData.price > 0 ? formData.price : undefined,
      year: formData.year && formData.year > 0 ? formData.year : undefined,
      mileage:
        formData.mileage !== undefined && formData.mileage >= 0
          ? formData.mileage
          : undefined,
      images:
        formData.images && formData.images.length > 0 ? formData.images : [],
      status: "available",
    };

    // Validar com Yup
    const { isValid, errors } = await validateVehicle(dataToValidate);

    if (!isValid) {
      setValidationErrors(errors);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      setLoading(true);

      // Gerar título automaticamente antes de salvar
      const titleToSave = generateTitle(
        formData.brand || "",
        formData.model || "",
        formData.year || new Date().getFullYear(),
      );

      const vehicleData = {
        ...formData,
        title: titleToSave,
        status: isEditing ? formData.status : "available",
      };

      if (isEditing && id) {
        await updateVehicle(id, vehicleData);
      } else {
        await createVehicle(vehicleData as any);
      }

      navigate("/admin/estoque");
    } catch (error) {
      console.error("Erro ao salvar veículo:", error);
      alert("Erro ao salvar veículo. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = async (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;

    // Limpar erro do campo quando o usuário começar a digitar
    if (validationErrors[name]) {
      const newErrors = { ...validationErrors };
      delete newErrors[name];
      setValidationErrors(newErrors);
    }

    // Se o tipo mudar, recarregar marcas
    if (name === "type") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        brand_id: "",
        model_id: "",
        brand: "",
        model: "",
      }));
      setModels([]);
      await loadBrands();
      return;
    }

    setFormData((prev) => {
      const updatedData = {
        ...prev,
        [name]:
          name === "price" || name === "year" || name === "mileage"
            ? value === ""
              ? undefined
              : Number(value)
            : value,
      };

      return updatedData;
    });
  };

  // Handler específico para preço com máscara
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const numericValue = parseCurrencyInput(inputValue);

    setFormData((prev) => ({
      ...prev,
      price: numericValue,
    }));

    if (validationErrors.price) {
      const newErrors = { ...validationErrors };
      delete newErrors.price;
      setValidationErrors(newErrors);
    }
  };

  const handlePurchasePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = parseCurrencyInput(e.target.value);
    setFormData((prev) => ({ ...prev, purchase_price: numericValue }));
  };

  return (
    <AdminPageContainer>
      <AdminPageHeader
        title={isEditing ? "Editar Veículo" : "Adicionar Veículo"}
        description={
          isEditing
            ? "Atualize os detalhes do veículo abaixo."
            : "Preencha os detalhes do veículo abaixo."
        }
        actions={
          <Button
            variant="outline"
            onClick={() => navigate("/admin/estoque")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Button>
        }
      />

      <Card className="bg-card border-border shadow-sm">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
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
                        ),
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Imagens - Primeira posição */}
            <div className="space-y-2">
              <Label className="text-foreground">
                Imagens do Veículo (Máximo 10) *
              </Label>
              <ImageUpload
                images={formData.images || []}
                onChange={(newImages) => {
                  setFormData((prev) => ({ ...prev, images: newImages }));
                }}
                vehicleId={id}
              />
              {validationErrors.images && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {validationErrors.images}
                </p>
              )}
            </div>

            {/* Categoria */}
            <div className="space-y-2">
              <Label className="text-foreground">Categoria *</Label>
              <Select
                name="type"
                value={formData.type}
                onValueChange={(value) =>
                  handleInputChange({
                    target: { name: "type", value },
                  } as React.ChangeEvent<HTMLSelectElement>)
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="carro">Carro</SelectItem>
                  <SelectItem value="moto">Moto</SelectItem>
                </SelectContent>
              </Select>
              {validationErrors.type && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {validationErrors.type}
                </p>
              )}
            </div>

            {/* Marca e Modelo - Combobox com busca */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">Marca/Fabricante *</Label>
                <Combobox
                  options={brands.map((brand) => ({
                    value: brand.id,
                    label: brand.name,
                  }))}
                  value={formData.brand_id || ""}
                  onValueChange={(value) => {
                    const selectedBrand = brands.find((b) => b.id === value);
                    setFormData((prev) => ({
                      ...prev,
                      brand_id: value,
                      brand: selectedBrand?.name || "",
                      model_id: "",
                      model: "",
                    }));
                    setModels([]);
                    if (value) {
                      loadModels(value, formData.type as "carro" | "moto");
                    }
                    if (validationErrors.brand_id || validationErrors.brand) {
                      const newErrors = { ...validationErrors };
                      delete newErrors.brand_id;
                      delete newErrors.brand;
                      setValidationErrors(newErrors);
                    }
                  }}
                  placeholder={
                    loadingBrands ? "Carregando..." : "Selecione a marca"
                  }
                  searchPlaceholder="Buscar marca..."
                  disabled={loadingBrands}
                  error={
                    !!(validationErrors.brand_id || validationErrors.brand)
                  }
                />
                {(validationErrors.brand_id || validationErrors.brand) && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {validationErrors.brand_id || validationErrors.brand}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Modelo *</Label>
                <Combobox
                  options={models.map((model) => ({
                    value: model.id,
                    label: model.name,
                  }))}
                  value={formData.model_id || ""}
                  onValueChange={(value) => {
                    const selectedModel = models.find((m) => m.id === value);
                    setFormData((prev) => ({
                      ...prev,
                      model_id: value,
                      model: selectedModel?.name || "",
                    }));
                    if (validationErrors.model_id || validationErrors.model) {
                      const newErrors = { ...validationErrors };
                      delete newErrors.model_id;
                      delete newErrors.model;
                      setValidationErrors(newErrors);
                    }
                  }}
                  placeholder={
                    !formData.brand_id
                      ? "Selecione a marca primeiro"
                      : loadingModels
                        ? "Carregando..."
                        : "Selecione o modelo"
                  }
                  searchPlaceholder="Buscar modelo..."
                  disabled={!formData.brand_id || loadingModels}
                  error={
                    !!(validationErrors.model_id || validationErrors.model)
                  }
                />
                {(validationErrors.model_id || validationErrors.model) && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {validationErrors.model_id || validationErrors.model}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">Preço de Venda (R$) *</Label>
                <Input
                  type="text"
                  name="price"
                  value={formatCurrencyDisplay(formData.price)}
                  onChange={handlePriceChange}
                  placeholder="R$ 0,00"
                  required
                  className={
                    validationErrors.price
                      ? "bg-background border-red-500 dark:border-red-400 text-foreground"
                      : "bg-background border-input text-foreground"
                  }
                />
                {validationErrors.price && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {validationErrors.price}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">
                  Custo de Aquisição (R$)
                  <span className="ml-2 text-xs font-normal text-muted-foreground">(uso interno)</span>
                </Label>
                <Input
                  type="text"
                  name="purchase_price"
                  value={formatCurrencyDisplay(formData.purchase_price)}
                  onChange={handlePurchasePriceChange}
                  placeholder="R$ 0,00"
                  className="bg-background border-input text-foreground"
                />
                {formData.price && formData.purchase_price && formData.price > 0 && formData.purchase_price > 0 && (
                  <p className="text-xs text-green-600 dark:text-green-400">
                    Margem bruta:{" "}
                    <strong>
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(formData.price - formData.purchase_price)}
                    </strong>
                  </p>
                )}
              </div>
            </div>

            {/* Ano e Quilometragem */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">Ano *</Label>
                <Select
                  value={formData.year?.toString()}
                  onValueChange={(value) =>
                    handleInputChange({
                      target: { name: "year", value },
                    } as React.ChangeEvent<HTMLSelectElement>)
                  }
                  required
                >
                  <SelectTrigger
                    className={
                      validationErrors.year
                        ? "bg-background border-red-500 dark:border-red-400 text-foreground"
                        : "bg-background border-input text-foreground"
                    }
                  >
                    <SelectValue placeholder="Selecione o ano" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {Array.from(
                      { length: new Date().getFullYear() + 1 - 1980 + 1 },
                      (_, i) => new Date().getFullYear() + 1 - i,
                    ).map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.year && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {validationErrors.year}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Quilometragem (km) *</Label>
                <Input
                  type="number"
                  name="mileage"
                  value={formData.mileage === undefined ? "" : formData.mileage}
                  onChange={handleInputChange}
                  required
                  min="0"
                  placeholder="0"
                  className={
                    validationErrors.mileage
                      ? "bg-background border-red-500 dark:border-red-400 text-foreground"
                      : "bg-background border-input text-foreground"
                  }
                />
                {validationErrors.mileage && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {validationErrors.mileage}
                  </p>
                )}
              </div>
            </div>

            {/* Cor e Placa */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">Cor</Label>
                <Combobox
                  options={COLOR_OPTIONS}
                  value={formData.color || ""}
                  onValueChange={(value) => {
                    setFormData((prev) => ({ ...prev, color: value }));
                  }}
                  placeholder="Selecione a cor"
                  searchPlaceholder="Buscar cor..."
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Placa</Label>
                <Input
                  name="plate_end"
                  value={formData.plate_end}
                  onChange={(e) => {
                    const value = e.target.value
                      .replace(/[^a-zA-Z0-9]/g, "")
                      .toUpperCase();
                    setFormData((prev) => ({ ...prev, plate_end: value }));
                  }}
                  placeholder="Ex: ABC1234"
                  maxLength={7}
                  className="bg-background border-input text-foreground uppercase"
                />
              </div>
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label className="text-foreground">Descrição</Label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Descreva detalhes adicionais do veículo, equipamentos, estado de conservação, histórico, etc."
                className={
                  validationErrors.description
                    ? "border-red-500 dark:border-red-400"
                    : ""
                }
              />
              {validationErrors.description && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {validationErrors.description}
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-end pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/admin/estoque")}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={
                  loading ||
                  !formData.type ||
                  !formData.brand_id ||
                  (typeof formData.brand_id === "string" &&
                    formData.brand_id.trim() === "") ||
                  !formData.model_id ||
                  (typeof formData.model_id === "string" &&
                    formData.model_id.trim() === "") ||
                  !formData.price ||
                  formData.price <= 0 ||
                  !formData.year ||
                  formData.year <= 0 ||
                  formData.mileage === undefined ||
                  formData.mileage < 0 ||
                  !formData.images ||
                  formData.images.length === 0
                }
                className="w-full sm:w-auto"
              >
                {loading ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </AdminPageContainer>
  );
}
