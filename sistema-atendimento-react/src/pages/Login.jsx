import React, { useState } from 'react';
import { useSistemaAtendimento } from '../context/HospitalContext';
import { PrimeReactProvider } from 'primereact/api';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { FloatLabel } from 'primereact/floatlabel';
import 'primeicons/primeicons.css';

const Login = () => {
  const { login } = useSistemaAtendimento();
  const [formData, setFormData] = useState({
    usuario: '',
    senha: '',
    tipo: null
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  const handleTipoChange = (e) => {
    setFormData(prev => ({ ...prev, tipo: e.value }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.usuario || !formData.senha || !formData.tipo) {
      alert('Por favor, preencha todos os campos');
      return;
    }
    setIsLoading(true);
    try {
      const credenciaisValidas = {
        'recepcionista': { usuario: 'recepcionista', senha: '123456' },
        'enfermeiro': { usuario: 'enfermeiro', senha: '123456' },
        'medico': { usuario: 'medico', senha: '123456' },
        'admin': { usuario: 'admin', senha: '123456' }
      };
      // Corrigir para aceitar tanto objeto quanto string
      const tipoValue = formData.tipo.value ? formData.tipo.value : formData.tipo;
      const credencial = credenciaisValidas[tipoValue];
      if (
        credencial &&
        credencial.usuario === formData.usuario &&
        credencial.senha === formData.senha
      ) {
        login({
          nome: formData.usuario,
          tipo: tipoValue,
          consultorio: tipoValue === 'medico' ? 'Consultório 1' : undefined,
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
    { value: 'recepcionista', label: 'Recepcionista' },
    { value: 'enfermeiro', label: 'Enfermeiro' },
    { value: 'medico', label: 'Médico' },
    { value: 'admin', label: 'Administrador' }
  ];
  // Não usar mais itemTemplate nem selectedItemTemplate para o Dropdown

  return (
    <PrimeReactProvider>
      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* Lado esquerdo: logo SIAH com fundo azul suave */}
        <div className="hidden lg:flex w-full lg:w-1/2 bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 items-center justify-center">
          <img src="/logo-sia.png" alt="Logo SIAH" className="object-cover w-full h-full" />
        </div>
        {/* Lado direito: formulário com fundo branco e sombra sutil */}
        <div className="flex w-full lg:w-1/2 min-h-screen items-center justify-center bg-white shadow-xl lg:border-l border-blue-200">
          <div className="w-full max-w-md p-4 sm:p-8">
            {/* Logo mobile */}
            <div className="lg:hidden flex justify-center mb-6">
              <img src="/logo-sia.png" alt="Logo SIAH" className="h-16 w-auto" />
            </div>
            
            {/* Título */}
            <h1 className="text-xl sm:text-2xl font-bold text-center text-gray-800 mb-2">SIAH</h1>
            <p className="text-center text-gray-500 mb-6 sm:mb-8 text-sm sm:text-base">Sistema Inteligente de Atendimento Hospitalar</p>
            
            {/* Formulário */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-6" autoComplete="off">
              {/* Tipo de usuário */}
              <div>
                <FloatLabel>
                  <Dropdown
                    id="tipo"
                    value={formData.tipo}
                    onChange={handleTipoChange}
                    options={tiposUsuario}
                    optionLabel="label"
                    placeholder="Selecione o tipo de usuário"
                    className="w-full"
                    pt={{
                      root: { className: 'w-full' },
                      input: { className: 'w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base' },
                      trigger: { className: 'absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400' }
                    }}
                    required
                  />
                  <label htmlFor="tipo" className="flex items-center text-sm sm:text-base">
                    <i className="pi pi-users mr-2"></i>
                    Tipo de Usuário
                  </label>
                </FloatLabel>
              </div>
              
              {/* Usuário */}
              <div>
                <FloatLabel>
                  <InputText
                    id="usuario"
                    name="usuario"
                    value={formData.usuario}
                    onChange={handleInputChange}
                    className="w-full"
                    placeholder=" "
                    autoComplete="username"
                    pt={{
                      root: { className: 'w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base' }
                    }}
                    required
                  />
                  <label htmlFor="usuario" className="flex items-center text-sm sm:text-base">
                    <i className="pi pi-user mr-2"></i>
                    Nome de Usuário
                  </label>
                </FloatLabel>
              </div>
              
              {/* Senha */}
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
                    inputClassName="w-full px-3 sm:px-4 py-2 sm:py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    placeholder=" "
                    autoComplete="new-password"
                    pt={{
                      root: { className: 'w-full' },
                      toggleButton: { className: 'absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600' }
                    }}
                    required
                  />
                  <label htmlFor="senha" className="flex items-center text-sm sm:text-base">
                    <i className="pi pi-lock mr-2"></i>
                    Senha
                  </label>
                </FloatLabel>
              </div>
              
              {/* Botão de Login */}
              <div className="mt-2 sm:mt-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 border-0 text-white py-2 sm:py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 transition-colors text-sm sm:text-base"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <ProgressSpinner style={{ width: '16px', height: '16px' }} strokeWidth="4" className="mr-2 sm:mr-3" />
                      <span className="text-sm sm:text-base">Entrando...</span>
                    </div>
                  ) : (
                    <>
                      <i className="pi pi-sign-in mr-2"></i>
                      <span className="text-sm sm:text-base">Login</span>
                    </>
                  )}
                </Button>
              </div>
              
              {/* Esqueceu a senha */}
              <div className="text-right mt-2">
                <a href="#" className="text-blue-600 hover:underline text-xs sm:text-sm">Esqueceu a senha?</a>
              </div>
            </form>
            
            {/* Informações de credenciais para desenvolvimento */}
            <div className="mt-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-xs font-semibold text-gray-700 mb-2">Credenciais de Teste:</h3>
              <div className="text-xs text-gray-600 space-y-1">
                <div><strong>Recepcionista:</strong> recepcionista / 123456</div>
                <div><strong>Enfermeiro:</strong> enfermeiro / 123456</div>
                <div><strong>Médico:</strong> medico / 123456</div>
                <div><strong>Admin:</strong> admin / 123456</div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="text-center mt-6 sm:mt-8 text-xs sm:text-sm text-gray-500">
              <i className="pi pi-heart mr-1 text-red-500"></i>
              SIAH - Sistema Inteligente de Atendimento Hospitalar v2.0
            </div>
          </div>
        </div>
      </div>
    </PrimeReactProvider>
  );
};

export default Login;
