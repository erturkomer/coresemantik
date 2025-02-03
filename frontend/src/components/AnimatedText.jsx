import React, { useState, useEffect } from "react";

const AnimatedText = ({ text = "", speed = 10, onComplete }) => {
  const [displayText, setDisplayText] = useState('');
  
  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      setDisplayText(text.slice(0, index + 1));
      index++;
      
      if (index === text.length) {
        clearInterval(timer);
        onComplete?.(); // Animasyon bittiğinde onComplete'i çağır
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed, onComplete]);

  return <span>{displayText}</span>;
};

export default AnimatedText;