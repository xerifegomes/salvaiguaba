import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { cors } from "hono/cors";
import { 
  authMiddleware,
  getOAuthRedirectUrl,
  exchangeCodeForSessionToken,
  deleteSession,
  MOCHA_SESSION_TOKEN_COOKIE_NAME 
} from "@getmocha/users-service/backend";
import { setCookie, getCookie } from "hono/cookie";
import {
  CreateEstablishmentSchema,
  CreateBagSchema,
  CreateOrderSchema,
  UpdateBagSchema,
  type Establishment,
  type Bag,
  type BagWithEstablishment,
  type OrderWithDetails
} from "@/shared/types";
import { MercadoPagoConfig, Payment } from 'mercadopago';

const app = new Hono<{ Bindings: Env }>();

app.use("*", cors());

// Middleware para verificar se é admin
async function adminMiddleware(c: any, next: any) {
  const user = c.get("user");
  
  if (!user) {
    return c.json({ error: 'Autenticação necessária' }, 401);
  }
  
  // Verificar se o usuário é admin
  const admin = await c.env.DB.prepare(`
    SELECT * FROM admins WHERE user_id = ?
  `).bind(user.id).first();
  
  if (!admin) {
    return c.json({ error: 'Acesso negado. Apenas administradores.' }, 403);
  }
  
  await next();
}

// Auth endpoints
app.get('/api/oauth/google/redirect_url', async (c) => {
  const redirectUrl = await getOAuthRedirectUrl('google', {
    apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
    apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
  });

  return c.json({ redirectUrl }, 200);
});

app.post("/api/sessions", zValidator("json", z.object({
  code: z.string()
})), async (c) => {
  const body = await c.req.json();

  if (!body.code) {
    return c.json({ error: "Código de autorização não fornecido" }, 400);
  }

  const sessionToken = await exchangeCodeForSessionToken(body.code, {
    apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
    apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
  });

  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: true,
    maxAge: 60 * 24 * 60 * 60, // 60 dias
  });

  return c.json({ success: true }, 200);
});

app.get("/api/users/me", authMiddleware, async (c) => {
  return c.json(c.get("user"));
});

app.get('/api/logout', async (c) => {
  const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);

  if (typeof sessionToken === 'string') {
    await deleteSession(sessionToken, {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
    });
  }

  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, '', {
    httpOnly: true,
    path: '/',
    sameSite: 'none',
    secure: true,
    maxAge: 0,
  });

  return c.json({ success: true }, 200);
});

// Função auxiliar para gerar código de retirada
function generatePickupCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Estabelecimentos endpoints
app.get('/api/establishments', async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT * FROM establishments 
    WHERE is_active = 1 
    ORDER BY name ASC
  `).all();
  
  return c.json(results as Establishment[]);
});

app.get('/api/establishments/:id', async (c) => {
  const id = c.req.param('id');
  const result = await c.env.DB.prepare(`
    SELECT * FROM establishments WHERE id = ? AND is_active = 1
  `).bind(id).first();
  
  if (!result) {
    return c.json({ error: 'Estabelecimento não encontrado' }, 404);
  }
  
  return c.json(result as Establishment);
});

app.post('/api/establishments', authMiddleware, zValidator("json", CreateEstablishmentSchema), async (c) => {
  const user = c.get("user");
  const data = c.req.valid("json");
  
  const result = await c.env.DB.prepare(`
    INSERT INTO establishments (name, category, address, latitude, longitude, phone, logo_url, owner_user_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    data.name,
    data.category,
    data.address,
    data.latitude,
    data.longitude,
    data.phone || null,
    data.logo_url || null,
    user?.id || null
  ).run();
  
  return c.json({ id: result.meta.last_row_id, success: true }, 201);
});

// Bags endpoints
app.get('/api/bags', async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT 
      b.*,
      e.name as establishment_name,
      e.category as establishment_category,
      e.address as establishment_address,
      e.latitude as establishment_latitude,
      e.longitude as establishment_longitude
    FROM bags b
    JOIN establishments e ON b.establishment_id = e.id
    WHERE b.is_active = 1 
      AND e.is_active = 1
      AND b.quantity_available > 0
      AND b.pickup_date >= date('now')
    ORDER BY b.pickup_date ASC, b.pickup_start_time ASC
  `).all();
  
  const bagsWithEstablishment: BagWithEstablishment[] = results.map((row: any) => ({
    ...row,
    establishment: {
      id: row.establishment_id,
      name: row.establishment_name,
      category: row.establishment_category,
      address: row.establishment_address,
      latitude: row.establishment_latitude,
      longitude: row.establishment_longitude,
      is_active: true,
      created_at: '',
      updated_at: ''
    }
  }));
  
  return c.json(bagsWithEstablishment);
});

app.get('/api/establishments/:establishmentId/bags', async (c) => {
  const establishmentId = c.req.param('establishmentId');
  const { results } = await c.env.DB.prepare(`
    SELECT * FROM bags 
    WHERE establishment_id = ? AND is_active = 1
    ORDER BY pickup_date DESC, pickup_start_time DESC
  `).bind(establishmentId).all();
  
  return c.json(results as Bag[]);
});

app.post('/api/bags', authMiddleware, zValidator("json", CreateBagSchema), async (c) => {
  const data = c.req.valid("json");
  
  const result = await c.env.DB.prepare(`
    INSERT INTO bags (
      establishment_id, name, description, price, original_price,
      quantity_available, pickup_start_time, pickup_end_time, pickup_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    data.establishment_id,
    data.name,
    data.description || null,
    data.price,
    data.original_price || null,
    data.quantity_available,
    data.pickup_start_time,
    data.pickup_end_time,
    data.pickup_date
  ).run();
  
  return c.json({ id: result.meta.last_row_id, success: true }, 201);
});

app.put('/api/bags/:id', authMiddleware, zValidator("json", UpdateBagSchema), async (c) => {
  const user = c.get("user");
  const id = c.req.param('id');
  const data = c.req.valid("json");
  
  // Verificar ownership
  const bag = await c.env.DB.prepare(`
    SELECT b.*, e.owner_user_id 
    FROM bags b
    JOIN establishments e ON b.establishment_id = e.id
    WHERE b.id = ?
  `).bind(id).first() as any;
  
  if (!bag) {
    return c.json({ error: 'Bag não encontrada' }, 404);
  }
  
  if (bag.owner_user_id !== user?.id) {
    return c.json({ error: 'Você não tem permissão para editar esta bag' }, 403);
  }
  
  const updates = [];
  const values = [];
  
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      updates.push(`${key} = ?`);
      values.push(value);
    }
  }
  
  if (updates.length === 0) {
    return c.json({ error: 'Nenhum campo para atualizar' }, 400);
  }
  
  updates.push('updated_at = ?');
  values.push(new Date().toISOString());
  values.push(id);
  
  await c.env.DB.prepare(`
    UPDATE bags SET ${updates.join(', ')} WHERE id = ?
  `).bind(...values).run();
  
  return c.json({ success: true });
});

app.delete('/api/bags/:id', authMiddleware, async (c) => {
  const user = c.get("user");
  const id = c.req.param('id');
  
  // Verificar ownership
  const bag = await c.env.DB.prepare(`
    SELECT b.*, e.owner_user_id 
    FROM bags b
    JOIN establishments e ON b.establishment_id = e.id
    WHERE b.id = ?
  `).bind(id).first() as any;
  
  if (!bag) {
    return c.json({ error: 'Bag não encontrada' }, 404);
  }
  
  if (bag.owner_user_id !== user?.id) {
    return c.json({ error: 'Você não tem permissão para deletar esta bag' }, 403);
  }
  
  await c.env.DB.prepare(`
    UPDATE bags SET is_active = 0, updated_at = ? WHERE id = ?
  `).bind(new Date().toISOString(), id).run();
  
  return c.json({ success: true });
});

// Orders endpoints
app.get('/api/orders/my', authMiddleware, async (c) => {
  const user = c.get("user");
  const { results } = await c.env.DB.prepare(`
    SELECT 
      o.*,
      b.name as bag_name,
      b.price as bag_price,
      b.pickup_start_time,
      b.pickup_end_time,
      b.pickup_date,
      e.name as establishment_name,
      e.address as establishment_address,
      e.phone as establishment_phone
    FROM orders o
    JOIN bags b ON o.bag_id = b.id
    JOIN establishments e ON b.establishment_id = e.id
    WHERE o.customer_user_id = ?
    ORDER BY o.created_at DESC
  `).bind(user?.id).all();
  
  return c.json(results as OrderWithDetails[]);
});

app.post('/api/orders', authMiddleware, zValidator("json", CreateOrderSchema), async (c) => {
  const user = c.get("user");
  const data = c.req.valid("json");
  
  // Verificar disponibilidade da bag
  const bag = await c.env.DB.prepare(`
    SELECT * FROM bags WHERE id = ? AND is_active = 1 AND quantity_available >= ?
  `).bind(data.bag_id, data.quantity).first() as Bag;
  
  if (!bag) {
    return c.json({ error: 'Bag não disponível ou quantidade insuficiente' }, 400);
  }
  
  const pickupCode = generatePickupCode();
  
  // Criar pedido
  const orderResult = await c.env.DB.prepare(`
    INSERT INTO orders (
      bag_id, customer_user_id, quantity, total_price, 
      payment_method, pickup_code
    ) VALUES (?, ?, ?, ?, ?, ?)
  `).bind(
    data.bag_id,
    user?.id,
    data.quantity,
    data.total_price,
    data.payment_method,
    pickupCode
  ).run();
  
  // Reduzir quantidade disponível
  await c.env.DB.prepare(`
    UPDATE bags SET 
      quantity_available = quantity_available - ?,
      updated_at = ?
    WHERE id = ?
  `).bind(data.quantity, new Date().toISOString(), data.bag_id).run();
  
  return c.json({ 
    id: orderResult.meta.last_row_id, 
    pickup_code: pickupCode,
    success: true 
  }, 201);
});

app.put('/api/orders/:id/confirm', authMiddleware, async (c) => {
  const id = c.req.param('id');
  
  await c.env.DB.prepare(`
    UPDATE orders SET 
      status = 'confirmed',
      payment_confirmed = 1,
      updated_at = ?
    WHERE id = ?
  `).bind(new Date().toISOString(), id).run();
  
  return c.json({ success: true });
});

app.put('/api/orders/:id/complete', authMiddleware, async (c) => {
  const id = c.req.param('id');
  
  await c.env.DB.prepare(`
    UPDATE orders SET 
      status = 'completed',
      updated_at = ?
    WHERE id = ?
  `).bind(new Date().toISOString(), id).run();
  
  return c.json({ success: true });
});

// Dashboard do lojista
app.get('/api/merchant/establishments', authMiddleware, async (c) => {
  const user = c.get("user");
  const { results } = await c.env.DB.prepare(`
    SELECT * FROM establishments 
    WHERE owner_user_id = ? AND is_active = 1
    ORDER BY name ASC
  `).bind(user?.id).all();
  
  return c.json(results as Establishment[]);
});

app.get('/api/merchant/orders', authMiddleware, async (c) => {
  const user = c.get("user");
  const { results } = await c.env.DB.prepare(`
    SELECT 
      o.*,
      b.name as bag_name,
      b.pickup_date,
      b.pickup_start_time,
      b.pickup_end_time,
      e.name as establishment_name
    FROM orders o
    JOIN bags b ON o.bag_id = b.id
    JOIN establishments e ON b.establishment_id = e.id
    WHERE e.owner_user_id = ?
    ORDER BY o.created_at DESC
  `).bind(user?.id).all();
  
  return c.json(results);
});

app.get('/api/merchant/stats', authMiddleware, async (c) => {
  const user = c.get("user");
  
  const totalSales = await c.env.DB.prepare(`
    SELECT COUNT(*) as count, SUM(o.total_price) as total
    FROM orders o
    JOIN bags b ON o.bag_id = b.id
    JOIN establishments e ON b.establishment_id = e.id
    WHERE e.owner_user_id = ? AND o.status = 'completed'
  `).bind(user?.id).first();
  
  const todaySales = await c.env.DB.prepare(`
    SELECT COUNT(*) as count
    FROM orders o
    JOIN bags b ON o.bag_id = b.id
    JOIN establishments e ON b.establishment_id = e.id
    WHERE e.owner_user_id = ? 
      AND date(o.created_at) = date('now')
      AND o.status = 'completed'
  `).bind(user?.id).first();
  
  const activeBags = await c.env.DB.prepare(`
    SELECT COUNT(*) as count
    FROM bags b
    JOIN establishments e ON b.establishment_id = e.id
    WHERE e.owner_user_id = ? 
      AND b.is_active = 1 
      AND b.quantity_available > 0
  `).bind(user?.id).first();
  
  return c.json({
    totalSales: totalSales?.count || 0,
    totalRevenue: totalSales?.total || 0,
    todaySales: todaySales?.count || 0,
    activeBags: activeBags?.count || 0
  });
});

// Upload de imagens para R2
app.post('/api/upload', authMiddleware, async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file');
    const key = formData.get('key');
    
    if (!file || !(file instanceof File)) {
      return c.json({ error: 'Arquivo não fornecido' }, 400);
    }
    
    if (!key || typeof key !== 'string') {
      return c.json({ error: 'Chave não fornecida' }, 400);
    }
    
    // Validação de tipo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return c.json({ error: 'Tipo de arquivo não permitido' }, 400);
    }
    
    // Validação de tamanho (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return c.json({ error: 'Arquivo muito grande (máx 5MB)' }, 400);
    }
    
    // Upload para R2
    const arrayBuffer = await file.arrayBuffer();
    await c.env.R2_BUCKET.put(key, arrayBuffer, {
      httpMetadata: {
        contentType: file.type
      }
    });
    
    // Gera URL pública (usando o domínio do worker)
    const url = `${new URL(c.req.url).origin}/api/files/${key}`;
    
    return c.json({
      success: true,
      url,
      key,
      size: file.size,
      contentType: file.type
    }, 201);
    
  } catch (error) {
    console.error('Erro no upload:', error);
    return c.json({ error: 'Erro ao fazer upload' }, 500);
  }
});

// Servir arquivos do R2
app.get('/api/files/*', async (c) => {
  const key = c.req.path.replace('/api/files/', '');
  
  const object = await c.env.R2_BUCKET.get(key);
  
  if (!object) {
    return c.json({ error: 'Arquivo não encontrado' }, 404);
  }
  
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('cache-control', 'public, max-age=31536000'); // 1 ano
  
  return new Response(object.body, {
    headers
  });
});

// Deletar arquivo do R2
app.delete('/api/upload/:key', authMiddleware, async (c) => {
  try {
    const key = decodeURIComponent(c.req.param('key'));
    
    await c.env.R2_BUCKET.delete(key);
    
    return c.json({ success: true });
    
  } catch (error) {
    console.error('Erro ao deletar:', error);
    return c.json({ error: 'Erro ao deletar arquivo' }, 500);
  }
});

// Geocoding endpoint
app.post('/api/geocode', authMiddleware, zValidator("json", z.object({
  address: z.string()
})), async (c) => {
  const { address } = c.req.valid("json");
  
  // Tenta usar Google Maps API se a chave estiver configurada
  const apiKey = c.env.GOOGLE_MAPS_API_KEY;
  
  try {
    if (apiKey) {
      const encodedAddress = encodeURIComponent(address);
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;
      
      const response = await fetch(url);
      const data = await response.json() as any;
      
      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const result = data.results[0];
        return c.json({
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng,
          formatted_address: result.formatted_address
        });
      }
    }
    
    // Fallback: geocoding simplificado
    return c.json(geocodeAddressFallback(address));
    
  } catch (error) {
    console.error('Erro no geocoding:', error);
    return c.json(geocodeAddressFallback(address));
  }
});

// Função fallback de geocoding
function geocodeAddressFallback(address: string) {
  const addressLower = address.toLowerCase();
  const IGUABA_CENTER = { lat: -22.8397, lng: -42.2267 };
  
  const knownLocations: Record<string, { lat: number; lng: number }> = {
    'centro': { lat: -22.8397, lng: -42.2267 },
    'praia': { lat: -22.8377, lng: -42.2247 },
    'porto': { lat: -22.8350, lng: -42.2250 },
    'sapiatiba': { lat: -22.8420, lng: -42.2310 },
    'ubas': { lat: -22.8450, lng: -42.2280 },
    'morro de são joão': { lat: -22.8330, lng: -42.2200 },
    'sapê': { lat: -22.8380, lng: -42.2350 },
  };
  
  for (const [keyword, coords] of Object.entries(knownLocations)) {
    if (addressLower.includes(keyword)) {
      const latVariation = (Math.random() - 0.5) * 0.003;
      const lngVariation = (Math.random() - 0.5) * 0.003;
      
      return {
        lat: coords.lat + latVariation,
        lng: coords.lng + lngVariation,
        formatted_address: address
      };
    }
  }
  
  const latVariation = (Math.random() - 0.5) * 0.01;
  const lngVariation = (Math.random() - 0.5) * 0.01;
  
  return {
    lat: IGUABA_CENTER.lat + latVariation,
    lng: IGUABA_CENTER.lng + lngVariation,
    formatted_address: address
  };
}

// Bag Photos endpoints
app.get('/api/bags/:bagId/photos', async (c) => {
  const bagId = c.req.param('bagId');
  
  const { results } = await c.env.DB.prepare(`
    SELECT * FROM bag_photos 
    WHERE bag_id = ? 
    ORDER BY display_order ASC
  `).bind(bagId).all();
  
  return c.json(results);
});

app.post('/api/bags/:bagId/photos', authMiddleware, async (c) => {
  const bagId = c.req.param('bagId');
  const user = c.get("user");
  
  // Verifica ownership
  const bag = await c.env.DB.prepare(`
    SELECT b.*, e.owner_user_id 
    FROM bags b 
    JOIN establishments e ON b.establishment_id = e.id 
    WHERE b.id = ?
  `).bind(bagId).first() as any;
  
  if (!bag || bag.owner_user_id !== user?.id) {
    return c.json({ error: 'Sem permissão' }, 403);
  }
  
  const body = await c.req.json();
  const { photo_url, display_order = 0 } = body;
  
  const result = await c.env.DB.prepare(`
    INSERT INTO bag_photos (bag_id, photo_url, display_order)
    VALUES (?, ?, ?)
  `).bind(bagId, photo_url, display_order).run();
  
  return c.json({ id: result.meta.last_row_id, success: true }, 201);
});

app.delete('/api/bags/:bagId/photos/:photoId', authMiddleware, async (c) => {
  const bagId = c.req.param('bagId');
  const photoId = c.req.param('photoId');
  const user = c.get("user");
  
  // Verifica ownership
  const bag = await c.env.DB.prepare(`
    SELECT b.*, e.owner_user_id 
    FROM bags b 
    JOIN establishments e ON b.establishment_id = e.id 
    WHERE b.id = ?
  `).bind(bagId).first() as any;
  
  if (!bag || bag.owner_user_id !== user?.id) {
    return c.json({ error: 'Sem permissão' }, 403);
  }
  
  await c.env.DB.prepare(`
    DELETE FROM bag_photos WHERE id = ?
  `).bind(photoId).run();
  
  return c.json({ success: true });
});

// =====================================================
// ADMIN ENDPOINTS
// =====================================================

// Verificar se usuário é admin
app.get('/api/admin/check', authMiddleware, async (c) => {
  const user = c.get("user");
  
  const admin = await c.env.DB.prepare(`
    SELECT * FROM admins WHERE user_id = ?
  `).bind(user?.id).first();
  
  return c.json({ isAdmin: !!admin });
});

// Estatísticas globais da plataforma
app.get('/api/admin/stats', authMiddleware, adminMiddleware, async (c) => {
  const totalEstablishments = await c.env.DB.prepare(`
    SELECT COUNT(*) as count FROM establishments
  `).first();
  
  const pendingEstablishments = await c.env.DB.prepare(`
    SELECT COUNT(*) as count FROM establishments WHERE approval_status = 'pending'
  `).first();
  
  const totalBags = await c.env.DB.prepare(`
    SELECT COUNT(*) as count FROM bags WHERE is_active = 1
  `).first();
  
  const totalOrders = await c.env.DB.prepare(`
    SELECT COUNT(*) as count, SUM(total_price) as revenue FROM orders WHERE status = 'completed'
  `).first();
  
  const totalUsers = await c.env.DB.prepare(`
    SELECT COUNT(DISTINCT customer_user_id) as count FROM orders
  `).first();
  
  const platformRevenue = await c.env.DB.prepare(`
    SELECT SUM(platform_fee) as total FROM orders WHERE status = 'completed'
  `).first();
  
  return c.json({
    totalEstablishments: totalEstablishments?.count || 0,
    pendingEstablishments: pendingEstablishments?.count || 0,
    approvedEstablishments: (totalEstablishments?.count || 0) - (pendingEstablishments?.count || 0),
    totalBags: totalBags?.count || 0,
    totalOrders: totalOrders?.count || 0,
    totalRevenue: totalOrders?.revenue || 0,
    platformRevenue: platformRevenue?.total || 0,
    totalUsers: totalUsers?.count || 0
  });
});

// Listar todos os estabelecimentos (incluindo pendentes)
app.get('/api/admin/establishments', authMiddleware, adminMiddleware, async (c) => {
  const status = c.req.query('status') || 'all';
  
  let query = 'SELECT * FROM establishments';
  const params: any[] = [];
  
  if (status !== 'all') {
    query += ' WHERE approval_status = ?';
    params.push(status);
  }
  
  query += ' ORDER BY created_at DESC';
  
  const { results } = await c.env.DB.prepare(query).bind(...params).all();
  
  return c.json(results);
});

// Aprovar estabelecimento
app.put('/api/admin/establishments/:id/approve', authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param('id');
  const user = c.get("user");
  
  await c.env.DB.prepare(`
    UPDATE establishments SET 
      approval_status = 'approved',
      is_approved = 1,
      approved_by = ?,
      approved_at = ?,
      updated_at = ?
    WHERE id = ?
  `).bind(user?.id, new Date().toISOString(), new Date().toISOString(), id).run();
  
  return c.json({ success: true });
});

// Rejeitar estabelecimento
app.put('/api/admin/establishments/:id/reject', authMiddleware, adminMiddleware, 
  zValidator("json", z.object({ reason: z.string().optional() })), 
  async (c) => {
    const id = c.req.param('id');
    const { reason } = c.req.valid("json");
    
    await c.env.DB.prepare(`
      UPDATE establishments SET 
        approval_status = 'rejected',
        is_approved = 0,
        rejection_reason = ?,
        updated_at = ?
      WHERE id = ?
    `).bind(reason || 'Não especificado', new Date().toISOString(), id).run();
    
    return c.json({ success: true });
});

// Listar todos os pedidos
app.get('/api/admin/orders', authMiddleware, adminMiddleware, async (c) => {
  const status = c.req.query('status') || 'all';
  const limit = parseInt(c.req.query('limit') || '50');
  const offset = parseInt(c.req.query('offset') || '0');
  
  let query = `
    SELECT 
      o.*,
      b.name as bag_name,
      e.name as establishment_name
    FROM orders o
    JOIN bags b ON o.bag_id = b.id
    JOIN establishments e ON b.establishment_id = e.id
  `;
  
  const params: any[] = [];
  
  if (status !== 'all') {
    query += ' WHERE o.status = ?';
    params.push(status);
  }
  
  query += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);
  
  const { results } = await c.env.DB.prepare(query).bind(...params).all();
  
  return c.json(results);
});

// Gerenciar pagamentos
app.get('/api/admin/payments', authMiddleware, adminMiddleware, async (c) => {
  const status = c.req.query('status') || 'all';
  
  let query = `
    SELECT 
      p.*,
      o.total_price as order_total,
      e.name as establishment_name
    FROM payments p
    JOIN orders o ON p.order_id = o.id
    JOIN bags b ON o.bag_id = b.id
    JOIN establishments e ON b.establishment_id = e.id
  `;
  
  const params: any[] = [];
  
  if (status !== 'all') {
    query += ' WHERE p.status = ?';
    params.push(status);
  }
  
  query += ' ORDER BY p.created_at DESC';
  
  const { results } = await c.env.DB.prepare(query).bind(...params).all();
  
  return c.json(results);
});

// Atualizar status de pagamento
app.put('/api/admin/payments/:id/status', authMiddleware, adminMiddleware,
  zValidator("json", z.object({ status: z.enum(['pending', 'processing', 'completed', 'failed', 'refunded']) })),
  async (c) => {
    const id = c.req.param('id');
    const { status } = c.req.valid("json");
    
    await c.env.DB.prepare(`
      UPDATE payments SET 
        status = ?,
        updated_at = ?,
        completed_at = CASE WHEN ? = 'completed' THEN ? ELSE completed_at END
      WHERE id = ?
    `).bind(status, new Date().toISOString(), status, new Date().toISOString(), id).run();
    
    return c.json({ success: true });
});

// Configurações do sistema
app.get('/api/admin/settings', authMiddleware, adminMiddleware, async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT * FROM system_settings ORDER BY key ASC
  `).all();
  
  return c.json(results);
});

// Atualizar configuração
app.put('/api/admin/settings/:key', authMiddleware, adminMiddleware,
  zValidator("json", z.object({ value: z.string() })),
  async (c) => {
    const key = c.req.param('key');
    const { value } = c.req.valid("json");
    const user = c.get("user");
    
    await c.env.DB.prepare(`
      UPDATE system_settings SET 
        value = ?,
        updated_at = ?,
        updated_by = ?
      WHERE key = ?
    `).bind(value, new Date().toISOString(), user?.id, key).run();
    
    return c.json({ success: true });
});

// Adicionar novo admin
app.post('/api/admin/admins', authMiddleware, adminMiddleware,
  zValidator("json", z.object({ user_id: z.string() })),
  async (c) => {
    const { user_id } = c.req.valid("json");
    const user = c.get("user");
    
    const result = await c.env.DB.prepare(`
      INSERT INTO admins (user_id, created_by)
      VALUES (?, ?)
    `).bind(user_id, user?.id).run();
    
    return c.json({ id: result.meta.last_row_id, success: true }, 201);
});

// Listar admins
app.get('/api/admin/admins', authMiddleware, adminMiddleware, async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT * FROM admins ORDER BY created_at DESC
  `).all();
  
  return c.json(results);
});

// =====================================================
// PAYMENT ENDPOINTS - MERCADO PAGO PIX
// =====================================================

// Criar pagamento PIX via Mercado Pago
app.post('/api/payments/pix/create', authMiddleware, 
  zValidator("json", z.object({
    order_id: z.number(),
    amount: z.number().positive(),
    description: z.string().optional()
  })),
  async (c) => {
    try {
      const { order_id, amount, description } = c.req.valid("json");
      const user = c.get("user");
      
      // Verificar se o pedido existe e pertence ao usuário
      const order = await c.env.DB.prepare(`
        SELECT o.*, b.name as bag_name, e.name as establishment_name
        FROM orders o
        JOIN bags b ON o.bag_id = b.id
        JOIN establishments e ON b.establishment_id = e.id
        WHERE o.id = ? AND o.customer_user_id = ?
      `).bind(order_id, user?.id).first() as any;
      
      if (!order) {
        return c.json({ error: 'Pedido não encontrado' }, 404);
      }
      
      // Inicializar Mercado Pago
      const client = new MercadoPagoConfig({ 
        accessToken: c.env.MERCADOPAGO_ACCESS_TOKEN,
        options: { timeout: 5000 }
      });
      
      const payment = new Payment(client);
      
      // Criar pagamento PIX
      const paymentData = {
        transaction_amount: amount,
        description: description || `Pedido #${order_id} - ${order.bag_name}`,
        payment_method_id: 'pix',
        payer: {
          email: user?.email || 'cliente@salvaiguaba.com',
          first_name: user?.google_user_data?.given_name || 'Cliente',
          last_name: user?.google_user_data?.family_name || 'Salva Iguaba'
        }
      };
      
      const response = await payment.create({ body: paymentData });
      
      // Salvar pagamento no banco
      const paymentResult = await c.env.DB.prepare(`
        INSERT INTO payments (
          order_id, amount, payment_method, status, transaction_id, 
          pix_qr_code, pix_code
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        order_id,
        amount,
        'pix',
        'pending',
        response.id?.toString(),
        response.point_of_interaction?.transaction_data?.qr_code_base64,
        response.point_of_interaction?.transaction_data?.qr_code
      ).run();
      
      return c.json({
        success: true,
        payment_id: paymentResult.meta.last_row_id,
        mercadopago_id: response.id,
        qr_code: response.point_of_interaction?.transaction_data?.qr_code,
        qr_code_base64: response.point_of_interaction?.transaction_data?.qr_code_base64,
        status: response.status
      }, 201);
      
    } catch (error: any) {
      console.error('Erro ao criar pagamento PIX:', error);
      return c.json({ error: error.message || 'Erro ao criar pagamento' }, 500);
    }
});

// Webhook Mercado Pago
app.post('/api/webhooks/mercadopago', async (c) => {
  try {
    const body = await c.req.json();
    
    // Mercado Pago envia notificações de diferentes tipos
    if (body.type === 'payment') {
      const paymentId = body.data?.id;
      
      if (!paymentId) {
        return c.json({ error: 'Payment ID não fornecido' }, 400);
      }
      
      // Buscar detalhes do pagamento
      const client = new MercadoPagoConfig({ 
        accessToken: c.env.MERCADOPAGO_ACCESS_TOKEN 
      });
      const payment = new Payment(client);
      const paymentData = await payment.get({ id: paymentId });
      
      // Atualizar status no banco de dados
      await c.env.DB.prepare(`
        UPDATE payments 
        SET status = ?,
            updated_at = ?,
            completed_at = CASE WHEN ? = 'approved' THEN ? ELSE completed_at END
        WHERE transaction_id = ?
      `).bind(
        paymentData.status === 'approved' ? 'completed' : 
        paymentData.status === 'rejected' ? 'failed' : 
        paymentData.status || 'pending',
        new Date().toISOString(),
        paymentData.status,
        new Date().toISOString(),
        paymentId.toString()
      ).run();
      
      // Se aprovado, confirmar o pedido
      if (paymentData.status === 'approved') {
        const paymentRecord = await c.env.DB.prepare(`
          SELECT order_id FROM payments WHERE transaction_id = ?
        `).bind(paymentId.toString()).first() as any;
        
        if (paymentRecord) {
          await c.env.DB.prepare(`
            UPDATE orders SET 
              status = 'confirmed',
              payment_confirmed = 1,
              updated_at = ?
            WHERE id = ?
          `).bind(new Date().toISOString(), paymentRecord.order_id).run();
        }
      }
    }
    
    return c.json({ success: true });
    
  } catch (error: any) {
    console.error('Erro no webhook Mercado Pago:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Consultar status do pagamento
app.get('/api/payments/:id/status', authMiddleware, async (c) => {
  const id = c.req.param('id');
  
  const payment = await c.env.DB.prepare(`
    SELECT p.*, o.customer_user_id
    FROM payments p
    JOIN orders o ON p.order_id = o.id
    WHERE p.id = ?
  `).bind(id).first() as any;
  
  if (!payment) {
    return c.json({ error: 'Pagamento não encontrado' }, 404);
  }
  
  const user = c.get("user");
  if (payment.customer_user_id !== user?.id) {
    return c.json({ error: 'Sem permissão' }, 403);
  }
  
  return c.json({
    id: payment.id,
    status: payment.status,
    amount: payment.amount,
    payment_method: payment.payment_method,
    created_at: payment.created_at,
    completed_at: payment.completed_at
  });
});

// Listar pagamentos do usuário
app.get('/api/payments/my', authMiddleware, async (c) => {
  const user = c.get("user");
  
  const { results } = await c.env.DB.prepare(`
    SELECT p.*, o.id as order_id, b.name as bag_name
    FROM payments p
    JOIN orders o ON p.order_id = o.id
    JOIN bags b ON o.bag_id = b.id
    WHERE o.customer_user_id = ?
    ORDER BY p.created_at DESC
  `).bind(user?.id).all();
  
  return c.json(results);
});

// Obter chaves públicas para o frontend
app.get('/api/config/payment-keys', async (c) => {
  return c.json({
    mercadopago_public_key: c.env.MERCADOPAGO_PUBLIC_KEY,
    stripe_publishable_key: c.env.STRIPE_PUBLISHABLE_KEY
  });
});

export default app;
