import React, { useState } from 'react';
import { useSistemaAtendimento } from '../utils/HospitalContext';
import { PrimeReactProvider } from 'primereact/api';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import { FloatLabel } from 'primereact/floatlabel';

// Importar estilos do PrimeIcons
import 'primeicons/primeicons.css';

const Login = () => {
  const { login } = useSistemaAtendimento();
  const [formData, setFormData] = useState({
    usuario: '',
    senha: '',
    tipo: null
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTipoChange = (e) => {
    setFormData(prev => ({
      ...prev,
      tipo: e.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.usuario || !formData.senha || !formData.tipo) {
      alert('Por favor, preencha todos os campos');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simular validação de credenciais (em um app real seria uma API)
      const credenciaisValidas = {
        'recepcionista': { usuario: 'recepcionista', senha: '123456' },
        'medico': { usuario: 'medico', senha: '123456' },
        'admin': { usuario: 'admin', senha: '123456' }
      };
      
      const credencial = credenciaisValidas[formData.tipo.value];
      
      if (credencial && 
          credencial.usuario === formData.usuario && 
          credencial.senha === formData.senha) {
        
        login({
          nome: formData.usuario,
          tipo: formData.tipo.value,
          timestamp: new Date().toISOString()
        });
      } else {
        alert('Credenciais inválidas');
      }
    } catch (error) {
      alert('Erro ao fazer login: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const tiposUsuario = [
    { value: 'recepcionista', label: 'Recepcionista', icon: 'pi pi-id-card', description: 'Cadastro de pacientes' },
    { value: 'medico', label: 'Médico', icon: 'pi pi-user-md', description: 'Atendimento médico' },
    { value: 'admin', label: 'Administrador', icon: 'pi pi-shield', description: 'Acesso completo' }
  ];

  const itemTemplate = (option) => (
    <div className="flex items-center space-x-3">
      <i className={`${option.icon} text-xl text-blue-600`}></i>
      <div>
        <div className="font-medium text-gray-800">{option.label}</div>
        <div className="text-sm text-gray-500">{option.description}</div>
      </div>
    </div>
  );

  const selectedItemTemplate = (option) => (
    <div className="flex items-center space-x-3">
      <i className={`${option.icon} text-xl text-blue-600`}></i>
      <span className="font-medium">{option.label}</span>
    </div>
  );

  return (
    <PrimeReactProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-blue-600 text-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <i className="pi pi-building text-3xl"></i>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Sistema Hospitalar</h1>
            <p className="text-gray-600">Faça login para acessar o sistema</p>
          </div>

          {/* Formulário de Login */}
          <Card className="shadow-xl border-0">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Seleção do Tipo de Usuário com Dropdown */}
              <div>
                <FloatLabel>
                  <Dropdown
                    id="tipo"
                    value={formData.tipo}
                    onChange={handleTipoChange}
                    options={tiposUsuario}
                    optionLabel="label"
                    placeholder="Selecione o tipo de usuário"
                    itemTemplate={itemTemplate}
                    selectedItemTemplate={selectedItemTemplate}
                    className="w-full"
                    pt={{
                      root: { className: 'w-full' },
                      input: { className: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent' },
                      trigger: { className: 'absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400' }
                    }}
                    required
                  />
                  <label htmlFor="tipo" className="flex items-center">
                    <i className="pi pi-users mr-2"></i>
                    Tipo de Usuário
                  </label>
                </FloatLabel>
              </div>

              {/* Usuário com FloatLabel */}
              <div>
                <FloatLabel>
                  <InputText
                    id="usuario"
                    name="usuario"
                    value={formData.usuario}
                    onChange={handleInputChange}
                    className="w-full"
                    pt={{
                      root: { className: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent' }
                    }}
                    required
                  />
                  <label htmlFor="usuario" className="flex items-center">
                    <i className="pi pi-user mr-2"></i>
                    Nome de Usuário
                  </label>
                </FloatLabel>
              </div>

              {/* Senha com FloatLabel */}
              <div>
                <FloatLabel>
                  <Password
                    id="senha"
                    name="senha"
                    value={formData.senha}
                    onChange={handleInputChange}
                    toggleMask
                    feedback={false}
                    className="w-full"
                    pt={{
                      root: { className: 'w-full' },
                      input: { className: 'w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent' },
                      toggleButton: { className: 'absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600' }
                    }}
                    required
                  />
                  <label htmlFor="senha" className="flex items-center">
                    <i className="pi pi-lock mr-2"></i>
                    Senha
                  </label>
                </FloatLabel>
              </div>

              {/* Botão de Login */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
                pt={{
                  root: { className: 'w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 transition-colors' }
                }}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <ProgressSpinner 
                      style={{ width: '20px', height: '20px' }} 
                      strokeWidth="4"
                      className="mr-3"
                    />
                    Entrando...
                  </div>
                ) : (
                  <>
                    <i className="pi pi-sign-in mr-2"></i>
                    Entrar no Sistema
                  </>
                )}
              </Button>
            </form>

            <Divider />


          </Card>

          {/* Footer */}
          <div className="text-center mt-8 text-sm text-gray-500">
            <i className="pi pi-heart mr-1 text-red-500"></i>
            Sistema de Atendimento Hospitalar v2.0
          </div>
        </div>
      </div>
    </PrimeReactProvider>
  );
};

export default Login;