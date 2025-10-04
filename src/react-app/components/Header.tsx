import { Menu, User, LogOut, X, Download } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { useAuth } from '@getmocha/users-service/react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, redirectToLogin, logout } = useAuth();

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="container">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <div className="text-2xl lg:text-3xl font-black text-[var(--primary-dark)] tracking-tight">
                Salva Iguaba
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <Link 
                to="/" 
                className="text-[var(--text-light)] hover:text-[var(--primary-dark)] font-medium transition-colors uppercase text-sm tracking-wide"
              >
                Mapa
              </Link>
              <a 
                href="#how-it-works" 
                className="text-[var(--text-light)] hover:text-[var(--primary-dark)] font-medium transition-colors uppercase text-sm tracking-wide"
              >
                Como funciona
              </a>
              <a 
                href="#impact" 
                className="text-[var(--text-light)] hover:text-[var(--primary-dark)] font-medium transition-colors uppercase text-sm tracking-wide"
              >
                Impacto
              </a>
              <a 
                href="#for-business" 
                className="text-[var(--text-light)] hover:text-[var(--primary-dark)] font-medium transition-colors uppercase text-sm tracking-wide"
              >
                Para empresas
              </a>
              {user && (
                <>
                  <Link 
                    to="/my-orders" 
                    className="text-[var(--text-light)] hover:text-[var(--primary-dark)] font-medium transition-colors uppercase text-sm tracking-wide"
                  >
                    Meus Pedidos
                  </Link>
                  <Link 
                    to="/merchant" 
                    className="text-[var(--text-light)] hover:text-[var(--primary-dark)] font-medium transition-colors uppercase text-sm tracking-wide"
                  >
                    Painel Lojista
                  </Link>
                  <Link 
                    to="/register-establishment" 
                    className="text-[var(--text-light)] hover:text-[var(--primary-dark)] font-medium transition-colors uppercase text-sm tracking-wide"
                  >
                    Cadastrar Estabelecimento
                  </Link>
                </>
              )}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center gap-3 px-4 py-2 bg-[var(--beige-30)] rounded-full">
                    <div className="w-8 h-8 bg-[var(--highlight-green)] rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium text-[var(--primary-dark)] text-sm">
                      {user.google_user_data.given_name || user.email}
                    </span>
                  </div>
                  <button
                    onClick={() => logout()}
                    className="flex items-center gap-2 px-4 py-2 text-[var(--text-light)] hover:text-[var(--primary-dark)] border border-gray-300 rounded-full hover:bg-gray-50 transition-all duration-300"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="font-medium text-sm uppercase tracking-wide">Sair</span>
                  </button>
                </div>
              ) : (
                <>
                  <a 
                    href="#bags"
                    className="btn-primary flex items-center gap-2 px-6 py-3"
                  >
                    <Download className="w-4 h-4" />
                    <span>Ver bags</span>
                  </a>
                  <button
                    onClick={() => redirectToLogin()}
                    className="btn-secondary flex items-center gap-2 px-6 py-3"
                  >
                    <User className="w-4 h-4" />
                    <span>Entrar</span>
                  </button>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button 
              className="lg:hidden p-2 text-[var(--text-light)] hover:text-[var(--primary-dark)] transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsMenuOpen(false)} />
          
          <div className="absolute top-0 right-0 w-80 h-full bg-white shadow-xl">
            <div className="p-6 pt-24">
              <nav className="flex flex-col space-y-6 mb-8">
                <Link 
                  to="/" 
                  className="text-[var(--text-light)] hover:text-[var(--primary-dark)] font-medium transition-colors uppercase text-sm tracking-wide"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Mapa
                </Link>
                <a 
                  href="#how-it-works" 
                  className="text-[var(--text-light)] hover:text-[var(--primary-dark)] font-medium transition-colors uppercase text-sm tracking-wide"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Como funciona
                </a>
                <a 
                  href="#impact" 
                  className="text-[var(--text-light)] hover:text-[var(--primary-dark)] font-medium transition-colors uppercase text-sm tracking-wide"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Impacto
                </a>
                <a 
                  href="#for-business" 
                  className="text-[var(--text-light)] hover:text-[var(--primary-dark)] font-medium transition-colors uppercase text-sm tracking-wide"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Para empresas
                </a>
                
                {user && (
                  <>
                    <div className="border-t border-gray-200 pt-6">
                      <Link 
                        to="/my-orders" 
                        className="text-[var(--text-light)] hover:text-[var(--primary-dark)] font-medium transition-colors uppercase text-sm tracking-wide block"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Meus Pedidos
                      </Link>
                    </div>
                    <Link 
                      to="/merchant" 
                      className="text-[var(--text-light)] hover:text-[var(--primary-dark)] font-medium transition-colors uppercase text-sm tracking-wide"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Painel Lojista
                    </Link>
                    <Link 
                      to="/register-establishment" 
                      className="text-[var(--text-light)] hover:text-[var(--primary-dark)] font-medium transition-colors uppercase text-sm tracking-wide"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Cadastrar Estabelecimento
                    </Link>
                  </>
                )}
              </nav>
              
              {user ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-[var(--beige-30)] rounded-2xl">
                    <div className="w-10 h-10 bg-[var(--highlight-green)] rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-[var(--primary-dark)]">
                        {user.google_user_data.given_name || user.email}
                      </div>
                      <div className="text-sm text-[var(--text-light)]">Usuário ativo</div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 p-4 text-[var(--text-light)] hover:text-[var(--primary-dark)] border border-gray-300 rounded-2xl hover:bg-gray-50 transition-all duration-300"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium uppercase tracking-wide">Sair</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <a
                    href="#bags"
                    className="w-full btn-primary flex items-center gap-3 justify-center p-4"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Download className="w-5 h-5" />
                    <span>Ver bags</span>
                  </a>
                  
                  <button
                    onClick={() => {
                      redirectToLogin();
                      setIsMenuOpen(false);
                    }}
                    className="w-full btn-secondary flex items-center gap-3 justify-center p-4"
                  >
                    <User className="w-5 h-5" />
                    <span>Entrar</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
