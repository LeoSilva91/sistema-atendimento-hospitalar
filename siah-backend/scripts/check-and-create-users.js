import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function checkAndCreateUsers() {
  try {
    // Verificar usuários existentes
    const existingUsers = await prisma.usuario.findMany({
      select: { email: true, nome: true, tipo: true }
    });

    console.log('👥 Usuários existentes no banco:');
    existingUsers.forEach(user => {
      console.log(`- ${user.nome} (${user.email}) - ${user.tipo}`);
    });

    // Hash da senha
    const hashedPassword = await bcrypt.hash('123456', 10);

    const usersToCreate = [
      {
        nome: 'Administrador SIAH',
        email: 'admin@siah.com',
        tipo: 'ADMINISTRADOR',
        senha: hashedPassword
      },
      {
        nome: 'Dr. João Silva',
        email: 'joao.medico@siah.com',
        tipo: 'MEDICO',
        crm: '12345',
        especialidade: 'Clínica Geral',
        consultorio: 'Consultório 1',
        senha: hashedPassword
      },
      {
        nome: 'Enfermeira Maria Santos',
        email: 'maria.enfermeira@siah.com',
        tipo: 'ENFERMEIRO',
        senha: hashedPassword
      },
      {
        nome: 'Ana Recepcionista',
        email: 'ana.recepcao@siah.com',
        tipo: 'RECEPCIONISTA',
        senha: hashedPassword
      }
    ];

    console.log('\n🔄 Verificando e criando usuários...\n');

    for (const userData of usersToCreate) {
      const existingUser = await prisma.usuario.findUnique({
        where: { email: userData.email }
      });

      if (existingUser) {
        console.log(`⚠️  Usuário ${userData.email} já existe, pulando...`);
      } else {
        try {
          const newUser = await prisma.usuario.create({
            data: userData
          });
          console.log(`✅ Usuário ${userData.nome} criado com sucesso!`);
        } catch (error) {
          console.log(`❌ Erro ao criar ${userData.nome}:`, error.message);
        }
      }
    }

    // Listar todos os usuários após criação
    const allUsers = await prisma.usuario.findMany({
      select: { 
        id: true, 
        nome: true, 
        email: true, 
        tipo: true, 
        crm: true, 
        especialidade: true,
        ativo: true 
      }
    });

    console.log('\n📋 Todos os usuários no sistema:');
    allUsers.forEach(user => {
      console.log(`- ${user.nome} (${user.email}) - ${user.tipo} ${user.crm ? `- CRM: ${user.crm}` : ''} ${user.especialidade ? `- ${user.especialidade}` : ''}`);
    });

    console.log('\n🎉 Processo concluído!');
    console.log('\n📋 Credenciais de acesso (senha padrão: 123456):');
    allUsers.forEach(user => {
      console.log(`Email: ${user.email} | Senha: 123456 (${user.tipo})`);
    });

  } catch (error) {
    console.error('❌ Erro geral:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndCreateUsers();
