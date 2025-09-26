import React, { useState, useEffect } from 'react';
import { useSistemaAtendimento } from '../context/HospitalContext';
import { useToast } from '../context/ToastProvider';
import LoadingSpinner from '../components/LoadingSpinner';
import { Card } from 'primereact/card';
import { Panel } from 'primereact/panel';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Divider } from 'primereact/divider';
import { Dialog } from 'primereact/dialog';
import { AutoComplete } from 'primereact/autocomplete';

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
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [consultaParaImpressao, setConsultaParaImpressao] = useState(null);
  const [showFila, setShowFila] = useState(false);

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

  const handleCallNextPatient = async () => {
    try {
      const result = await chamarProximoPacienteMedico();
      if (result) {
        showToast(`Paciente ${result.nome} chamado para consulta`);
        setShowEvolutionForm(true);
        setShowFila(false);
      } else {
        showError('Nenhum paciente na fila de avaliação médica');
      }
    } catch (error) {
      console.error('Erro ao chamar paciente:', error);
      showError('Erro ao chamar paciente: ' + error.message);
    }
  };

  const handleFinishConsultation = async () => {
    if (!pacienteAtualMedico) return;

    try {
      // Preparar dados da consulta
      const dadosConsulta = {
        ...evolutionData,
        evolucaoClinica: {
          id: Date.now(),
          ...evolutionData,
          pacienteId: pacienteAtualMedico.id,
          medico: currentUser.nome,
          dataCriacao: new Date().toISOString(),
          dataAtendimento: new Date().toISOString()
        },
        paciente: pacienteAtualMedico
      };

      await finalizarConsulta(pacienteAtualMedico.id, dadosConsulta);
      
      showToast(`Consulta de ${pacienteAtualMedico.nome} finalizada!`);
      setShowEvolutionForm(false);
      resetEvolutionForm();
      setConsultaParaImpressao(dadosConsulta);
      setShowPrintModal(true);
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

  // Lista de principais exames sugeridos
  const principaisExames = [
    'Hemograma',
    'Glicemia',
    'Raio-X',
    'Eletrocardiograma',
    'Urina 1',
    'Ureia',
    'Creatinina',
    'Colesterol',
    'Triglicerídeos',
    'TSH',
    'T4 Livre',
    'PCR',
    'D-dímero',
    'Gasometria',
    'Tomografia',
    'Ultrassom',
    'Beta HCG',
    'HIV',
    'VDRL',
    'Sorologia COVID',
    'Cultura de Urina',
    'Cultura de Secreção',
    'Prova de Função Pulmonar',
    'Prova de Função Hepática',
    'Outros'
  ];
  const [exameSuggestions, setExameSuggestions] = useState([]);

  if (!currentUser || (currentUser.tipo !== 'medico' && currentUser.tipo !== 'admin')) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 pt-2">
      <div className="max-w-7xl mx-auto">
        {/* Header minimalista */}
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-gray-800">Painel Médico</h1>
          <div className="flex items-center text-gray-500 text-sm mt-1">
            Dr. {currentUser.nome} - {currentUser.especialidade || 'Clínico Geral'}
            <span className="ml-auto">{new Date().toLocaleDateString('pt-BR')} {new Date().toLocaleTimeString('pt-BR')}</span>
          </div>
        </div>

        {/* Modo Foco: Mostrar apenas o formulário quando estiver fazendo consulta */}
        {showEvolutionForm && pacienteAtualMedico ? (
          <div className="w-full">
              <Card className="shadow-md">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      Consulta: {pacienteAtualMedico.nome}
                    </h2>
                    <p className="text-gray-600">
                      {calcularIdade(pacienteAtualMedico.dataNascimento)} anos • {pacienteAtualMedico.sexo === 'M' ? 'Masculino' : pacienteAtualMedico.sexo === 'F' ? 'Feminino' : 'Outro'}
                    </p>
                    <div className="mt-1">
                      <span className="text-sm text-gray-500 font-mono">{pacienteAtualMedico.numeroProntuario}</span>
                    </div>
                  </div>
                <div className="flex gap-2">
                  <Button
                    label={`Ver Fila (${pacientesAguardandoMedico.length})`}
                    outlined
                    onClick={() => setShowFila(true)}
                    className="!bg-gray-100 !text-gray-700 !border-0 px-4 py-2 rounded-lg font-semibold transition-colors hover:!bg-blue-500 hover:!text-white"
                  />
                  <Button
                    label="Cancelar"
                    outlined
                    onClick={() => setShowEvolutionForm(false)}
                    className="!bg-gray-100 !text-gray-700 !border-0 px-6 py-2 rounded-lg font-semibold transition-colors hover:!bg-red-500 hover:!text-white"
                  />
                </div>
                </div>

                {/* Informações do Paciente */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <Panel header="Dados Pessoais" className="shadow-sm">
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-500">Nome:</span><span className="font-semibold text-gray-800">{pacienteAtualMedico.nome}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Idade:</span><span className="font-semibold text-gray-800">{calcularIdade(pacienteAtualMedico.dataNascimento)} anos</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Sexo:</span><span className="font-semibold text-gray-800">{pacienteAtualMedico.sexo === 'M' ? 'Masculino' : pacienteAtualMedico.sexo === 'F' ? 'Feminino' : 'Outro'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Telefone:</span><span className="font-semibold text-gray-800">{pacienteAtualMedico.telefone}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Endereço:</span><span className="font-semibold text-gray-800">{pacienteAtualMedico.endereco}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Contato Emergência:</span><span className="font-semibold text-gray-800">{pacienteAtualMedico.contatoEmergencia}</span>
                      </div>
                    </div>
                  </Panel>
                  <Panel header="Dados da Triagem" className="shadow-sm">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center mb-1">
                        <span className="text-gray-500">Prioridade:</span><span className={`${getPriorityColor(pacienteAtualMedico.corTriagem)} text-white px-2 py-1 rounded text-xs font-bold`}>{getPriorityName(pacienteAtualMedico.corTriagem)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Queixa Principal:</span><span className="font-semibold text-gray-900">{pacienteAtualMedico.queixaPrincipal || pacienteAtualMedico.motivoVisita}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Triagem realizada:</span><span className="font-semibold text-gray-900">{new Date(pacienteAtualMedico.horaFimTriagem).toLocaleString('pt-BR')}</span>
                      </div>
                      {pacienteAtualMedico.sinaisVitais && Object.keys(pacienteAtualMedico.sinaisVitais).length > 0 && (
                        <div>
                          <span className="text-gray-500 block">Sinais Vitais:</span>
                          <div className="space-y-0.5 mt-1">
                            {Object.entries(pacienteAtualMedico.sinaisVitais).map(([key, value]) => (
                              value && (
                                <div key={key} className="flex">
                                  <span className="text-gray-500">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).replace('Oxigenio', 'O₂')}:</span><span className="font-semibold text-gray-900">{value}</span>
                                </div>
                              )
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </Panel>
                </div>

                {/* Formulário de Evolução Clínica */}
                <div className="space-y-6">
                  <Panel header="Evolução Clínica" className="shadow-sm">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Queixa Atual
                        </label>
                        <InputTextarea
                          rows={3}
                          placeholder="Descreva a queixa atual do paciente..."
                          value={evolutionData.queixaAtual}
                          onChange={(e) => setEvolutionData({...evolutionData, queixaAtual: e.target.value})}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Exame Físico
                        </label>
                        <InputTextarea
                          rows={4}
                          placeholder="Descreva os achados do exame físico..."
                          value={evolutionData.exameFisico}
                          onChange={(e) => setEvolutionData({...evolutionData, exameFisico: e.target.value})}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Hipótese Diagnóstica
                        </label>
                        <InputTextarea
                          rows={3}
                          placeholder="Descreva a hipótese diagnóstica..."
                          value={evolutionData.hipoteseDiagnostica}
                          onChange={(e) => setEvolutionData({...evolutionData, hipoteseDiagnostica: e.target.value})}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Conduta
                        </label>
                        <InputTextarea
                          rows={3}
                          placeholder="Descreva a conduta adotada..."
                          value={evolutionData.conduta}
                          onChange={(e) => setEvolutionData({...evolutionData, conduta: e.target.value})}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </Panel>
                  <Panel header="Medicamentos" className="shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-semibold text-gray-800">Medicamentos</h4>
                      <Button
                        type="button"
                        label="Adicionar"
                        onClick={addMedicamento}
                        className="!bg-white !text-green-600 !border-0 !shadow-none !font-semibold hover:!bg-green-50 hover:!text-green-700 px-4 py-2 rounded-lg transition-colors"
                      />
                    </div>
                    {evolutionData.medicamentos.length === 0 ? (
                      <p className="text-gray-500 text-sm">Nenhum medicamento prescrito</p>
                    ) : (
                      <div className="space-y-4">
                        {evolutionData.medicamentos.map((med, index) => (
                          <Card key={med.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-3">
                              <h5 className="font-medium text-gray-800">Medicamento {index + 1}</h5>
                              <Button
                                label="Remover"
                                onClick={() => removeMedicamento(med.id)}
                                className="!bg-white !text-red-600 !border-0 !shadow-none !font-semibold hover:!bg-red-50 hover:!text-red-700 px-4 py-2 rounded-lg transition-colors"
                              />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                                <InputText
                                  value={med.nome}
                                  onChange={(e) => updateMedicamento(med.id, 'nome', e.target.value)}
                                  className="w-full"
                                  placeholder="Nome do medicamento"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Dosagem</label>
                                <InputText
                                  value={med.dosagem}
                                  onChange={(e) => updateMedicamento(med.id, 'dosagem', e.target.value)}
                                  className="w-full"
                                  placeholder="Ex: 500mg"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Posologia</label>
                                <InputText
                                  value={med.posologia}
                                  onChange={(e) => updateMedicamento(med.id, 'posologia', e.target.value)}
                                  className="w-full"
                                  placeholder="Ex: 1 comprimido 3x ao dia"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Duração</label>
                                <InputText
                                  value={med.duracao}
                                  onChange={(e) => updateMedicamento(med.id, 'duracao', e.target.value)}
                                  className="w-full"
                                  placeholder="Ex: 7 dias"
                                />
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                                <InputTextarea
                                  value={med.observacoes}
                                  onChange={(e) => updateMedicamento(med.id, 'observacoes', e.target.value)}
                                  className="w-full"
                                  placeholder="Observações sobre o medicamento"
                                  rows={2}
                                />
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </Panel>
                  <Panel header="Exames Solicitados" className="shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-semibold text-gray-800">Exames Solicitados</h4>
                      <Button
                        type="button"
                        label="Adicionar"
                        onClick={addExame}
                        className="!bg-white !text-green-600 !border-0 !shadow-none !font-semibold hover:!bg-green-50 hover:!text-green-700 px-4 py-2 rounded-lg transition-colors"
                      />
                    </div>
                    {evolutionData.exames.length === 0 ? (
                      <p className="text-gray-500 text-sm">Nenhum exame solicitado</p>
                    ) : (
                      <div className="space-y-4">
                        {evolutionData.exames.map((exame, index) => (
                          <Card key={exame.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-3">
                              <h5 className="font-medium text-gray-800">Exame {index + 1}</h5>
                              <Button
                                label="Remover"
                                onClick={() => removeExame(exame.id)}
                                className="!bg-white !text-red-600 !border-0 !shadow-none !font-semibold hover:!bg-red-50 hover:!text-red-700 px-4 py-2 rounded-lg transition-colors"
                              />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Exame</label>
                                <AutoComplete
                                  value={exame.nome}
                                  suggestions={exameSuggestions}
                                  completeMethod={(e) => {
                                    setExameSuggestions(
                                      principaisExames.filter(ex =>
                                        ex.toLowerCase().includes(e.query.toLowerCase())
                                      )
                                    );
                                  }}
                                  onChange={(e) => updateExame(exame.id, 'nome', e.value)}
                                  className="w-full"
                                  placeholder="Nome do exame"
                                  forceSelection={false}
                                  dropdown
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Urgência</label>
                                <Dropdown
                                  value={exame.urgencia}
                                  options={[
                                    { label: 'Normal', value: 'normal' },
                                    { label: 'Urgente', value: 'urgente' },
                                    { label: 'Emergencial', value: 'emergencial' }
                                  ]}
                                  onChange={(e) => updateExame(exame.id, 'urgencia', e.value)}
                                  className="w-full"
                                />
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Justificativa</label>
                                <InputTextarea
                                  value={exame.justificativa}
                                  onChange={(e) => updateExame(exame.id, 'justificativa', e.target.value)}
                                  className="w-full"
                                  placeholder="Justificativa para solicitação do exame"
                                  rows={2}
                                />
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </Panel>
                  <Panel header="Orientações e Encaminhamento" className="shadow-sm">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Orientações ao Paciente
                        </label>
                        <InputTextarea
                          rows={4}
                          placeholder="Orientações sobre cuidados, retorno, etc..."
                          value={evolutionData.orientacoes}
                          onChange={(e) => setEvolutionData({...evolutionData, orientacoes: e.target.value})}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Encaminhamento
                        </label>
                        <InputTextarea
                          rows={3}
                          placeholder="Especialidade ou serviço para encaminhamento..."
                          value={evolutionData.encaminhamento}
                          onChange={(e) => setEvolutionData({...evolutionData, encaminhamento: e.target.value})}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Data de Retorno
                        </label>
                        <InputText
                          type="date"
                          value={evolutionData.dataRetorno}
                          onChange={(e) => setEvolutionData({...evolutionData, dataRetorno: e.target.value})}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Status Final
                        </label>
                        <Dropdown
                          value={evolutionData.statusFinal}
                          options={[
                            { label: 'Atendimento Concluído', value: 'atendimento_concluido' },
                            { label: 'Aguardando Exame', value: 'aguardando_exame' },
                            { label: 'Internado', value: 'internado' },
                            { label: 'Encaminhado', value: 'encaminhado' }
                          ]}
                          onChange={(e) => setEvolutionData({...evolutionData, statusFinal: e.value})}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </Panel>
                  <Divider />
                  <div className="flex justify-end gap-4 pt-2">
                    <Button
                      label="Cancelar"
                      outlined
                      onClick={() => setShowEvolutionForm(false)}
                      className="!bg-gray-100 !text-gray-700 !border-0 px-6 py-2 rounded-lg font-semibold transition-colors hover:!bg-red-500 hover:!text-white"
                    />
                    <Button
                      label="Finalizar Consulta"
                      onClick={handleFinishConsultation}
                      className="bg-green-500 hover:bg-green-600 border-0 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                    />
                  </div>
              </div>
            </Card>
          </div>
        ) : (
          /* Modo Lista: Mostrar fila quando não estiver fazendo consulta */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lista de Pacientes Aguardando */}
            <div className="lg:col-span-1">
              <Card className="shadow-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Aguardando Consulta ({pacientesAguardandoMedico.length})
                  </h2>
                  <Button
                    label="Chamar Próximo"
                    icon="pi pi-user-plus"
                    disabled={pacientesAguardandoMedico.length === 0}
                    onClick={handleCallNextPatient}
                    className="bg-blue-600 hover:bg-blue-700 border-0 text-white"
                  />
                </div>
                {pacientesAguardandoMedico.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Nenhum paciente aguardando consulta</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pacientesAguardandoMedico.map((patient, index) => {
                      const corInfo = getPriorityColor(patient.corTriagem);
                      // Ajuste do sexo
                      let sexoLabel = 'Outro';
                      if (patient.sexo === 'M') sexoLabel = 'Masculino';
                      else if (patient.sexo === 'F') sexoLabel = 'Feminino';
                      return (
                        <div
                          key={patient.id}
                          className={`p-4 border rounded-lg transition-colors min-w-[320px] w-full max-w-lg ${
                            pacienteAtualMedico?.id === patient.id
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
                                  Aguardando há {obterTempoEspera(patient.horaFimTriagem || patient.horaCadastro)}
                                </div>
                              </div>
                              <div className="flex items-center text-sm text-gray-500 space-x-2 mt-1">
                                <span>{calcularIdade(patient.dataNascimento)} anos</span>
                                <span>•</span>
                                <span>{sexoLabel}</span>
                              </div>
                              <div className="mt-1">
                                <span className="text-xs text-gray-400 font-mono">{patient.numeroProntuario}</span>
                              </div>
                            </div>
                          </div>
                          {/* Dados da triagem removidos */}
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </div>

            {/* Área de Consulta Vazia */}
            <div className="lg:col-span-2">
              <Card className="shadow-md">
                <div className="text-center py-12">
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    Nenhum Paciente em Consulta
                  </h3>
                  <p className="text-gray-500">
                    Clique em "Chamar Próximo" para iniciar uma consulta
                  </p>
                </div>
              </Card>
            </div>
          </div>
        )}

      {/* Modal de impressão */}
      <Dialog
        header="Resumo da Consulta"
        visible={showPrintModal}
        style={{ width: '700px', maxWidth: '95vw' }}
        onHide={() => setShowPrintModal(false)}
        modal
        closable
        className="print-modal"
        footer={
          <div className="flex justify-end gap-2">
              <Button label="Fechar" onClick={() => setShowPrintModal(false)} className="!bg-gray-100 !text-gray-700 !border-0 px-4 py-2 rounded-lg font-semibold hover:!bg-red-500 hover:!text-white" />
              <Button label="Imprimir" onClick={() => window.print()} className="!bg-green-600 !text-white !border-0 px-4 py-2 rounded-lg font-semibold hover:!bg-green-700" />
          </div>
        }
      >
        {consultaParaImpressao && (
          <div className="space-y-4 p-2">
            <div>
              <h2 className="text-xl font-bold mb-1">Paciente: {consultaParaImpressao.paciente.nome}</h2>
              <div className="text-sm text-gray-700">
                <span><b>Idade:</b> {calcularIdade(consultaParaImpressao.paciente.dataNascimento)} anos</span> {' | '}
                <span><b>Sexo:</b> {consultaParaImpressao.paciente.sexo === 'M' ? 'Masculino' : consultaParaImpressao.paciente.sexo === 'F' ? 'Feminino' : 'Outro'}</span> {' | '}
                <span><b>Prontuário:</b> {consultaParaImpressao.paciente.numeroProntuario}</span>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">Evolução Clínica</h3>
              <div className="text-gray-700 text-sm">
                <div><b>Queixa Atual:</b> {consultaParaImpressao.queixaAtual}</div>
                <div><b>Exame Físico:</b> {consultaParaImpressao.exameFisico}</div>
                <div><b>Hipótese Diagnóstica:</b> {consultaParaImpressao.hipoteseDiagnostica}</div>
                <div><b>Conduta:</b> {consultaParaImpressao.conduta}</div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">Medicamentos</h3>
              {consultaParaImpressao.medicamentos.length === 0 ? (
                <div className="text-gray-500 text-sm">Nenhum medicamento prescrito</div>
              ) : (
                <ul className="list-disc pl-5 text-sm">
                  {consultaParaImpressao.medicamentos.map((med, idx) => (
                    <li key={med.id}><b>{med.nome}</b> - {med.dosagem}, {med.posologia}, {med.duracao} {med.observacoes && `(${med.observacoes})`}</li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">Exames Solicitados</h3>
              {consultaParaImpressao.exames.length === 0 ? (
                <div className="text-gray-500 text-sm">Nenhum exame solicitado</div>
              ) : (
                <ul className="list-disc pl-5 text-sm">
                  {consultaParaImpressao.exames.map((exame, idx) => (
                    <li key={exame.id}><b>{exame.nome}</b> - Urgência: {exame.urgencia}, Justificativa: {exame.justificativa}</li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">Orientações e Encaminhamento</h3>
              <div className="text-gray-700 text-sm">
                <div><b>Orientações:</b> {consultaParaImpressao.orientacoes}</div>
                <div><b>Encaminhamento:</b> {consultaParaImpressao.encaminhamento}</div>
                <div><b>Data de Retorno:</b> {consultaParaImpressao.dataRetorno}</div>
                <div><b>Status Final:</b> {consultaParaImpressao.statusFinal}</div>
              </div>
            </div>
            <div className="text-xs text-gray-400 mt-4">Impresso em: {new Date().toLocaleString('pt-BR')}</div>
          </div>
        )}
      </Dialog>

        {/* Modal da Fila de Pacientes */}
        <Dialog
          header="Fila de Pacientes Aguardando Consulta"
          visible={showFila}
          style={{ width: '90vw', maxWidth: '1200px' }}
          onHide={() => setShowFila(false)}
          className="rounded-xl"
        >
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">
                Pacientes Aguardando Consulta ({pacientesAguardandoMedico.length})
              </h3>
              <Button
                label="Chamar Próximo"
                disabled={pacientesAguardandoMedico.length === 0}
                onClick={() => {
                  handleCallNextPatient();
                  setShowFila(false);
                }}
                className="bg-blue-600 hover:bg-blue-700 border-0 text-white"
              />
            </div>
            
            {pacientesAguardandoMedico.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Nenhum paciente aguardando consulta</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pacientesAguardandoMedico.map((patient, index) => {
                  const corInfo = getPriorityColor(patient.corTriagem);
                  let sexoLabel = 'Outro';
                  if (patient.sexo === 'M') sexoLabel = 'Masculino';
                  else if (patient.sexo === 'F') sexoLabel = 'Feminino';
                  return (
                    <div
                      key={patient.id}
                      className={`p-4 border rounded-lg transition-colors ${
                        pacienteAtualMedico?.id === patient.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start min-w-0">
                        <div className="flex items-center gap-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-lg px-3 py-1 rounded-lg flex-shrink-0 mt-1 shadow-sm">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                          <span className="font-mono">#{index + 1}</span>
                        </div>
                        <div className="ml-4 flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between min-w-0">
                            <h3 className="font-medium text-gray-800 text-base sm:text-lg min-w-0" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis'}}>{patient.nome}</h3>
                            <div className="text-xs text-gray-500 whitespace-nowrap sm:ml-4 mt-1 sm:mt-0 text-right">
                              Aguardando há {obterTempoEspera(patient.horaFimTriagem || patient.horaCadastro)}
                            </div>
                          </div>
                          <div className="flex items-center text-sm text-gray-500 space-x-2 mt-1">
                            <span>{calcularIdade(patient.dataNascimento)} anos</span>
                            <span>•</span>
                            <span>{sexoLabel}</span>
                          </div>
                          <div className="mt-1">
                            <span className="text-xs text-gray-400 font-mono">{patient.numeroProntuario}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Dialog>
      </div>
    </div>
  );
};

export default PainelMedico;
