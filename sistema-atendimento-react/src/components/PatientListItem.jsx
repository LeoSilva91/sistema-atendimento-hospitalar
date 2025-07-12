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
          <p className="text-gray-600">ID: {paciente.id}</p>
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
