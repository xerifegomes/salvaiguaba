import { useState, useEffect } from 'react';
import Header from '@/react-app/components/Header';
import Hero from '@/react-app/components/Hero';
import HowItWorks from '@/react-app/components/HowItWorks';
import Impact from '@/react-app/components/Impact';
import ForBusiness from '@/react-app/components/ForBusiness';
import Map from '@/react-app/components/Map';
import BagModal from '@/react-app/components/BagModal';
import { type BagWithEstablishment } from '@/shared/types';
import { MapPin, Clock, Package, Star } from 'lucide-react';

export default function Home() {
  const [bags, setBags] = useState<BagWithEstablishment[]>([]);
  const [selectedBag, setSelectedBag] = useState<BagWithEstablishment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchBags();
  }, []);

  const fetchBags = async () => {
    try {
      const response = await fetch('/api/bags');
      const data = await response.json();
      setBags(data);
    } catch (error) {
      console.error('Erro ao carregar bags:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBagClick = (bag: BagWithEstablishment) => {
    setSelectedBag(bag);
    setIsModalOpen(true);
  };

  const handleReserve = async (bagId: number, quantity: number) => {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bag_id: bagId,
          quantity,
          total_price: (selectedBag?.price || 0) * quantity,
          payment_method: 'pix'
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar pedido');
      }

      const result = await response.json();
      
      // Mostrar sucesso e código de retirada
      alert(`Reserva realizada! Código de retirada: ${result.pickup_code}`);
      
      // Atualizar lista de bags
      fetchBags();
      
    } catch (error) {
      console.error('Erro ao reservar:', error);
      alert('Erro ao realizar reserva. Tente novamente.');
    }
  };

  const filteredBags = filter === 'all' 
    ? bags 
    : bags.filter(bag => bag.establishment?.category === filter);

  const categories = [
    { id: 'all', name: 'Todos', emoji: '🍽️' },
    { id: 'padaria', name: 'Padarias', emoji: '🥖' },
    { id: 'restaurante', name: 'Restaurantes', emoji: '🍽️' },
    { id: 'mercado', name: 'Mercados', emoji: '🛒' },
    { id: 'lanchonete', name: 'Lanchonetes', emoji: '🍔' },
    { id: 'cafeteria', name: 'Cafeterias', emoji: '☕' },
    { id: 'pizzaria', name: 'Pizzarias', emoji: '🍕' },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-light)]">
      <Header />
      
      <main>
        {/* Hero Section */}
        <Hero />
        
        {/* How It Works Section */}
        <HowItWorks />

        {/* Map Section */}
        <section className="py-16 lg:py-24 bg-white">
          <div className="container">
            {/* Section Header */}
            <div className="text-center mb-12">
              <h2 className="text-h2 text-[var(--primary-dark)] mb-4 uppercase">
                Descubra bags próximas a você
              </h2>
              <p className="text-body-large text-[var(--text-light)] max-w-3xl mx-auto">
                Explore estabelecimentos em Iguaba Grande que têm bags surpresa disponíveis. 
                Economize dinheiro e ajude o meio ambiente!
              </p>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 gap-4 mb-12 max-w-xl mx-auto">
              <div className="text-center p-6 card">
                <div className="text-3xl lg:text-4xl font-black text-[var(--highlight-green)] mb-2">
                  {bags.length}
                </div>
                <div className="text-sm lg:text-base text-[var(--text-light)] uppercase tracking-wide font-medium">
                  Bags disponíveis
                </div>
              </div>
              <div className="text-center p-6 card">
                <div className="text-3xl lg:text-4xl font-black text-[var(--highlight-green)] mb-2">
                  60%
                </div>
                <div className="text-sm lg:text-base text-[var(--text-light)] uppercase tracking-wide font-medium">
                  Economia média
                </div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="mb-8">
              <div className="flex flex-wrap gap-2 justify-center">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setFilter(category.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                      filter === category.id
                        ? 'bg-[var(--primary-dark)] text-white shadow-lg'
                        : 'bg-white text-[var(--text-light)] hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <span>{category.emoji}</span>
                    <span>{category.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Map Container */}
            <div className="card overflow-hidden mb-8">
              <div className="h-[500px] lg:h-[600px] relative">
                {loading ? (
                  <div className="flex items-center justify-center h-full bg-gray-50">
                    <div className="text-center">
                      <div className="animate-spin w-12 h-12 border-4 border-[var(--primary-dark)] border-t-transparent rounded-full mx-auto mb-4"></div>
                      <p className="text-[var(--text-light)]">Carregando bags disponíveis...</p>
                    </div>
                  </div>
                ) : (
                  <Map bags={filteredBags} onBagClick={handleBagClick} />
                )}
              </div>
            </div>

            {/* Results Summary */}
            <div className="text-center">
              <p className="text-lg text-[var(--text-light)]">
                {filteredBags.length > 0 ? (
                  <>
                    Encontramos <span className="font-bold text-[var(--primary-dark)]">{filteredBags.length}</span> bags disponíveis
                    {filter !== 'all' && (
                      <> na categoria <span className="font-bold">{categories.find(c => c.id === filter)?.name}</span></>
                    )}
                  </>
                ) : (
                  'Nenhuma bag disponível no momento. Volte mais tarde!'
                )}
              </p>
            </div>

            {/* Featured Bags Grid */}
            {filteredBags.length > 0 && (
              <div className="mt-16">
                <h3 className="text-h3 text-[var(--primary-dark)] text-center mb-8 uppercase">
                  Bags em destaque
                </h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredBags.slice(0, 6).map((bag) => (
                    <div 
                      key={bag.id}
                      className="card p-6 cursor-pointer hover:scale-105 transition-all duration-300"
                      onClick={() => handleBagClick(bag)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-[var(--highlight-green)] rounded-full flex items-center justify-center text-white text-xl">
                          {bag.establishment?.category === 'padaria' ? '🥖' :
                           bag.establishment?.category === 'restaurante' ? '🍽️' :
                           bag.establishment?.category === 'mercado' ? '🛒' :
                           bag.establishment?.category === 'lanchonete' ? '🍔' :
                           bag.establishment?.category === 'cafeteria' ? '☕' :
                           bag.establishment?.category === 'pizzaria' ? '🍕' : '🍴'}
                        </div>
                        <div className="flex items-center gap-1 text-[var(--highlight-orange)] text-sm">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="font-semibold">4.8</span>
                        </div>
                      </div>
                      
                      <h4 className="font-bold text-lg text-[var(--primary-dark)] mb-1">
                        {bag.establishment?.name}
                      </h4>
                      <p className="text-sm text-[var(--text-light)] mb-3 capitalize">
                        {bag.establishment?.category}
                      </p>
                      
                      <h5 className="font-semibold text-[var(--primary-dark)] mb-2">
                        {bag.name}
                      </h5>
                      {bag.description && (
                        <p className="text-sm text-[var(--text-light)] mb-4 line-clamp-2">
                          {bag.description}
                        </p>
                      )}
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-[var(--text-light)]">
                          <MapPin className="w-4 h-4" />
                          <span className="truncate">{bag.establishment?.address}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[var(--text-light)]">
                          <Clock className="w-4 h-4" />
                          <span>{bag.pickup_start_time} - {bag.pickup_end_time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[var(--text-light)]">
                          <Package className="w-4 h-4" />
                          <span>{bag.quantity_available} disponíveis</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-black text-[var(--highlight-green)]">
                            R$ {bag.price.toFixed(2)}
                          </div>
                          {bag.original_price && (
                            <div className="text-sm text-[var(--text-light)] line-through">
                              De R$ {bag.original_price.toFixed(2)}
                            </div>
                          )}
                        </div>
                        <button className="btn-secondary text-sm py-2 px-4">
                          Reservar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Impact Section */}
        <Impact />

        {/* For Business Section */}
        <ForBusiness />
      </main>

      {/* Bag Modal */}
      <BagModal
        bag={selectedBag}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onReserve={handleReserve}
      />
    </div>
  );
}
