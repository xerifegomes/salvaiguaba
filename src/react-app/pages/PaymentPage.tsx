import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import Header from '../components/Header';
import PixPayment from '../components/payments/PixPayment';
import { CreditCard, Smartphone } from 'lucide-react';

type PaymentMethod = 'pix' | 'card';

export default function PaymentPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('pix');
  const orderData = {
    amount: 12.50, // Será carregado do backend
    bagName: 'Bag Surpresa',
    establishmentName: 'Padaria Sol'
  };

  const handlePaymentSuccess = () => {
    // Redirecionar para página de pedidos
    setTimeout(() => {
      navigate('/my-orders');
    }, 3000);
  };

  const handlePaymentError = (error: string) => {
    console.error('Erro no pagamento:', error);
    alert(`Erro: ${error}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cabeçalho */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Pagamento do Pedido #{orderId}
          </h1>
          <div className="text-gray-600">
            <p className="font-medium">{orderData.bagName}</p>
            <p className="text-sm">{orderData.establishmentName}</p>
          </div>
        </div>

        {/* Seleção de método de pagamento */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Escolha a forma de pagamento
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* PIX */}
            <button
              onClick={() => setSelectedMethod('pix')}
              className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
                selectedMethod === 'pix'
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Smartphone className={`h-8 w-8 ${
                selectedMethod === 'pix' ? 'text-orange-500' : 'text-gray-400'
              }`} />
              <div className="text-left">
                <p className="font-semibold text-gray-900">PIX</p>
                <p className="text-sm text-gray-600">Pagamento instantâneo</p>
              </div>
              {selectedMethod === 'pix' && (
                <div className="ml-auto">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                </div>
              )}
            </button>

            {/* Cartão de Crédito */}
            <button
              onClick={() => setSelectedMethod('card')}
              className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
                selectedMethod === 'card'
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              disabled
            >
              <CreditCard className={`h-8 w-8 ${
                selectedMethod === 'card' ? 'text-orange-500' : 'text-gray-400'
              }`} />
              <div className="text-left">
                <p className="font-semibold text-gray-900">Cartão de Crédito</p>
                <p className="text-sm text-gray-600">Em breve</p>
              </div>
            </button>
          </div>
        </div>

        {/* Componente de pagamento */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {selectedMethod === 'pix' && orderId && (
            <PixPayment
              orderId={parseInt(orderId)}
              amount={orderData.amount}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          )}
          
          {selectedMethod === 'card' && (
            <div className="p-8 text-center text-gray-600">
              Pagamento com cartão em desenvolvimento
            </div>
          )}
        </div>

        {/* Informações de segurança */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <span className="font-medium">🔒 Pagamento seguro</span>
            <br />
            Seus dados estão protegidos. Utilizamos Mercado Pago para processar pagamentos PIX.
          </p>
        </div>
      </main>
    </div>
  );
}
