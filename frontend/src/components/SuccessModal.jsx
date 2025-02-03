import React, { useEffect, useState } from 'react';
import { Star, Trophy, ChevronRight, PartyPopper } from 'lucide-react';

const SuccessModal = ({ isOpen, onClose, onNextQuestion }) => {
  const [showTrophy, setShowTrophy] = useState(false);
  const [showText, setShowText] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [showStars, setShowStars] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Sıralı animasyonlar için zamanlama
      setShowTrophy(false);
      setShowText(false);
      setShowButton(false);
      setShowStars(false);

      setTimeout(() => setShowTrophy(true), 300);
      setTimeout(() => setShowText(true), 800);
      setTimeout(() => setShowStars(true), 1200);
      setTimeout(() => setShowButton(true), 1600);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div
        className={`bg-gradient-to-b from-[#1e1e2e] to-[#2a2a3c] rounded-2xl p-8 w-full max-w-lg
                   shadow-2xl transform transition-all duration-500
                   ${isOpen ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}
      >
        {/* Yıldız Animasyonları */}
        {showStars && (
          <>
            <div className="absolute -top-4 -left-4 animate-bounce delay-100">
              <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
            </div>
            <div className="absolute -top-4 -right-4 animate-bounce delay-300">
              <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
            </div>
            <div className="absolute -bottom-4 -left-4 animate-bounce delay-500">
              <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
            </div>
            <div className="absolute -bottom-4 -right-4 animate-bounce delay-700">
              <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
            </div>
          </>
        )}

        <div className="text-center space-y-6">
          {/* Trophy Animasyonu */}
          <div className={`transform transition-all duration-700 ${
            showTrophy ? 'scale-100 translate-y-0' : 'scale-0 translate-y-10'
          }`}>
            <div className="mx-auto w-24 h-24 bg-gradient-to-r from-yellow-400 to-yellow-600 
                          rounded-full flex items-center justify-center mb-4">
              <Trophy className="w-12 h-12 text-white" />
            </div>
          </div>

          {/* Tebrik Metni */}
          <div className={`space-y-2 transition-all duration-700 ${
            showText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <h2 className="text-2xl font-bold text-white mb-2">
              Harika İş! 🎉
            </h2>
            <p className="text-gray-300">
              Bu görevi başarıyla tamamladın! Kendini kutlamayı unutma! 🌟
            </p>
          </div>

          {/* Buton Animasyonu */}
          <div className={`pt-4 transition-all duration-500 ${
            showButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <button
              onClick={onNextQuestion}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white 
                       px-6 py-3 rounded-lg font-medium hover:from-cyan-600 
                       hover:to-blue-600 transform hover:scale-105 transition-all
                       duration-200 flex items-center justify-center space-x-2 w-full"
            >
              <span>Sonraki Soru</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Parti Efekti */}
        <div className="absolute top-4 right-4 animate-bounce">
          <PartyPopper className="w-6 h-6 text-yellow-400" />
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;