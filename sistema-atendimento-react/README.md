# Sistema de Atendimento Hospitalar - React

Uma aplicação React moderna para gerenciamento de fila hospitalar, refatorada a partir do sistema original em JavaScript vanilla. Implementa triagem médica por prioridade, gestão de pacientes e painel público de chamadas.

## 🚀 Tecnologias Utilizadas

- **React 18** - Biblioteca JavaScript para interfaces de usuário
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Framework CSS utilitário
- **Context API** - Gerenciamento de estado global
- **localStorage** - Persistência de dados local

## 📋 Funcionalidades Implementadas

### ✅ Completamente Funcionais
- **Sistema de Autenticação** - Login com diferentes tipos de usuário
- **Cadastro de Pacientes** - Formulário completo com validações
- **Painel de Triagem** - Gerenciamento da fila de triagem
- **Painel Público** - Exibição de chamadas em tempo real
- **Navegação Responsiva** - Menu adaptativo por tipo de usuário
- **Persistência de Dados** - Armazenamento local automático

### 🔄 Em Desenvolvimento
- **Avaliação de Triagem** - Formulário de classificação por prioridade
- **Painel do Médico** - Atendimento e conclusão de consultas
- **Evolução Médica** - Registro de evoluções clínicas
- **Emissão de Fichas** - Geração e impressão de fichas

## 🏗️ Arquitetura do Projeto

```
src/
├── components/          # Componentes React reutilizáveis
│   ├── Navigation.jsx   # Navegação principal
│   ├── Login.jsx        # Tela de autenticação
│   ├── CadastroPaciente.jsx  # Formulário de cadastro
│   ├── PainelTriagem.jsx     # Painel de triagem
│   └── PainelPublico.jsx     # Painel público
├── utils/
│   └── SistemaAtendimentoContext.jsx  # Contexto global
├── pages/               # Páginas da aplicação
├── assets/              # Recursos estáticos
└── App.jsx              # Componente principal
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Instalação

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd sistema-atendimento-react
```

2. **Instale as dependências**
```bash
npm install
```

3. **Execute o servidor de desenvolvimento**
```bash
npm run dev
```

4. **Acesse no navegador**
```
http://localhost:5173
```

## 👤 Dados de Teste

### Credenciais de Login
- **Atendente**: usuario: `atendente`, senha: `123`
- **Triagem**: usuario: `triagem`, senha: `123`
- **Médico**: usuario: `medico`, senha: `123`
- **Admin**: usuario: `admin`, senha: `123`

### Permissões por Tipo de Usuário
- **Atendente**: Cadastro, Fichas, Painel Público
- **Triagem**: Triagem, Avaliação, Evolução, Fichas, Painel Público
- **Médico**: Painel Médico, Evolução, Fichas, Painel Público
- **Admin**: Acesso completo a todas as funcionalidades

## 🎨 Design System

### Cores Principais
- **Azul Primário**: `#2563eb` (blue-600)
- **Azul Escuro**: `#1d4ed8` (blue-700)
- **Verde Sucesso**: `#16a34a` (green-600)
- **Vermelho Emergência**: `#dc2626` (red-600)
- **Amarelo Urgente**: `#ca8a04` (yellow-500)

### Componentes
- **Cards**: Bordas arredondadas, sombras suaves
- **Botões**: Estados hover, disabled, loading
- **Formulários**: Validação visual, máscaras automáticas
- **Tabelas**: Responsivas, com hover states

## 📱 Responsividade

A aplicação é totalmente responsiva e funciona em:
- **Desktop**: Layout completo com todas as funcionalidades
- **Tablet**: Layout adaptado com navegação otimizada
- **Mobile**: Interface mobile-first com navegação simplificada

## 🔧 Scripts Disponíveis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview do build
npm run lint         # Linting do código
```

## 📊 Estado da Refatoração

### ✅ Migrado para React
- [x] Sistema de autenticação
- [x] Cadastro de pacientes
- [x] Painel de triagem
- [x] Painel público
- [x] Navegação e controle de acesso
- [x] Persistência de dados

### 🔄 Em Progresso
- [ ] Avaliação de triagem
- [ ] Painel do médico
- [ ] Evolução médica
- [ ] Emissão de fichas

### 📋 Próximos Passos
- [ ] Implementar avaliação de triagem completa
- [ ] Criar painel do médico funcional
- [ ] Adicionar sistema de evolução médica
- [ ] Implementar emissão de fichas
- [ ] Adicionar testes unitários
- [ ] Otimizar performance

## 🐛 Problemas Conhecidos

- Algumas funcionalidades ainda estão em desenvolvimento
- O sistema de roteamento pode ser melhorado com React Router
- Falta implementação de testes automatizados

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Desenvolvedor

Sistema refatorado como parte do processo de modernização de aplicações web, convertendo JavaScript vanilla para React com Tailwind CSS. 