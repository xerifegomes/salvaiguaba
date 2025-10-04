import { useState, useEffect } from 'react';
import { QrCode, Copy, CheckCircle, Clock, XCircle } from 'lucide-react';

interface PixPaymentProps {
  orderId: number;
  amount: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface PaymentResponse {
  success: boolean;
  payment_id: number;
  mercadopago_id: string;
  qr_code: string;
  qr_code_base64: string;
  status: string;
}

export default function PixPayment({ orderId, amount, onSuccess, onError }: PixPaymentProps) {
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'completed' | 'failed'>('pending');
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  // Criar pagamento PIX
  const createPixPayment = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/payments/pix/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId,
          amount,
          description: `Pedido #${orderId} - Salva Iguaba`
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao criar pagamento');
      }

      const data: PaymentResponse = await response.json();
      setPaymentData(data);
      startPolling(data.payment_id);
    } catch (error: any) {
      console.error('Erro ao criar pagamento PIX:', error);
      onError?.(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Verificar status do pagamento
  const checkPaymentStatus = async (paymentId: number) => {
    try {
      const response = await fetch(`/api/payments/${paymentId}/status`);
      if (response.ok) {
        const data = await response.json();
        setPaymentStatus(data.status);
        
        if (data.status === 'completed') {
          stopPolling();
          onSuccess?.();
        } else if (data.status === 'failed') {
          stopPolling();
          onError?.('Pagamento falhou');
        }
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error);
    }
  };

  // Iniciar polling para verificar status
  const startPolling = (paymentId: number) => {
    const interval = setInterval(() => {
      checkPaymentStatus(paymentId);
    }, 3000); // Verificar a cada 3 segundos
    setPollingInterval(interval);
  };

  // Parar polling
  const stopPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  };

  // Copiar código PIX
  const copyPixCode = () => {
    if (paymentData?.qr_code) {
      navigator.clipboard.writeText(paymentData.qr_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Limpar polling ao desmontar
  useEffect(() => {
    return () => stopPolling();
  }, []);

  // Criar pagamento ao montar componente
  useEffect(() => {
    createPixPayment();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
        <p className="text-gray-600">Gerando pagamento PIX...</p>
      </div>
    );
  }

  if (!paymentData) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <XCircle className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-gray-600">Erro ao gerar pagamento</p>
        <button
          onClick={createPixPayment}
          className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Status do pagamento */}
      <div className="text-center mb-6">
        {paymentStatus === 'pending' && (
          <div className="flex items-center justify-center gap-2 text-yellow-600">
            <Clock className="h-5 w-5 animate-pulse" />
            <span className="font-medium">Aguardando pagamento...</span>
          </div>
        )}
        {paymentStatus === 'completed' && (
          <div className="flex items-center justify-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Pagamento confirmado!</span>
          </div>
        )}
        {paymentStatus === 'failed' && (
          <div className="flex items-center justify-center gap-2 text-red-600">
            <XCircle className="h-5 w-5" />
            <span className="font-medium">Pagamento falhou</span>
          </div>
        )}
      </div>

      {/* Valor */}
      <div className="text-center mb-6">
        <p className="text-gray-600 text-sm mb-1">Valor a pagar</p>
        <p className="text-3xl font-bold text-gray-900">
          R$ {amount.toFixed(2)}
        </p>
      </div>

      {paymentStatus === 'pending' && (
        <>
          {/* QR Code */}
          <div className="bg-white p-4 rounded-lg border-2 border-gray-200 mb-6">
            <div className="flex items-center justify-center mb-3">
              <QrCode className="h-5 w-5 text-orange-500 mr-2" />
              <span className="font-medium text-gray-900">Escaneie o QR Code</span>
            </div>
            {paymentData.qr_code_base64 && (
              <img
                src={`data:image/png;base64,${paymentData.qr_code_base64}`}
                alt="QR Code PIX"
                className="mx-auto w-64 h-64"
              />
            )}
          </div>

          {/* Código PIX Copia e Cola */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-2 text-center">
              Ou copie o código PIX
            </p>
            <div className="relative">
              <input
                type="text"
                value={paymentData.qr_code}
                readOnly
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg text-sm font-mono bg-gray-50"
              />
              <button
                onClick={copyPixCode}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-200 rounded-lg transition-colors"
                title="Copiar código"
              >
                {copied ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <Copy className="h-5 w-5 text-gray-600" />
                )}
              </button>
            </div>
            {copied && (
              <p className="text-sm text-green-600 mt-2 text-center">
                Código copiado!
              </p>
            )}
          </div>

          {/* Instruções */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Como pagar:</h4>
            <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
              <li>Abra o app do seu banco</li>
              <li>Escolha pagar com PIX</li>
              <li>Escaneie o QR Code ou cole o código</li>
              <li>Confirme o pagamento</li>
            </ol>
            <p className="text-xs text-gray-600 mt-3">
              O pagamento será confirmado automaticamente em alguns segundos.
            </p>
          </div>
        </>
      )}

      {paymentStatus === 'completed' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Pagamento confirmado!
          </h3>
          <p className="text-gray-600">
            Seu pedido foi confirmado e está pronto para retirada.
          </p>
        </div>
      )}

      {paymentStatus === 'failed' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Pagamento não aprovado
          </h3>
          <p className="text-gray-600 mb-4">
            Houve um problema com seu pagamento. Tente novamente.
          </p>
          <button
            onClick={createPixPayment}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium"
          >
            Gerar novo PIX
          </button>
        </div>
      )}
    </div>
  );
}
