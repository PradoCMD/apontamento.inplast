import { AuthProvider, useAuth } from "./hooks/useAuth";
import LoginPage from "./components/login/LoginPage";
import OrdensPage from "./components/ordens/OrdensPage";
import DetalheOP from "./components/detalhe-op/DetalheOP";
import ProdutosView from "./components/apontamento/ProdutosView";
import { useState } from "react";
import { Toaster } from "sonner";

type Screen = { name: "ordens" } | { name: "detalhe"; ordemId: number } | { name: "produtos"; apontamentoId: number; ordemId: number };

function AppContent() {
  const { user, loading } = useAuth();
  const [screen, setScreen] = useState<Screen>({ name: "ordens" });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <div className="w-10 h-10 border-3 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <LoginPage />;

  return (
    <div className="min-h-dvh flex flex-col">
      {screen.name === "ordens" && <OrdensPage onSelectOrdem={(id) => setScreen({ name: "detalhe", ordemId: id })} />}
      {screen.name === "detalhe" && (
        <DetalheOP
          ordemId={screen.ordemId}
          onBack={() => setScreen({ name: "ordens" })}
          onViewProdutos={(apontamentoId) => setScreen({ name: "produtos", apontamentoId, ordemId: screen.ordemId })}
        />
      )}
      {screen.name === "produtos" && (
        <ProdutosView
          apontamentoId={screen.apontamentoId}
          ordemId={screen.ordemId}
          onBack={() => setScreen({ name: "detalhe", ordemId: screen.ordemId })}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster position="top-center" richColors theme="dark" />
    </AuthProvider>
  );
}
