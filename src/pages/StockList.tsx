import React, { useState, useEffect } from "react";
import { getProducts, Product } from "../lib/db";
import {
  List,
  Search,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

export default function StockList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "low" | "normal">("all");

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const data = await getProducts();
    setProducts(data);
  };

  const getStockStatus = (product: Product) => {
    if (product.quantity <= 0) return "empty";
    if (product.quantity <= product.minStock) return "low";
    if (product.quantity <= product.minStock * 1.5) return "medium";
    return "normal";
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.barcode.includes(searchTerm);

    if (filter === "all") return matchesSearch;

    const status = getStockStatus(p);
    if (filter === "low")
      return matchesSearch && (status === "low" || status === "empty");
    if (filter === "normal")
      return matchesSearch && (status === "normal" || status === "medium");

    return matchesSearch;
  });

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <List className="w-6 h-6 text-blue-500" />
            Estoque Atual
          </h1>
          <p className="text-slate-500 mt-1">
            Visão geral de todos os produtos cadastrados.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nome ou código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "all"
                  ? "bg-slate-800 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilter("low")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                filter === "low"
                  ? "bg-red-100 text-red-700 border border-red-200"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <AlertCircle className="w-4 h-4" />
              Baixo
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                <th className="p-4 font-medium">Produto</th>
                <th className="p-4 font-medium">Categoria</th>
                <th className="p-4 font-medium">Quantidade</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">
                    Nenhum produto encontrado.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const status = getStockStatus(product);
                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="p-4">
                        <p className="font-medium text-slate-800">
                          {product.name}
                        </p>
                        <p className="text-xs text-slate-400 font-mono">
                          {product.barcode}
                        </p>
                      </td>
                      <td className="p-4 text-sm text-slate-600 capitalize">
                        {product.category}
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-slate-800">
                          {product.quantity}
                        </span>
                        <span className="text-slate-500 text-sm ml-1">
                          {product.unit}
                        </span>
                      </td>
                      <td className="p-4">
                        {status === "normal" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                            <CheckCircle className="w-3 h-3" /> Normal
                          </span>
                        )}
                        {status === "medium" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                            <AlertTriangle className="w-3 h-3" /> Médio
                          </span>
                        )}
                        {(status === "low" || status === "empty") && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                            <AlertCircle className="w-3 h-3" />{" "}
                            {status === "empty" ? "Zerado" : "Baixo"}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
