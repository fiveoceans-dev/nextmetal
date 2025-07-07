
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

const HeroSection = () => {
  const [text, setText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const fullText = 'DECENTRALIZED AI INFRASTRUCTURE ';

  useEffect(() => {
    if (currentIndex < fullText.length) {
      const timeout = setTimeout(() => {
        setText(fullText.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, fullText]);

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      {/* Enhanced Background with atmospheric effects */}
      <div className="absolute inset-0">
        <div className="cyber-grid opacity-20" />
        <div className="absolute inset-0 bg-gradient-radial from-cyber-blue/10 via-transparent to-cyber-yellow/5" />
        
        {/* Animated scanlines */}
        <div className="absolute inset-0">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-cyber-blue to-transparent animate-scan-line opacity-30" />
          <div className="w-full h-px bg-gradient-to-r from-transparent via-cyber-yellow to-transparent animate-scan-line opacity-20" 
               style={{ animationDelay: '1.5s' }} />
        </div>
      </div>

      {/* Split Screen Layout */}
      <div className="relative z-10 container mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
        
        {/* Left Content (40%) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Title with cyber panel */}
          <div className="cyber-panel p-6 relative">
            <div className="absolute -top-3 left-6 bg-cyber-dark border border-cyber-yellow px-4 py-1"
                 style={{clipPath: 'polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)'}}>
              <span className="text-xs font-mono text-cyber-yellow">PROTOCOL</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-cyber text-cyber-yellow mb-4 glitch-text tracking-widest" data-text="NEXTMETAL">
              NEXTMETAL
            </h1>
            
            {/* Subtitle with typing effect */}
            <div className="text-lg md:text-xl text-cyber-blue mb-6 font-mono h-8">
              <span>{text}</span>
              <span className="animate-pulse"></span>
            </div>
          </div>

          {/* Description */}
          <p className="text-cyber-blue/80 mb-8 leading-relaxed">
            Next-generation decentralized autonomous super-computer for audio and video intelligence.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              className="cyber-border bg-cyber-blue/10 text-cyber-blue hover:bg-cyber-blue hover:text-cyber-black transition-all duration-300 px-8 py-3 font-mono text-lg hover:ring ring-cyber-blue/20"
            >
              NODE.OPERATORS
            </Button>
            <Button 
              variant="outline" 
              className="border-cyber-yellow text-cyber-yellow hover:bg-cyber-yellow hover:text-cyber-black transition-all duration-300 px-8 py-3 font-mono text-lg hover:ring ring-cyber-yellow/20"
            >
              AI.DEVELOPERS
            </Button>
          </div>

        </div>

        {/* Right Animated SVG (60%) */}
        <div className="lg:col-span-3 flex justify-center items-center">
          <div className="relative w-96 h-96">
            {/* Floating particles */}
            <div className="absolute inset-0">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-cyber-blue rounded-full animate-ping"
                  style={{
                    left: `${20 + Math.random() * 60}%`,
                    top: `${20 + Math.random() * 60}%`,
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: `${2 + Math.random() * 2}s`
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
