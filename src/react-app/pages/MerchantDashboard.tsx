import { useState, useEffect } from 'react';
import { useAuth } from '@getmocha/users-service/react';
import { useNavigate } from 'react-router';
import { Plus, Package, DollarSign, Clock, CheckCircle, Store } from 'lucide-react';
import Header from '@/react-app/components/Header';
import { type Bag, type Order, type Establishment } from '@/shared/types';

interface MerchantStats {
  totalSales: number;
  totalRevenue: number;
  todaySales: number;
  activeBags: number;
}

export default function MerchantDashboard() {
  const { user, isPending } = useAuth();
  const navigate = useNavigate();
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [selectedEstablishment, setSelectedEstablishment] = useState<Establishment | null>(null);
  const [bags, setBags] = useState<Bag[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<MerchantStats>({ totalSales: 0, totalRevenue: 0, todaySales: 0, activeBags: 0 });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isPending && !user) {
      navigate('/');
      return;
    }
    
    if (user) {
      fetchData();
    }
  }, [user, isPending, navigate]);

  const fetchData = async () => {
    try {
      // Primeiro, carregar estabelecimentos do lojista
      const establishmentsRes = await fetch('/api/merchant/establishments');
      
      if (establishmentsRes.ok) {
        const establishmentsData = await establishmentsRes.json();
        setEstablishments(establishmentsData);
        
        // Se houver estabelecimentos, selecionar o primeiro automaticamente
        if (establishmentsData.length > 0) {
          const firstEstablishment = establishmentsData[0];
          setSelectedEstablishment(firstEstablishment);
          await fetchEstablishmentData(firstEstablishment.id);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEstablishmentData = async (establishmentId: number) => {
    try {
      const [bagsRes, ordersRes, statsRes] = await Promise.all([
        fetch(`/api/establishments/${establishmentId}/bags`),
        fetch('/api/merchant/orders'),
        fetch('/api/merchant/stats')
      ]);

      if (bagsRes.ok) setBags(await bagsRes.json());
      if (ordersRes.ok) setOrders(await ordersRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
    } catch (error) {
      console.error('Erro ao carregar dados do estabelecimento:', error);
    }
  };

  const confirmOrder = async (orderId: number) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/confirm`, {
        method: 'PUT',
      });
      
      if (response.ok) {
        fetchData(); // Recarregar dados
      }
    } catch (error) {
      console.error('Erro ao confirmar pedido:', error);
    }
  };

  const completeOrder = async (orderId: number) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/complete`, {
        method: 'PUT',
      });
      
      if (response.ok) {
        fetchData(); // Recarregar dados
      }
    } catch (error) {
      console.error('Erro ao completar pedido:', error);
    }
  };

  if (isPending || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-light)]">
        <div className="animate-spin w-12 h-12 border-4 border-[var(--primary-dark)] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Se não tem estabelecimentos, mostrar tela de onboarding
  if (!loading && establishments.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--bg-light)]">
        <Header />
        
        <main className="pt-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
            <Store className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h1 className="text-4xl font-black text-[var(--primary-dark)] mb-4">
              Bem-vindo ao Painel do Lojista!
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Para começar a vender bags surpresa, você precisa cadastrar seu estabelecimento.
            </p>
            <button
              onClick={() => navigate('/register-establishment')}
              className="bg-[var(--highlight-green)] hover:bg-green-600 text-white font-bold py-4 px-8 rounded-2xl transition-colors text-lg"
            >
              Cadastrar Meu Estabelecimento
            </button>
            <p className="text-sm text-gray-500 mt-6">
              Assim que seu estabelecimento for aprovado, você poderá criar bags surpresa e começar a reduzir o desperdício!
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-light)]">
      <Header />
      
      <main className="pt-20">
        {/* Header */}
        <section className="bg-[var(--primary-dark)] text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div>
                <h1 className="text-3xl font-black mb-2">Painel do Lojista</h1>
                <p className="text-gray-300">Gerencie suas bags surpresa</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                {/* Seletor de Estabelecimento */}
                {establishments.length > 1 && (
                  <select
                    value={selectedEstablishment?.id || ''}
                    onChange={(e) => {
                      const establishment = establishments.find(est => est.id === parseInt(e.target.value));
                      if (establishment) {
                        setSelectedEstablishment(establishment);
                        // Recarregar dados do novo estabelecimento
                        fetchEstablishmentData(establishment.id);
                      }
                    }}
                    className="bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white rounded-xl px-4 py-3 font-semibold focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all appearance-none cursor-pointer"
                  >
                    {establishments.map((est) => (
                      <option key={est.id} value={est.id} className="text-gray-900">
                        {est.name}
                      </option>
                    ))}
                  </select>
                )}
                
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="flex items-center gap-2 bg-[var(--highlight-green)] hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl transition-colors whitespace-nowrap"
                >
                  <Plus className="w-5 h-5" />
                  Nova Bag
                </button>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Vendas Total</p>
                  <p className="text-2xl font-black text-[var(--primary-dark)]">{stats.totalSales}</p>
                </div>
                <Package className="w-8 h-8 text-[var(--highlight-green)]" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Receita Total</p>
                  <p className="text-2xl font-black text-[var(--primary-dark)]">R$ {stats.totalRevenue.toFixed(2)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-[var(--highlight-orange)]" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Hoje</p>
                  <p className="text-2xl font-black text-[var(--primary-dark)]">{stats.todaySales}</p>
                </div>
                <Clock className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Bags Ativas</p>
                  <p className="text-2xl font-black text-[var(--primary-dark)]">{stats.activeBags}</p>
                </div>
                <Package className="w-8 h-8 text-green-500" />
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Recent Orders */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-black mb-6">Pedidos Recentes</h2>
              
              <div className="space-y-4">
                {orders.slice(0, 5).map((order: any) => (
                  <div key={order.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{order.bag_name}</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        order.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'completed' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {order.status === 'pending' ? 'Pendente' :
                         order.status === 'confirmed' ? 'Confirmado' :
                         order.status === 'completed' ? 'Concluído' :
                         'Cancelado'}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">
                      Código: <span className="font-mono font-bold">{order.pickup_code}</span>
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-green-600">R$ {order.total_price.toFixed(2)}</span>
                      
                      <div className="flex gap-2">
                        {order.status === 'pending' && (
                          <button
                            onClick={() => confirmOrder(order.id)}
                            className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1 rounded-lg transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Confirmar
                          </button>
                        )}
                        
                        {order.status === 'confirmed' && (
                          <button
                            onClick={() => completeOrder(order.id)}
                            className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white text-sm px-3 py-1 rounded-lg transition-colors"
                          >
                            <Package className="w-4 h-4" />
                            Entregar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {orders.length === 0 && (
                  <p className="text-gray-500 text-center py-8">Nenhum pedido ainda</p>
                )}
              </div>
            </div>

            {/* Active Bags */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-black mb-6">Bags Ativas</h2>
              
              <div className="space-y-4">
                {bags.filter(bag => bag.is_active && bag.quantity_available > 0).map((bag) => (
                  <div key={bag.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{bag.name}</h3>
                      <span className="text-lg font-bold text-green-600">
                        R$ {bag.price.toFixed(2)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Disponível: {bag.quantity_available}</span>
                      <span>{bag.pickup_start_time} - {bag.pickup_end_time}</span>
                    </div>
                  </div>
                ))}
                
                {bags.filter(bag => bag.is_active && bag.quantity_available > 0).length === 0 && (
                  <p className="text-gray-500 text-center py-8">Nenhuma bag ativa</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Create Bag Form Modal */}
      {showCreateForm && selectedEstablishment && (
        <CreateBagModal 
          establishmentId={selectedEstablishment.id}
          onClose={() => setShowCreateForm(false)} 
          onSuccess={() => {
            setShowCreateForm(false);
            fetchData();
          }} 
        />
      )}
    </div>
  );
}

interface CreateBagModalProps {
  establishmentId: number;
  onClose: () => void;
  onSuccess: () => void;
}

function CreateBagModal({ establishmentId, onClose, onSuccess }: CreateBagModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    original_price: '',
    quantity_available: '',
    pickup_start_time: '',
    pickup_end_time: '',
    pickup_date: new Date().toISOString().split('T')[0]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/bags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          establishment_id: establishmentId,
          price: parseFloat(formData.price),
          original_price: formData.original_price ? parseFloat(formData.original_price) : null,
          quantity_available: parseInt(formData.quantity_available)
        }),
      });

      if (response.ok) {
        onSuccess();
      }
    } catch (error) {
      console.error('Erro ao criar bag:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-black">Nova Bag Surpresa</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Nome da Bag</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold mb-2">Descrição</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Preço</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-2">Preço Original</label>
              <input
                type="number"
                step="0.01"
                value={formData.original_price}
                onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold mb-2">Quantidade</label>
            <input
              type="number"
              min="1"
              value={formData.quantity_available}
              onChange={(e) => setFormData({ ...formData, quantity_available: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold mb-2">Data de Retirada</label>
            <input
              type="date"
              value={formData.pickup_date}
              onChange={(e) => setFormData({ ...formData, pickup_date: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Horário Início</label>
              <input
                type="time"
                value={formData.pickup_start_time}
                onChange={(e) => setFormData({ ...formData, pickup_start_time: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-2">Horário Fim</label>
              <input
                type="time"
                value={formData.pickup_end_time}
                onChange={(e) => setFormData({ ...formData, pickup_end_time: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-[var(--highlight-green)] hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Criando...' : 'Criar Bag'}
            </button>
            
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border-2 border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
