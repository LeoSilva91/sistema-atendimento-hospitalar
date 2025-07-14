import React, { useState, useEffect } from "react";
import { useSistemaAtendimento } from "../context/HospitalContext";
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';

const PainelPublico = () => {
  const { 
    obterPacientesAguardandoTriagem, 
    obterPacientesAguardandoAvaliacaoMedica,
    chamadasAtivas,
    formatarNomePublico,
    obterEstatisticas
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
  const estatisticas = obterEstatisticas;

  return (
    <div className={`min-h-screen bg-[#f4f8fb] ${isFullscreen ? 'text-2xl' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 pt-10 pb-8">
        {/* Header */}
        <div className="bg-[#54aaff] text-white p-6 rounded-t-lg">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center max-w-6xl mx-auto gap-4">
            <div className="flex items-center gap-6 md:gap-8">
              <div className="bg-white rounded-full p-2 shadow-md flex items-center justify-center border-4 border-blue-200">
                <img src="/logo-menu.png" alt="Logo SIAH" className="h-16 w-16 object-contain" />
              </div>
              <h1 className="text-2xl md:text-4xl font-bold whitespace-nowrap flex items-center">SISTEMA DE ATENDIMENTO HOSPITALAR</h1>
            </div>
            <div className="flex items-start w-full md:w-auto justify-end">
              <div className="bg-blue-200 rounded-xl px-8 py-6 border border-blue-300 flex flex-col items-center min-w-[180px] shadow-none">
                <span className="text-2xl font-bold text-blue-900">{currentTime.toLocaleTimeString('pt-BR')}</span>
                <span className="text-base font-medium text-blue-900 mt-1">{currentTime.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chamadas Ativas e Filas de Espera */}
        <div className="w-full flex flex-col lg:flex-row justify-center items-start gap-4 my-6 max-w-6xl mx-auto">
          {/* Chamadas Ativas */}
          <div className="flex-1 flex flex-col items-center">
            <h2 className="font-bold text-3xl text-center mb-4">Chamadas Ativas</h2>
            {chamadasAtivas.length > 0 ? (
              <div className="flex flex-col items-center gap-4 w-full">
                {chamadasAtivas.map((chamada) => (
                  <div key={chamada.id} className="bg-blue-50 rounded-xl shadow p-10 w-full max-w-md flex flex-col items-center border border-blue-100 relative">
                    {/* Badge de tipo de chamada */}
                    <span className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold shadow-sm ${chamada.tipo === 'triagem' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'}`}>{chamada.tipo === 'triagem' ? 'Triagem' : 'Consulta'}</span>
                    <div className="text-gray-700 text-lg mb-4">{obterTempoEspera(chamada.horaChamada)}</div>
                    <div className="font-bold text-gray-800 mb-2 text-3xl md:text-4xl text-center">{chamada.pacienteNome}</div>
                    <div className="text-gray-700 text-xl mb-2">Dirija-se ao <span className="font-bold">{chamada.local}</span></div>
                    <div className="text-gray-400 text-base mt-4">Chamada às {formatarData(chamada.horaChamada)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full w-full py-8">
                <p className="text-gray-400 text-3xl mb-2">—</p>
                <p className="text-gray-500 text-xl mb-1">Nenhuma chamada ativa</p>
                <p className="text-gray-300 text-base">Aguarde ser chamado</p>
              </div>
            )}
          </div>
          {/* Filas de Espera */}
          <div className="flex-1">
            <Card className="bg-white !border-none !rounded-2xl shadow-md h-full flex flex-col justify-center items-center p-8">
              <div className="flex flex-col lg:flex-row w-full gap-8 justify-center items-start">
                <div className="flex-1 text-center">
                  <h3 className="font-semibold text-2xl mb-2">Aguardando Triagem ({pacientesAguardandoTriagem.length})</h3>
                  {pacientesAguardandoTriagem.length > 0 ? (
                    <div className="flex flex-col gap-2 w-full">
                      {pacientesAguardandoTriagem.map((paciente, index) => (
                        <div key={paciente.id} className="bg-white rounded-lg border border-gray-100 p-3 flex items-center w-full">
                          <span className="bg-blue-500 text-white font-bold text-xs px-3 py-1 rounded-full mr-3">#{index + 1}</span>
                          <span className="flex-1 text-gray-800 text-base font-medium truncate">{paciente.nome}</span>
                          <span className="text-gray-400 text-sm ml-2 whitespace-nowrap">{obterTempoEspera(paciente.horaCadastro)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-400 text-lg">Nenhum paciente aguardando triagem</p>
                    </div>
                  )}
                </div>
                <div className="flex-1 text-center">
                  <h3 className="font-semibold text-2xl mb-2">Aguardando Médico ({pacientesAguardandoMedico.length})</h3>
                  {pacientesAguardandoMedico.length > 0 ? (
                    <div className="flex flex-col gap-2 w-full">
                      {pacientesAguardandoMedico.map((paciente, index) => {
                        const corInfo = obterCorDisplay(paciente.corTriagem);
                        return (
                          <div key={paciente.id} className="bg-white rounded-lg border border-gray-100 p-3 flex items-center w-full">
                            <span className="bg-blue-500 text-white font-bold text-xs px-3 py-1 rounded-full mr-3">#{index + 1}</span>
                            <span className="flex-1 text-gray-800 text-base font-medium truncate">{paciente.nome}</span>
                            <span className="text-gray-400 text-sm ml-2 whitespace-nowrap">{obterTempoEspera(paciente.horaFimTriagem || paciente.horaCadastro)}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-400 text-lg">Nenhum paciente aguardando médico</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="w-full flex justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 my-6 max-w-6xl w-full">
            <Card className="!bg-blue-100 !border-none !rounded-2xl !p-6 text-center shadow-md h-[200px] w-full flex flex-col justify-center items-center transition-transform duration-200 hover:scale-105 cursor-pointer">
              <div className="text-yellow-600 font-extrabold text-3xl mb-1">{estatisticas.aguardandoTriagem}</div>
              <div className="text-gray-700 text-base font-medium">Aguardando Triagem</div>
            </Card>
            <Card className="!bg-blue-100 !border-none !rounded-2xl !p-6 text-center shadow-md h-[200px] w-full flex flex-col justify-center items-center transition-transform duration-200 hover:scale-105 cursor-pointer">
              <div className="text-blue-600 font-extrabold text-3xl mb-1">{estatisticas.aguardandoAvaliacao}</div>
              <div className="text-gray-700 text-base font-medium">Aguardando Médico</div>
            </Card>
            <Card className="!bg-blue-100 !border-none !rounded-2xl !p-6 text-center shadow-md h-[200px] w-full flex flex-col justify-center items-center transition-transform duration-200 hover:scale-105 cursor-pointer">
              <div className="text-red-500 font-extrabold text-3xl mb-1">{estatisticas.emergencia || 0}</div>
              <div className="text-gray-700 text-base font-medium">Emergência</div>
            </Card>
            <Card className="!bg-blue-100 !border-none !rounded-2xl !p-6 text-center shadow-md h-[200px] w-full flex flex-col justify-center items-center transition-transform duration-200 hover:scale-105 cursor-pointer">
              <div className="text-orange-500 font-extrabold text-3xl mb-1">{estatisticas.muitoUrgente || 0}</div>
              <div className="text-gray-700 text-base font-medium">Muito Urgente</div>
            </Card>
            <Card className="!bg-blue-100 !border-none !rounded-2xl !p-6 text-center shadow-md h-[200px] w-full flex flex-col justify-center items-center transition-transform duration-200 hover:scale-105 cursor-pointer">
              <div className="text-yellow-700 font-extrabold text-3xl mb-1">{estatisticas.urgente || 0}</div>
              <div className="text-gray-700 text-base font-medium">Urgente</div>
            </Card>
            <Card className="!bg-blue-100 !border-none !rounded-2xl !p-6 text-center shadow-md h-[200px] w-full flex flex-col justify-center items-center transition-transform duration-200 hover:scale-105 cursor-pointer">
              <div className="text-green-600 font-extrabold text-3xl mb-1">{estatisticas.poucoUrgente || 0}</div>
              <div className="text-gray-700 text-base font-medium">Pouco/Não Urgente</div>
            </Card>
          </div>
        </div>

        {/* Informações Adicionais */}
        <div className="mt-8 max-w-6xl mx-auto">
          <Card className="bg-white/60 !border-none !rounded-lg shadow-none">
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="flex flex-col items-center justify-center">
                  <h3 className="text-gray-700 font-medium mb-1 text-base">Tempo Médio de Espera</h3>
                  <p className="text-gray-500 text-sm">{pacientesAguardandoTriagem.length + pacientesAguardandoMedico.length > 0 ? '15-30 minutos' : 'Sem espera'}</p>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <h3 className="text-gray-700 font-medium mb-1 text-base">Total nas Filas</h3>
                  <p className="text-gray-500 text-sm">{pacientesAguardandoTriagem.length + pacientesAguardandoMedico.length} pacientes</p>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <h3 className="text-gray-700 font-medium mb-1 text-base">Atendimento</h3>
                  <p className="text-gray-500 text-sm">Segunda a Sexta: 8h às 18h</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PainelPublico;
