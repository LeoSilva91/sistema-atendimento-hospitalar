import React, { useState } from 'react';
import { useSistemaAtendimento } from '../utils/HospitalContext';

const Login = () => {
  const { login } = useSistemaAtendimento();
  const [formData, setFormData] = useState({
    usuario: '',
    senha: '',
    tipo: ''
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
      
      const credencial = credenciaisValidas[formData.tipo];
      
      if (credencial && 
          credencial.usuario === formData.usuario && 
          credencial.senha === formData.senha) {
        
        login({
          nome: formData.usuario,
          tipo: formData.tipo,
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
    { value: 'recepcionista', label: 'Recepcionista', icon: '📋', description: 'Cadastro de pacientes' },
    { value: 'medico', label: 'Médico', icon: '🩺', description: 'Atendimento médico' },
    { value: 'admin', label: 'Administrador', icon: '👑', description: 'Acesso completo' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-blue-600 text-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-3xl">🏥</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Sistema Hospitalar</h1>
          <p className="text-gray-600">Faça login para acessar o sistema</p>
        </div>

        {/* Formulário de Login */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Seleção do Tipo de Usuário */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Tipo de Usuário
              </label>
              <div className="grid grid-cols-1 gap-3">
                {tiposUsuario.map((tipo) => (
                  <label
                    key={tipo.value}
                    className={`cursor-pointer border-2 rounded-lg p-4 transition-all ${
                      formData.tipo === tipo.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="tipo"
                      value={tipo.value}
                      checked={formData.tipo === tipo.value}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{tipo.icon}</span>
                      <div>
                        <div className="font-medium text-gray-800">{tipo.label}</div>
                        <div className="text-sm text-gray-500">{tipo.description}</div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Usuário */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome de Usuário
              </label>
              <input
                type="text"
                name="usuario"
                value={formData.usuario}
                onChange={handleInputChange}
                placeholder="Digite seu usuário"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Senha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="senha"
                  value={formData.senha}
                  onChange={handleInputChange}
                  placeholder="Digite sua senha"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Botão de Login */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Entrando...
                </div>
              ) : (
                'Entrar no Sistema'
              )}
            </button>
          </form>

          {/* Credenciais de Demonstração */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Credenciais de Demonstração:</h3>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="bg-gray-50 p-3 rounded">
                <strong>Recepcionista:</strong> recepcionista / 123456
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <strong>Médico:</strong> medico / 123456
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <strong>Admin:</strong> admin / 123456
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          Sistema de Atendimento Hospitalar v2.0
        </div>
      </div>
    </div>
  );
};

export default Login;