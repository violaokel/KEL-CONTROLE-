import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import StockEntry from "./pages/StockEntry";
import StockExit from "./pages/StockExit";
import StockList from "./pages/StockList";
import History from "./pages/History";
import ProductForm from "./pages/ProductForm";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import UserList from "./pages/UserList";
import UserForm from "./pages/UserForm";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="entrada" element={<StockEntry />} />
            <Route path="saida" element={<StockExit />} />
            <Route path="estoque" element={<StockList />} />
            <Route path="historico" element={<History />} />
            <Route path="cadastrar" element={<ProductForm />} />
            <Route path="relatorios" element={<Reports />} />
            <Route path="configuracoes" element={<Settings />} />
            <Route path="usuarios" element={<UserList />} />
            <Route path="usuarios/cadastrar" element={<UserForm />} />
            <Route path="usuarios/editar/:id" element={<UserForm />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
