"use client";

import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Layout, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function MindMapsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      <header className="flex items-center gap-6">
        <Link href="/dashboard">
          <Button variant="outline" size="sm" className="rounded-xl p-3">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <div>
          <h1 className="text-4xl font-bold tracking-tight font-display text-primary">
            Mapas Mentais
          </h1>
          <p className="text-muted-foreground mt-1">
            Visualize seus conceitos de forma estruturada.
          </p>
        </div>
      </header>

      <Card className="p-16 text-center border-dashed border-2 bg-muted/5">
        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
          <Layout size={40} className="text-primary animate-pulse" />
        </div>
        <h3 className="text-2xl font-black font-display tracking-tight">Em Desenvolvimento</h3>
        <p className="text-muted-foreground mt-3 max-w-md mx-auto font-medium">
          Estamos construindo uma ferramenta poderosa para você criar e visualizar mapas mentais integrados às suas disciplinas.
        </p>
        <div className="mt-10">
          <Link href="/dashboard">
            <Button className="rounded-2xl px-8 h-12 font-bold shadow-lg shadow-primary/20">
              Voltar ao Dashboard
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
