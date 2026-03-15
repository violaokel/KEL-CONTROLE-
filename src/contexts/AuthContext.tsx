import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { User, getUserByUsername, saveUser } from "../lib/db";
import { auth, googleProvider } from "../firebase";
import { signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from "firebase/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const email = firebaseUser.email || "";
        let dbUser = await getUserByUsername(email);

        // Se o usuário não existir no banco local, vamos criá-lo
        if (!dbUser) {
          const role = email === "violaokel@gmail.com" ? "admin" : "employee";
          dbUser = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || "Usuário",
            username: email,
            role: role,
          };
          await saveUser(dbUser);
        } else if (email === "violaokel@gmail.com" && dbUser.role !== "admin") {
          // Garante que este e-mail específico seja SEMPRE administrador
          dbUser.role = "admin";
          await saveUser(dbUser);
        }

        setUser(dbUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Error signing in with Google", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {!loading && children}
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
