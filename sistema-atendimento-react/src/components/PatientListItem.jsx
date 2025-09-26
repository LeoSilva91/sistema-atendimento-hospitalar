import React from 'react';

const PatientListItem = React.memo(({ 
  paciente, 
  obterCorDisplay, 
  formatarTempo,
  isNext = false 
}) => {
  const corInfo = obterCorDisplay(paciente.corTriagem);
  const tempoEspera = formatarTempo(paciente.horaCadastro);

  return (
    <div
      className={`border-2 rounded-xl p-4 transition-all animate-fade-in ${
        isNext 
          ? 'border-blue-300 bg-blue-50' 
          : 'border-gray-200 bg-gray-50'
      }`}
    >
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <h4 className="font-bold text-lg text-gray-800">{paciente.nome}</h4>
          {paciente.cpf && (
            <div className="flex items-center gap-1 mb-1">
              <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-gray-600 font-mono text-xs">{paciente.cpf}</p>
            </div>
          )}
          <p className="text-xs text-gray-500">
            Aguardando há {tempoEspera}
          </p>
        </div>
        <div className="text-center">
          <div className={`${corInfo.bg} ${corInfo.text} px-3 py-2 rounded-full text-xs font-bold mb-1`}>
            {corInfo.icon} {corInfo.nome}
          </div>
          {isNext && (
            <div className="text-blue-600 font-bold text-xs">
              🔄 PRÓXIMO
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

PatientListItem.displayName = 'PatientListItem';

export default PatientListItem;
