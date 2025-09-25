import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createUser() {
  try {
    // Hash da senha
    const hashedPassword = await bcrypt.hash('123456', 10);

    // Criar usuário administrador
    const adminUser = await prisma.usuario.create({
      data: {
        nome: 'Administrador SIAH',
        email: 'admin@siah.com',
        senha: hashedPassword,
        tipo: 'ADMINISTRADOR',
        ativo: true
      }
    });

    console.log('✅ Usuário administrador criado:', adminUser);

    // Criar usuário médico
    const medicoUser = await prisma.usuario.create({
      data: {
        nome: 'Dr. João Silva',
        email: 'joao.medico@siah.com',
        senha: hashedPassword,
        tipo: 'MEDICO',
        crm: '12345',
        especialidade: 'Clínica Geral',
        consultorio: 'Consultório 1',
        ativo: true
      }
    });

    console.log('✅ Usuário médico criado:', medicoUser);

    // Criar usuário enfermeiro
    const enfermeiroUser = await prisma.usuario.create({
      data: {
        nome: 'Enfermeira Maria Santos',
        email: 'maria.enfermeira@siah.com',
        senha: hashedPassword,
        tipo: 'ENFERMEIRO',
        ativo: true
      }
    });

    console.log('✅ Usuário enfermeiro criado:', enfermeiroUser);

    // Criar usuário recepcionista
    const recepcionistaUser = await prisma.usuario.create({
      data: {
        nome: 'Ana Recepcionista',
        email: 'ana.recepcao@siah.com',
        senha: hashedPassword,
        tipo: 'RECEPCIONISTA',
        ativo: true
      }
    });

    console.log('✅ Usuário recepcionista criado:', recepcionistaUser);

    console.log('\n🎉 Todos os usuários foram criados com sucesso!');
    console.log('\n📋 Credenciais de acesso:');
    console.log('Email: admin@siah.com | Senha: 123456 (Administrador)');
    console.log('Email: joao.medico@siah.com | Senha: 123456 (Médico)');
    console.log('Email: maria.enfermeira@siah.com | Senha: 123456 (Enfermeiro)');
    console.log('Email: ana.recepcao@siah.com | Senha: 123456 (Recepcionista)');

  } catch (error) {
    console.error('❌ Erro ao criar usuários:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createUser();
