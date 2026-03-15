import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
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

function PrivateRoute({ children, requiredRole }: { children: React.ReactNode, requiredRole?: 'admin' | 'employee' }) {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="entrada" element={<StockEntry />} />
            <Route path="saida" element={<StockExit />} />
            <Route path="estoque" element={<StockList />} />
            <Route path="historico" element={<History />} />
            <Route path="cadastrar" element={<ProductForm />} />
            <Route path="relatorios" element={<PrivateRoute requiredRole="admin"><Reports /></PrivateRoute>} />
            <Route path="configuracoes" element={<PrivateRoute requiredRole="admin"><Settings /></PrivateRoute>} />
            <Route path="usuarios" element={<PrivateRoute requiredRole="admin"><UserList /></PrivateRoute>} />
            <Route path="usuarios/cadastrar" element={<PrivateRoute requiredRole="admin"><UserForm /></PrivateRoute>} />
            <Route path="usuarios/editar/:id" element={<PrivateRoute requiredRole="admin"><UserForm /></PrivateRoute>} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
