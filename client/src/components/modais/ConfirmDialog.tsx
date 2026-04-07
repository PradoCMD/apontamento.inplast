import { X } from "lucide-react";

interface Props {
  open: boolean;
  title: string;
  message?: string;
  onCancel: () => void;
  onConfirm: () => void;
  loading?: boolean;
  variant?: "default" | "danger";
}

export default function ConfirmDialog({ open, title, message, onCancel, onConfirm, loading, variant = "default" }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onCancel}>
      <div className="bg-surface-dialog rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-border animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-text font-semibold text-lg text-center mb-2">{title}</h3>
        {message && <p className="text-text-secondary text-sm text-center mb-4">{message}</p>}

        {loading ? (
          <div className="flex flex-col items-center py-4">
            <div className="w-10 h-10 border-3 border-accent border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-text-secondary text-sm">Processando...</p>
          </div>
        ) : (
          <div className="flex gap-3 mt-6">
            <button
              onClick={onCancel}
              className="flex-1 h-11 bg-surface-card border border-border rounded-xl text-text-secondary text-sm font-medium hover:bg-surface-elevated active:scale-[0.97] transition-all cursor-pointer"
            >
              CANCELAR
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 h-11 rounded-xl text-white text-sm font-semibold active:scale-[0.97] transition-all cursor-pointer ${
                variant === "danger"
                  ? "bg-danger hover:bg-danger-hover"
                  : "bg-accent hover:bg-accent-hover"
              }`}
            >
              CONTINUAR
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
