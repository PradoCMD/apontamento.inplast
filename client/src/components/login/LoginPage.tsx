import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { Settings, Eye, EyeOff, LogIn, Cog } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) { toast.error("Preencha todos os campos"); return; }
    setLoading(true);
    try {
      await login(username, password);
      toast.success("Login realizado com sucesso!");
    } catch (err: any) {
      toast.error(err.message || "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 bg-gradient-to-b from-surface via-surface to-surface-elevated">
      {/* Logo */}
      <div className="mb-10 flex flex-col items-center animate-fade-in">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent to-primary flex items-center justify-center mb-4 shadow-lg shadow-accent/20">
          <Cog className="w-10 h-10 text-white" strokeWidth={1.5} />
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          AP<span className="text-accent">0</span>NTA
        </h1>
        <p className="text-text-secondary text-sm mt-1">Apontamento de Produção</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 animate-fade-in" style={{ animationDelay: "100ms" }}>
        <div className="space-y-1.5">
          <label htmlFor="login-username" className="text-xs font-medium text-text-secondary uppercase tracking-wider">Usuário</label>
          <input
            id="login-username"
            type="text"
            autoComplete="username"
            placeholder="seu.usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full h-12 px-4 bg-surface-card border border-border rounded-xl text-text placeholder:text-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="login-password" className="text-xs font-medium text-text-secondary uppercase tracking-wider">Senha</label>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 px-4 pr-12 bg-surface-card border border-border rounded-xl text-text placeholder:text-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors p-1"
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-13 bg-gradient-to-r from-accent to-primary-light text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-accent/20"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <LogIn className="w-5 h-5" />
              Entrar
            </>
          )}
        </button>
      </form>

      {/* Footer Config */}
      <button
        className="mt-12 p-3 text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
        aria-label="Configurações"
      >
        <Settings className="w-6 h-6" />
      </button>

      <p className="text-text-muted text-[10px] mt-4 text-center">
        Inplast Industrial © {new Date().getFullYear()}
      </p>
    </div>
  );
}
