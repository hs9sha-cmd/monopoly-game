export const renderSpacePatch = `
  const tokenColors = [
    'from-red-400 to-red-600', 'from-blue-400 to-blue-600', 
    'from-green-400 to-green-600', 'from-amber-400 to-orange-500', 
    'from-purple-400 to-purple-600', 'from-pink-400 to-pink-600', 
    'from-indigo-400 to-indigo-600', 'from-teal-400 to-teal-600',
    'from-orange-400 to-orange-600', 'from-cyan-400 to-cyan-600', 
    'from-lime-400 to-lime-600', 'from-rose-400 to-rose-600'
  ];

  const renderSpace = (index: number) => {
    const teamsHere = teams.filter(t => t.currentPosition === index);
    
    // กำหนดสีพื้นหลังช่องพิเศษ
    let bgClass = "bg-white/90";
    let textClass = "text-gray-500";
    let borderClass = "border-2 border-indigo-100";
    
    if (index === 0) {
      bgClass = "bg-gradient-to-br from-yellow-300 to-amber-500";
      textClass = "text-white font-black drop-shadow-md";
      borderClass = "border-2 border-yellow-200 shadow-[0_0_15px_rgba(251,191,36,0.6)]";
    } else if (index % 5 === 0) {
      bgClass = "bg-gradient-to-br from-blue-50 to-indigo-100";
      borderClass = "border-2 border-indigo-300";
    }

    return (
      <div key={index} className={\`\${bgClass} \${borderClass} p-1 relative flex flex-col items-center justify-between font-bold shadow-sm hover:shadow-md transition-all duration-300 h-full w-full rounded-xl overflow-y-auto scrollbar-hide\`}>
        <span className={\`text-[10px] md:text-xs absolute top-1 left-2 \${textClass}\`}>{index === 0 ? 'START' : index}</span>
        
        <div className="flex flex-wrap gap-1.5 items-center justify-center h-full pt-5 pb-1">
          {teamsHere.map((t, i) => {
            const colorGrad = tokenColors[t.id % tokenColors.length];
            return (
              <div 
                key={t.id} 
                className={\`w-6 h-6 md:w-7 md:h-7 rounded-lg bg-gradient-to-br \${colorGrad} text-white flex items-center justify-center text-[9px] md:text-[11px] shadow-lg border-2 border-white/80 transform transition-transform hover:scale-125 cursor-default\`} 
                title={t.name}
              >
                {t.name.substring(0,2)}
              </div>
            );
          })}
        </div>
      </div>
    );
  };
`;
