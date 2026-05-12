"use client";

import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Brain, ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";

export default function FlashcardsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      <header className="flex items-center gap-6">
        <Link href="/dashboard">
          <Button variant="outline" size="sm" className="rounded-xl p-3">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <div>
          <Badge className="bg-primary/10 text-primary border-none mb-2">SRS Algorithm</Badge>
          <h1 className="text-4xl font-bold tracking-tight font-display text-primary">
            Flashcards
          </h1>
          <p className="text-muted-foreground mt-1">
            Memorização ativa com repetição espaçada.
          </p>
        </div>
      </header>

      <Card className="p-16 text-center border-dashed border-2 bg-muted/5">
        <div className="w-20 h-20 bg-purple-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
          <Brain size={40} className="text-purple-500 animate-bounce" />
        </div>
        <h3 className="text-2xl font-black font-display tracking-tight">Sistema de Flashcards</h3>
        <p className="text-muted-foreground mt-3 max-w-md mx-auto font-medium">
          Em breve você poderá criar baralhos inteligentes para cada disciplina e usar o algoritmo de repetição espaçada (SRS) para nunca mais esquecer o que estudou.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4">
           <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground/40">
             <Sparkles size={14} />
             Funcionalidade Premium
           </div>
          <Link href="/dashboard">
            <Button className="rounded-2xl px-8 h-12 font-bold shadow-lg shadow-primary/20">
              Explorar Outras Áreas
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
