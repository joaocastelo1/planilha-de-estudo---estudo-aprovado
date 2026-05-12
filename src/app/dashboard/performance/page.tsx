"use client";

import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TrendingUp } from "lucide-react";
import Link from "next/link";

export default function PerformancePage() {
  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      <header className="flex items-center gap-6">
        <Link href="/dashboard">
          <Button variant="outline" size="sm" className="rounded-xl">
            <TrendingUp size={18} />
          </Button>
        </Link>
        <div>
          <h1 className="text-4xl font-bold tracking-tight font-display">
            Desempenho
          </h1>
          <p className="text-muted-foreground mt-1">
            Análise de desempenho em breve.
          </p>
        </div>
      </header>

      <Card className="p-12 text-center">
        <TrendingUp size={48} className="mx-auto text-muted-foreground/20 mb-6" />
        <h3 className="text-xl font-bold font-display">Em Desenvolvimento</h3>
        <p className="text-muted-foreground mt-2 max-w-md mx-auto">
          Esta seção está sendo reformulada para oferecer métricas precisas de desempenho.
        </p>
        <Link href="/dashboard" className="mt-6 inline-block">
          <Button className="rounded-xl">Voltar ao Dashboard</Button>
        </Link>
      </Card>
    </div>
  );
}
