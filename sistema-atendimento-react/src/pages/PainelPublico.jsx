import React, { useState, useEffect } from "react";
import { useSistemaAtendimento } from "../context/HospitalContext";
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import api from '../services/api';

const PainelPublico = () => {
  const { 
    obterPacientesAguardandoTriagem, 
    obterPacientesAguardandoAvaliacaoMedica,
    chamadasAtivas,
    formatarNomePublico,
    obterEstatisticas,
    carregarChamadasAtivasBackend
  } = useSistemaAtendimento();
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [senhasChamadas, setSenhasChamadas] = useState([]);

  // Atualizar hora a cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Carregar senhas chamadas do backend
  useEffect(() => {
    const carregarSenhasChamadas = async () => {
      try {
        const response = await api.get('/senhas/chamadas-publico');
        
        if (response.data.success) {
          setSenhasChamadas(response.data.data);
        }
      } catch (error) {
        console.error('Erro ao carregar senhas chamadas:', error);
      }
    };

    carregarSenhasChamadas();
    const interval = setInterval(carregarSenhasChamadas, 3000); // Atualizar a cada 3 segundos
    return () => clearInterval(interval);
  }, []);

  // Carregar chamadas ativas do backend
  useEffect(() => {
    carregarChamadasAtivasBackend();
    const interval = setInterval(carregarChamadasAtivasBackend, 5000); // Atualizar a cada 5 segundos
    return () => clearInterval(interval);
  }, [carregarChamadasAtivasBackend]);

  // Detectar mudanças de tela
  useEffect(() => {
    const handleResize = () => {
      setIsFullscreen(window.innerWidth >= 1920);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const obterCorTipo = (tipo) => {
    return tipo === 'PRIORIDADE' 
      ? { bg: 'bg-red-500', text: 'text-white', nome: 'PRIORIDADE' }
      : { bg: 'bg-green-500', text: 'text-white', nome: 'NORMAL' };
  };

  const formatarHora = (dataString) => {
    return new Date(dataString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const obterCorDisplay = (cor) => {
    const cores = {
      'VERMELHO': { bg: 'bg-red-500', text: 'text-white', nome: 'EMERGÊNCIA' },
      'LARANJA': { bg: 'bg-orange-500', text: 'text-white', nome: 'MUITO URGENTE' },
      'AMARELO': { bg: 'bg-yellow-500', text: 'text-black', nome: 'URGENTE' },
      'VERDE': { bg: 'bg-green-500', text: 'text-white', nome: 'POUCO URGENTE' },
      'AZUL': { bg: 'bg-blue-500', text: 'text-white', nome: 'NÃO URGENTE' },
      // Fallback para valores em minúsculo (caso venham do frontend)
      'vermelho': { bg: 'bg-red-500', text: 'text-white', nome: 'EMERGÊNCIA' },
      'laranja': { bg: 'bg-orange-500', text: 'text-white', nome: 'MUITO URGENTE' },
      'amarelo': { bg: 'bg-yellow-500', text: 'text-black', nome: 'URGENTE' },
      'verde': { bg: 'bg-green-500', text: 'text-white', nome: 'POUCO URGENTE' },
      'azul': { bg: 'bg-blue-500', text: 'text-white', nome: 'NÃO URGENTE' }
    };
    return cores[cor] || cores['VERDE'];
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
  const estatisticas = obterEstatisticas;

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 pt-2">
      <div className="max-w-7xl mx-auto">
        {/* Header minimalista */}
        <div className="mb-4 sm:mb-6">
          <div className="mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Painel Público</h1>
          </div>
          <div className="flex items-center text-gray-500 text-xs sm:text-sm">
            {currentTime.toLocaleTimeString('pt-BR')} • {currentTime.toLocaleDateString('pt-BR')}
          </div>
        </div>

        {/* Senhas Chamadas na Recepção */}
        {senhasChamadas.length > 0 && (
          <Card className="shadow-none mb-4 sm:mb-6 bg-transparent border-none">
            <div className="p-4 sm:p-8">
              <div className="flex justify-center mb-4 sm:mb-8">
                <span className="text-lg sm:text-xl font-semibold text-gray-800 capitalize w-full text-left block">
                  Recepção -&gt; Guichê 01
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {senhasChamadas.map((senha, index) => {
                  const corInfo = obterCorTipo(senha.tipo);
                  const isUltima = index === 0;
                  return (
                    <div
                      key={senha.id}
                      className={`rounded-2xl text-center transition-all duration-300 transform flex flex-col items-center justify-center h-full min-h-[140px] sm:min-h-[180px] ${
                        isUltima
                          ? 'bg-white shadow-2xl scale-105 border-none animate-pulse-slow relative'
                          : 'bg-gray-50 opacity-60 scale-95'
                      }`}
                      style={{ minHeight: isUltima ? (window.innerWidth < 640 ? 160 : 200) : (window.innerWidth < 640 ? 120 : 160) }}
                    >
                      <div className={`w-full flex flex-col items-center justify-center`}>
                        <div
                          className={`rounded-full flex items-center justify-center font-bold ${isUltima ? 'text-2xl sm:text-4xl' : 'text-xl sm:text-2xl'} ${corInfo.bg} ${corInfo.text}`}
                          style={{ 
                            width: isUltima ? (window.innerWidth < 640 ? 80 : 110) : (window.innerWidth < 640 ? 60 : 80), 
                            height: isUltima ? (window.innerWidth < 640 ? 80 : 110) : (window.innerWidth < 640 ? 60 : 80) 
                          }}
                        >
                          {senha.prefixo}{senha.numero.toString().padStart(3, '0')}
                        </div>
                        <div className={`font-semibold mt-2 sm:mt-3 ${isUltima ? 'text-sm sm:text-base' : 'text-xs'} ${corInfo.text}`}>{corInfo.nome}</div>
                        {!isUltima && (
                          <div className={`mt-1 text-xs text-gray-500 font-medium`}>{formatarHora(senha.horaChamada)}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        )}

        {/* Chamadas Ativas e Filas de Espera */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          {/* Chamadas Ativas */}
          <Card className="shadow-md h-fit bg-white">
            <div className="p-4 sm:p-8 flex flex-col h-full justify-center items-center">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-8 w-full text-left">Chamadas Ativas</h2>
              {chamadasAtivas.length > 0 ? (
                <div className="space-y-3 w-full">
                  {chamadasAtivas.map((chamada) => (
                    <div key={chamada.id} className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <Tag
                          value={chamada.tipo === 'triagem' ? 'Triagem' : 'Consulta'}
                          className={`text-xs px-2 py-1 ${
                            chamada.tipo === 'triagem' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-green-100 text-green-800'
                          }`}
                        />
                        <span className="text-xs sm:text-sm text-gray-500">{obterTempoEspera(chamada.horaChamada)}</span>
                      </div>
                      <div className="font-semibold text-gray-800 text-base sm:text-lg mb-1">{chamada.pacienteNome}</div>
                      <div className="text-gray-600 text-xs sm:text-sm">
                        Dirija-se ao <span className="font-semibold">{chamada.local}</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-2">
                        Chamada às {formatarData(chamada.horaChamada)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center flex-1 min-h-[120px]">
                  <p className="text-lg sm:text-xl font-semibold text-gray-400 mb-1">Nenhuma chamada ativa</p>
                  <p className="text-sm sm:text-base text-gray-400">Aguarde ser chamado</p>
                </div>
              )}
            </div>
          </Card>

          {/* Filas de Espera */}
          <Card className="shadow-md bg-white">
            <div className="p-4 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-8 w-full text-left">Filas de Espera</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-3 sm:mb-4">Aguardando Triagem <span className="font-normal">({pacientesAguardandoTriagem.length})</span></h3>
                  {pacientesAguardandoTriagem.length > 0 ? (
                    <div className="space-y-2">
                      {pacientesAguardandoTriagem.map((paciente, index) => (
                        <div key={paciente.id} className="bg-gray-50 rounded-lg p-2 sm:p-3 border border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs px-2.5 py-1 rounded-lg font-semibold shadow-sm">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                              </svg>
                              <span className="font-mono">#{index + 1}</span>
                            </div>
                            <span className="text-gray-400 text-xs">
                              {obterTempoEspera(paciente.horaCadastro)}
                            </span>
                          </div>
                          <div className="text-gray-800 font-medium text-xs sm:text-sm mt-1 truncate">
                            {paciente.nome}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center min-h-[80px]">
                      <span className="text-sm sm:text-base text-gray-400">Nenhum paciente aguardando triagem</span>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-3 sm:mb-4">Aguardando Médico <span className="font-normal">({pacientesAguardandoMedico.length})</span></h3>
                  {pacientesAguardandoMedico.length > 0 ? (
                    <div className="space-y-2">
                      {pacientesAguardandoMedico.map((paciente, index) => {
                        const corInfo = obterCorDisplay(paciente.corTriagem);
                        return (
                          <div key={paciente.id} className="bg-gray-50 rounded-lg p-2 sm:p-3 border border-gray-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs px-2.5 py-1 rounded-lg font-semibold shadow-sm">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                                <span className="font-mono">#{index + 1}</span>
                              </div>
                              <span className="text-gray-400 text-xs">
                                {obterTempoEspera(paciente.horaFimTriagem || paciente.horaCadastro)}
                              </span>
                            </div>
                            <div className="text-gray-800 font-medium text-xs sm:text-sm mt-1 truncate">
                              {paciente.nome}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center min-h-[80px]">
                      <span className="text-sm sm:text-base text-gray-400">Nenhum paciente aguardando médico</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Estatísticas Rápidas */}
        <Card className="shadow-md mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">Estatísticas</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            <div className="bg-green-50 rounded-lg p-3 sm:p-4 text-center border border-green-200">
              <div className="text-xl sm:text-2xl font-bold text-green-600 mb-1">{estatisticas.aguardandoTriagem}</div>
              <div className="text-gray-700 text-xs sm:text-sm font-medium">Aguardando Triagem</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3 sm:p-4 text-center border border-green-200">
              <div className="text-xl sm:text-2xl font-bold text-green-600 mb-1">{estatisticas.aguardandoAvaliacao}</div>
              <div className="text-gray-700 text-xs sm:text-sm font-medium">Aguardando Médico</div>
            </div>
            <div className="bg-red-50 rounded-lg p-3 sm:p-4 text-center border border-red-200">
              <div className="text-xl sm:text-2xl font-bold text-red-600 mb-1">{estatisticas.emergencia || 0}</div>
              <div className="text-gray-700 text-xs sm:text-sm font-medium">Emergência</div>
            </div>
            <div className="bg-red-50 rounded-lg p-3 sm:p-4 text-center border border-red-200">
              <div className="text-xl sm:text-2xl font-bold text-red-600 mb-1">{estatisticas.muitoUrgente || 0}</div>
              <div className="text-gray-700 text-xs sm:text-sm font-medium">Muito Urgente</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3 sm:p-4 text-center border border-yellow-200">
              <div className="text-xl sm:text-2xl font-bold text-yellow-600 mb-1">{estatisticas.urgente || 0}</div>
              <div className="text-gray-700 text-xs sm:text-sm font-medium">Urgente</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3 sm:p-4 text-center border border-green-200">
              <div className="text-xl sm:text-2xl font-bold text-green-600 mb-1">{estatisticas.poucoUrgente || 0}</div>
              <div className="text-gray-700 text-xs sm:text-sm font-medium">Pouco/Não Urgente</div>
            </div>
          </div>
        </Card>

        {/* Informações Adicionais */}
        <Card className="shadow-md bg-gray-50 border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">Informações</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
            <div className="text-center">
              <div className="text-gray-700 font-medium mb-1">Tempo Médio de Espera</div>
              <div className="text-gray-500">
                {pacientesAguardandoTriagem.length + pacientesAguardandoMedico.length > 0 ? '15-30 minutos' : 'Sem espera'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-gray-700 font-medium mb-1">Total nas Filas</div>
              <div className="text-gray-500">{pacientesAguardandoTriagem.length + pacientesAguardandoMedico.length} pacientes</div>
            </div>
            <div className="text-center">
              <div className="text-gray-700 font-medium mb-1">Atendimento</div>
              <div className="text-gray-500">Segunda a Sexta: 8h às 18h</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PainelPublico;
