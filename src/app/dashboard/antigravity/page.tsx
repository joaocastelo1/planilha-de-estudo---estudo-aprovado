"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { motion } from "framer-motion";
import { 
  Zap, 
  Brain, 
  Clock, 
  Target, 
  ArrowRight,
  Sparkles,
  AlertCircle
} from "lucide-react";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function AntigravityPage() {
  const flashcardsToReview = useLiveQuery(
    () => db.flashcards.where("nextReview").belowOrEqual(Date.now()).toArray(),
    []
  );

  const pendingTopics = useLiveQuery(
    () => db.topics.where("status").equals("IN_PROGRESS").limit(5).toArray(),
    []
  );

  const importantNotes = useLiveQuery(
    () => db.notes.where("tags").equals("Importante").limit(3).toArray(),
    []
  );

  return (
    <div className="space-y-10 py-6">
      <header className="flex flex-col items-center text-center space-y-4">
        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/40 animate-pulse">
          <Zap className="text-primary-foreground w-8 h-8 fill-current" />
        </div>
        <h1 className="text-4xl font-bold font-outfit tracking-tighter">Aprovado Campeão</h1>
        <p className="text-muted-foreground max-w-md">
          Nosso algoritmo analisou seu progresso. Aqui estão as ações de maior impacto para hoje.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Priority 1: Flashcards */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-8 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 relative overflow-hidden group"
        >
          <div className="absolute -right-8 -top-8 text-primary/10 group-hover:scale-110 transition-transform">
            <Brain size={160} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary text-primary-foreground rounded-lg">
                <Brain size={20} />
              </div>
              <h3 className="text-xl font-bold">Revisões Críticas</h3>
            </div>
            
            <div className="space-y-4">
              <p className="text-lg">
                Você tem <span className="font-bold text-primary">{flashcardsToReview?.length || 0}</span> flashcards que precisam de atenção imediata para evitar o esquecimento.
              </p>
              <Link 
                href="/dashboard/flashcards"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
              >
                Começar agora <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Priority 2: In Progress Topics */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-8 rounded-3xl bg-card border border-border shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
              <Target size={20} />
            </div>
            <h3 className="text-xl font-bold">Continuar Estudando</h3>
          </div>

          <div className="space-y-4">
            {pendingTopics?.length === 0 ? (
              <p className="text-muted-foreground italic">Nenhum tópico em andamento no momento.</p>
            ) : (
              pendingTopics?.map((topic) => (
                <div key={topic.id} className="p-4 rounded-xl bg-accent/50 flex items-center justify-between group cursor-pointer hover:bg-accent transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-medium">{topic.name}</span>
                  </div>
                  <ChevronRight size={18} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Daily Suggestions */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Sparkles className="text-orange-500" size={24} />
          <h3 className="text-2xl font-bold font-outfit">Sugestões do Sistema</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
            <AlertCircle className="text-blue-500" size={32} />
            <h4 className="font-bold">Foco em TI</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Baseado nas suas últimas sessões, sugerimos focar em <strong>Estrutura de Dados</strong> hoje para consolidar seu aprendizado em Back-end.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
            <Clock className="text-purple-500" size={32} />
            <h4 className="font-bold">Deep Work</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Seu melhor horário de foco é entre <strong>10:00 e 12:00</strong>. Prepare uma sessão de 50 minutos para esse período.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
            <Target className="text-emerald-500" size={32} />
            <h4 className="font-bold">Meta Diária</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Você está a apenas <strong>30 minutos</strong> de bater seu recorde pessoal de estudo diário. Continue assim!
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function ChevronRight({ className, size = 24 }: { className?: string, size?: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
