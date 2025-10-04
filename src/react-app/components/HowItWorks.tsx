import { MapPin, ShoppingBag, Utensils } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      icon: MapPin,
      title: "Encontre bags próximas",
      description: "Veja estabelecimentos perto de você com alimentos frescos por preços incríveis.",
      color: "var(--primary-teal)"
    },
    {
      icon: ShoppingBag,
      title: "Reserve sua bag",
      description: "Escolha sua bag surpresa e pague online com Pix ou cartão.",
      color: "var(--highlight-green)"
    },
    {
      icon: Utensils,
      title: "Retire e aproveite",
      description: "Pegue sua bag no horário combinado e aproveite comida deliciosa!",
      color: "var(--highlight-orange)"
    }
  ];

  return (
    <section id="how-it-works" className="py-20 lg:py-32 bg-[var(--beige-30)]">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-white rounded-full px-6 py-2 mb-6 shadow-sm">
            <span className="text-sm font-semibold text-[var(--primary-dark)] uppercase tracking-wide">Como funciona</span>
          </div>
          
          <h2 className="text-h1 text-[var(--primary-dark)] mb-6 uppercase">
            Como funciona
          </h2>
          
          <p className="text-body-large text-[var(--text-light)] max-w-2xl mx-auto">
            Três passos simples para economizar e combater o desperdício.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div 
                className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center shadow-xl text-white"
                style={{ backgroundColor: step.color }}
              >
                <step.icon className="w-10 h-10" />
              </div>
              
              <div className="text-4xl font-black text-[var(--primary-dark)] mb-4">
                {index + 1}
              </div>
              
              <h3 className="text-xl font-bold text-[var(--primary-dark)] mb-3 uppercase">
                {step.title}
              </h3>
              
              <p className="text-[var(--text-light)]">
                {step.description}
              </p>
            </div>
          ))}
        </div>


      </div>
    </section>
  );
}
