import React, { useState, useEffect } from "react";
import { getProducts, getMovements, Product, Movement } from "../lib/db";
import {
  FileText,
  Download,
  FileSpreadsheet,
  FileIcon as FilePdf,
  List,
  History as HistoryIcon,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Reports() {
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setProducts(await getProducts());
      setMovements(await getMovements());
    };
    loadData();
  }, []);

  const exportStockPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Relatório de Estoque - Merenda Escolar", 14, 22);

    doc.setFontSize(11);
    doc.text(
      `Data de emissão: ${format(new Date(), "dd/MM/yyyy HH:mm")}`,
      14,
      30,
    );

    const tableData = products.map((p) => [
      p.name,
      p.category,
      `${p.quantity} ${p.unit}`,
      p.quantity <= p.minStock ? "Baixo/Zerado" : "Normal",
    ]);

    autoTable(doc, {
      startY: 40,
      head: [["Produto", "Categoria", "Quantidade", "Status"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [5, 150, 105] }, // emerald-600
    });

    doc.save("relatorio-estoque.pdf");
  };

  const exportStockExcel = () => {
    const data = products.map((p) => ({
      Produto: p.name,
      "Código de Barras": p.barcode,
      Categoria: p.category,
      Quantidade: p.quantity,
      Unidade: p.unit,
      "Estoque Mínimo": p.minStock,
      Status: p.quantity <= p.minStock ? "Baixo/Zerado" : "Normal",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Estoque");
    XLSX.writeFile(wb, "relatorio-estoque.xlsx");
  };

  const exportMovementsExcel = () => {
    const prodMap = new Map<string, Product>(products.map((p) => [p.id, p]));

    const data = movements.map((m) => {
      const p = prodMap.get(m.productId);
      return {
        "Data/Hora": format(new Date(m.date), "dd/MM/yyyy HH:mm"),
        Tipo: m.type === "entrada" ? "Entrada" : "Saída",
        Produto: p?.name || "Produto Excluído",
        Quantidade: m.quantity,
        Unidade: p?.unit || "",
        Responsável: m.responsible,
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Movimentações");
    XLSX.writeFile(wb, "relatorio-movimentacoes.xlsx");
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <FileText className="w-6 h-6 text-indigo-500" />
          Relatórios
        </h1>
        <p className="text-slate-500 mt-1">
          Gere e exporte relatórios do sistema.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stock Report */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
            <List className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 mb-2">
            Posição de Estoque
          </h2>
          <p className="text-slate-600 text-sm mb-6">
            Relatório completo com todos os produtos, quantidades atuais e
            status de alerta.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={exportStockPDF}
              className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <FilePdf className="w-4 h-4" />
              Exportar PDF
            </button>
            <button
              onClick={exportStockExcel}
              className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Exportar Excel
            </button>
          </div>
        </div>

        {/* Movements Report */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-4">
            <HistoryIcon className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 mb-2">
            Histórico de Movimentações
          </h2>
          <p className="text-slate-600 text-sm mb-6">
            Relatório detalhado de todas as entradas e saídas registradas no
            sistema.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={exportMovementsExcel}
              className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Exportar Excel Completo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
