import { create } from "zustand";
import { persist } from "zustand/middleware";
import { db } from "../lib/db";
import type { User } from "../lib/db";
import { hashPassword, loginUser, registerUser, logoutUser, getCurrentUser, updateUser as updateUserDb } from "../lib/auth";

interface AuthState {
  user: (User & { id: number }) | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const user = await loginUser(email, password);
          if (user && user.id) {
            const { passwordHash: _, ...userWithoutPassword } = user;
            set({
              user: userWithoutPassword as User & { id: number },
              isAuthenticated: true,
              isLoading: false,
            });
            return true;
          }
          set({ isLoading: false, error: "E-mail ou senha incorretos." });
          return false;
        } catch (error) {
          set({ isLoading: false, error: "Erro ao fazer login." });
          return false;
        }
      },

      register: async (name: string, email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const user = await registerUser(name, email, password);
          if (user && user.id) {
            const { passwordHash: _, ...userWithoutPassword } = user;
            set({
              user: userWithoutPassword as User & { id: number },
              isAuthenticated: true,
              isLoading: false,
            });
            return true;
          }
          set({ isLoading: false, error: "E-mail já cadastrado." });
          return false;
        } catch (error) {
          set({ isLoading: false, error: "Erro ao registrar." });
          return false;
        }
      },

      logout: async () => {
        await logoutUser();
        set({ user: null, isAuthenticated: false, error: null });
      },

      checkAuth: async () => {
        try {
          const user = await getCurrentUser();
          if (user && user.id) {
            const { passwordHash: _, ...userWithoutPassword } = user;
            set({
              user: userWithoutPassword as User & { id: number },
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            set({ isLoading: false });
          }
        } catch (error) {
          set({ isLoading: false });
        }
      },

      updateUser: async (data: Partial<User>) => {
        const { user } = get();
        if (!user?.id) return;
        await updateUserDb(user.id, data);
        const updated = await db.users.get(user.id);
        if (updated) {
          const { passwordHash: _, ...userWithoutPassword } = updated;
          set({ user: userWithoutPassword as User & { id: number } });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "estudo-aprovado-auth",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
