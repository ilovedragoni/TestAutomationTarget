# TestAutomationTarget

A Spring Boot + React application built as a practical target for UI/API test automation.

The app includes:
- Product/catalog browsing
- Authentication (sign up/sign in/session restore/sign out)
- Cart flows (guest cart + authenticated server cart merge/sync)

## Stack

- Backend: Java 21, Spring Boot 3.2, Spring Data JPA, Spring Security, Flyway, Spring Batch
- Frontend: React 18, Redux Toolkit, React Router, Vite
- Runtime DB: PostgreSQL
- Test DB: H2 in-memory (`application-test.yml`)

## Quick Start

### Option A: Backend serves built frontend

```bash
cd frontend && npm install && npm run build && cd ..
mvn spring-boot:run
```

Or package and run:

```bash
mvn package
java -jar target/TestAutomationTarget-1.0-SNAPSHOT.jar
```

- Web UI: http://localhost:8080/
- Health: http://localhost:8080/health
- API status: http://localhost:8080/api/status

### Option B: Frontend dev server + backend

```bash
# Terminal 1
mvn spring-boot:run

# Terminal 2
cd frontend && npm install && npm run dev
```

- React app: http://localhost:3000
- Backend: http://localhost:8080

Vite proxies `/api` and `/health` to backend (see `frontend/vite.config.js`).

## Database

### Runtime (default)

Configured in `src/main/resources/application.yml`:
- URL: `jdbc:postgresql://localhost:5432/targetdb`
- User: `sa`
- Password: `secret`

Start PostgreSQL quickly:

```bash
docker compose up -d
```

### Tests

Tests run with H2 and the `test` profile (`src/main/resources/application-test.yml`).

## Seed Data

On empty DB startup, the app seeds products by default:

```yaml
seed:
  enabled: true
  count: 1000
```

Disabled in `test` profile.

## Frontend Routes

- `/` Home (test automation information)
- `/products` Product catalog
- `/cart` Shopping cart
- `/signin` Sign in
- `/signup` Sign up
- `/profile` Signed-in profile page
- `/contact` Contact page

## Current API Surface

### Public

- `GET /health`
- `GET /api/status`
- `GET /api/products`
- `GET /api/products/{id}`
- `GET /api/categories`
- `GET /api/categories/{id}`
- `POST /api/auth/signup`
- `POST /api/auth/signin`
- `GET /api/auth/me` (returns `401` when no valid session)
- `POST /api/auth/logout`

### Authenticated (`/api/cart/**`)

- `GET /api/cart`
- `PUT /api/cart` (replace cart)
- `POST /api/cart/merge` (merge payload into existing cart)
- `DELETE /api/cart` (clear cart)

## Cart Behavior

The frontend uses a hybrid cart model:

1. Guest cart persists in `localStorage`.
2. After sign-in, guest cart is merged into server cart (`POST /api/cart/merge`).
3. While authenticated, cart updates sync to server (`PUT /api/cart`).

## Testing Notes

The UI keeps stable selectors (`id` and `data-testid`) for automation.

Examples:
- Product card row: ``data-testid="product-row-{id}"``
- Add-to-cart button: ``id="buy-{id}"``
- Cart count badge: ``id="cart-count"``
- Auth forms: ``id="signin-form"``, ``id="signup-form"``

## Run Tests

Run all backend tests:

```bash
mvn test
```

Targeted auth/cart suites:

```bash
mvn "-Dtest=AuthRestControllerTest,CartRestControllerTest" "-Dexec.skip=true" test
```
