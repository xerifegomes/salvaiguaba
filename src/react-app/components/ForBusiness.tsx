import { TrendingUp, DollarSign, Users, Award, ArrowRight, CheckCircle, BarChart3 } from 'lucide-react';

export default function ForBusiness() {
  const benefits = [
    {
      icon: DollarSign,
      title: "Gere receita adicional",
      description: "Transforme alimentos excedentes em lucro ao invés de custos de descarte."
    },
    {
      icon: Users,
      title: "Atraia novos clientes",
      description: "Alcance consumidores conscientes que se importam com sustentabilidade."
    },
    {
      icon: TrendingUp,
      title: "Melhore a eficiência",
      description: "Melhor gestão de estoque e redução rastreável do desperdício alimentar."
    },
    {
      icon: Award,
      title: "Fortaleça sua marca",
      description: "Demonstre seu compromisso com sustentabilidade e responsabilidade social."
    }
  ];

  const partners = [
    { name: "Padaria Sol", type: "Padaria" },
    { name: "Café Central", type: "Cafeteria" },
    { name: "Mercado Bom Preço", type: "Supermercado" },
    { name: "Pizzaria Bella", type: "Restaurante" },
    { name: "Lanchonete da Praça", type: "Lanchonete" },
    { name: "Hortifruti Verde", type: "Hortifruti" }
  ];

  const stats = [
    { label: "Receita adicional média", value: "R$ 8,4 mil", icon: "💰" },
    { label: "Redução de desperdício", value: "89%", icon: "📉" },
    { label: "Novos clientes atraídos", value: "1.200+", icon: "👥" },
    { label: "Satisfação dos parceiros", value: "4.9/5", icon: "⭐" }
  ];

  return (
    <section id="for-business" className="py-20 lg:py-32 bg-white relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 right-20 w-40 h-40 rounded-full bg-[var(--primary-teal)]"></div>
        <div className="absolute bottom-40 left-20 w-32 h-32 rounded-full bg-[var(--highlight-green)]"></div>
      </div>

      <div className="container relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-[var(--beige-30)] rounded-full px-6 py-2 mb-6">
            <BarChart3 className="w-5 h-5 text-[var(--primary-dark)]" />
            <span className="text-sm font-semibold text-[var(--primary-dark)] uppercase tracking-wide">Para empresas</span>
          </div>
          
          <h2 className="text-h1 text-[var(--primary-dark)] mb-6 uppercase">
            Parceiros em{' '}
            <span className="text-[var(--highlight-green)]">Iguaba Grande</span>
          </h2>
          
          <p className="text-body-large text-[var(--text-light)] max-w-3xl mx-auto">
            Restaurantes, padarias e mercados parceiros reduzem desperdício e atraem novos clientes.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center mb-20">
          {/* Left Column - Content */}
          <div>
            {/* Benefits Grid */}
            <div className="grid sm:grid-cols-2 gap-8 mb-12">
              {benefits.map((benefit, index) => (
                <div key={index} className="group">
                  <div className="flex items-start gap-4 p-6 bg-[var(--beige-30)] rounded-2xl hover:bg-white hover:shadow-lg transition-all duration-300">
                    <div className="flex-shrink-0 w-12 h-12 bg-[var(--highlight-green)] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <benefit.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-2 text-[var(--primary-dark)]">{benefit.title}</h3>
                      <p className="text-[var(--text-light)] text-sm leading-relaxed">{benefit.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-12">
              {stats.map((stat, index) => (
                <div key={index} className="text-center p-4 bg-[var(--primary-dark)] rounded-2xl text-white">
                  <div className="text-2xl mb-1">{stat.icon}</div>
                  <div className="text-2xl font-black text-[var(--highlight-green)] mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs opacity-90">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="btn-secondary inline-flex items-center gap-3 text-lg px-8 py-4">
                <span>Torne-se um parceiro</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              
              <button className="btn-primary inline-flex items-center gap-3 text-lg px-8 py-4">
                <span>Saiba mais</span>
              </button>
            </div>
          </div>

          {/* Right Column - Visual */}
          <div className="relative">
            {/* Partner logos grid */}
            <div className="bg-[var(--beige-30)] rounded-3xl p-8 mb-8">
              <h3 className="text-center text-lg font-bold text-[var(--primary-dark)] mb-6 uppercase">
                Marcas que confiam em nós
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {partners.map((partner, index) => (
                  <div key={index} className="bg-white rounded-2xl p-4 text-center border border-gray-100 hover:shadow-lg transition-all duration-300">
                    <div className="font-bold text-[var(--primary-dark)] mb-1">{partner.name}</div>
                    <div className="text-sm text-[var(--text-light)]">{partner.type}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Success story card */}
            <div className="bg-gradient-to-br from-[var(--primary-dark)] to-[var(--primary-teal)] rounded-3xl p-8 text-white">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-8 h-8 text-[var(--highlight-green)]" />
                <h4 className="text-xl font-bold">História de sucesso</h4>
              </div>
              
              <p className="text-gray-300 mb-6 leading-relaxed">
                "Desde que nos juntamos ao Salva Iguaba, reduzimos nosso desperdício alimentar em 75% 
                e geramos uma receita adicional de R$ 15.000 por mês!"
              </p>
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[var(--highlight-green)] rounded-full flex items-center justify-center text-xl">
                  🥖
                </div>
                <div>
                  <div className="font-semibold">Padaria do Centro</div>
                  <div className="text-sm text-gray-300">Iguaba Grande, RJ</div>
                </div>
              </div>
            </div>

            {/* Floating elements */}
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-[var(--highlight-orange)] rounded-full flex items-center justify-center shadow-xl animate-float">
              <span className="text-2xl text-white font-black">89%</span>
            </div>

            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-[var(--highlight-green)] rounded-full flex items-center justify-center shadow-xl animate-float-delayed">
              <span className="text-3xl">💚</span>
            </div>
          </div>
        </div>

        {/* Call to Action Section */}
        <div className="bg-gradient-to-r from-[var(--primary-dark)] to-[var(--primary-teal)] rounded-3xl p-12 text-center text-white">
          <h3 className="text-h2 mb-6 uppercase">
            Pronto para fazer a diferença?
          </h3>
          
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Junte-se à nossa rede de parceiros e transforme seu desperdício alimentar em oportunidade de negócio.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn-secondary bg-[var(--highlight-green)] hover:bg-white hover:text-[var(--primary-dark)] inline-flex items-center gap-3 text-lg px-8 py-4">
              <span>Cadastre seu estabelecimento</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            
            <button className="border-2 border-white text-white hover:bg-white hover:text-[var(--primary-dark)] inline-flex items-center gap-3 text-lg px-8 py-4 rounded-full font-bold transition-all duration-300">
              <span>Fale com nosso time</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
