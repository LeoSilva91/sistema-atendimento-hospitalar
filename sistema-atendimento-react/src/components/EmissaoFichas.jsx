import React, { useState } from 'react';
import { useSistemaAtendimento } from '../context/HospitalContext';

const EmissaoFichas = () => {
  const { fichasEmitidas, obterFichaPorPaciente, obterPacientePorId } = useSistemaAtendimento();
  const [fichaSelecionada, setFichaSelecionada] = useState(null);
  const [busca, setBusca] = useState('');

  const obterCorDisplay = (cor) => {
    const cores = {
      'vermelho': { bg: 'bg-red-500', text: 'text-white', nome: 'EMERGÊNCIA', icon: '🚨' },
      'amarelo': { bg: 'bg-yellow-500', text: 'text-black', nome: 'URGENTE', icon: '⚠️' },
      'verde': { bg: 'bg-green-500', text: 'text-white', nome: 'POUCO URGENTE', icon: '✅' },
      'azul': { bg: 'bg-blue-500', text: 'text-white', nome: 'NÃO URGENTE', icon: 'ℹ️' }
    };
    return cores[cor] || cores['verde'];
  };

  const formatarData = (dataString) => {
    if (!dataString) return '';
    return new Date(dataString).toLocaleString('pt-BR');
  };

  const filtrarFichas = () => {
    if (!busca.trim()) return fichasEmitidas;
    
    const termoBusca = busca.toLowerCase();
    return fichasEmitidas.filter(ficha => 
      ficha.pacienteNome.toLowerCase().includes(termoBusca) ||
      ficha.cpf.includes(termoBusca) ||
      ficha.numeroFicha.toLowerCase().includes(termoBusca)
    );
  };

  const handleImprimirFicha = (ficha) => {
    const conteudo = `
      FICHA DE ATENDIMENTO HOSPITALAR
      
      Número da Ficha: ${ficha.numeroFicha}
      Data/Hora: ${formatarData(ficha.horaEmissao)}
      
      DADOS DO PACIENTE:
      Nome: ${ficha.pacienteNome}
      CPF: ${ficha.cpf}
      Motivo da Visita: ${ficha.motivoVisita}
      Prioridade: ${obterCorDisplay(ficha.corTriagem).nome}
      
      ---
      Esta ficha deve ser apresentada no momento da triagem.
    `;
    
    const janela = window.open('', '_blank');
    janela.document.write(`
      <html>
        <head>
          <title>Ficha ${ficha.numeroFicha}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; font-size: 18px; font-weight: bold; margin-bottom: 20px; }
            .info { margin: 10px 0; }
            .label { font-weight: bold; }
            .priority { padding: 5px 10px; border-radius: 5px; color: white; display: inline-block; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">FICHA DE ATENDIMENTO HOSPITALAR</div>
          
          <div class="info">
            <span class="label">Número da Ficha:</span> ${ficha.numeroFicha}
          </div>
          <div class="info">
            <span class="label">Data/Hora:</span> ${formatarData(ficha.horaEmissao)}
          </div>
          
          <div class="info">
            <span class="label">Nome:</span> ${ficha.pacienteNome}
          </div>
          <div class="info">
            <span class="label">CPF:</span> ${ficha.cpf}
          </div>
          <div class="info">
            <span class="label">Motivo da Visita:</span> ${ficha.motivoVisita}
          </div>
          <div class="info">
            <span class="label">Prioridade:</span> 
            <span class="priority" style="background-color: ${
              ficha.corTriagem === 'vermelho' ? '#ef4444' :
              ficha.corTriagem === 'amarelo' ? '#eab308' :
              ficha.corTriagem === 'verde' ? '#22c55e' : '#3b82f6'
            }">
              ${obterCorDisplay(ficha.corTriagem).nome}
            </span>
          </div>
          
          <div class="footer">
            Esta ficha deve ser apresentada no momento da triagem.
          </div>
        </body>
      </html>
    `);
    janela.document.close();
    janela.print();
  };

  const handleSalvarFicha = (ficha) => {
    const conteudo = `
FICHA DE ATENDIMENTO HOSPITALAR

Número da Ficha: ${ficha.numeroFicha}
Data/Hora: ${formatarData(ficha.horaEmissao)}

DADOS DO PACIENTE:
Nome: ${ficha.pacienteNome}
CPF: ${ficha.cpf}
Motivo da Visita: ${ficha.motivoVisita}
Prioridade: ${obterCorDisplay(ficha.corTriagem).nome}

---
Esta ficha deve ser apresentada no momento da triagem.
    `;
    
    const blob = new Blob([conteudo], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ficha_${ficha.numeroFicha}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const fichasFiltradas = filtrarFichas();

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="bg-blue-600 text-white p-6 rounded-t-lg">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">🎫 Emissão de Fichas</h1>
              <p className="text-blue-100 mt-1">
                Gerenciamento de fichas de atendimento
              </p>
              <p className="text-blue-200 text-sm mt-1">
                Visualize, imprima e salve as fichas emitidas
              </p>
            </div>
            <div className="text-right">
              <div className="bg-blue-500 rounded-lg p-3">
                <p className="text-sm text-blue-100">Fichas Emitidas</p>
                <p className="text-2xl font-bold">{fichasEmitidas.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lista de Fichas */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                📋 Fichas Emitidas
              </h2>

              {/* Busca */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Buscar por nome, CPF ou número da ficha..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Lista de Fichas */}
              {fichasFiltradas.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-lg">Nenhuma ficha encontrada</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {fichasFiltradas.map((ficha) => {
                    const corInfo = obterCorDisplay(ficha.corTriagem);
                    const isSelected = fichaSelecionada?.id === ficha.id;
                    
                    return (
                      <div
                        key={ficha.id}
                        onClick={() => setFichaSelecionada(ficha)}
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                          isSelected 
                            ? 'border-blue-400 bg-blue-50' 
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-bold text-gray-600">{ficha.numeroFicha}</span>
                              <span className="font-semibold text-gray-800">{ficha.pacienteNome}</span>
                              {isSelected && (
                                <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                                  SELECIONADA
                                </span>
                              )}
                            </div>
                            
                            <div className="text-sm text-gray-600 mb-2">
                              <span>📅 {formatarData(ficha.horaEmissao)}</span>
                            </div>
                            
                            <p className="text-gray-700 text-sm bg-gray-50 p-2 rounded mb-2">
                              {ficha.motivoVisita}
                            </p>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className={`${corInfo.bg} ${corInfo.text} px-2 py-1 rounded text-xs font-bold`}>
                            {corInfo.icon} {corInfo.nome}
                          </div>
                          
                          <div className="text-xs text-gray-500">
                            CPF: {ficha.cpf}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Visualização da Ficha */}
            <div className="lg:col-span-2">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">🎫 Visualização da Ficha</h2>
              
              {fichaSelecionada ? (
                <div className="space-y-6">
                  {/* Ficha de Atendimento */}
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 rounded-lg p-6">
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-blue-800 mb-2">
                        FICHA DE ATENDIMENTO HOSPITALAR
                      </h3>
                      <div className="text-lg font-semibold text-blue-600">
                        {fichaSelecionada.numeroFicha}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">
                            Data/Hora de Emissão
                          </label>
                          <p className="font-semibold text-gray-800">
                            {formatarData(fichaSelecionada.horaEmissao)}
                          </p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">
                            Nome do Paciente
                          </label>
                          <p className="font-semibold text-gray-800">
                            {fichaSelecionada.pacienteNome}
                          </p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">
                            CPF
                          </label>
                          <p className="font-semibold text-gray-800">
                            {fichaSelecionada.cpf}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">
                            Motivo da Visita
                          </label>
                          <p className="font-semibold text-gray-800 bg-white p-3 rounded border">
                            {fichaSelecionada.motivoVisita}
                          </p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">
                            Prioridade de Atendimento
                          </label>
                          <div className={`${obterCorDisplay(fichaSelecionada.corTriagem).bg} ${obterCorDisplay(fichaSelecionada.corTriagem).text} px-4 py-2 rounded-lg text-center font-bold`}>
                            {obterCorDisplay(fichaSelecionada.corTriagem).icon} {obterCorDisplay(fichaSelecionada.corTriagem).nome}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 text-center">
                      <p className="text-sm text-gray-600 italic">
                        Esta ficha deve ser apresentada no momento da triagem
                      </p>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">🖨️ Ações</h3>
                    
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => handleImprimirFicha(fichaSelecionada)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center space-x-2"
                      >
                        <span>🖨️</span>
                        <span>Imprimir Ficha</span>
                      </button>
                      
                      <button
                        onClick={() => handleSalvarFicha(fichaSelecionada)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors flex items-center space-x-2"
                      >
                        <span>💾</span>
                        <span>Salvar como TXT</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          const conteudo = `
FICHA DE ATENDIMENTO HOSPITALAR

Número da Ficha: ${fichaSelecionada.numeroFicha}
Data/Hora: ${formatarData(fichaSelecionada.horaEmissao)}

DADOS DO PACIENTE:
Nome: ${fichaSelecionada.pacienteNome}
CPF: ${fichaSelecionada.cpf}
Motivo da Visita: ${fichaSelecionada.motivoVisita}
Prioridade: ${obterCorDisplay(fichaSelecionada.corTriagem).nome}

---
Esta ficha deve ser apresentada no momento da triagem.
                          `;
                          navigator.clipboard.writeText(conteudo);
                          alert('Ficha copiada para a área de transferência!');
                        }}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors flex items-center space-x-2"
                      >
                        <span>📋</span>
                        <span>Copiar Texto</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-lg">Selecione uma ficha para visualizar</p>
                  <p className="text-gray-400 text-sm mt-2">Clique em uma ficha da lista ao lado</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmissaoFichas;
