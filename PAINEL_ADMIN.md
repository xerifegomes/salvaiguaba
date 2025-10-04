# Sistema de 3 Painéis - Salva Iguaba

## ✅ Painéis Implementados

### 1. 🛍️ Painel do Cliente (`/my-orders`)
**Usuários**: Consumidores que compram bags
**Funcionalidades**:
- Ver histórico de pedidos
- Acompanhar status dos pedidos
- Ver códigos de retirada
- Detalhes de cada bag comprada

### 2. 🏪 Painel do Lojista (`/merchant`)
**Usuários**: Donos de estabelecimentos
**Funcionalidades**:
- Cadastrar estabelecimento
- Criar e gerenciar bags
- Ver pedidos recebidos
- Estatísticas de vendas
- Upload de logo e fotos das bags
- Aguardar aprovação do admin

### 3. 🔐 Painel Administrativo (`/admin`)
**Usuários**: Administradores da plataforma
**Funcionalidades**:
- ✅ Dashboard com estatísticas globais
- ✅ Aprovar/Rejeitar estabelecimentos
- ✅ Visualizar todos os pedidos
- ✅ Gerenciar pagamentos (em desenvolvimento)
- ✅ Configurações do sistema (em desenvolvimento)
- ✅ Controle total da plataforma

---

## 🚀 Como Criar o Primeiro Administrador

### Método 1: Via Wrangler D1 (Recomendado)

1. **Obter o ID do usuário**:
   - Faça login na plataforma com sua conta Google
   - Acesse o console do navegador (F12)
   - Execute: `fetch('/api/users/me').then(r => r.json()).then(console.log)`
   - Copie o valor do campo `id`

2. **Adicionar como admin**:
```bash
# No terminal, execute:
npx wrangler d1 execute salva-iguaba-db --local --command="INSERT INTO admins (user_id) VALUES ('SEU_USER_ID_AQUI')"

# Exemplo:
npx wrangler d1 execute salva-iguaba-db --local --command="INSERT INTO admins (user_id) VALUES ('google-oauth2|123456789')"
```

3. **Verificar**:
```bash
npx wrangler d1 execute salva-iguaba-db --local --command="SELECT * FROM admins"
```

4. **Acessar o painel**:
   - Vá para: `http://localhost:5173/admin`
   - O sistema verificará automaticamente suas permissões

### Método 2: Via SQL Direto

1. **Executar migration**:
```bash
# Primeiro, aplique a migration 5
npx wrangler d1 execute salva-iguaba-db --local --file=./migrations/5.sql
```

2. **Inserir admin**:
```bash
npx wrangler d1 execute salva-iguaba-db --local --command="INSERT INTO admins (user_id) VALUES ('SEU_USER_ID_AQUI')"
```

### Método 3: Criar Admin via API (após ter 1 admin)

Se você já é admin, pode adicionar outros admins via API:

```javascript
// No console do navegador (estando logado como admin)
fetch('/api/admin/admins', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ user_id: 'USER_ID_DO_NOVO_ADMIN' })
}).then(r => r.json()).then(console.log)
```

---

## 📊 Endpoints Admin Implementados

### Estatísticas
```
GET /api/admin/stats
```
Retorna estatísticas globais da plataforma

### Estabelecimentos
```
GET /api/admin/establishments?status=pending|approved|rejected|all
PUT /api/admin/establishments/:id/approve
PUT /api/admin/establishments/:id/reject
```

### Pedidos
```
GET /api/admin/orders?status=all|pending|confirmed|completed
```

### Pagamentos
```
GET /api/admin/payments?status=all|pending|completed
PUT /api/admin/payments/:id/status
```

### Configurações
```
GET /api/admin/settings
PUT /api/admin/settings/:key
```

### Gerenciar Admins
```
GET /api/admin/admins
POST /api/admin/admins
GET /api/admin/check (verifica se usuário atual é admin)
```

---

## 🔒 Segurança

### Middleware de Admin
Todo endpoint `/api/admin/*` é protegido por:
1. ✅ `authMiddleware` - Verifica se usuário está autenticado
2. ✅ `adminMiddleware` - Verifica se usuário está na tabela `admins`

### Fluxo de Aprovação
1. Lojista se cadastra e cria estabelecimento
2. Status inicial: `approval_status = 'pending'`
3. Admin aprova ou rejeita via painel admin
4. Apenas estabelecimentos aprovados aparecem na plataforma pública

---

## 💾 Estrutura do Banco de Dados

### Tabela `admins`
```sql
CREATE TABLE admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_by TEXT
);
```

### Campos Adicionados em `establishments`
```sql
approval_status TEXT DEFAULT 'pending' 
  CHECK (approval_status IN ('pending', 'approved', 'rejected'))
```

### Tabela `payments` (preparada para o futuro)
```sql
CREATE TABLE payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  transaction_id TEXT,
  pix_qr_code TEXT,
  pix_code TEXT,
  ...
);
```

### Tabela `system_settings`
```sql
CREATE TABLE system_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  description TEXT,
  ...
);
```

Configurações padrão:
- `platform_fee_percentage`: 10%
- `min_bag_price`: R$ 5
- `max_bag_price`: R$ 100
- `auto_approve_merchants`: false

---

## 🎯 Próximos Passos

### Funcionalidades a Implementar:
1. ✅ Sistema de aprovação (FEITO)
2. ⏳ Integração de pagamento com PIX
3. ⏳ Dashboard de analytics com gráficos
4. ⏳ Sistema de notificações
5. ⏳ Relatórios exportáveis (PDF/Excel)
6. ⏳ Página de edição de estabelecimento
7. ⏳ Sistema de transferência de propriedade
8. ⏳ Comparação de estabelecimentos

---

## 🐛 Troubleshooting

### Erro: "Acesso negado. Apenas administradores."
- Verifique se seu `user_id` está na tabela `admins`
- Execute: `SELECT * FROM admins WHERE user_id = 'SEU_ID'`

### Painel admin não carrega
- Verifique se a migration 5 foi aplicada
- Execute: `npx wrangler d1 execute salva-iguaba-db --local --file=./migrations/5.sql`

### Estabelecimento não aparece após criar
- Verifique se está com `approval_status = 'approved'`
- Admin precisa aprovar via painel `/admin`

---

## 📞 Contato

Para suporte ou dúvidas sobre o sistema de administração, consulte a documentação completa ou entre em contato com a equipe de desenvolvimento.

**Versão**: 1.0.0  
**Última Atualização**: 3 de outubro de 2025
