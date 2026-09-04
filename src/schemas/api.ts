import { z } from 'zod';

// --- Shared primitives ---
// Adjust these if UserId/GroupId (Gamma ids) are UUID strings, plain strings, etc.
const GammaUserId = z.string();
const GammaGroupId = z.string();

// --- User ---
export const apiUser = z.object({
  id: z.number().int(),
  gammaId: GammaUserId,
  firstName: z.string(),
  lastName: z.string(),
  nick: z.string(),
  avatarUrl: z.string(),
});
export type ApiUser = z.infer<typeof apiUser>;

// --- Group ---
export const apiGroup = z.object({
  id: z.number().int(),
  gammaId: GammaGroupId,
  prettyName: z.string(),
  avatarUrl: z.string(),
});
export type ApiGroup = z.infer<typeof apiGroup>;

// --- GroupUser ---
export const apiGroupUser = z.object({
  user: apiUser,
  group: apiGroup,
  balance: z.number(),
  externalId: z.string().nullable().optional(),
});
export type ApiGroupUser = z.infer<typeof apiGroupUser>;

// --- GroupMember ---
export const apiGroupMember = z.object({
  id: z.number().int(),
  gammaId: GammaUserId,
  firstName: z.string(),
  lastName: z.string(),
  nick: z.string(),
  avatarUrl: z.string(),
  balance: z.number(),
  externalId: z.string().optional(),
});
export type ApiGroupMember = z.infer<typeof apiGroupMember>;

// --- Price ---
export const apiPrice = z.object({
  // price: z.number(),
  price: z.string().refine((val) => !isNaN(Number(val)), {
    message: "Price must be a valid number",
  }),
  displayName: z.string(),
  externalId: z.string().nullable().optional(),
});
export type ApiPrice = z.infer<typeof apiPrice>;

// --- Item ---
export const apiItem = z.object({
  id: z.number().int(),
  createdTime: z.coerce.date(),
  icon: z.string().nullable().optional(),
  displayName: z.string(),
  prices: z.array(apiPrice),
  stock: z.number().int(),
  timesPurchased: z.number().int(),
  visible: z.boolean(),
  favorite: z.boolean(),
});
export type ApiItem = z.infer<typeof apiItem>;

// --- TransactionCreator (discriminated by presence of userId/clientId) ---
export const apiTransactionCreator = z.union([
  z.object({ userId: z.number().int() }),
  z.object({ clientId: z.string() }),
]);
export type ApiTransactionCreator = z.infer<typeof apiTransactionCreator>;

// --- Base Transaction fields (reused via .extend in each subtype) ---
const apiTransactionBase = z.object({
  id: z.number().int(),
  createdBy: apiTransactionCreator,
  createdTime: z.coerce.date(),
  removed: z.boolean(),
  comment: z.string().nullable().optional(),
});

// --- PurchasedItem ---
export const apiPurchasedItem = z.object({
  item: z.object({
    id: z.number().int().nullable().optional(),
    displayName: z.string(),
    icon: z.string().nullable().optional(),
  }),
  quantity: z.number().int(),
  purchasePrice: apiPrice,
});
export type ApiPurchasedItem = z.infer<typeof apiPurchasedItem>;

// --- Purchase ---
export const apiPurchase = apiTransactionBase.extend({
  type: z.literal('purchase'),
  createdFor: z.number().int(),
  items: z.array(apiPurchasedItem),
});
export type ApiPurchase = z.infer<typeof apiPurchase>;

// --- Deposit ---
export const apiDeposit = apiTransactionBase.extend({
  type: z.literal('deposit'),
  createdFor: z.number().int(),
  total: z.string().refine((val) => !isNaN(Number(val)), {
      message: "Total must be a valid number",
  }),
});
export type ApiDeposit = z.infer<typeof apiDeposit>;

// --- StockUpdate ---
export const apiItemStockUpdateEntry = z.object({
  id: z.number().int(),
  before: z.number().int(),
  after: z.number().int(),
});

export const apiStockUpdate = apiTransactionBase.extend({
  type: z.literal('stockUpdate'),
  items: z.array(apiItemStockUpdateEntry),
});
export type ApiStockUpdate = z.infer<typeof apiStockUpdate>;

// --- Transaction (discriminated union of all subtypes) ---
export const apiTransaction = z.discriminatedUnion('type', [
  apiPurchase,
  apiDeposit,
  apiStockUpdate,
]);
export type ApiTransaction = z.infer<typeof apiTransaction>;

// --- ItemStockUpdate (request payload, not a Transaction subtype) ---
export const apiItemStockUpdate = z.object({
  id: z.number().int(),
  quantity: z.number().int(),
  absolute: z.boolean().optional().default(false),
});
export type ApiItemStockUpdate = z.infer<typeof apiItemStockUpdate>;

// --- Scope ---
export const apiScope = z.string();
export type ApiScope = z.infer<typeof apiScope>;

// --- GroupClient ---
export const apiGroupClient = z.object({
  id: z.string(),
  scope: apiScope,
  group: apiGroup,
  owner: apiUser,
  displayName: z.string(),
  description: z.string().nullable().optional(),
});
export type ApiGroupClient = z.infer<typeof apiGroupClient>;

// ---Client Response
export const apiClientLoginResponse = z.object({
  access_token: z.string(),
  token_type: z.string(),
  aud: z.string(),
  iss: z.string(),
  iat: z.number().min(0),
  nbf: z.number(),
  exp: z.number().min(0),
  jti: z.string(),
  scope: apiScope,
  client: z.object({
    id: z.string(),
    displayName: z.string()
  }),
  group: z.object({
    id: z.number(),
    gammaId: z.string()
  })
})
export type ApiClientLoginReponse = z.infer<typeof apiClientLoginResponse>