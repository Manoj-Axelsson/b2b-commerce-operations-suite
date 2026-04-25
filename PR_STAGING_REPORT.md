# 🚀 Rajput Foods: Staging & PR Strategy Report

This report outlines the steps to stage and commit the 25 modified files into 4 clean Pull Requests, following the project's strict DX conventions.

## PR #1: [feat]: Multi-Admin Infrastructure & Auth Reliability
**Total Files: 9**
*Logic: Core security updates, type augmentation, and auth reliability.*

1. `src/proxy.ts` — **[feat]: update proxy to support async multi-admin checks**
2. `src/app/api/user/route.ts` — **[feat]: extend user api to recognize secondary admin roles**
3. `src/lib/auth-client.ts` — **[feat]: add custom fields to client auth schema**
4. `src/types/better-auth.d.ts` — **[feat]: add global module augmentation for auth types**
5. `src/components/layout/NavbarClient.tsx` — **[fix]: resolve sign-out hang with full page refresh**
6. `src/lib/mail.ts` — **[fix]: add fail-safe for fictional email testing**
7. `src/lib/auth.ts` — **[chore]: verify additionalFields configuration**
8. `src/app/admin/page.tsx` — **[fix]: update dashboard redirect for multi-admin support**
9. `src/app/admin/layout.tsx` — **[fix]: implement type-safe role check for admin layout**

---

## PR #2: [feat]: Admin Folder Security Synchronization
**Total Files: 6**
*Logic: Updating internal admin pages and server actions to support the new role-based access.*

1. `src/app/admin/customers/page.tsx` — **[fix]: sync customer page security check**
2. `src/app/admin/orders/page.tsx` — **[fix]: sync orders page security check**
3. `src/app/admin/products/actions.ts` — **[feat]: update verifyAdmin helper for role-based access**
4. `src/app/admin/customers/actions.ts` — **[feat]: add verifyAdmin check to customer actions**
5. `src/app/admin/products/page.tsx` — **[fix]: update product management security gate**
6. `src/app/admin/inventory/types/schema.ts` — **[feat]: provide standardized product update schema**


---

## PR #3: [security]: Wholesale Price Privacy Gates
**Total Files: 6**
*Logic: Hiding pricing and cart features from unapproved/guest users.*

1. `src/types/shop.ts` — **[feat]: add isApproved to Product props types**
2. `src/app/shop/page.tsx` — **[security]: implement type-safe approval check on main shop page**
3. `src/components/shop/ProductGrid.tsx` — **[feat]: propagate isApproved status to grid items**
4. `src/components/shop/ProductCard.tsx` — **[security]: gate price and cart visibility by approval status**
5. `src/components/cart/GlobalCartButton.tsx` — **[security]: hide floating cart and fix type safety for pending users**
6. `src/app/(auth)/signup/page.tsx` — **[fix]: add login and forgot password links to registration**

---

## PR #4: [feat]: Customer Approval & Product Detail Security
**Total Files: 5**
*Logic: Finalizing the admin UI for approvals and securing the product detail page.*

1. `src/app/shop/[id]/page.tsx` — **[security]: gate product detail page prices and ordering**
2. `src/app/shop/[id]/components/AddToCartAction.tsx` — **[fix]: add missing Link import and restrict cart action**
3. `src/app/admin/customers/actions.ts` (Update) — **[feat]: handle isApproved toggle in saveCustomer**
4. `src/app/admin/customers/page.tsx` (Update) — **[feat]: add approval toggle and status column to UI**
5. `src/app/admin/inventory/actions.ts` — **[feat]: ensure inventory actions are role-protected**

---

## 🛠️ Staging Instructions
To stage these according to the plan:
1. `git checkout -b feature/auth-infra`
2. Stage the 9 files for PR #1.
3. `git commit -m "..."` for each file or as a group.
4. Push and create PR.
5. Repeat for each branch: `feature/admin-sync`, `security/price-gates`, `feature/customer-approval`.
