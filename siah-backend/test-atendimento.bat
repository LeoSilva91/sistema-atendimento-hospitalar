@echo off
REM Script para executar testes do sistema de atendimento médico
REM Uso: test-atendimento.bat [tipo]

echo 🧪 Executando testes do Sistema de Atendimento Médico
echo ==================================================

REM Verificar se o Node.js está instalado
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js não está instalado
    exit /b 1
)

REM Verificar se o backend está rodando
echo 🔍 Verificando se o backend está rodando...
curl -s http://localhost:3000/api >nul 2>nul
if %errorlevel% neq 0 (
    echo ⚠️  Backend não está rodando na porta 3000
    echo 💡 Inicie o backend primeiro: npm start
    exit /b 1
)

echo ✅ Backend está rodando

REM Executar testes
set TIPO=%1
if "%TIPO%"=="" set TIPO=todos

echo 🚀 Executando testes: %TIPO%
echo.

if "%TIPO%"=="validacoes" (
    node scripts/test-validacoes-prontuario.js
) else if "%TIPO%"=="api" (
    node scripts/test-api-atendimento.js
) else if "%TIPO%"=="fluxo" (
    node scripts/test-atendimento-medico.js
) else if "%TIPO%"=="todos" (
    node scripts/test-completo-atendimento.js
) else if "%TIPO%"=="ajuda" (
    node scripts/test-completo-atendimento.js ajuda
) else if "%TIPO%"=="help" (
    node scripts/test-completo-atendimento.js ajuda
) else (
    echo ❌ Tipo de teste inválido: %TIPO%
    echo.
    echo Tipos disponíveis:
    echo   validacoes  - Testa validações e DTOs
    echo   api         - Testa endpoints da API
    echo   fluxo       - Testa fluxo completo
    echo   todos       - Executa todos os testes (padrão)
    echo   ajuda       - Mostra ajuda
    exit /b 1
)

echo.
echo 🏁 Testes concluídos!
pause
