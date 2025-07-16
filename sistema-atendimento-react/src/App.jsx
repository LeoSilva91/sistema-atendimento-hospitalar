import React from "react";
import { SistemaAtendimentoProvider } from "./context/HospitalContext";
import { ToastProvider } from "./context/ToastProvider";
import Navigation from "./components/Navigation";
import Login from "./pages/Login";
import TelaCadastro from "./pages/TelaCadastro";
import PainelMedico from "./pages/PainelMedico";
import PainelPublico from "./pages/PainelPublico";
import HistoricoMedico from "./pages/HistoricoMedico";
import EmissaoFichas from "./components/EmissaoFichas";
import TelaTriagem from "./pages/TelaTriagem";
import GeradorSenha from "./components/GeradorSenha";
import { useSistemaAtendimento } from "./context/HospitalContext";

const AppContent = () => {
  const { currentUser, telaAtiva, verificarAcesso, trocarTela } = useSistemaAtendimento();

  React.useEffect(() => {
    if (currentUser && !verificarAcesso(telaAtiva)) {
      // Definir telas permitidas por tipo de usuário
      const acessos = {
        recepcionista: ["cadastro", "publico", "fichas", "senhas"],
        enfermeiro: ["triagem", "publico", "fichas"],
        medico: ["medico", "historico", "publico", "fichas"],
        admin: ["cadastro", "triagem", "medico", "historico", "publico", "fichas", "senhas"],
      };
      const permitidas = acessos[currentUser.tipo] || [];
      if (permitidas.length > 0) {
        trocarTela(permitidas[0]);
      }
    }
  }, [currentUser, telaAtiva, verificarAcesso, trocarTela]);

  console.log("AppContent: Renderizando", { currentUser, telaAtiva });

  if (!currentUser) {
    console.log("AppContent: Usuário não logado, mostrando Login");
    return <Login />;
  }

  const renderTela = () => {
    console.log("AppContent: Renderizando tela", telaAtiva);
    
    switch (telaAtiva) {
      case "cadastro":
        return verificarAcesso("cadastro") ? <TelaCadastro /> : <div>Acesso negado</div>;
      case "triagem":
        return verificarAcesso("triagem") ? <TelaTriagem /> : <div>Acesso negado</div>;
      case "medico":
        console.log("AppContent: Tentando renderizar PainelMedico");
        const temAcesso = verificarAcesso("medico");
        console.log("AppContent: Acesso ao painel médico", temAcesso);
        return temAcesso ? <PainelMedico /> : <div>Acesso negado</div>;
      case "historico":
        return verificarAcesso("historico") ? <HistoricoMedico /> : <div>Acesso negado</div>;
      case "publico":
        return verificarAcesso("publico") ? <PainelPublico /> : <div>Acesso negado</div>;
      case "fichas":
        return verificarAcesso("fichas") ? <EmissaoFichas /> : <div>Acesso negado</div>;
      case "senhas":
        return verificarAcesso("senhas") ? <GeradorSenha /> : <div>Acesso negado</div>;
      default:
        console.log("AppContent: Tela padrão - TelaCadastro");
        return <TelaCadastro />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="pt-16">
        {renderTela()}
      </main>
    </div>
  );
};

function App() {
  return (
    <SistemaAtendimentoProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </SistemaAtendimentoProvider>
  );
}

export default App;
