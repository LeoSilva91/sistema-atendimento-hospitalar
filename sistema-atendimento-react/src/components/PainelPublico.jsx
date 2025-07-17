import { useState, useEffect } from 'react';
import { useSistemaAtendimento } from '../utils/HospitalContext';

const PainelPublico = () => {
  const { pacientes } = useSistemaAtendimento();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Atualizar relógio a cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Filtrar e ordenar pacientes por status
  const pacientesAguardando = pacientes
    .filter(p => p.status === 'aguardando')
    .sort((a, b) => {
      const prioridades = { 'vermelho': 3, 'amarelo': 2, 'verde': 1 };
      return prioridades[b.corTriagem] - prioridades[a.corTriagem] || 
             new Date(a.horaCadastro) - new Date(b.horaCadastro);
    });

  const pacienteEmAtendimento = pacientes.find(p => p.status === 'em-atendimento');

  const pacientesAtendidos = pacientes
    .filter(p => p.status === 'finalizado')
    .sort((a, b) => new Date(b.horaFim) - new Date(a.horaFim))
    .slice(0, 5); // Mostrar apenas os últimos 5

  const obterCorDisplay = (cor) => {
    const cores = {
      'vermelho': { bg: 'bg-red-500', text: 'text-white', nome: 'EMERGÊNCIA', icon: '🚨' },
      'amarelo': { bg: 'bg-yellow-500', text: 'text-black', nome: 'URGENTE', icon: '⚠️' },
      'verde': { bg: 'bg-green-500', text: 'text-white', nome: 'POUCO URGENTE', icon: '✅' }
    };
    return cores[cor] || cores['verde'];
  };

  const formatarTempo = (dataInicio) => {
    const agora = new Date();
    const inicio = new Date(dataInicio);
    const diffMs = agora - inicio;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMins % 60}min`;
    }
    return `${diffMins}min`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 p-2 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg mb-4 sm:mb-6">
          <div className="bg-blue-600 text-white p-3 sm:p-4 md:p-6 rounded-t-lg">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
              <div className="text-center lg:text-left">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">🏥 Sistema de Atendimento Hospitalar</h1>
                <p className="text-blue-100 mt-1 sm:mt-2 text-sm sm:text-base md:text-lg">Painel de Acompanhamento Público</p>
              </div>
              <div className="text-center lg:text-right">
                <div className="bg-blue-500 rounded-lg p-2 sm:p-3 md:p-4 inline-block">
                  <p className="text-blue-100 text-xs sm:text-sm">Horário Atual</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold">
                    {currentTime.toLocaleTimeString('pt-BR')}
                  </p>
                  <p className="text-blue-100 text-xs sm:text-sm">
                    {currentTime.toLocaleDateString('pt-BR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="p-3 sm:p-4 md:p-6">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-3 md:p-4 text-center">
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-600">{pacientesAguardando.length}</div>
                <div className="text-blue-800 font-medium text-xs sm:text-sm md:text-base">Aguardando</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-2 sm:p-3 md:p-4 text-center">
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-green-600">{pacienteEmAtendimento ? 1 : 0}</div>
                <div className="text-green-800 font-medium text-xs sm:text-sm md:text-base">Em Atendimento</div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 sm:p-3 md:p-4 text-center">
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-600">{pacientesAtendidos.length}</div>
                <div className="text-gray-800 font-medium text-xs sm:text-sm md:text-base">Atendidos Hoje</div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-2 sm:p-3 md:p-4 text-center">
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-purple-600">{pacientes.length}</div>
                <div className="text-purple-800 font-medium text-xs sm:text-sm md:text-base">Total Hoje</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Paciente em Atendimento */}
          <div className="bg-white rounded-lg shadow-lg order-1 lg:order-1">
            <div className="bg-green-600 text-white p-3 sm:p-4 rounded-t-lg">
              <h2 className="text-lg sm:text-xl font-bold">👨‍⚕️ Em Atendimento</h2>
            </div>
            <div className="p-3 sm:p-4 md:p-6">
              {pacienteEmAtendimento ? (
                <div className="text-center">
                  <div className="bg-green-100 border-2 border-green-300 rounded-lg p-3 sm:p-4 md:p-6 mb-3 sm:mb-4">
                    <div className="text-2xl sm:text-3xl md:text-4xl mb-2 sm:mb-3">👤</div>
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-1 sm:mb-2">
                      {pacienteEmAtendimento.nome}
                    </h3>
                    <div className="flex justify-center mb-2 sm:mb-3">
                      <span className={`${obterCorDisplay(pacienteEmAtendimento.corTriagem).bg} ${obterCorDisplay(pacienteEmAtendimento.corTriagem).text} px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold`}>
                        {obterCorDisplay(pacienteEmAtendimento.corTriagem).icon} {obterCorDisplay(pacienteEmAtendimento.corTriagem).nome}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm sm:text-base md:text-lg">
                      ID: #{pacienteEmAtendimento.id}
                    </p>
                    <p className="text-green-600 font-semibold mt-1 sm:mt-2 text-sm sm:text-base">
                      Tempo: {formatarTempo(pacienteEmAtendimento.horaInicioAtendimento)}
                    </p>
                  </div>
                  <div className="flex items-center justify-center text-green-600">
                    <svg className="animate-pulse w-4 h-4 sm:w-5 h-5 md:w-6 h-6 mr-1 sm:mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <circle cx="10" cy="10" r="3" />
                    </svg>
                    <span className="font-medium text-xs sm:text-sm md:text-base">Atendimento em Andamento</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <div className="text-gray-400 mb-3 sm:mb-4">
                    <svg className="w-12 h-12 sm:w-16 h-16 md:w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-sm sm:text-base md:text-lg">Nenhum paciente em atendimento</p>
                </div>
              )}
            </div>
          </div>

          {/* Fila de Espera */}
          <div className="bg-white rounded-lg shadow-lg order-2 lg:order-2">
            <div className="bg-blue-600 text-white p-3 sm:p-4 rounded-t-lg">
              <h2 className="text-lg sm:text-xl font-bold">📋 Fila de Espera</h2>
            </div>
            <div className="p-3 sm:p-4 md:p-6">
              {pacientesAguardando.length > 0 ? (
                <div className="space-y-2 sm:space-y-3 max-h-64 sm:max-h-80 md:max-h-96 overflow-y-auto">
                  {pacientesAguardando.slice(0, 8).map((paciente, index) => {
                    const corInfo = obterCorDisplay(paciente.corTriagem);
                    const tempoEspera = formatarTempo(paciente.horaCadastro);
                    
                    return (
                      <div
                        key={paciente.id}
                        className={`p-2 sm:p-3 rounded-lg border-2 transition-all ${
                          index === 0 
                            ? 'border-blue-300 bg-blue-50 ring-2 ring-blue-200' 
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-1 sm:space-x-2 mb-1">
                              <span className="font-bold text-gray-600 text-xs sm:text-sm">#{index + 1}</span>
                              <span className="font-semibold text-gray-800 text-xs sm:text-sm md:text-base truncate">{paciente.nome}</span>
                              {index === 0 && (
                                <span className="bg-blue-600 text-white px-1 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium flex-shrink-0">
                                  PRÓXIMO
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500">
                              Aguardando há {tempoEspera}
                            </p>
                          </div>
                          <div className={`${corInfo.bg} ${corInfo.text} px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs font-bold flex-shrink-0`}>
                            {corInfo.icon}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {pacientesAguardando.length > 8 && (
                    <div className="text-center py-2 sm:py-3 text-gray-500 text-xs sm:text-sm">
                      + {pacientesAguardando.length - 8} paciente(s) na fila
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <div className="text-gray-400 mb-3 sm:mb-4">
                    <svg className="w-12 h-12 sm:w-16 h-16 md:w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-sm sm:text-base md:text-lg">Fila vazia</p>
                </div>
              )}
            </div>
          </div>

          {/* Pacientes Atendidos */}
          <div className="bg-white rounded-lg shadow-lg order-3 lg:order-3">
            <div className="bg-gray-600 text-white p-3 sm:p-4 rounded-t-lg">
              <h2 className="text-lg sm:text-xl font-bold">✅ Atendidos Recentemente</h2>
            </div>
            <div className="p-3 sm:p-4 md:p-6">
              {pacientesAtendidos.length > 0 ? (
                <div className="space-y-2 sm:space-y-3 max-h-64 sm:max-h-80 md:max-h-96 overflow-y-auto">
                  {pacientesAtendidos.map((paciente, index) => (
                    <div
                      key={paciente.id}
                      className="p-2 sm:p-3 rounded-lg border border-gray-200 bg-gray-50"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-1 sm:space-x-2 mb-1">
                            <span className="font-bold text-gray-600 text-xs sm:text-sm">#{index + 1}</span>
                            <span className="font-semibold text-gray-800 text-xs sm:text-sm md:text-base truncate">{paciente.nome}</span>
                          </div>
                          <p className="text-xs text-gray-500">
                            Finalizado às {new Date(paciente.horaFim).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <div className={`${obterCorDisplay(paciente.corTriagem).bg} ${obterCorDisplay(paciente.corTriagem).text} px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs font-bold flex-shrink-0`}>
                          {obterCorDisplay(paciente.corTriagem).icon}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <div className="text-gray-400 mb-3 sm:mb-4">
                    <svg className="w-12 h-12 sm:w-16 h-16 md:w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-sm sm:text-base md:text-lg">Nenhum paciente atendido ainda</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Informações do Sistema */}
        <div className="mt-4 sm:mt-6 bg-white rounded-lg shadow-lg p-3 sm:p-4 md:p-6">
          <div className="text-center">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
              🚨 Sistema de Triagem Automática
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm">
              <div className="flex items-center justify-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-red-50 rounded-lg">
                <div className="w-4 h-4 sm:w-5 h-5 md:w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                  🚨
                </div>
                <div>
                  <div className="font-bold text-red-800 text-xs sm:text-sm">EMERGÊNCIA</div>
                  <div className="text-red-600 text-xs">Atendimento imediato</div>
                </div>
              </div>
              <div className="flex items-center justify-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-yellow-50 rounded-lg">
                <div className="w-4 h-4 sm:w-5 h-5 md:w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-black font-bold text-xs">
                  ⚠️
                </div>
                <div>
                  <div className="font-bold text-yellow-800 text-xs sm:text-sm">URGENTE</div>
                  <div className="text-yellow-600 text-xs">Prioridade alta</div>
                </div>
              </div>
              <div className="flex items-center justify-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-green-50 rounded-lg sm:col-span-2 md:col-span-1">
                <div className="w-4 h-4 sm:w-5 h-5 md:w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                  ✅
                </div>
                <div>
                  <div className="font-bold text-green-800 text-xs sm:text-sm">POUCO URGENTE</div>
                  <div className="text-green-600 text-xs">Atendimento normal</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PainelPublico;