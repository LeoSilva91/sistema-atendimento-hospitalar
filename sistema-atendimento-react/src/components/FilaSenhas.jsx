import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Dialog } from 'primereact/dialog';
import { useToast } from '../context/ToastProvider';
import api from '../services/api';

const FilaSenhas = ({ onChamarPaciente }) => {
  const [senhas, setSenhas] = useState([]);
  const [senhaAtual, setSenhaAtual] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const { success: showToast, error: showError } = useToast();

  // Carregar senhas do localStorage
  useEffect(() => {
    carregarSenhas();
    const interval = setInterval(carregarSenhas, 5000); // Atualizar a cada 5 segundos
    return () => clearInterval(interval);
  }, []);

  const carregarSenhas = async () => {
    try {
      const response = await api.get('/senhas');
      if (response.data.success) {
        const senhasAguardando = response.data.data.filter(s => s.status === 'AGUARDANDO');
        
        // Ordenar: prioridade primeiro, depois por hora de geração
        const senhasOrdenadas = senhasAguardando.sort((a, b) => {
          if (a.tipo !== b.tipo) {
            return a.tipo === 'PRIORIDADE' ? -1 : 1;
          }
          return new Date(a.createdAt) - new Date(b.createdAt);
        });
        
        setSenhas(senhasOrdenadas);
      }
    } catch (error) {
      console.error('Erro ao carregar senhas:', error);
    }
  };

  const chamarProximaSenha = async () => {
    if (senhas.length === 0) {
      showError('Não há senhas aguardando na fila');
      return;
    }

    const proximaSenha = senhas[0];
    setSenhaAtual(proximaSenha);
    setShowDialog(true);

    try {
      // Marcar como chamada na API
      await api.put(`/senhas/${proximaSenha.id}/chamar`);
      
      // Atualizar estado local
      await carregarSenhas();
      
      showToast(`Senha ${proximaSenha.numero} chamada!`);

      // Notificar componente pai (cadastro)
      if (onChamarPaciente) {
        onChamarPaciente(proximaSenha);
      }
    } catch (error) {
      console.error('Erro ao chamar senha:', error);
      showError('Erro ao chamar senha. Tente novamente.');
    }
  };

  const iniciarCadastro = () => {
    setShowDialog(false);
    if (onChamarPaciente) {
      onChamarPaciente(senhaAtual);
    }
  };

  const cancelarChamada = () => {
    if (!senhaAtual) return;

    // Voltar status para aguardando
    const todasSenhas = JSON.parse(localStorage.getItem('senhas') || '[]');
    const senhasAtualizadas = todasSenhas.map(s => 
      s.id === senhaAtual.id ? { ...s, status: 'aguardando' } : s
    );
    localStorage.setItem('senhas', JSON.stringify(senhasAtualizadas));

    setShowDialog(false);
    setSenhaAtual(null);
    carregarSenhas();
    showToast('Chamada cancelada');
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

  const formatarTempoEspera = (horaGeracao) => {
    const agora = new Date();
    const geracao = new Date(horaGeracao);
    const diffMs = agora - geracao;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMins % 60}min`;
    }
    return `${diffMins}min`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-blue-50 border-blue-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-blue-800">Fila de Senhas</h2>
            <p className="text-blue-600">Gerencie a fila de atendimento</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-800">{senhas.length}</div>
            <div className="text-sm text-blue-600">Aguardando</div>
          </div>
        </div>
      </Card>

      {/* Botão Chamar Próximo */}
      <Card>
        <div className="text-center">
          <Button
            label="Chamar Próxima Senha"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-xl"
            disabled={senhas.length === 0}
            onClick={chamarProximaSenha}
          />
          {senhas.length === 0 && (
            <p className="text-gray-500 mt-2">Nenhuma senha aguardando</p>
          )}
        </div>
      </Card>

      {/* Lista de Senhas */}
      <Card>
        <h3 className="text-xl font-bold text-gray-800 mb-4">Senhas Aguardando</h3>
        {senhas.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Nenhuma senha na fila</p>
          </div>
        ) : (
          <div className="space-y-3">
            {senhas.map((senha, index) => {
              const corInfo = obterCorTipo(senha.tipo);
              const isProxima = index === 0;
              
              return (
                <div
                  key={senha.id}
                  className={`border-2 rounded-lg p-4 transition-all ${
                    isProxima 
                      ? 'border-blue-300 bg-blue-50' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className={`${corInfo.bg} ${corInfo.text} rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg`}>
                        {senha.prefixo}{senha.numero.toString().padStart(3, '0')}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Tag
                            value={corInfo.nome}
                            className={`${corInfo.bg} ${corInfo.text} text-sm`}
                          />
                          {isProxima && (
                            <Tag value="PRÓXIMO" className="bg-blue-500 text-white text-sm" />
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Gerada às {formatarHora(senha.horaGeracao)} • 
                          Aguardando há {formatarTempoEspera(senha.horaGeracao)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-400">
                        #{index + 1}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Estatísticas */}
      <Card className="bg-gray-50">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Estatísticas</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {senhas.filter(s => s.tipo === 'normal').length}
            </div>
            <div className="text-sm text-gray-600">Senhas Normais</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {senhas.filter(s => s.tipo === 'prioridade').length}
            </div>
            <div className="text-sm text-gray-600">Senhas Prioridade</div>
          </div>
        </div>
      </Card>

      {/* Dialog de Confirmação */}
      <Dialog
        header="Chamar Senha"
        visible={showDialog}
        style={{ width: '500px' }}
        onHide={() => setShowDialog(false)}
        className="rounded-xl"
      >
        {senhaAtual && (
          <div className="text-center p-6">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {senhaAtual.prefixo}{senhaAtual.numero.toString().padStart(3, '0')}
            </div>
            <Tag
              value={obterCorTipo(senhaAtual.tipo).nome}
              className={`${obterCorTipo(senhaAtual.tipo).bg} ${obterCorTipo(senhaAtual.tipo).text} text-lg px-4 py-2 mb-4`}
            />
            <div className="text-gray-600 mb-6">
              Gerada às {formatarHora(senhaAtual.horaGeracao)}
            </div>
            <div className="flex gap-3 justify-center">
              <Button
                label="Iniciar Cadastro"
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={iniciarCadastro}
              />
              <Button
                label="Cancelar"
                className="bg-gray-500 hover:bg-gray-600 text-white"
                onClick={cancelarChamada}
              />
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default FilaSenhas; 