import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class TriagemService {
  async iniciarTriagem(pacienteId, usuarioId) {
    try {
      // Verificar se paciente existe e está aguardando triagem
      const paciente = await prisma.paciente.findUnique({
        where: { id: pacienteId }
      });

      if (!paciente) {
        throw new Error('Paciente não encontrado');
      }

      if (paciente.status !== 'AGUARDANDO_TRIAGEM') {
        throw new Error('Paciente não está aguardando triagem');
      }

      // Atualizar status do paciente
      const pacienteAtualizado = await prisma.paciente.update({
        where: { id: pacienteId },
        data: {
          status: 'EM_TRIAGEM',
          horaInicioTriagem: new Date()
        }
      });

      return pacienteAtualizado;
    } catch (error) {
      throw new Error(`Erro ao iniciar triagem: ${error.message}`);
    }
  }

  async finalizarTriagem(dadosTriagem, usuarioId) {
    try {
      const { pacienteId, corTriagem, queixaPrincipal, sinaisVitais, nivelDor, nivelConsciencia, observacoes } = dadosTriagem;

      // Verificar se paciente está em triagem
      const paciente = await prisma.paciente.findUnique({
        where: { id: pacienteId }
      });

      if (!paciente) {
        throw new Error('Paciente não encontrado');
      }

      if (paciente.status !== 'EM_TRIAGEM') {
        throw new Error('Paciente não está em triagem');
      }

      // Criar registro de triagem
      const triagem = await prisma.triagem.create({
        data: {
          pacienteId,
          usuarioId,
          nivelRisco: corTriagem,
          queixaPrincipal,
          pressaoArterial: sinaisVitais?.pressaoArterial || null,
          temperatura: sinaisVitais?.temperatura ? parseFloat(sinaisVitais.temperatura) : null,
          frequenciaCardiaca: sinaisVitais?.frequenciaCardiaca ? parseInt(sinaisVitais.frequenciaCardiaca) : null,
          frequenciaRespiratoria: sinaisVitais?.frequenciaRespiratoria ? parseInt(sinaisVitais.frequenciaRespiratoria) : null,
          saturacaoOxigenio: sinaisVitais?.saturacaoOxigenio ? parseFloat(sinaisVitais.saturacaoOxigenio) : null,
          peso: sinaisVitais?.peso ? parseFloat(sinaisVitais.peso) : null,
          nivelDor,
          nivelConsciencia,
          observacoes
        }
      });

      // Atualizar paciente com dados da triagem
      const pacienteAtualizado = await prisma.paciente.update({
        where: { id: pacienteId },
        data: {
          status: 'AGUARDANDO_AVALIACAO_MEDICA',
          corTriagem,
          queixaPrincipal,
          sinaisVitais: sinaisVitais || {},
          nivelDor,
          nivelConsciencia,
          observacoesTriagem: observacoes,
          horaFimTriagem: new Date()
        }
      });

      // Emitir ficha automaticamente
      const ficha = await this.emitirFicha(pacienteId, corTriagem);

      return {
        paciente: pacienteAtualizado,
        triagem,
        ficha
      };
    } catch (error) {
      throw new Error(`Erro ao finalizar triagem: ${error.message}`);
    }
  }

  async emitirFicha(pacienteId, corTriagem) {
    try {
      const paciente = await prisma.paciente.findUnique({
        where: { id: pacienteId }
      });

      if (!paciente) {
        throw new Error('Paciente não encontrado');
      }

      // Gerar número da ficha
      const ultimaFicha = await prisma.ficha.findFirst({
        orderBy: { numeroFicha: 'desc' }
      });

      const numeroFicha = ultimaFicha ? 
        `F${String(parseInt(ultimaFicha.numeroFicha.substring(1)) + 1).padStart(4, '0')}` :
        'F0001';

      const ficha = await prisma.ficha.create({
        data: {
          numeroFicha,
          pacienteId,
          corTriagem,
          status: 'AGUARDANDO_AVALIACAO_MEDICA'
        }
      });

      return ficha;
    } catch (error) {
      throw new Error(`Erro ao emitir ficha: ${error.message}`);
    }
  }

  async listarFilaTriagem() {
    try {
      const pacientes = await prisma.paciente.findMany({
        where: { status: 'AGUARDANDO_TRIAGEM' },
        orderBy: { horaCadastro: 'asc' },
        select: {
          id: true,
          nome: true,
          cpf: true,
          dataNascimento: true,
          sexo: true,
          motivoVisita: true,
          horaCadastro: true,
          numeroProntuario: true
        }
      });

      return pacientes;
    } catch (error) {
      throw new Error(`Erro ao listar fila de triagem: ${error.message}`);
    }
  }

  async obterEstatisticasTriagem(filtros = {}) {
    try {
      const { dataInicio, dataFim } = filtros;
      
      const where = {};
      if (dataInicio && dataFim) {
        where.horaFimTriagem = {
          gte: new Date(dataInicio),
          lte: new Date(dataFim)
        };
      }

      const [
        total,
        porCor,
        porStatus,
        aguardandoTriagem,
        emTriagem
      ] = await Promise.all([
        prisma.paciente.count({ where: { horaFimTriagem: { not: null } } }),
        prisma.paciente.groupBy({
          by: ['corTriagem'],
          where: { corTriagem: { not: null } },
          _count: { corTriagem: true }
        }),
        prisma.paciente.groupBy({
          by: ['status'],
          _count: { status: true }
        }),
        prisma.paciente.count({ where: { status: 'AGUARDANDO_TRIAGEM' } }),
        prisma.paciente.count({ where: { status: 'EM_TRIAGEM' } })
      ]);

      return {
        total,
        aguardandoTriagem,
        emTriagem,
        porCor: porCor.reduce((acc, item) => {
          acc[item.corTriagem] = item._count.corTriagem;
          return acc;
        }, {}),
        porStatus: porStatus.reduce((acc, item) => {
          acc[item.status] = item._count.status;
          return acc;
        }, {})
      };
    } catch (error) {
      throw new Error(`Erro ao obter estatísticas de triagem: ${error.message}`);
    }
  }

  async buscarTriagemPorPaciente(pacienteId) {
    try {
      const triagem = await prisma.triagem.findFirst({
        where: { pacienteId },
        orderBy: { createdAt: 'desc' },
        include: {
          usuario: {
            select: {
              id: true,
              nome: true,
              tipo: true
            }
          }
        }
      });

      return triagem;
    } catch (error) {
      throw new Error(`Erro ao buscar triagem: ${error.message}`);
    }
  }
}