# SCPP Microservice - Source Code

Financial management and inventory tracking system built as a microservice API with OpenAPI documentation.

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **Hono** | Lightweight TypeScript web framework |
| **Bun** | JavaScript runtime |
| **MariaDB/MySQL** | Database (mysql2/promise) |
| **Zod** | Runtime validation + OpenAPI generation |
| **Luxon** | Date manipulation |
| **Biome** | Linting & formatting |

## Directory Structure

```
src/
├── index.ts              # Server entry point (Bun.serve)
├── app.ts                # Hono app configuration & routing
│
├── config/
│   ├── env.ts            # Type-safe environment variables
│   └── cors.ts           # CORS whitelist configuration
│
├── db/
│   ├── client.ts         # Database pool with retry logic
│   └── repository.ts     # Generic query functions
│
├── middleware/
│   ├── request-id.ts     # UUID injection per request
│   ├── logger.ts         # Request/response logging
│   ├── error-handler.ts  # Global error handling
│   └── auth.ts           # Session validation
│
├── routes/
│   ├── index.ts          # Route exports
│   ├── auth.routes.ts    # Authentication endpoints
│   ├── documentos.routes.ts
│   ├── categorias.routes.ts
│   ├── dashboard.routes.ts
│   ├── assets.routes.ts
│   └── food.routes.ts
│
├── services/
│   ├── session.service.ts
│   ├── documentos.service.ts
│   ├── categorias.service.ts
│   ├── dashboard.service.ts
│   ├── assets.service.ts
│   └── food.service.ts
│
├── schemas/              # Zod validation schemas
│   ├── common.ts
│   ├── auth.ts
│   ├── documentos.ts
│   ├── categorias.ts
│   ├── dashboard.ts
│   ├── assets.ts
│   └── food.ts
│
├── types/
│   ├── api.ts            # API response types
│   └── context.ts        # Hono context types
│
├── errors/
│   └── http.ts           # Custom error classes
│
└── utils/
    └── date.ts           # Date formatting utilities
```

## Key Components

### Entry Point
- **index.ts** - Starts Bun.serve(), handles graceful shutdown (SIGTERM/SIGINT)
- **app.ts** - Configures OpenAPIHono, middleware stack, and route registration

### Database Layer
- Connection pooling with automatic retry logic
- Generic repository functions: `select()`, `insert()`, `update()`, `deleteRow()`, `callProcedure()`
- Custom type casting (TINYINT → boolean, DECIMAL → number)

### Middleware Stack (execution order)
1. Request ID injection
2. CORS configuration
3. Request logging
4. Route handlers
5. Global error handler

### Service Layer
Business logic isolated from routes. Each service corresponds to a route file.

## API Endpoints

### Authentication (`/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/login` | Authenticate user |
| POST | `/logout` | Invalidate session |
| GET | `/check-session` | Validate session token |

### Documents (`/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/documentos` | List documents (with filters) |
| POST | `/documentos` | Create document |
| PUT | `/documentos` | Update document |
| DELETE | `/documentos` | Delete document |

### Categories (`/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/categorias` | List categories |
| GET | `/tipo-docs` | List document types |

### Dashboard (`/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard` | Overview data |
| GET | `/monthly-graph` | Monthly expense data |
| GET | `/expenses-by-category` | Category breakdown |
| GET | `/curr-month-spending` | Current month totals |
| GET | `/yearly-sum` | Yearly aggregate |
| GET | `/expenses-by-category-timeseries` | Expense trends |

### Assets (`/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/assets` | List assets |
| POST | `/assets` | Create asset |
| DELETE | `/assets` | Delete asset |

### Food Management (`/food`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/food/items` | List food items |
| GET | `/food/item-quantity` | Items with quantities |
| POST | `/food/item` | Create item |
| PUT | `/food/item` | Update item |
| DELETE | `/food/item` | Delete item |
| GET | `/food/transaction` | List transactions |
| POST | `/food/transaction` | Create transaction |
| PUT | `/food/transaction` | Update transaction |
| DELETE | `/food/transaction` | Delete transaction |

## Authentication

Session-based authentication using `sessionHash` token:
- **GET requests**: `sessionHash` passed as query parameter
- **POST/PUT/DELETE**: `sessionHash` included in request body
- Returns 401 if session is invalid or missing

## OpenAPI Documentation

The API is fully documented using OpenAPI 3.0.0 specification, auto-generated from Zod schemas.

| Endpoint | Description |
|----------|-------------|
| `GET /docs` | Swagger UI - Interactive API documentation |
| `GET /openapi.json` | Raw OpenAPI specification (JSON) |

Access the Swagger UI at `http://localhost:3000/docs` to explore and test endpoints interactively.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3000 | Server port |
| `DB_HOST` | - | Database host |
| `DB_USER` | - | Database user |
| `DB_PASSWORD` | - | Database password |
| `DB_NAME` | - | Database name |
| `DB_PORT` | 3306 | Database port |
| `DB_MAX_RETRIES` | 5 | Connection retry attempts |
| `DB_RETRY_DELAY` | 1500 | Retry delay (ms) |
| `LOG_ENDPOINTS` | false | Log endpoint calls |
| `DEBUG_RESPONSES` | false | Log response bodies |
| `NODE_ENV` | development | Environment mode |

## Error Handling

Custom error classes automatically transformed to API responses:
- `InvalidSessionError` → 401
- `LoginFailedError` → 401
- `ValidationError` → 422
- `NotFoundError` → 404
- `BadRequestError` → 400
- `DatabaseError` → 500

Response format:
```json
{
  "hasErrors": true,
  "errorDescription": ["Error message"]
}
```
