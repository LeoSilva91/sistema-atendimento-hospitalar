import React, { useState, useEffect } from "react";
import { useSistemaAtendimento } from "../context/HospitalContext";
import { useToast } from "../context/ToastProvider";
import LoadingSpinner from "../components/LoadingSpinner";

const TelaCadastro = () => {
  const { cadastrarPaciente, currentUser } = useSistemaAtendimento();
  const { success: showToast, error: showError } = useToast();
  
  const [formData, setFormData] = useState({
    // Campos obrigatórios
    nome: '',
    dataNascimento: '',
    cpf: '',
    rg: '',
    sexo: '',
    endereco: '',
    telefone: '',
    contatoEmergencia: '',
    
    // Campos opcionais
    email: '',
    convenio: 'SUS',
    numeroCarteirinha: '',
    motivoVisita: '',
    sintomas: []
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pacienteCadastrado, setPacienteCadastrado] = useState(null);

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

  // Sintomas disponíveis para seleção
  const sintomasDisponiveis = [
    'Dor no peito', 'Falta de ar', 'Febre alta', 'Dor de cabeça intensa',
    'Tontura', 'Náusea/Vômito', 'Dor abdominal', 'Sangramento',
    'Trauma/Queda', 'Convulsão', 'Perda de consciência', 'Outros'
  ];

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
    }

    // Validação do motivo da visita (obrigatório)
    if (!formData.motivoVisita.trim()) {
      newErrors.motivoVisita = 'Motivo da visita é obrigatório';
    } else if (formData.motivoVisita.trim().length < 10) {
      newErrors.motivoVisita = 'Motivo da visita deve ter pelo menos 10 caracteres';
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
  };

  const handleSintomaChange = (sintoma) => {
    setFormData(prev => ({
      ...prev,
      sintomas: prev.sintomas.includes(sintoma)
        ? prev.sintomas.filter(s => s !== sintoma)
        : [...prev.sintomas, sintoma]
    }));
  };

  const formatCPF = (value) => {
    const v = value.replace(/\D/g, '');
    return v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatPhone = (value) => {
    const v = value.replace(/\D/g, '');
    return v.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
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
      
      // Limpar formulário
      setFormData({
        nome: '',
        dataNascimento: '',
        cpf: '',
        rg: '',
        sexo: '',
        endereco: '',
        telefone: '',
        contatoEmergencia: '',
        email: '',
        convenio: 'SUS',
        numeroCarteirinha: '',
        motivoVisita: '',
        sintomas: []
      });
      setErrors({});
      
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

  if (!currentUser || (currentUser.tipo !== 'recepcionista' && currentUser.tipo !== 'admin')) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Cadastro de Pacientes</h1>
              <p className="text-gray-600 mt-2">
                {currentUser.nome} - Recepcionista
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
          {/* Formulário de Cadastro */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                Dados do Paciente
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Dados Pessoais */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-800 mb-4">👤 Dados Pessoais</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome Completo *
                      </label>
                      <input
                        type="text"
                        name="nome"
                        value={formData.nome}
                        onChange={handleInputChange}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.nome ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Digite o nome completo"
                      />
                      {errors.nome && <p className="text-red-500 text-sm mt-1">{errors.nome}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Data de Nascimento *
                      </label>
                      <input
                        type="date"
                        name="dataNascimento"
                        value={formData.dataNascimento}
                        onChange={handleInputChange}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.dataNascimento ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.dataNascimento && <p className="text-red-500 text-sm mt-1">{errors.dataNascimento}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CPF *
                      </label>
                      <input
                        type="text"
                        name="cpf"
                        value={formData.cpf}
                        onChange={(e) => {
                          const formatted = formatCPF(e.target.value);
                          setFormData(prev => ({ ...prev, cpf: formatted }));
                          if (errors.cpf) {
                            setErrors(prev => ({ ...prev, cpf: '' }));
                          }
                        }}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.cpf ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="000.000.000-00"
                        maxLength="14"
                      />
                      {errors.cpf && <p className="text-red-500 text-sm mt-1">{errors.cpf}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        RG
                      </label>
                      <input
                        type="text"
                        name="rg"
                        value={formData.rg}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="00.000.000-0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sexo *
                      </label>
                      <select
                        name="sexo"
                        value={formData.sexo}
                        onChange={handleInputChange}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.sexo ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Selecione o sexo</option>
                        <option value="M">Masculino</option>
                        <option value="F">Feminino</option>
                        <option value="O">Outro</option>
                      </select>
                      {errors.sexo && <p className="text-red-500 text-sm mt-1">{errors.sexo}</p>}
                    </div>
                  </div>
                </div>

                {/* Contato */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-800 mb-4">📞 Contato</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Telefone *
                      </label>
                      <input
                        type="text"
                        name="telefone"
                        value={formData.telefone}
                        onChange={(e) => {
                          const formatted = formatPhone(e.target.value);
                          setFormData(prev => ({ ...prev, telefone: formatted }));
                          if (errors.telefone) {
                            setErrors(prev => ({ ...prev, telefone: '' }));
                          }
                        }}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.telefone ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="(00) 00000-0000"
                        maxLength="15"
                      />
                      {errors.telefone && <p className="text-red-500 text-sm mt-1">{errors.telefone}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        E-mail
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="email@exemplo.com"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Endereço Completo *
                      </label>
                      <input
                        type="text"
                        name="endereco"
                        value={formData.endereco}
                        onChange={handleInputChange}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.endereco ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Rua, número, bairro, cidade - CEP"
                      />
                      {errors.endereco && <p className="text-red-500 text-sm mt-1">{errors.endereco}</p>}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contato de Emergência *
                      </label>
                      <input
                        type="text"
                        name="contatoEmergencia"
                        value={formData.contatoEmergencia}
                        onChange={handleInputChange}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.contatoEmergencia ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Nome e telefone do contato de emergência"
                      />
                      {errors.contatoEmergencia && <p className="text-red-500 text-sm mt-1">{errors.contatoEmergencia}</p>}
                    </div>
                  </div>
                </div>

                {/* Convênio */}
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-purple-800 mb-4">🏥 Convênio</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Convênio
                      </label>
                      <select
                        name="convenio"
                        value={formData.convenio}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="SUS">SUS</option>
                        <option value="Particular">Particular</option>
                        <option value="Unimed">Unimed</option>
                        <option value="Amil">Amil</option>
                        <option value="SulAmérica">SulAmérica</option>
                        <option value="Bradesco Saúde">Bradesco Saúde</option>
                        <option value="Outro">Outro</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Número da Carteirinha
                      </label>
                      <input
                        type="text"
                        name="numeroCarteirinha"
                        value={formData.numeroCarteirinha}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Número da carteirinha"
                      />
                    </div>
                  </div>
                </div>

                {/* Motivo da Visita */}
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-orange-800 mb-4">🚨 Motivo da Visita</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Motivo da Visita *
                    </label>
                    <textarea
                      name="motivoVisita"
                      value={formData.motivoVisita}
                      onChange={handleInputChange}
                      rows="3"
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.motivoVisita ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Descreva o motivo da visita e sintomas principais..."
                    />
                    {errors.motivoVisita && <p className="text-red-500 text-sm mt-1">{errors.motivoVisita}</p>}
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sintomas Apresentados
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {sintomasDisponiveis.map((sintoma) => (
                        <label key={sintoma} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={formData.sintomas.includes(sintoma)}
                            onChange={() => handleSintomaChange(sintoma)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{sintoma}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Botão de Envio */}
                <div className="pt-6 border-t">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Cadastrando...
                      </div>
                    ) : (
                      '✅ Registrar Paciente'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Ficha do Paciente Cadastrado */}
          <div className="lg:col-span-1">
            {pacienteCadastrado ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-green-800 mb-2">
                    ✅ Paciente Cadastrado!
                  </h3>
                  <p className="text-green-600">Aguardando triagem do enfermeiro</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Prontuário:</span>
                      <span className="font-bold text-gray-800">
                        {pacienteCadastrado.numeroProntuario}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">ID:</span>
                      <span className="font-bold text-gray-800">
                        #{pacienteCadastrado.id}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Nome:</span>
                      <span className="font-bold text-gray-800">
                        {pacienteCadastrado.nome}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">CPF:</span>
                      <span className="font-bold text-gray-800">
                        {pacienteCadastrado.cpf}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Data Nasc.:</span>
                      <span className="font-bold text-gray-800">
                        {pacienteCadastrado.dataNascimento}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Sexo:</span>
                      <span className="font-bold text-gray-800">
                        {pacienteCadastrado.sexo === 'M' ? 'Masculino' : pacienteCadastrado.sexo === 'F' ? 'Feminino' : 'Outro'}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Telefone:</span>
                      <span className="font-bold text-gray-800">
                        {pacienteCadastrado.telefone}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Convênio:</span>
                      <span className="font-bold text-gray-800">
                        {pacienteCadastrado.convenio}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Status:</span>
                      <span className="rounded-full px-3 py-1 text-sm font-bold bg-orange-100 text-orange-800">
                        ⏳ Aguardando Triagem
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Hora Cadastro:</span>
                      <span className="font-bold text-gray-800">
                        {new Date(pacienteCadastrado.horaCadastro).toLocaleTimeString("pt-BR")}
                      </span>
                    </div>

                    <div className="border-t border-gray-200 pt-3">
                      <span className="block font-medium text-gray-600 mb-2">
                        Motivo da Visita:
                      </span>
                      <p className="bg-white p-3 rounded text-gray-800 text-sm">
                        {pacienteCadastrado.motivoVisita}
                      </p>
                    </div>

                    <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="flex items-center space-x-2">
                        <span className="text-orange-600">🚨</span>
                        <span className="text-sm font-medium text-orange-800">
                          Próximo passo: Triagem do Enfermeiro
                        </span>
                      </div>
                      <p className="text-xs text-orange-600 mt-1">
                        O paciente será avaliado por um enfermeiro para determinar a prioridade de atendimento.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-lg">Ficha do Paciente</p>
                  <p className="text-gray-400 text-sm mt-2">
                    Após o cadastro, a ficha será exibida aqui
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

export default TelaCadastro;
