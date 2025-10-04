import { useState } from 'react';
import { X, MapPin, Clock, Package, Star, Minus, Plus } from 'lucide-react';
import { useAuth } from '@getmocha/users-service/react';
import { type BagWithEstablishment } from '@/shared/types';

interface BagModalProps {
  bag: BagWithEstablishment | null;
  isOpen: boolean;
  onClose: () => void;
  onReserve: (bagId: number, quantity: number) => Promise<void>;
}

export default function BagModal({ bag, isOpen, onClose, onReserve }: BagModalProps) {
  const { user, redirectToLogin } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [isReserving, setIsReserving] = useState(false);

  if (!isOpen || !bag) return null;

  const totalPrice = bag.price * quantity;
  const savings = bag.original_price ? (bag.original_price * quantity) - totalPrice : 0;

  const handleReserve = async () => {
    if (!user) {
      redirectToLogin();
      return;
    }

    setIsReserving(true);
    try {
      await onReserve(bag.id, quantity);
      onClose();
    } catch (error) {
      console.error('Erro ao reservar:', error);
    } finally {
      setIsReserving(false);
    }
  };

  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case 'padaria': return '🥖';
      case 'restaurante': return '🍽️';
      case 'mercado': return '🛒';
      case 'lanchonete': return '🍔';
      case 'cafeteria': return '☕';
      case 'pizzaria': return '🍕';
      default: return '🍴';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-[var(--highlight-green)] rounded-2xl flex items-center justify-center text-2xl">
                {getCategoryEmoji(bag.establishment?.category || '')}
              </div>
              <div>
                <h2 className="text-2xl font-black text-[var(--primary-dark)]">
                  {bag.establishment?.name}
                </h2>
                <div className="flex items-center gap-2 text-[var(--text-light)] mt-1">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{bag.establishment?.address}</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Bag Hero Section */}
          <div className="bg-gradient-to-br from-[var(--beige-30)] to-white rounded-2xl p-6 mb-6 border border-gray-100">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-black text-[var(--primary-dark)] mb-2">{bag.name}</h3>
                {bag.description && (
                  <p className="text-[var(--text-light)] mb-4 leading-relaxed">{bag.description}</p>
                )}
              </div>
              
              <div className="flex items-center gap-1 bg-[var(--highlight-orange)] text-white px-3 py-1 rounded-full text-sm font-semibold">
                <Star className="w-4 h-4 fill-current" />
                <span>4.8</span>
              </div>
            </div>
            
            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100">
                <Clock className="w-5 h-5 text-[var(--primary-teal)]" />
                <div>
                  <div className="text-sm font-semibold text-[var(--primary-dark)]">Horário de retirada</div>
                  <div className="text-sm text-[var(--text-light)]">
                    {bag.pickup_start_time} - {bag.pickup_end_time}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100">
                <Package className="w-5 h-5 text-[var(--highlight-green)]" />
                <div>
                  <div className="text-sm font-semibold text-[var(--primary-dark)]">Disponível</div>
                  <div className="text-sm text-[var(--text-light)]">
                    {bag.quantity_available} unidades
                  </div>
                </div>
              </div>
            </div>

            {/* Price Section */}
            <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100">
              <div>
                <div className="text-3xl font-black text-[var(--highlight-green)]">
                  R$ {bag.price.toFixed(2)}
                </div>
                {bag.original_price && (
                  <div className="text-sm text-[var(--text-light)] line-through">
                    De R$ {bag.original_price.toFixed(2)}
                  </div>
                )}
              </div>
              
              <div className="text-right">
                <div className="text-sm text-[var(--text-light)]">Categoria</div>
                <div className="font-semibold capitalize text-[var(--primary-dark)]">{bag.establishment?.category}</div>
              </div>
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="bg-[var(--beige-30)] rounded-2xl p-6 mb-6">
            <h4 className="text-lg font-bold text-[var(--primary-dark)] mb-4">Selecione a quantidade</h4>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="w-12 h-12 rounded-full bg-white border-2 border-gray-200 hover:border-[var(--primary-teal)] flex items-center justify-center font-bold text-[var(--primary-dark)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Minus className="w-5 h-5" />
                </button>
                
                <div className="text-center min-w-[3ch]">
                  <div className="text-3xl font-black text-[var(--primary-dark)]">{quantity}</div>
                  <div className="text-sm text-[var(--text-light)]">unidade{quantity !== 1 ? 's' : ''}</div>
                </div>
                
                <button
                  onClick={() => setQuantity(Math.min(bag.quantity_available, quantity + 1))}
                  disabled={quantity >= bag.quantity_available}
                  className="w-12 h-12 rounded-full bg-white border-2 border-gray-200 hover:border-[var(--primary-teal)] flex items-center justify-center font-bold text-[var(--primary-dark)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-[var(--text-light)]">Máximo disponível</div>
                <div className="font-bold text-[var(--primary-dark)]">{bag.quantity_available}</div>
              </div>
            </div>
          </div>

          {/* Price Summary */}
          <div className="bg-[var(--primary-dark)] text-white rounded-2xl p-6 mb-6">
            <h4 className="text-lg font-bold mb-4">Resumo do pedido</h4>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Subtotal ({quantity}x):</span>
                <span className="font-bold">R$ {totalPrice.toFixed(2)}</span>
              </div>
              
              {savings > 0 && (
                <div className="flex justify-between items-center text-[var(--highlight-green)]">
                  <span>Você economiza:</span>
                  <span className="font-bold">R$ {savings.toFixed(2)}</span>
                </div>
              )}
              
              <div className="border-t border-white/20 pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold">Total:</span>
                  <span className="text-3xl font-black">R$ {totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            {user ? (
              <button
                onClick={handleReserve}
                disabled={isReserving || bag.quantity_available === 0}
                className="w-full bg-[var(--highlight-green)] hover:bg-[var(--primary-teal)] text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg uppercase tracking-wide"
              >
                {isReserving ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Reservando...</span>
                  </div>
                ) : (
                  'Reservar bag surpresa'
                )}
              </button>
            ) : (
              <button
                onClick={() => redirectToLogin()}
                className="w-full bg-[var(--primary-dark)] hover:bg-[var(--primary-teal)] text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-lg uppercase tracking-wide"
              >
                Entrar para reservar
              </button>
            )}
            
            <button
              onClick={onClose}
              className="w-full border-2 border-gray-300 text-[var(--text-light)] hover:text-[var(--primary-dark)] font-semibold py-3 px-6 rounded-2xl hover:bg-gray-50 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
