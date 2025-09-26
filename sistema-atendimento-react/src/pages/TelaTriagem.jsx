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
import { Slider } from "primereact/slider";
import { Panel } from "primereact/panel";
import { Dialog } from "primereact/dialog";

// Função utilitária para calcular idade a partir de string
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

// Função para imprimir apenas a área da etiqueta
function printEtiqueta() {
  const conteudo = document.getElementById('etiqueta-pulseira');
  if (!conteudo) return;
  const janela = window.open('', '', 'width=400,height=220');
  janela.document.write(`
    <html>
      <head>
        <title>Imprimir Etiqueta</title>
        <style>
          @media print {
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              background: #fff !important;
            }
            .etiqueta-print {
              box-shadow: none !important;
              border: none !important;
              margin: 0 !important;
              width: 280px !important;
              min-height: 80px;
              max-width: 100vw;
              page-break-inside: avoid;
            }
          }
          body { font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 0; background: #fff; }
          .etiqueta-print {
            padding: 10px 12px;
            border: 1px solid #bbb;
            border-radius: 7px;
            text-align: left;
            background: #fff;
            width: 280px;
            margin: 0;
            box-shadow: none;
          }
          .etiqueta-print .titulo {
            font-weight: bold;
            font-size: 15px;
            margin-bottom: 6px;
            letter-spacing: 0.2px;
            text-align: left;
          }
          .etiqueta-print .linha {
            font-size: 13px;
            color: #222;
            margin-bottom: 2px;
            text-align: left;
            line-height: 1.2;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .etiqueta-print .linha b {
            font-weight: 600;
            margin-right: 2px;
          }
          .etiqueta-print .data {
            font-size: 10px;
            color: #888;
            margin-top: 4px;
            text-align: left;
          }
        </style>
      </head>
      <body onload="window.print();window.close()">
        <div class="etiqueta-print">${conteudo.innerHTML}</div>
      </body>
    </html>
  `);
  janela.document.close();
}

const TelaTriagem = () => {
  const { 
    obterPacientesAguardandoTriagem, 
    chamarProximoPacienteTriagem,
    finalizarTriagem,
    pacienteAtualTriagem,
    currentUser,
    recarregarDadosBackend
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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showEtiquetaModal, setShowEtiquetaModal] = useState(false);
  const [pacienteEtiqueta, setPacienteEtiqueta] = useState(null);
  const [showFila, setShowFila] = useState(false);

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

  // Recarregar dados do backend periodicamente - DESABILITADO TEMPORARIAMENTE
  // useEffect(() => {
  //   if (!currentUser) return;

  //   const interval = setInterval(() => {
  //     recarregarDadosBackend();
  //   }, 30000); // Recarregar a cada 30 segundos para evitar conflitos

  //   return () => clearInterval(interval);
  // }, [currentUser, recarregarDadosBackend]);

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

  const handleCallNextPatient = async () => {

    // Se há pacientes aguardando, chamar o primeiro
    if (pacientesAguardandoTriagem.length > 0) {
      const primeiroPaciente = pacientesAguardandoTriagem[0];

      try {
        const result = await chamarProximoPacienteTriagem(primeiroPaciente.id);

        if (result) {
          showToast(`Paciente ${result.nome} chamado para triagem`);
          setShowTriageForm(true);
          setShowFila(false);
        } else {

          showError('Erro ao chamar paciente');
        }
      } catch (error) {
        console.error('Erro ao chamar paciente:', error);
        showError('Erro ao chamar paciente: ' + error.message);
      }
    } else {

      showError('Nenhum paciente na fila de triagem');
    }
  };

  const handleSaveTriage = async () => {
    if (!pacienteAtualTriagem) return;

    try {

      const resultado = await finalizarTriagem(pacienteAtualTriagem.id, triageData);
      
      if (resultado) {
        showToast(`Triagem de ${pacienteAtualTriagem.nome} finalizada! Classificação: ${triageData.corTriagem.toUpperCase()}`);
        setShowSuccessModal(true);
        setPacienteEtiqueta({
          nome: pacienteAtualTriagem.nome,
          dataNascimento: pacienteAtualTriagem.dataNascimento,
          sexo: pacienteAtualTriagem.sexo,
          numeroProntuario: pacienteAtualTriagem.numeroProntuario,
          convenio: pacienteAtualTriagem.convenio || '',
          dataHora: new Date().toLocaleString('pt-BR')
        });
        // Não fechar o formulário ainda
      } else {
        showError('Erro ao finalizar triagem - paciente não encontrado');
      }
    } catch (error) {
      console.error('Erro ao finalizar triagem:', error);
      showError('Erro ao finalizar triagem: ' + error.message);
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
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 pt-2">
      <div className="max-w-7xl mx-auto">
        {/* Header minimalista */}
        <div className="mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Triagem de Pacientes</h1>
          <div className="flex flex-col sm:flex-row sm:items-center text-gray-500 text-xs sm:text-sm mt-1 gap-1 sm:gap-0">
            <span>{currentUser?.nome} - Enfermeira</span>
            <span className="sm:ml-auto">{new Date().toLocaleDateString('pt-BR')} {new Date().toLocaleTimeString('pt-BR')}</span>
          </div>
        </div>

        {/* Modo Foco: Mostrar apenas o formulário quando estiver fazendo triagem */}
        {showTriageForm && pacienteAtualTriagem ? (
          <div className="w-full">
            <Card className="shadow-md">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                    Triagem: {pacienteAtualTriagem.nome}
                  </h2>
                  <p className="text-gray-600 text-sm sm:text-base">
                    {calcularIdade(pacienteAtualTriagem.dataNascimento)} anos • {pacienteAtualTriagem.sexo === 'M' ? 'Masculino' : 'Feminino'}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Motivo: {pacienteAtualTriagem.motivoVisita}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    label={`Ver Fila (${pacientesAguardandoTriagem.length})`}
                    outlined
                    onClick={() => setShowFila(true)}
                    className="!bg-gray-100 !text-gray-700 !border-0 px-3 sm:px-4 py-2 rounded-lg font-semibold transition-colors hover:!bg-blue-500 hover:!text-white text-sm"
                  />
                  <Button
                    label="Finalizar Triagem"
                    severity="success"
                    onClick={handleSaveTriage}
                    className="!bg-green-600 !text-white !border-0 px-3 sm:px-6 py-2 rounded-lg font-semibold transition-colors hover:!bg-green-700 text-sm"
                  />
                </div>
              </div>

              {/* Formulário de Triagem */}
              <form className="space-y-4 sm:space-y-6">
                {/* Classificação de Prioridade */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Classificação de Prioridade *</label>
                  <Dropdown
                    value={triageData.corTriagem}
                    onChange={(e) => handleDropdownChange(e, 'corTriagem')}
                    options={opcoesCorTriagem}
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Selecione a classificação"
                    className="w-full"
                  />
                </div>

                {/* Queixa Principal */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Queixa Principal *</label>
                  <InputTextarea
                    value={triageData.queixaPrincipal}
                    onChange={(e) => handleInputChange(e)}
                    name="queixaPrincipal"
                    rows="3"
                    className="w-full"
                    placeholder="Descreva a queixa principal do paciente..."
                  />
                </div>

                {/* Nível de Dor */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nível de Dor: {triageData.nivelDor}/10
                      </label>
                      <Slider
                        value={triageData.nivelDor}
                    onChange={(e) => setTriageData(prev => ({ ...prev, nivelDor: e.value }))}
                        min={0}
                        max={10}
                        step={1}
                        className="w-full"
                      />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Sem dor</span>
                    <span>Dor leve</span>
                    <span>Dor moderada</span>
                    <span>Dor intensa</span>
                  </div>
                </div>

                {/* Nível de Consciência */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nível de Consciência</label>
                  <Dropdown
                    value={triageData.nivelConsciencia}
                    onChange={(e) => handleDropdownChange(e, 'nivelConsciencia')}
                    options={opcoesNivelConsciencia}
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Selecione o nível de consciência"
                    className="w-full"
                  />
                </div>

                {/* Sinais Vitais */}
                <Panel header="Sinais Vitais" className="mb-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pressão Arterial</label>
                      <InputText
                        value={triageData.sinaisVitais.pressaoArterial}
                        onChange={(e) => handleSinaisVitaisChange('pressaoArterial', e.target.value)}
                        placeholder="120/80 mmHg"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Temperatura</label>
                      <InputText
                        value={triageData.sinaisVitais.temperatura}
                        onChange={(e) => handleSinaisVitaisChange('temperatura', e.target.value)}
                        placeholder="36.5°C"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Freq. Cardíaca</label>
                      <InputText
                        value={triageData.sinaisVitais.frequenciaCardiaca}
                        onChange={(e) => handleSinaisVitaisChange('frequenciaCardiaca', e.target.value)}
                        placeholder="80 bpm"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Saturação O₂</label>
                      <InputText
                        value={triageData.sinaisVitais.saturacaoOxigenio}
                        onChange={(e) => handleSinaisVitaisChange('saturacaoOxigenio', e.target.value)}
                        placeholder="98%"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Freq. Respiratória</label>
                      <InputText
                        value={triageData.sinaisVitais.frequenciaRespiratoria}
                        onChange={(e) => handleSinaisVitaisChange('frequenciaRespiratoria', e.target.value)}
                        placeholder="16 irpm"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Peso</label>
                      <InputText
                        value={triageData.sinaisVitais.peso}
                        onChange={(e) => handleSinaisVitaisChange('peso', e.target.value)}
                        placeholder="70 kg"
                        className="w-full"
                      />
                    </div>
                  </div>
                </Panel>

                {/* Observações */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Observações da Triagem</label>
                  <InputTextarea
                    value={triageData.observacoesTriagem}
                    onChange={(e) => handleInputChange(e)}
                    name="observacoesTriagem"
                    rows="4"
                    className="w-full"
                    placeholder="Observações adicionais sobre o estado do paciente..."
                  />
                </div>
              </form>
            </Card>
          </div>
        ) : (
          // Modo Normal: Mostrar fila de pacientes aguardando triagem
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
            {/* Fila de Pacientes Aguardando */}
            <div className="xl:col-span-2">
              <Card className="shadow-md h-fit">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Fila de Triagem</h2>
                    <p className="text-gray-600 text-sm sm:text-base">
                      {pacientesAguardandoTriagem.length} paciente(s) aguardando triagem
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    label="Chamar Próximo"
                      icon="pi pi-user-plus"
                      onClick={handleCallNextPatient}
                    disabled={pacientesAguardandoTriagem.length === 0}
                      className="!bg-blue-600 !text-white !border-0 px-4 py-2 rounded-lg font-semibold transition-colors hover:!bg-blue-700 text-sm"
                    />
                    <Button
                      label="Atualizar"
                      outlined
                      icon="pi pi-refresh"
                      onClick={() => window.location.reload()}
                      className="!bg-gray-100 !text-gray-700 !border-0 px-4 py-2 rounded-lg font-semibold transition-colors hover:!bg-gray-200 text-sm"
                    />
                  </div>
                </div>
                
                {pacientesAguardandoTriagem.length > 0 ? (
                  <div className="space-y-3">
                    {pacientesAguardandoTriagem.map((paciente, index) => (
                      <div
                        key={paciente.id}
                        className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                        onClick={() => {

                          const result = chamarProximoPacienteTriagem(paciente.id);

                          if (result) {
                            setShowTriageForm(true);
                          }
                        }}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                          <div className="flex items-center gap-3">
                            <div className="bg-blue-500 text-white text-lg sm:text-xl font-bold rounded-full flex items-center justify-center" style={{ width: 50, height: 50 }}>
                              #{index + 1}
                            </div>
                            <div>
                              <div className="font-semibold text-sm sm:text-base text-gray-800">
                                {paciente.nome}
                              </div>
                              <div className="text-xs sm:text-sm text-gray-500">
                                {calcularIdade(paciente.dataNascimento)} anos • {paciente.sexo === 'M' ? 'M' : 'F'} • {obterTempoEspera(paciente.horaCadastro)}
                              </div>
                            </div>
                            </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <Tag
                              value="Aguardando Triagem"
                              severity="warning"
                              className="text-xs"
                            />
                            <Button
                              label="Chamar"
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                chamarProximoPacienteTriagem(paciente.id);
                                setShowTriageForm(true);
                              }}
                              className="!bg-blue-600 !text-white !border-0 px-3 py-1 rounded-lg font-semibold transition-colors hover:!bg-blue-700 text-xs"
                            />
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-600 truncate">
                          Motivo: {paciente.motivoVisita}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">Fila Vazia</h3>
                    <p className="text-gray-500 text-center">
                      Nenhum paciente aguardando triagem no momento.
                    </p>
                  </div>
                )}
              </Card>
            </div>

            {/* Estatísticas Rápidas */}
            <div className="xl:col-span-1">
              <Card className="shadow-md h-fit">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Estatísticas</h3>
                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="text-2xl font-bold text-blue-600 mb-1">{pacientesAguardandoTriagem.length}</div>
                    <div className="text-gray-700 text-sm font-medium">Aguardando Triagem</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {pacientesAguardandoTriagem.filter(p => p.sexo === 'F').length}
                    </div>
                    <div className="text-gray-700 text-sm font-medium">Pacientes Femininos</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {pacientesAguardandoTriagem.filter(p => p.sexo === 'M').length}
                    </div>
                    <div className="text-gray-700 text-sm font-medium">Pacientes Masculinos</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Modal de Fila de Triagem */}
        <Dialog
          visible={showFila}
          onHide={() => setShowFila(false)}
          header="Fila de Pacientes Aguardando Triagem"
          style={{ width: '90vw', maxWidth: 600 }}
          className="rounded-xl"
        >
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {pacientesAguardandoTriagem.map((paciente, index) => (
              <div
                key={paciente.id}
                className="bg-gray-50 rounded-lg p-3 border border-gray-200 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500 text-white text-lg font-bold rounded-full flex items-center justify-center" style={{ width: 50, height: 50 }}>
                    #{index + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">{paciente.nome}</div>
                    <div className="text-sm text-gray-500">
                      {calcularIdade(paciente.dataNascimento)} anos • {paciente.sexo === 'M' ? 'M' : 'F'} • {obterTempoEspera(paciente.horaCadastro)}
                    </div>
                  </div>
                </div>
                <Button
                  label="Chamar"
                  size="small"
                  onClick={() => {
                    chamarProximoPacienteTriagem(paciente.id);
                    setShowTriageForm(true);
                    setShowFila(false);
                  }}
                  className="!bg-blue-600 !text-white !border-0 px-3 py-1 rounded-lg font-semibold transition-colors hover:!bg-blue-700"
                />
              </div>
            ))}
          </div>
        </Dialog>

        {/* Modal de Sucesso */}
        <Dialog
          visible={showSuccessModal}
          onHide={() => setShowSuccessModal(false)}
          header="Triagem Finalizada"
          style={{ width: '90vw', maxWidth: 400 }}
          className="rounded-xl"
        >
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {pacienteAtualTriagem?.nome}
              </h3>
              <p className="text-gray-600 mb-3">
                Classificação: <span className={`font-medium ${getPriorityColor(triageData.corTriagem)}`}>
                  {getPriorityName(triageData.corTriagem)}
                </span>
              </p>
              <p className="text-sm text-gray-500">
                Paciente direcionado para atendimento médico.
              </p>
          </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowEtiquetaModal(true);
                  setShowSuccessModal(false);
                }}
                className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
              >
                Imprimir Etiqueta
              </button>
              <button
                onClick={() => {
              setShowSuccessModal(false);
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
                }}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </Dialog>

        {/* Modal de Etiqueta */}
        <Dialog
          visible={showEtiquetaModal}
          onHide={() => setShowEtiquetaModal(false)}
          header="Etiqueta da Pulseira"
          style={{ width: '90vw', maxWidth: 400 }}
          className="rounded-xl"
          footer={
            <div className="flex justify-end gap-2">
              <Button
                label="Imprimir"
                icon="pi pi-print"
                onClick={printEtiqueta}
                className="!bg-blue-600 !text-white !border-0 px-4 py-2 rounded-lg font-semibold transition-colors hover:!bg-blue-700"
              />
              <Button
                label="Fechar"
                outlined
                onClick={() => {
                  setShowEtiquetaModal(false);
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
                }}
                className="!bg-gray-100 !text-gray-700 !border-0 px-4 py-2 rounded-lg font-semibold transition-colors hover:!bg-gray-200"
              />
            </div>
          }
        >
          {pacienteEtiqueta && (
            <div id="etiqueta-pulseira" className="bg-white p-4 border border-gray-300 rounded-lg">
              <div className="titulo">{pacienteEtiqueta.nome}</div>
              <div className="linha">
                <b>Idade:</b> {calcularIdade(pacienteEtiqueta.dataNascimento)} anos | <b>Sexo:</b> {pacienteEtiqueta.sexo === 'M' ? 'M' : 'F'}
              </div>
              <div className="linha">
                <b>Classificação:</b> {getPriorityName(triageData.corTriagem)}
                          </div>
              <div className="linha">
                <b>Dor:</b> {triageData.nivelDor}/10 | <b>Consciência:</b> {triageData.nivelConsciencia}
                        </div>
              <div className="data">
                {new Date().toLocaleString('pt-BR')} | {currentUser?.nome}
              </div>
              </div>
            )}
        </Dialog>
      </div>
    </div>
  );
};

export default TelaTriagem; 