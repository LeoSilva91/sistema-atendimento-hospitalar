# SIAH Backend - Sistema de Atendimento Hospitalar

Backend do Sistema de Atendimento Hospitalar (SIAH) desenvolvido com Node.js, Express, Prisma e PostgreSQL.

> **Status**: ✅ Sistema completo funcionando - Fluxo Senha → Cadastro → Triagem → Médico

## 🎯 Sistema Funcionando

O backend está **100% funcional** com todas as correções implementadas:

- ✅ **DTOs corrigidos** - prescricao vs prescricoes (arrays estruturados)
- ✅ **Validação robusta** - campos opcionais aceitos corretamente
- ✅ **Autenticação JWT** - sistema de tokens funcionando
- ✅ **Fluxo completo** - desde geração de senha até prontuário médico
- ✅ **Código limpo** - console.log removidos, pronto para produção

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

### 🔐 Autenticação
- `POST /api/auth/login` - Login com rate limiting
- `POST /api/auth/refresh` - Renovar token JWT
- `POST /api/auth/logout` - Logout

### 👥 Pacientes
- `GET /api/pacientes` - Listar pacientes
- `POST /api/pacientes` - Criar paciente (validação completa)
- `GET /api/pacientes/:id` - Buscar paciente
- `PUT /api/pacientes/:id` - Atualizar paciente
- `DELETE /api/pacientes/:id` - Excluir paciente

### 🏥 Atendimentos
- `GET /api/atendimentos` - Listar atendimentos
- `POST /api/atendimentos/iniciar` - Iniciar atendimento médico
- `POST /api/atendimentos/finalizar` - Finalizar atendimento (✅ **FUNCIONANDO**)
- `GET /api/atendimentos/:id` - Buscar atendimento
- `GET /api/atendimentos/estatisticas` - Estatísticas de atendimento

### 🩺 Triagem
- `GET /api/triagem` - Listar triagens
- `POST /api/triagem/iniciar` - Iniciar triagem (✅ **FUNCIONANDO**)
- `POST /api/triagem/finalizar` - Finalizar triagem (✅ **FUNCIONANDO**)
- `GET /api/triagem/:id` - Buscar triagem
- `PUT /api/triagem/:id` - Atualizar triagem

### 🎫 Senhas
- `GET /api/senhas` - Listar senhas
- `POST /api/senhas` - Gerar senha
- `GET /api/senhas/:id` - Buscar senha
- `PUT /api/senhas/:id` - Atualizar senha
- `POST /api/senhas/:id/chamar` - Chamar senha
- `POST /api/senhas/:id/atender` - Atender senha

### 📋 Prontuários
- `GET /api/prontuarios` - Listar prontuários
- `POST /api/prontuarios` - Criar prontuário (✅ **ARRAYS ESTRUTURADOS**)
- `GET /api/prontuarios/:id` - Buscar prontuário
- `PUT /api/prontuarios/:id` - Atualizar prontuário
- `POST /api/prontuarios/:id/evolucao` - Adicionar evolução

### 📊 Dashboard
- `GET /api/dashboard/overview` - Visão geral
- `GET /api/dashboard/estatisticas` - Estatísticas
- `GET /api/dashboard/filas` - Status das filas
- `GET /api/dashboard/atendimentos-hoje` - Atendimentos do dia
- `GET /api/dashboard/triagens-hoje` - Triagens do dia
- `GET /api/dashboard/senhas-hoje` - Senhas do dia

### 📞 Chamadas
- `GET /api/chamadas` - Listar chamadas ativas
- `POST /api/chamadas` - Realizar chamada
- `PUT /api/chamadas/:id` - Atualizar chamada
- `DELETE /api/chamadas/:id` - Finalizar chamada

### 📄 Fichas
- `GET /api/fichas` - Listar fichas
- `POST /api/fichas` - Emitir ficha
- `GET /api/fichas/:id` - Buscar ficha
- `PUT /api/fichas/:id` - Atualizar ficha

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

## 🔧 Correções Implementadas

### ✅ DTOs e Validação
- **Problema resolvido**: Inconsistência entre `prescricao` (string) vs `prescricoes` (array)
- **Solução**: DTOs atualizados para aceitar arrays estruturados de medicamentos e exames
- **Campo `id`**: Aceito no frontend e removido automaticamente no backend (`.strip()`)
- **Campos opcionais**: Strings vazias agora aceitas corretamente

### ✅ Autenticação
- **Token JWT**: Sistema de autenticação funcionando perfeitamente
- **Rate limiting**: Proteção contra ataques de força bruta
- **Refresh tokens**: Renovação automática de tokens

### ✅ Fluxo Completo
- **Senha → Cadastro**: Geração e uso de senhas
- **Cadastro → Triagem**: Transição de status de pacientes
- **Triagem → Médico**: Ordenação por prioridade
- **Médico → Prontuário**: Finalização com dados estruturados

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
