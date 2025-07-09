class SistemaAtendimento {
  constructor() {
    this.pacientes = JSON.parse(localStorage.getItem("pacientes")) || []
    this.filaTriagem = JSON.parse(localStorage.getItem("filaTriagem")) || []
    this.filaMedico = JSON.parse(localStorage.getItem("filaMedico")) || []
    this.pacienteAtual = JSON.parse(localStorage.getItem("pacienteAtual")) || null
    this.pacienteTriagemAtual = JSON.parse(localStorage.getItem("pacienteTriagemAtual")) || null
    this.historico = JSON.parse(localStorage.getItem("historico")) || []
    this.proximoId = Number.parseInt(localStorage.getItem("proximoId")) || 1
    
    // Dados de evolução médica
    this.pacienteEvolucao = null
    this.evolucoes = JSON.parse(localStorage.getItem("evolucoes")) || []
    this.contadorMedicamentos = 1
    this.contadorExames = 1

    // Dados do usuário logado
    this.currentUser = this.getCurrentUser()
    
    // Verificar se usuário está logado
    if (!this.currentUser) {
      this.redirectToLogin()
      return
    }

    this.initEventListeners()
    this.atualizarInterface()
    this.iniciarAtualizacaoAutomatica()
    this.configurarAcessoUsuario()
  }

  getCurrentUser() {
    // Tentar obter da sessionStorage primeiro
    const sessionUser = sessionStorage.getItem('currentUser')
    if (sessionUser) {
      return JSON.parse(sessionUser)
    }

    // Se não houver na session, verificar URL params
    const urlParams = new URLSearchParams(window.location.search)
    const user = urlParams.get('user')
    const type = urlParams.get('type')
    const name = urlParams.get('name')

    if (user && type && name) {
      const userData = { username: user, type: type, name: name }
      sessionStorage.setItem('currentUser', JSON.stringify(userData))
      return userData
    }

    return null
  }

  redirectToLogin() {
    window.location.href = 'login.html'
  }

  logout() {
    sessionStorage.removeItem('currentUser')
    sessionStorage.removeItem('loginTime')
    this.redirectToLogin()
  }

  configurarAcessoUsuario() {
    const userType = this.currentUser.type
    
    // Configurar navegação baseada no tipo de usuário
    const navButtons = document.querySelectorAll('.nav-btn')
    
    navButtons.forEach(btn => {
      const section = btn.dataset.section
      let hasAccess = false

      switch (userType) {
        case 'atendente':
          hasAccess = ['cadastro', 'fichas', 'painel'].includes(section)
          break
        case 'triagem':
          hasAccess = ['triagem', 'avaliacao', 'evolucao', 'fichas', 'painel'].includes(section)
          break
        case 'medico':
          hasAccess = ['medico', 'evolucao', 'fichas', 'painel'].includes(section)
          break
        case 'admin':
          hasAccess = true // Admin tem acesso a tudo
          break
        default:
          hasAccess = false
      }

      if (!hasAccess) {
        btn.style.display = 'none'
      }
    })

    // Adicionar informações do usuário no header
    this.adicionarInfoUsuario()
  }

  adicionarInfoUsuario() {
    const header = document.querySelector('header')
    
    // Criar div de informações do usuário
    const userInfo = document.createElement('div')
    userInfo.className = 'user-info'
    userInfo.innerHTML = `
      <div class="user-details">
        <span class="user-name">${this.currentUser.name}</span>
        <span class="user-type">${this.getUserTypeDisplay(this.currentUser.type)}</span>
      </div>
      <button class="logout-btn" onclick="sistema.logout()">Sair</button>
    `
    
    header.appendChild(userInfo)
  }

  getUserTypeDisplay(type) {
    const types = {
      'atendente': 'Atendente',
      'triagem': 'Triagem',
      'medico': 'Médico',
      'admin': 'Administrador'
    }
    return types[type] || type
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

    // Funcionalidades de Fichas
    document.getElementById("buscarPacienteBtn").addEventListener("click", () => {
      this.buscarPacientes()
    })

    document.getElementById("buscarPaciente").addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.buscarPacientes()
      }
    })

    document.getElementById("filtroStatus").addEventListener("change", () => {
      this.buscarPacientes()
    })

    document.getElementById("imprimirFicha").addEventListener("click", () => {
      this.imprimirFicha()
    })

    document.getElementById("salvarFicha").addEventListener("click", () => {
      this.salvarFicha()
    })

    document.getElementById("fecharFicha").addEventListener("click", () => {
      this.fecharFicha()
    })

    // Funcionalidades de Evolução Médica
    document.getElementById("iniciarEvolucao").addEventListener("click", () => {
      this.iniciarEvolucao()
    })

    document.getElementById("finalizarEvolucao").addEventListener("click", () => {
      this.finalizarEvolucao()
    })

    document.getElementById("evolucaoForm").addEventListener("submit", (e) => {
      e.preventDefault()
      this.salvarEvolucao()
    })

    document.getElementById("adicionarMedicamento").addEventListener("click", () => {
      this.adicionarMedicamento()
    })

    document.getElementById("adicionarExame").addEventListener("click", () => {
      this.adicionarExame()
    })

    // Busca de evoluções
    document.getElementById("buscarEvolucaoBtn").addEventListener("click", () => {
      this.buscarEvolucoes()
    })

    document.getElementById("buscarEvolucao").addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.buscarEvolucoes()
      }
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
    
    // Se for a seção de evolução, atualizar o histórico
    if (secao === 'evolucao') {
      this.atualizarHistoricoEvolucoes()
    }
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

    // Classificação automática baseada no motivo da visita
    const classificacaoAutomatica = this.classificarMotivoVisita(dadosFormulario.motivoVisita)

    const paciente = {
      id: this.proximoId++,
      ...dadosFormulario,
      dataHoraCadastro: new Date().toLocaleString("pt-BR"),
      status: "aguardando-triagem",
      idade: this.calcularIdade(dadosFormulario.dataNascimento),
      triagem: null,
      // Dados da classificação automática
      cor: classificacaoAutomatica.cor,
      prioridade: classificacaoAutomatica.prioridade,
      classificacaoAutomatica: classificacaoAutomatica
    }

    this.pacientes.push(paciente)
    this.filaTriagem.push(paciente)
    this.salvarDados()

    document.getElementById("cadastroForm").reset()
    
    // Mensagem com a classificação automática
    const mensagemClassificacao = `Classificação Automática: ${classificacaoAutomatica.nome}\nMotivo: ${classificacaoAutomatica.motivo}`
    alert(`Paciente ${dadosFormulario.nomeCompleto} cadastrado com sucesso!\nID: ${paciente.id}\n${mensagemClassificacao}\n\nDirigir-se à triagem para avaliação detalhada.`)

    this.atualizarInterface()
  }

  classificarMotivoVisita(motivo) {
    const motivoLower = motivo.toLowerCase()
    
    // Palavras-chave para classificação VERMELHA (Urgente - atendimento imediato)
    const palavrasVermelhas = [
      'dor no peito', 'infarto', 'ataque cardíaco', 'parada cardíaca', 'parada respiratória',
      'falta de ar', 'dificuldade para respirar', 'asfixia', 'sufocamento',
      'convulsão', 'desmaio', 'inconsciente', 'coma',
      'hemorragia', 'sangramento', 'sangue', 'hemorragia grave',
      'trauma craniano', 'trauma na cabeça', 'batida na cabeça',
      'acidente', 'atropelamento', 'queda grave',
      'queimadura', 'queimadura grave', 'queimadura de terceiro grau',
      'envenenamento', 'intoxicação', 'overdose',
      'parto', 'trabalho de parto', 'contrações',
      'emergência', 'urgente', 'grave', 'crítico'
    ]

    // Palavras-chave para classificação AMARELA (Moderado - espera média)
    const palavrasAmarelas = [
      'febre alta', 'febre muito alta', 'febre acima de 39',
      'dor abdominal', 'dor no abdômen', 'dor de barriga',
      'vômito', 'vômitos', 'náusea', 'náuseas',
      'diarreia', 'diarréia', 'desidratação',
      'fratura', 'quebrado', 'luxação', 'entorse',
      'corte', 'ferimento', 'ferida', 'laceração',
      'dor de cabeça', 'enxaqueca', 'migrânea',
      'tontura', 'vertigem', 'desequilíbrio',
      'hipertensão', 'pressão alta', 'pressão arterial alta',
      'diabetes', 'glicemia alta', 'glicemia baixa',
      'asma', 'crise de asma', 'bronquite',
      'moderado', 'médio', 'moderada'
    ]

    // Palavras-chave para classificação VERDE (Leve - pode esperar mais tempo)
    const palavrasVerdes = [
      'consulta', 'check-up', 'exame', 'exames',
      'dor leve', 'dor suave', 'dor pequena',
      'resfriado', 'gripe', 'tosse', 'coriza',
      'alergia', 'reação alérgica', 'coceira',
      'pequeno corte', 'arranhão', 'machucado leve',
      'dor nas costas', 'dor nas pernas', 'dor muscular',
      'febre baixa', 'febre leve',
      'leve', 'suave', 'pequeno', 'menor'
    ]

    // Verificar classificação VERMELHA (maior prioridade)
    for (const palavra of palavrasVermelhas) {
      if (motivoLower.includes(palavra)) {
        return {
          cor: 'vermelho',
          prioridade: 1,
          nome: 'Vermelho - Emergência',
          motivo: 'Risco de vida imediato',
          tempo: 'Atendimento imediato'
        }
      }
    }

    // Verificar classificação AMARELA
    for (const palavra of palavrasAmarelas) {
      if (motivoLower.includes(palavra)) {
        return {
          cor: 'amarelo',
          prioridade: 2,
          nome: 'Amarelo - Moderado',
          motivo: 'Risco de vida potencial',
          tempo: 'Espera média'
        }
      }
    }

    // Verificar classificação VERDE
    for (const palavra of palavrasVerdes) {
      if (motivoLower.includes(palavra)) {
        return {
          cor: 'verde',
          prioridade: 3,
          nome: 'Verde - Leve',
          motivo: 'Sem risco de vida',
          tempo: 'Pode esperar mais tempo'
        }
      }
    }

    // Classificação padrão VERDE se não encontrar palavras-chave específicas
    return {
      cor: 'verde',
      prioridade: 3,
      nome: 'Verde - Leve',
      motivo: 'Sem risco de vida',
      tempo: 'Pode esperar mais tempo'
    }
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

  chamarPacienteParaTriagem(idPaciente) {
    if (this.pacienteTriagemAtual) {
      alert("Há um paciente em triagem. Finalize a triagem atual primeiro.")
      return
    }

    const paciente = this.filaTriagem.find((p) => p.id === idPaciente)
    if (!paciente) {
      alert("Paciente não encontrado na fila de triagem!")
      return
    }

    // Remover da fila
    const index = this.filaTriagem.findIndex((p) => p.id === idPaciente)
    this.filaTriagem.splice(index, 1)

    paciente.status = "chamado-triagem"
    paciente.horaChamadaTriagem = new Date().toLocaleString("pt-BR")

    this.pacienteTriagemAtual = paciente

    // Atualizar no array principal
    const indexPrincipal = this.pacientes.findIndex((p) => p.id === paciente.id)
    if (indexPrincipal !== -1) {
      this.pacientes[indexPrincipal] = paciente
    }

    this.salvarDados()
    this.atualizarInterface()

    alert(`Paciente ${paciente.nomeCompleto} foi chamado para triagem!`)
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

  obterStatusFormatado(status) {
    const statusFormatados = {
      "aguardando-triagem": "Aguardando Triagem",
      "chamado-triagem": "Chamado para Triagem",
      "em-triagem": "Em Triagem",
      "aguardando-medico": "Aguardando Médico",
      "em-atendimento": "Em Atendimento",
      "atendido": "Atendido",
      "concluido": "Concluído"
    }
    return statusFormatados[status] || status
  }

  atualizarInterface() {
    this.atualizarPainelTriagem()
    this.atualizarAvaliacaoTriagem()
    this.atualizarPainelMedico()
    this.atualizarPainelPublico()
    this.atualizarEstatisticas()
    
    // Atualizar histórico de evoluções se estiver na seção de evolução
    if (document.getElementById("evolucao").classList.contains("active")) {
      this.atualizarHistoricoEvolucoes()
    }
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
    localStorage.setItem("evolucoes", JSON.stringify(this.evolucoes))
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

  // Funcionalidades de Fichas
  buscarPacientes() {
    const termo = document.getElementById("buscarPaciente").value.toLowerCase().trim()
    const filtroStatus = document.getElementById("filtroStatus").value
    const listaFichas = document.getElementById("listaFichas")

    let pacientesFiltrados = this.pacientes

    // Filtrar por status
    if (filtroStatus !== "todos") {
      pacientesFiltrados = pacientesFiltrados.filter(p => p.status === filtroStatus)
    }

    // Filtrar por termo de busca
    if (termo) {
      pacientesFiltrados = pacientesFiltrados.filter(p => 
        p.nomeCompleto.toLowerCase().includes(termo) ||
        p.id.toString().includes(termo) ||
        p.cpf.includes(termo)
      )
    }

    if (pacientesFiltrados.length === 0) {
      listaFichas.innerHTML = '<p class="text-center">Nenhum paciente encontrado.</p>'
      return
    }

    listaFichas.innerHTML = pacientesFiltrados
      .map(paciente => `
        <div class="ficha-paciente" onclick="sistema.gerarFicha(${paciente.id})">
          <h4>${paciente.nomeCompleto} (ID: ${paciente.id})</h4>
          <div class="dados-rapidos">
            <div><strong>Idade:</strong> ${paciente.idade} anos</div>
            <div><strong>Status:</strong> ${this.obterStatusFormatado(paciente.status)}</div>
            <div><strong>Prioridade:</strong> ${this.obterNomePrioridade(paciente.cor)}</div>
            <div><strong>Motivo:</strong> ${paciente.motivoVisita.substring(0, 50)}${paciente.motivoVisita.length > 50 ? '...' : ''}</div>
          </div>
          <div class="acoes-ficha">
            <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); sistema.gerarFicha(${paciente.id})">
              Gerar Ficha
            </button>
          </div>
        </div>
      `)
      .join("")
  }

  gerarFicha(idPaciente) {
    const paciente = this.pacientes.find(p => p.id === idPaciente)
    if (!paciente) {
      alert("Paciente não encontrado!")
      return
    }

    const ficha = this.criarConteudoFicha(paciente)
    
    document.getElementById("conteudoFicha").innerHTML = ficha
    document.getElementById("fichaGerada").classList.remove("hidden")
    
    // Salvar ficha no localStorage
    this.salvarFichaNoHistorico(paciente, ficha)
  }

  criarConteudoFicha(paciente) {
    const dataHora = new Date().toLocaleString("pt-BR")
    const prioridade = this.obterNomePrioridade(paciente.cor)
    
    let ficha = `
╔══════════════════════════════════════════════════════════════════════════════╗
║                           FICHA DE ATENDIMENTO HOSPITALAR                   ║
╚══════════════════════════════════════════════════════════════════════════════╝

Data/Hora de Emissão: ${dataHora}
ID do Paciente: ${paciente.id}

══════════════════════════════════════════════════════════════════════════════════
DADOS PESSOAIS
══════════════════════════════════════════════════════════════════════════════════
Nome Completo: ${paciente.nomeCompleto}
CPF: ${paciente.cpf}
RG: ${paciente.rg || 'Não informado'}
Data de Nascimento: ${paciente.dataNascimento}
Idade: ${paciente.idade} anos
Sexo: ${paciente.sexo}
Estado Civil: ${paciente.estadoCivil || 'Não informado'}

Telefone: ${paciente.telefone}
E-mail: ${paciente.email || 'Não informado'}
Endereço: ${paciente.endereco}

Convênio: ${paciente.convenio}
Número da Carteirinha: ${paciente.numeroCarteirinha || 'Não informado'}
Contato de Emergência: ${paciente.contatoEmergencia || 'Não informado'}

══════════════════════════════════════════════════════════════════════════════════
DADOS DO ATENDIMENTO
══════════════════════════════════════════════════════════════════════════════════
Motivo da Visita: ${paciente.motivoVisita}
Data/Hora do Cadastro: ${paciente.dataHoraCadastro}
Status Atual: ${this.obterStatusFormatado(paciente.status)}
Classificação de Prioridade: ${prioridade}
Cor de Triagem: ${paciente.cor ? paciente.cor.toUpperCase() : 'Não definida'}`

    // Adicionar dados da triagem se existirem
    if (paciente.triagem) {
      ficha += `

══════════════════════════════════════════════════════════════════════════════════
DADOS DA TRIAGEM
══════════════════════════════════════════════════════════════════════════════════
Data/Hora da Triagem: ${paciente.triagem.dataHoraTriagem}

SINAIS VITAIS:
• Pressão Arterial: ${paciente.triagem.sinaisVitais.pressaoArterial || 'Não aferido'}
• Temperatura: ${paciente.triagem.sinaisVitais.temperatura || 'Não aferido'}°C
• Frequência Cardíaca: ${paciente.triagem.sinaisVitais.frequenciaCardiaca || 'Não aferido'} bpm
• Saturação O2: ${paciente.triagem.sinaisVitais.saturacaoO2 || 'Não aferido'}%
• Frequência Respiratória: ${paciente.triagem.sinaisVitais.frequenciaRespiratoria || 'Não aferido'} rpm
• Peso: ${paciente.triagem.sinaisVitais.peso || 'Não aferido'} kg

AVALIAÇÃO CLÍNICA:
• Queixa Principal: ${paciente.triagem.avaliacaoClinica.queixaPrincipal || 'Não informado'}
• Sintomas: ${paciente.triagem.avaliacaoClinica.sintomas.join(', ') || 'Nenhum sintoma registrado'}
• Outros Sintomas: ${paciente.triagem.avaliacaoClinica.outrosSintomas || 'Não informado'}
• Histórico Médico: ${paciente.triagem.avaliacaoClinica.historicoMedico || 'Não informado'}
• Medicamentos em Uso: ${paciente.triagem.avaliacaoClinica.medicamentosUso || 'Não informado'}

AVALIAÇÃO DE DOR:
• Escala de Dor: ${paciente.triagem.avaliacaoDor.escalaDor}/10
• Localização da Dor: ${paciente.triagem.avaliacaoDor.localizacaoDor || 'Não informado'}

Nível de Consciência: ${paciente.triagem.nivelConsciencia}
Observações: ${paciente.triagem.observacoes || 'Nenhuma observação'}`

      if (paciente.horaFimTriagem) {
        ficha += `
Hora de Conclusão da Triagem: ${paciente.horaFimTriagem}`
      }
    }

    // Adicionar dados do atendimento médico se existirem
    if (paciente.horaAtendimento) {
      ficha += `

══════════════════════════════════════════════════════════════════════════════════
DADOS DO ATENDIMENTO MÉDICO
══════════════════════════════════════════════════════════════════════════════════
Hora de Início do Atendimento: ${paciente.horaAtendimento}`

      if (paciente.horaFinalizacao) {
        ficha += `
Hora de Finalização do Atendimento: ${paciente.horaFinalizacao}`
      }
    }

    ficha += `

══════════════════════════════════════════════════════════════════════════════════
OBSERVAÇÕES FINAIS
══════════════════════════════════════════════════════════════════════════════════
Esta ficha foi gerada automaticamente pelo Sistema de Atendimento Hospitalar.

╔══════════════════════════════════════════════════════════════════════════════╗
║                           FIM DA FICHA DE ATENDIMENTO                       ║
╚══════════════════════════════════════════════════════════════════════════════╝`

    return `<div class="conteudo-ficha">${ficha}</div>`
  }

  salvarFichaNoHistorico(paciente, conteudoFicha) {
    const fichas = JSON.parse(localStorage.getItem("fichasEmitidas")) || []
    const ficha = {
      id: Date.now(),
      pacienteId: paciente.id,
      pacienteNome: paciente.nomeCompleto,
      dataEmissao: new Date().toLocaleString("pt-BR"),
      conteudo: conteudoFicha,
      status: paciente.status
    }
    
    fichas.push(ficha)
    localStorage.setItem("fichasEmitidas", JSON.stringify(fichas))
  }

  imprimirFicha() {
    const conteudoFicha = document.getElementById("conteudoFicha").innerHTML
    const janelaImpressao = window.open("", "_blank")
    
    janelaImpressao.document.write(`
      <html>
        <head>
          <title>Ficha de Atendimento</title>
          <style>
            body { font-family: 'Courier New', monospace; font-size: 12px; line-height: 1.4; }
            .conteudo-ficha { white-space: pre-line; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          ${conteudoFicha}
        </body>
      </html>
    `)
    
    janelaImpressao.document.close()
    janelaImpressao.print()
  }

  salvarFicha() {
    const conteudoFicha = document.getElementById("conteudoFicha").textContent
    const nomeArquivo = `ficha_atendimento_${new Date().toISOString().slice(0, 10)}.txt`
    
    const blob = new Blob([conteudoFicha], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = nomeArquivo
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    alert("Ficha salva com sucesso!")
  }

  fecharFicha() {
    document.getElementById("fichaGerada").classList.add("hidden")
  }

  // Funcionalidades de Evolução Médica
  iniciarEvolucao() {
    if (!this.pacienteAtual) {
      alert("Não há paciente em atendimento. Chame um paciente primeiro.")
      return
    }

    this.pacienteEvolucao = this.pacienteAtual
    document.getElementById("pacienteEvolucao").classList.remove("hidden")
    document.getElementById("iniciarEvolucao").classList.add("hidden")
    document.getElementById("finalizarEvolucao").classList.remove("hidden")
    
    document.getElementById("dadosPacienteEvolucao").innerHTML = this.gerarDadosCompletosHTML(this.pacienteEvolucao)
    
    this.atualizarHistoricoEvolucoes()
  }

  finalizarEvolucao() {
    this.pacienteEvolucao = null
    document.getElementById("pacienteEvolucao").classList.add("hidden")
    document.getElementById("iniciarEvolucao").classList.remove("hidden")
    document.getElementById("finalizarEvolucao").classList.add("hidden")
    
    // Limpar formulário
    document.getElementById("evolucaoForm").reset()
    
    // Limpar medicamentos e exames adicionais
    this.limparItensAdicionais()
  }

  cancelarEvolucao() {
    if (confirm("Tem certeza que deseja cancelar a evolução? Todos os dados serão perdidos.")) {
      this.finalizarEvolucao()
    }
  }

  salvarEvolucao() {
    if (!this.pacienteEvolucao) {
      alert("Nenhum paciente selecionado para evolução.")
      return
    }

    // Coletar dados da evolução
    const evolucao = {
      id: Date.now(),
      pacienteId: this.pacienteEvolucao.id,
      pacienteNome: this.pacienteEvolucao.nomeCompleto,
      dataHora: new Date().toLocaleString("pt-BR"),
      medico: this.currentUser.name,
      
      // Evolução clínica
      queixaAtual: document.getElementById("queixaAtual").value,
      exameFisico: document.getElementById("exameFisico").value,
      hipoteseDiagnostica: document.getElementById("hipoteseDiagnostica").value,
      conduta: document.getElementById("conduta").value,
      
      // Medicamentos
      medicamentos: this.coletarMedicamentos(),
      
      // Exames
      exames: this.coletarExames(),
      
      // Orientações e encaminhamentos
      orientacoes: document.getElementById("orientacoes").value,
      encaminhamento: document.getElementById("encaminhamento").value,
      dataRetorno: document.getElementById("dataRetorno").value
    }

    // Validar campos obrigatórios
    if (!evolucao.queixaAtual || !evolucao.exameFisico || !evolucao.hipoteseDiagnostica || !evolucao.conduta) {
      alert("Por favor, preencha todos os campos obrigatórios da evolução clínica.")
      return
    }

    // Salvar evolução
    this.evolucoes.push(evolucao)
    this.salvarDados()

    alert("Evolução salva com sucesso!")
    this.finalizarEvolucao()
    
    // Atualizar o histórico de evoluções
    this.atualizarHistoricoEvolucoes()
  }

  coletarMedicamentos() {
    const medicamentos = []
    const medicamentoItems = document.querySelectorAll(".medicamento-item")
    
    medicamentoItems.forEach((item, index) => {
      const medicamento = {
        nome: item.querySelector(`#medicamento${index + 1}`).value,
        dosagem: item.querySelector(`#dosagem${index + 1}`).value,
        posologia: item.querySelector(`#posologia${index + 1}`).value,
        duracao: item.querySelector(`#duracao${index + 1}`).value,
        observacoes: item.querySelector(`#observacoes${index + 1}`).value
      }
      
      // Incluir apenas medicamentos que tenham pelo menos o nome preenchido
      if (medicamento.nome.trim()) {
        medicamentos.push(medicamento)
      }
    })
    
    return medicamentos
  }

  coletarExames() {
    const exames = []
    const exameItems = document.querySelectorAll(".exame-item")
    
    exameItems.forEach((item, index) => {
      const exame = {
        nome: item.querySelector(`#exame${index + 1}`).value,
        urgencia: item.querySelector(`#urgencia${index + 1}`).value,
        justificativa: item.querySelector(`#justificativa${index + 1}`).value
      }
      
      // Incluir apenas exames que tenham pelo menos o nome preenchido
      if (exame.nome.trim()) {
        exames.push(exame)
      }
    })
    
    return exames
  }

  adicionarMedicamento() {
    this.contadorMedicamentos++
    const medicamentosLista = document.getElementById("medicamentosLista")
    
    const medicamentoItem = document.createElement("div")
    medicamentoItem.className = "medicamento-item"
    medicamentoItem.innerHTML = `
      <button type="button" class="btn-remover" onclick="this.parentElement.remove()">Remover</button>
      <h5>Medicamento ${this.contadorMedicamentos}</h5>
      <div class="form-row">
        <div class="form-group">
          <label for="medicamento${this.contadorMedicamentos}">Medicamento:</label>
          <input type="text" id="medicamento${this.contadorMedicamentos}" placeholder="Nome do medicamento">
        </div>
        <div class="form-group">
          <label for="dosagem${this.contadorMedicamentos}">Dosagem:</label>
          <input type="text" id="dosagem${this.contadorMedicamentos}" placeholder="Ex: 500mg">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="posologia${this.contadorMedicamentos}">Posologia:</label>
          <input type="text" id="posologia${this.contadorMedicamentos}" placeholder="Ex: 1 comprimido 3x ao dia">
        </div>
        <div class="form-group">
          <label for="duracao${this.contadorMedicamentos}">Duração:</label>
          <input type="text" id="duracao${this.contadorMedicamentos}" placeholder="Ex: 7 dias">
        </div>
      </div>
      <div class="form-group">
        <label for="observacoes${this.contadorMedicamentos}">Observações:</label>
        <textarea id="observacoes${this.contadorMedicamentos}" placeholder="Observações sobre o medicamento"></textarea>
      </div>
    `
    
    medicamentosLista.appendChild(medicamentoItem)
  }

  adicionarExame() {
    this.contadorExames++
    const examesLista = document.getElementById("examesLista")
    
    const exameItem = document.createElement("div")
    exameItem.className = "exame-item"
    exameItem.innerHTML = `
      <button type="button" class="btn-remover" onclick="this.parentElement.remove()">Remover</button>
      <h5>Exame ${this.contadorExames}</h5>
      <div class="form-row">
        <div class="form-group">
          <label for="exame${this.contadorExames}">Exame:</label>
          <input type="text" id="exame${this.contadorExames}" placeholder="Nome do exame">
        </div>
        <div class="form-group">
          <label for="urgencia${this.contadorExames}">Urgência:</label>
          <select id="urgencia${this.contadorExames}">
            <option value="">Selecione a urgência</option>
            <option value="eletivo">Eletivo</option>
            <option value="urgente">Urgente</option>
            <option value="emergencial">Emergencial</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label for="justificativa${this.contadorExames}">Justificativa:</label>
        <textarea id="justificativa${this.contadorExames}" placeholder="Justificativa para solicitação do exame"></textarea>
      </div>
    `
    
    examesLista.appendChild(exameItem)
  }

  limparItensAdicionais() {
    // Limpar todos os medicamentos e recriar o primeiro
    const medicamentosLista = document.getElementById("medicamentosLista")
    medicamentosLista.innerHTML = `
      <div class="medicamento-item">
        <button type="button" class="btn-remover" onclick="this.parentElement.remove()">Remover</button>
        <h5>Medicamento 1</h5>
        <div class="form-row">
          <div class="form-group">
            <label for="medicamento1">Medicamento:</label>
            <input type="text" id="medicamento1" placeholder="Nome do medicamento">
          </div>
          <div class="form-group">
            <label for="dosagem1">Dosagem:</label>
            <input type="text" id="dosagem1" placeholder="Ex: 500mg">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="posologia1">Posologia:</label>
            <input type="text" id="posologia1" placeholder="Ex: 1 comprimido 3x ao dia">
          </div>
          <div class="form-group">
            <label for="duracao1">Duração:</label>
            <input type="text" id="duracao1" placeholder="Ex: 7 dias">
          </div>
        </div>
        <div class="form-group">
          <label for="observacoes1">Observações:</label>
          <textarea id="observacoes1" placeholder="Observações sobre o medicamento"></textarea>
        </div>
      </div>
    `
    
    // Limpar todos os exames e recriar o primeiro
    const examesLista = document.getElementById("examesLista")
    examesLista.innerHTML = `
      <div class="exame-item">
        <button type="button" class="btn-remover" onclick="this.parentElement.remove()">Remover</button>
        <h5>Exame 1</h5>
        <div class="form-row">
          <div class="form-group">
            <label for="exame1">Exame:</label>
            <input type="text" id="exame1" placeholder="Nome do exame">
          </div>
          <div class="form-group">
            <label for="urgencia1">Urgência:</label>
            <select id="urgencia1">
              <option value="">Selecione a urgência</option>
              <option value="eletivo">Eletivo</option>
              <option value="urgente">Urgente</option>
              <option value="emergencial">Emergencial</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label for="justificativa1">Justificativa:</label>
          <textarea id="justificativa1" placeholder="Justificativa para solicitação do exame"></textarea>
        </div>
      </div>
    `
    
    // Resetar contadores
    this.contadorMedicamentos = 1
    this.contadorExames = 1
  }

  atualizarHistoricoEvolucoes() {
    const listaEvolucoes = document.getElementById("listaEvolucoes")
    
    if (!this.pacienteEvolucao) {
      listaEvolucoes.innerHTML = '<p class="text-center">Selecione um paciente para visualizar o histórico de evoluções.</p>'
      return
    }
    
    const evolucoesPaciente = this.evolucoes.filter(e => e.pacienteId === this.pacienteEvolucao.id)
    
    if (evolucoesPaciente.length === 0) {
      listaEvolucoes.innerHTML = '<p class="text-center">Nenhuma evolução registrada para este paciente.</p>'
      return
    }
    
    this.exibirEvolucoes(evolucoesPaciente)
  }

  buscarEvolucoes() {
    const termoBusca = document.getElementById("buscarEvolucao").value.toLowerCase().trim();
    // Limpa o paciente em evolução para mostrar todas as evoluções
    this.pacienteEvolucao = null;

    let evolucoesFiltradas = this.evolucoes;
    if (termoBusca) {
      evolucoesFiltradas = this.evolucoes.filter(evolucao =>
        evolucao.pacienteNome.toLowerCase().includes(termoBusca) ||
        String(evolucao.pacienteId).includes(termoBusca) ||
        evolucao.medico.toLowerCase().includes(termoBusca) ||
        evolucao.queixaAtual.toLowerCase().includes(termoBusca) ||
        evolucao.hipoteseDiagnostica.toLowerCase().includes(termoBusca)
      );
    }

    if (evolucoesFiltradas.length === 0) {
      document.getElementById("listaEvolucoes").innerHTML = '<p class="text-center">Nenhuma evolução encontrada para a busca realizada.</p>';
      return;
    }

    this.exibirEvolucoes(evolucoesFiltradas);
  }

  exibirEvolucoes(evolucoes) {
    const listaEvolucoes = document.getElementById("listaEvolucoes")
    
    listaEvolucoes.innerHTML = evolucoes
      .sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora))
      .map(evolucao => `
        <div class="evolucao-card">
          <div class="evolucao-header" onclick="sistema.visualizarEvolucao(${evolucao.id})">
            <h4>Evolução - ${evolucao.dataHora}</h4>
            <div class="data-evolucao">Paciente: ${evolucao.pacienteNome} | Médico: ${evolucao.medico}</div>
            <div class="resumo">
              <strong>Queixa:</strong> ${evolucao.queixaAtual.substring(0, 100)}${evolucao.queixaAtual.length > 100 ? '...' : ''}<br>
              <strong>Hipótese:</strong> ${evolucao.hipoteseDiagnostica.substring(0, 100)}${evolucao.hipoteseDiagnostica.length > 100 ? '...' : ''}
            </div>
          </div>
          <div class="evolucao-actions">
            <button class="btn btn-secondary" onclick="sistema.imprimirEvolucao(${evolucao.id})">Imprimir</button>
            <button class="btn btn-secondary" onclick="sistema.salvarEvolucaoArquivo(${evolucao.id})">Salvar</button>
          </div>
        </div>
      `)
      .join("")
  }

  visualizarEvolucao(idEvolucao) {
    const evolucao = this.evolucoes.find(e => e.id === idEvolucao)
    if (!evolucao) return
    
    const evolucaoCompleta = this.gerarEvolucaoCompletaHTML(evolucao)
    
    // Criar modal para visualizar evolução
    const modal = document.createElement("div")
    modal.className = "modal-evolucao"
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>Evolução Médica - ${evolucao.dataHora}</h3>
          <button onclick="this.closest('.modal-evolucao').remove()" class="btn-fechar">×</button>
        </div>
        <div class="modal-body">
          ${evolucaoCompleta}
        </div>
      </div>
    `
    
    document.body.appendChild(modal)
  }

  gerarEvolucaoCompletaHTML(evolucao) {
    return `
      <div class="evolucao-completa">
        <div class="evolucao-section">
          <h4>Dados do Paciente</h4>
          <p><strong>Nome:</strong> ${evolucao.pacienteNome}</p>
          <p><strong>Data/Hora:</strong> ${evolucao.dataHora}</p>
          <p><strong>Médico:</strong> ${evolucao.medico}</p>
        </div>
        
        <div class="evolucao-section">
          <h4>Evolução Clínica</h4>
          <p><strong>Queixa Atual:</strong> ${evolucao.queixaAtual}</p>
          <p><strong>Exame Físico:</strong> ${evolucao.exameFisico}</p>
          <p><strong>Hipótese Diagnóstica:</strong> ${evolucao.hipoteseDiagnostica}</p>
          <p><strong>Conduta:</strong> ${evolucao.conduta}</p>
        </div>
        
        <div class="evolucao-section">
          <h4>Medicamentos Prescritos</h4>
          ${evolucao.medicamentos.length > 0 ? 
            evolucao.medicamentos.map(med => `
              <div class="medicamento-prescrito">
                <p><strong>${med.nome}</strong> - ${med.dosagem}</p>
                <p><strong>Posologia:</strong> ${med.posologia}</p>
                <p><strong>Duração:</strong> ${med.duracao}</p>
                ${med.observacoes ? `<p><strong>Observações:</strong> ${med.observacoes}</p>` : ''}
              </div>
            `).join('') : 
            '<p class="text-center" style="color: #64748b; font-style: italic;">Nenhum medicamento prescrito</p>'
          }
        </div>
        
        <div class="evolucao-section">
          <h4>Exames Solicitados</h4>
          ${evolucao.exames.length > 0 ? 
            evolucao.exames.map(ex => `
              <div class="exame-solicitado">
                <p><strong>${ex.nome}</strong> - ${ex.urgencia}</p>
                <p><strong>Justificativa:</strong> ${ex.justificativa}</p>
              </div>
            `).join('') : 
            '<p class="text-center" style="color: #64748b; font-style: italic;">Nenhum exame solicitado</p>'
          }
        </div>
        
        <div class="evolucao-section">
          <h4>Orientações e Encaminhamentos</h4>
          ${evolucao.orientacoes ? `<p><strong>Orientações:</strong> ${evolucao.orientacoes}</p>` : ''}
          ${evolucao.encaminhamento ? `<p><strong>Encaminhamento:</strong> ${evolucao.encaminhamento}</p>` : ''}
          ${evolucao.dataRetorno ? `<p><strong>Data de Retorno:</strong> ${evolucao.dataRetorno}</p>` : ''}
        </div>
      </div>
    `
  }

  imprimirEvolucao(idEvolucao) {
    const evolucao = this.evolucoes.find(e => e.id === idEvolucao)
    if (!evolucao) return
    
    const conteudoEvolucao = this.criarConteudoEvolucao(evolucao)
    
    const janelaImpressao = window.open('', '_blank')
    janelaImpressao.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Evolução Médica - ${evolucao.pacienteNome}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            line-height: 1.6;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }
          .section {
            margin-bottom: 20px;
            page-break-inside: avoid;
          }
          .section h3 {
            color: #0f766e;
            border-bottom: 1px solid #ccc;
            padding-bottom: 5px;
          }
          .medicamento, .exame {
            background: #f9f9f9;
            padding: 10px;
            margin: 10px 0;
            border-left: 3px solid #0f766e;
          }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        ${conteudoEvolucao}
        <div class="no-print" style="margin-top: 30px; text-align: center;">
          <button onclick="window.print()">Imprimir</button>
          <button onclick="window.close()">Fechar</button>
        </div>
      </body>
      </html>
    `)
    janelaImpressao.document.close()
  }

  salvarEvolucaoArquivo(idEvolucao) {
    const evolucao = this.evolucoes.find(e => e.id === idEvolucao)
    if (!evolucao) return
    
    const conteudoEvolucao = this.criarConteudoEvolucao(evolucao)
    const nomeArquivo = `evolucao_${evolucao.pacienteNome.replace(/\s+/g, '_')}_${evolucao.dataHora.replace(/[\/\s:]/g, '_')}.txt`
    
    const blob = new Blob([conteudoEvolucao], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = nomeArquivo
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  criarConteudoEvolucao(evolucao) {
    const paciente = this.pacientes.find(p => p.id === evolucao.pacienteId)
    
    return `
      <div class="header">
        <h1>EVOLUÇÃO MÉDICA</h1>
        <h2>Hospital - Sistema de Atendimento</h2>
      </div>

      <div class="section">
        <h3>DADOS DO PACIENTE</h3>
        <p><strong>Nome:</strong> ${evolucao.pacienteNome}</p>
        ${paciente ? `
        <p><strong>CPF:</strong> ${paciente.cpf}</p>
        <p><strong>Data de Nascimento:</strong> ${paciente.dataNascimento}</p>
        <p><strong>Idade:</strong> ${this.calcularIdade(paciente.dataNascimento)} anos</p>
        <p><strong>Telefone:</strong> ${paciente.telefone}</p>
        <p><strong>Endereço:</strong> ${paciente.endereco}</p>
        ` : ''}
        <p><strong>Data/Hora da Evolução:</strong> ${evolucao.dataHora}</p>
        <p><strong>Médico Responsável:</strong> ${evolucao.medico}</p>
      </div>

      <div class="section">
        <h3>EVOLUÇÃO CLÍNICA</h3>
        <p><strong>Queixa Atual:</strong></p>
        <p>${evolucao.queixaAtual}</p>
        
        <p><strong>Exame Físico:</strong></p>
        <p>${evolucao.exameFisico}</p>
        
        <p><strong>Hipótese Diagnóstica:</strong></p>
        <p>${evolucao.hipoteseDiagnostica}</p>
        
        <p><strong>Conduta:</strong></p>
        <p>${evolucao.conduta}</p>
      </div>

      <div class="section">
        <h3>MEDICAMENTOS PRESCRITOS</h3>
        ${evolucao.medicamentos.length > 0 ? 
          evolucao.medicamentos.map((med, index) => `
            <div class="medicamento">
              <p><strong>${index + 1}. ${med.nome}</strong></p>
              <p><strong>Dosagem:</strong> ${med.dosagem}</p>
              <p><strong>Posologia:</strong> ${med.posologia}</p>
              <p><strong>Duração:</strong> ${med.duracao}</p>
              ${med.observacoes ? `<p><strong>Observações:</strong> ${med.observacoes}</p>` : ''}
            </div>
          `).join('') : 
          '<p>Nenhum medicamento prescrito</p>'
        }
      </div>

      <div class="section">
        <h3>EXAMES SOLICITADOS</h3>
        ${evolucao.exames.length > 0 ? 
          evolucao.exames.map((ex, index) => `
            <div class="exame">
              <p><strong>${index + 1}. ${ex.nome}</strong></p>
              <p><strong>Urgência:</strong> ${ex.urgencia}</p>
              <p><strong>Justificativa:</strong> ${ex.justificativa}</p>
            </div>
          `).join('') : 
          '<p>Nenhum exame solicitado</p>'
        }
      </div>

      <div class="section">
        <h3>ORIENTAÇÕES E ENCAMINHAMENTOS</h3>
        ${evolucao.orientacoes ? `<p><strong>Orientações ao Paciente:</strong></p><p>${evolucao.orientacoes}</p>` : ''}
        ${evolucao.encaminhamento ? `<p><strong>Encaminhamento:</strong> ${evolucao.encaminhamento}</p>` : ''}
        ${evolucao.dataRetorno ? `<p><strong>Data de Retorno:</strong> ${evolucao.dataRetorno}</p>` : ''}
      </div>

      <div style="margin-top: 50px; text-align: center;">
        <p>_________________________________</p>
        <p><strong>${evolucao.medico}</strong></p>
        <p>Médico Responsável</p>
        <p>CRM: _______________</p>
      </div>
    `
  }
}

// Inicializar o sistema quando a página carregar
let sistema
document.addEventListener("DOMContentLoaded", () => {
  sistema = new SistemaAtendimento()
})
