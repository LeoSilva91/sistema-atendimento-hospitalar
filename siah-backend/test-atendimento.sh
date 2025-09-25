#!/bin/bash

# Script para executar testes do sistema de atendimento médico
# Uso: ./test-atendimento.sh [tipo]

echo "🧪 Executando testes do Sistema de Atendimento Médico"
echo "=================================================="

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não está instalado"
    exit 1
fi

# Verificar se o backend está rodando
echo "🔍 Verificando se o backend está rodando..."
if ! curl -s http://localhost:3000/api > /dev/null; then
    echo "⚠️  Backend não está rodando na porta 3000"
    echo "💡 Inicie o backend primeiro: npm start"
    exit 1
fi

echo "✅ Backend está rodando"

# Executar testes
TIPO=${1:-"todos"}

echo "🚀 Executando testes: $TIPO"
echo ""

case $TIPO in
    "validacoes")
        node scripts/test-validacoes-prontuario.js
        ;;
    "api")
        node scripts/test-api-atendimento.js
        ;;
    "fluxo")
        node scripts/test-atendimento-medico.js
        ;;
    "todos"|"")
        node scripts/test-completo-atendimento.js
        ;;
    "ajuda"|"help")
        node scripts/test-completo-atendimento.js ajuda
        ;;
    *)
        echo "❌ Tipo de teste inválido: $TIPO"
        echo ""
        echo "Tipos disponíveis:"
        echo "  validacoes  - Testa validações e DTOs"
        echo "  api         - Testa endpoints da API"
        echo "  fluxo       - Testa fluxo completo"
        echo "  todos       - Executa todos os testes (padrão)"
        echo "  ajuda       - Mostra ajuda"
        exit 1
        ;;
esac

echo ""
echo "🏁 Testes concluídos!"
