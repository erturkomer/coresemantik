import React from "react";

const CustomCodeEditor = ({ value, onChange, disabled, readonlyComments = [] }) => {
  const lines = value.split('\n');

  return (
    <div className="w-full h-full bg-[#1e1e2e] flex">
      {/* Sol taraf - Kod editörü */}
      <div className="flex-1">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full h-full bg-[#1e1e2e] text-[#e0e0f0] font-mono p-4 
                   focus:outline-none focus:ring-2 focus:ring-cyan-500 
                   resize-none leading-7"
          spellCheck="false"
          placeholder={disabled ? "Talimatları okuyun..." : "Kodunuzu buraya yazın..."}
        />
      </div>

      {/* Sağ taraf - AI Yorumları */}
      <div className="w-96 border-l border-gray-700 bg-[#1e1e2e] overflow-y-auto">
        {lines.map((_, index) => {
          const comment = readonlyComments.find(c => c.line === index);
          return (
            <div
              key={index}
              className="min-h-[28px] px-4 py-[3px] font-mono text-sm leading-7 text-[#6A9955]"
            >
              {comment ? `// ${comment.text}` : ''}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CustomCodeEditor;