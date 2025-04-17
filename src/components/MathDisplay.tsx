'use client';
import React, { useEffect } from 'react';

interface MathDisplayProps {
  formula: string;
}

const MathDisplay: React.FC<MathDisplayProps> = ({ formula }) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.id = 'MathJax-script';
    script.async = true;
    script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <div>
      $$ {formula} $$
    </div>
  );
};

export default MathDisplay;