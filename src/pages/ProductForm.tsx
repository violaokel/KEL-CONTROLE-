import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { saveProduct, Product, getProductByBarcode } from "../lib/db";
import { Save, ArrowLeft, Barcode } from "lucide-react";

export default function ProductForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialBarcode = location.state?.barcode || "";

  const [formData, setFormData] = useState<Omit<Product, "id">>({
    name: "",
    barcode: initialBarcode,
    unit: "kg",
    category: "grãos",
    quantity: 0,
    minStock: 0,
  });
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "quantity" || name === "minStock" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      // Check if barcode already exists
      const existing = await getProductByBarcode(formData.barcode);
      if (existing) {
        setError("Já existe um produto com este código de barras.");
        return;
      }

      const newProduct: Product = {
        id: crypto.randomUUID(),
        ...formData,
      };

      await saveProduct(newProduct);
      navigate("/estoque");
    } catch (err) {
      setError("Erro ao salvar produto.");
      console.error(err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-slate-200 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Cadastrar Produto
          </h1>
          <p className="text-slate-500 mt-1">
            Adicione um novo item ao estoque.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 space-y-6"
      >
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nome do Produto *
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="Ex: Arroz Branco 5kg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Código de Barras *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Barcode className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                name="barcode"
                required
                value={formData.barcode}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="Escaneie ou digite o código"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Unidade de Medida *
              </label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
              >
                <option value="kg">Quilograma (kg)</option>
                <option value="litro">Litro (l)</option>
                <option value="unidade">Unidade (un)</option>
                <option value="pacote">Pacote (pct)</option>
                <option value="caixa">Caixa (cx)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Categoria *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
              >
                <option value="grãos">Grãos e Cereais</option>
                <option value="carnes">Carnes e Frios</option>
                <option value="laticínios">Laticínios</option>
                <option value="verduras">Verduras e Legumes</option>
                <option value="frutas">Frutas</option>
                <option value="limpeza">Material de Limpeza</option>
                <option value="outros">Outros</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Quantidade Inicial *
              </label>
              <input
                type="number"
                name="quantity"
                min="0"
                step="0.01"
                required
                value={formData.quantity}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Estoque Mínimo (Alerta) *
              </label>
              <input
                type="number"
                name="minStock"
                min="0"
                step="0.01"
                required
                value={formData.minStock}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            Salvar Produto
          </button>
        </div>
      </form>
    </div>
  );
}
