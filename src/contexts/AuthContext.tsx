import React, {
  createContext,
  useContext,
  ReactNode,
} from "react";
import { User } from "../lib/db";

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Always provide a default admin user since login is removed
  const user: User = {
    id: "default-admin",
    name: "Administrador",
    username: "violaokel@gmail.com",
    role: "admin",
  };

  const login = () => {};
  const logout = () => {};

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
