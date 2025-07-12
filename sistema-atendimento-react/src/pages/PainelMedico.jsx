import React, { useState, useEffect } from 'react';
import { useSistemaAtendimento } from '../context/HospitalContext';
import { useToast } from '../context/ToastProvider';
import LoadingSpinner from '../components/LoadingSpinner';

const PainelMedico = () => {
  const { 
    obterPacientesAguardandoAvaliacaoMedica,
    chamarProximoPacienteMedico,
    finalizarConsulta,
    pacienteAtualMedico,
    currentUser,
    trocarTela
  } = useSistemaAtendimento();
  
  const { success: showToast, error: showError } = useToast();
  const [showEvolutionForm, setShowEvolutionForm] = useState(false);
  const [evolutionData, setEvolutionData] = useState({
    queixaAtual: '',
    exameFisico: '',
    hipoteseDiagnostica: '',
    conduta: '',
    orientacoes: '',
    encaminhamento: '',
    dataRetorno: '',
    medicamentos: [],
    exames: [],
    statusFinal: 'atendimento_concluido'
  });

  // Verificar se o usuário está logado e é médico ou admin
  useEffect(() => {
    if (!currentUser) {
      trocarTela('login');
      return;
    }
    
    if (currentUser.tipo !== 'medico' && currentUser.tipo !== 'admin') {
      showError('Acesso negado. Apenas médicos e administradores podem acessar este painel.');
      trocarTela('cadastro');
      return;
    }
  }, [currentUser, trocarTela, showError]);

  const pacientesAguardandoMedico = obterPacientesAguardandoAvaliacaoMedica;

  const handleCallNextPatient = () => {
    const result = chamarProximoPacienteMedico();
    if (result) {
      showToast(`Paciente ${result.nome} chamado para consulta`);
      setShowEvolutionForm(true);
    } else {
      showError('Nenhum paciente na fila de avaliação médica');
    }
  };

  const handleFinishConsultation = async () => {
    if (!pacienteAtualMedico) return;

    try {
      // Preparar dados da consulta
      const dadosConsulta = {
        ...evolutionData,
        // Salvar evolução clínica no localStorage
        evolucaoClinica: {
          id: Date.now(),
          ...evolutionData,
          pacienteId: pacienteAtualMedico.id,
          medico: currentUser.nome,
          dataCriacao: new Date().toISOString(),
          dataAtendimento: new Date().toISOString()
        }
      };

      finalizarConsulta(pacienteAtualMedico.id, dadosConsulta);
      
      showToast(`Consulta de ${pacienteAtualMedico.nome} finalizada!`);
      setShowEvolutionForm(false);
      resetEvolutionForm();
    } catch (error) {
      showError('Erro ao finalizar consulta');
    }
  };

  const resetEvolutionForm = () => {
    setEvolutionData({
      queixaAtual: '',
      exameFisico: '',
      hipoteseDiagnostica: '',
      conduta: '',
      orientacoes: '',
      encaminhamento: '',
      dataRetorno: '',
      medicamentos: [],
      exames: [],
      statusFinal: 'atendimento_concluido'
    });
  };

  const addMedicamento = () => {
    setEvolutionData(prev => ({
      ...prev,
      medicamentos: [...prev.medicamentos, {
        id: Date.now(),
        nome: '',
        dosagem: '',
        posologia: '',
        duracao: '',
        observacoes: ''
      }]
    }));
  };

  const removeMedicamento = (id) => {
    setEvolutionData(prev => ({
      ...prev,
      medicamentos: prev.medicamentos.filter(med => med.id !== id)
    }));
  };

  const updateMedicamento = (id, field, value) => {
    setEvolutionData(prev => ({
      ...prev,
      medicamentos: prev.medicamentos.map(med => 
        med.id === id ? { ...med, [field]: value } : med
      )
    }));
  };

  const addExame = () => {
    setEvolutionData(prev => ({
      ...prev,
      exames: [...prev.exames, {
        id: Date.now(),
        nome: '',
        urgencia: 'normal',
        justificativa: ''
      }]
    }));
  };

  const removeExame = (id) => {
    setEvolutionData(prev => ({
      ...prev,
      exames: prev.exames.filter(exame => exame.id !== id)
    }));
  };

  const updateExame = (id, field, value) => {
    setEvolutionData(prev => ({
      ...prev,
      exames: prev.exames.map(exame => 
        exame.id === id ? { ...exame, [field]: value } : exame
      )
    }));
  };

  const getPriorityColor = (color) => {
    const colors = {
      'vermelho': 'bg-red-500',
      'laranja': 'bg-orange-500',
      'amarelo': 'bg-yellow-500',
      'verde': 'bg-green-500',
      'azul': 'bg-blue-500'
    };
    return colors[color] || 'bg-gray-500';
  };

  const getPriorityName = (color) => {
    const names = {
      'vermelho': 'EMERGÊNCIA',
      'laranja': 'MUITO URGENTE',
      'amarelo': 'URGENTE',
      'verde': 'POUCO URGENTE',
      'azul': 'NÃO URGENTE'
    };
    return names[color] || 'NÃO DEFINIDO';
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

  if (!currentUser || (currentUser.tipo !== 'medico' && currentUser.tipo !== 'admin')) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Painel Médico</h1>
              <p className="text-gray-600 mt-2">
                Dr. {currentUser.nome} - {currentUser.especialidade || 'Clínico Geral'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">
                {new Date().toLocaleDateString('pt-BR')}
              </p>
              <p className="text-sm text-gray-500">
                {new Date().toLocaleTimeString('pt-BR')}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de Pacientes Aguardando */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Aguardando Consulta ({pacientesAguardandoMedico.length})
                </h2>
                <button
                  onClick={handleCallNextPatient}
                  disabled={pacientesAguardandoMedico.length === 0}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Chamar Próximo
                </button>
              </div>
              
              {pacientesAguardandoMedico.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Nenhum paciente aguardando consulta</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pacientesAguardandoMedico.map((patient, index) => {
                    const corInfo = getPriorityColor(patient.corTriagem);
                    return (
                      <div
                        key={patient.id}
                        className={`p-4 border rounded-lg ${
                          pacienteAtualMedico?.id === patient.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`${corInfo} text-white font-bold text-lg px-3 py-1 rounded-full`}>
                              #{index + 1}
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-800">{patient.nome}</h3>
                              <p className="text-sm text-gray-500">
                                {patient.idade} anos • {patient.sexo === 'M' ? 'M' : patient.sexo === 'F' ? 'F' : 'O'}
                              </p>
                              <p className="text-xs text-gray-400">
                                Prontuário: {patient.numeroProntuario}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`${corInfo} text-white px-2 py-1 rounded text-xs font-bold mb-1`}>
                              {getPriorityName(patient.corTriagem)}
                            </div>
                            <p className="text-xs text-gray-500">
                              Aguardando há {obterTempoEspera(patient.horaFimTriagem || patient.horaCadastro)}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">
                            <strong>Queixa:</strong> {patient.queixaPrincipal || patient.motivoVisita}
                          </p>
                          {patient.sinaisVitais && Object.keys(patient.sinaisVitais).length > 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                              <strong>Sinais Vitais:</strong> {Object.entries(patient.sinaisVitais)
                                .filter(([_, value]) => value)
                                .map(([key, value]) => `${key}: ${value}`)
                                .join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Área de Consulta */}
          <div className="lg:col-span-2">
            {showEvolutionForm && pacienteAtualMedico ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      Consulta: {pacienteAtualMedico.nome}
                    </h2>
                    <p className="text-gray-600">
                      {pacienteAtualMedico.idade} anos • {pacienteAtualMedico.sexo === 'M' ? 'Masculino' : pacienteAtualMedico.sexo === 'F' ? 'Feminino' : 'Outro'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Prontuário: {pacienteAtualMedico.numeroProntuario}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowEvolutionForm(false)}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                </div>

                {/* Informações do Paciente */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Dados Pessoais</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p><strong>Nome:</strong> {pacienteAtualMedico.nome}</p>
                      <p><strong>Idade:</strong> {pacienteAtualMedico.idade} anos</p>
                      <p><strong>Sexo:</strong> {pacienteAtualMedico.sexo === 'M' ? 'Masculino' : pacienteAtualMedico.sexo === 'F' ? 'Feminino' : 'Outro'}</p>
                      <p><strong>Telefone:</strong> {pacienteAtualMedico.telefone}</p>
                      <p><strong>Endereço:</strong> {pacienteAtualMedico.endereco}</p>
                      <p><strong>Contato Emergência:</strong> {pacienteAtualMedico.contatoEmergencia}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Dados da Triagem</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p><strong>Prioridade:</strong></p>
                        <span className={`${getPriorityColor(pacienteAtualMedico.corTriagem)} text-white px-2 py-1 rounded text-sm font-bold`}>
                          {getPriorityName(pacienteAtualMedico.corTriagem)}
                        </span>
                      </div>
                      <p><strong>Queixa Principal:</strong></p>
                      <p className="text-gray-700">{pacienteAtualMedico.queixaPrincipal || pacienteAtualMedico.motivoVisita}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        <strong>Triagem realizada:</strong> {new Date(pacienteAtualMedico.horaFimTriagem).toLocaleString('pt-BR')}
                      </p>
                      {pacienteAtualMedico.sinaisVitais && Object.keys(pacienteAtualMedico.sinaisVitais).length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600"><strong>Sinais Vitais:</strong></p>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            {Object.entries(pacienteAtualMedico.sinaisVitais).map(([key, value]) => (
                              value && <p key={key} className="text-gray-700">{key}: {value}</p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Formulário de Evolução Clínica */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-800">Evolução Clínica</h3>
                  
                  {/* Queixa Atual */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Queixa Atual
                    </label>
                    <textarea
                      rows="3"
                      placeholder="Descreva a queixa atual do paciente..."
                      value={evolutionData.queixaAtual}
                      onChange={(e) => setEvolutionData({...evolutionData, queixaAtual: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Exame Físico */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Exame Físico
                    </label>
                    <textarea
                      rows="4"
                      placeholder="Descreva os achados do exame físico..."
                      value={evolutionData.exameFisico}
                      onChange={(e) => setEvolutionData({...evolutionData, exameFisico: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Hipótese Diagnóstica */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hipótese Diagnóstica
                    </label>
                    <textarea
                      rows="3"
                      placeholder="Descreva a hipótese diagnóstica..."
                      value={evolutionData.hipoteseDiagnostica}
                      onChange={(e) => setEvolutionData({...evolutionData, hipoteseDiagnostica: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Conduta */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Conduta
                    </label>
                    <textarea
                      rows="3"
                      placeholder="Descreva a conduta adotada..."
                      value={evolutionData.conduta}
                      onChange={(e) => setEvolutionData({...evolutionData, conduta: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Medicamentos */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-semibold text-gray-800">Medicamentos</h4>
                      <button
                        type="button"
                        onClick={addMedicamento}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                      >
                        + Adicionar
                      </button>
                    </div>
                    
                    {evolutionData.medicamentos.length === 0 ? (
                      <p className="text-gray-500 text-sm">Nenhum medicamento prescrito</p>
                    ) : (
                      <div className="space-y-4">
                        {evolutionData.medicamentos.map((med, index) => (
                          <div key={med.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-3">
                              <h5 className="font-medium text-gray-800">Medicamento {index + 1}</h5>
                              <button
                                onClick={() => removeMedicamento(med.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                ✕ Remover
                              </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                                <input
                                  type="text"
                                  value={med.nome}
                                  onChange={(e) => updateMedicamento(med.id, 'nome', e.target.value)}
                                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="Nome do medicamento"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Dosagem</label>
                                <input
                                  type="text"
                                  value={med.dosagem}
                                  onChange={(e) => updateMedicamento(med.id, 'dosagem', e.target.value)}
                                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="Ex: 500mg"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Posologia</label>
                                <input
                                  type="text"
                                  value={med.posologia}
                                  onChange={(e) => updateMedicamento(med.id, 'posologia', e.target.value)}
                                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="Ex: 1 comprimido 3x ao dia"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Duração</label>
                                <input
                                  type="text"
                                  value={med.duracao}
                                  onChange={(e) => updateMedicamento(med.id, 'duracao', e.target.value)}
                                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="Ex: 7 dias"
                                />
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                                <textarea
                                  value={med.observacoes}
                                  onChange={(e) => updateMedicamento(med.id, 'observacoes', e.target.value)}
                                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="Observações sobre o medicamento"
                                  rows="2"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Exames */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-semibold text-gray-800">Exames Solicitados</h4>
                      <button
                        type="button"
                        onClick={addExame}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                      >
                        + Adicionar
                      </button>
                    </div>
                    
                    {evolutionData.exames.length === 0 ? (
                      <p className="text-gray-500 text-sm">Nenhum exame solicitado</p>
                    ) : (
                      <div className="space-y-4">
                        {evolutionData.exames.map((exame, index) => (
                          <div key={exame.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-3">
                              <h5 className="font-medium text-gray-800">Exame {index + 1}</h5>
                              <button
                                onClick={() => removeExame(exame.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                ✕ Remover
                              </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Exame</label>
                                <input
                                  type="text"
                                  value={exame.nome}
                                  onChange={(e) => updateExame(exame.id, 'nome', e.target.value)}
                                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="Nome do exame"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Urgência</label>
                                <select
                                  value={exame.urgencia}
                                  onChange={(e) => updateExame(exame.id, 'urgencia', e.target.value)}
                                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                  <option value="normal">Normal</option>
                                  <option value="urgente">Urgente</option>
                                  <option value="emergencial">Emergencial</option>
                                </select>
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Justificativa</label>
                                <textarea
                                  value={exame.justificativa}
                                  onChange={(e) => updateExame(exame.id, 'justificativa', e.target.value)}
                                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="Justificativa para solicitação do exame"
                                  rows="2"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Orientações */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Orientações ao Paciente
                    </label>
                    <textarea
                      rows="4"
                      placeholder="Orientações sobre cuidados, retorno, etc..."
                      value={evolutionData.orientacoes}
                      onChange={(e) => setEvolutionData({...evolutionData, orientacoes: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Encaminhamento */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Encaminhamento
                    </label>
                    <textarea
                      rows="3"
                      placeholder="Especialidade ou serviço para encaminhamento..."
                      value={evolutionData.encaminhamento}
                      onChange={(e) => setEvolutionData({...evolutionData, encaminhamento: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Data de Retorno */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data de Retorno
                    </label>
                    <input
                      type="date"
                      value={evolutionData.dataRetorno}
                      onChange={(e) => setEvolutionData({...evolutionData, dataRetorno: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Status Final */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status Final
                    </label>
                    <select
                      value={evolutionData.statusFinal}
                      onChange={(e) => setEvolutionData({...evolutionData, statusFinal: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="atendimento_concluido">Atendimento Concluído</option>
                      <option value="aguardando_exame">Aguardando Exame</option>
                      <option value="internado">Internado</option>
                      <option value="encaminhado">Encaminhado</option>
                    </select>
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex justify-end space-x-4 pt-6 border-t">
                    <button
                      onClick={() => setShowEvolutionForm(false)}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleFinishConsultation}
                      className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                      Finalizar Consulta
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    Nenhum Paciente em Consulta
                  </h3>
                  <p className="text-gray-500">
                    Clique em "Chamar Próximo" para iniciar uma consulta
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PainelMedico;
