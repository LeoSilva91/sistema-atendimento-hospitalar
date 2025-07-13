import React, { useState } from "react";
import { useSistemaAtendimento } from "../context/HospitalContext";
import { useToast } from "../context/ToastProvider";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Card } from "primereact/card";
import { Tag } from "primereact/tag";
import { Divider } from "primereact/divider";
import { PrimeIcons } from "primereact/api";

const CadastroPaciente = () => {
  const { cadastrarPaciente } = useSistemaAtendimento();
  const { success: showToast, error: showError } = useToast();
  
  const [formData, setFormData] = useState({
    nomeCompleto: "",
    cpf: "",
    rg: "",
    dataNascimento: "",
    nomeMae: "",
    sexo: "",
    estadoCivil: "",
    telefone: "",
    email: "",
    endereco: "",
    convenio: "sus",
    numeroCarteirinha: "",
    contatoEmergencia: "",
    motivoVisita: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Opções para dropdowns
  const opcoesSexo = [
    { value: "masculino", label: "Masculino" },
    { value: "feminino", label: "Feminino" },
    { value: "outro", label: "Outro" }
  ];

  const opcoesEstadoCivil = [
    { value: "solteiro", label: "Solteiro(a)" },
    { value: "casado", label: "Casado(a)" },
    { value: "divorciado", label: "Divorciado(a)" },
    { value: "viuvo", label: "Viúvo(a)" }
  ];

  const opcoesConvenio = [
    { value: "sus", label: "SUS" },
    { value: "unimed", label: "Unimed" },
    { value: "bradesco", label: "Bradesco Saúde" },
    { value: "amil", label: "Amil" },
    { value: "sulamerica", label: "SulAmérica" },
    { value: "particular", label: "Particular" },
    { value: "outro", label: "Outro" }
  ];

  // Função para classificação automática (duplicada do contexto para preview)
  const classificarMotivoVisita = (motivoVisita) => {
    const motivo = motivoVisita.toLowerCase();

    const motivosVermelhos = [
      "dor no peito",
      "infarto",
      "avc",
      "acidente vascular cerebral",
      "parada cardíaca",
      "convulsão",
      "desmaio",
      "sangramento intenso",
      "trauma craniano",
      "queimadura grave",
      "falta de ar",
      "dificuldade para respirar",
      "choque",
      "perda de consciência",
      "fratura exposta",
      "hemorragia",
      "emergência",
      "urgente",
      "grave",
    ];

    const motivosAmarelos = [
      "febre alta",
      "vômito",
      "diarreia",
      "dor abdominal",
      "fratura",
      "luxação",
      "corte profundo",
      "queimadura",
      "intoxicação",
      "alergia",
      "asma",
      "hipertensão",
      "diabetes descompensada",
      "dor de cabeça intensa",
      "tontura",
      "vertigem",
      "nausea",
      "moderado",
      "médio",
    ];

    const motivosVerdes = [
      "consulta de rotina",
      "check-up",
      "exame",
      "dor leve",
      "resfriado",
      "gripe",
      "tosse",
      "coriza",
      "dor de garganta",
      "dor de ouvido",
      "pequeno corte",
      "contusão",
      "entorse leve",
      "dor nas costas",
      "dor de cabeça leve",
      "leve",
      "rotina",
      "preventivo",
    ];

    for (const palavra of motivosVermelhos) {
      if (motivo.includes(palavra)) {
        return "vermelho";
      }
    }

    for (const palavra of motivosAmarelos) {
      if (motivo.includes(palavra)) {
        return "amarelo";
      }
    }

    for (const palavra of motivosVerdes) {
      if (motivo.includes(palavra)) {
        return "verde";
      }
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
      case 'vermelho':
        return 'danger';
      case 'amarelo':
        return 'warning';
      case 'verde':
        return 'success';
      default:
        return 'info';
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validação do nome (obrigatório)
    if (!formData.nomeCompleto.trim()) {
      newErrors.nomeCompleto = 'Nome completo é obrigatório';
    } else if (formData.nomeCompleto.trim().length < 3) {
      newErrors.nomeCompleto = 'Nome deve ter pelo menos 3 caracteres';
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

    // Validação do sexo (obrigatório)
    if (!formData.sexo) {
      newErrors.sexo = 'Sexo é obrigatório';
    }

    // Validação do telefone (obrigatório)
    if (!formData.telefone.trim()) {
      newErrors.telefone = 'Telefone é obrigatório';
    } else if (!/^\(\d{2}\) \d{5}-\d{4}$/.test(formData.telefone)) {
      newErrors.telefone = 'Telefone deve estar no formato (00) 00000-0000';
    }

    // Validação do endereço (obrigatório)
    if (!formData.endereco.trim()) {
      newErrors.endereco = 'Endereço é obrigatório';
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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Limpar erro do campo quando o usuário começa a digitar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleDropdownChange = (e, fieldName) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: e.value,
    }));
    
    // Limpar erro do campo
    if (errors[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: ''
      }));
    }
  };

  const aplicarMascaraCPF = (value) => {
    const cpf = value.replace(/\D/g, "");
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  const aplicarMascaraTelefone = (value) => {
    const telefone = value.replace(/\D/g, "");
    if (telefone.length === 11) {
      return telefone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    } else if (telefone.length === 10) {
      return telefone.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    }
    return telefone;
  };

  const handleCPFChange = (e) => {
    const maskedValue = aplicarMascaraCPF(e.target.value);
    setFormData((prev) => ({
      ...prev,
      cpf: maskedValue,
    }));
    
    // Limpar erro do campo
    if (errors.cpf) {
      setErrors(prev => ({
        ...prev,
        cpf: ''
      }));
    }
  };

  const handleTelefoneChange = (e) => {
    const maskedValue = aplicarMascaraTelefone(e.target.value);
    setFormData((prev) => ({
      ...prev,
      telefone: maskedValue,
    }));
    
    // Limpar erro do campo
    if (errors.telefone) {
      setErrors(prev => ({
        ...prev,
        telefone: ''
      }));
    }
  };

  const calcularIdade = (dataNascimento) => {
    if (!dataNascimento) return "";
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showError('Por favor, corrija os erros no formulário');
      return;
    }

    setIsSubmitting(true);

    try {
      const cpfLimpo = formData.cpf.replace(/\D/g, "");
      
      const novoPaciente = {
        ...formData,
        idade: calcularIdade(formData.dataNascimento),
        cpf: cpfLimpo,
      };

      await cadastrarPaciente(novoPaciente);
      showToast("Paciente cadastrado com sucesso!");

      // Limpar formulário
      setFormData({
        nomeCompleto: "",
        cpf: "",
        rg: "",
        dataNascimento: "",
        nomeMae: "",
        sexo: "",
        estadoCivil: "",
        telefone: "",
        email: "",
        endereco: "",
        convenio: "sus",
        numeroCarteirinha: "",
        contatoEmergencia: "",
        motivoVisita: "",
      });
      setErrors({});
      
    } catch (error) {
      showError("Erro ao cadastrar paciente: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-6 pt-2">
      <h2 className="mb-6 text-3xl font-bold text-gray-800 flex items-center">
        <i className={`${PrimeIcons.USER_PLUS} mr-3 text-blue-600`}></i>
        Cadastro de Paciente
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dados Pessoais */}
        <Card className="shadow-md">
          <h3 className="mb-4 text-xl font-semibold text-gray-700 flex items-center">
            <i className={`${PrimeIcons.USER} mr-2 text-blue-600`}></i>
            Dados Pessoais
          </h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Nome Completo *
              </label>
              <InputText
                name="nomeCompleto"
                value={formData.nomeCompleto}
                onChange={handleInputChange}
                required
                className={`w-full ${errors.nomeCompleto ? 'p-invalid' : ''}`}
                placeholder="Digite o nome completo"
                pt={{
                  root: { className: 'w-full' }
                }}
              />
              {errors.nomeCompleto && <small className="p-error">{errors.nomeCompleto}</small>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                CPF *
              </label>
              <InputText
                name="cpf"
                value={formData.cpf}
                onChange={handleCPFChange}
                placeholder="000.000.000-00"
                required
                className={`w-full ${errors.cpf ? 'p-invalid' : ''}`}
                maxLength="14"
                pt={{
                  root: { className: 'w-full' }
                }}
              />
              {errors.cpf && <small className="p-error">{errors.cpf}</small>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                RG *
              </label>
              <InputText
                name="rg"
                value={formData.rg}
                onChange={handleInputChange}
                placeholder="000000000"
                className={`w-full ${errors.rg ? 'p-invalid' : ''}`}
                pt={{
                  root: { className: 'w-full' }
                }}
              />
              {errors.rg && <small className="p-error">{errors.rg}</small>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Nome da Mãe *
              </label>
              <InputText
                name="nomeMae"
                value={formData.nomeMae}
                onChange={handleInputChange}
                className={`w-full ${errors.nomeMae ? 'p-invalid' : ''}`}
                placeholder="Digite o nome completo da mãe"
                pt={{
                  root: { className: 'w-full' }
                }}
              />
              {errors.nomeMae && <small className="p-error">{errors.nomeMae}</small>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Data de Nascimento *
              </label>
              <InputText
                name="dataNascimento"
                value={formData.dataNascimento}
                onChange={handleInputChange}
                className={`w-full ${errors.dataNascimento ? 'p-invalid' : ''}`}
                placeholder="dd/mm/aaaa"
                pt={{
                  root: { className: 'w-full' }
                }}
              />
              {errors.dataNascimento && <small className="p-error">{errors.dataNascimento}</small>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Sexo *
              </label>
              <Dropdown
                value={formData.sexo}
                onChange={(e) => handleDropdownChange(e, 'sexo')}
                options={opcoesSexo}
                optionLabel="label"
                optionValue="value"
                placeholder="Selecione o sexo"
                required
                className={`w-full ${errors.sexo ? 'p-invalid' : ''}`}
                pt={{
                  root: { className: 'w-full' }
                }}
              />
              {errors.sexo && <small className="p-error">{errors.sexo}</small>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Estado Civil
              </label>
              <Dropdown
                value={formData.estadoCivil}
                onChange={(e) => handleDropdownChange(e, 'estadoCivil')}
                options={opcoesEstadoCivil}
                optionLabel="label"
                optionValue="value"
                placeholder="Selecione o estado civil"
                className="w-full"
                pt={{
                  root: { className: 'w-full' }
                }}
              />
            </div>
          </div>
        </Card>

        {/* Contato */}
        <Card className="shadow-md">
          <h3 className="mb-4 text-xl font-semibold text-gray-700 flex items-center">
            <i className={`${PrimeIcons.PHONE} mr-2 text-green-600`}></i>
            Contato
          </h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Telefone *
              </label>
              <InputText
                name="telefone"
                value={formData.telefone}
                onChange={handleTelefoneChange}
                placeholder="(00) 00000-0000"
                required
                className={`w-full ${errors.telefone ? 'p-invalid' : ''}`}
                maxLength="15"
                pt={{
                  root: { className: 'w-full' }
                }}
              />
              {errors.telefone && <small className="p-error">{errors.telefone}</small>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                E-mail
              </label>
              <InputText
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                type="email"
                className="w-full"
                placeholder="email@exemplo.com"
                pt={{
                  root: { className: 'w-full' }
                }}
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Endereço Completo *
            </label>
            <InputText
              name="endereco"
              value={formData.endereco}
              onChange={handleInputChange}
              placeholder="Rua, número, bairro, cidade - CEP"
              required
              className={`w-full ${errors.endereco ? 'p-invalid' : ''}`}
              pt={{
                root: { className: 'w-full' }
              }}
            />
            {errors.endereco && <small className="p-error">{errors.endereco}</small>}
          </div>
        </Card>

        {/* Convênio */}
        <Card className="shadow-md">
          <h3 className="mb-4 text-xl font-semibold text-gray-700 flex items-center">
            <i className={`${PrimeIcons.BUILDING} mr-2 text-purple-600`}></i>
            Convênio
          </h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Convênio
              </label>
              <Dropdown
                value={formData.convenio}
                onChange={(e) => handleDropdownChange(e, 'convenio')}
                options={opcoesConvenio}
                optionLabel="label"
                optionValue="value"
                placeholder="Selecione o convênio"
                className="w-full"
                pt={{
                  root: { className: 'w-full' }
                }}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Número da Carteirinha
              </label>
              <InputText
                name="numeroCarteirinha"
                value={formData.numeroCarteirinha}
                onChange={handleInputChange}
                className="w-full"
                placeholder="Número da carteirinha"
                pt={{
                  root: { className: 'w-full' }
                }}
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Contato de Emergência
            </label>
            <InputText
              name="contatoEmergencia"
              value={formData.contatoEmergencia}
              onChange={(e) => {
                const maskedValue = aplicarMascaraTelefone(e.target.value);
                setFormData((prev) => ({
                  ...prev,
                  contatoEmergencia: maskedValue,
                }));
              }}
              placeholder="(00) 00000-0000"
              maxLength="15"
              className="w-full"
              pt={{
                root: { className: 'w-full' }
              }}
            />
          </div>
        </Card>

        {/* Motivo da Visita */}
        <Card className="shadow-md">
          <h3 className="mb-4 text-xl font-semibold text-gray-700 flex items-center">
            <i className={`${PrimeIcons.EXCLAMATION_TRIANGLE} mr-2 text-orange-600`}></i>
            Motivo da Visita
          </h3>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Motivo da Visita *
            </label>
            <InputTextarea
              name="motivoVisita"
              value={formData.motivoVisita}
              onChange={handleInputChange}
              placeholder="Descreva brevemente o motivo da consulta"
              required
              rows="4"
              className={`w-full ${errors.motivoVisita ? 'p-invalid' : ''}`}
              pt={{
                root: { className: 'w-full' }
              }}
            />
            {errors.motivoVisita && <small className="p-error">{errors.motivoVisita}</small>}
          </div>

          {/* Classificação Automática */}
          {formData.motivoVisita && (
            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Classificação Automática
              </label>
              <div className="flex items-center gap-3">
                <Tag 
                  value={obterNomePrioridade(classificarMotivoVisita(formData.motivoVisita))}
                  severity={getTagSeverity(classificarMotivoVisita(formData.motivoVisita))}
                  className="text-sm"
                  pt={{
                    root: { className: 'text-sm font-medium' }
                  }}
                />
                <p className="text-sm text-gray-600">
                  Esta classificação será aplicada automaticamente baseada no motivo informado.
                </p>
              </div>
            </div>
          )}
        </Card>

        {/* Botão de Submit */}
        <Divider />
        <div className="flex justify-center">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3"
            pt={{
              root: { 
                className: 'rounded-lg bg-blue-600 px-8 py-3 font-bold text-white shadow-md transition-colors duration-200 hover:bg-blue-700 hover:shadow-lg disabled:bg-blue-400' 
              }
            }}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <i className={`${PrimeIcons.SPINNER} animate-spin mr-3`}></i>
                Cadastrando...
              </div>
            ) : (
              <>
                <i className={`${PrimeIcons.CHECK} mr-2`}></i>
                Registrar Paciente
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CadastroPaciente;
