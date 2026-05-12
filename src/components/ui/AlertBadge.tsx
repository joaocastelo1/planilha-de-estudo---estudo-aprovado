import { cn } from "@/lib/utils";
import { AlertTriangle, Bell, CheckCircle2, Info, X } from "lucide-react";
import { motion } from "framer-motion";

interface AlertBadgeProps {
  type?: "info" | "warning" | "success" | "error";
  message: string;
  onDismiss?: () => void;
  isVisible?: boolean;
}

export function AlertBadge({ type = "info", message, onDismiss, isVisible = true }: AlertBadgeProps) {
  const config = {
    info: { icon: Info, bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
    warning: { icon: AlertTriangle, bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
    success: { icon: CheckCircle2, bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
    error: { icon: Bell, bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20" },
  };
  const { icon: Icon, bg, text, border } = config[type];

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={cn("flex items-center gap-2 px-3 py-2 rounded-xl border text-xs", bg, border, text)}
    >
      <Icon size={14} />
      <span className="flex-1">{message}</span>
      {onDismiss && (
        <button onClick={onDismiss} className="hover:opacity-70">
          <X size={12} />
        </button>
      )}
    </motion.div>
  );
}
