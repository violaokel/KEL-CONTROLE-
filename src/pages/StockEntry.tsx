import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getProductByBarcode,
  updateProductStock,
  saveMovement,
  Product,
} from "../lib/db";
import { useAuth } from "../contexts/AuthContext";
import BarcodeScanner from "../components/BarcodeScanner";
import { ArrowDownToLine, Search, CheckCircle, XCircle } from "lucide-react";

export default function StockEntry() {
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
        setError("Produto não encontrado.");
        // Optional: prompt to register
        if (window.confirm("Produto não encontrado. Deseja cadastrar agora?")) {
          navigate("/cadastrar", { state: { barcode: code } });
        }
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

    try {
      const newQuantity = product.quantity + Number(quantity);

      // Update stock
      await updateProductStock(product.id, newQuantity);

      // Save movement
      await saveMovement({
        id: crypto.randomUUID(),
        productId: product.id,
        type: "entrada",
        quantity: Number(quantity),
        date: new Date().toISOString(),
        responsible: responsible,
      });

      setSuccess(
        `Entrada de ${quantity} ${product.unit} de ${product.name} registrada com sucesso!`,
      );
      setProduct({ ...product, quantity: newQuantity });
      setQuantity("");
      setBarcode("");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Erro ao registrar entrada.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <ArrowDownToLine className="w-6 h-6 text-emerald-600" />
          Registrar Entrada
        </h1>
        <p className="text-slate-500 mt-1">
          Adicione itens ao estoque lendo o código de barras.
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
                : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
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
              className="w-full pl-4 pr-10 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
            <button
              onClick={() => searchProduct(barcode)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-emerald-600"
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
            <XCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 p-4 rounded-lg text-sm">
            <CheckCircle className="w-5 h-5" />
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Quantidade Recebida ({product.unit})
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(e.target.value ? Number(e.target.value) : "")
                  }
                  className="w-full px-4 py-3 text-lg rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
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
                  className="w-full px-4 py-3 text-lg rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="Nome do responsável"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <ArrowDownToLine className="w-5 h-5" />
              Confirmar Entrada
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
