import React, { useState } from "react";
import { useSistemaAtendimento } from "../utils/SistemaAtendimentoContext";

const CadastroPaciente = () => {
  const { cadastrarPaciente } = useSistemaAtendimento();
  const [formData, setFormData] = useState({
    nomeCompleto: "",
    cpf: "",
    rg: "",
    dataNascimento: "",
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

  const obterCorPrioridade = (prioridade) => {
    const cores = {
      vermelho: "bg-red-100 border-red-300 text-red-800",
      amarelo: "bg-yellow-100 border-yellow-300 text-yellow-800",
      verde: "bg-green-100 border-green-300 text-green-800",
    };
    return cores[prioridade] || "bg-gray-100 border-gray-300 text-gray-800";
  };

  const obterNomePrioridade = (prioridade) => {
    const nomes = {
      vermelho: "🔴 VERMELHO - Urgente (Atendimento Imediato)",
      amarelo: "🟡 AMARELO - Moderado (Espera Média)",
      verde: "🟢 VERDE - Leve (Pode Esperar)",
    };
    return nomes[prioridade] || "⚪ Não Classificado";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
  };

  const handleTelefoneChange = (e) => {
    const maskedValue = aplicarMascaraTelefone(e.target.value);
    setFormData((prev) => ({
      ...prev,
      telefone: maskedValue,
    }));
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

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validações básicas
    if (
      !formData.nomeCompleto ||
      !formData.cpf ||
      !formData.dataNascimento ||
      !formData.sexo ||
      !formData.telefone ||
      !formData.endereco ||
      !formData.motivoVisita
    ) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    // Verificar se CPF já existe
    const cpfLimpo = formData.cpf.replace(/\D/g, "");
    if (cpfLimpo.length !== 11) {
      alert("CPF inválido. Digite um CPF válido.");
      return;
    }

    const novoPaciente = {
      ...formData,
      idade: calcularIdade(formData.dataNascimento),
      cpf: cpfLimpo,
    };

    try {
      cadastrarPaciente(novoPaciente);
      alert("Paciente cadastrado com sucesso!");

      // Limpar formulário
      setFormData({
        nomeCompleto: "",
        cpf: "",
        rg: "",
        dataNascimento: "",
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
    } catch (error) {
      alert("Erro ao cadastrar paciente: " + error.message);
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h2 className="mb-6 text-3xl font-bold text-gray-800">
        Cadastro de Paciente
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dados Pessoais */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h3 className="mb-4 text-xl font-semibold text-gray-700">
            Dados Pessoais
          </h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Nome Completo *
              </label>
              <input
                type="text"
                name="nomeCompleto"
                value={formData.nomeCompleto}
                onChange={handleInputChange}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                CPF *
              </label>
              <input
                type="text"
                name="cpf"
                value={formData.cpf}
                onChange={handleCPFChange}
                placeholder="000.000.000-00"
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                RG
              </label>
              <input
                type="text"
                name="rg"
                value={formData.rg}
                onChange={handleInputChange}
                placeholder="00.000.000-0"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Data de Nascimento *
              </label>
              <input
                type="date"
                name="dataNascimento"
                value={formData.dataNascimento}
                onChange={handleInputChange}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Sexo *
              </label>
              <select
                name="sexo"
                value={formData.sexo}
                onChange={handleInputChange}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">Selecione</option>
                <option value="masculino">Masculino</option>
                <option value="feminino">Feminino</option>
                <option value="outro">Outro</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Estado Civil
              </label>
              <select
                name="estadoCivil"
                value={formData.estadoCivil}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">Selecione</option>
                <option value="solteiro">Solteiro(a)</option>
                <option value="casado">Casado(a)</option>
                <option value="divorciado">Divorciado(a)</option>
                <option value="viuvo">Viúvo(a)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contato */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h3 className="mb-4 text-xl font-semibold text-gray-700">Contato</h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Telefone *
              </label>
              <input
                type="tel"
                name="telefone"
                value={formData.telefone}
                onChange={handleTelefoneChange}
                placeholder="(00) 00000-0000"
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                E-mail
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Endereço Completo *
            </label>
            <input
              type="text"
              name="endereco"
              value={formData.endereco}
              onChange={handleInputChange}
              placeholder="Rua, número, bairro, cidade - CEP"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Convênio */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h3 className="mb-4 text-xl font-semibold text-gray-700">Convênio</h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Convênio
              </label>
              <select
                name="convenio"
                value={formData.convenio}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="sus">SUS</option>
                <option value="unimed">Unimed</option>
                <option value="bradesco">Bradesco Saúde</option>
                <option value="amil">Amil</option>
                <option value="sulamerica">SulAmérica</option>
                <option value="particular">Particular</option>
                <option value="outro">Outro</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Número da Carteirinha
              </label>
              <input
                type="text"
                name="numeroCarteirinha"
                value={formData.numeroCarteirinha}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Contato de Emergência
            </label>
            <input
              type="text"
              name="contatoEmergencia"
              value={formData.contatoEmergencia}
              onChange={handleInputChange}
              placeholder="Nome e telefone"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Motivo da Visita */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h3 className="mb-4 text-xl font-semibold text-gray-700">
            Motivo da Visita
          </h3>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Motivo da Visita *
            </label>
            <textarea
              name="motivoVisita"
              value={formData.motivoVisita}
              onChange={handleInputChange}
              placeholder="Descreva brevemente o motivo da consulta"
              required
              rows="4"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Classificação Automática */}
          {formData.motivoVisita && (
            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Classificação Automática
              </label>
              <div
                className={`rounded-lg border-2 p-3 ${obterCorPrioridade(classificarMotivoVisita(formData.motivoVisita))}`}
              >
                <p className="font-medium">
                  {obterNomePrioridade(
                    classificarMotivoVisita(formData.motivoVisita),
                  )}
                </p>
                <p className="mt-1 text-sm opacity-75">
                  Esta classificação será aplicada automaticamente baseada no
                  motivo informado.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Botão de Submit */}
        <div className="flex justify-center">
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-8 py-3 font-bold text-white shadow-md transition-colors duration-200 hover:bg-blue-700 hover:shadow-lg"
          >
            Registrar Paciente
          </button>
        </div>
      </form>
    </div>
  );
};

export default CadastroPaciente;
