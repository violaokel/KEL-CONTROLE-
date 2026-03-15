import React from "react";
import { Link } from "react-router-dom";
import {
  Package,
  ArrowDownToLine,
  ArrowUpFromLine,
  List,
  History,
  FileText,
  PlusCircle,
} from "lucide-react";

export default function Dashboard() {
  const actions = [
    {
      name: "Registrar Entrada",
      path: "/entrada",
      icon: ArrowDownToLine,
      color: "bg-emerald-500",
      hover: "hover:bg-emerald-600",
    },
    {
      name: "Registrar Saída",
      path: "/saida",
      icon: ArrowUpFromLine,
      color: "bg-amber-500",
      hover: "hover:bg-amber-600",
    },
    {
      name: "Ver Estoque",
      path: "/estoque",
      icon: List,
      color: "bg-blue-500",
      hover: "hover:bg-blue-600",
    },
    {
      name: "Relatórios",
      path: "/relatorios",
      icon: FileText,
      color: "bg-indigo-500",
      hover: "hover:bg-indigo-600",
    },
    {
      name: "Cadastrar Produto",
      path: "/cadastrar",
      icon: PlusCircle,
      color: "bg-purple-500",
      hover: "hover:bg-purple-600",
    },
    {
      name: "Histórico",
      path: "/historico",
      icon: History,
      color: "bg-slate-500",
      hover: "hover:bg-slate-600",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">
          Painel de Controle
        </h1>
        <p className="text-slate-500 mt-1">
          Selecione uma ação abaixo para gerenciar o estoque.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.path}
              to={action.path}
              className={`${action.color} ${action.hover} text-white rounded-2xl p-6 shadow-md transition-all transform hover:-translate-y-1 hover:shadow-lg flex flex-col items-center justify-center gap-4 aspect-square sm:aspect-auto sm:h-48`}
            >
              <Icon className="w-12 h-12" />
              <span className="text-lg font-semibold text-center">
                {action.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
