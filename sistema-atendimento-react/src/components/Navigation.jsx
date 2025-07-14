import React, { useRef, useMemo, useCallback } from "react";
import { useSistemaAtendimento } from "../context/HospitalContext";
import { Button } from "primereact/button";
import { TabMenu } from "primereact/tabmenu";
import { Avatar } from "primereact/avatar";
import { PrimeIcons } from "primereact/api";
import { Menu } from "primereact/menu";

const Navigation = () => {
  const { currentUser, telaAtiva, trocarTela, logout, verificarAcesso } = useSistemaAtendimento();
  const menuUser = useRef(null);

  // Mapeamento de ícones e nomes das telas
  const telaConfig = useMemo(() => ({
    cadastro: { icon: PrimeIcons.PLUS, nome: "Cadastro" },
    triagem: { icon: PrimeIcons.EXCLAMATION_TRIANGLE, nome: "Triagem" },
    medico: { icon: PrimeIcons.USER, nome: "Painel Médico" },
    historico: { icon: PrimeIcons.CALENDAR, nome: "Histórico Médico" },
    publico: { icon: PrimeIcons.HOME, nome: "Painel Público" },
    fichas: { icon: PrimeIcons.TICKET, nome: "Emissão de Fichas" }
  }), []);

  // Obter configuração da tela
  const obterConfigTela = useCallback((tela) => {
    return telaConfig[tela] || { icon: PrimeIcons.FILE, nome: tela };
  }, [telaConfig]);

  // Obter telas disponíveis baseado no acesso do usuário
  const telasDisponiveis = useMemo(() => {
    if (!currentUser) return [];
    const todasTelas = ["cadastro", "triagem", "medico", "historico", "fichas", "publico"];
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
        template: (item, options) => (
          <div
            {...options}
            className={`flex items-center gap-1 px-2 py-1 mx-2 cursor-pointer transition-colors duration-150 rounded-none select-none 
              ${isActive ? 'text-blue-600 font-medium' : 'text-gray-800'} 
              hover:text-blue-500`}
            style={{ background: 'none', boxShadow: 'none', border: 'none' }}
          >
            <span className={`${config.icon} ${isActive ? 'text-blue-600' : 'text-gray-500'} text-base`} />
            <span>{config.nome}</span>
          </div>
        )
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

export default Navigation;