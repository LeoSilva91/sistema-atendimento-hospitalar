# SIAH - Sistema Inteligente de Atendimento Hospitalar

> Transformando a gestão hospitalar com tecnologia moderna e eficiência operacional

## Visão Geral

O SIAH é uma solução completa para otimização do fluxo de atendimento hospitalar, desenvolvida para modernizar e simplificar os processos de recepção, triagem e atendimento médico. O sistema resolve os desafios comuns de gestão de filas, classificação de prioridades e comunicação entre equipes médicas.

### Problema Resolvido
Hospitais e clínicas frequentemente enfrentam desafios como:
- Filas desorganizadas e longos tempos de espera
- Dificuldade na classificação de prioridades de atendimento
- Falta de visibilidade do status dos pacientes
- Processos manuais ineficientes

### Nossa Solução
O SIAH oferece um sistema integrado que:
- **Gerencia filas inteligentes** com classificação automática de prioridades
- **Otimiza o fluxo de triagem** com classificação de risco (vermelho, laranja, amarelo, verde, azul)
- **Fornece painel público** para transparência no atendimento
- **Automatiza processos** de cadastro e emissão de senhas
- **Facilita a comunicação** entre equipes médicas

### Funcionalidades Principais

- **Cadastro de Pacientes**: Interface intuitiva para registro completo de dados
- **Triagem Inteligente**: Classificação automática de risco com sinais vitais
- **Painel Médico**: Evolução clínica completa com prescrições e exames
- **Painel Público**: Exibição transparente de chamadas e filas
- **Gerador de Senhas**: Sistema de senhas com priorização automática
- **Gestão de Filas**: Controle eficiente de fluxo de pacientes
- **Acessibilidade**: Integração com VLibras para inclusão

## Tecnologias Utilizadas

### Frontend
- **[React 18](https://react.dev/)** - Biblioteca JavaScript para interfaces de usuário
- **[PrimeReact](https://primereact.org/)** - Componentes UI ricos e acessíveis
- **[Tailwind CSS](https://tailwindcss.com/)** - Framework CSS utilitário para design responsivo
- **[Vite](https://vitejs.dev/)** - Build tool rápida para desenvolvimento moderno

### Acessibilidade
- **[VLibras](https://www.gov.br/governodigital/pt-br/vlibras)** - Tradução automática para Língua Brasileira de Sinais

### Armazenamento
- **LocalStorage** - Persistência de dados no navegador (solução temporária)

### Por que essas tecnologias?

- **React**: Componentização eficiente e ecossistema robusto
- **PrimeReact**: Componentes prontos para produção com acessibilidade nativa
- **Tailwind CSS**: Desenvolvimento rápido com design responsivo mobile-first
- **Vite**: Build e hot reload extremamente rápidos para desenvolvimento

## Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **[Node.js](https://nodejs.org/)** (versão 16 ou superior)
- **[npm](https://www.npmjs.com/)** ou **[yarn](https://yarnpkg.com/)**

## Instalação

Siga estes passos para configurar o projeto localmente:

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/sistema-atendimento-hospitalar.git
cd sistema-atendimento-hospitalar/sistema-atendimento-react
```

### 2. Instale as dependências
```bash
npm install
# ou
yarn install
```

### 3. Inicie o servidor de desenvolvimento
```bash
npm run dev
# ou
yarn dev
```

### 4. Acesse a aplicação
Abra [http://localhost:5173](http://localhost:5173) no seu navegador.

## Estrutura de Pastas

```
sistema-atendimento-react/
├── public/                 # Arquivos estáticos (logos, imagens)
├── src/
│   ├── components/         # Componentes reutilizáveis
│   │   ├── Navigation.jsx  # Navegação principal
│   │   ├── GeradorSenha.jsx # Gerador de senhas
│   │   ├── LoadingSpinner.jsx # Indicador de carregamento
│   │   └── ...
│   ├── pages/             # Páginas principais da aplicação
│   │   ├── Login.jsx      # Tela de autenticação
│   │   ├── TelaCadastro.jsx # Cadastro de pacientes
│   │   ├── TelaTriagem.jsx # Triagem de pacientes
│   │   ├── PainelMedico.jsx # Painel médico
│   │   └── ...
│   ├── context/           # Contextos React (estado global)
│   │   ├── HospitalContext.jsx # Contexto principal
│   │   └── ToastProvider.jsx # Notificações
│   ├── styles/            # Arquivos de estilo
│   │   └── index.css      # Estilos globais
│   ├── App.jsx            # Componente raiz
│   └── main.jsx           # Ponto de entrada
├── package.json           # Dependências e scripts
├── tailwind.config.js     # Configuração do Tailwind
└── vite.config.js         # Configuração do Vite
```

## Funcionalidades Detalhadas

### Sistema de Autenticação
- Login baseado em roles (Recepcionista, Enfermeiro, Médico, Admin)
- Controle de acesso por funcionalidade
- Interface responsiva e acessível

### Gestão de Pacientes
- Cadastro completo com validação de dados
- Busca automática de endereço por CEP
- Classificação automática de prioridade por sintomas
- Geração automática de prontuário

### Triagem Inteligente
- Classificação de risco em 5 níveis
- Registro de sinais vitais
- Avaliação de nível de dor e consciência
- Geração de etiquetas para pulseiras

### Painel Médico
- Evolução clínica completa
- Prescrição de medicamentos
- Solicitação de exames
- Orientações e encaminhamentos

### Painel Público
- Exibição transparente de chamadas
- Fila de espera em tempo real
- Integração com VLibras para acessibilidade

## Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Gera build de produção
npm run preview      # Visualiza build de produção
npm run lint         # Executa linter
```

## Contribuição

Contribuições são sempre bem-vindas! Para contribuir com o projeto:

### Como Contribuir

1. **Fork o projeto** no GitHub
2. **Crie uma branch** para sua feature (`git checkout -b feature/AmazingFeature`)
3. **Commit suas mudanças** (`git commit -m 'Add some AmazingFeature'`)
4. **Push para a branch** (`git push origin feature/AmazingFeature`)
5. **Abra um Pull Request**

### Diretrizes de Contribuição

- Mantenha o código limpo e bem documentado
- Siga os padrões de código existentes
- Teste suas mudanças antes de submeter
- Use commits descritivos e claros
- Respeite as diretrizes de acessibilidade

### Reportando Bugs

Se encontrar um bug, por favor:
1. Verifique se já não foi reportado nas [Issues](https://github.com/seu-usuario/sistema-atendimento-hospitalar/issues)
2. Crie uma nova issue com descrição detalhada
3. Inclua passos para reproduzir o problema
4. Adicione screenshots se relevante

## Responsividade

O SIAH foi desenvolvido com design mobile-first, garantindo uma experiência consistente em:
- Smartphones (320px+)
- Tablets (768px+)
- Desktops (1024px+)
- Telas grandes (1280px+)

## Acessibilidade

O sistema prioriza a inclusão digital:
- **VLibras integrado** para tradução automática em Libras
- **Navegação por teclado** em todos os componentes
- **Contraste adequado** seguindo WCAG 2.1
- **Labels semânticos** para leitores de tela
- **Design responsivo** para diferentes dispositivos

## Segurança

- Autenticação baseada em roles
- Validação de dados no frontend
- Sanitização de inputs
- Controle de acesso por funcionalidade

## Roadmap

### Próximas Funcionalidades
- [ ] Integração com banco de dados real
- [ ] API REST para backend
- [ ] Sistema de notificações push
- [ ] Relatórios e dashboards
- [ ] Integração com sistemas hospitalares
- [ ] App mobile nativo

### Melhorias Planejadas
- [ ] Cache inteligente
- [ ] PWA (Progressive Web App)
- [ ] Modo offline
- [ ] Backup automático
- [ ] Logs de auditoria

## Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

**SIAH** - Transformando a saúde com tecnologia moderna e eficiência operacional. 
