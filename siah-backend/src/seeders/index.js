import { database } from '../utils/database.js';
import { logger } from '../utils/logger.js';
import bcrypt from 'bcryptjs';

const prisma = database.getPrisma();

async function seed() {
  try {
    logger.info('🌱 Iniciando seeders...');

    // Limpar dados existentes
    await prisma.prontuario.deleteMany();
    await prisma.atendimento.deleteMany();
    await prisma.triagem.deleteMany();
    await prisma.senha.deleteMany();
    await prisma.paciente.deleteMany();
    await prisma.usuario.deleteMany();

    // Criar usuários
    const usuarios = await criarUsuarios();
    logger.info(`✅ ${usuarios.length} usuários criados`);

    // Criar pacientes
    const pacientes = await criarPacientes();
    logger.info(`✅ ${pacientes.length} pacientes criados`);

    // Criar senhas
    const senhas = await criarSenhas(pacientes);
    logger.info(`✅ ${senhas.length} senhas criadas`);

    // Criar triagens
    const triagens = await criarTriagens(pacientes, usuarios);
    logger.info(`✅ ${triagens.length} triagens criadas`);

    // Criar atendimentos
    const atendimentos = await criarAtendimentos(pacientes, usuarios);
    logger.info(`✅ ${atendimentos.length} atendimentos criados`);

    // Criar prontuários
    const prontuarios = await criarProntuarios(pacientes, atendimentos, usuarios);
    logger.info(`✅ ${prontuarios.length} prontuários criados`);

    logger.info('🎉 Seeders executados com sucesso!');
  } catch (error) {
    logger.error('❌ Erro ao executar seeders:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function criarUsuarios() {
  const usuarios = [
    {
      email: 'admin@siah.com',
      senha: await bcrypt.hash('123456', 12),
      nome: 'Administrador SIAH',
      tipo: 'ADMINISTRADOR'
    },
    {
      email: 'medico@siah.com',
      senha: await bcrypt.hash('123456', 12),
      nome: 'Dr. João Silva',
      tipo: 'MEDICO'
    },
    {
      email: 'enfermeiro@siah.com',
      senha: await bcrypt.hash('123456', 12),
      nome: 'Enf. Ana Costa',
      tipo: 'ENFERMEIRO'
    },
    {
      email: 'recepcionista@siah.com',
      senha: await bcrypt.hash('123456', 12),
      nome: 'Recepcionista Paula Lima',
      tipo: 'RECEPCIONISTA'
    }
  ];

  const usuariosCriados = [];
  for (const usuario of usuarios) {
    const usuarioCriado = await prisma.usuario.create({
      data: usuario
    });
    usuariosCriados.push(usuarioCriado);
  }

  return usuariosCriados;
}

async function criarPacientes() {
  const pacientes = [
    {
      nome: 'João da Silva',
      cpf: '12345678901',
      rg: '1234567',
      dataNascimento: new Date('1980-05-15'),
      sexo: 'MASCULINO',
      telefone: '(11) 99999-9999',
      email: 'joao@email.com',
      endereco: 'Rua das Flores, 123',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01234-567'
    },
    {
      nome: 'Maria Santos',
      cpf: '98765432100',
      rg: '7654321',
      dataNascimento: new Date('1975-08-22'),
      sexo: 'FEMININO',
      telefone: '(11) 88888-8888',
      email: 'maria@email.com',
      endereco: 'Av. Paulista, 456',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01310-100'
    },
    {
      nome: 'Pedro Oliveira',
      cpf: '11122233344',
      rg: '1111111',
      dataNascimento: new Date('1990-12-10'),
      sexo: 'MASCULINO',
      telefone: '(11) 77777-7777',
      email: 'pedro@email.com',
      endereco: 'Rua da Consolação, 789',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01302-000'
    },
    {
      nome: 'Ana Costa',
      cpf: '55566677788',
      rg: '2222222',
      dataNascimento: new Date('1985-03-18'),
      sexo: 'FEMININO',
      telefone: '(11) 66666-6666',
      email: 'ana@email.com',
      endereco: 'Rua Augusta, 321',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01305-000'
    },
    {
      nome: 'Carlos Lima',
      cpf: '99988877766',
      rg: '3333333',
      dataNascimento: new Date('1970-11-25'),
      sexo: 'MASCULINO',
      telefone: '(11) 55555-5555',
      email: 'carlos@email.com',
      endereco: 'Rua Oscar Freire, 654',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01426-000'
    }
  ];

  const pacientesCriados = [];
  for (const paciente of pacientes) {
    const pacienteCriado = await prisma.paciente.create({
      data: paciente
    });
    pacientesCriados.push(pacienteCriado);
  }

  return pacientesCriados;
}

async function criarSenhas(pacientes) {
  const senhas = [];
  
  for (let i = 0; i < pacientes.length; i++) {
    const paciente = pacientes[i];
    const tipo = i % 3 === 0 ? 'URGENTE' : i % 2 === 0 ? 'PRIORITARIA' : 'NORMAL';
    const prioridade = i % 4 === 0 ? 'CRITICA' : i % 3 === 0 ? 'ALTA' : i % 2 === 0 ? 'MEDIA' : 'BAIXA';
    
    const senha = await prisma.senha.create({
      data: {
        pacienteId: paciente.id,
        numero: i + 1,
        tipo,
        prioridade,
        status: i < 3 ? 'AGUARDANDO' : i < 4 ? 'CHAMADA' : 'ATENDIDA'
      }
    });
    
    senhas.push(senha);
  }

  return senhas;
}

async function criarTriagens(pacientes, usuarios) {
  const enfermeiros = usuarios.filter(u => u.tipo === 'ENFERMEIRO');
  const triagens = [];

  for (let i = 0; i < pacientes.length; i++) {
    const paciente = pacientes[i];
    const enfermeiro = enfermeiros[i % enfermeiros.length];
    
    const triagem = await prisma.triagem.create({
      data: {
        pacienteId: paciente.id,
        usuarioId: enfermeiro.id,
        pressaoArterial: '120/80',
        temperatura: 36.5 + (Math.random() * 2),
        frequenciaCardiaca: 70 + Math.floor(Math.random() * 20),
        frequenciaRespiratoria: 16 + Math.floor(Math.random() * 4),
        saturacaoOxigenio: 95 + Math.random() * 5,
        nivelRisco: i % 4 === 0 ? 'VERMELHO' : i % 3 === 0 ? 'LARANJA' : i % 2 === 0 ? 'AMARELO' : 'VERDE',
        observacoes: `Triagem realizada para ${paciente.nome}`
      }
    });
    
    triagens.push(triagem);
  }

  return triagens;
}

async function criarAtendimentos(pacientes, usuarios) {
  const medicos = usuarios.filter(u => u.tipo === 'MEDICO');
  const atendimentos = [];

  for (let i = 0; i < pacientes.length; i++) {
    const paciente = pacientes[i];
    const medico = medicos[i % medicos.length];
    
    const atendimento = await prisma.atendimento.create({
      data: {
        pacienteId: paciente.id,
        usuarioId: medico.id,
        dataHora: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Últimos 7 dias
        status: i < 2 ? 'EM_ANDAMENTO' : i < 4 ? 'CONCLUIDO' : 'AGENDADO',
        observacoes: `Atendimento para ${paciente.nome}`
      }
    });
    
    atendimentos.push(atendimento);
  }

  return atendimentos;
}

async function criarProntuarios(pacientes, atendimentos, usuarios) {
  const medicos = usuarios.filter(u => u.tipo === 'MEDICO');
  const prontuarios = [];

  for (let i = 0; i < atendimentos.length; i++) {
    const atendimento = atendimentos[i];
    const medico = medicos[i % medicos.length];
    
    const prontuario = await prisma.prontuario.create({
      data: {
        pacienteId: atendimento.pacienteId,
        atendimentoId: atendimento.id,
        usuarioId: medico.id,
        evolucao: 'Evolução do paciente: melhora do quadro clínico. Paciente está respondendo bem ao tratamento.',
        diagnostico: i % 2 === 0 ? 'Hipertensão arterial' : 'Diabetes mellitus',
        prescricao: i % 2 === 0 ? 'Losartana 50mg 1x ao dia' : 'Metformina 500mg 2x ao dia',
        exames: 'Hemograma completo, glicemia de jejum',
        observacoes: 'Paciente orientado sobre medicação e retorno'
      }
    });
    
    prontuarios.push(prontuario);
  }

  return prontuarios;
}

// Executar seeders se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  seed()
    .then(() => {
      logger.info('✅ Seeders executados com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('❌ Erro ao executar seeders:', error);
      process.exit(1);
    });
}

export { seed };
