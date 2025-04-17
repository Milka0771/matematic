'use client';
import React, { useEffect, useState } from 'react';

interface MathDisplayProps {
  formula: string;
}

const MathDisplay: React.FC<MathDisplayProps> = ({ formula }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.id = 'MathJax-script';
    script.async = true;
    script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
    
    script.onload = () => {
      (window as any).MathJax = {
        tex: {
          inlineMath: [['$', '$'], ['\\(', '\\)']],
          displayMath: [['$$', '$$'], ['\\[', '\\]']],
          processEscapes: true,
        },
        options: {
          skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre'],
        },
        startup: {
          ready: () => {
            (window as any).MathJax.startup.defaultReady();
            setIsLoaded(true);
          }
        }
      };
    };

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      {isLoaded ? (
        <div className="text-2xl text-center">$$ {formula} $$</div>
      ) : (
        <div className="text-center">Loading math rendering...</div>
      )}
    </div>
  );
};

export default MathDisplay;