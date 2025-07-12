import React, { useState, useEffect } from "react";
import { useSistemaAtendimento } from "../context/HospitalContext";
import { useToast } from "../context/ToastProvider";
import LoadingSpinner from "../components/LoadingSpinner";

const TelaTriagem = () => {
  const { 
    obterPacientesAguardandoTriagem, 
    chamarProximoPacienteTriagem,
    finalizarTriagem,
    pacienteAtualTriagem,
    currentUser
  } = useSistemaAtendimento();
  
  const { success: showToast, error: showError } = useToast();
  
  const [triageData, setTriageData] = useState({
    corTriagem: 'verde',
    queixaPrincipal: '',
    nivelDor: 0,
    nivelConsciencia: 'Alerta',
    sinaisVitais: {
      pressaoArterial: '',
      temperatura: '',
      frequenciaCardiaca: '',
      saturacaoOxigenio: '',
      frequenciaRespiratoria: '',
      peso: ''
    },
    observacoesTriagem: ''
  });
  const [showTriageForm, setShowTriageForm] = useState(false);

  // Verificar se o usuário está logado e tem acesso
  useEffect(() => {
    if (!currentUser) {
      return;
    }
    
    if (currentUser.tipo !== 'enfermeiro' && currentUser.tipo !== 'recepcionista' && currentUser.tipo !== 'admin') {
      showError('Acesso negado. Apenas enfermeiros, recepcionistas e administradores podem acessar este painel.');
      return;
    }
  }, [currentUser, showError]);

  const pacientesAguardandoTriagem = obterPacientesAguardandoTriagem;

  const handleCallNextPatient = () => {
    const result = chamarProximoPacienteTriagem();
    if (result) {
      showToast(`Paciente ${result.nome} chamado para triagem`);
      setShowTriageForm(true);
    } else {
      showError('Nenhum paciente na fila de triagem');
    }
  };

  const handleSaveTriage = async () => {
    if (!pacienteAtualTriagem) return;

    try {
      finalizarTriagem(pacienteAtualTriagem.id, triageData);
      
      showToast(`Triagem de ${pacienteAtualTriagem.nome} finalizada! Classificação: ${triageData.corTriagem.toUpperCase()}`);
      setShowTriageForm(false);
      setTriageData({
        corTriagem: 'verde',
        queixaPrincipal: '',
        nivelDor: 0,
        nivelConsciencia: 'Alerta',
        sinaisVitais: {
          pressaoArterial: '',
          temperatura: '',
          frequenciaCardiaca: '',
          saturacaoOxigenio: '',
          frequenciaRespiratoria: '',
          peso: ''
        },
        observacoesTriagem: ''
      });
    } catch (error) {
      showError('Erro ao finalizar triagem');
    }
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

  if (!currentUser || (currentUser.tipo !== 'enfermeiro' && currentUser.tipo !== 'recepcionista' && currentUser.tipo !== 'admin')) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Tela de Triagem</h1>
              <p className="text-gray-600 mt-2">
                {currentUser.nome} - {currentUser.tipo === 'enfermeiro' ? 'Enfermeiro' : 'Recepcionista'}
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
          {/* Lista de Pacientes Aguardando Triagem */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Aguardando Triagem ({pacientesAguardandoTriagem.length})
                </h2>
                <button
                  onClick={handleCallNextPatient}
                  disabled={pacientesAguardandoTriagem.length === 0}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Chamar Próximo
                </button>
              </div>
              
              {pacientesAguardandoTriagem.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Nenhum paciente aguardando triagem</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pacientesAguardandoTriagem.map((patient, index) => (
                    <div
                      key={patient.id}
                      className={`p-4 border rounded-lg ${
                        pacienteAtualTriagem?.id === patient.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="bg-blue-500 text-white font-bold text-lg px-3 py-1 rounded-full">
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
                          <p className="text-xs text-gray-500">
                            Aguardando há {obterTempoEspera(patient.horaCadastro)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">
                          <strong>Motivo:</strong> {patient.motivoVisita}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Área de Triagem */}
          <div className="lg:col-span-2">
            {showTriageForm && pacienteAtualTriagem ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      Triagem: {pacienteAtualTriagem.nome}
                    </h2>
                    <p className="text-gray-600">
                      {pacienteAtualTriagem.idade} anos • {pacienteAtualTriagem.sexo === 'M' ? 'Masculino' : pacienteAtualTriagem.sexo === 'F' ? 'Feminino' : 'Outro'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Prontuário: {pacienteAtualTriagem.numeroProntuario}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowTriageForm(false)}
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
                      <p><strong>Nome:</strong> {pacienteAtualTriagem.nome}</p>
                      <p><strong>Idade:</strong> {pacienteAtualTriagem.idade} anos</p>
                      <p><strong>Sexo:</strong> {pacienteAtualTriagem.sexo === 'M' ? 'Masculino' : pacienteAtualTriagem.sexo === 'F' ? 'Feminino' : 'Outro'}</p>
                      <p><strong>Telefone:</strong> {pacienteAtualTriagem.telefone}</p>
                      <p><strong>Endereço:</strong> {pacienteAtualTriagem.endereco}</p>
                      <p><strong>Contato Emergência:</strong> {pacienteAtualTriagem.contatoEmergencia}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Motivo da Visita</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p><strong>Queixa Principal:</strong></p>
                      <p className="text-gray-700">{pacienteAtualTriagem.motivoVisita}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        <strong>Chegada:</strong> {new Date(pacienteAtualTriagem.horaCadastro).toLocaleString('pt-BR')}
                      </p>
                      {pacienteAtualTriagem.sintomas && pacienteAtualTriagem.sintomas.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600"><strong>Sintomas:</strong></p>
                          <p className="text-sm text-gray-700">{pacienteAtualTriagem.sintomas.join(', ')}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Formulário de Triagem */}
                <div className="space-y-6">
                  {/* Classificação de Prioridade */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Classificação de Prioridade (Manchester)
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {['vermelho', 'laranja', 'amarelo', 'verde', 'azul'].map((cor) => (
                        <label
                          key={cor}
                          className={`cursor-pointer border-2 rounded-lg p-4 transition-all ${
                            triageData.corTriagem === cor
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="corTriagem"
                            value={cor}
                            checked={triageData.corTriagem === cor}
                            onChange={(e) => setTriageData({...triageData, corTriagem: e.target.value})}
                            className="sr-only"
                          />
                          <div className="text-center">
                            <div className={`w-6 h-6 rounded-full mx-auto mb-2 ${getPriorityColor(cor)}`}></div>
                            <div className="font-medium text-gray-800">{getPriorityName(cor)}</div>
                            <div className="text-sm text-gray-500">
                              {cor === 'vermelho' && 'Emergência'}
                              {cor === 'laranja' && 'Muito Urgente'}
                              {cor === 'amarelo' && 'Urgente'}
                              {cor === 'verde' && 'Pouco Urgente'}
                              {cor === 'azul' && 'Não Urgente'}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Queixa Principal */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Queixa Principal
                    </label>
                    <textarea
                      rows="3"
                      placeholder="Descreva a queixa principal do paciente..."
                      value={triageData.queixaPrincipal}
                      onChange={(e) => setTriageData({...triageData, queixaPrincipal: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Avaliação de Dor */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Avaliação de Dor</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Escala de Dor (0-10)
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="10"
                          value={triageData.nivelDor}
                          onChange={(e) => setTriageData({...triageData, nivelDor: parseInt(e.target.value)})}
                          className="w-full"
                        />
                        <div className="text-center text-sm font-semibold text-red-600">
                          {triageData.nivelDor}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sinais Vitais */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Sinais Vitais
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Pressão Arterial
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: 120/80"
                          value={triageData.sinaisVitais.pressaoArterial}
                          onChange={(e) => setTriageData({
                            ...triageData, 
                            sinaisVitais: {...triageData.sinaisVitais, pressaoArterial: e.target.value}
                          })}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Temperatura
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: 36.5°C"
                          value={triageData.sinaisVitais.temperatura}
                          onChange={(e) => setTriageData({
                            ...triageData, 
                            sinaisVitais: {...triageData.sinaisVitais, temperatura: e.target.value}
                          })}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Frequência Cardíaca
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: 80 bpm"
                          value={triageData.sinaisVitais.frequenciaCardiaca}
                          onChange={(e) => setTriageData({
                            ...triageData, 
                            sinaisVitais: {...triageData.sinaisVitais, frequenciaCardiaca: e.target.value}
                          })}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Saturação O2
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: 98%"
                          value={triageData.sinaisVitais.saturacaoOxigenio}
                          onChange={(e) => setTriageData({
                            ...triageData, 
                            sinaisVitais: {...triageData.sinaisVitais, saturacaoOxigenio: e.target.value}
                          })}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Frequência Respiratória
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: 16 rpm"
                          value={triageData.sinaisVitais.frequenciaRespiratoria}
                          onChange={(e) => setTriageData({
                            ...triageData, 
                            sinaisVitais: {...triageData.sinaisVitais, frequenciaRespiratoria: e.target.value}
                          })}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Peso
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: 70 kg"
                          value={triageData.sinaisVitais.peso}
                          onChange={(e) => setTriageData({
                            ...triageData, 
                            sinaisVitais: {...triageData.sinaisVitais, peso: e.target.value}
                          })}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Nível de Consciência */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nível de Consciência
                    </label>
                    <select
                      value={triageData.nivelConsciencia}
                      onChange={(e) => setTriageData({...triageData, nivelConsciencia: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Alerta">Alerta</option>
                      <option value="Sonolento">Sonolento</option>
                      <option value="Confuso">Confuso</option>
                      <option value="Inconsciente">Inconsciente</option>
                    </select>
                  </div>

                  {/* Observações */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Observações da Triagem
                    </label>
                    <textarea
                      rows="4"
                      placeholder="Descreva observações importantes sobre o paciente..."
                      value={triageData.observacoesTriagem}
                      onChange={(e) => setTriageData({...triageData, observacoesTriagem: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex justify-end space-x-4 pt-6 border-t">
                    <button
                      onClick={() => setShowTriageForm(false)}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveTriage}
                      className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                      Finalizar Triagem
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
                    Nenhum Paciente em Triagem
                  </h3>
                  <p className="text-gray-500">
                    Clique em "Chamar Próximo" para iniciar a triagem de um paciente
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

export default TelaTriagem; 