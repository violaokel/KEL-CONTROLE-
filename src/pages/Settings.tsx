import React, { useState } from "react";
import { exportDatabase, importDatabase } from "../lib/db";
import {
  Settings as SettingsIcon,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

export default function Settings() {
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleExport = async () => {
    try {
      const data = await exportDatabase();
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `merenda-backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setMessage({ type: "success", text: "Backup exportado com sucesso!" });
    } catch (err) {
      setMessage({ type: "error", text: "Erro ao exportar backup." });
    }
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (
      !window.confirm(
        "Atenção: A importação irá sobrescrever TODOS os dados atuais. Deseja continuar?",
      )
    ) {
      e.target.value = "";
      return;
    }

    setImporting(true);
    try {
      const text = await file.text();
      await importDatabase(text);
      setMessage({
        type: "success",
        text: "Dados importados com sucesso! Recarregando...",
      });
      setTimeout(() => window.location.reload(), 2000);
    } catch (err) {
      setMessage({
        type: "error",
        text: "Erro ao importar arquivo. Verifique se o formato está correto.",
      });
      setImporting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-slate-600" />
          Configurações e Backup
        </h1>
        <p className="text-slate-500 mt-1">Gerencie os dados do aplicativo.</p>
      </div>

      {message.text && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-center gap-2 text-sm ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertTriangle className="w-5 h-5" />
          )}
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 space-y-8">
        {/* Export */}
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-2">
            Exportar Dados (Backup)
          </h2>
          <p className="text-slate-600 text-sm mb-4">
            Baixe um arquivo contendo todos os produtos e histórico de
            movimentações. Guarde este arquivo em um local seguro.
          </p>
          <button
            onClick={handleExport}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center gap-2 text-sm"
          >
            <Download className="w-4 h-4" />
            Fazer Download do Backup
          </button>
        </div>

        <hr className="border-slate-100" />

        {/* Import */}
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-2 text-red-600 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Importar Dados (Restaurar)
          </h2>
          <p className="text-slate-600 text-sm mb-4">
            Restaure os dados a partir de um arquivo de backup anterior.
            <strong className="text-red-600 block mt-1">
              Isso apagará todos os dados atuais do aplicativo!
            </strong>
          </p>

          <div className="relative">
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              disabled={importing}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
            <button
              disabled={importing}
              className="bg-red-50 hover:bg-red-100 text-red-700 font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center gap-2 text-sm border border-red-200 w-full sm:w-auto justify-center"
            >
              <Upload className="w-4 h-4" />
              {importing ? "Importando..." : "Selecionar Arquivo de Backup"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
