import React, { useState, useEffect, useRef } from "react";
import { useSistemaAtendimento } from "../context/HospitalContext";
import { useToast } from "../context/ToastProvider";
import LoadingSpinner from "../components/LoadingSpinner";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";

import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Card } from "primereact/card";
import { Divider } from "primereact/divider";
import { Tag } from "primereact/tag";
import { PrimeIcons } from "primereact/api";
import { Dialog } from "primereact/dialog";

const TelaCadastro = () => {
  const { cadastrarPaciente, currentUser } = useSistemaAtendimento();
  const { success: showToast, error: showError } = useToast();
  
  const [formData, setFormData] = useState({
    // Campos obrigatórios
    nome: '',
    dataNascimento: '',
    cpf: '',
    rg: '',
    nomeMae: '',
    sexo: '',
    endereco: '',
    telefone: '',
    contatoEmergencia: '',
    
    // Campos opcionais
    email: '',
    convenio: 'SUS',
    numeroCarteirinha: '',
    motivoVisita: '',
    
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pacienteCadastrado, setPacienteCadastrado] = useState(null);
  const [formTouched, setFormTouched] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState(null);
  const [showFilaSenhas, setShowFilaSenhas] = useState(false);
  const [showCadastroForm, setShowCadastroForm] = useState(false);
  const [pacientesAguardandoCadastro, setPacientesAguardandoCadastro] = useState([]);
  const printRef = useRef();

  const [cep, setCep] = useState("");
  const [isCepLoading, setIsCepLoading] = useState(false);

  // Verificar se o usuário está logado e tem acesso
  useEffect(() => {
    if (!currentUser) {
      return;
    }
    
    if (currentUser.tipo !== 'recepcionista' && currentUser.tipo !== 'admin') {
      showError('Acesso negado. Apenas recepcionistas e administradores podem acessar este painel.');
      return;
    }
  }, [currentUser, showError]);

  // Carregar pacientes aguardando cadastro (senhas aguardando)
  useEffect(() => {
    const carregarPacientesAguardando = () => {
      const todasSenhas = JSON.parse(localStorage.getItem('senhas') || '[]');
      const senhasAguardando = todasSenhas
        .filter(s => s.status === 'aguardando')
        .sort((a, b) => {
          // Ordenar: prioridade primeiro, depois por hora de geração
          if (a.tipo !== b.tipo) {
            return a.tipo === 'prioridade' ? -1 : 1;
          }
          return new Date(a.horaGeracao) - new Date(b.horaGeracao);
        });
      
      setPacientesAguardandoCadastro(senhasAguardando);
    };

    carregarPacientesAguardando();
    const interval = setInterval(carregarPacientesAguardando, 3000);
    return () => clearInterval(interval);
  }, []);

  // Opções para dropdowns
  const opcoesSexo = [
    { value: 'M', label: 'Masculino' },
    { value: 'F', label: 'Feminino' },
    { value: 'O', label: 'Outro' }
  ];

  const opcoesConvenio = [
    { value: 'SUS', label: 'SUS' },
    { value: 'Particular', label: 'Particular' },
    { value: 'Unimed', label: 'Unimed' },
    { value: 'Amil', label: 'Amil' },
    { value: 'SulAmérica', label: 'SulAmérica' },
    { value: 'Bradesco Saúde', label: 'Bradesco Saúde' },
    { value: 'Outro', label: 'Outro' }
  ];

  // Função para classificação automática do motivo da visita
  const classificarMotivoVisita = (motivoVisita) => {
    if (!motivoVisita) return 'verde';
    
    const motivo = motivoVisita.toLowerCase();

    const motivosVermelhos = [
      "dor no peito", "infarto", "avc", "acidente vascular cerebral",
      "parada cardíaca", "convulsão", "desmaio", "sangramento intenso",
      "trauma craniano", "queimadura grave", "falta de ar",
      "dificuldade para respirar", "choque", "perda de consciência",
      "fratura exposta", "hemorragia", "emergência", "urgente", "grave"
    ];

    const motivosAmarelos = [
      "febre alta", "vômito", "diarreia", "dor abdominal", "fratura",
      "luxação", "corte profundo", "queimadura", "intoxicação", "alergia",
      "asma", "hipertensão", "diabetes descompensada", "dor de cabeça intensa",
      "tontura", "vertigem", "nausea", "moderado", "médio"
    ];

    for (const palavra of motivosVermelhos) {
      if (motivo.includes(palavra)) return "vermelho";
    }

    for (const palavra of motivosAmarelos) {
      if (motivo.includes(palavra)) return "amarelo";
    }

    return "verde";
  };

  const obterNomePrioridade = (prioridade) => {
    const nomes = {
      vermelho: "🔴 VERMELHO - Urgente (Atendimento Imediato)",
      amarelo: "🟡 AMARELO - Moderado (Espera Média)",
      verde: "🟢 VERDE - Leve (Pode Esperar)",
    };
    return nomes[prioridade] || "⚪ Não Classificado";
  };

  const getTagSeverity = (prioridade) => {
    switch (prioridade) {
      case 'vermelho': return 'danger';
      case 'amarelo': return 'warning';
      case 'verde': return 'success';
      default: return 'info';
    }
  };

  const obterTempoEspera = (horaGeracao) => {
    if (!horaGeracao) return "N/A";
    
    const referencia = new Date(horaGeracao);
    const agora = new Date();
    const diffMs = agora - referencia;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    
    if (diffHours > 0) {
      return `${diffHours}h ${mins}min`;
    }
    return `${mins}min`;
  };

  const obterCorTipo = (tipo) => {
    return tipo === 'prioridade' 
      ? { bg: 'bg-red-500', text: 'text-white', nome: 'PRIORIDADE' }
      : { bg: 'bg-green-500', text: 'text-white', nome: 'NORMAL' };
  };

  const formatarHora = (dataString) => {
    return new Date(dataString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleChamarPaciente = (senha) => {
    setSenhaAtual(senha);
    setShowFilaSenhas(false);
    setShowCadastroForm(true);
    showToast(`Iniciando cadastro para senha ${senha.prefixo}${senha.numero.toString().padStart(3, '0')}`);
  };

  const handleChamarProximoPaciente = () => {
    if (pacientesAguardandoCadastro.length === 0) {
      showError('Nenhum paciente aguardando cadastro');
      return;
    }

    const proximaSenha = pacientesAguardandoCadastro[0];
    
    // Marcar senha como chamada
    const todasSenhas = JSON.parse(localStorage.getItem('senhas') || '[]');
    const senhasAtualizadas = todasSenhas.map(s => 
      s.id === proximaSenha.id ? { ...s, status: 'chamada', horaChamada: new Date().toISOString() } : s
    );
    localStorage.setItem('senhas', JSON.stringify(senhasAtualizadas));
    
    setSenhaAtual(proximaSenha);
    setShowCadastroForm(true);
    showToast(`Iniciando cadastro para senha ${proximaSenha.prefixo}${proximaSenha.numero.toString().padStart(3, '0')}`);
  };

  const limparSenhaAtual = () => {
    setSenhaAtual(null);
    setShowCadastroForm(false);
  };

  const validateForm = () => {
    const newErrors = {};

    // Validação do nome (obrigatório)
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome completo é obrigatório';
    } else if (formData.nome.trim().length < 3) {
      newErrors.nome = 'Nome deve ter pelo menos 3 caracteres';
    }

    // Validação da data de nascimento (obrigatório)
    if (!formData.dataNascimento) {
      newErrors.dataNascimento = 'Data de nascimento é obrigatória';
    } else {
      const dataNasc = new Date(formData.dataNascimento);
      const hoje = new Date();
      const idade = hoje.getFullYear() - dataNasc.getFullYear();
      if (idade < 0 || idade > 150) {
        newErrors.dataNascimento = 'Data de nascimento inválida';
      }
    }

    // Validação do CPF (obrigatório)
    if (!formData.cpf.trim()) {
      newErrors.cpf = 'CPF é obrigatório';
    } else if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(formData.cpf)) {
      newErrors.cpf = 'CPF deve estar no formato 000.000.000-00';
    }

    // Validação do RG (obrigatório)
    if (!formData.rg.trim()) {
      newErrors.rg = 'RG é obrigatório';
    }

    // Validação do nome da mãe (obrigatório)
    if (!formData.nomeMae.trim()) {
      newErrors.nomeMae = 'Nome da mãe é obrigatório';
    } else if (formData.nomeMae.trim().length < 3) {
      newErrors.nomeMae = 'Nome da mãe deve ter pelo menos 3 caracteres';
    }

    // Validação do sexo (obrigatório)
    if (!formData.sexo) {
      newErrors.sexo = 'Sexo é obrigatório';
    }

    // Validação do endereço (obrigatório)
    if (!formData.endereco.trim()) {
      newErrors.endereco = 'Endereço é obrigatório';
    }

    // Validação do telefone (obrigatório)
    if (!formData.telefone.trim()) {
      newErrors.telefone = 'Telefone é obrigatório';
    } else if (!/^\(\d{2}\) \d{5}-\d{4}$/.test(formData.telefone)) {
      newErrors.telefone = 'Telefone deve estar no formato (00) 00000-0000';
    }

    // Validação do contato de emergência (obrigatório)
    if (!formData.contatoEmergencia.trim()) {
      newErrors.contatoEmergencia = 'Contato de emergência é obrigatório';
    } else if (!/^\(\d{2}\) \d{5}-\d{4}$/.test(formData.contatoEmergencia)) {
      newErrors.contatoEmergencia = 'Telefone deve estar no formato (00) 00000-0000';
    }

    // Validação do motivo da visita (obrigatório)
    if (!formData.motivoVisita.trim()) {
      newErrors.motivoVisita = 'Motivo da visita é obrigatório';
    } else if (formData.motivoVisita.trim().length < 3) {
      newErrors.motivoVisita = 'Motivo da visita deve ter pelo menos 3 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpar erro do campo quando o usuário começa a digitar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Marcar formulário como tocado
    if (!formTouched) {
      setFormTouched(true);
    }
  };

  const handleDropdownChange = (e, fieldName) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: e.value
    }));
    
    // Limpar erro do campo
    if (errors[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: ''
      }));
    }

    // Marcar formulário como tocado
    if (!formTouched) {
      setFormTouched(true);
    }
  };

  const formatCPF = (value) => {
    const v = value.replace(/\D/g, '');
    return v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatPhone = (value) => {
    const v = value.replace(/\D/g, '');
    return v.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  // Função para buscar endereço pelo CEP usando ViaCEP
  const buscarEnderecoPorCep = async () => {
    const cepLimpo = cep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) {
      showError("CEP deve ter 8 dígitos.");
      return;
    }
    setIsCepLoading(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();
      if (data.erro) {
        showError("CEP não encontrado.");
      } else {
        // Montar endereço completo
        const enderecoCompleto = `${data.logradouro || ''}${data.logradouro && data.bairro ? ', ' : ''}${data.bairro || ''}${data.localidade ? ' - ' + data.localidade : ''}${data.uf ? '/' + data.uf : ''}`;
        setFormData(prev => ({ ...prev, endereco: enderecoCompleto }));
      }
    } catch (e) {
      showError("Erro ao buscar CEP.");
    } finally {
      setIsCepLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showError('Por favor, corrija os erros no formulário');
      return;
    }

    setIsSubmitting(true);

    try {
      const pacienteData = {
        ...formData,
        // Limpar formatação para armazenamento
        cpf: formData.cpf.replace(/\D/g, ''),
        telefone: formData.telefone.replace(/\D/g, ''),
        // Calcular idade
        idade: new Date().getFullYear() - new Date(formData.dataNascimento).getFullYear()
      };

      const novoPaciente = await cadastrarPaciente(pacienteData);
      
      showToast(`Paciente ${formData.nome} cadastrado com sucesso! Prontuário: ${novoPaciente.numeroProntuario}`);
      
      // Mostrar ficha do paciente
      setPacienteCadastrado(novoPaciente);
      setShowModal(true);
      
      // Limpar formulário
      setFormData({
        nome: '',
        dataNascimento: '',
        cpf: '',
        rg: '',
        nomeMae: '',
        sexo: '',
        endereco: '',
        telefone: '',
        contatoEmergencia: '',
        email: '',
        convenio: 'SUS',
        numeroCarteirinha: '',
        motivoVisita: '',
      });
      setErrors({});
      setFormTouched(false);
      
      // Marcar senha como cadastrada
      if (senhaAtual) {
        const todasSenhas = JSON.parse(localStorage.getItem('senhas') || '[]');
        const senhasAtualizadas = todasSenhas.map(s => 
          s.id === senhaAtual.id ? { ...s, status: 'cadastrado', horaCadastro: new Date().toISOString() } : s
        );
        localStorage.setItem('senhas', JSON.stringify(senhasAtualizadas));
        setSenhaAtual(null);
        setShowCadastroForm(false);
      }
      
      // Esconder ficha após 8 segundos
      setTimeout(() => {
        setPacienteCadastrado(null);
      }, 8000);
      
    } catch (error) {
      showError('Erro ao cadastrar paciente: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Função para imprimir apenas o conteúdo do modal
  const handlePrint = () => {
    if (!printRef.current) return;
    const printContents = printRef.current.innerHTML;
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>Ficha do Paciente</title>
          <link rel="stylesheet" href="/styles/index_clean.css" />
        </head>
        <body style="margin:0; padding:24px; font-family:sans-serif;">
          ${printContents}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  if (!currentUser || (currentUser.tipo !== 'recepcionista' && currentUser.tipo !== 'admin')) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 pt-2">
      <div className="max-w-7xl mx-auto">
        {/* Header minimalista */}
        <div className="mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Cadastro de Pacientes</h1>
          <div className="flex flex-col sm:flex-row sm:items-center text-gray-500 text-xs sm:text-sm mt-1 gap-1 sm:gap-0">
            <span>{currentUser?.nome} - Recepcionista</span>
            <span className="sm:ml-auto">{new Date().toLocaleDateString('pt-BR')} {new Date().toLocaleTimeString('pt-BR')}</span>
          </div>
        </div>

        {/* Modo Foco: Mostrar apenas o formulário quando estiver cadastrando */}
        {showCadastroForm && senhaAtual ? (
          <div className="w-full">
            <Card className="shadow-md">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                    Cadastro: Senha {senhaAtual.prefixo}{senhaAtual.numero.toString().padStart(3, '0')}
                  </h2>
                  <p className="text-gray-600 text-sm sm:text-base">
                    Tipo: {senhaAtual.tipo === 'prioridade' ? 'Prioridade' : 'Normal'}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {senhaAtual.horaChamada ? `Chamada às ${formatarHora(senhaAtual.horaChamada)}` : `Gerada às ${formatarHora(senhaAtual.horaGeracao)}`}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    label={`Ver Fila (${pacientesAguardandoCadastro.length})`}
                    outlined
                    onClick={() => setShowFilaSenhas(true)}
                    className="!bg-gray-100 !text-gray-700 !border-0 px-3 sm:px-4 py-2 rounded-lg font-semibold transition-colors hover:!bg-blue-500 hover:!text-white text-sm"
                  />
                  <Button
                    label="Cancelar"
                    outlined
                    onClick={limparSenhaAtual}
                    className="!bg-gray-100 !text-gray-700 !border-0 px-3 sm:px-6 py-2 rounded-lg font-semibold transition-colors hover:!bg-red-500 hover:!text-white text-sm"
                  />
                </div>
              </div>

              {/* Formulário de Cadastro */}
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-4 sm:gap-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
                    <InputText name="nome" value={formData.nome} onChange={handleInputChange} className={`w-full ${errors.nome ? 'p-invalid' : ''}`} placeholder="Digite o nome completo" />
                    {errors.nome && <small className="p-error">{errors.nome}</small>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento *</label>
                    <InputText name="dataNascimento" value={formData.dataNascimento} onChange={handleInputChange} className={`w-full ${errors.dataNascimento ? 'p-invalid' : ''}`} placeholder="dd/mm/aaaa" />
                    {errors.dataNascimento && <small className="p-error">{errors.dataNascimento}</small>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CPF *</label>
                    <InputText name="cpf" value={formData.cpf} onChange={(e) => { const formatted = formatCPF(e.target.value); setFormData(prev => ({ ...prev, cpf: formatted })); if (errors.cpf) { setErrors(prev => ({ ...prev, cpf: '' })); } }} className={`w-full ${errors.cpf ? 'p-invalid' : ''}`} placeholder="000.000.000-00" maxLength="14" />
                    {errors.cpf && <small className="p-error">{errors.cpf}</small>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">RG *</label>
                    <InputText name="rg" value={formData.rg} onChange={handleInputChange} className={`w-full ${errors.rg ? 'p-invalid' : ''}`} placeholder="000000000" />
                    {errors.rg && <small className="p-error">{errors.rg}</small>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Mãe *</label>
                    <InputText name="nomeMae" value={formData.nomeMae} onChange={handleInputChange} className={`w-full ${errors.nomeMae ? 'p-invalid' : ''}`} placeholder="Digite o nome completo da mãe" />
                    {errors.nomeMae && <small className="p-error">{errors.nomeMae}</small>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sexo *</label>
                    <Dropdown value={formData.sexo} onChange={(e) => handleDropdownChange(e, 'sexo')} options={opcoesSexo} optionLabel="label" optionValue="value" placeholder="Selecione o sexo" className={`w-full ${errors.sexo ? 'p-invalid' : ''}`} />
                    {errors.sexo && <small className="p-error">{errors.sexo}</small>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
                    <InputText name="telefone" value={formData.telefone} onChange={(e) => { const formatted = formatPhone(e.target.value); setFormData(prev => ({ ...prev, telefone: formatted })); if (errors.telefone) { setErrors(prev => ({ ...prev, telefone: '' })); } }} className={`w-full ${errors.telefone ? 'p-invalid' : ''}`} placeholder="(00) 00000-0000" maxLength="15" />
                    {errors.telefone && <small className="p-error">{errors.telefone}</small>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                    <InputText name="email" value={formData.email} onChange={handleInputChange} className="w-full" placeholder="email@exemplo.com" />
                  </div>
                  <div className="lg:col-span-2">
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 items-end">
                      <div className="flex-[2_2_0%]">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Endereço Completo *</label>
                        <InputText name="endereco" value={formData.endereco} onChange={handleInputChange} className={`w-full ${errors.endereco ? 'p-invalid' : ''}`} placeholder="Rua, número, bairro, cidade - UF" />
                        {errors.endereco && <small className="p-error">{errors.endereco}</small>}
                      </div>
                      <div className="flex-[1_1_0%] min-w-[110px]">
                        <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                        <div className="flex gap-1">
                          <InputText name="cep" value={cep} onChange={e => setCep(e.target.value)} maxLength={9} placeholder="00000-000" className="w-full" />
                          <Button icon="pi pi-search" loading={isCepLoading} type="button" onClick={buscarEnderecoPorCep} className="!px-2 !py-2" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contato de Emergência *</label>
                    <InputText name="contatoEmergencia" value={formData.contatoEmergencia} onChange={(e) => { const formatted = formatPhone(e.target.value); setFormData(prev => ({ ...prev, contatoEmergencia: formatted })); if (errors.contatoEmergencia) { setErrors(prev => ({ ...prev, contatoEmergencia: '' })); } }} className={`w-full ${errors.contatoEmergencia ? 'p-invalid' : ''}`} placeholder="(00) 00000-0000" maxLength="15" />
                    {errors.contatoEmergencia && <small className="p-error">{errors.contatoEmergencia}</small>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Convênio</label>
                    <Dropdown value={formData.convenio} onChange={(e) => handleDropdownChange(e, 'convenio')} options={opcoesConvenio} optionLabel="label" optionValue="value" placeholder="Selecione o convênio" className="w-full" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Número da Carteirinha</label>
                    <InputText name="numeroCarteirinha" value={formData.numeroCarteirinha} onChange={handleInputChange} className="w-full" placeholder="Número da carteirinha" />
                  </div>
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Motivo da Visita *</label>
                    <InputTextarea name="motivoVisita" value={formData.motivoVisita} onChange={handleInputChange} rows="3" className={`w-full ${errors.motivoVisita ? 'p-invalid' : ''}`} placeholder="Descreva o motivo da visita e sintomas principais..." />
                    {errors.motivoVisita && <small className="p-error">{errors.motivoVisita}</small>}
                    {formData.motivoVisita && formData.motivoVisita.trim().length >= 3 && (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2 text-xs sm:text-sm">
                        <span className={
                          classificarMotivoVisita(formData.motivoVisita) === 'vermelho' ? 'text-red-600 font-semibold' :
                          classificarMotivoVisita(formData.motivoVisita) === 'amarelo' ? 'text-yellow-700 font-semibold' :
                          'text-green-700 font-semibold'
                        }>
                          {obterNomePrioridade(classificarMotivoVisita(formData.motivoVisita))}
                        </span>
                        <span className="text-gray-400 sm:ml-2">(classificação automática)</span>
                      </div>
                    )}
                  </div>
                </div>
                <Divider />
                <div className="pt-2 flex flex-col sm:flex-row justify-end gap-2">
                  <Button
                    label="Limpar Formulário"
                    outlined
                    type="button"
                    onClick={() => {
                      setFormData({
                        nome: '',
                        dataNascimento: '',
                        cpf: '',
                        rg: '',
                        nomeMae: '',
                        sexo: '',
                        endereco: '',
                        telefone: '',
                        contatoEmergencia: '',
                        email: '',
                        convenio: 'SUS',
                        numeroCarteirinha: '',
                        motivoVisita: '',
                      });
                      setErrors({});
                      setFormTouched(false);
                    }}
                    className="!bg-gray-100 !text-gray-700 !border-0 px-4 py-2 rounded-lg font-semibold transition-colors hover:!bg-gray-200 text-sm"
                  />
                  <Button
                    label={isSubmitting ? 'Cadastrando...' : 'Cadastrar Paciente'}
                    type="submit"
                    loading={isSubmitting}
                    className="!bg-blue-600 !text-white !border-0 px-6 py-2 rounded-lg font-semibold transition-colors hover:!bg-blue-700 text-sm"
                  />
                </div>
              </form>
            </Card>
          </div>
        ) : (
          // Modo Normal: Mostrar fila de pacientes aguardando cadastro
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
            {/* Fila de Pacientes Aguardando */}
            <div className="xl:col-span-2">
              <Card className="shadow-md h-fit">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Fila de Cadastro</h2>
                    <p className="text-gray-600 text-sm sm:text-base">
                      {pacientesAguardandoCadastro.length} paciente(s) aguardando cadastro
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      label="Chamar Próximo"
                      icon="pi pi-user-plus"
                      onClick={handleChamarProximoPaciente}
                      disabled={pacientesAguardandoCadastro.length === 0}
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

                {pacientesAguardandoCadastro.length > 0 ? (
                  <div className="space-y-3">
                    {pacientesAguardandoCadastro.map((senha, index) => (
                      <div
                        key={senha.id}
                        className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                        onClick={() => handleChamarPaciente(senha)}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`rounded-full flex items-center justify-center font-bold text-lg sm:text-xl ${obterCorTipo(senha.tipo).bg} ${obterCorTipo(senha.tipo).text}`}
                              style={{ width: 60, height: 60 }}
                            >
                              {senha.prefixo}{senha.numero.toString().padStart(3, '0')}
                            </div>
                            <div>
                              <div className={`font-semibold text-sm sm:text-base ${obterCorTipo(senha.tipo).text}`}>
                                {obterCorTipo(senha.tipo).nome}
                              </div>
                              <div className="text-xs sm:text-sm text-gray-500">
                                #{index + 1} na fila • {obterTempoEspera(senha.horaGeracao)}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <Tag
                              value={senha.tipo === 'prioridade' ? 'Prioridade' : 'Normal'}
                              severity={senha.tipo === 'prioridade' ? 'danger' : 'success'}
                              className="text-xs"
                            />
                            <Button
                              label="Chamar"
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleChamarPaciente(senha);
                              }}
                              className="!bg-blue-600 !text-white !border-0 px-3 py-1 rounded-lg font-semibold transition-colors hover:!bg-blue-700 text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">Fila Vazia</h3>
                    <p className="text-gray-500 text-center">
                      Nenhum paciente aguardando cadastro no momento.
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
                    <div className="text-2xl font-bold text-blue-600 mb-1">{pacientesAguardandoCadastro.length}</div>
                    <div className="text-gray-700 text-sm font-medium">Aguardando Cadastro</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {pacientesAguardandoCadastro.filter(s => s.tipo === 'normal').length}
                    </div>
                    <div className="text-gray-700 text-sm font-medium">Senhas Normais</div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <div className="text-2xl font-bold text-red-600 mb-1">
                      {pacientesAguardandoCadastro.filter(s => s.tipo === 'prioridade').length}
                    </div>
                    <div className="text-gray-700 text-sm font-medium">Senhas Prioridade</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Modal de Fila de Senhas */}
        <Dialog
          visible={showFilaSenhas}
          onHide={() => setShowFilaSenhas(false)}
          header="Fila de Pacientes Aguardando Cadastro"
          style={{ width: '90vw', maxWidth: 600 }}
          className="rounded-xl"
        >
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {pacientesAguardandoCadastro.map((senha, index) => (
              <div
                key={senha.id}
                className="bg-gray-50 rounded-lg p-3 border border-gray-200 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`rounded-full flex items-center justify-center font-bold text-lg ${obterCorTipo(senha.tipo).bg} ${obterCorTipo(senha.tipo).text}`}
                    style={{ width: 60, height: 60 }}
                  >
                    {senha.prefixo}{senha.numero.toString().padStart(3, '0')}
                  </div>
                  <div>
                    <div className={`font-semibold ${obterCorTipo(senha.tipo).text}`}>
                      {obterCorTipo(senha.tipo).nome}
                    </div>
                    <div className="text-sm text-gray-500">
                      #{index + 1} na fila • {obterTempoEspera(senha.horaGeracao)}
                    </div>
                  </div>
                </div>
                <Button
                  label="Chamar"
                  size="small"
                  onClick={() => {
                    handleChamarPaciente(senha);
                    setShowFilaSenhas(false);
                  }}
                  className="!bg-blue-600 !text-white !border-0 px-3 py-1 rounded-lg font-semibold transition-colors hover:!bg-blue-700"
                />
              </div>
            ))}
          </div>
        </Dialog>

        {/* Modal de Ficha do Paciente */}
        <Dialog
          visible={!!pacienteCadastrado}
          onHide={() => setPacienteCadastrado(null)}
          header="Ficha do Paciente Cadastrado"
          style={{ width: '90vw', maxWidth: 800 }}
          className="rounded-xl"
          footer={
            <div className="flex justify-end gap-2">
              <Button
                label="Imprimir"
                icon="pi pi-print"
                onClick={handlePrint}
                className="!bg-blue-600 !text-white !border-0 px-4 py-2 rounded-lg font-semibold transition-colors hover:!bg-blue-700"
              />
              <Button
                label="Fechar"
                outlined
                onClick={() => setPacienteCadastrado(null)}
                className="!bg-gray-100 !text-gray-700 !border-0 px-4 py-2 rounded-lg font-semibold transition-colors hover:!bg-gray-200"
              />
            </div>
          }
        >
          {pacienteCadastrado && (
            <div ref={printRef} className="bg-white p-6 rounded-lg">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Ficha do Paciente</h2>
                <p className="text-gray-600">Sistema de Atendimento Hospitalar</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="font-semibold text-gray-700">Nome:</label>
                  <p className="text-gray-800">{pacienteCadastrado.nome}</p>
                </div>
                <div>
                  <label className="font-semibold text-gray-700">Data de Nascimento:</label>
                  <p className="text-gray-800">{pacienteCadastrado.dataNascimento}</p>
                </div>
                <div>
                  <label className="font-semibold text-gray-700">CPF:</label>
                  <p className="text-gray-800">{pacienteCadastrado.cpf}</p>
                </div>
                <div>
                  <label className="font-semibold text-gray-700">RG:</label>
                  <p className="text-gray-800">{pacienteCadastrado.rg}</p>
                </div>
                <div>
                  <label className="font-semibold text-gray-700">Nome da Mãe:</label>
                  <p className="text-gray-800">{pacienteCadastrado.nomeMae}</p>
                </div>
                <div>
                  <label className="font-semibold text-gray-700">Sexo:</label>
                  <p className="text-gray-800">{pacienteCadastrado.sexo === 'M' ? 'Masculino' : pacienteCadastrado.sexo === 'F' ? 'Feminino' : 'Outro'}</p>
                </div>
                <div>
                  <label className="font-semibold text-gray-700">Telefone:</label>
                  <p className="text-gray-800">{pacienteCadastrado.telefone}</p>
                </div>
                <div>
                  <label className="font-semibold text-gray-700">E-mail:</label>
                  <p className="text-gray-800">{pacienteCadastrado.email || 'Não informado'}</p>
                </div>
                <div className="sm:col-span-2">
                  <label className="font-semibold text-gray-700">Endereço:</label>
                  <p className="text-gray-800">{pacienteCadastrado.endereco}</p>
                </div>
                <div>
                  <label className="font-semibold text-gray-700">Contato de Emergência:</label>
                  <p className="text-gray-800">{pacienteCadastrado.contatoEmergencia}</p>
                </div>
                <div>
                  <label className="font-semibold text-gray-700">Convênio:</label>
                  <p className="text-gray-800">{pacienteCadastrado.convenio}</p>
                </div>
                <div className="sm:col-span-2">
                  <label className="font-semibold text-gray-700">Motivo da Visita:</label>
                  <p className="text-gray-800">{pacienteCadastrado.motivoVisita}</p>
                </div>
              </div>
              
              <div className="text-center text-sm text-gray-500">
                <p>Cadastrado em: {new Date().toLocaleString('pt-BR')}</p>
                <p>Recepcionista: {currentUser?.nome}</p>
              </div>
            </div>
          )}
        </Dialog>
      </div>
    </div>
  );
};

export default TelaCadastro;
