# SecondLife REST API Specification

Base URL: `http://localhost:5000/api`

## Authentication Endpoints (`/api/auth`)
- `POST /auth/register` — Register a new customer account
- `POST /auth/login` — Authenticate and receive JWT
- `GET /auth/me` — Retrieve current authenticated user profile
- `PUT /auth/profile` — Update user name, phone, or avatar

## Catalog & Taxonomy Endpoints
- `GET /categories` — List all categories with product counts
- `GET /categories/:slug` — Retrieve category details
- `POST /categories` — [Admin] Create new category taxonomy

## Products Endpoints (`/api/products`)
- `GET /products` — Query products with filters: `search`, `categoryId`, `condition`, `minPrice`, `maxPrice`, `inStockOnly`, `featured`, `sortBy`, `page`, `limit`
- `GET /products/:slugOrId` — Get product detail with rebuild blueprint & specs
- `POST /products` — [Admin] Register a newly reconstructed product
- `PUT /products/:id` — [Admin] Update product specs, price, stock, or rebuild details
- `DELETE /products/:id` — [Admin] Archive product from active catalog

## Cart Endpoints (`/api/cart`)
- `GET /cart` — Get active server cart with eco metric aggregates & discounts
- `POST /cart/items` — Add product to cart with stock validation
- `PUT /cart/items/:itemId` — Update cart item quantity
- `DELETE /cart/items/:itemId` — Remove item from cart
- `DELETE /cart` — Clear entire cart

## Checkout & Orders Endpoints (`/api/orders`)
- `POST /orders/checkout` — Execute checkout through PaymentProvider abstraction, decrement inventory, generate order number
- `GET /orders/my-orders` — List current user order history & bench statuses
- `GET /orders/:idOrNumber` — Retrieve single order detail & tracking
- `GET /orders/admin/all` — [Admin] List all orders across platform
- `PUT /orders/admin/:id/status` — [Admin] Update order status (`CONFIRMED`, `QUALITY_BENCH_TESTING`, `PACKAGING`, `SHIPPED`, `DELIVERED`, `CANCELLED`)

## Reviews Endpoints (`/api/reviews`)
- `GET /reviews/products/:productId` — Get verified customer reviews
- `POST /reviews/products/:productId` — Submit rating and review

## Support & Repairs Endpoints (`/api/support`)
- `POST /support` — Open technical assistance or warranty claim ticket
- `GET /support/my-tickets` — Retrieve user ticket threads
- `POST /support/:ticketId/messages` — Add message to ticket thread
- `GET /support/admin/all` — [Admin] Retrieve all open customer tickets
- `PUT /support/admin/:ticketId/status` — [Admin] Update ticket resolution status

## Admin Telemetry Endpoints (`/api/admin`)
- `GET /admin/health` — Real-time system health diagnostics, API latency, DB status
- `GET /admin/customers` — Search and view customer lifetime metrics
- `PUT /admin/customers/:customerId/status` — Activate/suspend customer account
- `GET /admin/audit-logs` — Paginated security audit trail
- `GET /admin/low-stock` — Hardware items with stock <= 3
