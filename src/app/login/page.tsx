"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import { LogIn, Mail, Lock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, error, clearError } = useAuthStore();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        toast.success("Bem-vindo de volta! 🎉");
        router.push("/dashboard");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[120px]" />

      <motion.div
        className="w-full max-w-md z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-3xl bg-card border border-border/50 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary/10 p-4">
            <img src="/logo_estudo_aprovado.svg" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-bold font-display tracking-tight">Aprovado Vencedor</h1>
          <p className="text-muted-foreground mt-2">Sua jornada rumo à aprovação começa aqui.</p>
        </div>

        <div className="bg-card border border-border rounded-[2rem] p-8 shadow-2xl shadow-black/5">
          <h2 className="text-xl font-semibold mb-8 flex items-center gap-2 font-display">
            <LogIn size={20} className="text-primary" /> Bem-vindo de volta
          </h2>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">E-mail</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full bg-muted/30 border border-transparent rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:bg-card focus:border-primary/30 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Senha</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-muted/30 border border-transparent rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:bg-card focus:border-primary/30 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                  required
                />
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-destructive text-xs bg-destructive/10 border border-destructive/20 rounded-xl p-3 font-medium"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full py-4 rounded-2xl text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2",
                isLoading && "opacity-70 cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Entrando...
                </>
              ) : "Entrar na plataforma"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-border flex flex-col items-center gap-4">
            <p className="text-sm text-muted-foreground">
              Ainda não tem uma conta?
            </p>
            <Link href="/register" className="w-full">
              <button className="w-full py-3.5 rounded-2xl text-sm font-semibold border border-border hover:bg-muted/30 transition-all">
                Criar conta gratuita
              </button>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
