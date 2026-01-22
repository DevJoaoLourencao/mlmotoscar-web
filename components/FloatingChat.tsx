import React from 'react';

export default function FloatingChat() {
  const handleClick = () => {
    window.open('https://wa.me/5514991569560', '_blank');
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 p-4 text-white rounded-full shadow-2xl shadow-green-900/40 hover:scale-110 transition-all duration-300 animate-fade-in-up group flex items-center justify-center hover:opacity-90"
      style={{ backgroundColor: 'var(--whatsapp)' }}
      aria-label="Fale conosco no WhatsApp"
    >
      <img 
        src="/zap-logo.png" 
        alt="WhatsApp" 
        className="h-7 w-7 flex-shrink-0 object-contain"
      />
      <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out whitespace-nowrap font-bold text-sm opacity-0 group-hover:opacity-100 group-hover:ml-2">
        Fale Conosco
      </span>
    </button>
  );
}
