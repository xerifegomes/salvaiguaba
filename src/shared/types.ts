import z from "zod";

// Esquemas para validação de dados
export const EstablishmentSchema = z.object({
  id: z.number(),
  name: z.string(),
  category: z.enum(['padaria', 'restaurante', 'mercado', 'lanchonete', 'cafeteria', 'pizzaria']),
  address: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  phone: z.string().optional(),
  logo_url: z.string().optional(),
  owner_user_id: z.string().optional(),
  is_active: z.boolean().default(true),
  is_approved: z.boolean().default(false),
  approved_at: z.string().optional(),
  approved_by_user_id: z.string().optional(),
  rejection_reason: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string()
});

export const BagSchema = z.object({
  id: z.number(),
  establishment_id: z.number(),
  name: z.string(),
  description: z.string().optional(),
  price: z.number(),
  original_price: z.number().optional(),
  quantity_available: z.number().min(0),
  pickup_start_time: z.string(), // HH:MM
  pickup_end_time: z.string(),   // HH:MM
  pickup_date: z.string(), // YYYY-MM-DD
  is_active: z.boolean().default(true),
  created_at: z.string(),
  updated_at: z.string()
});

export const OrderSchema = z.object({
  id: z.number(),
  bag_id: z.number(),
  customer_user_id: z.string(),
  quantity: z.number().min(1),
  total_price: z.number(),
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']),
  payment_method: z.string().default('pix'),
  payment_confirmed: z.boolean().default(false),
  pickup_code: z.string(),
  created_at: z.string(),
  updated_at: z.string()
});

export const BagPhotoSchema = z.object({
  id: z.number(),
  bag_id: z.number(),
  photo_url: z.string(),
  display_order: z.number().default(0),
  created_at: z.string()
});

// Esquemas para criação/atualização
export const CreateEstablishmentSchema = EstablishmentSchema.omit({
  id: true,
  created_at: true,
  updated_at: true
});

export const CreateBagSchema = BagSchema.omit({
  id: true,
  created_at: true,
  updated_at: true
});

export const CreateOrderSchema = OrderSchema.omit({
  id: true,
  pickup_code: true,
  created_at: true,
  updated_at: true,
  status: true,
  payment_confirmed: true
});

export const UpdateBagSchema = CreateBagSchema.partial();

// Tipos derivados
export type Establishment = z.infer<typeof EstablishmentSchema>;
export type Bag = z.infer<typeof BagSchema>;
export type Order = z.infer<typeof OrderSchema>;
export type BagPhoto = z.infer<typeof BagPhotoSchema>;
export type CreateEstablishment = z.infer<typeof CreateEstablishmentSchema>;
export type CreateBag = z.infer<typeof CreateBagSchema>;
export type CreateOrder = z.infer<typeof CreateOrderSchema>;
export type UpdateBag = z.infer<typeof UpdateBagSchema>;

// Tipos para views enriquecidas
export const BagWithEstablishmentSchema = BagSchema.extend({
  establishment: EstablishmentSchema
});

export const OrderWithDetailsSchema = OrderSchema.extend({
  bag: BagSchema,
  establishment: EstablishmentSchema
});

export type BagWithEstablishment = z.infer<typeof BagWithEstablishmentSchema>;
export type OrderWithDetails = z.infer<typeof OrderWithDetailsSchema>;

// Coordenadas de Iguaba Grande, RJ
export const IGUABA_GRANDE_CENTER = {
  lat: -22.8397,
  lng: -42.2267
} as const;
