import React, { useRef, useMemo, useCallback, useState, useEffect } from "react";
import { useSistemaAtendimento } from "../context/HospitalContext";
import { Button } from "primereact/button";
import { TabMenu } from "primereact/tabmenu";
import { Avatar } from "primereact/avatar";
import { PrimeIcons } from "primereact/api";
import { Menu } from "primereact/menu";
import { Dialog } from "primereact/dialog";

const Navigation = () => {
  const { currentUser, telaAtiva, trocarTela, logout, verificarAcesso } = useSistemaAtendimento();
  const menuUser = useRef(null);
  const [showCadastroFuncionario, setShowCadastroFuncionario] = useState(false);
  const [openSignal, setOpenSignal] = useState(0);

  // Mapeamento de ícones e nomes das telas
  const telaConfig = useMemo(() => ({
    cadastro: { icon: PrimeIcons.PLUS, nome: "Cadastro" },
    triagem: { icon: PrimeIcons.EXCLAMATION_TRIANGLE, nome: "Triagem" },
    medico: { icon: PrimeIcons.USER, nome: "Painel Médico" },
    historico: { icon: PrimeIcons.CALENDAR, nome: "Histórico Médico" },
    publico: { icon: PrimeIcons.HOME, nome: "Painel Público" },
    fichas: { icon: PrimeIcons.TICKET, nome: "Emissão de Fichas" },
    senhas: { icon: PrimeIcons.TICKET, nome: "Gerador de Senhas" }
  }), []);

  // Obter configuração da tela
  const obterConfigTela = useCallback((tela) => {
    return telaConfig[tela] || { icon: PrimeIcons.FILE, nome: tela };
  }, [telaConfig]);

  // Obter telas disponíveis baseado no acesso do usuário
  const telasDisponiveis = useMemo(() => {
    if (!currentUser) return [];
    const todasTelas = ["cadastro", "triagem", "medico", "historico", "fichas", "publico", "senhas"];
    return todasTelas.filter(tela => verificarAcesso(tela));
  }, [currentUser, verificarAcesso]);

  // Handlers de eventos
  const handleTelaClick = useCallback((tela) => {
    trocarTela(tela);
  }, [trocarTela]);

  // Menu do usuário
  const userMenuItems = [
    {
      label: "Meu Perfil",
      icon: PrimeIcons.USER,
      command: () => alert('Abrir perfil')
    },
    // Adiciona o item apenas se for admin
    ...(currentUser?.tipo === 'admin' ? [{
      label: "Cadastrar Funcionário",
      icon: PrimeIcons.USER_PLUS,
      command: () => {
        setShowCadastroFuncionario(true);
        setOpenSignal(s => s + 1);
      }
    }] : []),
    {
      label: "Configurações",
      icon: PrimeIcons.COG,
      command: () => alert('Abrir configurações')
    },
    {
      label: "Ajuda",
      icon: PrimeIcons.QUESTION,
      command: () => alert('Abrir ajuda')
    },
    { separator: true },
    {
      label: "Alterar Senha",
      icon: PrimeIcons.KEY,
      command: () => alert('Alterar senha')
    },
    { separator: true },
    {
      label: "Sair",
      icon: PrimeIcons.SIGN_OUT,
      command: logout,
      className: "text-red-600 font-semibold"
    }
  ];

  // Configuração dos itens do TabMenu
  const tabMenuItems = useMemo(() => {
    return telasDisponiveis.map(tela => {
      const config = obterConfigTela(tela);
      const isActive = telaAtiva === tela;
      return {
        label: config.nome,
        icon: config.icon,
        command: () => handleTelaClick(tela),
        className: '',
        template: (item, options) => {
          // Filtrar apenas propriedades válidas para elementos DOM
          const { labelClassName, iconClassName, active, ...validProps } = options;
          return (
            <div
              {...validProps}
              className={`flex items-center gap-1 px-2 py-1 mx-2 cursor-pointer transition-colors duration-150 rounded-none select-none 
                ${isActive ? 'text-blue-600 font-medium' : 'text-gray-800'} 
                hover:text-blue-500`}
              style={{ background: 'none', boxShadow: 'none', border: 'none' }}
            >
            <span className={`${config.icon} ${isActive ? 'text-blue-600' : 'text-gray-500'} text-base`} />
            <span>{config.nome}</span>
          </div>
          );
        }
      };
    });
  }, [telasDisponiveis, obterConfigTela, handleTelaClick, telaAtiva]);

  // Componente do perfil do usuário com menu dropdown minimalista e acessível
  const UserProfile = () => (
    <>
      <Button
        text
        onClick={(e) => menuUser.current.toggle(e)}
        className="flex items-center gap-2 !bg-transparent text-gray-700 hover:bg-blue-50 focus:bg-blue-100 focus:ring-2 focus:ring-blue-200 border border-blue-100 transition-colors duration-150 px-2 py-1 rounded-lg outline-none"
        aria-controls="user_menu"
        aria-haspopup="menu"
        aria-expanded="false"
        aria-label="Abrir menu do usuário"
        tabIndex={0}
      >
        <span className="pi pi-user text-blue-600 text-xl" />
        <span className="font-medium text-gray-800 text-sm">{currentUser.nome}</span>
      </Button>
      <Menu 
        model={userMenuItems} 
        popup 
        ref={menuUser} 
        className="mt-2 border-none shadow-md rounded-xl bg-white min-w-[140px] right-0"
        pt={{
          menu: { className: 'bg-white p-1 rounded-xl' },
          menuitem: { className: 'rounded-lg transition-colors duration-150' },
          action: ({ context }) =>
            context.item.label === 'Sair'
              ? 'flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 font-normal'
              : 'flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 font-normal',
          icon: { className: 'text-base mr-2' },
          label: { className: 'text-sm' }
        }}
        popupAlignment="right"
      />
      {/* Modal de Cadastro de Funcionário */}
      <Dialog 
        header="Cadastrar Funcionário" 
        visible={showCadastroFuncionario} 
        style={{ width: '40vw', maxWidth: 500 }} 
        onHide={() => setShowCadastroFuncionario(false)}
        className="rounded-xl"
      >
        <CadastroFuncionarioForm onClose={() => setShowCadastroFuncionario(false)} openSignal={openSignal} />
      </Dialog>
    </>
  );

  // Se não há usuário logado, não renderiza nada
  if (!currentUser) return null;

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200" role="navigation" aria-label="Navegação principal">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center h-16">
            <img src="/logo-menu.png" alt="Logo SIAH" className="h-16 w-auto mr-1" />
          </div>

          {/* TabMenu de navegação */}
          <div className="flex flex-1 justify-center">
            <TabMenu 
              model={tabMenuItems}
              className="border-none bg-transparent"
              pt={{
                root: { className: "bg-transparent border-none" },
                nav: { className: "bg-transparent border-none" },
                inkbar: { className: "bg-blue-500" },
                item: { className: "px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200" },
                itemAction: { className: "focus:ring-2 focus:ring-blue-300 rounded-lg" },
                itemIcon: { className: "mr-2" },
                itemLabel: { className: "font-medium" }
              }}
            />
          </div>

          {/* Perfil e menu do usuário */}
          <div className="flex items-center gap-3 ml-8 md:ml-12">
            <UserProfile />
          </div>
        </div>
      </div>
    </nav>
  );
};

// Formulário de cadastro de funcionário
const CadastroFuncionarioForm = ({ onClose, openSignal }) => {
  const [form, setForm] = useState({
    nome: '',
    email: '',
    cpf: '',
    telefone: '',
    cargo: '',
    senha: '',
    confirmacaoSenha: ''
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const cargos = [
    { label: 'Administrador', value: 'admin' },
    { label: 'Médico', value: 'medico' },
    { label: 'Recepcionista', value: 'recepcionista' }
  ];

  const validate = () => {
    const newErrors = {};
    if (!form.nome.trim()) newErrors.nome = 'Nome é obrigatório';
    if (!form.email.trim()) newErrors.email = 'E-mail é obrigatório';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) newErrors.email = 'E-mail inválido';
    if (!form.cpf.trim()) newErrors.cpf = 'CPF é obrigatório';
    else if (!/^\d{11}$/.test(form.cpf.replace(/\D/g, ''))) newErrors.cpf = 'CPF deve ter 11 dígitos';
    if (!form.telefone.trim()) newErrors.telefone = 'Telefone é obrigatório';
    if (!form.cargo) newErrors.cargo = 'Cargo é obrigatório';
    if (!form.senha) newErrors.senha = 'Senha é obrigatória';
    else if (form.senha.length < 6) newErrors.senha = 'Senha deve ter pelo menos 6 caracteres';
    if (form.senha !== form.confirmacaoSenha) newErrors.confirmacaoSenha = 'As senhas não coincidem';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleCargoChange = (e) => {
    setForm((prev) => ({ ...prev, cargo: e.value }));
    setErrors((prev) => ({ ...prev, cargo: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setForm({
        nome: '',
        email: '',
        cpf: '',
        telefone: '',
        cargo: '',
        senha: '',
        confirmacaoSenha: ''
      });
      onClose();
      // Aqui você pode integrar com backend ou contexto
      // Exemplo: showToast('Funcionário cadastrado com sucesso!')
    }, 1000);
  };

  // Limpar formulário e erros sempre que o modal abrir
  useEffect(() => {
    setForm({
      nome: '',
      email: '',
      cpf: '',
      telefone: '',
      cargo: '',
      senha: '',
      confirmacaoSenha: ''
    });
    setErrors({});
  }, [openSignal]);

  return (
    <form className="space-y-4" onSubmit={handleSubmit} autoComplete="off">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
        <input
          type="text"
          name="nome"
          value={form.nome}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.nome ? 'border-red-400' : 'border-gray-300'}`}
          placeholder="Digite o nome completo"
        />
        {errors.nome && <small className="text-red-500">{errors.nome}</small>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">E-mail *</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          autoComplete="off"
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-400' : 'border-gray-300'}`}
          placeholder="email@exemplo.com"
        />
        {errors.email && <small className="text-red-500">{errors.email}</small>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">CPF *</label>
        <input
          type="text"
          name="cpf"
          value={form.cpf}
          onChange={handleChange}
          maxLength={14}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.cpf ? 'border-red-400' : 'border-gray-300'}`}
          placeholder="Somente números"
        />
        {errors.cpf && <small className="text-red-500">{errors.cpf}</small>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
        <input
          type="text"
          name="telefone"
          value={form.telefone}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.telefone ? 'border-red-400' : 'border-gray-300'}`}
          placeholder="(00) 00000-0000"
        />
        {errors.telefone && <small className="text-red-500">{errors.telefone}</small>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Cargo *</label>
        <select
          name="cargo"
          value={form.cargo}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.cargo ? 'border-red-400' : 'border-gray-300'}`}
        >
          <option value="">Selecione o cargo</option>
          {cargos.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        {errors.cargo && <small className="text-red-500">{errors.cargo}</small>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Senha *</label>
        <input
          type="password"
          name="senha"
          value={form.senha}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.senha ? 'border-red-400' : 'border-gray-300'}`}
          placeholder="Digite a senha"
        />
        {errors.senha && <small className="text-red-500">{errors.senha}</small>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Confirmação de Senha *</label>
        <input
          type="password"
          name="confirmacaoSenha"
          value={form.confirmacaoSenha}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.confirmacaoSenha ? 'border-red-400' : 'border-gray-300'}`}
          placeholder="Confirme a senha"
        />
        {errors.confirmacaoSenha && <small className="text-red-500">{errors.confirmacaoSenha}</small>}
      </div>
      <div className="flex justify-end pt-2 gap-2">
        <button
          type="button"
          className="px-4 py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-700 hover:bg-red-100 hover:text-red-600"
          onClick={onClose}
          disabled={submitting}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 disabled:bg-blue-300"
          disabled={submitting}
        >
          {submitting ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </div>
    </form>
  );
};

export default Navigation;