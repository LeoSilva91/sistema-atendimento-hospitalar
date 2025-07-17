import React, { useEffect } from "react";

/**
 * Componente React para integrar o widget VLibras de acessibilidade.
 * Este componente carrega dinamicamente o script do VLibras e inicializa o widget.
 * 
 * Props:
 * - forceOnload (boolean): força o carregamento imediato do widget (opcional).
 */
const VLibrasWidget = ({ forceOnload = true }) => {
  useEffect(() => {
    // Verifica se o script já foi adicionado para evitar múltiplas inclusões
    if (document.getElementById("vlibras-plugin-script")) return;

    // Cria o elemento <script> para carregar o VLibras
    const script = document.createElement("script");
    script.id = "vlibras-plugin-script";
    script.src = "https://vlibras.gov.br/app/vlibras-plugin.js";
    script.async = true;

    // Adiciona o script ao <body>
    document.body.appendChild(script);

    // Inicializa o widget após o script ser carregado
    script.onload = () => {
      if (window.VLibras) {
        // eslint-disable-next-line no-undef
        new window.VLibras.Widget("https://vlibras.gov.br/app", { forceOnload });
      }
    };

    // Limpeza: remove o script ao desmontar o componente
    return () => {
      script.remove();
      // Remove o widget do DOM, se necessário
      const widget = document.querySelector(".vlibras");
      if (widget) widget.remove();
    };
  }, [forceOnload]);

  // O componente não renderiza nada visível diretamente
  return null;
};

export default VLibrasWidget; 