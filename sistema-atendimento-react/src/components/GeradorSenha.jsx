import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Tag } from 'primereact/tag';

const GeradorSenha = () => {
  const [senhaGerada, setSenhaGerada] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [ultimasSenhas, setUltimasSenhas] = useState([]);

  // Atualizar hora a cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const gerarSenha = (tipo) => {
    const timestamp = new Date();
    
    // Gerar número sequencial baseado no tipo
    const senhasExistentes = JSON.parse(localStorage.getItem('senhas') || '[]');
    const senhasTipo = senhasExistentes.filter(s => s.tipo === tipo);
    const numeroSenha = senhasTipo.length + 1;
    
    const novaSenha = {
      id: Date.now(),
      numero: numeroSenha,
      tipo: tipo,
      horaGeracao: timestamp.toISOString(),
      status: 'aguardando',
      prefixo: tipo === 'prioridade' ? 'P' : 'N'
    };

    // Salvar no localStorage
    const todasSenhas = [...senhasExistentes, novaSenha];
    localStorage.setItem('senhas', JSON.stringify(todasSenhas));

    // Atualizar últimas senhas
    setUltimasSenhas(prev => [novaSenha, ...prev.slice(0, 4)]);

    setSenhaGerada(novaSenha);
    setShowDialog(true);
  };

  const imprimirSenha = (senha) => {
    const conteudo = `
      <html>
        <head>
          <title>Senha ${senha.prefixo}${senha.numero}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 20px; 
              text-align: center;
              background: white;
            }
            .senha-print {
              border: 3px solid #2563eb;
              border-radius: 10px;
              padding: 20px;
              margin: 10px;
              background: white;
            }
            .numero-senha {
              font-size: 48px;
              font-weight: bold;
              color: #2563eb;
              margin: 10px 0;
            }
            .tipo-senha {
              font-size: 24px;
              color: ${senha.tipo === 'prioridade' ? '#dc2626' : '#059669'};
              font-weight: bold;
              margin: 10px 0;
            }
            .hora {
              font-size: 16px;
              color: #6b7280;
              margin: 10px 0;
            }
            .instrucoes {
              font-size: 14px;
              color: #374151;
              margin-top: 20px;
              border-top: 1px solid #e5e7eb;
              padding-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="senha-print">
            <div class="tipo-senha">
              ${senha.tipo === 'prioridade' ? '🚨 PRIORIDADE' : '📋 NORMAL'}
            </div>
            <div class="numero-senha">
              ${senha.prefixo}${senha.numero.toString().padStart(3, '0')}
            </div>
            <div class="hora">
              ${new Date(senha.horaGeracao).toLocaleTimeString('pt-BR')}
            </div>
            <div class="instrucoes">
              Aguarde ser chamado na recepção
            </div>
          </div>
        </body>
      </html>
    `;

    const janela = window.open('', '', 'width=400,height=300');
    janela.document.write(conteudo);
    janela.document.close();
    janela.print();
    janela.close();
  };

  const obterCorTipo = (tipo) => {
    return tipo === 'prioridade' 
      ? { bg: 'bg-red-500', text: 'text-white', nome: 'PRIORIDADE' }
      : { bg: 'bg-green-500', text: 'text-white', nome: 'NORMAL' };
  };

  const formatarHora = (dataString) => {
    return new Date(dataString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 pt-2">
      <div className="max-w-4xl mx-auto">
        {/* Header minimalista */}
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-gray-800">
            Gerador de Senhas
          </h1>
          <div className="flex items-center text-gray-500 text-sm mt-1">
            {currentTime.toLocaleTimeString('pt-BR')} • {currentTime.toLocaleDateString('pt-BR')}
          </div>
        </div>

        {/* Botões de Geração */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <button
            onClick={() => gerarSenha('normal')}
            className="w-full flex justify-center items-center focus:outline-none bg-transparent border-none p-0"
            aria-label="Emitir senha normal"
            tabIndex={0}
            onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && gerarSenha('normal')}
            type="button"
          >
            <div 
              style={{ background: '#00d34d' }} 
              className="w-64 h-64 rounded-full flex flex-col items-center justify-center shadow-lg hover:scale-105 active:scale-95 cursor-pointer transition-all"
            >
              <span style={{ color: '#fff' }} className="text-2xl font-bold">
                NORMAL
              </span>
            </div>
          </button>
          <button
            onClick={() => gerarSenha('prioridade')}
            className="w-full flex justify-center items-center focus:outline-none bg-transparent border-none p-0"
            aria-label="Emitir senha prioridade"
            tabIndex={0}
            onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && gerarSenha('prioridade')}
            type="button"
          >
            <div 
              style={{ background: '#ff3232' }} 
              className="w-64 h-64 rounded-full flex flex-col items-center justify-center shadow-lg hover:scale-105 active:scale-95 cursor-pointer transition-all"
            >
              <span style={{ color: '#fff' }} className="text-2xl font-bold">
                PRIORIDADE
              </span>
            </div>
          </button>
        </div>

        {/* Instruções */}
        <Card className="shadow-md bg-blue-50 border-blue-200">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">
            Como Escolher sua Senha
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2">
                Senha Normal (Verde)
              </h4>
              <div className="text-green-700 space-y-1 text-sm">
                <p>• Consultas de rotina</p>
                <p>• Exames agendados</p>
                <p>• Retornos médicos</p>
                <p>• Casos não urgentes</p>
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-800 mb-2">
                Senha Prioridade (Vermelha)
              </h4>
              <div className="text-red-700 space-y-1 text-sm">
                <p>• Emergências médicas</p>
                <p>• Casos urgentes</p>
                <p>• Dor intensa</p>
                <p>• Sintomas graves</p>
              </div>
            </div>
          </div>
          <div className="mt-4 text-blue-700 space-y-1 text-sm">
            <p>• Aguarde ser chamado na recepção</p>
            <p>• Mantenha sua senha em local visível</p>
            <p>• Em caso de dúvida, procure a recepção</p>
          </div>
        </Card>

        {/* Dialog da Senha Gerada */}
        <Dialog
          header="Senha Gerada com Sucesso!"
          visible={showDialog}
          style={{ width: '100%', maxWidth: 380 }}
          onHide={() => setShowDialog(false)}
          className="rounded-xl"
          closable={false}
        >
          {senhaGerada && (
            <div className="flex flex-col items-center justify-center p-6 gap-5">
              <div
                style={{
                  background: senhaGerada.tipo === 'prioridade' ? '#ff3232' : '#00d34d',
                  color: '#fff',
                  width: 170,
                  height: 170,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '9999px',
                  fontWeight: 'bold',
                  fontSize: '3rem',
                  boxShadow: '0 4px 24px 0 rgba(0,0,0,0.10)'
                }}
              >
                {senhaGerada.prefixo}{senhaGerada.numero.toString().padStart(3, '0')}
              </div>
              <span 
                className={`px-5 py-1 rounded-full text-sm font-bold tracking-wide shadow-sm ${
                  senhaGerada.tipo === 'prioridade' 
                    ? 'bg-[#ff3232]/90 text-white' 
                    : 'bg-[#00d34d]/90 text-white'
                }`}
                style={{letterSpacing: 2}}
              >
                {senhaGerada.tipo === 'prioridade' ? 'PRIORIDADE' : 'NORMAL'}
              </span>
              <span className="text-gray-400 text-xs mt-0.5">
                Gerada às {formatarHora(senhaGerada.horaGeracao)}
              </span>
              <div className="bg-gray-100 rounded-lg p-3 w-full text-center text-gray-700 text-base font-medium">
                Aguarde ser chamado na recepção
              </div>
              <div className="flex gap-3 w-full mt-2">
                <Button
                  label="Imprimir"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-0 py-2 font-semibold text-base rounded-lg shadow-sm"
                  onClick={() => {
                    imprimirSenha(senhaGerada);
                    setShowDialog(false);
                  }}
                />
                <Button
                  label="Fechar"
                  outlined
                  className="flex-1 border-blue-600 text-blue-600 px-0 py-2 font-semibold text-base rounded-lg shadow-sm transition-colors duration-200 custom-fechar-btn"
                  onClick={() => setShowDialog(false)}
                  style={{}}
                />
              </div>
            </div>
          )}
        </Dialog>
      </div>
      {/* CSS customizado para garantir hover vermelho no botão Fechar */}
      <style>{`
        .custom-fechar-btn:hover,
        .custom-fechar-btn:focus {
          background: #ff3232 !important;
          color: #fff !important;
          border-color: #ff3232 !important;
        }
      `}</style>
    </div>
  );
};

export default GeradorSenha; 