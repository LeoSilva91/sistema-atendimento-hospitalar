# SIAH Backend - Sistema de Atendimento Hospitalar

Backend do Sistema de Atendimento Hospitalar (SIAH) desenvolvido com Node.js, Express, Prisma e PostgreSQL.

## 🚀 Tecnologias

- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **Prisma** - ORM para banco de dados
- **PostgreSQL** - Banco de dados
- **JWT** - Autenticação
- **Joi** - Validação de dados
- **Winston** - Logging
- **Jest** - Testes
- **ESLint** - Linting
- **Prettier** - Formatação de código

## 📋 Pré-requisitos

- Node.js 18+ 
- PostgreSQL 12+
- npm ou yarn

## 🛠️ Instalação

1. Clone o repositório
2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente:
   ```bash
   cp .env.example .env
   ```

4. Configure o banco de dados no arquivo `.env`:
   ```env
   DATABASE_URL="postgresql://usuario:senha@localhost:5432/siah_db?schema=public"
   ```

5. Execute as migrações:
   ```bash
   npm run db:migrate
   ```

6. Gere o cliente Prisma:
   ```bash
   npm run db:generate
   ```

7. Execute os seeders (opcional):
   ```bash
   npm run db:seed
   ```

## 🚀 Executando

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm start
```

## 📊 Scripts Disponíveis

- `npm start` - Inicia o servidor em produção
- `npm run dev` - Inicia o servidor em desenvolvimento com nodemon
- `npm test` - Executa os testes
- `npm run test:watch` - Executa os testes em modo watch
- `npm run test:coverage` - Executa os testes com cobertura
- `npm run db:generate` - Gera o cliente Prisma
- `npm run db:push` - Aplica as mudanças do schema no banco
- `npm run db:migrate` - Executa as migrações
- `npm run db:studio` - Abre o Prisma Studio
- `npm run db:seed` - Executa os seeders
- `npm run lint` - Executa o ESLint
- `npm run lint:fix` - Corrige automaticamente os erros do ESLint
- `npm run format` - Formata o código com Prettier

## 🏗️ Estrutura do Projeto

```
src/
├── controllers/     # Controladores das rotas
├── services/        # Lógica de negócio
├── routes/          # Definição das rotas
├── middlewares/     # Middlewares personalizados
├── dto/            # DTOs de validação
├── utils/          # Utilitários
└── config/         # Configurações
```

## 🔐 Autenticação

O sistema utiliza JWT para autenticação com refresh tokens:

- **Access Token**: Válido por 15 minutos
- **Refresh Token**: Válido por 7 dias

## 📝 API Endpoints

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro
- `POST /api/auth/refresh` - Renovar token
- `POST /api/auth/logout` - Logout

### Pacientes
- `GET /api/pacientes` - Listar pacientes
- `POST /api/pacientes` - Criar paciente
- `GET /api/pacientes/:id` - Buscar paciente
- `PUT /api/pacientes/:id` - Atualizar paciente
- `DELETE /api/pacientes/:id` - Excluir paciente

### Atendimentos
- `GET /api/atendimentos` - Listar atendimentos
- `POST /api/atendimentos` - Criar atendimento
- `GET /api/atendimentos/:id` - Buscar atendimento
- `PUT /api/atendimentos/:id` - Atualizar atendimento
- `PATCH /api/atendimentos/:id/status` - Atualizar status
- `DELETE /api/atendimentos/:id` - Cancelar atendimento

### Triagem
- `GET /api/triagem` - Listar triagens
- `POST /api/triagem` - Criar triagem
- `GET /api/triagem/:id` - Buscar triagem
- `PUT /api/triagem/:id` - Atualizar triagem
- `POST /api/triagem/:id/classificar` - Classificar risco

### Senhas
- `GET /api/senhas` - Listar senhas
- `POST /api/senhas` - Gerar senha
- `GET /api/senhas/:id` - Buscar senha
- `PUT /api/senhas/:id` - Atualizar senha
- `PATCH /api/senhas/:id/status` - Atualizar status
- `POST /api/senhas/:id/chamar` - Chamar senha
- `POST /api/senhas/:id/atender` - Atender senha

### Prontuários
- `GET /api/prontuarios` - Listar prontuários
- `POST /api/prontuarios` - Criar prontuário
- `GET /api/prontuarios/:id` - Buscar prontuário
- `PUT /api/prontuarios/:id` - Atualizar prontuário
- `POST /api/prontuarios/:id/evolucao` - Adicionar evolução

### Dashboard
- `GET /api/dashboard/overview` - Visão geral
- `GET /api/dashboard/estatisticas` - Estatísticas
- `GET /api/dashboard/filas` - Status das filas
- `GET /api/dashboard/atendimentos-hoje` - Atendimentos do dia
- `GET /api/dashboard/triagens-hoje` - Triagens do dia
- `GET /api/dashboard/senhas-hoje` - Senhas do dia

## 🧪 Testes

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch
npm run test:watch

# Executar testes com cobertura
npm run test:coverage
```

## 📊 Logs

O sistema utiliza Winston para logging com diferentes níveis:

- **error** - Erros críticos
- **warn** - Avisos
- **info** - Informações gerais
- **debug** - Informações de debug

## 🔒 Segurança

- Rate limiting para prevenir ataques
- Helmet para headers de segurança
- CORS configurado
- Validação de dados com Joi
- Autenticação JWT
- Criptografia de senhas com bcrypt

## 📈 Monitoramento

- Health check em `/health`
- Logs estruturados
- Métricas de performance
- Alertas automáticos

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença ISC.
