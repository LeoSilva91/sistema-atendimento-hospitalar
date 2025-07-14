import React, { useState } from 'react';
import { useSistemaAtendimento } from '../context/HospitalContext';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';

const EmissaoFichas = () => {
  const { fichasEmitidas } = useSistemaAtendimento();
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
        <div className="bg-[#54aaff] text-white p-6 rounded-t-lg">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">Emissão de Fichas</h1>
              <p className="text-blue-100 mt-1">Gerenciamento de fichas de atendimento</p>
            </div>
            <div className="text-right">
              <div className="bg-blue-200 rounded-lg p-4 border border-blue-300 flex flex-col items-center justify-start mt-2">
                <p className="text-xs font-normal text-blue-900 mb-1">Fichas Emitidas</p>
                <p className="text-xl font-semibold text-blue-900">{fichasEmitidas.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch min-h-[400px] mb-8">
            {/* Lista de Fichas */}
            <div className="flex flex-col h-full">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Lista de Fichas</h2>
              {/* Busca */}
              <div className="mb-4">
                <InputText
                  value={busca}
                  onChange={e => setBusca(e.target.value)}
                  placeholder="Buscar por nome, CPF ou número da ficha..."
                  className="w-full"
                />
              </div>
              {/* Lista de Fichas */}
              <div className="flex-1 flex flex-col">
                {fichasFiltradas.length === 0 ? (
                  <div className="bg-gray-50 rounded-lg p-8 text-center flex-1 flex flex-col justify-center min-h-[220px]">
                    <div className="text-gray-400 mb-4">
                      <i className="pi pi-check-circle text-5xl" />
                    </div>
                    <p className="text-gray-500 text-lg">Nenhuma ficha encontrada</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto flex-1">
                    {fichasFiltradas.map((ficha) => {
                      const corInfo = obterCorDisplay(ficha.corTriagem);
                      const isSelected = fichaSelecionada?.id === ficha.id;
                      return (
                        <Card
                          key={ficha.id}
                          className={`transition-all cursor-pointer rounded-lg px-3 py-2 border min-w-0 shadow-sm !mb-0 !mt-0 ${
                            isSelected
                              ? '!border-blue-500 !bg-blue-50'
                              : '!border-gray-200 hover:!border-gray-300 !bg-white'
                          }`}
                          onClick={() => setFichaSelecionada(ficha)}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="bg-blue-500 text-white font-bold text-xs px-2 py-0.5 rounded-full flex-shrink-0">{ficha.numeroFicha}</span>
                            <span className="font-medium text-gray-800 text-sm truncate max-w-[120px]">{ficha.pacienteNome}</span>
                            {isSelected && (
                              <span className="ml-2 text-xs text-blue-600 font-semibold">Selecionada</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{formatarData(ficha.horaEmissao)}</span>
                          </div>
                          <div className="text-xs text-gray-700 truncate max-w-full">{ficha.motivoVisita}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <Tag value={corInfo.nome} className={`${corInfo.bg} ${corInfo.text} px-2 py-0.5 text-xs`} />
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Visualização Detalhada da Ficha */}
            <div className="lg:col-span-2 flex flex-col h-full">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Visualização Detalhada</h2>
              {fichaSelecionada ? (
                <div className="flex-1">
                  <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 rounded-lg p-6">
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-blue-800 mb-2">FICHA DE ATENDIMENTO HOSPITALAR</h3>
                      <div className="text-lg font-semibold text-blue-600">{fichaSelecionada.numeroFicha}</div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Data/Hora de Emissão</label>
                          <p className="font-semibold text-gray-800">{formatarData(fichaSelecionada.horaEmissao)}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Nome do Paciente</label>
                          <p className="font-semibold text-gray-800">{fichaSelecionada.pacienteNome}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">CPF</label>
                          <p className="font-semibold text-gray-800">{fichaSelecionada.cpf}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Motivo da Visita</label>
                          <p className="font-semibold text-gray-800 bg-white p-3 rounded border">{fichaSelecionada.motivoVisita}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Prioridade de Atendimento</label>
                          <div className={`${obterCorDisplay(fichaSelecionada.corTriagem).bg} ${obterCorDisplay(fichaSelecionada.corTriagem).text} px-4 py-2 rounded-lg text-center font-bold`}>
                            {obterCorDisplay(fichaSelecionada.corTriagem).icon} {obterCorDisplay(fichaSelecionada.corTriagem).nome}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 text-center">
                      <p className="text-sm text-gray-600 italic">Esta ficha deve ser apresentada no momento da triagem</p>
                    </div>
                  </Card>
                  {/* Ações */}
                  <Card className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Ações</h3>
                    <div className="flex flex-wrap justify-center gap-4 mt-4">
                      <button
                        onClick={() => handleImprimirFicha(fichaSelecionada)}
                        className="min-w-[120px] h-9 px-4 bg-blue-500 text-white rounded-md font-medium hover:bg-blue-600 transition-colors focus:outline-none"
                      >
                        Imprimir Ficha
                      </button>
                      <button
                        onClick={() => handleSalvarFicha(fichaSelecionada)}
                        className="min-w-[120px] h-9 px-4 bg-green-500 text-white rounded-md font-medium hover:bg-green-600 transition-colors focus:outline-none"
                      >
                        Salvar como TXT
                      </button>
                      <button
                        onClick={() => {
                          const conteudo = `\nFICHA DE ATENDIMENTO HOSPITALAR\n\nNúmero da Ficha: ${fichaSelecionada.numeroFicha}\nData/Hora: ${formatarData(fichaSelecionada.horaEmissao)}\n\nDADOS DO PACIENTE:\nNome: ${fichaSelecionada.pacienteNome}\nCPF: ${fichaSelecionada.cpf}\nMotivo da Visita: ${fichaSelecionada.motivoVisita}\nPrioridade: ${obterCorDisplay(fichaSelecionada.corTriagem).nome}\n\n---\nEsta ficha deve ser apresentada no momento da triagem.`;
                          navigator.clipboard.writeText(conteudo);
                          alert('Ficha copiada para a área de transferência!');
                        }}
                        className="min-w-[120px] h-9 px-4 bg-purple-500 text-white rounded-md font-medium hover:bg-purple-600 transition-colors focus:outline-none"
                      >
                        Copiar Texto
                      </button>
                    </div>
                  </Card>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-8 text-center flex-1 flex flex-col justify-center min-h-[220px]">
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
