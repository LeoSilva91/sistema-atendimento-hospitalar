# 🏥 Sistema de Atendimento Hospitalar

Um sistema completo de gerenciamento de fila hospitalar desenvolvido em JavaScript vanilla, implementando triagem médica por prioridade, gestão de pacientes e painel público de chamadas.

## 📋 Sobre o Projeto

Este sistema foi desenvolvido para otimizar o fluxo de atendimento em unidades de saúde, implementando um sistema de triagem baseado no **Protocolo de Manchester** com classificação por cores e gerenciamento inteligente de filas por prioridade.

### 🎯 Objetivo

Digitalizar e automatizar o processo de atendimento hospitalar, desde o cadastro do paciente até a conclusão da consulta médica, garantindo que casos mais graves sejam priorizados adequadamente.

## ✨ Funcionalidades Principais

### 👤 **1. Cadastro de Paciente**
- Formulário completo com dados pessoais e médicos
- Validação de CPF único no sistema
- Campos obrigatórios e opcionais claramente identificados
- Máscaras automáticas para CPF e telefone
- Cálculo automático da idade
- Registro de convênio médico e contato de emergência

### 🚨 **2. Sistema de Triagem**
- **Chamada sequencial** de pacientes para triagem
- **Avaliação médica completa** com:
  - Sinais vitais (PA, temperatura, FC, saturação O2, FR, peso)
  - Avaliação clínica (queixa principal, sintomas, histórico)
  - Escala de dor (0-10) com localização
  - Nível de consciência
  - Observações do profissional

### 🎨 **3. Classificação por Prioridade**
- **🔴 VERMELHO** - Emergência (Risco de vida imediato)
- **🟡 AMARELO** - Urgente (Risco de vida potencial - até 15min)
- **🟢 VERDE** - Pouco Urgente (Sem risco de vida - até 60min)
- **🔵 AZUL** - Não Urgente (Consulta eletiva - até 120min)

### 👨‍⚕️ **4. Painel do Médico**
- Fila ordenada automaticamente por prioridade
- Visualização completa dos dados do paciente
- Histórico da triagem com todos os dados coletados
- Controle de status do atendimento
- Conclusão de consultas com registro de horários

### 📺 **5. Painel Público**
- **Tela de chamadas** em tempo real
- Exibição do paciente atual sendo atendido
- Lista dos próximos 3 pacientes na fila
- **Estatísticas em tempo real**:
  - Total de pacientes cadastrados
  - Pacientes já atendidos
  - Pacientes em espera

### 💾 **6. Persistência de Dados**
- Armazenamento local com **localStorage**
- Recuperação automática de dados ao recarregar
- Histórico completo de atendimentos
- Backup automático de todas as operações

## 🛠️ Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Estilização**: CSS Grid, Flexbox, Gradientes, Animações
- **Persistência**: localStorage (navegador)
- **Responsividade**: Mobile-first design
- **Acessibilidade**: ARIA labels, navegação por teclado
- **Compatibilidade**: Navegadores modernos (Chrome, Firefox, Safari, Edge)

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Navegador web moderno
- Servidor web local (opcional, mas recomendado)

### Instalação

1. **Clone o repositório**
\`\`\`bash
git clone https://github.com/seu-usuario/sistema-atendimento-hospitalar.git
cd sistema-atendimento-hospitalar
\`\`\`

2. **Estrutura do projeto**
\`\`\`
sistema-atendimento-hospitalar/
├── index.html          # Estrutura principal da aplicação
├── script.js           # Lógica do sistema (SistemaAtendimento)
├── styles.css          # Estilos e responsividade
└── README.md           # Documentação do projeto
\`\`\`

3. **Executar o sistema**

**Opção 1: Servidor local (recomendado)**
\`\`\`bash
# Com Python 3
python -m http.server 8000

# Com Node.js (http-server)
npx http-server

# Com PHP
php -S localhost:8000
\`\`\`

**Opção 2: Abrir diretamente**
- Abra o arquivo `index.html` diretamente no navegador
- ⚠️ Algumas funcionalidades podem ter limitações

4. **Acesse no navegador**
\`\`\`
http://localhost:8000
\`\`\`

## 📱 Como Usar o Sistema

### Para Recepcionistas:

1. **Cadastrar Paciente**
   - Acesse a aba "Cadastro"
   - Preencha todos os campos obrigatórios (*)
   - Clique em "Registrar Paciente"
   - O paciente será automaticamente adicionado à fila de triagem

2. **Gerenciar Fila de Triagem**
   - Acesse "Painel Triagem"
   - Clique em "Chamar Próximo Paciente"
   - Clique em "Iniciar Triagem" quando o paciente chegar

### Para Enfermeiros/Triagem:

1. **Realizar Avaliação**
   - Acesse a aba "Avaliação"
   - Preencha todos os dados da triagem:
     - Sinais vitais
     - Queixa principal
     - Sintomas (checklist)
     - Histórico médico
     - Escala de dor
   - Classifique o paciente clicando na cor apropriada
   - O paciente será automaticamente encaminhado para a fila médica

### Para Médicos:

1. **Atender Pacientes**
   - Acesse "Painel Médico"
   - Clique em "Chamar Próximo Paciente"
   - Visualize todos os dados do paciente e triagem
   - Clique em "Concluir Atendimento" ao finalizar

### Para Pacientes:

1. **Acompanhar Chamadas**
   - Monitore o "Painel Público"
   - Aguarde seu nome aparecer na tela
   - Dirija-se ao local indicado quando chamado

## 🏗️ Arquitetura do Sistema

### Fluxo Principal
```mermaid
graph TD
    A[Cadastro do Paciente] --> B[Fila de Triagem]
    B --> C[Chamada para Triagem]
    C --> D[Avaliação Médica]
    D --> E[Classificação por Prioridade]
    E --> F[Fila Médica Ordenada]
    F --> G[Chamada para Consulta]
    G --> H[Atendimento Médico]
    H --> I[Conclusão]
    I --> J[Histórico]
