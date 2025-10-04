import { useState, useEffect } from 'react';
import { useAuth } from '@getmocha/users-service/react';
import { useNavigate, Link } from 'react-router';
import { Package, MapPin, Clock, QrCode, CreditCard } from 'lucide-react';
import Header from '@/react-app/components/Header';
import { type OrderWithDetails } from '@/shared/types';

export default function MyOrders() {
  const { user, isPending } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isPending && !user) {
      navigate('/');
      return;
    }
    
    if (user) {
      fetchOrders();
    }
  }, [user, isPending, navigate]);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders/my');
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'reserved':
        return 'Reservado - Aguardando Pagamento';
      case 'pending':
        return 'Aguardando Confirmação';
      case 'confirmed':
        return 'Confirmado - Pronto para Retirada';
      case 'completed':
        return 'Concluído';
      case 'cancelled':
        return 'Cancelado';
      default:
        return 'Status Desconhecido';
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

  return (
    <div className="min-h-screen bg-[var(--bg-light)]">
      <Header />
      
      <main className="pt-20">
        {/* Header */}
        <section className="bg-gradient-to-br from-[var(--primary-dark)] to-[var(--primary-teal)] text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-black mb-2">Meus Pedidos</h1>
            <p className="text-gray-300">Acompanhe o status das suas bags surpresa</p>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {orders.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-24 h-24 text-gray-300 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-600 mb-4">Nenhum pedido ainda</h2>
              <p className="text-gray-500 mb-8">
                Que tal fazer sua primeira reserva? Há muitas bags esperando por você!
              </p>
              <button
                onClick={() => navigate('/')}
                className="bg-[var(--primary-dark)] hover:bg-[var(--primary-teal)] text-white font-bold py-3 px-8 rounded-xl transition-colors"
              >
                Explorar Bags
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order: any) => (
                <div key={order.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  {/* Order Header */}
                  <div className="bg-gradient-to-r from-green-50 to-orange-50 p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-[var(--primary-dark)]">
                        {order.establishment_name}
                      </h3>
                      <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{order.establishment_address}</span>
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="p-6">
                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Left Column */}
                      <div>
                        <h4 className="font-bold text-lg mb-4">Detalhes da Bag</h4>
                        
                        <div className="space-y-3">
                          <div>
                            <span className="text-sm text-gray-600">Nome:</span>
                            <p className="font-semibold">{order.bag_name}</p>
                          </div>
                          
                          <div>
                            <span className="text-sm text-gray-600">Quantidade:</span>
                            <p className="font-semibold">{order.quantity} unidade(s)</p>
                          </div>
                          
                          <div>
                            <span className="text-sm text-gray-600">Valor Total:</span>
                            <p className="text-2xl font-black text-green-600">
                              R$ {order.total_price.toFixed(2)}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-orange-500" />
                            <div>
                              <span className="text-sm text-gray-600">Horário de Retirada:</span>
                              <p className="font-semibold">
                                {order.pickup_start_time} - {order.pickup_end_time}
                              </p>
                              <p className="text-sm text-gray-500">
                                {new Date(order.pickup_date).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Column */}
                      <div>
                        {/* Botão de Pagamento para pedidos reservados */}
                        {order.status === 'reserved' && !order.payment_confirmed && (
                          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl p-6 text-center mb-4">
                            <CreditCard className="w-12 h-12 mx-auto mb-4" />
                            <h4 className="font-bold text-lg mb-2">Pagamento Pendente</h4>
                            <p className="text-sm opacity-90 mb-6">
                              Complete o pagamento via PIX para confirmar seu pedido
                            </p>
                            <Link to={`/payment/${order.id}`}>
                              <button className="w-full bg-white text-orange-600 font-bold py-4 px-6 rounded-xl hover:bg-orange-50 transition-all transform hover:scale-105 shadow-lg">
                                Pagar com PIX
                              </button>
                            </Link>
                            <p className="text-xs mt-3 opacity-75">
                              Pagamento rápido e seguro
                            </p>
                          </div>
                        )}

                        {order.status === 'confirmed' && (
                          <div className="bg-gradient-to-br from-[var(--primary-dark)] to-[var(--primary-teal)] text-white rounded-2xl p-6 text-center">
                            <QrCode className="w-12 h-12 mx-auto mb-4" />
                            <h4 className="font-bold text-lg mb-2">Código de Retirada</h4>
                            <div className="bg-white/20 backdrop-blur rounded-xl p-4 mb-4">
                              <span className="text-3xl font-black tracking-wider font-mono">
                                {order.pickup_code}
                              </span>
                            </div>
                            <p className="text-sm opacity-90">
                              Mostre este código no estabelecimento para retirar sua bag
                            </p>
                          </div>
                        )}

                        {order.status === 'pending' && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-center">
                            <Clock className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                            <h4 className="font-bold text-lg text-yellow-800 mb-2">
                              Aguardando Confirmação
                            </h4>
                            <p className="text-sm text-yellow-700 mb-4">
                              Pagamento recebido! Aguardando confirmação do estabelecimento
                            </p>
                            <div className="bg-white rounded-xl p-4">
                              <p className="text-sm text-gray-600 mb-2">Código do Pedido:</p>
                              <span className="text-xl font-bold font-mono text-[var(--primary-dark)]">
                                {order.pickup_code}
                              </span>
                            </div>
                          </div>
                        )}

                        {order.status === 'completed' && (
                          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
                            <Package className="w-12 h-12 text-green-600 mx-auto mb-4" />
                            <h4 className="font-bold text-lg text-green-800 mb-2">
                              Pedido Concluído
                            </h4>
                            <p className="text-sm text-green-700">
                              Obrigado por ajudar a combater o desperdício de alimentos! 🌱
                            </p>
                          </div>
                        )}

                        {/* Contact Info */}
                        {order.establishment_phone && (
                          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                            <h5 className="font-semibold mb-2">Contato</h5>
                            <p className="text-sm text-gray-600">
                              Telefone: {order.establishment_phone}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Order Timeline */}
                  <div className="bg-gray-50 p-6 border-t border-gray-200">
                    <h5 className="font-semibold mb-3">Histórico do Pedido</h5>
                    <div className="text-sm text-gray-600">
                      <p>Pedido realizado em: {new Date(order.created_at).toLocaleString('pt-BR')}</p>
                      {order.updated_at !== order.created_at && (
                        <p>Última atualização: {new Date(order.updated_at).toLocaleString('pt-BR')}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
