"use client";

import { useUIStore } from "@/store/useStore";
import { useAuthStore } from "@/store/authStore";
import {
  Moon,
  Sun,
  Download,
  Upload,
  Trash2,
  User,
  Shield,
  Palette,
  Clock,
  Bell,
} from "lucide-react";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { theme, toggleTheme } = useUIStore();
  const { user, updateUser, logout } = useAuthStore();
  const router = useRouter();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUser({ name, email });
      toast.success("Perfil atualizado!");
    } catch {
      toast.error("Erro ao salvar perfil.");
    } finally {
      setSaving(false);
    }
  };

  const exportData = async () => {
    try {
      const subjects = await db.subjects.toArray();
      const tasks = await db.tasks.toArray();
      const revisions = await db.revisions.toArray();
      const notes = await db.notes.toArray();
      const dailyStats = await db.dailyStats.toArray();

      const fullData = {
        subjects,
        tasks,
        revisions,
        notes,
        dailyStats,
        user,
        exportedAt: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(fullData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `estudo-aprovado-backup-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success("Dados exportados com sucesso!");
    } catch (err) {
      toast.error("Erro ao exportar dados.");
    }
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);

        if (!data.subjects && !data.tasks) {
          throw new Error("Formato inválido");
        }

        if (
          confirm(
            "Importar dados substituirá seu progresso local. Continuar?"
          )
        ) {
          await db.transaction(
            "rw",
            [
              db.subjects,
              db.tasks,
              db.revisions,
              db.notes,
              db.dailyStats,
            ],
            async () => {
              await db.subjects.clear();
              await db.tasks.clear();
              await db.revisions.clear();
              await db.notes.clear();
              await db.dailyStats.clear();

              if (data.subjects)
                await db.subjects.bulkAdd(data.subjects);
              if (data.tasks) await db.tasks.bulkAdd(data.tasks);
              if (data.revisions)
                await db.revisions.bulkAdd(data.revisions);
              if (data.notes) await db.notes.bulkAdd(data.notes);
              if (data.dailyStats)
                await db.dailyStats.bulkAdd(data.dailyStats);
            }
          );

          if (data.user) await updateUser(data.user);
          toast.success("Dados importados com sucesso!");
          window.location.reload();
        }
      } catch (err) {
        toast.error("Erro ao importar: arquivo inválido.");
      }
    };
    reader.readAsText(file);
  };

  const resetDB = async () => {
    if (
      confirm(
        "CUIDADO: Isso apagará TODOS os seus dados localmente. Esta ação é irreversível."
      )
    ) {
      await db.delete();
      localStorage.clear();
      toast.success("Sistema resetado. Reiniciando...");
      setTimeout(() => window.location.reload(), 1200);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-6">
      <header>
        <h1 className="text-3xl font-bold font-display tracking-tight">
          Configurações
        </h1>
        <p className="text-muted-foreground mt-1">
          Gerencie sua conta e preferências do sistema.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <aside className="space-y-1">
          {[
            { label: "Geral", icon: Palette, active: true },
            { label: "Perfil", icon: User, active: false },
            { label: "Segurança", icon: Shield, active: false },
          ].map((item) => (
            <button
              key={item.label}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium transition-colors",
                item.active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </aside>

        <div className="md:col-span-2 space-y-8">
          {/* Appearance */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold">Aparência</h3>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Tema do Sistema</p>
                  <p className="text-sm text-muted-foreground">
                    Alternar entre modo claro e escuro.
                  </p>
                </div>
                <button
                  onClick={toggleTheme}
                  className="p-3 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
                >
                  {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                </button>
              </div>
            </Card>
          </section>

          {/* Profile */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold">Perfil</h3>
            <Card className="p-6">
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Nome
                  </label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    E-mail
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="submit" isLoading={saving}>
                    Salvar Alterações
                  </Button>
                </div>
              </form>
            </Card>
          </section>

          {/* Preferences */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold">Preferências</h3>
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Tempo Pomodoro</p>
                  <p className="text-sm text-muted-foreground">
                    Duração de cada sessão de foco
                  </p>
                </div>
                <select
                  value={user?.preferences?.pomodoroTime || 25}
                  onChange={(e) =>
                    updateUser({
                      preferences: {
                        ...user?.preferences!,
                        pomodoroTime: Number(e.target.value),
                      },
                    })
                  }
                  className="px-4 py-2 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value={15}>15 minutos</option>
                  <option value={25}>25 minutos</option>
                  <option value={30}>30 minutos</option>
                  <option value={45}>45 minutos</option>
                  <option value={60}>60 minutos</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Tempo de Pausa</p>
                  <p className="text-sm text-muted-foreground">
                    Duração das pausas curtas
                  </p>
                </div>
                <select
                  value={user?.preferences?.breakTime || 5}
                  onChange={(e) =>
                    updateUser({
                      preferences: {
                        ...user?.preferences!,
                        breakTime: Number(e.target.value),
                      },
                    })
                  }
                  className="px-4 py-2 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value={5}>5 minutos</option>
                  <option value={10}>10 minutos</option>
                  <option value={15}>15 minutos</option>
                </select>
              </div>
            </Card>
          </section>

          {/* Data Management */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold">Gerenciamento de Dados</h3>
            <div className="space-y-4">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Exportar Backup</p>
                    <p className="text-sm text-muted-foreground">
                      Baixe todos os seus dados em formato JSON.
                    </p>
                  </div>
                  <Button onClick={exportData} variant="outline">
                    <Download size={18} />
                    Exportar
                  </Button>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Importar Backup</p>
                    <p className="text-sm text-muted-foreground">
                      Restaure seus dados a partir de um arquivo JSON.
                    </p>
                  </div>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".json"
                      onChange={importData}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Button variant="outline">
                      <Upload size={18} />
                      Importar
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-destructive/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-destructive">
                      Resetar Tudo
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Apagar permanentemente todos os dados locais.
                    </p>
                  </div>
                  <Button
                    onClick={resetDB}
                    variant="outline"
                    className="border-destructive/30 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 size={18} />
                    Resetar
                  </Button>
                </div>
              </Card>
            </div>
          </section>

          {/* Account Actions */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold">Conta</h3>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Sair da Conta</p>
                  <p className="text-sm text-muted-foreground">
                    Encerrar sua sessão atual.
                  </p>
                </div>
                <Button onClick={handleLogout} variant="outline">
                  Sair
                </Button>
              </div>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
