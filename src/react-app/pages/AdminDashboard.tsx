import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@getmocha/users-service/react';
import Header from '@/react-app/components/Header';
import { 
  Store, Users, Package, DollarSign, TrendingUp, CheckCircle, 
  XCircle, Clock, Settings, Shield, CreditCard, BarChart3 
} from 'lucide-react';

interface AdminStats {
  totalEstablishments: number;
  pendingEstablishments: number;
  approvedEstablishments: number;
  totalBags: number;
  totalOrders: number;
  totalRevenue: number;
  platformRevenue: number;
  totalUsers: number;
}

interface Establishment {
  id: number;
  name: string;
  category: string;
  address: string;
  approval_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  rejection_reason?: string;
}

interface Order {
  id: number;
  bag_name: string;
  establishment_name: string;
  quantity: number;
  total_price: number;
  status: string;
  created_at: string;
  pickup_code: string;
}

export default function AdminDashboard() {
  const { user, isPending } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats>({
    totalEstablishments: 0,
    pendingEstablishments: 0,
    approvedEstablishments: 0,
    totalBags: 0,
    totalOrders: 0,
    totalRevenue: 0,
    platformRevenue: 0,
    totalUsers: 0
  });
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'establishments' | 'orders' | 'payments' | 'settings'>('overview');
  const [filterStatus, setFilterStatus] = useState<string>('pending');

  useEffect(() => {
    if (!isPending && !user) {
      navigate('/');
      return;
    }

    if (user) {
      checkAdmin();
    }
  }, [user, isPending, navigate]);

  const checkAdmin = async () => {
    try {
      const response = await fetch('/api/admin/check');
      const data = await response.json();
      
      if (!data.isAdmin) {
        alert('Acesso negado. Apenas administradores.');
        navigate('/');
        return;
      }
      
      setIsAdmin(true);
      loadStats();
      loadEstablishments('pending');
      loadOrders('all');
    } catch (error) {
      console.error('Erro ao verificar admin:', error);
      navigate('/');
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEstablishments = async (status: string) => {
    try {
      const response = await fetch(`/api/admin/establishments?status=${status}`);
      const data = await response.json();
      setEstablishments(data);
    } catch (error) {
      console.error('Erro ao carregar estabelecimentos:', error);
    }
  };

  const loadOrders = async (status: string) => {
    try {
      const response = await fetch(`/api/admin/orders?status=${status}`);
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    }
  };

  const approveEstablishment = async (id: number) => {
    if (!confirm('Aprovar este estabelecimento?')) return;
    
    try {
      await fetch(`/api/admin/establishments/${id}/approve`, { method: 'PUT' });
      alert('Estabelecimento aprovado!');
      loadEstablishments(filterStatus);
      loadStats();
    } catch (error) {
      console.error('Erro ao aprovar:', error);
      alert('Erro ao aprovar estabelecimento');
    }
  };

  const rejectEstablishment = async (id: number) => {
    const reason = prompt('Motivo da rejeição:');
    if (!reason) return;
    
    try {
      await fetch(`/api/admin/establishments/${id}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      alert('Estabelecimento rejeitado');
      loadEstablishments(filterStatus);
      loadStats();
    } catch (error) {
      console.error('Erro ao rejeitar:', error);
      alert('Erro ao rejeitar estabelecimento');
    }
  };

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-[var(--bg-light)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-[var(--primary-dark)] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-[var(--text-light)]">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-light)]">
        <Header />
        <div className="container py-20">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-[var(--primary-dark)] border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-[var(--text-light)]">Carregando painel administrativo...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-light)]">
      <Header />
      
      <main className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-[var(--highlight-orange)]" />
            <h1 className="text-4xl font-black text-[var(--primary-dark)]">Painel Administrativo</h1>
          </div>
          <p className="text-[var(--text-light)]">Gerenciamento completo da plataforma Salva Iguaba</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-[var(--primary-dark)] text-white'
                : 'bg-white text-[var(--text-light)] hover:bg-gray-50'
            }`}
          >
            <BarChart3 className="w-5 h-5 inline mr-2" />
            Visão Geral
          </button>
          <button
            onClick={() => {
              setActiveTab('establishments');
              loadEstablishments('pending');
            }}
            className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
              activeTab === 'establishments'
                ? 'bg-[var(--primary-dark)] text-white'
                : 'bg-white text-[var(--text-light)] hover:bg-gray-50'
            }`}
          >
            <Store className="w-5 h-5 inline mr-2" />
            Estabelecimentos
            {stats.pendingEstablishments > 0 && (
              <span className="ml-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                {stats.pendingEstablishments}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              setActiveTab('orders');
              loadOrders('all');
            }}
            className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
              activeTab === 'orders'
                ? 'bg-[var(--primary-dark)] text-white'
                : 'bg-white text-[var(--text-light)] hover:bg-gray-50'
            }`}
          >
            <Package className="w-5 h-5 inline mr-2" />
            Pedidos
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
              activeTab === 'payments'
                ? 'bg-[var(--primary-dark)] text-white'
                : 'bg-white text-[var(--text-light)] hover:bg-gray-50'
            }`}
          >
            <CreditCard className="w-5 h-5 inline mr-2" />
            Pagamentos
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-[var(--primary-dark)] text-white'
                : 'bg-white text-[var(--text-light)] hover:bg-gray-50'
            }`}
          >
            <Settings className="w-5 h-5 inline mr-2" />
            Configurações
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            {/* Stats Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <Store className="w-10 h-10 text-[var(--primary-teal)]" />
                  <div className="text-right">
                    <div className="text-3xl font-black text-[var(--primary-dark)]">
                      {stats.totalEstablishments}
                    </div>
                    <div className="text-sm text-[var(--text-light)]">Estabelecimentos</div>
                  </div>
                </div>
                <div className="flex gap-2 text-xs">
                  <span className="text-green-600">✓ {stats.approvedEstablishments} aprovados</span>
                  <span className="text-orange-600">⏳ {stats.pendingEstablishments} pendentes</span>
                </div>
              </div>

              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <Package className="w-10 h-10 text-[var(--highlight-green)]" />
                  <div className="text-right">
                    <div className="text-3xl font-black text-[var(--primary-dark)]">
                      {stats.totalBags}
                    </div>
                    <div className="text-sm text-[var(--text-light)]">Bags Ativas</div>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <TrendingUp className="w-10 h-10 text-[var(--highlight-orange)]" />
                  <div className="text-right">
                    <div className="text-3xl font-black text-[var(--primary-dark)]">
                      {stats.totalOrders}
                    </div>
                    <div className="text-sm text-[var(--text-light)]">Pedidos Totais</div>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <DollarSign className="w-10 h-10 text-green-600" />
                  <div className="text-right">
                    <div className="text-3xl font-black text-green-600">
                      R$ {(stats.totalRevenue || 0).toFixed(2)}
                    </div>
                    <div className="text-sm text-[var(--text-light)]">Receita Total</div>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  Plataforma: R$ {(stats.platformRevenue || 0).toFixed(2)}
                </div>
              </div>

              <div className="card p-6">
                <div className="flex items-center justify-between">
                  <Users className="w-10 h-10 text-[var(--primary-dark)]" />
                  <div className="text-right">
                    <div className="text-3xl font-black text-[var(--primary-dark)]">
                      {stats.totalUsers}
                    </div>
                    <div className="text-sm text-[var(--text-light)]">Usuários Ativos</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Establishments Tab */}
        {activeTab === 'establishments' && (
          <div>
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => { setFilterStatus('pending'); loadEstablishments('pending'); }}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filterStatus === 'pending'
                    ? 'bg-orange-500 text-white'
                    : 'bg-white text-gray-600'
                }`}
              >
                <Clock className="w-4 h-4 inline mr-1" />
                Pendentes ({stats.pendingEstablishments})
              </button>
              <button
                onClick={() => { setFilterStatus('approved'); loadEstablishments('approved'); }}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filterStatus === 'approved'
                    ? 'bg-green-500 text-white'
                    : 'bg-white text-gray-600'
                }`}
              >
                <CheckCircle className="w-4 h-4 inline mr-1" />
                Aprovados
              </button>
              <button
                onClick={() => { setFilterStatus('rejected'); loadEstablishments('rejected'); }}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filterStatus === 'rejected'
                    ? 'bg-red-500 text-white'
                    : 'bg-white text-gray-600'
                }`}
              >
                <XCircle className="w-4 h-4 inline mr-1" />
                Rejeitados
              </button>
              <button
                onClick={() => { setFilterStatus('all'); loadEstablishments('all'); }}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filterStatus === 'all'
                    ? 'bg-[var(--primary-dark)] text-white'
                    : 'bg-white text-gray-600'
                }`}
              >
                Todos
              </button>
            </div>

            <div className="space-y-4">
              {establishments.map((est) => (
                <div key={est.id} className="card p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-[var(--primary-dark)]">{est.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          est.approval_status === 'approved' ? 'bg-green-100 text-green-700' :
                          est.approval_status === 'pending' ? 'bg-orange-100 text-orange-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {est.approval_status === 'approved' ? 'Aprovado' :
                           est.approval_status === 'pending' ? 'Pendente' : 'Rejeitado'}
                        </span>
                      </div>
                      <p className="text-[var(--text-light)] mb-1">📍 {est.address}</p>
                      <p className="text-sm text-gray-500">Categoria: {est.category}</p>
                      <p className="text-sm text-gray-500">
                        Criado em: {new Date(est.created_at).toLocaleDateString('pt-BR')}
                      </p>
                      {est.rejection_reason && (
                        <p className="text-sm text-red-600 mt-2">
                          Motivo da rejeição: {est.rejection_reason}
                        </p>
                      )}
                    </div>

                    {est.approval_status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => approveEstablishment(est.id)}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4 inline mr-1" />
                          Aprovar
                        </button>
                        <button
                          onClick={() => rejectEstablishment(est.id)}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                          <XCircle className="w-4 h-4 inline mr-1" />
                          Rejeitar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {establishments.length === 0 && (
                <div className="card p-12 text-center">
                  <p className="text-[var(--text-light)]">
                    Nenhum estabelecimento encontrado com o status "{filterStatus}"
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bag</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estabelecimento</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qtd</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm">#{order.id}</td>
                        <td className="px-6 py-4 text-sm font-medium">{order.bag_name}</td>
                        <td className="px-6 py-4 text-sm">{order.establishment_name}</td>
                        <td className="px-6 py-4 text-sm">{order.quantity}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-green-600">
                          R$ {order.total_price.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            order.status === 'completed' ? 'bg-green-100 text-green-700' :
                            order.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                            order.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-mono">{order.pickup_code}</td>
                        <td className="px-6 py-4 text-sm">
                          {new Date(order.created_at).toLocaleDateString('pt-BR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {orders.length === 0 && (
                <div className="p-12 text-center">
                  <p className="text-[var(--text-light)]">Nenhum pedido encontrado</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="card p-8">
            <div className="text-center py-12">
              <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-[var(--primary-dark)] mb-2">
                Gerenciamento de Pagamentos
              </h3>
              <p className="text-[var(--text-light)]">
                Funcionalidade em desenvolvimento. Em breve você poderá gerenciar todos os pagamentos da plataforma.
              </p>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="card p-8">
            <div className="text-center py-12">
              <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-[var(--primary-dark)] mb-2">
                Configurações do Sistema
              </h3>
              <p className="text-[var(--text-light)]">
                Funcionalidade em desenvolvimento. Em breve você poderá configurar:
              </p>
              <ul className="mt-4 text-left max-w-md mx-auto text-[var(--text-light)]">
                <li>• Taxa de comissão da plataforma</li>
                <li>• Limites de preço mínimo e máximo</li>
                <li>• Aprovação automática de estabelecimentos</li>
                <li>• Gerenciamento de administradores</li>
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
