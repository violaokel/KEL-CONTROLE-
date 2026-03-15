import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getProductByBarcode,
  updateProductStock,
  saveMovement,
  Product,
} from "../lib/db";
import { useAuth } from "../contexts/AuthContext";
import BarcodeScanner from "../components/BarcodeScanner";
import {
  ArrowUpFromLine,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";

export default function StockExit() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [scanning, setScanning] = useState(false);
  const [barcode, setBarcode] = useState("");
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number | "">("");
  const [responsible, setResponsible] = useState(user?.name || user?.username || "");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleScan = async (decodedText: string) => {
    setBarcode(decodedText);
    setScanning(false);
    searchProduct(decodedText);
  };

  const searchProduct = async (code: string) => {
    setError("");
    setSuccess("");
    if (!code) return;

    try {
      const found = await getProductByBarcode(code);
      if (found) {
        setProduct(found);
      } else {
        setProduct(null);
        setError("Produto não encontrado no estoque.");
      }
    } catch (err) {
      setError("Erro ao buscar produto.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !quantity || Number(quantity) <= 0) {
      setError("Informe uma quantidade válida.");
      return;
    }

    if (Number(quantity) > product.quantity) {
      setError(
        `Quantidade indisponível. Estoque atual: ${product.quantity} ${product.unit}`,
      );
      return;
    }

    try {
      const newQuantity = product.quantity - Number(quantity);

      // Update stock
      await updateProductStock(product.id, newQuantity);

      // Save movement
      await saveMovement({
        id: crypto.randomUUID(),
        productId: product.id,
        type: "saida",
        quantity: Number(quantity),
        date: new Date().toISOString(),
        responsible: responsible,
      });

      setSuccess(
        `Saída de ${quantity} ${product.unit} de ${product.name} registrada com sucesso!`,
      );
      setProduct({ ...product, quantity: newQuantity });
      setQuantity("");
      setBarcode("");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Erro ao registrar saída.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <ArrowUpFromLine className="w-6 h-6 text-amber-500" />
          Registrar Saída
        </h1>
        <p className="text-slate-500 mt-1">
          Dê baixa em itens do estoque lendo o código de barras.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 space-y-6">
        {/* Scanner Toggle */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => setScanning(!scanning)}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              scanning
                ? "bg-red-100 text-red-700 hover:bg-red-200"
                : "bg-amber-100 text-amber-700 hover:bg-amber-200"
            }`}
          >
            {scanning ? "Cancelar Leitura" : "Abrir Câmera"}
          </button>

          <div className="flex-1 relative">
            <input
              type="text"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchProduct(barcode)}
              placeholder="Ou digite o código..."
              className="w-full pl-4 pr-10 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none"
            />
            <button
              onClick={() => searchProduct(barcode)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-amber-600"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>

        {scanning && (
          <div className="mt-4">
            <BarcodeScanner
              onScan={handleScan}
              onError={(err) => console.log(err)}
            />
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 bg-red-50 text-red-600 p-4 rounded-lg text-sm">
            <XCircle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 p-4 rounded-lg text-sm">
            <CheckCircle className="w-5 h-5 shrink-0" />
            {success}
          </div>
        )}

        {product && (
          <form
            onSubmit={handleSubmit}
            className="mt-6 pt-6 border-t border-slate-100"
          >
            <div className="bg-slate-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-lg text-slate-800">
                {product.name}
              </h3>
              <div className="flex justify-between mt-2 text-sm text-slate-600">
                <span>
                  Estoque Atual:{" "}
                  <strong className="text-slate-900">
                    {product.quantity} {product.unit}
                  </strong>
                </span>
                <span>Categoria: {product.category}</span>
              </div>
              {product.quantity <= product.minStock && (
                <div className="mt-3 flex items-center gap-1 text-amber-600 text-xs font-medium">
                  <AlertTriangle className="w-4 h-4" />
                  Atenção: Estoque baixo ou zerado.
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Quantidade Utilizada ({product.unit})
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  max={product.quantity}
                  required
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(e.target.value ? Number(e.target.value) : "")
                  }
                  className="w-full px-4 py-3 text-lg rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Responsável pela Movimentação
                </label>
                <input
                  type="text"
                  required
                  value={responsible}
                  onChange={(e) => setResponsible(e.target.value)}
                  className="w-full px-4 py-3 text-lg rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none"
                  placeholder="Nome do responsável"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={product.quantity <= 0}
              className="w-full mt-6 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <ArrowUpFromLine className="w-5 h-5" />
              Confirmar Saída
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
