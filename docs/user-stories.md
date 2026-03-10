# User Stories – Rajput Foods Web Shop

A user story describes functionality from the perspective of the person using the system. The classical structure looks like this:

```
As a [role],
I want to [perform an action],
so that [a value or benefit is achieved].
```

### Acceptance Criteria (AC)
Concrete rules describing when the story is considered complete.

### Edge Cases
Situations where the system could behave incorrectly if they are not considered.

---

## Background

Rajput Foods web shop occupies an unusual position: it is not purely a consumer shop, and it is not purely a B2B supplier either. It begins as a hybrid marketplace. Private customers and wholesale buyers use the same storefront at first, and differentiation only appears later through contracts and volume agreements. From a product design perspective: this should reduce complexity early, grow sophistication later.

In the first phase, the web shop should behave like a standard retail e-commerce platform, to lower the barrier for customers. Wholesalers can still order through the same interface, but nothing about the system initially forces different pricing models. After six months, the system can evolve to support contract pricing, tiered discounts, or wholesale catalogs. Building awareness first, is essentially a market-entry strategy.

---

## Hierarchy

**Epic**
└── Web shop User Experience

**User stories**
├── Browse products
├── View product details
├── Add product to cart
├── View cart
└── Checkout order

**src/**
├─ components/
│  └─ cart/
│     └─ AddToCartButton.tsx
│
├─ hooks/
│  └─ useCart.ts
│
├─ lib/
│  └─ cart.ts
│
└─ types/
   └─ cart.ts

---

## User Story 1 – Customer browses products

As a visitor to the web shop, the user should be able to see all available products so as to find the food items the user wants to order.

### AC (Acceptance Criteria)

- The web shop displays a list of available products.
- Each product shows a name, image, price, and short description.
- Products can be opened to view more details.
- Products that are out of stock are displayed but cannot be selected into the cart.
- Out-of-stock products use a visually distinct style (changed colour, opacity, or background colour) to communicate their unavailability.

### Edge Cases

- If no products are available, the user sees a message explaining that the catalog is empty.
- If an image is missing, a placeholder image is shown.

---

## User Story 2 – View product details

As a user, it must be possible to see the detailed descriptions and details of a product in order to decide whether to buy it.

### AC (Acceptance Criteria)

- Clicking on a product from the product listing opens the dedicated product detail page.
- The product detail page displays: full product name, one or more high-resolution images, detailed description, price, unit size or weight, stock status, and an **Add to Cart** button.
- If the product is in stock, the **Add to Cart** button is active.
- If the product is out of stock, the **Add to Cart** button is disabled and a clear **Out of Stock** label is shown.
- The user can navigate back to the product listing from the product detail page without losing their previous scroll position or filters.

### Edge Cases

- If the product has been removed from the catalog while the user is viewing the detail page, a "Product no longer available" message is displayed and the user is offered a link back to the catalog.
- If no detailed description has been provided for a product, a default placeholder text is shown (e.g. "No description available").
- If a product has multiple images, the user can cycle through them using an image carousel. If only one image exists, no carousel controls are rendered.
- If the product price has changed server-side since the page was loaded, the updated price is fetched and displayed before the user can add the item to their cart.

---

## User Story 3 – Add product to cart

As a user, I should be able to add a product to the cart and collect all chosen products before proceeding to checkout.

### AC (Acceptance Criteria)

- The user can click an **Add to Cart** button on any in-stock product, either from the product listing or the product detail page.
- After a product is added, a visual confirmation is displayed — for example a toast notification or an updated badge count on the cart icon.
- The cart icon or counter in the navigation bar updates immediately to reflect the total number of items in the cart.
- The user can specify a quantity before adding the item to the cart, or adjust the quantity directly in the cart after adding.
- Items added to the cart persist across page navigations within the same browser session.

### Edge Cases

- If a product becomes out of stock after being added to the cart (e.g. another customer purchased the last unit), the user is notified with a warning when they next view the cart.
- If the user adds the same item more than once, the cart increments the existing line's quantity rather than creating a duplicate entry.
- If the user is not logged in, the cart is stored in browser session storage (or a non-persistent session cookie) so that it only persists for the current browser session. Upon login, the guest cart is merged with any existing saved cart on the user's account. Duplicate items are consolidated.
- If a maximum order quantity exists for a product, the **Add to Cart** button or quantity selector is disabled once the limit is reached, and a message explaining the limit is shown.
- If adding to the cart fails due to a network error, an error message is displayed and the cart state is not changed.

---

## User Story 4 – View cart

As a user, I should be able to review and edit my selected products before proceeding to checkout.

### AC (Acceptance Criteria)

- The user can open the cart at any time via a cart icon or button that is visible on all pages.
- The cart displays all added products, each showing: product name, thumbnail image, unit price, quantity, and the line total (unit price × quantity).
- The user can increase or decrease the quantity of any item directly in the cart.
- The user can remove individual items from the cart.
- The cart displays the running total for all items.
- A **Proceed to Checkout** button is visible and enabled when the cart contains at least one item.

### Edge Cases

- If the cart is empty, the user sees an informative message such as "Your cart is empty" and a button or link to continue shopping.
- If an item in the cart goes out of stock before the user checks out, that item is highlighted with a warning label and excluded from checkout until it is removed from the cart.
- If the price of a cart item changes between when it was added and when the cart is viewed, the updated price is shown and the cart total is recalculated. The user is informed of the price change.
- If the user decreases an item's quantity to zero, the item is automatically removed from the cart.
- A cart with many items must remain scrollable and not break the page layout.

---

## User Story 5 – Checkout

As a user, I should be able to proceed with my order and complete checkout after successful payment.

### AC (Acceptance Criteria)

- The user can navigate from the cart to the checkout page by clicking **Proceed to Checkout**.
- The checkout page collects: delivery address, contact information (name, email, phone), and payment details.
- The user can review a final order summary — showing all items, quantities, unit prices, and the total — before confirming the purchase.
- The user selects a payment method and submits payment.
- After a successful payment, the user is shown an on-screen order confirmation that includes an order reference number, and a confirmation email is sent to the provided email address.
- Upon successful checkout, the cart is cleared.

### Edge Cases

- If a required checkout field is left empty or contains invalid input, inline validation messages are shown next to the relevant field. The form cannot be submitted until all required fields are valid.
- If payment fails (e.g. declined card or timeout), the user is shown a clear, actionable error message and can retry without losing their cart contents or any already-entered address information.
- If an item becomes out of stock between the cart page and the checkout confirmation step, the user is notified immediately and redirected back to the cart to resolve the issue before re-attempting payment.
- If the user navigates away from the checkout page mid-process and returns, previously entered address and contact information is preserved in the form (where applicable and where security constraints allow).
- If the payment gateway is unavailable (e.g. third-party service outage), a user-friendly error message is displayed and the user is advised to try again later. No payment is charged.
- If the user submits the checkout form more than once (e.g. by clicking the button repeatedly or refreshing the page), duplicate orders are not created.
