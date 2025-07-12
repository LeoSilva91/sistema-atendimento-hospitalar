import React, { useState, useMemo } from 'react';
import { useSistemaAtendimento } from '../context/HospitalContext';
import EvolucaoMedica from '../components/EvolucaoMedica';

const HistoricoMedico = () => {
  const { pacientes, currentUser } = useSistemaAtendimento();
  const [busca, setBusca] = useState('');
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null);
  const [filtroStatus, setFiltroStatus] = useState('todos');

  // Filtrar pacientes baseado na busca e status
  const pacientesFiltrados = useMemo(() => {
    let filtrados = pacientes;

    // Filtrar por status
    if (filtroStatus !== 'todos') {
      filtrados = filtrados.filter(p => p.status === filtroStatus);
    }

    // Filtrar por busca
    if (busca.trim()) {
      const termoBusca = busca.toLowerCase();
      filtrados = filtrados.filter(p => 
        p.nome.toLowerCase().includes(termoBusca) ||
        p.cpf.includes(termoBusca) ||
        p.id.toString().includes(termoBusca)
      );
    }

    // Ordenar por data de cadastro (mais recentes primeiro)
    return filtrados.sort((a, b) => new Date(b.horaCadastro) - new Date(a.horaCadastro));
  }, [pacientes, busca, filtroStatus]);

  const obterCorDisplay = (cor) => {
    const cores = {
      'vermelho': { bg: 'bg-red-500', text: 'text-white', nome: 'EMERGÊNCIA', icon: '🚨' },
      'amarelo': { bg: 'bg-yellow-500', text: 'text-black', nome: 'URGENTE', icon: '⚠️' },
      'verde': { bg: 'bg-green-500', text: 'text-white', nome: 'POUCO URGENTE', icon: '✅' },
      'azul': { bg: 'bg-blue-500', text: 'text-white', nome: 'NÃO URGENTE', icon: 'ℹ️' }
    };
    return cores[cor] || cores['verde'];
  };

  const formatarData = (dataString) => {
    if (!dataString) return '';
    return new Date(dataString).toLocaleDateString('pt-BR');
  };

  const formatarTempo = (dataInicio) => {
    if (!dataInicio) return '';
    const agora = new Date();
    const inicio = new Date(dataInicio);
    const diffMs = agora - inicio;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays}d atrás`;
    } else if (diffHours > 0) {
      return `${diffHours}h atrás`;
    } else {
      return `${diffMins}min atrás`;
    }
  };

  const obterStatusDisplay = (status) => {
    const statusInfo = {
      'aguardando_triagem': { nome: 'Aguardando Triagem', icon: '🚨', cor: 'orange' },
      'aguardando': { nome: 'Aguardando', icon: '⏳', cor: 'yellow' },
      'em_atendimento': { nome: 'Em Atendimento', icon: '🩺', cor: 'blue' },
      'atendido': { nome: 'Atendido', icon: '✅', cor: 'green' }
    };
    return statusInfo[status] || statusInfo['aguardando_triagem'];
  };

  const handleSelecionarPaciente = (paciente) => {
    setPacienteSelecionado(paciente);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="bg-purple-600 text-white p-6 rounded-t-lg">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">📋 Histórico Médico</h1>
              <p className="text-purple-100 mt-1">
                Dr(a). {currentUser?.nome}
              </p>
              <p className="text-purple-200 text-sm mt-1">
                Visualização completa do histórico de pacientes
              </p>
            </div>
            <div className="text-right">
              <div className="bg-purple-500 rounded-lg p-3">
                <p className="text-sm text-purple-100">Total de Pacientes</p>
                <p className="text-2xl font-bold">{pacientes.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lista de Pacientes */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                👥 Lista de Pacientes
              </h2>

              {/* Filtros */}
              <div className="space-y-3 mb-4">
                <div>
                  <input
                    type="text"
                    placeholder="Buscar por nome, CPF ou ID..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
                
                <div>
                  <select
                    value={filtroStatus}
                    onChange={(e) => setFiltroStatus(e.target.value)}
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="todos">Todos os Status</option>
                    <option value="aguardando_triagem">Aguardando Triagem</option>
                    <option value="aguardando">Aguardando</option>
                    <option value="em_atendimento">Em Atendimento</option>
                    <option value="atendido">Atendidos</option>
                  </select>
                </div>
              </div>

              {/* Lista de Pacientes */}
              {pacientesFiltrados.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-lg">Nenhum paciente encontrado</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {pacientesFiltrados.map((paciente) => {
                    const corInfo = obterCorDisplay(paciente.corTriagem);
                    const statusInfo = obterStatusDisplay(paciente.status);
                    const isSelected = pacienteSelecionado?.id === paciente.id;
                    
                    return (
                      <div
                        key={paciente.id}
                        onClick={() => handleSelecionarPaciente(paciente)}
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                          isSelected 
                            ? 'border-purple-400 bg-purple-50' 
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-bold text-gray-600">#{paciente.id}</span>
                              <span className="font-semibold text-gray-800">{paciente.nome}</span>
                              {isSelected && (
                                <span className="bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                                  SELECIONADO
                                </span>
                              )}
                            </div>
                            
                            <div className="text-sm text-gray-600 mb-2">
                              <span>📅 {formatarData(paciente.horaCadastro)}</span>
                              <span className="mx-2">•</span>
                              <span>🕐 {formatarTempo(paciente.horaCadastro)}</span>
                            </div>
                            
                            <p className="text-gray-700 text-sm bg-gray-50 p-2 rounded mb-2">
                              {paciente.motivoVisita}
                            </p>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className={`${corInfo.bg} ${corInfo.text} px-2 py-1 rounded text-xs font-bold`}>
                            {corInfo.icon} {corInfo.nome}
                          </div>
                          
                          <div className={`px-2 py-1 rounded text-xs font-bold ${
                            statusInfo.cor === 'green' ? 'bg-green-100 text-green-800' :
                            statusInfo.cor === 'blue' ? 'bg-blue-100 text-blue-800' :
                            statusInfo.cor === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {statusInfo.icon} {statusInfo.nome}
                          </div>
                        </div>

                        {/* Indicadores de evolução */}
                        <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500">
                          {paciente.observacoesTriagem && (
                            <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded">
                              🚨 Triagem
                            </span>
                          )}
                          {paciente.observacoesAtendimento && (
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                              👨‍⚕️ Atendimento
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Histórico Detalhado */}
            <div className="lg:col-span-2">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">📋 Histórico Detalhado</h2>
              
              {pacienteSelecionado ? (
                <EvolucaoMedica paciente={pacienteSelecionado} />
              ) : (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-lg">Selecione um paciente para visualizar o histórico</p>
                  <p className="text-gray-400 text-sm mt-2">Clique em um paciente da lista ao lado</p>
                </div>
              )}
            </div>
          </div>

          {/* Estatísticas */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Estatísticas</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                <div className="text-orange-600 text-2xl mb-2">🚨</div>
                <p className="text-2xl font-bold text-gray-800">
                  {pacientes.filter(p => p.status === 'aguardando_triagem').length}
                </p>
                <p className="text-gray-600 text-sm">Aguardando Triagem</p>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                <div className="text-yellow-600 text-2xl mb-2">⏳</div>
                <p className="text-2xl font-bold text-gray-800">
                  {pacientes.filter(p => p.status === 'aguardando').length}
                </p>
                <p className="text-gray-600 text-sm">Aguardando</p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <div className="text-blue-600 text-2xl mb-2">🩺</div>
                <p className="text-2xl font-bold text-gray-800">
                  {pacientes.filter(p => p.status === 'em_atendimento').length}
                </p>
                <p className="text-gray-600 text-sm">Em Atendimento</p>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <div className="text-green-600 text-2xl mb-2">✅</div>
                <p className="text-2xl font-bold text-gray-800">
                  {pacientes.filter(p => p.status === 'atendido').length}
                </p>
                <p className="text-gray-600 text-sm">Atendidos</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoricoMedico; 