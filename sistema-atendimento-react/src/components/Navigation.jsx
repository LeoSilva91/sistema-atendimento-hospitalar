import React from "react";
import { useSistemaAtendimento } from "../context/HospitalContext";

const Navigation = () => {
  const { currentUser, telaAtiva, trocarTela, logout, verificarAcesso } = useSistemaAtendimento();

  const obterIconeTela = (tela) => {
    const icones = {
      cadastro: "📝",
      triagem: "🚨",
      medico: "👨‍⚕️",
      historico: "📋",
      publico: "🏥",
      fichas: "🎫"
    };
    return icones[tela] || "📄";
  };

  const obterNomeTela = (tela) => {
    const nomes = {
      cadastro: "Cadastro",
      triagem: "Triagem",
      medico: "Painel Médico",
      historico: "Histórico Médico",
      publico: "Painel Público",
      fichas: "Emissão de Fichas"
    };
    return nomes[tela] || tela;
  };

  const obterTelasDisponiveis = () => {
    if (!currentUser) return [];
    
    const telas = ["cadastro", "triagem", "medico", "historico", "publico", "fichas"];
    return telas.filter(tela => verificarAcesso(tela));
  };

  const telasDisponiveis = obterTelasDisponiveis();

  if (!currentUser) return null;

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo e Nome do Sistema */}
          <div className="flex items-center space-x-4">
            <div className="text-2xl">🏥</div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">Sistema Hospitalar</h1>
              <p className="text-xs text-gray-500">
                {currentUser.tipo === "recepcionista" && "Recepção"}
                {currentUser.tipo === "enfermeiro" && "Enfermagem"}
                {currentUser.tipo === "medico" && "Médico"}
                {currentUser.tipo === "admin" && "Administrador"}
              </p>
            </div>
          </div>

          {/* Navegação */}
          <div className="hidden md:flex items-center space-x-1">
            {telasDisponiveis.map((tela) => (
              <button
                key={tela}
                onClick={() => trocarTela(tela)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                  telaAtiva === tela
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                }`}
              >
                <span>{obterIconeTela(tela)}</span>
                <span>{obterNomeTela(tela)}</span>
              </button>
            ))}
          </div>

          {/* Menu Mobile */}
          <div className="md:hidden">
            <div className="relative">
              <button
                onClick={() => {
                  const menu = document.getElementById("mobile-menu");
                  menu.classList.toggle("hidden");
                }}
                className="text-gray-600 hover:text-gray-800 focus:outline-none focus:text-gray-800"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              <div id="mobile-menu" className="hidden absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                {telasDisponiveis.map((tela) => (
                  <button
                    key={tela}
                    onClick={() => {
                      trocarTela(tela);
                      document.getElementById("mobile-menu").classList.add("hidden");
                    }}
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      telaAtiva === tela
                        ? "bg-blue-600 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <span className="flex items-center space-x-2">
                      <span>{obterIconeTela(tela)}</span>
                      <span>{obterNomeTela(tela)}</span>
                    </span>
                  </button>
                ))}
                <hr className="my-1" />
                <button
                  onClick={logout}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <span className="flex items-center space-x-2">
                    <span>🚪</span>
                    <span>Sair</span>
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Informações do Usuário */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-800">
                {currentUser.tipo === "medico" ? "Dr. " : ""}
                {currentUser.nome}
              </p>
              {currentUser.consultorio && (
                <p className="text-xs text-gray-500">{currentUser.consultorio}</p>
              )}
            </div>
            <button
              onClick={logout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors flex items-center space-x-2"
            >
              <span>🚪</span>
              <span>Sair</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;