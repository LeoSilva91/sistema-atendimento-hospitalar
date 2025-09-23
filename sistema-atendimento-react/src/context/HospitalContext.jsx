import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import api from '../services/api';

const SistemaAtendimentoContext = createContext();

export const useSistemaAtendimento = () => {
  const context = useContext(SistemaAtendimentoContext);
  if (!context) {
    throw new Error("useSistemaAtendimento deve ser usado dentro de um SistemaAtendimentoProvider");
  }
  return context;
};

export const SistemaAtendimentoProvider = ({ children }) => {
  console.log("HospitalContext: Inicializando provider...");
  
  // Estados principais
  const [pacientes, setPacientes] = useState([]);
  const [filaTriagem, setFilaTriagem] = useState([]); // Fila FIFO para triagem
  const [filaAvaliacaoMedica, setFilaAvaliacaoMedica] = useState([]); // Fila priorizada para médicos
  const [pacienteAtualTriagem, setPacienteAtualTriagem] = useState(null);
  const [pacienteAtualMedico, setPacienteAtualMedico] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [telaAtiva, setTelaAtiva] = useState("cadastro");
  const [proximoId, setProximoId] = useState(1);
  const [fichasEmitidas, setFichasEmitidas] = useState([]);
  const [chamadasAtivas, setChamadasAtivas] = useState([]);
  

  console.log("HospitalContext: Estados inicializados", {
    pacientes: pacientes.length,
    filaTriagem: filaTriagem.length,
    filaAvaliacaoMedica: filaAvaliacaoMedica.length,
    pacienteAtualTriagem: !!pacienteAtualTriagem,
    pacienteAtualMedico: !!pacienteAtualMedico,
    currentUser: !!currentUser,
    telaAtiva
  });

  // Carregar dados do localStorage na inicialização
  useEffect(() => {
    const pacientesSalvos = localStorage.getItem("pacientes");
    const filaTriagemSalva = localStorage.getItem("filaTriagem");
    const filaAvaliacaoSalva = localStorage.getItem("filaAvaliacaoMedica");
    const proximoIdSalvo = localStorage.getItem("proximoId");
    const pacienteAtualTriagemSalvo = localStorage.getItem("pacienteAtualTriagem");
    const pacienteAtualMedicoSalvo = localStorage.getItem("pacienteAtualMedico");
    const fichasSalvas = localStorage.getItem("fichasEmitidas");
    const chamadasSalvas = localStorage.getItem("chamadasAtivas");

    if (pacientesSalvos) {
      setPacientes(JSON.parse(pacientesSalvos));
    }
    if (filaTriagemSalva) {
      setFilaTriagem(JSON.parse(filaTriagemSalva));
    }
    if (filaAvaliacaoSalva) {
      setFilaAvaliacaoMedica(JSON.parse(filaAvaliacaoSalva));
    }
    if (proximoIdSalvo) {
      setProximoId(parseInt(proximoIdSalvo));
    }
    if (pacienteAtualTriagemSalvo) {
      setPacienteAtualTriagem(JSON.parse(pacienteAtualTriagemSalvo));
    }
    if (pacienteAtualMedicoSalvo) {
      setPacienteAtualMedico(JSON.parse(pacienteAtualMedicoSalvo));
    }
    if (fichasSalvas) {
      setFichasEmitidas(JSON.parse(fichasSalvas));
    }
    if (chamadasSalvas) {
      setChamadasAtivas(JSON.parse(chamadasSalvas));
    }
  }, []);

  // Salvar dados no localStorage sempre que houver mudanças
  useEffect(() => {
    localStorage.setItem("pacientes", JSON.stringify(pacientes));
  }, [pacientes]);

  useEffect(() => {
    localStorage.setItem("filaTriagem", JSON.stringify(filaTriagem));
  }, [filaTriagem]);

  useEffect(() => {
    localStorage.setItem("filaAvaliacaoMedica", JSON.stringify(filaAvaliacaoMedica));
  }, [filaAvaliacaoMedica]);

  useEffect(() => {
    localStorage.setItem("proximoId", proximoId.toString());
  }, [proximoId]);

  useEffect(() => {
    if (pacienteAtualTriagem) {
      localStorage.setItem("pacienteAtualTriagem", JSON.stringify(pacienteAtualTriagem));
    } else {
      localStorage.removeItem("pacienteAtualTriagem");
    }
  }, [pacienteAtualTriagem]);

  useEffect(() => {
    if (pacienteAtualMedico) {
      localStorage.setItem("pacienteAtualMedico", JSON.stringify(pacienteAtualMedico));
    } else {
      localStorage.removeItem("pacienteAtualMedico");
    }
  }, [pacienteAtualMedico]);

  useEffect(() => {
    localStorage.setItem("fichasEmitidas", JSON.stringify(fichasEmitidas));
  }, [fichasEmitidas]);

  useEffect(() => {
    localStorage.setItem("chamadasAtivas", JSON.stringify(chamadasAtivas));
  }, [chamadasAtivas]);

  // Função para gerar número de prontuário único
  const gerarNumeroProntuario = useCallback(() => {
    const ano = new Date().getFullYear();
    const numero = proximoId.toString().padStart(4, '0');
    return `P${ano}${numero}`;
  }, [proximoId]);

  // Função para formatar nome para exibição pública (privacidade)
  const formatarNomePublico = useCallback((nomeCompleto) => {
    if (!nomeCompleto) return "Paciente";
    const nomes = nomeCompleto.split(' ');
    if (nomes.length >= 2) {
      return `${nomes[0]} ${nomes[nomes.length - 1].charAt(0)}.`;
    }
    return nomes[0];
  }, []);

  // 1. Cadastrar paciente (Módulo de Cadastro da Recepção)
  const cadastrarPaciente = useCallback(async (dadosPaciente) => {
    try {
      // Função para formatar CPF
      const formatarCPF = (cpf) => {
        const numeros = cpf.replace(/\D/g, '');
        return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
      };

      // Função para formatar data para ISO-8601
      const formatarData = (data) => {
        if (!data) return null;
        // Se já é uma string ISO, retorna como está
        if (typeof data === 'string' && data.includes('T')) {
          return data;
        }
        // Se é um objeto Date, converte para ISO
        if (data instanceof Date) {
          return data.toISOString();
        }
        // Se é uma string no formato DD/MM/YYYY, converte
        if (typeof data === 'string' && data.includes('/')) {
          const [dia, mes, ano] = data.split('/');
          return new Date(ano, mes - 1, dia).toISOString();
        }
        // Se é uma string no formato YYYY-MM-DD, adiciona horário
        if (typeof data === 'string' && data.match(/^\d{4}-\d{2}-\d{2}$/)) {
          return new Date(data + 'T00:00:00.000Z').toISOString();
        }
        return data;
      };

      // Função para mapear valores de sexo do frontend para backend
      const mapearSexo = (sexo) => {
        const mapeamento = {
          'M': 'MASCULINO',
          'F': 'FEMININO', 
          'O': 'OUTRO'
        };
        return mapeamento[sexo] || sexo;
      };

      // Fazer chamada para a API
      const response = await api.post('/pacientes', {
        nome: dadosPaciente.nome?.trim(),
        cpf: formatarCPF(dadosPaciente.cpf), // Formatar CPF antes de enviar
        dataNascimento: formatarData(dadosPaciente.dataNascimento), // Formatar data antes de enviar
        sexo: mapearSexo(dadosPaciente.sexo), // Mapear sexo do frontend para backend
        endereco: dadosPaciente.endereco?.trim(),
        telefone: dadosPaciente.telefone,
        contatoEmergencia: dadosPaciente.contatoEmergencia,
        rg: dadosPaciente.rg || '',
        email: dadosPaciente.email || '',
        convenio: dadosPaciente.convenio,
        numeroCarteirinha: dadosPaciente.numeroCarteirinha || '',
        motivoVisita: dadosPaciente.motivoVisita,
        sintomas: dadosPaciente.sintomas
      });

      if (response.data.success) {
        const novoPaciente = response.data.data;
        
        // Atualizar estado local
        setPacientes(prev => [...prev, novoPaciente]);

        // Adicionar à fila de triagem (FIFO)
        setFilaTriagem(prev => [...prev, novoPaciente.id]);

        // Emitir ficha automaticamente
        emitirFicha(novoPaciente);

        return novoPaciente;
      } else {
        throw new Error(response.data.message || 'Erro ao cadastrar paciente');
      }
    } catch (error) {
      console.error('Erro ao cadastrar paciente:', error);
      throw error;
    }
  }, [gerarNumeroProntuario]);

  // 2. Chamar próximo paciente para triagem (FIFO)
  const chamarProximoPacienteTriagem = useCallback(() => {
    if (filaTriagem.length === 0) return null;

    const proximoId = filaTriagem[0];
    const paciente = pacientes.find((p) => p.id === proximoId);

    if (paciente && paciente.status === "aguardando_triagem") {
      const pacienteAtualizado = {
        ...paciente,
        status: "em_triagem",
        horaInicioTriagem: new Date().toISOString()
      };

      setPacientes(prev => prev.map((p) =>
        p.id === proximoId ? pacienteAtualizado : p
      ));
      setFilaTriagem(prev => prev.filter((id) => id !== proximoId));
      setPacienteAtualTriagem(pacienteAtualizado);

      // Criar chamada ativa para triagem
      const novaChamada = {
        id: Date.now(),
        pacienteId: proximoId,
        pacienteNome: paciente.nome, // nome completo
        numeroProntuario: paciente.numeroProntuario,
        horaChamada: new Date().toISOString(),
        tipo: 'triagem',
        local: 'Triagem',
        nomeCompleto: paciente.nome // Para uso interno
      };
      setChamadasAtivas(prev => [...prev, novaChamada]);

      return pacienteAtualizado;
    }
    return null;
  }, [filaTriagem, pacientes]);

  // 3. Finalizar triagem e classificar risco
  const finalizarTriagem = useCallback((pacienteId, dadosTriagem) => {
    const paciente = pacientes.find((p) => p.id === pacienteId);
    
    if (paciente && paciente.status === "em_triagem") {
      const pacienteAtualizado = {
        ...paciente,
        status: "aguardando_avaliacao_medica",
        corTriagem: dadosTriagem.corTriagem, // Vermelho, Laranja, Amarelo, Verde, Azul
        horaFimTriagem: new Date().toISOString(),
        // Dados da triagem
        sinaisVitais: dadosTriagem.sinaisVitais || {},
        queixaPrincipal: dadosTriagem.queixaPrincipal || '',
        nivelDor: dadosTriagem.nivelDor || 0,
        observacoesTriagem: dadosTriagem.observacoesTriagem || '',
        nivelConsciencia: dadosTriagem.nivelConsciencia || 'Alerta'
      };

      setPacientes(prev => prev.map((p) =>
        p.id === pacienteId ? pacienteAtualizado : p
      ));
      setPacienteAtualTriagem(null);

      // Adicionar à fila de avaliação médica (priorizada)
      setFilaAvaliacaoMedica(prev => {
        const novaFila = [...prev, pacienteId];
        // Ordenar por prioridade: Vermelho > Laranja > Amarelo > Verde > Azul
        return novaFila.sort((a, b) => {
          const pacienteA = pacientes.find(p => p.id === a);
          const pacienteB = pacientes.find(p => p.id === b);
          const prioridades = { 'vermelho': 5, 'laranja': 4, 'amarelo': 3, 'verde': 2, 'azul': 1 };
          const prioridadeA = prioridades[pacienteA?.corTriagem] || 0;
          const prioridadeB = prioridades[pacienteB?.corTriagem] || 0;
          
          if (prioridadeA !== prioridadeB) {
            return prioridadeB - prioridadeA; // Maior prioridade primeiro
          }
          // Se mesma prioridade, FIFO
          return prev.indexOf(a) - prev.indexOf(b);
        });
      });

      // Remover chamada ativa de triagem
      setChamadasAtivas(prev => prev.filter(chamada => 
        !(chamada.pacienteId === pacienteId && chamada.tipo === 'triagem')
      ));

      // Atualizar ou emitir ficha com todos os dados
      setFichasEmitidas(prev => {
        const idx = prev.findIndex(f => f.pacienteId === pacienteId);
        const fichaAtualizada = {
          ...(idx !== -1 ? prev[idx] : {}),
          id: idx !== -1 ? prev[idx].id : Date.now(),
          pacienteId: pacienteAtualizado.id,
          numeroProntuario: pacienteAtualizado.numeroProntuario,
          pacienteNome: pacienteAtualizado.nome,
          cpf: pacienteAtualizado.cpf,
          motivoVisita: pacienteAtualizado.motivoVisita,
          horaEmissao: new Date().toISOString(),
          numeroFicha: `F${String(pacienteAtualizado.id).padStart(4, '0')}`,
          corTriagem: pacienteAtualizado.corTriagem,
          sinaisVitais: pacienteAtualizado.sinaisVitais,
          queixaPrincipal: pacienteAtualizado.queixaPrincipal,
          nivelDor: pacienteAtualizado.nivelDor,
          observacoesTriagem: pacienteAtualizado.observacoesTriagem,
          nivelConsciencia: pacienteAtualizado.nivelConsciencia,
          status: pacienteAtualizado.status,
          // Dados médicos podem ser preenchidos depois
          diagnostico: prev[idx]?.diagnostico || '',
          condutas: prev[idx]?.condutas || '',
          prescricoes: prev[idx]?.prescricoes || [],
          exames: prev[idx]?.exames || [],
          orientacoes: prev[idx]?.orientacoes || '',
          encaminhamento: prev[idx]?.encaminhamento || ''
        };
        if (idx !== -1) {
          // Atualiza ficha existente
          const novaLista = [...prev];
          novaLista[idx] = fichaAtualizada;
          return novaLista;
        } else {
          // Emite nova ficha
          return [...prev, fichaAtualizada];
        }
      });

      return pacienteAtualizado;
    }
    return null;
  }, [pacientes]);

  // 4. Chamar próximo paciente para avaliação médica (priorizada)
  const chamarProximoPacienteMedico = useCallback(() => {
    if (filaAvaliacaoMedica.length === 0) return null;

    const proximoId = filaAvaliacaoMedica[0];
    const paciente = pacientes.find((p) => p.id === proximoId);

    if (paciente && paciente.status === "aguardando_avaliacao_medica") {
      const pacienteAtualizado = {
        ...paciente,
        status: "em_consulta",
        horaInicioConsulta: new Date().toISOString()
      };

      setPacientes(prev => prev.map((p) =>
        p.id === proximoId ? pacienteAtualizado : p
      ));
      setFilaAvaliacaoMedica(prev => prev.filter((id) => id !== proximoId));
      setPacienteAtualMedico(pacienteAtualizado);

      // Criar chamada ativa para consulta
      const novaChamada = {
        id: Date.now(),
        pacienteId: proximoId,
        pacienteNome: paciente.nome, // nome completo
        numeroProntuario: paciente.numeroProntuario,
        horaChamada: new Date().toISOString(),
        tipo: 'consulta',
        local: currentUser?.consultorio || 'Consultório Principal',
        nomeCompleto: paciente.nome, // Para uso interno
        corTriagem: paciente.corTriagem
      };
      setChamadasAtivas(prev => [...prev, novaChamada]);

      return pacienteAtualizado;
    }
    return null;
  }, [filaAvaliacaoMedica, pacientes, currentUser]);

  // 5. Finalizar consulta médica
  const finalizarConsulta = useCallback((pacienteId, dadosConsulta) => {
    const paciente = pacientes.find((p) => p.id === pacienteId);
    
    if (paciente && paciente.status === "em_consulta") {
      const pacienteAtualizado = {
        ...paciente,
        status: dadosConsulta.statusFinal || "atendimento_concluido", // atendimento_concluido, aguardando_exame, internado, encaminhado
        horaFimConsulta: new Date().toISOString(),
        // Dados da consulta
        diagnostico: dadosConsulta.diagnostico || '',
        condutas: dadosConsulta.condutas || '',
        prescricoes: dadosConsulta.prescricoes || [],
        exames: dadosConsulta.exames || [],
        orientacoes: dadosConsulta.orientacoes || '',
        encaminhamento: dadosConsulta.encaminhamento || ''
      };

      setPacientes(prev => prev.map((p) =>
        p.id === pacienteId ? pacienteAtualizado : p
      ));
      setPacienteAtualMedico(null);

      // Remover chamada ativa de consulta
      setChamadasAtivas(prev => prev.filter(chamada => 
        !(chamada.pacienteId === pacienteId && chamada.tipo === 'consulta')
      ));

      // Atualizar ficha com dados médicos e status
      setFichasEmitidas(prev => {
        const idx = prev.findIndex(f => f.pacienteId === pacienteId);
        if (idx !== -1) {
          const fichaAtualizada = {
            ...prev[idx],
            diagnostico: pacienteAtualizado.diagnostico,
            condutas: pacienteAtualizado.condutas,
            prescricoes: pacienteAtualizado.prescricoes,
            exames: pacienteAtualizado.exames,
            orientacoes: pacienteAtualizado.orientacoes,
            encaminhamento: pacienteAtualizado.encaminhamento,
            status: pacienteAtualizado.status
          };
          const novaLista = [...prev];
          novaLista[idx] = fichaAtualizada;
          return novaLista;
        }
        return prev;
      });

      return pacienteAtualizado;
    }
    return null;
  }, [pacientes]);

  // 6. Emitir ficha de atendimento
  const emitirFicha = useCallback((paciente) => {
    const ficha = {
      id: Date.now(),
      pacienteId: paciente.id,
      numeroProntuario: paciente.numeroProntuario,
      pacienteNome: paciente.nome,
      cpf: paciente.cpf,
      motivoVisita: paciente.motivoVisita,
      horaEmissao: new Date().toISOString(),
      numeroFicha: `F${String(paciente.id).padStart(4, '0')}`
    };

    setFichasEmitidas(prev => [...prev, ficha]);
    return ficha;
  }, []);

  // 7. Limpar chamadas antigas (mais de 5 minutos)
  const limparChamadasAntigas = useCallback(() => {
    const agora = new Date();
    const cincoMinutosAtras = new Date(agora.getTime() - 5 * 60 * 1000);
    
    setChamadasAtivas(prev => 
      prev.filter(chamada => new Date(chamada.horaChamada) > cincoMinutosAtras)
    );
  }, []);

  // Limpar chamadas antigas a cada minuto
  useEffect(() => {
    const interval = setInterval(limparChamadasAntigas, 60000);
    return () => clearInterval(interval);
  }, [limparChamadasAntigas]);

  // Obter pacientes aguardando triagem (FIFO)
  const obterPacientesAguardandoTriagem = useMemo(() => {
    return filaTriagem
      .map((id) => pacientes.find((p) => p.id === id))
      .filter(Boolean)
      .filter((p) => p.status === "aguardando_triagem");
  }, [filaTriagem, pacientes]);

  // Obter pacientes aguardando avaliação médica (priorizada)
  const obterPacientesAguardandoAvaliacaoMedica = useMemo(() => {
    return filaAvaliacaoMedica
      .map((id) => pacientes.find((p) => p.id === id))
      .filter(Boolean)
      .filter((p) => p.status === "aguardando_avaliacao_medica");
  }, [filaAvaliacaoMedica, pacientes]);

  // Obter estatísticas
  const obterEstatisticas = useMemo(() => {
    const total = pacientes.length;
    const aguardandoTriagem = pacientes.filter((p) => p.status === "aguardando_triagem").length;
    const emTriagem = pacientes.filter((p) => p.status === "em_triagem").length;
    const aguardandoAvaliacao = pacientes.filter((p) => p.status === "aguardando_avaliacao_medica").length;
    const emConsulta = pacientes.filter((p) => p.status === "em_consulta").length;
    const atendidos = pacientes.filter((p) => p.status === "atendimento_concluido").length;
    const aguardandoExame = pacientes.filter((p) => p.status === "aguardando_exame").length;
    const internados = pacientes.filter((p) => p.status === "internado").length;

    // Estatísticas por cor de triagem
    const emergencia = pacientes.filter((p) => p.corTriagem === "vermelho").length;
    const muitoUrgente = pacientes.filter((p) => p.corTriagem === "laranja").length;
    const urgente = pacientes.filter((p) => p.corTriagem === "amarelo").length;
    const poucoUrgente = pacientes.filter((p) => p.corTriagem === "verde").length;
    const naoUrgente = pacientes.filter((p) => p.corTriagem === "azul").length;

    return { 
      total, 
      aguardandoTriagem, 
      emTriagem, 
      aguardandoAvaliacao, 
      emConsulta, 
      atendidos, 
      aguardandoExame, 
      internados,
      emergencia,
      muitoUrgente,
      urgente,
      poucoUrgente,
      naoUrgente
    };
  }, [pacientes]);

  // Obter paciente por ID
  const obterPacientePorId = useCallback((id) => {
    return pacientes.find((p) => p.id === id);
  }, [pacientes]);

  // Funções de autenticação
  const login = useCallback((userData) => {
    setCurrentUser(userData);
    sessionStorage.setItem("currentUser", JSON.stringify(userData));
  }, []);

  const logout = useCallback(async () => {
    try {
      // Fazer logout no backend
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      // Limpar dados locais
      setCurrentUser(null);
      sessionStorage.removeItem("currentUser");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setTelaAtiva("cadastro");
    }
  }, []);

  // Navegação
  const trocarTela = useCallback((tela) => {
    setTelaAtiva(tela);
  }, []);

  const verificarAcesso = useCallback((tela) => {
    console.log('🔍 verificarAcesso:', { currentUser, tela });
    if (!currentUser) {
      console.log('❌ Usuário não logado');
      return false;
    }
    const acessos = {
      recepcionista: ["cadastro", "publico", "fichas", "senhas"],
      enfermeiro: ["triagem", "publico", "fichas"],
      medico: ["medico", "historico", "publico", "fichas"],
      admin: ["cadastro", "triagem", "medico", "historico", "publico", "fichas", "senhas"],
    };
    const acessosPermitidos = acessos[currentUser.tipo] || [];
    const temAcesso = acessosPermitidos.includes(tela);
    console.log('🔍 Acesso verificado:', { 
      tipo: currentUser.tipo, 
      acessosPermitidos, 
      tela, 
      temAcesso 
    });
    return temAcesso;
  }, [currentUser]);

  // Verificar usuário logado
  useEffect(() => {
    console.log('🔄 Carregando usuário do sessionStorage...');
    const sessionUser = sessionStorage.getItem("currentUser");
    console.log('📦 SessionStorage user:', sessionUser);
    if (sessionUser) {
      const userData = JSON.parse(sessionUser);
      console.log('👤 Usuário carregado:', userData);
      setCurrentUser(userData);
    } else {
      console.log('❌ Nenhum usuário encontrado no sessionStorage');
    }
  }, []);

  // Valor do contexto
  const value = useMemo(() => ({
    // Estados
    pacientes,
    filaTriagem,
    filaAvaliacaoMedica,
    pacienteAtualTriagem,
    pacienteAtualMedico,
    currentUser,
    telaAtiva,
    chamadasAtivas,
    fichasEmitidas,
    
    // Funções principais
    cadastrarPaciente,
    chamarProximoPacienteTriagem,
    finalizarTriagem,
    chamarProximoPacienteMedico,
    finalizarConsulta,
    emitirFicha,
    
    // Funções auxiliares
    obterPacientesAguardandoTriagem,
    obterPacientesAguardandoAvaliacaoMedica,
    obterEstatisticas,
    obterPacientePorId,
    formatarNomePublico,
    gerarNumeroProntuario,
    
    // Autenticação e navegação
    login,
    logout,
    trocarTela,
    verificarAcesso,
  }), [
    pacientes,
    filaTriagem,
    filaAvaliacaoMedica,
    pacienteAtualTriagem,
    pacienteAtualMedico,
    currentUser,
    telaAtiva,
    chamadasAtivas,
    fichasEmitidas,
    cadastrarPaciente,
    chamarProximoPacienteTriagem,
    finalizarTriagem,
    chamarProximoPacienteMedico,
    finalizarConsulta,
    emitirFicha,
    obterPacientesAguardandoTriagem,
    obterPacientesAguardandoAvaliacaoMedica,
    obterEstatisticas,
    obterPacientePorId,
    formatarNomePublico,
    gerarNumeroProntuario,
    login,
    logout,
    trocarTela,
    verificarAcesso,
  ]);

  return (
    <SistemaAtendimentoContext.Provider value={value}>
      {children}
    </SistemaAtendimentoContext.Provider>
  );
};
