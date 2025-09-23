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
import VLibras from "@djpfs/react-vlibras";

const AppContent = () => {
  const { currentUser, telaAtiva, verificarAcesso, trocarTela } = useSistemaAtendimento();

  React.useEffect(() => {
    console.log('🔄 useEffect AppContent:', { currentUser, telaAtiva });
    if (currentUser && !verificarAcesso(telaAtiva)) {
      console.log('⚠️ Usuário logado mas sem acesso à tela atual, redirecionando...');
      // Definir telas permitidas por tipo de usuário
      const acessos = {
        recepcionista: ["cadastro", "publico", "fichas", "senhas"],
        enfermeiro: ["triagem", "publico", "fichas"],
        medico: ["medico", "historico", "publico", "fichas"],
        admin: ["cadastro", "triagem", "medico", "historico", "publico", "fichas", "senhas"],
      };
      const permitidas = acessos[currentUser.tipo] || [];
      console.log('📋 Telas permitidas para', currentUser.tipo, ':', permitidas);
      if (permitidas.length > 0) {
        console.log('🔄 Redirecionando para:', permitidas[0]);
        trocarTela(permitidas[0]);
      } else {
        console.log('❌ Nenhuma tela permitida encontrada!');
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
    console.log("AppContent: CurrentUser", currentUser);
    
    switch (telaAtiva) {
      case "cadastro":
        const temAcessoCadastro = verificarAcesso("cadastro");
        console.log("AppContent: Acesso cadastro", temAcessoCadastro);
        return temAcessoCadastro ? <TelaCadastro /> : <div>Acesso negado</div>;
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
