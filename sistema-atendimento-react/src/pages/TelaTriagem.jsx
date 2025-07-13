import React, { useState, useEffect } from "react";
import { useSistemaAtendimento } from "../context/HospitalContext";
import { useToast } from "../context/ToastProvider";
import LoadingSpinner from "../components/LoadingSpinner";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Divider } from "primereact/divider";
import { Tag } from "primereact/tag";
import { PrimeIcons } from "primereact/api";
import { Slider } from "primereact/slider";
import { Panel } from "primereact/panel";

// Função utilitária para calcular idade a partir de string (dd/mm/yyyy ou ISO)
function calcularIdade(dataNascimento) {
  if (!dataNascimento) return '';
  let partes;
  let dataNasc;
  if (typeof dataNascimento === 'string' && dataNascimento.includes('/')) {
    // Formato brasileiro dd/mm/yyyy
    partes = dataNascimento.split('/');
    if (partes.length === 3) {
      // new Date(ano, mes-1, dia)
      dataNasc = new Date(parseInt(partes[2]), parseInt(partes[1]) - 1, parseInt(partes[0]));
    }
  } else {
    // ISO ou Date
    dataNasc = new Date(dataNascimento);
  }
  if (!dataNasc || isNaN(dataNasc.getTime())) return '';
  const hoje = new Date();
  let idade = hoje.getFullYear() - dataNasc.getFullYear();
  const m = hoje.getMonth() - dataNasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < dataNasc.getDate())) {
    idade--;
  }
  return idade;
}

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

  // Opções para dropdowns
  const opcoesNivelConsciencia = [
    { value: 'Alerta', label: 'Alerta' },
    { value: 'Sonolento', label: 'Sonolento' },
    { value: 'Confuso', label: 'Confuso' },
    { value: 'Inconsciente', label: 'Inconsciente' }
  ];

  const opcoesCorTriagem = [
    { value: 'vermelho', label: '🔴 VERMELHO - Emergência', severity: 'danger' },
    { value: 'laranja', label: '🟠 LARANJA - Muito Urgente', severity: 'warning' },
    { value: 'amarelo', label: '🟡 AMARELO - Urgente', severity: 'warning' },
    { value: 'verde', label: '🟢 VERDE - Pouco Urgente', severity: 'success' },
    { value: 'azul', label: '🔵 AZUL - Não Urgente', severity: 'info' }
  ];

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTriageData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDropdownChange = (e, fieldName) => {
    setTriageData(prev => ({
      ...prev,
      [fieldName]: e.value
    }));
  };

  const handleSinaisVitaisChange = (field, value) => {
    setTriageData(prev => ({
      ...prev,
      sinaisVitais: {
        ...prev.sinaisVitais,
        [field]: value
      }
    }));
  };

  if (!currentUser || (currentUser.tipo !== 'enfermeiro' && currentUser.tipo !== 'recepcionista' && currentUser.tipo !== 'admin')) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 pt-2">
      <div className="max-w-7xl mx-auto">
        {/* Header minimalista */}
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-gray-800">Tela de Triagem</h1>
          <div className="flex items-center text-gray-500 text-sm mt-1">
            <i className="pi pi-user mr-2" />
            {currentUser?.nome} - {currentUser.tipo === 'enfermeiro' ? 'Enfermeiro' : 'Recepcionista'}
            <span className="ml-auto">{new Date().toLocaleDateString('pt-BR')} {new Date().toLocaleTimeString('pt-BR')}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de Pacientes Aguardando Triagem */}
          <div className="lg:col-span-1">
            <Card className="shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Aguardando Triagem ({pacientesAguardandoTriagem.length})
                </h2>
                <Button
                  icon={PrimeIcons.USER_PLUS}
                  label="Chamar Próximo"
                  disabled={pacientesAguardandoTriagem.length === 0}
                  onClick={handleCallNextPatient}
                  className="bg-blue-600 hover:bg-blue-700 border-0 text-white"
                  pt={{
                    root: { 
                      className: 'bg-blue-600 hover:bg-blue-700 border-0 text-white px-4 py-2 rounded-lg transition-colors disabled:bg-gray-400' 
                    }
                  }}
                />
              </div>
              
              {pacientesAguardandoTriagem.length === 0 ? (
                <div className="text-center py-8">
                  <i className={`${PrimeIcons.USERS} text-4xl text-gray-300 mb-4`}></i>
                  <p className="text-gray-500">Nenhum paciente aguardando triagem</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pacientesAguardandoTriagem.map((patient, index) => (
                    <div
                      key={patient.id}
                      className={`p-4 border rounded-lg transition-colors min-w-[320px] w-full max-w-lg ${
                        pacienteAtualTriagem?.id === patient.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start min-w-0">
                        <div className="bg-blue-500 text-white font-bold text-lg px-3 py-1 rounded-full flex-shrink-0 mt-1">#{index + 1}</div>
                        <div className="ml-4 flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between min-w-0">
                            <h3 className="font-medium text-gray-800 text-base sm:text-lg min-w-0" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis'}}>{patient.nome}</h3>
                            <div className="text-xs text-gray-500 whitespace-nowrap sm:ml-4 mt-1 sm:mt-0 text-right">
                              Aguardando há {obterTempoEspera(patient.horaCadastro)}
                            </div>
                          </div>
                          <div className="flex items-center text-sm text-gray-500 space-x-2 mt-1">
                            <span>{calcularIdade(patient.dataNascimento)} anos</span>
                            <span>•</span>
                            <span>{patient.sexo === 'M' ? 'M' : patient.sexo === 'F' ? 'F' : 'O'}</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">Prontuário: {patient.numeroProntuario}</p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <span className="font-semibold text-gray-700">Motivo:</span>
                        <span className="ml-1 text-gray-800">{patient.motivoVisita}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Área de Triagem */}
          <div className="lg:col-span-2">
            {showTriageForm && pacienteAtualTriagem ? (
              <Card className="shadow-md">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      Triagem: {pacienteAtualTriagem.nome}
                    </h2>
                    <p className="text-gray-600">
                      {/* Corrigir exibição da idade */}
                      {calcularIdade(pacienteAtualTriagem.dataNascimento)} anos • {pacienteAtualTriagem.sexo === 'M' ? 'Masculino' : pacienteAtualTriagem.sexo === 'F' ? 'Feminino' : 'Outro'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Prontuário: {pacienteAtualTriagem.numeroProntuario}
                    </p>
                  </div>
                  <Button
                    icon={PrimeIcons.TIMES}
                    label="Cancelar"
                    outlined
                    onClick={() => setShowTriageForm(false)}
                    className="!bg-gray-100 !text-gray-700 !border-0 px-6 py-2 rounded-lg font-semibold transition-colors hover:!bg-red-500 hover:!text-white"
                    pt={{
                      root: { className: '!bg-gray-100 !text-gray-700 !border-0 px-6 py-2 rounded-lg font-semibold transition-colors hover:!bg-red-500 hover:!text-white' }
                    }}
                  />
                </div>

                {/* Informações do Paciente */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <Panel header="Dados Pessoais" className="shadow-sm">
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-500">Nome:</span><span className="font-semibold text-gray-800">{pacienteAtualTriagem.nome}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Idade:</span><span className="font-semibold text-gray-800">{calcularIdade(pacienteAtualTriagem.dataNascimento)} anos</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Sexo:</span><span className="font-semibold text-gray-800">{pacienteAtualTriagem.sexo === 'M' ? 'Masculino' : pacienteAtualTriagem.sexo === 'F' ? 'Feminino' : 'Outro'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Telefone:</span><span className="font-semibold text-gray-800">{pacienteAtualTriagem.telefone}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Endereço:</span><span className="font-semibold text-gray-800">{pacienteAtualTriagem.endereco}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Contato Emergência:</span><span className="font-semibold text-gray-800">{pacienteAtualTriagem.contatoEmergencia}</span>
                      </div>
                    </div>
                  </Panel>
                  
                  <Panel header="Motivo da Visita" className="shadow-sm">
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-500 font-medium">Queixa Principal:</span>
                        <p className="text-gray-700 mt-1">{pacienteAtualTriagem.motivoVisita}</p>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Chegada:</span>
                        <span className="font-semibold text-gray-800">
                          {new Date(pacienteAtualTriagem.horaCadastro).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      {pacienteAtualTriagem.sintomas && pacienteAtualTriagem.sintomas.length > 0 && (
                        <div>
                          <span className="text-gray-500 font-medium">Sintomas:</span>
                          <p className="text-gray-700 mt-1">{pacienteAtualTriagem.sintomas.join(', ')}</p>
                        </div>
                      )}
                    </div>
                  </Panel>
                </div>

                {/* Formulário de Triagem */}
                <div className="space-y-6">
                  {/* Classificação de Prioridade */}
                  <Panel header="Classificação de Prioridade (Manchester)" className="shadow-sm">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {opcoesCorTriagem.map((opcao) => (
                        <div
                          key={opcao.value}
                          className={`cursor-pointer border-2 rounded-lg p-4 transition-all ${
                            triageData.corTriagem === opcao.value
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setTriageData({...triageData, corTriagem: opcao.value})}
                        >
                          <div className="text-center">
                            <div className={`w-6 h-6 rounded-full mx-auto mb-2 ${getPriorityColor(opcao.value)}`}></div>
                            <div className="font-medium text-gray-800">{getPriorityName(opcao.value)}</div>
                            <div className="text-sm text-gray-500">
                              {opcao.value === 'vermelho' && 'Emergência'}
                              {opcao.value === 'laranja' && 'Muito Urgente'}
                              {opcao.value === 'amarelo' && 'Urgente'}
                              {opcao.value === 'verde' && 'Pouco Urgente'}
                              {opcao.value === 'azul' && 'Não Urgente'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Panel>

                  {/* Queixa Principal */}
                  <Panel header="Queixa Principal" className="shadow-sm">
                    <InputTextarea
                      name="queixaPrincipal"
                      value={triageData.queixaPrincipal}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Descreva a queixa principal do paciente..."
                      className="w-full"
                      pt={{
                        root: { className: 'w-full' }
                      }}
                    />
                  </Panel>

                  {/* Avaliação de Dor */}
                  <Panel header="Avaliação de Dor" className="shadow-sm">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Escala de Dor (0-10)
                        </label>
                        <Slider
                          value={triageData.nivelDor}
                          onChange={(e) => setTriageData({...triageData, nivelDor: e.value})}
                          min={0}
                          max={10}
                          step={1}
                          className="w-full"
                        />
                        <div className="text-center text-sm font-semibold text-red-600 mt-2">
                          {triageData.nivelDor}
                        </div>
                      </div>
                    </div>
                  </Panel>

                  {/* Sinais Vitais */}
                  <Panel header="Sinais Vitais" className="shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Pressão Arterial
                        </label>
                        <InputText
                          placeholder="Ex: 120/80"
                          value={triageData.sinaisVitais.pressaoArterial}
                          onChange={(e) => handleSinaisVitaisChange('pressaoArterial', e.target.value)}
                          className="w-full"
                          pt={{
                            root: { className: 'w-full' }
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Temperatura
                        </label>
                        <InputText
                          placeholder="Ex: 36.5°C"
                          value={triageData.sinaisVitais.temperatura}
                          onChange={(e) => handleSinaisVitaisChange('temperatura', e.target.value)}
                          className="w-full"
                          pt={{
                            root: { className: 'w-full' }
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Frequência Cardíaca
                        </label>
                        <InputText
                          placeholder="Ex: 80 bpm"
                          value={triageData.sinaisVitais.frequenciaCardiaca}
                          onChange={(e) => handleSinaisVitaisChange('frequenciaCardiaca', e.target.value)}
                          className="w-full"
                          pt={{
                            root: { className: 'w-full' }
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Saturação O2
                        </label>
                        <InputText
                          placeholder="Ex: 98%"
                          value={triageData.sinaisVitais.saturacaoOxigenio}
                          onChange={(e) => handleSinaisVitaisChange('saturacaoOxigenio', e.target.value)}
                          className="w-full"
                          pt={{
                            root: { className: 'w-full' }
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Frequência Respiratória
                        </label>
                        <InputText
                          placeholder="Ex: 16 rpm"
                          value={triageData.sinaisVitais.frequenciaRespiratoria}
                          onChange={(e) => handleSinaisVitaisChange('frequenciaRespiratoria', e.target.value)}
                          className="w-full"
                          pt={{
                            root: { className: 'w-full' }
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Peso
                        </label>
                        <InputText
                          placeholder="Ex: 70 kg"
                          value={triageData.sinaisVitais.peso}
                          onChange={(e) => handleSinaisVitaisChange('peso', e.target.value)}
                          className="w-full"
                          pt={{
                            root: { className: 'w-full' }
                          }}
                        />
                      </div>
                    </div>
                  </Panel>

                  {/* Nível de Consciência */}
                  <Panel header="Nível de Consciência" className="shadow-sm">
                    <Dropdown
                      value={triageData.nivelConsciencia}
                      onChange={(e) => handleDropdownChange(e, 'nivelConsciencia')}
                      options={opcoesNivelConsciencia}
                      optionLabel="label"
                      optionValue="value"
                      placeholder="Selecione o nível de consciência"
                      className="w-full"
                      pt={{
                        root: { className: 'w-full' }
                      }}
                    />
                  </Panel>

                  {/* Observações */}
                  <Panel header="Observações da Triagem" className="shadow-sm">
                    <InputTextarea
                      name="observacoesTriagem"
                      value={triageData.observacoesTriagem}
                      onChange={handleInputChange}
                      rows="4"
                      placeholder="Descreva observações importantes sobre o paciente..."
                      className="w-full"
                      pt={{
                        root: { className: 'w-full' }
                      }}
                    />
                  </Panel>

                  {/* Botões de Ação */}
                  <Divider />
                  <div className="flex justify-end gap-4 pt-2">
                    <Button
                      icon={PrimeIcons.TIMES}
                      label="Cancelar"
                      outlined
                      onClick={() => setShowTriageForm(false)}
                      className="!bg-gray-100 !text-gray-700 !border-0 px-6 py-2 rounded-lg font-semibold transition-colors hover:!bg-red-500 hover:!text-white"
                      pt={{
                        root: { className: '!bg-gray-100 !text-gray-700 !border-0 px-6 py-2 rounded-lg font-semibold transition-colors hover:!bg-red-500 hover:!text-white' }
                      }}
                    />
                    <Button
                      icon={PrimeIcons.CHECK}
                      label="Finalizar Triagem"
                      onClick={handleSaveTriage}
                      className="bg-blue-500 hover:bg-blue-600 border-0 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                      pt={{
                        root: { className: 'bg-blue-500 hover:bg-blue-600 border-0 text-white px-6 py-2 rounded-lg font-semibold transition-colors' }
                      }}
                    />
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="shadow-md">
                <div className="text-center py-12">
                  <i className={`${PrimeIcons.FILE_EDIT} text-6xl text-gray-300 mb-4`}></i>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    Nenhum Paciente em Triagem
                  </h3>
                  <p className="text-gray-500">
                    Clique em "Chamar Próximo" para iniciar a triagem de um paciente
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TelaTriagem; 