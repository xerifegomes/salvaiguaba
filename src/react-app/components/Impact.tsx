import { Globe, Leaf, Heart } from 'lucide-react';

export default function Impact() {
  const globalStats = [
    {
      icon: Leaf,
      number: "2,5 ton",
      label: "Alimentos salvos do lixo",
      color: "var(--highlight-green)"
    },
    {
      icon: Heart,
      number: "R$ 45 mil",
      label: "Economizados pelos usuários",
      color: "var(--highlight-orange)"
    },
    {
      icon: Globe,
      number: "3,8 ton",
      label: "CO2 evitado",
      color: "var(--primary-teal)"
    }
  ];

  return (
    <section id="impact" className="py-20 lg:py-32 bg-gradient-to-br from-[var(--primary-dark)] to-[var(--primary-teal)] text-white relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 rounded-full bg-white animate-float"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 rounded-full bg-[var(--highlight-green)] animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 rounded-full bg-[var(--highlight-orange)]"></div>
      </div>

      <div className="container relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 mb-6">
            <Leaf className="w-5 h-5 text-[var(--highlight-green)]" />
            <span className="text-sm font-semibold uppercase tracking-wide">Nosso impacto</span>
          </div>
          
          <h2 className="text-h1 mb-6 uppercase">
            Nosso impacto em Iguaba Grande
          </h2>
          
          <p className="text-body-large text-gray-300 max-w-2xl mx-auto">
            Cada bag salva faz a diferença para o meio ambiente e para a comunidade.
          </p>
        </div>

        {/* Global Stats Grid */}
        <div className="grid sm:grid-cols-3 gap-8 mb-16 max-w-4xl mx-auto">
          {globalStats.map((stat, index) => (
            <div 
              key={index}
              className="text-center p-8 bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 hover:bg-white/15 transition-all duration-300"
            >
              <div 
                className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 text-white"
                style={{ backgroundColor: stat.color }}
              >
                <stat.icon className="w-8 h-8" />
              </div>
              
              <div className="text-4xl lg:text-5xl font-black mb-4">
                {stat.number}
              </div>
              
              <h3 className="text-base font-bold uppercase tracking-tight">
                {stat.label}
              </h3>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-h2 mb-6 uppercase">
              Faça parte da solução
            </h3>
            
            <p className="text-xl text-gray-300 mb-8">
              Junte-se à comunidade que combate o desperdício em Iguaba Grande!
            </p>
            
            <button className="btn-secondary inline-flex items-center gap-3 text-lg px-8 py-4 bg-[var(--highlight-green)] hover:bg-white hover:text-[var(--primary-dark)]">
              <span>Ver bags disponíveis</span>
              <Leaf className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
