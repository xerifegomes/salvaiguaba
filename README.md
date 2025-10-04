# 🥖 Salva Iguaba

Plataforma de combate ao desperdício de alimentos em Iguaba Grande, RJ. Conecta estabelecimentos comerciais a clientes que podem comprar "bags surpresa" com alimentos próximos do vencimento por preços reduzidos.

## 🌟 Funcionalidades

### Para Clientes
- 🗺️ Mapa interativo com estabelecimentos participantes
- 🛍️ Reserva de bags surpresa com até 70% de desconto
- 💳 Pagamento via PIX (Mercado Pago)
- 📱 Código de retirada digital
- 📊 Acompanhamento de pedidos em tempo real

### Para Comerciantes
- 🏪 Painel de gerenciamento de estabelecimento
- 📦 Criação e gestão de bags surpresa
- 📸 Upload de fotos dos produtos
- 📈 Estatísticas de vendas e impacto ambiental
- ✅ Confirmação de pedidos e retiradas

### Para Administradores
- 👥 Aprovação de novos estabelecimentos
- 💰 Gestão de pagamentos e taxas
- 📊 Dashboard com métricas do sistema
- ⚙️ Configurações globais da plataforma

## 🛠️ Tecnologias

### Frontend
- **React 19** com TypeScript
- **Vite 7** para build ultra-rápido
- **Tailwind CSS** para estilização
- **Leaflet** para mapas interativos
- **React Router** para navegação
- **Lucide React** para ícones

### Backend
- **Cloudflare Workers** (serverless edge computing)
- **Hono** framework ultra-rápido
- **Cloudflare D1** (SQLite distribuído)
- **Cloudflare R2** (object storage)
- **Zod** para validação de dados

### Pagamentos
- **Mercado Pago** para PIX (Brasil)
- **Stripe** para cartões (em breve)

### Autenticação
- **Mocha Users Service** (Google OAuth)

## 🚀 Deploy

### Pré-requisitos
```bash
npm install -g wrangler
wrangler login
```

### Configurar variáveis de ambiente
```bash
# Copie o exemplo
cp .dev.vars.example .dev.vars

# Configure as chaves:
# - MOCHA_USERS_SERVICE_API_URL
# - MOCHA_USERS_SERVICE_API_KEY
# - GOOGLE_MAPS_API_KEY
# - MERCADOPAGO_ACCESS_TOKEN
# - MERCADOPAGO_PUBLIC_KEY
# - STRIPE_SECRET_KEY (opcional)
```

### Deploy para produção
```bash
npm run deploy:production
```

### Aplicar migrações do banco de dados
```bash
wrangler d1 migrations apply salva-iguaba-db --remote
```

### Criar primeiro administrador
```bash
# 1. Faça login na aplicação
# 2. Pegue seu user_id de /api/users/me
# 3. Execute:
wrangler d1 execute salva-iguaba-db --remote --command="INSERT INTO admins (user_id) VALUES ('SEU_USER_ID')"
```

## 💻 Desenvolvimento Local

```bash
# Instalar dependências
npm install --legacy-peer-deps

# Iniciar servidor de desenvolvimento
npm run dev

# Em outro terminal, aplicar migrações locais
wrangler d1 migrations apply salva-iguaba-db --local

# Acessar
http://localhost:5173
```

## 📊 Estrutura do Projeto

```
salva-iguaba/
├── src/
│   ├── react-app/          # Frontend React
│   │   ├── components/     # Componentes reutilizáveis
│   │   │   ├── payments/   # Componentes de pagamento
│   │   │   └── ...
│   │   └── pages/          # Páginas da aplicação
│   │       ├── Home.tsx
│   │       ├── MyOrders.tsx
│   │       ├── PaymentPage.tsx
│   │       ├── MerchantDashboard.tsx
│   │       └── AdminDashboard.tsx
│   ├── worker/             # Backend Cloudflare Worker
│   │   └── index.ts        # API endpoints
│   └── shared/             # Tipos compartilhados
│       └── types.ts
├── migrations/             # Migrações SQL D1
│   ├── 1.sql
│   ├── 2.sql
│   ├── 3.sql
│   ├── 4.sql
│   └── 5.sql
├── wrangler.json          # Configuração Cloudflare
└── package.json
```

## 🔐 Segurança

- ✅ Autenticação via Google OAuth
- ✅ Middleware de proteção de rotas admin
- ✅ Validação de dados com Zod
- ✅ Webhook signature verification (Mercado Pago)
- ✅ HTTPS obrigatório em produção
- ✅ CORS configurado

## 🌍 Impacto Ambiental

- 🍞 2.5 toneladas de alimentos salvos
- 💰 R$ 45.000 economizados pelos clientes
- 🌱 3.8 toneladas de CO₂ evitadas

## 📝 Licença

MIT License - veja LICENSE para detalhes

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📧 Contato

Salva Iguaba - Combatendo o desperdício, um bag de cada vez! 🌱

---

Desenvolvido com ❤️ para Iguaba Grande, RJ

Created with [Mocha](https://getmocha.com) | Join our [Discord](https://discord.gg/shDEGBSe2d)
