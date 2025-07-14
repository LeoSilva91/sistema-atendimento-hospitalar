import React, { useState, useMemo } from 'react';
import { useSistemaAtendimento } from '../context/HospitalContext';
import EvolucaoMedica from '../components/EvolucaoMedica';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';

const HistoricoMedico = () => {
  const { pacientes, currentUser, obterEstatisticas } = useSistemaAtendimento();
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

  const estatisticas = obterEstatisticas;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="bg-[#54aaff] text-white p-6 rounded-t-lg">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Histórico Médico</h1>
              <div className="flex items-center gap-2 text-blue-100 mt-1">
                <span className="pi pi-user text-base" />
                <span>{currentUser?.nome} - {currentUser?.tipo === 'admin' ? 'Administrador' : currentUser?.tipo === 'recepcionista' ? 'Recepcionista' : currentUser?.tipo === 'medico' ? 'Médico' : currentUser?.tipo}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-blue-200 rounded-lg p-4 border border-blue-300 flex flex-col items-center justify-start mt-2">
                <p className="text-xs font-normal text-blue-900 mb-1">Total de Pacientes</p>
                <p className="text-xl font-semibold text-blue-900">{pacientes.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch min-h-[400px] mb-8">
            {/* Lista de Pacientes */}
            <div className="flex flex-col h-full">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Lista de Pacientes
              </h2>

              {/* Filtros */}
              <div className="flex flex-col md:flex-row gap-2 mb-4 items-center min-w-0">
                <div className="p-input-icon-left w-full md:w-2/3 min-w-0">
                  <i className="pi pi-search" />
                  <InputText
                    value={busca}
                    onChange={e => setBusca(e.target.value)}
                    placeholder="Buscar por nome, CPF ou ID..."
                    className="w-full min-w-0"
                    style={{ paddingLeft: '2rem' }}
                  />
                </div>
                <div className="w-full md:w-1/3 min-w-0">
                  <Dropdown
                    value={filtroStatus}
                    options={[
                      { label: 'Todos os Status', value: 'todos' },
                      { label: 'Aguardando Triagem', value: 'aguardando_triagem' },
                      { label: 'Aguardando', value: 'aguardando' },
                      { label: 'Em Atendimento', value: 'em_atendimento' },
                      { label: 'Atendidos', value: 'atendido' }
                    ]}
                    onChange={e => setFiltroStatus(e.value)}
                    className="w-full min-w-0"
                    placeholder="Filtrar Status"
                  />
                </div>
              </div>
              {/* Lista de Pacientes */}
              <div className="flex-1 flex flex-col">
                {pacientesFiltrados.length === 0 ? (
                  <div className="bg-gray-50 rounded-lg p-8 text-center flex-1 flex flex-col justify-center min-h-[220px]">
                    <div className="text-gray-400 mb-4">
                      <i className="pi pi-check-circle text-5xl" />
                    </div>
                    <p className="text-gray-500 text-lg">Nenhum paciente encontrado</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto flex-1">
                    {pacientesFiltrados.map((paciente) => {
                    const corInfo = obterCorDisplay(paciente.corTriagem);
                    const statusInfo = obterStatusDisplay(paciente.status);
                    const isSelected = pacienteSelecionado?.id === paciente.id;
                    return (
                      <Card
                        key={paciente.id}
                        className={`transition-all cursor-pointer rounded-lg px-3 py-2 border min-w-0 shadow-sm !mb-0 !mt-0 ${
                          isSelected
                            ? '!border-purple-500 !bg-purple-50'
                            : '!border-gray-200 hover:!border-gray-300 !bg-white'
                        }`}
                        onClick={() => handleSelecionarPaciente(paciente)}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="bg-blue-500 text-white font-bold text-xs px-2 py-0.5 rounded-full flex-shrink-0">#{paciente.id}</span>
                          <span className="font-medium text-gray-800 text-sm truncate max-w-[120px]">{paciente.nome}</span>
                          {isSelected && (
                            <span className="ml-2 text-xs text-purple-600 font-semibold">Selecionado</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{formatarData(paciente.horaCadastro)}</span>
                          <span>•</span>
                          <span>{formatarTempo(paciente.horaCadastro)}</span>
                        </div>
                        <div className="text-xs text-gray-700 truncate max-w-full">{paciente.motivoVisita}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <Tag value={corInfo.nome} className={`${corInfo.bg} ${corInfo.text} px-2 py-0.5 text-xs`} />
                          <Tag value={statusInfo.nome} className={`px-2 py-0.5 text-xs ${
                            statusInfo.cor === 'green' ? 'bg-green-100 text-green-700' :
                            statusInfo.cor === 'blue' ? 'bg-blue-100 text-blue-700' :
                            statusInfo.cor === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-orange-100 text-orange-700'
                          }`} />
                        </div>
                      </Card>
                    );
                  })}
                  </div>
                )}
              </div>
            </div>

            {/* Histórico Detalhado */}
            <div className="lg:col-span-2 flex flex-col h-full">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Histórico Detalhado</h2>
              
              {pacienteSelecionado ? (
                <div className="flex-1">
                  <EvolucaoMedica paciente={pacienteSelecionado} />
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-8 text-center flex-1 flex flex-col justify-center min-h-[220px]">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch min-h-[200px] mt-8">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
              <div className="text-orange-600 text-2xl mb-2">🚨</div>
              <p className="text-2xl font-bold text-gray-800">
                {estatisticas.aguardandoTriagem ?? 0}
              </p>
              <p className="text-gray-600 text-sm">Aguardando Triagem</p>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
              <div className="text-yellow-600 text-2xl mb-2">⏳</div>
              <p className="text-2xl font-bold text-gray-800">
                {estatisticas.aguardandoAvaliacao ?? 0}
              </p>
              <p className="text-gray-600 text-sm">Aguardando</p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <div className="text-blue-600 text-2xl mb-2">🩺</div>
              <p className="text-2xl font-bold text-gray-800">
                {estatisticas.emConsulta ?? 0}
              </p>
              <p className="text-gray-600 text-sm">Em Atendimento</p>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <div className="text-green-600 text-2xl mb-2">✅</div>
              <p className="text-2xl font-bold text-gray-800">
                {estatisticas.atendidos ?? 0}
              </p>
              <p className="text-gray-600 text-sm">Atendidos</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoricoMedico; 