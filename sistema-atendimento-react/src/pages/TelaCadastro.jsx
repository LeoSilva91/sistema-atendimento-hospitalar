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
    <div className="min-h-screen bg-gray-50 p-4 pt-2">
      <div className="max-w-7xl mx-auto">
        {/* Header minimalista */}
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-gray-800">Cadastro de Pacientes</h1>
          <div className="flex items-center text-gray-500 text-sm mt-1">
            {currentUser?.nome} - Recepcionista
            <span className="ml-auto">{new Date().toLocaleDateString('pt-BR')} {new Date().toLocaleTimeString('pt-BR')}</span>
          </div>
        </div>

        {/* Modo Foco: Mostrar apenas o formulário quando estiver cadastrando */}
        {showCadastroForm && senhaAtual ? (
          <div className="w-full">
            <Card className="shadow-md">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    Cadastro: Senha {senhaAtual.prefixo}{senhaAtual.numero.toString().padStart(3, '0')}
                  </h2>
                  <p className="text-gray-600">
                    Tipo: {senhaAtual.tipo === 'prioridade' ? 'Prioridade' : 'Normal'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {senhaAtual.horaChamada ? `Chamada às ${formatarHora(senhaAtual.horaChamada)}` : `Gerada às ${formatarHora(senhaAtual.horaGeracao)}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    label={`Ver Fila (${pacientesAguardandoCadastro.length})`}
                    outlined
                    onClick={() => setShowFilaSenhas(true)}
                    className="!bg-gray-100 !text-gray-700 !border-0 px-4 py-2 rounded-lg font-semibold transition-colors hover:!bg-blue-500 hover:!text-white"
                  />
                  <Button
                    label="Cancelar"
                    outlined
                    onClick={limparSenhaAtual}
                    className="!bg-gray-100 !text-gray-700 !border-0 px-6 py-2 rounded-lg font-semibold transition-colors hover:!bg-red-500 hover:!text-white"
                  />
                </div>
              </div>

              {/* Formulário de Cadastro */}
              <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
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
            <div className="md:col-span-2">
              <div className="flex gap-2 items-end">
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
            <div className="md:col-span-2">
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
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Motivo da Visita *</label>
              <InputTextarea name="motivoVisita" value={formData.motivoVisita} onChange={handleInputChange} rows="3" className={`w-full ${errors.motivoVisita ? 'p-invalid' : ''}`} placeholder="Descreva o motivo da visita e sintomas principais..." />
              {errors.motivoVisita && <small className="p-error">{errors.motivoVisita}</small>}
              {formData.motivoVisita && formData.motivoVisita.trim().length >= 3 && (
                <div className="flex items-center gap-2 mt-2 text-sm">
                  <span className={
                    classificarMotivoVisita(formData.motivoVisita) === 'vermelho' ? 'text-red-600 font-semibold' :
                    classificarMotivoVisita(formData.motivoVisita) === 'amarelo' ? 'text-yellow-700 font-semibold' :
                    'text-green-700 font-semibold'
                  }>
                    {obterNomePrioridade(classificarMotivoVisita(formData.motivoVisita))}
                  </span>
                  <span className="text-gray-400 ml-2">(classificação automática)</span>
                </div>
              )}
            </div>
          </div>
          <Divider />
          <div className="pt-2 flex justify-end">
            <Button type="submit" disabled={isSubmitting} className="px-8 py-3 bg-neutral-800 hover:bg-neutral-700 border-0 text-white rounded-lg shadow-sm font-semibold text-base transition-colors">
              {isSubmitting ? (
                      <span className="flex items-center">Cadastrando...</span>
              ) : (
                      <span className="flex items-center">Registrar Paciente</span>
              )}
            </Button>
                </div>
        </form>
            </Card>
          </div>
        ) : (
          /* Modo Lista: Mostrar fila quando não estiver cadastrando */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lista de Pacientes Aguardando Cadastro */}
            <div className="lg:col-span-1">
              <Card className="shadow-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Aguardando Cadastro ({pacientesAguardandoCadastro.length})
                  </h2>
                  <Button
                    label="Chamar Próximo"
                    disabled={pacientesAguardandoCadastro.length === 0}
                    onClick={handleChamarProximoPaciente}
                    className="bg-blue-600 hover:bg-blue-700 border-0 text-white"
                  />
                </div>
                
                {pacientesAguardandoCadastro.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Nenhum paciente aguardando cadastro</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pacientesAguardandoCadastro.map((senha, index) => {
                      const corInfo = obterCorTipo(senha.tipo);
                      return (
                        <div
                          key={senha.id}
                          className={`p-4 border rounded-lg transition-colors ${
                            senhaAtual?.id === senha.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start min-w-0">
                            <div className={`${corInfo.bg} ${corInfo.text} font-bold text-lg px-3 py-1 rounded-full flex-shrink-0 mt-1`}>
                              {senha.prefixo}{senha.numero.toString().padStart(3, '0')}
                            </div>
                            <div className="ml-4 flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between min-w-0">
                                <h3 className="font-medium text-gray-800 text-base sm:text-lg min-w-0">
                                  Senha {corInfo.nome}
                                </h3>
                                <div className="text-xs text-gray-500 whitespace-nowrap sm:ml-4 mt-1 sm:mt-0 text-right">
                                  Aguardando há {obterTempoEspera(senha.horaGeracao)}
                                </div>
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                Gerada às {formatarHora(senha.horaGeracao)}
                              </div>
                              <Tag
                                value={corInfo.nome}
                                className={`${corInfo.bg} ${corInfo.text} text-xs mt-1`}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </div>

            {/* Área de Cadastro Vazia */}
            <div className="lg:col-span-2">
              <Card className="shadow-md">
                <div className="text-center py-12">
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    Nenhum Paciente em Cadastro
                  </h3>
                  <p className="text-gray-500">
                    Clique em "Chamar Próximo" para iniciar o cadastro de um paciente
                  </p>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Modal da Ficha do Paciente */}
        <Dialog 
          header={<span className="text-xl font-bold text-gray-800">Ficha do Paciente</span>} 
          visible={showModal} 
          style={{ width: '100%', maxWidth: 600 }} 
          modal 
          onHide={() => setShowModal(false)} 
          className="p-0" 
          closable={true}
          dismissableMask={true}
          closeOnEscape={true}
        >
          {pacienteCadastrado && (
            <div className="p-6" ref={printRef}>
              {/* Cabeçalho do modal */}
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-1">{pacienteCadastrado.nome}</h2>
                <div className="text-gray-700 text-base mb-2">
                  <span className="font-bold">Idade:</span> {pacienteCadastrado.dataNascimento ? (new Date().getFullYear() - new Date(pacienteCadastrado.dataNascimento).getFullYear()) : '-'} anos
                  <span className="font-bold ml-4">Sexo:</span> {pacienteCadastrado.sexo === 'M' ? 'Masculino' : pacienteCadastrado.sexo === 'F' ? 'Feminino' : 'Outro'}
                  <span className="font-bold ml-4">Prontuário:</span> {pacienteCadastrado.numeroProntuario}
                </div>
              </div>
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-800 mb-1">Dados Pessoais</h3>
                <div className="space-y-1 text-base">
                  <div><span className="font-bold">CPF:</span> {pacienteCadastrado.cpf}</div>
                  <div><span className="font-bold">RG:</span> {pacienteCadastrado.rg}</div>
                  <div><span className="font-bold">Nome da Mãe:</span> {pacienteCadastrado.nomeMae}</div>
                  <div><span className="font-bold">Telefone:</span> {pacienteCadastrado.telefone}</div>
                  <div><span className="font-bold">Convênio:</span> {pacienteCadastrado.convenio}</div>
                  <div><span className="font-bold">Endereço:</span> {pacienteCadastrado.endereco}</div>
                  <div><span className="font-bold">Contato Emergência:</span> {pacienteCadastrado.contatoEmergencia}</div>
                </div>
              </div>
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-800 mb-1">Motivo da Visita</h3>
                <div className="text-base">{pacienteCadastrado.motivoVisita}</div>
              </div>
              <div className="text-xs text-gray-400 mt-4">Impresso em: {new Date().toLocaleString('pt-BR')}</div>
              <div className="flex justify-end gap-2 mt-8 border-t border-gray-100 pt-4">
                <Button label="Fechar" className="!bg-gray-100 !text-gray-700 !border-0" onClick={() => setShowModal(false)} />
                <Button label="Imprimir" className="!bg-green-600 !text-white !border-0" onClick={handlePrint} />
          </div>
        </div>
          )}
        </Dialog>

        {/* Modal da Fila de Senhas */}
        <Dialog
          header="Fila de Senhas Aguardando Cadastro"
          visible={showFilaSenhas}
          style={{ width: '90vw', maxWidth: '1200px' }}
          onHide={() => setShowFilaSenhas(false)}
          className="rounded-xl"
        >
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">
                Senhas Aguardando Cadastro ({pacientesAguardandoCadastro.length})
              </h3>
              <Button
                label="Chamar Próximo"
                disabled={pacientesAguardandoCadastro.length === 0}
                onClick={() => {
                  handleChamarProximoPaciente();
                  setShowFilaSenhas(false);
                }}
                className="bg-blue-600 hover:bg-blue-700 border-0 text-white"
              />
            </div>
            
            {pacientesAguardandoCadastro.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Nenhuma senha aguardando cadastro</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pacientesAguardandoCadastro.map((senha, index) => {
                  const corInfo = obterCorTipo(senha.tipo);
                  return (
                    <div
                      key={senha.id}
                      className={`p-4 border rounded-lg transition-colors ${
                        senhaAtual?.id === senha.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start min-w-0">
                        <div className={`${corInfo.bg} ${corInfo.text} font-bold text-lg px-3 py-1 rounded-full flex-shrink-0 mt-1`}>
                          {senha.prefixo}{senha.numero.toString().padStart(3, '0')}
                        </div>
                        <div className="ml-4 flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between min-w-0">
                            <h3 className="font-medium text-gray-800 text-base sm:text-lg min-w-0">
                              Senha {corInfo.nome}
                            </h3>
                            <div className="text-xs text-gray-500 whitespace-nowrap sm:ml-4 mt-1 sm:mt-0 text-right">
                              Aguardando há {obterTempoEspera(senha.horaGeracao)}
                            </div>
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            Gerada às {formatarHora(senha.horaGeracao)}
                          </div>
                          <Tag
                            value={corInfo.nome}
                            className={`${corInfo.bg} ${corInfo.text} text-xs mt-1`}
                          />
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

export default TelaCadastro;
