# 🧪 Como Executar os Testes do Sistema de Atendimento

## 📋 Pré-requisitos

1. **Backend rodando**: Certifique-se de que o servidor está rodando na porta 3000
2. **Banco de dados**: PostgreSQL configurado e acessível
3. **Dependências**: Execute `npm install` no diretório `siah-backend`

## 🚀 Executando os Testes

### Opção 1: Script Batch (Windows)
```bash
# Navegar para o diretório do backend
cd siah-backend

# Executar todos os testes
test-atendimento.bat

# Executar apenas validações
test-atendimento.bat validacoes

# Executar apenas API
test-atendimento.bat api

# Executar apenas fluxo completo
test-atendimento.bat fluxo

# Mostrar ajuda
test-atendimento.bat ajuda
```

### Opção 2: Node.js Direto
```bash
# Navegar para o diretório do backend
cd siah-backend

# Executar todos os testes
node scripts/test-completo-atendimento.js

# Executar apenas validações
node scripts/test-validacoes-prontuario.js

# Executar apenas API
node scripts/test-api-atendimento.js

# Executar apenas fluxo completo
node scripts/test-atendimento-medico.js
```

## 📊 Exemplo de Execução

### 1. Executar Todos os Testes
```bash
node scripts/test-completo-atendimento.js
```

**Saída esperada:**
```
🚀 INICIANDO SUITE COMPLETA DE TESTES
Sistema de Atendimento Hospitalar - Verificação de Integridade
21/01/2024 20:30:00

================================================================================
TESTE 1: VALIDAÇÕES E DTOS
================================================================================

🧪 Testando: Schema de Criar Prontuário
--------------------------------------------------
✅ Dados válidos completos - VÁLIDO (esperado)
✅ Dados mínimos obrigatórios - VÁLIDO (esperado)
✅ Sem pacienteId - INVÁLIDO (esperado)
✅ Evolução muito curta - INVÁLIDO (esperado)
✅ Evolução muito longa - INVÁLIDO (esperado)
✅ Diagnóstico muito longo - INVÁLIDO (esperado)

📊 Resultado: 6/6 testes passaram

[... mais testes ...]

================================================================================
RELATÓRIO FINAL
================================================================================

📊 RESUMO DOS TESTES:
✅ Validações e DTOs: PASSOU
✅ API Endpoints: PASSOU
✅ Fluxo Completo: PASSOU

🎯 RESULTADO GERAL: 3/3

🎉 TODOS OS TESTES PASSARAM!
✅ O sistema de atendimento médico está funcionando corretamente
✅ Os dados estão sendo salvos corretamente no banco de dados
✅ As validações estão funcionando adequadamente
✅ A API está respondendo corretamente
```

### 2. Executar Apenas Validações
```bash
node scripts/test-validacoes-prontuario.js
```

**Saída esperada:**
```
🧪 INICIANDO TESTES DE VALIDAÇÃO DE PRONTUÁRIO
============================================================

🧪 Testando: Schema de Criar Prontuário
--------------------------------------------------
✅ Dados válidos completos - VÁLIDO (esperado)
✅ Dados mínimos obrigatórios - VÁLIDO (esperado)
✅ Sem pacienteId - INVÁLIDO (esperado)
✅ Evolução muito curta - INVÁLIDO (esperado)
✅ Evolução muito longa - INVÁLIDO (esperado)
✅ Diagnóstico muito longo - INVÁLIDO (esperado)

📊 Resultado: 6/6 testes passaram

[... mais testes ...]

🎉 TODOS OS TESTES PASSARAM!
✅ As validações estão funcionando corretamente
```

### 3. Executar Apenas API
```bash
node scripts/test-api-atendimento.js
```

**Saída esperada:**
```
🚀 INICIANDO TESTES DA API DE ATENDIMENTO
============================================================

🧪 Testando: Autenticação
--------------------------------------------------
✅ Endpoint protegido corretamente - sem token rejeitado
✅ Token inválido rejeitado corretamente

🧪 Testando: Login para obter token válido
--------------------------------------------------
✅ Login realizado com sucesso

🧪 Testando: Endpoints de Atendimento
--------------------------------------------------
✅ Endpoint /atendimentos/fila funcionando
ℹ️  Pacientes na fila: 0
✅ Endpoint /atendimentos/estatisticas funcionando
ℹ️  Estatísticas: {"total":0,"aguardandoMedico":0,"emConsulta":0,"atendidos":0,"porStatus":{},"porCorTriagem":{}}
✅ Endpoint /atendimentos/iniciar validação funcionando (rejeitou paciente inexistente)
✅ Endpoint /atendimentos/finalizar validação funcionando (rejeitou dados inválidos)

📊 Resultado: 4/4 testes passaram

🎉 TODOS OS TESTES DA API PASSARAM!
✅ A API está funcionando corretamente
```

## 🔍 Interpretando os Resultados

### ✅ Sucesso
- **Verde**: Teste passou com sucesso
- **Azul**: Informações adicionais
- **Ciano**: Seções e títulos

### ❌ Falha
- **Vermelho**: Erro crítico ou falha no teste
- **Amarelo**: Aviso ou teste parcialmente bem-sucedido

### 📈 Relatório Final
O script gera um relatório final com:
- Resumo de todos os testes
- Problemas identificados
- Recomendações de correção
- Diagnóstico detalhado

## 🛠️ Solucionando Problemas

### 1. Backend não está rodando
```
⚠️  Backend não está rodando na porta 3000
💡 Inicie o backend primeiro: npm start
```
**Solução**: Execute `npm start` no diretório `siah-backend`

### 2. Erro de conexão com banco
```
❌ Database connection failed: Environment variable not found: DATABASE_URL
```
**Solução**: Verificar se o arquivo `.env` está configurado corretamente

### 3. Erro de autenticação
```
❌ Erro na autenticação: jwt expired
```
**Solução**: Fazer login novamente ou verificar configuração do JWT

### 4. Testes falhando
```
⚠️  ALGUNS TESTES FALHARAM
⚠️  Verifique os problemas identificados acima
```
**Solução**: 
1. Verificar logs detalhados
2. Confirmar se o backend está funcionando
3. Verificar conectividade com o banco
4. Executar testes individuais para isolar o problema

## 🎯 Objetivo dos Testes

Estes scripts verificam:
- ✅ Se os dados do atendimento médico estão sendo salvos corretamente
- ✅ Se as validações estão funcionando adequadamente
- ✅ Se a API está respondendo corretamente
- ✅ Se o fluxo completo está funcionando sem erros
- ✅ Se há problemas de integridade nos dados

**Resultado esperado**: Todos os testes devem passar, confirmando que o sistema está funcionando corretamente.

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs detalhados
2. Confirme se todos os pré-requisitos estão atendidos
3. Execute os testes individuais para isolar o problema
4. Verifique se o backend está funcionando corretamente
