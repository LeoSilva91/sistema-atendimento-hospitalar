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
      <div className="min-h-screen flex flex-col md:flex-row">
        {/* Lado esquerdo: logo SIAH com fundo azul suave */}
        <div className="hidden md:flex w-full md:w-1/2 bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 items-center justify-center">
          <img src="/logo-sia.png" alt="Logo SIAH" className="object-cover w-full h-full" />
        </div>
        {/* Lado direito: formulário com fundo branco e sombra sutil */}
        <div className="flex w-full md:w-1/2 min-h-screen items-center justify-center bg-white shadow-xl border-l border-blue-200">
          <div className="w-full max-w-md p-8">
            {/* Título */}
            <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">SIAH</h1>
            <p className="text-center text-gray-500 mb-8">Sistema Inteligente de Atendimento Hospitalar</p>
            {/* Formulário */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-6" autoComplete="off">
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
                    inputClassName="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder=" "
                    autoComplete="new-password"
                    pt={{
                      root: { className: 'w-full' },
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
              <div className="mt-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 border-0 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 transition-colors text-base"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <ProgressSpinner style={{ width: '20px', height: '20px' }} strokeWidth="4" className="mr-3" />
                      Entrando...
                    </div>
                  ) : (
                    <>
                      <i className="pi pi-sign-in mr-2"></i>
                      Login
                    </>
                  )}
                </Button>
              </div>
              {/* Esqueceu a senha */}
              <div className="text-right mt-2">
                <a href="#" className="text-blue-600 hover:underline text-sm">Esqueceu a senha?</a>
              </div>
            </form>
            {/* Footer */}
            <div className="text-center mt-8 text-sm text-gray-500">
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
