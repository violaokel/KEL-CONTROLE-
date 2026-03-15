import React, { useState, useEffect } from "react";
import { getMovements, getProducts, Movement, Product } from "../lib/db";
import {
  History as HistoryIcon,
  ArrowDownToLine,
  ArrowUpFromLine,
  Search,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MovementWithProduct extends Movement {
  productName: string;
  unit: string;
}

export default function History() {
  const [movements, setMovements] = useState<MovementWithProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "entrada" | "saida">(
    "all",
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const movs = await getMovements();
    const prods = await getProducts();

    const prodMap = new Map<string, Product>(prods.map((p) => [p.id, p]));

    const enriched = movs.map((m) => {
      const p = prodMap.get(m.productId);
      return {
        ...m,
        productName: p?.name || "Produto Excluído",
        unit: p?.unit || "",
      };
    });

    setMovements(enriched);
  };

  const filteredMovements = movements.filter((m) => {
    const matchesSearch =
      m.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.responsible.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterType === "all") return matchesSearch;
    return matchesSearch && m.type === filterType;
  });

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <HistoryIcon className="w-6 h-6 text-slate-600" />
          Histórico de Movimentações
        </h1>
        <p className="text-slate-500 mt-1">
          Acompanhe todas as entradas e saídas do estoque.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por produto ou responsável..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-500 outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterType === "all"
                  ? "bg-slate-800 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilterType("entrada")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                filterType === "entrada"
                  ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Entradas
            </button>
            <button
              onClick={() => setFilterType("saida")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                filterType === "saida"
                  ? "bg-amber-100 text-amber-700 border border-amber-200"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Saídas
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                <th className="p-4 font-medium">Data/Hora</th>
                <th className="p-4 font-medium">Tipo</th>
                <th className="p-4 font-medium">Produto</th>
                <th className="p-4 font-medium">Quantidade</th>
                <th className="p-4 font-medium">Responsável</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    Nenhuma movimentação encontrada.
                  </td>
                </tr>
              ) : (
                filteredMovements.map((mov) => (
                  <tr
                    key={mov.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {format(new Date(mov.date), "dd/MM/yyyy HH:mm", {
                          locale: ptBR,
                        })}
                      </div>
                    </td>
                    <td className="p-4">
                      {mov.type === "entrada" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                          <ArrowDownToLine className="w-3 h-3" /> Entrada
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                          <ArrowUpFromLine className="w-3 h-3" /> Saída
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-medium text-slate-800">
                      {mov.productName}
                    </td>
                    <td className="p-4">
                      <span
                        className={`font-semibold ${mov.type === "entrada" ? "text-emerald-600" : "text-amber-600"}`}
                      >
                        {mov.type === "entrada" ? "+" : "-"}
                        {mov.quantity}
                      </span>
                      <span className="text-slate-500 text-sm ml-1">
                        {mov.unit}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-600">
                      {mov.responsible}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
