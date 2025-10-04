import { Play, Smartphone, Leaf } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background with overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=2000&q=80"
          alt="Bag com pães diversos"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/30"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container text-center text-white">
        <div className="max-w-5xl mx-auto">
          {/* Pre-title */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <Leaf className="w-5 h-5 text-[var(--highlight-green)]" />
            <span className="text-sm font-medium">Combatendo o desperdício alimentar</span>
          </div>

          {/* Main title */}
          <h1 className="text-hero mb-6 leading-tight">
            Salve alimentos em{' '}
            <span className="text-[var(--highlight-green)] relative">
              Iguaba Grande
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-[var(--highlight-green)]/30 rounded-full"></div>
            </span>
          </h1>
          
          <p className="text-xl lg:text-2xl text-gray-200 mb-12 max-w-3xl mx-auto leading-relaxed">
            Bags surpresa com alimentos frescos por até <span className="text-[var(--highlight-green)] font-bold">70% de desconto</span>. 
            <span className="text-[var(--highlight-green)] font-semibold">Economize e combata o desperdício!</span>
          </p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button className="flex items-center gap-3 px-8 py-4 bg-[var(--highlight-green)] text-[var(--primary-dark)] rounded-full hover:bg-[var(--primary-teal)] hover:text-white transition-all duration-300 font-bold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1">
              <Smartphone className="w-5 h-5" />
              <span>Baixar o app</span>
            </button>
            
            <button className="flex items-center gap-3 px-8 py-4 border-2 border-white text-white rounded-full hover:bg-white hover:text-[var(--primary-dark)] transition-all duration-300 font-bold text-lg">
              <Play className="w-5 h-5" />
              <span>Como funciona</span>
            </button>
          </div>

          {/* Hero stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
              <div className="text-4xl lg:text-5xl font-black text-[var(--highlight-orange)] mb-2">
                70%
              </div>
              <div className="text-sm lg:text-base text-gray-300 uppercase tracking-wide font-medium">
                Economia média
              </div>
            </div>
            
            <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
              <div className="text-4xl lg:text-5xl font-black text-[var(--highlight-green)] mb-2">
                Zero
              </div>
              <div className="text-sm lg:text-base text-gray-300 uppercase tracking-wide font-medium">
                Desperdício
              </div>
            </div>
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute top-1/4 left-10 lg:left-20">
          <div className="w-16 h-16 bg-[var(--highlight-orange)]/20 rounded-full flex items-center justify-center animate-float">
            <span className="text-2xl">🍕</span>
          </div>
        </div>
        
        <div className="absolute top-1/3 right-10 lg:right-20">
          <div className="w-20 h-20 bg-[var(--highlight-green)]/20 rounded-full flex items-center justify-center animate-float-delayed">
            <span className="text-3xl">🌱</span>
          </div>
        </div>

        <div className="absolute bottom-1/4 left-1/4">
          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center animate-float">
            <span className="text-xl">🥖</span>
          </div>
        </div>

        <div className="absolute bottom-1/3 right-1/3">
          <div className="w-14 h-14 bg-[var(--highlight-orange)]/20 rounded-full flex items-center justify-center animate-float-delayed">
            <span className="text-xl">☕</span>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
}
