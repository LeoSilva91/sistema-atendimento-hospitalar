import React, { useState, useEffect } from "react";
import { useSistemaAtendimento } from "../context/HospitalContext";

const PainelPublico = () => {
  const { 
    obterPacientesAguardandoTriagem, 
    obterPacientesAguardandoAvaliacaoMedica,
    chamadasAtivas,
    formatarNomePublico
  } = useSistemaAtendimento();
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Atualizar hora a cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Detectar mudanças de tela
  useEffect(() => {
    const handleResize = () => {
      setIsFullscreen(window.innerWidth >= 1920);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const obterCorDisplay = (cor) => {
    const cores = {
      'vermelho': { bg: 'bg-red-500', text: 'text-white', nome: 'EMERGÊNCIA', icon: '🚨' },
      'laranja': { bg: 'bg-orange-500', text: 'text-white', nome: 'MUITO URGENTE', icon: '⚠️' },
      'amarelo': { bg: 'bg-yellow-500', text: 'text-black', nome: 'URGENTE', icon: '⚠️' },
      'verde': { bg: 'bg-green-500', text: 'text-white', nome: 'POUCO URGENTE', icon: '✅' },
      'azul': { bg: 'bg-blue-500', text: 'text-white', nome: 'NÃO URGENTE', icon: 'ℹ️' }
    };
    return cores[cor] || cores['verde'];
  };

  const formatarData = (dataString) => {
    if (!dataString) return "";
    return new Date(dataString).toLocaleString("pt-BR");
  };

  const obterTempoEspera = (horaEntrada) => {
    if (!horaEntrada) return "N/A";
    const entrada = new Date(horaEntrada);
    const agora = new Date();
    const diffMs = agora - entrada;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    
    if (diffHours > 0) {
      return `${diffHours}h ${mins}min`;
    }
    return `${mins}min`;
  };

  const obterStatusFormatado = (status) => {
    const statusMap = {
      aguardando_triagem: "Aguardando Triagem",
      em_triagem: "Em Triagem",
      aguardando_avaliacao_medica: "Aguardando Médico",
      em_consulta: "Em Consulta",
      atendimento_concluido: "Atendido",
      aguardando_exame: "Aguardando Exame",
      internado: "Internado",
      encaminhado: "Encaminhado"
    };
    return statusMap[status] || status;
  };

  const obterCorStatus = (status) => {
    const cores = {
      aguardando_triagem: "bg-yellow-100 text-yellow-800",
      em_triagem: "bg-orange-100 text-orange-800",
      aguardando_avaliacao_medica: "bg-blue-100 text-blue-800",
      em_consulta: "bg-purple-100 text-purple-800",
      atendimento_concluido: "bg-green-100 text-green-800",
      aguardando_exame: "bg-indigo-100 text-indigo-800",
      internado: "bg-red-100 text-red-800",
      encaminhado: "bg-gray-100 text-gray-800"
    };
    return cores[status] || "bg-gray-100 text-gray-800";
  };

  const pacientesAguardandoTriagem = obterPacientesAguardandoTriagem;
  const pacientesAguardandoMedico = obterPacientesAguardandoAvaliacaoMedica;

  // Calcular estatísticas
  const estatisticas = {
    aguardandoTriagem: pacientesAguardandoTriagem.length,
    aguardandoMedico: pacientesAguardandoMedico.length,
    vermelho: pacientesAguardandoMedico.filter(p => p.corTriagem === 'vermelho').length,
    laranja: pacientesAguardandoMedico.filter(p => p.corTriagem === 'laranja').length,
    amarelo: pacientesAguardandoMedico.filter(p => p.corTriagem === 'amarelo').length,
    verde: pacientesAguardandoMedico.filter(p => p.corTriagem === 'verde').length,
    azul: pacientesAguardandoMedico.filter(p => p.corTriagem === 'azul').length,
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 ${isFullscreen ? 'text-2xl' : ''}`}>
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className={`font-bold text-white ${isFullscreen ? 'text-6xl' : 'text-4xl'}`}>
                🏥 SISTEMA DE ATENDIMENTO HOSPITALAR
              </h1>
              <p className={`text-blue-100 mt-1 ${isFullscreen ? 'text-2xl' : 'text-lg'}`}>
                Painel de Informações Públicas
              </p>
            </div>
            <div className="text-right">
              <div className={`text-white font-bold ${isFullscreen ? 'text-4xl' : 'text-2xl'}`}>
                {currentTime.toLocaleTimeString('pt-BR')}
              </div>
              <div className={`text-blue-100 ${isFullscreen ? 'text-lg' : 'text-sm'}`}>
                {currentTime.toLocaleDateString('pt-BR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-6 gap-4 mb-8">
          <div className="bg-yellow-500/20 backdrop-blur-sm rounded-lg border border-yellow-500/30 p-4 text-center">
            <div className={`text-yellow-400 font-bold ${isFullscreen ? 'text-3xl' : 'text-xl'}`}>
              {estatisticas.aguardandoTriagem}
            </div>
            <div className={`text-yellow-300 ${isFullscreen ? 'text-lg' : 'text-sm'}`}>
              Aguardando Triagem
            </div>
          </div>
          <div className="bg-blue-500/20 backdrop-blur-sm rounded-lg border border-blue-500/30 p-4 text-center">
            <div className={`text-blue-400 font-bold ${isFullscreen ? 'text-3xl' : 'text-xl'}`}>
              {estatisticas.aguardandoMedico}
            </div>
            <div className={`text-blue-300 ${isFullscreen ? 'text-lg' : 'text-sm'}`}>
              Aguardando Médico
            </div>
          </div>
          <div className="bg-red-500/20 backdrop-blur-sm rounded-lg border border-red-500/30 p-4 text-center">
            <div className={`text-red-400 font-bold ${isFullscreen ? 'text-3xl' : 'text-xl'}`}>
              {estatisticas.vermelho}
            </div>
            <div className={`text-red-300 ${isFullscreen ? 'text-lg' : 'text-sm'}`}>
              Emergência
            </div>
          </div>
          <div className="bg-orange-500/20 backdrop-blur-sm rounded-lg border border-orange-500/30 p-4 text-center">
            <div className={`text-orange-400 font-bold ${isFullscreen ? 'text-3xl' : 'text-xl'}`}>
              {estatisticas.laranja}
            </div>
            <div className={`text-orange-300 ${isFullscreen ? 'text-lg' : 'text-sm'}`}>
              Muito Urgente
            </div>
          </div>
          <div className="bg-yellow-500/20 backdrop-blur-sm rounded-lg border border-yellow-500/30 p-4 text-center">
            <div className={`text-yellow-400 font-bold ${isFullscreen ? 'text-3xl' : 'text-xl'}`}>
              {estatisticas.amarelo}
            </div>
            <div className={`text-yellow-300 ${isFullscreen ? 'text-lg' : 'text-sm'}`}>
              Urgente
            </div>
          </div>
          <div className="bg-green-500/20 backdrop-blur-sm rounded-lg border border-green-500/30 p-4 text-center">
            <div className={`text-green-400 font-bold ${isFullscreen ? 'text-3xl' : 'text-xl'}`}>
              {estatisticas.verde + estatisticas.azul}
            </div>
            <div className={`text-green-300 ${isFullscreen ? 'text-lg' : 'text-sm'}`}>
              Pouco/Não Urgente
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chamadas Ativas */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
              <h2 className={`font-bold text-white mb-6 flex items-center ${isFullscreen ? 'text-3xl' : 'text-2xl'}`}>
                <span className="mr-3">🔔</span>
                CHAMADAS ATIVAS
              </h2>
              
              {chamadasAtivas.length > 0 ? (
                <div className="space-y-4">
                  {chamadasAtivas.map((chamada) => (
                    <div key={chamada.id} className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white shadow-lg animate-pulse">
                      <div className="flex items-center justify-between mb-2">
                        <div className={`${isFullscreen ? 'text-4xl' : 'text-2xl'}`}>🔔</div>
                        <div className={`bg-white/20 px-2 py-1 rounded ${isFullscreen ? 'text-lg' : 'text-sm'}`}>
                          {obterTempoEspera(chamada.horaChamada)}
                        </div>
                      </div>
                      <div className="text-center">
                        <h3 className={`font-bold mb-1 ${isFullscreen ? 'text-3xl' : 'text-xl'}`}>
                          {chamada.pacienteNome}
                        </h3>
                        <p className={`text-green-100 ${isFullscreen ? 'text-2xl' : 'text-lg'}`}>
                          Dirija-se ao <strong>{chamada.local}</strong>
                        </p>
                        <p className={`text-green-200 mt-2 ${isFullscreen ? 'text-lg' : 'text-sm'}`}>
                          Prontuário: {chamada.numeroProntuario}
                        </p>
                        <p className={`text-green-200 ${isFullscreen ? 'text-lg' : 'text-sm'}`}>
                          Chamada realizada às {formatarData(chamada.horaChamada)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className={`text-white/50 mb-4 ${isFullscreen ? 'text-8xl' : 'text-6xl'}`}>🔕</div>
                  <p className={`text-white/70 ${isFullscreen ? 'text-2xl' : 'text-lg'}`}>Nenhuma chamada ativa</p>
                  <p className={`text-white/50 mt-2 ${isFullscreen ? 'text-lg' : 'text-sm'}`}>Aguarde ser chamado</p>
                </div>
              )}
            </div>
          </div>

          {/* Filas de Espera */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
              <h2 className={`font-bold text-white mb-6 flex items-center ${isFullscreen ? 'text-3xl' : 'text-2xl'}`}>
                <span className="mr-3">📋</span>
                FILAS DE ESPERA
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Fila de Triagem */}
                <div>
                  <h3 className={`font-semibold text-white mb-4 ${isFullscreen ? 'text-2xl' : 'text-lg'}`}>
                    Aguardando Triagem ({pacientesAguardandoTriagem.length})
                  </h3>
                  
                  {pacientesAguardandoTriagem.length > 0 ? (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {pacientesAguardandoTriagem.map((paciente, index) => (
                        <div
                          key={paciente.id}
                          className="bg-white/20 backdrop-blur-sm rounded-lg p-3 border border-white/30"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="bg-yellow-500 text-white font-bold px-2 py-1 rounded-full text-sm">
                                #{index + 1}
                              </div>
                              <div>
                                <h4 className={`text-white font-medium ${isFullscreen ? 'text-lg' : 'text-sm'}`}>
                                  {formatarNomePublico(paciente.nome)}
                                </h4>
                                <p className={`text-white/70 ${isFullscreen ? 'text-base' : 'text-xs'}`}>
                                  Prontuário: {paciente.numeroProntuario}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`text-white/80 ${isFullscreen ? 'text-base' : 'text-xs'}`}>
                                {obterTempoEspera(paciente.horaCadastro)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-white/50">Nenhum paciente aguardando triagem</p>
                    </div>
                  )}
                </div>

                {/* Fila de Avaliação Médica */}
                <div>
                  <h3 className={`font-semibold text-white mb-4 ${isFullscreen ? 'text-2xl' : 'text-lg'}`}>
                    Aguardando Médico ({pacientesAguardandoMedico.length})
                  </h3>
                  
                  {pacientesAguardandoMedico.length > 0 ? (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {pacientesAguardandoMedico.map((paciente, index) => {
                        const corInfo = obterCorDisplay(paciente.corTriagem);
                        return (
                          <div
                            key={paciente.id}
                            className="bg-white/20 backdrop-blur-sm rounded-lg p-3 border border-white/30"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div className={`${corInfo.bg} text-white font-bold px-2 py-1 rounded-full text-sm`}>
                                  #{index + 1}
                                </div>
                                <div>
                                  <h4 className={`text-white font-medium ${isFullscreen ? 'text-lg' : 'text-sm'}`}>
                                    {formatarNomePublico(paciente.nome)}
                                  </h4>
                                  <p className={`text-white/70 ${isFullscreen ? 'text-base' : 'text-xs'}`}>
                                    Prontuário: {paciente.numeroProntuario}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className={`${corInfo.bg} ${corInfo.text} px-2 py-1 rounded text-xs font-bold mb-1`}>
                                  {corInfo.icon} {corInfo.nome}
                                </div>
                                <p className={`text-white/80 ${isFullscreen ? 'text-base' : 'text-xs'}`}>
                                  {obterTempoEspera(paciente.horaFimTriagem || paciente.horaCadastro)}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-white/50">Nenhum paciente aguardando médico</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Informações Adicionais */}
        <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <h3 className={`text-white font-bold mb-2 ${isFullscreen ? 'text-2xl' : 'text-lg'}`}>⏰ Tempo Médio de Espera</h3>
              <p className={`text-blue-200 ${isFullscreen ? 'text-xl' : 'text-base'}`}>
                {pacientesAguardandoTriagem.length + pacientesAguardandoMedico.length > 0 ? '15-30 minutos' : 'Sem espera'}
              </p>
            </div>
            <div>
              <h3 className={`text-white font-bold mb-2 ${isFullscreen ? 'text-2xl' : 'text-lg'}`}>👥 Total nas Filas</h3>
              <p className={`text-blue-200 ${isFullscreen ? 'text-xl' : 'text-base'}`}>
                {pacientesAguardandoTriagem.length + pacientesAguardandoMedico.length} pacientes
              </p>
            </div>
            <div>
              <h3 className={`text-white font-bold mb-2 ${isFullscreen ? 'text-2xl' : 'text-lg'}`}>🏥 Atendimento</h3>
              <p className={`text-blue-200 ${isFullscreen ? 'text-xl' : 'text-base'}`}>
                Segunda a Sexta: 8h às 18h
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PainelPublico;
