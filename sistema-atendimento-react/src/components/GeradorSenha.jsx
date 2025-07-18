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
            @page {
              size: 80mm auto;
              margin: 5mm;
            }
            @media print {
              body { 
                margin: 0; 
                padding: 0;
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
              }
              .senha-print { 
                page-break-inside: avoid; 
                box-shadow: none !important;
              }
            }
            body { 
              font-family: 'Courier New', monospace; 
              margin: 0; 
              padding: 10px; 
              text-align: center;
              background: white;
              font-size: 12px;
            }
            .senha-print {
              border: 2px solid #000;
              border-radius: 5px;
              padding: 10px;
              width: 160px;
              margin: 0 auto;
              background: white;
            }
            .header {
              font-size: 10px;
              font-weight: bold;
              color: #000;
              margin-bottom: 5px;
            }
            .numero-senha {
              font-size: 28px;
              font-weight: bold;
              color: ${senha.tipo === 'prioridade' ? '#000' : '#000'};
              margin: 8px 0;
              letter-spacing: 2px;
              border: 1px solid #000;
              padding: 5px;
              background: ${senha.tipo === 'prioridade' ? '#f0f0f0' : '#fff'};
            }
            .tipo-senha {
              font-size: 11px;
              color: #000;
              font-weight: bold;
              margin: 5px 0;
              text-transform: uppercase;
            }
            .hora {
              font-size: 10px;
              color: #000;
              margin: 5px 0;
            }
            .instrucoes {
              font-size: 9px;
              color: #000;
              margin-top: 8px;
              border-top: 1px dashed #000;
              padding-top: 5px;
              line-height: 1.2;
            }
          </style>
        </head>
        <body>
          <div class="senha-print">
            <div class="header">SIAH - Sistema Hospitalar</div>
            <div class="tipo-senha">${senha.tipo === 'prioridade' ? '*** PRIORIDADE ***' : 'ATENDIMENTO NORMAL'}</div>
            <div class="numero-senha">${senha.prefixo}${senha.numero.toString().padStart(3, '0')}</div>
            <div class="hora">${new Date(senha.horaGeracao).toLocaleString('pt-BR')}</div>
            <div class="instrucoes">Aguarde ser chamado<br/>Guarde este comprovante</div>
          </div>
        </body>
      </html>
    `;

    try {
      const janela = window.open('', '_blank', 'width=300,height=400,scrollbars=no,resizable=no');
      
      if (!janela) {
        alert('Bloqueador de pop-up ativo. Permita pop-ups para imprimir.');
        return;
      }

      janela.document.open();
      janela.document.write(conteudo);
      janela.document.close();
      
      // Aguardar carregamento e focar na janela
      janela.focus();
      
      setTimeout(() => {
        janela.print();
        setTimeout(() => {
          janela.close();
        }, 1000);
      }, 500);
      
    } catch (error) {
      console.error('Erro ao imprimir:', error);
      alert('Erro ao abrir janela de impressão. Tente novamente.');
    }
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
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 pt-2">
      <div className="max-w-4xl mx-auto">
        {/* Header minimalista */}
        <div className="mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Gerador de Senhas
          </h1>
          <div className="flex items-center text-gray-500 text-xs sm:text-sm mt-1">
            {currentTime.toLocaleTimeString('pt-BR')} • {currentTime.toLocaleDateString('pt-BR')}
          </div>
        </div>

        {/* Botões de Geração */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <button
            onClick={() => gerarSenha('normal')}
            className="w-full h-32 sm:h-40 bg-green-500 hover:bg-green-600 text-white font-semibold text-lg sm:text-xl rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-300"
            aria-label="Emitir senha normal"
            type="button"
          >
            NORMAL
          </button>
          <button
            onClick={() => gerarSenha('prioridade')}
            className="w-full h-32 sm:h-40 bg-red-500 hover:bg-red-600 text-white font-semibold text-lg sm:text-xl rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-300"
            aria-label="Emitir senha prioridade"
            type="button"
          >
            PRIORIDADE
          </button>
        </div>

        {/* Instruções */}
        <Card className="shadow-md bg-blue-50 border-blue-200">
          <h3 className="text-base sm:text-lg font-semibold text-blue-800 mb-3">
            Como Escolher sua Senha
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
              <h4 className="font-semibold text-green-800 mb-2 text-sm sm:text-base">
                Senha Normal (Verde)
              </h4>
              <div className="text-green-700 space-y-1 text-xs sm:text-sm">
                <p>• Consultas de rotina</p>
                <p>• Exames agendados</p>
                <p>• Retornos médicos</p>
                <p>• Casos não urgentes</p>
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
              <h4 className="font-semibold text-red-800 mb-2 text-sm sm:text-base">
                Senha Prioridade (Vermelho)
              </h4>
              <div className="text-red-700 space-y-1 text-xs sm:text-sm">
                <p>• Emergências</p>
                <p>• Casos urgentes</p>
                <p>• Idosos e gestantes</p>
                <p>• Crianças pequenas</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Últimas Senhas Geradas */}
        {ultimasSenhas.length > 0 && (
          <Card className="shadow-md mt-4 sm:mt-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
              Últimas Senhas Geradas
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {ultimasSenhas.map((senha) => {
                const corInfo = obterCorTipo(senha.tipo);
                return (
                  <div
                    key={senha.id}
                    className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`rounded-full flex items-center justify-center font-bold text-lg sm:text-xl ${corInfo.bg} ${corInfo.text}`}
                        style={{ width: 50, height: 50 }}
                      >
                        {senha.prefixo}{senha.numero.toString().padStart(3, '0')}
                      </div>
                      <div>
                        <div className={`font-semibold text-sm ${corInfo.text}`}>{corInfo.nome}</div>
                        <div className="text-xs text-gray-500">{formatarHora(senha.horaGeracao)}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Modal de Senha Gerada */}
        <Dialog
          visible={showDialog}
          onHide={() => setShowDialog(false)}
          style={{ width: '320px' }}
          header={false}
          closable={false}
          modal
          className="p-0"
        >
          {senhaGerada && (
            <div className="text-center p-4">
              {/* Número da Senha */}
              <div className="mb-4">
                <div
                  className={`w-20 h-20 rounded-lg flex items-center justify-center font-bold text-2xl mx-auto mb-3 ${obterCorTipo(senhaGerada.tipo).bg} ${obterCorTipo(senhaGerada.tipo).text}`}
                >
                  {senhaGerada.prefixo}{senhaGerada.numero.toString().padStart(3, '0')}
                </div>
                <div className="text-gray-600 text-sm">
                  Gerada às {formatarHora(senhaGerada.horaGeracao)}
                </div>
              </div>
              
              {/* Botões */}
              <div className="space-y-2">
                <Button
                  label="Imprimir"
                  icon="pi pi-print"
                  onClick={() => imprimirSenha(senhaGerada)}
                  className="w-full !bg-blue-600 !text-white !border-blue-600"
                />
                <Button
                  label="Fechar"
                  onClick={() => setShowDialog(false)}
                  className="w-full !bg-gray-100 !text-gray-700 !border-gray-300"
                  outlined
                />
              </div>
            </div>
          )}
        </Dialog>
      </div>
    </div>
  );
};

export default GeradorSenha; 