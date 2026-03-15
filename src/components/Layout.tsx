import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Package,
  ArrowDownToLine,
  ArrowUpFromLine,
  List,
  History,
  FileText,
  LogOut,
  PlusCircle,
  Settings,
  Users,
} from "lucide-react";
import { cn } from "../lib/utils";

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: "Início", path: "/", icon: Package, roles: ["admin", "employee"] },
    { name: "Entrada", path: "/entrada", icon: ArrowDownToLine, roles: ["admin", "employee"] },
    { name: "Saída", path: "/saida", icon: ArrowUpFromLine, roles: ["admin", "employee"] },
    { name: "Estoque", path: "/estoque", icon: List, roles: ["admin", "employee"] },
    { name: "Histórico", path: "/historico", icon: History, roles: ["admin", "employee"] },
    { name: "Relatórios", path: "/relatorios", icon: FileText, roles: ["admin"] },
    { name: "Cadastrar", path: "/cadastrar", icon: PlusCircle, roles: ["admin", "employee"] },
    { name: "Usuários", path: "/usuarios", icon: Users, roles: ["admin"] },
    { name: "Configurações", path: "/configuracoes", icon: Settings, roles: ["admin"] },
  ];

  const filteredNavItems = navItems.filter(item => item.roles.includes(user?.role || 'employee'));

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden bg-emerald-600 text-white p-4 flex justify-between items-center shadow-md z-10">
        <div className="flex items-center gap-2">
          <Package className="w-6 h-6" />
          <h1 className="text-lg font-bold">MerendaEscolar</h1>
        </div>
        <button
          onClick={logout}
          className="p-2 hover:bg-emerald-700 rounded-full transition-colors"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-emerald-700 text-white shadow-xl">
        <div className="p-6 flex items-center gap-3 border-b border-emerald-600">
          <Package className="w-8 h-8" />
          <h1 className="text-xl font-bold">MerendaEscolar</h1>
        </div>
        <div className="p-4 border-b border-emerald-600">
          <p className="text-sm text-emerald-200">Usuário</p>
          <p className="font-medium truncate">{user?.name || user?.username}</p>
          <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-800 text-xs rounded-full uppercase tracking-wider">
            {user?.role === 'admin' ? 'Administrador' : 'Funcionário'}
          </span>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.path !== "/" && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  isActive
                    ? "bg-emerald-800 text-white font-medium"
                    : "text-emerald-100 hover:bg-emerald-600 hover:text-white",
                )}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-emerald-600">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-3 text-emerald-100 hover:bg-emerald-600 hover:text-white rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-[calc(100vh-64px)] md:h-screen overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden bg-white border-t border-slate-200 flex justify-around p-2 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10 overflow-x-auto">
        {filteredNavItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.path ||
            (item.path === "/" && location.pathname === "");
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center p-2 rounded-lg min-w-[64px]",
                isActive ? "text-emerald-600" : "text-slate-500",
              )}
            >
              <Icon
                className={cn("w-6 h-6 mb-1", isActive && "fill-emerald-100")}
              />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
