import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listUsers() {
  try {
    console.log('👥 USUÁRIOS CRIADOS NO SISTEMA SIAH\n');

    const users = await prisma.usuario.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        tipo: true,
        crm: true,
        especialidade: true,
        consultorio: true,
        ativo: true,
        createdAt: true
      },
      orderBy: { createdAt: 'asc' }
    });

    console.log('📋 LISTA DE USUÁRIOS:');
    console.log('═'.repeat(80));
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.nome}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   🔑 Senha: 123456`);
      console.log(`   👤 Tipo: ${user.tipo}`);
      if (user.crm) console.log(`   🩺 CRM: ${user.crm}`);
      if (user.especialidade) console.log(`   🏥 Especialidade: ${user.especialidade}`);
      if (user.consultorio) console.log(`   🏢 Consultório: ${user.consultorio}`);
      console.log(`   ✅ Status: ${user.ativo ? 'Ativo' : 'Inativo'}`);
      console.log(`   📅 Criado em: ${user.createdAt.toLocaleString('pt-BR')}`);
      console.log('');
    });

    console.log('🎯 CREDENCIAIS PARA TESTE:');
    console.log('═'.repeat(80));
    console.log('🔐 ADMINISTRADOR:');
    console.log('   Email: admin@siah.com');
    console.log('   Senha: 123456');
    console.log('');
    console.log('🩺 MÉDICO:');
    console.log('   Email: joao.medico@siah.com');
    console.log('   Senha: 123456');
    console.log('');
    console.log('👩‍⚕️ ENFERMEIRO:');
    console.log('   Email: maria.enfermeira@siah.com');
    console.log('   Senha: 123456');
    console.log('');
    console.log('📞 RECEPCIONISTA:');
    console.log('   Email: ana.recepcao@siah.com');
    console.log('   Senha: 123456');
    console.log('');

    console.log('🌐 ENDPOINTS DA API:');
    console.log('═'.repeat(80));
    console.log('🏥 Health Check: http://localhost:3000/health');
    console.log('🔐 Login: POST http://localhost:3000/api/auth/login');
    console.log('📊 Dashboard: GET http://localhost:3000/api/dashboard/overview');
    console.log('👥 Pacientes: GET http://localhost:3000/api/pacientes');
    console.log('🎫 Senhas: GET http://localhost:3000/api/senhas');
    console.log('🏥 Triagem: GET http://localhost:3000/api/triagem/fila');
    console.log('👨‍⚕️ Atendimentos: GET http://localhost:3000/api/atendimentos/fila');
    console.log('');

  } catch (error) {
    console.error('❌ Erro ao listar usuários:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listUsers();
