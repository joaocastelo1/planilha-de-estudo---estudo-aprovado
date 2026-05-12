# 🚀 Antigravity Study System

O **Antigravity Study System** é um dashboard de estudos de alta performance projetado para estudantes de TI e Teologia Secular que buscam produtividade extrema e aprendizado ativo. 

Desenvolvido com uma abordagem **Offline-First**, o sistema garante que seus dados estejam sempre disponíveis, independentemente da conexão com a internet, utilizando persistência local avançada com IndexedDB.

## 🧠 Principais Funcionalidades

- **Dashboard Inteligente**: Visão geral de progresso, gráficos de tempo de estudo e streaks diários.
- **Antigravity Mode**: Algoritmo de priorização que sugere automaticamente o que estudar baseado em revisões atrasadas e metas.
- **Sistema de Flashcards (SM-2)**: Algoritmo de repetição espaçada (Spaced Repetition) para memorização de longo prazo.
- **Modo Foco (Pomodoro)**: Timer integrado para Deep Work com registro automático de sessões.
- **Gestão de Conteúdo (Zettelkasten)**: Sistema de notas interligadas para construção de um "Segundo Cérebro".
- **Trilhas Especializadas**: Organização dedicada para TI (Back-end, Front-end, DB) e Teologia Secular.
- **Offline-First**: Totalmente funcional sem internet via IndexedDB.

## 🛠️ Stack Tecnológica

- **Frontend**: Next.js 14+ (App Router), TypeScript.
- **Estilização**: TailwindCSS v4, Framer Motion (animações), Lucide React (ícones).
- **Gerenciamento de Estado**: Zustand.
- **Banco de Dados**: Dexie.js (IndexedDB wrapper).
- **Gráficos**: Recharts.

## 📂 Estrutura de Pastas

```text
src/
 ├── app/             # Rotas e Layouts (Next.js App Router)
 ├── components/      # Componentes UI reutilizáveis (Design System)
 ├── db/              # Schema e configuração do Dexie.js
 ├── features/        # Módulos específicos (Dashboard, Flashcards, etc)
 ├── lib/             # Utilitários, hooks e algoritmos (SM-2, cn)
 ├── store/           # Zustand stores para estado global
 └── types/           # Definições de tipos TypeScript
```

## 🚀 Como Rodar Localmente

1. **Clone o projeto**:
   ```bash
   git clone <link-do-repositorio>
   cd antigravity-study
   ```

2. **Instale as dependências**:
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```

4. **Acesse**:
   Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## 🔒 Privacidade e Dados

Todos os seus dados são armazenados localmente no seu navegador. Você pode exportar ou importar seus dados em formato JSON a qualquer momento através da aba de **Configurações**.

---
*Desenvolvido com foco em alta performance e aprendizado profundo.*
