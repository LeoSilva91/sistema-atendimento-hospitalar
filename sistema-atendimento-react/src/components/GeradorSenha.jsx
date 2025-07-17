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
          style={{ width: '90vw', maxWidth: 350 }}
          className="rounded-lg"
          header={false}
          closable={false}
        >
          {senhaGerada && (
            <div className="text-center p-6">
              <div className="mb-6">
                <div
                  className={`rounded-lg flex items-center justify-center font-bold text-5xl mx-auto mb-4 ${obterCorTipo(senhaGerada.tipo).bg} ${obterCorTipo(senhaGerada.tipo).text}`}
                  style={{ width: 100, height: 100 }}
                >
                  {senhaGerada.prefixo}{senhaGerada.numero.toString().padStart(3, '0')}
                </div>
                <div className="text-gray-600 text-sm">
                  Gerada às {formatarHora(senhaGerada.horaGeracao)}
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  label="Imprimir"
                  icon="pi pi-print"
                  onClick={() => imprimirSenha(senhaGerada)}
                  className="flex-1 !bg-blue-600 !text-white !border-0"
                />
                <Button
                  label="Fechar"
                  outlined
                  onClick={() => setShowDialog(false)}
                  className="flex-1 !bg-gray-100 !text-gray-700 !border-0"
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