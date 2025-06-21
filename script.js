class SistemaAtendimento {
  constructor() {
    this.pacientes = JSON.parse(localStorage.getItem("pacientes")) || []
    this.filaTriagem = JSON.parse(localStorage.getItem("filaTriagem")) || []
    this.filaMedico = JSON.parse(localStorage.getItem("filaMedico")) || []
    this.pacienteAtual = JSON.parse(localStorage.getItem("pacienteAtual")) || null
    this.pacienteTriagemAtual = JSON.parse(localStorage.getItem("pacienteTriagemAtual")) || null
    this.historico = JSON.parse(localStorage.getItem("historico")) || []
    this.proximoId = Number.parseInt(localStorage.getItem("proximoId")) || 1

    this.initEventListeners()
    this.atualizarInterface()
    this.iniciarAtualizacaoAutomatica()
  }

  initEventListeners() {
    // Navegação
    document.querySelectorAll(".nav-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.trocarSecao(e.target.dataset.section)
      })
    })

    // Cadastro
    document.getElementById("cadastroForm").addEventListener("submit", (e) => {
      e.preventDefault()
      this.cadastrarPaciente()
    })

    // Máscaras de input
    this.aplicarMascaras()

    // Painel de Triagem
    document.getElementById("chamarProximoTriagem").addEventListener("click", () => {
      this.chamarProximoPacienteTriagem()
    })

    document.getElementById("iniciarTriagem").addEventListener("click", () => {
      this.iniciarTriagem()
    })

    document.querySelectorAll("[data-triagem-status]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.alterarStatusTriagem(e.target.dataset.triagemStatus)
      })
    })

    // Avaliação de Triagem
    document.addEventListener("click", (e) => {
      if (e.target.dataset.prioridade) {
        this.classificarPaciente(e.target.dataset.prioridade)
      }
    })

    // Escala de dor
    document.getElementById("escalaDor").addEventListener("input", (e) => {
      document.getElementById("valorDor").textContent = e.target.value
    })

    // Painel Médico
    document.getElementById("chamarProximo").addEventListener("click", () => {
      this.chamarProximoPaciente()
    })

    document.getElementById("concluirAtendimento").addEventListener("click", () => {
      this.concluirAtendimento()
    })

    document.querySelectorAll("[data-status]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.alterarStatusPaciente(e.target.dataset.status)
      })
    })
  }

  aplicarMascaras() {
    // Máscara CPF
    document.getElementById("cpf").addEventListener("input", (e) => {
      let value = e.target.value.replace(/\D/g, "")
      value = value.replace(/(\d{3})(\d)/, "$1.$2")
      value = value.replace(/(\d{3})(\d)/, "$1.$2")
      value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2")
      e.target.value = value
    })

    // Máscara Telefone
    document.getElementById("telefone").addEventListener("input", (e) => {
      let value = e.target.value.replace(/\D/g, "")
      value = value.replace(/(\d{2})(\d)/, "($1) $2")
      value = value.replace(/(\d{5})(\d)/, "$1-$2")
      e.target.value = value
    })
  }

  trocarSecao(secao) {
    document.querySelectorAll(".section").forEach((s) => s.classList.remove("active"))
    document.querySelectorAll(".nav-btn").forEach((b) => b.classList.remove("active"))

    document.getElementById(secao).classList.add("active")
    document.querySelector(`[data-section="${secao}"]`).classList.add("active")

    this.atualizarInterface()
  }

  cadastrarPaciente() {
    const dadosFormulario = {
      nomeCompleto: document.getElementById("nomeCompleto").value.trim(),
      cpf: document.getElementById("cpf").value.trim(),
      rg: document.getElementById("rg").value.trim(),
      dataNascimento: document.getElementById("dataNascimento").value,
      sexo: document.getElementById("sexo").value,
      estadoCivil: document.getElementById("estadoCivil").value,
      telefone: document.getElementById("telefone").value.trim(),
      email: document.getElementById("email").value.trim(),
      endereco: document.getElementById("endereco").value.trim(),
      convenio: document.getElementById("convenio").value,
      numeroCarteirinha: document.getElementById("numeroCarteirinha").value.trim(),
      contatoEmergencia: document.getElementById("contatoEmergencia").value.trim(),
      motivoVisita: document.getElementById("motivoVisita").value.trim(),
    }

    // Validações básicas
    if (
      !dadosFormulario.nomeCompleto ||
      !dadosFormulario.cpf ||
      !dadosFormulario.dataNascimento ||
      !dadosFormulario.sexo ||
      !dadosFormulario.telefone ||
      !dadosFormulario.endereco ||
      !dadosFormulario.motivoVisita
    ) {
      alert("Por favor, preencha todos os campos obrigatórios (*)!")
      return
    }

    // Verificar se CPF já existe
    if (this.pacientes.some((p) => p.cpf === dadosFormulario.cpf)) {
      alert("Já existe um paciente cadastrado com este CPF!")
      return
    }

    const paciente = {
      id: this.proximoId++,
      ...dadosFormulario,
      dataHoraCadastro: new Date().toLocaleString("pt-BR"),
      status: "aguardando-triagem",
      idade: this.calcularIdade(dadosFormulario.dataNascimento),
      triagem: null,
    }

    this.pacientes.push(paciente)
    this.filaTriagem.push(paciente)
    this.salvarDados()

    document.getElementById("cadastroForm").reset()
    alert(`Paciente ${dadosFormulario.nomeCompleto} cadastrado com sucesso!\nID: ${paciente.id}\nDirigir-se à triagem.`)

    this.atualizarInterface()
  }

  calcularIdade(dataNascimento) {
    const hoje = new Date()
    const nascimento = new Date(dataNascimento)
    let idade = hoje.getFullYear() - nascimento.getFullYear()
    const mes = hoje.getMonth() - nascimento.getMonth()

    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--
    }

    return idade
  }

  coletarDadosTriagem() {
    const sintomas = Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map((cb) => cb.value)

    return {
      sinaisVitais: {
        pressaoArterial: document.getElementById("pressaoArterial").value,
        temperatura: document.getElementById("temperatura").value,
        frequenciaCardiaca: document.getElementById("frequenciaCardiaca").value,
        saturacaoO2: document.getElementById("saturacaoO2").value,
        frequenciaRespiratoria: document.getElementById("frequenciaRespiratoria").value,
        peso: document.getElementById("peso").value,
      },
      avaliacaoClinica: {
        queixaPrincipal: document.getElementById("queixaPrincipal").value,
        sintomas: sintomas,
        outrosSintomas: document.getElementById("outrosSintomas").value,
        historicoMedico: document.getElementById("historicoMedico").value,
        medicamentosUso: document.getElementById("medicamentosUso").value,
      },
      avaliacaoDor: {
        escalaDor: document.getElementById("escalaDor").value,
        localizacaoDor: document.getElementById("localizacaoDor").value,
      },
      nivelConsciencia: document.getElementById("nivelConsciencia").value,
      observacoes: document.getElementById("observacoes").value,
      dataHoraTriagem: new Date().toLocaleString("pt-BR"),
    }
  }

  chamarProximoPacienteTriagem() {
    if (this.filaTriagem.length === 0) {
      alert("Não há pacientes na fila de triagem!")
      return
    }

    if (this.pacienteTriagemAtual) {
      alert("Há um paciente em triagem. Conclua a triagem atual primeiro.")
      return
    }

    const proximoPaciente = this.filaTriagem.shift()
    proximoPaciente.status = "chamado-triagem"
    proximoPaciente.horaChamadaTriagem = new Date().toLocaleString("pt-BR")

    this.pacienteTriagemAtual = proximoPaciente

    // Atualizar no array principal
    const index = this.pacientes.findIndex((p) => p.id === proximoPaciente.id)
    if (index !== -1) {
      this.pacientes[index] = proximoPaciente
    }

    this.salvarDados()
    this.atualizarInterface()

    alert(`Paciente ${proximoPaciente.nomeCompleto} foi chamado para triagem!`)
  }

  iniciarTriagem() {
    if (!this.pacienteTriagemAtual) return

    this.pacienteTriagemAtual.status = "em-triagem"
    this.pacienteTriagemAtual.horaInicioTriagem = new Date().toLocaleString("pt-BR")

    const index = this.pacientes.findIndex((p) => p.id === this.pacienteTriagemAtual.id)
    if (index !== -1) {
      this.pacientes[index] = this.pacienteTriagemAtual
    }

    this.salvarDados()
    this.atualizarInterface()

    // Mostrar alerta para ir para avaliação
    alert(
      `Triagem iniciada para ${this.pacienteTriagemAtual.nomeCompleto}!\nVá para a seção "Avaliação" para preencher os dados da triagem.`,
    )
  }

  alterarStatusTriagem(novoStatus) {
    if (!this.pacienteTriagemAtual) return

    this.pacienteTriagemAtual.status = novoStatus

    const index = this.pacientes.findIndex((p) => p.id === this.pacienteTriagemAtual.id)
    if (index !== -1) {
      this.pacientes[index] = this.pacienteTriagemAtual
    }

    this.salvarDados()
    this.atualizarInterface()
  }

  classificarPaciente(prioridade) {
    console.log("Iniciando classificação e encaminhamento do paciente...")
    console.log("Paciente triagem atual:", this.pacienteTriagemAtual)

    if (!this.pacienteTriagemAtual) {
      alert("Nenhum paciente em triagem selecionado!")
      return
    }

    // Verificar se o paciente está em triagem
    if (this.pacienteTriagemAtual.status !== "em-triagem") {
      alert("O paciente precisa estar em triagem para ser avaliado!")
      return
    }

    const dadosTriagem = this.coletarDadosTriagem()

    // Validar se pelo menos a queixa principal foi preenchida
    if (!dadosTriagem.avaliacaoClinica.queixaPrincipal.trim()) {
      alert("Por favor, preencha pelo menos a queixa principal antes de classificar o paciente!")
      return
    }

    const prioridades = {
      vermelho: { nivel: 1, cor: "vermelho", nome: "Emergência", tempo: "Imediato" },
      amarelo: { nivel: 2, cor: "amarelo", nome: "Urgente", tempo: "Até 15 min" },
      verde: { nivel: 3, cor: "verde", nome: "Pouco Urgente", tempo: "Até 60 min" },
      azul: { nivel: 4, cor: "azul", nome: "Não Urgente", tempo: "Até 120 min" },
    }

    const paciente = this.pacienteTriagemAtual

    // Atualizar dados do paciente
    paciente.prioridade = prioridades[prioridade].nivel
    paciente.cor = prioridades[prioridade].cor
    paciente.status = "aguardando-medico"
    paciente.triagem = dadosTriagem
    paciente.classificacao = prioridades[prioridade]
    paciente.horaFimTriagem = new Date().toLocaleString("pt-BR")

    console.log("Paciente classificado:", paciente)

    // ENCAMINHAR PARA FILA MÉDICA
    this.filaMedico.push(paciente)
    this.filaMedico.sort((a, b) => a.prioridade - b.prioridade)

    console.log("Paciente adicionado à fila médica:", this.filaMedico)

    // Atualizar no array principal
    const index = this.pacientes.findIndex((p) => p.id === paciente.id)
    if (index !== -1) {
      this.pacientes[index] = paciente
      console.log("Paciente atualizado no array principal")
    }

    // Limpar paciente atual da triagem
    this.pacienteTriagemAtual = null

    // Salvar dados
    this.salvarDados()

    // Mensagem de sucesso com encaminhamento
    alert(
      `AVALIAÇÃO CONCLUÍDA!\n\n` +
        `Paciente: ${paciente.nomeCompleto}\n` +
        `Classificação: ${prioridades[prioridade].nome}\n` +
        `Tempo de espera: ${prioridades[prioridade].tempo}\n\n` +
        `PACIENTE ENCAMINHADO PARA FILA MÉDICA\n` +
        `Posição na fila: ${this.filaMedico.findIndex((p) => p.id === paciente.id) + 1}º`,
    )

    // Limpar formulário
    document.getElementById("triagemForm").reset()
    document.getElementById("escalaDor").value = 0
    document.getElementById("valorDor").textContent = "0"

    // Atualizar interface
    this.atualizarInterface()

    console.log("Encaminhamento finalizado. Fila médica atualizada:", this.filaMedico)
  }

  chamarProximoPaciente() {
    console.log("Tentando chamar próximo paciente...")
    console.log("Fila médico:", this.filaMedico)

    if (this.filaMedico.length === 0) {
      alert("Não há pacientes na fila de espera!")
      return
    }

    if (this.pacienteAtual) {
      alert("Há um paciente em atendimento. Conclua o atendimento atual primeiro.")
      return
    }

    const proximoPaciente = this.filaMedico.shift()
    proximoPaciente.status = "em-atendimento"
    proximoPaciente.horaAtendimento = new Date().toLocaleString("pt-BR")

    this.pacienteAtual = proximoPaciente

    console.log("Paciente chamado para atendimento:", proximoPaciente)

    // Atualizar no array principal
    const index = this.pacientes.findIndex((p) => p.id === proximoPaciente.id)
    if (index !== -1) {
      this.pacientes[index] = proximoPaciente
    }

    this.salvarDados()
    this.atualizarInterface()

    alert(`Paciente ${proximoPaciente.nomeCompleto} foi chamado para atendimento médico!`)
  }

  alterarStatusPaciente(novoStatus) {
    if (!this.pacienteAtual) return

    this.pacienteAtual.status = novoStatus

    const index = this.pacientes.findIndex((p) => p.id === this.pacienteAtual.id)
    if (index !== -1) {
      this.pacientes[index] = this.pacienteAtual
    }

    this.salvarDados()
    this.atualizarInterface()
  }

  concluirAtendimento() {
    if (!this.pacienteAtual) return

    this.pacienteAtual.status = "atendido"
    this.pacienteAtual.horaFinalizacao = new Date().toLocaleString("pt-BR")

    // Adicionar ao histórico
    this.historico.push({ ...this.pacienteAtual })

    // Atualizar no array principal
    const index = this.pacientes.findIndex((p) => p.id === this.pacienteAtual.id)
    if (index !== -1) {
      this.pacientes[index] = this.pacienteAtual
    }

    this.pacienteAtual = null
    this.salvarDados()
    this.atualizarInterface()

    alert("Atendimento concluído com sucesso!")
  }

  exibirChamadaTriagem(paciente) {
    const elemento = document.getElementById("pacienteChamado")
    elemento.innerHTML = `
    <div style="font-size: 32px; color: #2196f3; margin-bottom: 15px; font-weight: bold;">
      ${paciente.nomeCompleto}
    </div>
    <div style="font-size: 18px; color: #1976d2; background: #e3f2fd; padding: 10px; border-radius: 8px; margin-bottom: 10px;">
      DIRIGIR-SE À TRIAGEM
    </div>
    <div style="font-size: 14px; color: #666;">
      Chamado às: ${paciente.horaChamadaTriagem || new Date().toLocaleString("pt-BR")}
    </div>
  `
  }

  exibirChamadaPaciente(paciente) {
    const elemento = document.getElementById("pacienteChamado")
    elemento.innerHTML = `
    <div style="font-size: 32px; color: #27ae60; margin-bottom: 15px; font-weight: bold;">
      ${paciente.nomeCompleto}
    </div>
    <div style="font-size: 18px; color: #1e8449; background: #e8f5e8; padding: 10px; border-radius: 8px; margin-bottom: 10px;">
      DIRIGIR-SE AO CONSULTÓRIO
    </div>
    <div style="font-size: 16px; color: #27ae60; margin-bottom: 5px;">
      Prioridade: ${this.obterNomePrioridade(paciente.cor)}
    </div>
    <div style="font-size: 14px; color: #666;">
      Chamado às: ${paciente.horaAtendimento || new Date().toLocaleString("pt-BR")}
    </div>
  `
  }

  obterNomePrioridade(cor) {
    const nomes = {
      vermelho: "Emergência",
      amarelo: "Urgente",
      verde: "Pouco Urgente",
      azul: "Não Urgente",
    }
    return nomes[cor] || "Não definida"
  }

  atualizarInterface() {
    this.atualizarPainelTriagem()
    this.atualizarAvaliacaoTriagem()
    this.atualizarPainelMedico()
    this.atualizarPainelPublico()
    this.atualizarEstatisticas()
  }

  atualizarPainelTriagem() {
    const chamarBtn = document.getElementById("chamarProximoTriagem")
    const iniciarBtn = document.getElementById("iniciarTriagem")
    const pacienteTriagemAtualDiv = document.getElementById("pacienteTriagemAtual")
    const dadosPacienteTriagemAtual = document.getElementById("dadosPacienteTriagemAtual")
    const listaFila = document.getElementById("listaFilaTriagemEspera")

    if (this.pacienteTriagemAtual) {
      if (this.pacienteTriagemAtual.status === "chamado-triagem") {
        chamarBtn.classList.add("hidden")
        iniciarBtn.classList.remove("hidden")
        pacienteTriagemAtualDiv.classList.remove("hidden")
        dadosPacienteTriagemAtual.innerHTML = this.gerarDadosBasicosHTML(this.pacienteTriagemAtual)
      } else if (this.pacienteTriagemAtual.status === "em-triagem") {
        chamarBtn.classList.add("hidden")
        iniciarBtn.classList.add("hidden")
        pacienteTriagemAtualDiv.classList.remove("hidden")

        // Mensagem direcionando para avaliação
        dadosPacienteTriagemAtual.innerHTML =
          this.gerarDadosBasicosHTML(this.pacienteTriagemAtual) +
          `<div class="alert-triagem">
    <strong>TRIAGEM EM ANDAMENTO</strong><br>
    Vá para a seção <strong>"Avaliação"</strong> para:<br>
    • Preencher dados da triagem<br>
    • Classificar por prioridade<br>
    • Encaminhar para fila médica
  </div>`
        return
      }
    } else {
      chamarBtn.classList.remove("hidden")
      iniciarBtn.classList.add("hidden")
      pacienteTriagemAtualDiv.classList.add("hidden")
    }

    // Atualizar fila de espera para triagem
    if (this.filaTriagem.length === 0) {
      listaFila.innerHTML = "<p>Nenhum paciente na fila de triagem.</p>"
    } else {
      listaFila.innerHTML = this.filaTriagem
        .map(
          (paciente, index) => `
            <div class="paciente-card">
              <h4>${index + 1}º - ${paciente.nomeCompleto} (${paciente.idade} anos)</h4>
              <p><strong>CPF:</strong> ${paciente.cpf}</p>
              <p><strong>Motivo:</strong> ${paciente.motivoVisita}</p>
              <p><strong>Cadastro:</strong> ${paciente.dataHoraCadastro}</p>
              <p><strong>Convênio:</strong> ${paciente.convenio}</p>
            </div>
          `,
        )
        .join("")
    }
  }

  atualizarAvaliacaoTriagem() {
    const pacienteParaAvaliar = document.getElementById("pacienteParaAvaliar")
    const nenhumPaciente = document.getElementById("nenhumPacienteTriagem")
    const dadosPacienteAvaliacao = document.getElementById("dadosPacienteAvaliacao")

    // Mostrar se há paciente em triagem
    if (this.pacienteTriagemAtual && this.pacienteTriagemAtual.status === "em-triagem") {
      pacienteParaAvaliar.classList.remove("hidden")
      nenhumPaciente.classList.add("hidden")

      dadosPacienteAvaliacao.innerHTML =
        this.gerarDadosBasicosHTML(this.pacienteTriagemAtual) +
        `<div class="alert-triagem">
    <strong>AVALIAÇÃO DE TRIAGEM</strong><br>
    Preencha os dados abaixo e classifique o paciente por prioridade.<br>
    <strong>O paciente será automaticamente encaminhado para a fila médica.</strong>
  </div>`
    } else {
      pacienteParaAvaliar.classList.add("hidden")
      nenhumPaciente.classList.remove("hidden")
    }
  }

  gerarDadosBasicosHTML(paciente) {
    return `
      <div class="dados-paciente-completos">
        <h5>Dados do Paciente</h5>
        <div class="dados-row">
          <div class="dados-item"><strong>Nome:</strong> ${paciente.nomeCompleto}</div>
          <div class="dados-item"><strong>Idade:</strong> ${paciente.idade} anos</div>
          <div class="dados-item"><strong>Sexo:</strong> ${paciente.sexo}</div>
          <div class="dados-item"><strong>CPF:</strong> ${paciente.cpf}</div>
        </div>
        <div class="dados-row">
          <div class="dados-item"><strong>Telefone:</strong> ${paciente.telefone}</div>
          <div class="dados-item"><strong>Convênio:</strong> ${paciente.convenio}</div>
          <div class="dados-item"><strong>Motivo:</strong> ${paciente.motivoVisita}</div>
          <div class="dados-item"><strong>Status:</strong> ${paciente.status}</div>
        </div>
      </div>
    `
  }

  atualizarPainelMedico() {
    const chamarBtn = document.getElementById("chamarProximo")
    const concluirBtn = document.getElementById("concluirAtendimento")
    const pacienteAtualDiv = document.getElementById("pacienteAtual")
    const dadosPacienteAtual = document.getElementById("dadosPacienteAtual")
    const listaFila = document.getElementById("listaFilaEspera")

    console.log("Atualizando painel médico. Fila médico:", this.filaMedico)

    if (this.pacienteAtual) {
      chamarBtn.classList.add("hidden")
      concluirBtn.classList.remove("hidden")
      pacienteAtualDiv.classList.remove("hidden")

      dadosPacienteAtual.innerHTML = this.gerarDadosCompletosHTML(this.pacienteAtual)
    } else {
      chamarBtn.classList.remove("hidden")
      concluirBtn.classList.add("hidden")
      pacienteAtualDiv.classList.add("hidden")
    }

    // Atualizar fila de espera médica
    if (this.filaMedico.length === 0) {
      listaFila.innerHTML = "<p>Nenhum paciente na fila de espera médica.</p>"
    } else {
      listaFila.innerHTML = this.filaMedico
        .map(
          (paciente, index) => `
            <div class="paciente-card ${paciente.cor}">
              <h4>${index + 1}º - ${paciente.nomeCompleto} (${paciente.idade} anos)</h4>
              <p><strong>Prioridade:</strong> ${this.obterNomePrioridade(paciente.cor)}</p>
              <p><strong>Motivo:</strong> ${paciente.motivoVisita}</p>
              <p><strong>Triagem:</strong> ${paciente.triagem ? paciente.triagem.dataHoraTriagem : "N/A"}</p>
              <p><strong>Status:</strong> ${paciente.status}</p>
            </div>
          `,
        )
        .join("")
    }
  }

  gerarDadosCompletosHTML(paciente) {
    return `
      <div class="paciente-card ${paciente.cor} ${paciente.status}">
        <div class="dados-paciente-completos">
          <h5>Dados Pessoais</h5>
          <div class="dados-row">
            <div class="dados-item"><strong>Nome:</strong> ${paciente.nomeCompleto}</div>
            <div class="dados-item"><strong>Idade:</strong> ${paciente.idade} anos</div>
            <div class="dados-item"><strong>Sexo:</strong> ${paciente.sexo}</div>
            <div class="dados-item"><strong>CPF:</strong> ${paciente.cpf}</div>
          </div>
          <div class="dados-row">
            <div class="dados-item"><strong>Telefone:</strong> ${paciente.telefone}</div>
            <div class="dados-item"><strong>Convênio:</strong> ${paciente.convenio}</div>
            <div class="dados-item"><strong>Prioridade:</strong> ${this.obterNomePrioridade(paciente.cor)}</div>
            <div class="dados-item"><strong>Status:</strong> ${paciente.status}</div>
          </div>
        </div>
        
        ${
          paciente.triagem
            ? `
        <div class="dados-paciente-completos">
          <h5>Dados da Triagem</h5>
          <div class="dados-row">
            <div class="dados-item"><strong>PA:</strong> ${paciente.triagem.sinaisVitais.pressaoArterial || "N/A"}</div>
            <div class="dados-item"><strong>Temp:</strong> ${paciente.triagem.sinaisVitais.temperatura || "N/A"}°C</div>
            <div class="dados-item"><strong>FC:</strong> ${paciente.triagem.sinaisVitais.frequenciaCardiaca || "N/A"} bpm</div>
            <div class="dados-item"><strong>Sat O2:</strong> ${paciente.triagem.sinaisVitais.saturacaoO2 || "N/A"}%</div>
          </div>
          <div class="dados-row">
            <div class="dados-item"><strong>Queixa:</strong> ${paciente.triagem.avaliacaoClinica.queixaPrincipal || "N/A"}</div>
            <div class="dados-item"><strong>Dor:</strong> ${paciente.triagem.avaliacaoDor.escalaDor}/10</div>
            <div class="dados-item"><strong>Consciência:</strong> ${paciente.triagem.nivelConsciencia}</div>
          </div>
          ${paciente.triagem.observacoes ? `<p><strong>Observações:</strong> ${paciente.triagem.observacoes}</p>` : ""}
        </div>
        `
            : ""
        }
        
        <p><strong>Hora do Atendimento:</strong> ${paciente.horaAtendimento || "N/A"}</p>
      </div>
    `
  }

  atualizarPainelPublico() {
    const pacienteChamado = document.getElementById("pacienteChamado")
    const listaProximos = document.getElementById("listaProximos")

    // PRIORIDADE 1: Verificar se há paciente em atendimento médico
    if (this.pacienteAtual && this.pacienteAtual.status === "em-atendimento") {
      this.exibirChamadaPaciente(this.pacienteAtual)
    }
    // PRIORIDADE 2: Verificar se há paciente chamado para triagem
    else if (
      this.pacienteTriagemAtual &&
      (this.pacienteTriagemAtual.status === "chamado-triagem" || this.pacienteTriagemAtual.status === "em-triagem")
    ) {
      this.exibirChamadaTriagem(this.pacienteTriagemAtual)
    }
    // PRIORIDADE 3: Nenhum paciente sendo chamado
    else {
      pacienteChamado.innerHTML = `
      <div style="font-size: 24px; color: #7f8c8d;">
        Nenhum paciente sendo chamado
      </div>
      <div style="font-size: 14px; color: #bdc3c7; margin-top: 10px;">
        Aguardando próxima chamada...
      </div>
    `
    }

    // Próximos 3 pacientes na fila médica
    const proximos = this.filaMedico.slice(0, 3)
    if (proximos.length === 0) {
      listaProximos.innerHTML = "<p>Nenhum paciente na fila médica.</p>"
    } else {
      listaProximos.innerHTML = proximos
        .map(
          (paciente, index) => `
          <div class="paciente-card ${paciente.cor}">
            <strong>${index + 1}º - ${paciente.nomeCompleto}</strong>
            <br>
            <small>${this.obterNomePrioridade(paciente.cor)}</small>
          </div>
        `,
        )
        .join("")
    }
  }

  atualizarEstatisticas() {
    const totalPacientes = this.pacientes.length
    const pacientesAtendidos = this.pacientes.filter((p) => p.status === "atendido").length
    const pacientesTriagem = this.filaTriagem.length + (this.pacienteTriagemAtual ? 1 : 0)
    const pacientesMedico = this.filaMedico.length + (this.pacienteAtual ? 1 : 0)
    const pacientesEspera = pacientesTriagem + pacientesMedico

    document.getElementById("totalPacientes").textContent = totalPacientes
    document.getElementById("pacientesAtendidos").textContent = pacientesAtendidos
    document.getElementById("pacientesEspera").textContent = pacientesEspera
  }

  salvarDados() {
    localStorage.setItem("pacientes", JSON.stringify(this.pacientes))
    localStorage.setItem("filaTriagem", JSON.stringify(this.filaTriagem))
    localStorage.setItem("filaMedico", JSON.stringify(this.filaMedico))
    localStorage.setItem("pacienteAtual", JSON.stringify(this.pacienteAtual))
    localStorage.setItem("pacienteTriagemAtual", JSON.stringify(this.pacienteTriagemAtual))
    localStorage.setItem("historico", JSON.stringify(this.historico))
    localStorage.setItem("proximoId", this.proximoId.toString())
  }

  iniciarAtualizacaoAutomatica() {
    // Atualizar painel público a cada 5 segundos
    setInterval(() => {
      if (document.getElementById("painel").classList.contains("active")) {
        this.atualizarPainelPublico()
        this.atualizarEstatisticas()
      }
    }, 5000)
  }
}

// Inicializar o sistema quando a página carregar
document.addEventListener("DOMContentLoaded", () => {
  new SistemaAtendimento()
})
