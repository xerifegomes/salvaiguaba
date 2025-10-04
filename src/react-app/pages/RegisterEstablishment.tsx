import { useState } from 'react';
import { useAuth } from '@getmocha/users-service/react';
import { useNavigate } from 'react-router';
import { Store, MapPin, Phone, Check, AlertCircle } from 'lucide-react';
import Header from '@/react-app/components/Header';
import ImageUpload from '@/react-app/components/ImageUpload';
import { IGUABA_GRANDE_CENTER } from '@/shared/types';

export default function RegisterEstablishment() {
  const { user, isPending, redirectToLogin } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: 'padaria' as const,
    address: '',
    latitude: IGUABA_GRANDE_CENTER.lat,
    longitude: IGUABA_GRANDE_CENTER.lng,
    phone: '',
    logo_url: ''
  });

  const categories = [
    { id: 'padaria', name: 'Padaria', emoji: '🥖' },
    { id: 'restaurante', name: 'Restaurante', emoji: '🍽️' },
    { id: 'mercado', name: 'Mercado', emoji: '🛒' },
    { id: 'lanchonete', name: 'Lanchonete', emoji: '🍔' },
    { id: 'cafeteria', name: 'Cafeteria', emoji: '☕' },
    { id: 'pizzaria', name: 'Pizzaria', emoji: '🍕' }
  ];

  // Geocoding usando a API do backend
  const geocodeAddress = async (address: string) => {
    try {
      const response = await fetch('/api/geocode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address })
      });

      if (!response.ok) {
        throw new Error('Erro ao geocodificar endereço');
      }

      const data = await response.json();
      return { lat: data.lat, lng: data.lng };
    } catch (error) {
      console.error('Erro no geocoding:', error);
      // Fallback para centro de Iguaba Grande
      return { lat: IGUABA_GRANDE_CENTER.lat, lng: IGUABA_GRANDE_CENTER.lng };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      redirectToLogin();
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Geocode do endereço
      const coords = await geocodeAddress(formData.address);

      const response = await fetch('/api/establishments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          category: formData.category,
          address: formData.address,
          latitude: coords.lat,
          longitude: coords.lng,
          phone: formData.phone || undefined,
          logo_url: formData.logo_url || undefined,
          is_active: true
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao cadastrar estabelecimento');
      }

      setSuccess(true);
      
      // Redirecionar para o dashboard após 2 segundos
      setTimeout(() => {
        navigate('/merchant');
      }, 2000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar estabelecimento');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-light)]">
        <div className="animate-spin w-12 h-12 border-4 border-[var(--primary-dark)] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--bg-light)]">
        <Header />
        <main className="pt-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
            <AlertCircle className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h1 className="text-4xl font-black text-[var(--primary-dark)] mb-4">
              Login Necessário
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Você precisa estar logado para cadastrar um estabelecimento.
            </p>
            <button
              onClick={() => redirectToLogin()}
              className="bg-[var(--highlight-green)] hover:bg-green-600 text-white font-bold py-4 px-8 rounded-2xl transition-colors text-lg"
            >
              Fazer Login
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[var(--bg-light)]">
        <Header />
        <main className="pt-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-4xl font-black text-[var(--primary-dark)] mb-4">
              Estabelecimento Cadastrado! 🎉
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Seu estabelecimento foi cadastrado com sucesso. Redirecionando para o painel...
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-light)]">
      <Header />
      
      <main className="pt-20 pb-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-[var(--primary-dark)] to-[var(--primary-teal)] text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Store className="w-20 h-20 mx-auto mb-6 opacity-90" />
            <h1 className="text-4xl lg:text-5xl font-black mb-4 uppercase">
              Cadastre Seu Estabelecimento
            </h1>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto">
              Comece a vender bags surpresa e ajude a combater o desperdício alimentar em Iguaba Grande
            </p>
          </div>
        </section>

        {/* Form Section */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
          <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nome do Estabelecimento */}
              <div>
                <label className="block text-sm font-bold text-[var(--primary-dark)] mb-2 uppercase tracking-wide">
                  Nome do Estabelecimento *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Padaria Central Iguaba"
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[var(--primary-teal)] focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Categoria */}
              <div>
                <label className="block text-sm font-bold text-[var(--primary-dark)] mb-3 uppercase tracking-wide">
                  Categoria *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: category.id as any })}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                        formData.category === category.id
                          ? 'border-[var(--primary-teal)] bg-[var(--beige-30)] shadow-lg'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="text-3xl mb-2">{category.emoji}</div>
                      <div className="text-sm font-semibold text-[var(--primary-dark)]">
                        {category.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Endereço */}
              <div>
                <label className="block text-sm font-bold text-[var(--primary-dark)] mb-2 uppercase tracking-wide">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Endereço Completo *
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Rua Principal, 123 - Centro, Iguaba Grande - RJ"
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[var(--primary-teal)] focus:border-transparent transition-all"
                  required
                />
                <p className="text-sm text-gray-500 mt-2">
                  Inclua rua, número, bairro e cidade
                </p>
              </div>

              {/* Telefone */}
              <div>
                <label className="block text-sm font-bold text-[var(--primary-dark)] mb-2 uppercase tracking-wide">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Telefone (Opcional)
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(22) 99999-9999"
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[var(--primary-teal)] focus:border-transparent transition-all"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Para clientes entrarem em contato
                </p>
              </div>

              {/* Upload de Logo */}
              <ImageUpload
                label="Logo do Estabelecimento (Opcional)"
                onUploadComplete={(url) => setFormData({ ...formData, logo_url: url })}
                onError={(error) => setError(error)}
                currentImage={formData.logo_url}
                uploadPath="logos/"
                maxSizeMB={2}
              />

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">Sobre a localização:</p>
                    <p>
                      As coordenadas do seu estabelecimento serão calculadas automaticamente 
                      com base no endereço fornecido para exibição no mapa.
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-[var(--primary-dark)] to-[var(--primary-teal)] hover:from-[var(--primary-teal)] hover:to-[var(--primary-dark)] text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg uppercase tracking-wide"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Cadastrando...</span>
                    </div>
                  ) : (
                    'Cadastrar Estabelecimento'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Benefits Section */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💰</span>
              </div>
              <h3 className="font-bold text-lg text-[var(--primary-dark)] mb-2">
                Reduza Desperdício
              </h3>
              <p className="text-sm text-gray-600">
                Venda produtos que iriam para o lixo e gere receita extra
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🌍</span>
              </div>
              <h3 className="font-bold text-lg text-[var(--primary-dark)] mb-2">
                Ajude o Planeta
              </h3>
              <p className="text-sm text-gray-600">
                Contribua para um futuro mais sustentável
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">👥</span>
              </div>
              <h3 className="font-bold text-lg text-[var(--primary-dark)] mb-2">
                Novos Clientes
              </h3>
              <p className="text-sm text-gray-600">
                Alcance pessoas que valorizam sustentabilidade
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
