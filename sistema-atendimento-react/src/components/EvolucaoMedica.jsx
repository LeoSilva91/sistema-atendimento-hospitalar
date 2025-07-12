import React from 'react';

const EvolucaoMedica = ({ paciente }) => {
  const formatarObservacoes = (observacoes) => {
    if (!observacoes) return null;
    
    const linhas = observacoes.split('\n').filter(linha => linha.trim());
    const secoes = {};
    let secaoAtual = '';
    
    linhas.forEach(linha => {
      if (linha.includes(':')) {
        const [titulo, ...conteudo] = linha.split(':');
        if (conteudo.length > 0) {
          secoes[titulo.trim()] = conteudo.join(':').trim();
        }
      } else if (linha.startsWith('-')) {
        if (secaoAtual) {
          if (!secoes[secaoAtual]) secoes[secaoAtual] = [];
          if (Array.isArray(secoes[secaoAtual])) {
            secoes[secaoAtual].push(linha.trim());
          }
        }
      } else if (linha.trim()) {
        secaoAtual = linha.trim();
        if (!secoes[secaoAtual]) secoes[secaoAtual] = [];
      }
    });
    
    return secoes;
  };

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

  if (!paciente) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <p className="text-gray-500 text-lg">Nenhum paciente selecionado</p>
      </div>
    );
  }

  const secoesTriagem = paciente.observacoesTriagem ? formatarObservacoes(paciente.observacoesTriagem) : null;
  const secoesEvolucao = paciente.observacoesAtendimento ? formatarObservacoes(paciente.observacoesAtendimento) : null;

  return (
    <div className="space-y-6">
      {/* Cabeçalho do Paciente */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold mb-2">{paciente.nome}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-blue-200">ID:</span>
                <p className="font-semibold">#{paciente.id}</p>
              </div>
              <div>
                <span className="text-blue-200">CPF:</span>
                <p className="font-semibold">{paciente.cpf}</p>
              </div>
              <div>
                <span className="text-blue-200">Data Nasc.:</span>
                <p className="font-semibold">{paciente.dataNascimento}</p>
              </div>
              <div>
                <span className="text-blue-200">Convênio:</span>
                <p className="font-semibold">{paciente.convenio}</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className={`${obterCorDisplay(paciente.corTriagem).bg} ${obterCorDisplay(paciente.corTriagem).text} px-3 py-2 rounded-lg`}>
              <div className="text-lg">{obterCorDisplay(paciente.corTriagem).icon}</div>
              <div className="text-xs font-bold">{obterCorDisplay(paciente.corTriagem).nome}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Informações de Tempo */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">⏰ Cronologia do Atendimento</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-600">Cadastro:</span>
            <p className="text-gray-800">{formatarData(paciente.horaCadastro)}</p>
          </div>
          {paciente.horaTriagem && (
            <div>
              <span className="font-medium text-gray-600">Triagem:</span>
              <p className="text-gray-800">{formatarData(paciente.horaTriagem)}</p>
            </div>
          )}
          {paciente.horaAtendimento && (
            <div>
              <span className="font-medium text-gray-600">Atendimento:</span>
              <p className="text-gray-800">{formatarData(paciente.horaAtendimento)}</p>
            </div>
          )}
          {paciente.horaConclusao && (
            <div>
              <span className="font-medium text-gray-600">Conclusão:</span>
              <p className="text-gray-800">{formatarData(paciente.horaConclusao)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Ficha de Triagem */}
      {secoesTriagem && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-orange-800 mb-4 flex items-center">
            <span className="text-2xl mr-2">🚨</span>
            Ficha de Triagem
            {paciente.horaTriagem && (
              <span className="ml-auto text-sm font-normal text-orange-600">
                {formatarData(paciente.horaTriagem)}
              </span>
            )}
          </h3>
          
          <div className="space-y-4">
            {secoesTriagem['QUEIXA PRINCIPAL'] && (
              <div className="bg-white rounded-lg p-4 border border-orange-200">
                <h4 className="font-semibold text-orange-700 mb-2">🏥 Queixa Principal</h4>
                <p className="text-gray-700">{secoesTriagem['QUEIXA PRINCIPAL']}</p>
              </div>
            )}

            {secoesTriagem['SINAIS VITAIS'] && (
              <div className="bg-white rounded-lg p-4 border border-orange-200">
                <h4 className="font-semibold text-orange-700 mb-2">💓 Sinais Vitais</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                  {Array.isArray(secoesTriagem['SINAIS VITAIS']) ? 
                    secoesTriagem['SINAIS VITAIS'].map((sinal, index) => (
                      <div key={index} className="text-gray-700">{sinal}</div>
                    )) :
                    <div className="text-gray-700">{secoesTriagem['SINAIS VITAIS']}</div>
                  }
                </div>
              </div>
            )}

            {secoesTriagem['SINTOMAS'] && (
              <div className="bg-white rounded-lg p-4 border border-orange-200">
                <h4 className="font-semibold text-orange-700 mb-2">🔍 Sintomas</h4>
                <p className="text-gray-700">{secoesTriagem['SINTOMAS']}</p>
              </div>
            )}

            {secoesTriagem['OUTROS SINTOMAS'] && (
              <div className="bg-white rounded-lg p-4 border border-orange-200">
                <h4 className="font-semibold text-orange-700 mb-2">📝 Outros Sintomas</h4>
                <p className="text-gray-700">{secoesTriagem['OUTROS SINTOMAS']}</p>
              </div>
            )}

            {secoesTriagem['HISTÓRICO MÉDICO'] && (
              <div className="bg-white rounded-lg p-4 border border-orange-200">
                <h4 className="font-semibold text-orange-700 mb-2">📋 Histórico Médico</h4>
                <p className="text-gray-700">{secoesTriagem['HISTÓRICO MÉDICO']}</p>
              </div>
            )}

            {secoesTriagem['MEDICAMENTOS EM USO'] && (
              <div className="bg-white rounded-lg p-4 border border-orange-200">
                <h4 className="font-semibold text-orange-700 mb-2">💊 Medicamentos em Uso</h4>
                <p className="text-gray-700">{secoesTriagem['MEDICAMENTOS EM USO']}</p>
              </div>
            )}

            {secoesTriagem['AVALIAÇÃO DE DOR'] && (
              <div className="bg-white rounded-lg p-4 border border-orange-200">
                <h4 className="font-semibold text-orange-700 mb-2">😣 Avaliação de Dor</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Array.isArray(secoesTriagem['AVALIAÇÃO DE DOR']) ? 
                    secoesTriagem['AVALIAÇÃO DE DOR'].map((dor, index) => (
                      <div key={index} className="text-gray-700">{dor}</div>
                    )) :
                    <div className="text-gray-700">{secoesTriagem['AVALIAÇÃO DE DOR']}</div>
                  }
                </div>
              </div>
            )}

            {secoesTriagem['NÍVEL DE CONSCIÊNCIA'] && (
              <div className="bg-white rounded-lg p-4 border border-orange-200">
                <h4 className="font-semibold text-orange-700 mb-2">⚠️ Nível de Consciência</h4>
                <p className="text-gray-700">{secoesTriagem['NÍVEL DE CONSCIÊNCIA']}</p>
              </div>
            )}

            {secoesTriagem['OBSERVAÇÕES'] && (
              <div className="bg-white rounded-lg p-4 border border-orange-200">
                <h4 className="font-semibold text-orange-700 mb-2">📝 Observações da Triagem</h4>
                <p className="text-gray-700">{secoesTriagem['OBSERVAÇÕES']}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Evolução Clínica */}
      {secoesEvolucao && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-green-800 mb-4 flex items-center">
            <span className="text-2xl mr-2">👨‍⚕️</span>
            Evolução Clínica
            {paciente.horaConclusao && (
              <span className="ml-auto text-sm font-normal text-green-600">
                {formatarData(paciente.horaConclusao)}
              </span>
            )}
          </h3>
          
          <div className="space-y-4">
            {secoesEvolucao['QUEIXA ATUAL'] && (
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <h4 className="font-semibold text-green-700 mb-2">🏥 Queixa Atual</h4>
                <p className="text-gray-700">{secoesEvolucao['QUEIXA ATUAL']}</p>
              </div>
            )}

            {secoesEvolucao['EXAME FÍSICO'] && (
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <h4 className="font-semibold text-green-700 mb-2">🔍 Exame Físico</h4>
                <p className="text-gray-700">{secoesEvolucao['EXAME FÍSICO']}</p>
              </div>
            )}

            {secoesEvolucao['HIPÓTESE DIAGNÓSTICA'] && (
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <h4 className="font-semibold text-green-700 mb-2">🔬 Hipótese Diagnóstica</h4>
                <p className="text-gray-700">{secoesEvolucao['HIPÓTESE DIAGNÓSTICA']}</p>
              </div>
            )}

            {secoesEvolucao['CONDUTA'] && (
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <h4 className="font-semibold text-green-700 mb-2">📋 Conduta</h4>
                <p className="text-gray-700">{secoesEvolucao['CONDUTA']}</p>
              </div>
            )}

            {secoesEvolucao['PRESCRIÇÕES'] && (
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <h4 className="font-semibold text-green-700 mb-2">💊 Prescrições</h4>
                <div className="space-y-2">
                  {secoesEvolucao['PRESCRIÇÕES'].split('\n').filter(linha => linha.trim()).map((prescricao, index) => (
                    <div key={index} className="text-gray-700 text-sm bg-gray-50 p-2 rounded">
                      {prescricao}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {secoesEvolucao['EXAMES SOLICITADOS'] && (
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <h4 className="font-semibold text-green-700 mb-2">🔬 Exames Solicitados</h4>
                <div className="space-y-2">
                  {secoesEvolucao['EXAMES SOLICITADOS'].split('\n').filter(linha => linha.trim()).map((exame, index) => (
                    <div key={index} className="text-gray-700 text-sm bg-gray-50 p-2 rounded">
                      {exame}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {secoesEvolucao['ORIENTAÇÕES'] && (
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <h4 className="font-semibold text-green-700 mb-2">📝 Orientações</h4>
                <p className="text-gray-700">{secoesEvolucao['ORIENTAÇÕES']}</p>
              </div>
            )}

            {secoesEvolucao['ENCAMINHAMENTO'] && (
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <h4 className="font-semibold text-green-700 mb-2">🔄 Encaminhamento</h4>
                <p className="text-gray-700">{secoesEvolucao['ENCAMINHAMENTO']}</p>
              </div>
            )}

            {secoesEvolucao['DATA DE RETORNO'] && (
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <h4 className="font-semibold text-green-700 mb-2">📅 Data de Retorno</h4>
                <p className="text-gray-700">{secoesEvolucao['DATA DE RETORNO']}</p>
              </div>
            )}

            {secoesEvolucao['Médico Responsável'] && (
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <h4 className="font-semibold text-green-700 mb-2">👨‍⚕️ Médico Responsável</h4>
                <p className="text-gray-700">{secoesEvolucao['Médico Responsável']}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Status Final */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">📊 Status do Atendimento</h3>
        <div className="flex items-center space-x-4">
          <div className={`px-4 py-2 rounded-lg font-semibold ${
            paciente.status === 'atendido' ? 'bg-green-100 text-green-800' :
            paciente.status === 'em_atendimento' ? 'bg-blue-100 text-blue-800' :
            paciente.status === 'aguardando' ? 'bg-yellow-100 text-yellow-800' :
            'bg-orange-100 text-orange-800'
          }`}>
            {paciente.status === 'atendido' ? '✅ Atendido' :
             paciente.status === 'em_atendimento' ? '🩺 Em Atendimento' :
             paciente.status === 'aguardando' ? '⏳ Aguardando' :
             '🚨 Aguardando Triagem'}
          </div>
          {paciente.status === 'atendido' && (
            <span className="text-sm text-gray-600">
              Atendimento concluído em {formatarData(paciente.horaConclusao)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default EvolucaoMedica;
