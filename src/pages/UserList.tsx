import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUsers, deleteUser, User } from "../lib/db";
import { Users, PlusCircle, Trash2, Shield, User as UserIcon, Edit2 } from "lucide-react";

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const data = await getUsers();
    setUsers(data);
  };

  const handleDelete = async (id: string, username: string) => {
    if (username === 'admin') {
      alert('Não é possível excluir o administrador padrão.');
      return;
    }
    
    if (window.confirm(`Tem certeza que deseja excluir o usuário "${username}"?`)) {
      await deleteUser(id);
      loadUsers();
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-500" />
            Usuários
          </h1>
          <p className="text-slate-500 mt-1">Gerencie os acessos ao sistema.</p>
        </div>
        <Link
          to="/usuarios/cadastrar"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
        >
          <PlusCircle className="w-5 h-5" />
          Novo Usuário
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                <th className="p-4 font-medium">Nome</th>
                <th className="p-4 font-medium">Usuário (Login)</th>
                <th className="p-4 font-medium">Perfil</th>
                <th className="p-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-medium text-slate-800">{u.name}</td>
                    <td className="p-4 text-slate-600">{u.username}</td>
                    <td className="p-4">
                      {u.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                          <Shield className="w-3 h-3" /> Administrador
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                          <UserIcon className="w-3 h-3" /> Funcionário
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => navigate(`/usuarios/editar/${u.id}`)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Editar Usuário"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        {u.username !== 'admin' && (
                          <button
                            onClick={() => handleDelete(u.id, u.username)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Excluir Usuário"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
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
