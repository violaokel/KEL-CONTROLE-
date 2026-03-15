import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { saveUser, getUserByUsername, getUserById, User } from "../lib/db";
import { Save, ArrowLeft, AlertCircle } from "lucide-react";

export default function UserForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [formData, setFormData] = useState<Omit<User, "id">>({
    name: "",
    username: "",
    password: "",
    role: "employee",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEditing) {
      loadUser();
    }
  }, [id]);

  const loadUser = async () => {
    if (!id) return;
    const user = await getUserById(id);
    if (user) {
      setFormData({
        name: user.name,
        username: user.username,
        password: "", // Do not populate password field
        role: user.role,
      });
    } else {
      setError("Usuário não encontrado.");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.username || (!isEditing && !formData.password)) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }

    try {
      // Check if username already exists for a different user
      const existing = await getUserByUsername(formData.username);
      if (existing && existing.id !== id) {
        setError("Este nome de usuário já está em uso.");
        return;
      }

      let finalPassword = formData.password;
      if (isEditing && !formData.password && id) {
        const existingUser = await getUserById(id);
        if (existingUser) {
          finalPassword = existingUser.password || "";
        }
      }

      const newUser: User = {
        id: isEditing ? id : crypto.randomUUID(),
        ...formData,
        password: finalPassword,
      };

      await saveUser(newUser);
      navigate("/usuarios");
    } catch (err) {
      setError("Erro ao salvar usuário.");
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
            {isEditing ? "Editar Usuário" : "Cadastrar Usuário"}
          </h1>
          <p className="text-slate-500 mt-1">
            {isEditing ? "Atualize os dados do usuário." : "Adicione um novo acesso ao sistema."}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 space-y-6"
      >
        {error && (
          <div className="flex items-center gap-2 bg-red-50 text-red-600 p-4 rounded-lg text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nome Completo *
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Ex: João da Silva"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Usuário (Login) *
            </label>
            <input
              type="text"
              name="username"
              required
              value={formData.username}
              onChange={handleChange}
              disabled={isEditing && formData.username === 'admin'}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-slate-100 disabled:text-slate-500"
              placeholder="Ex: joao.silva"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Senha {isEditing ? "(Opcional)" : "*"}
            </label>
            <input
              type="password"
              name="password"
              required={!isEditing}
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder={isEditing ? "Deixe em branco para manter a mesma" : "Digite a senha"}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Perfil de Acesso *
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={isEditing && formData.username === 'admin'}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none bg-white disabled:bg-slate-100 disabled:text-slate-500"
            >
              <option value="employee">Funcionário</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            Salvar Usuário
          </button>
        </div>
      </form>
    </div>
  );
}
