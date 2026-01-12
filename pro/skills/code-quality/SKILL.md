---
name: code-quality
description: Apply production-grade coding standards to all code. Use when writing any application code, creating abstractions, implementing features, or fixing bugs. Ensures proper logging, error handling, configuration management, and testing patterns. This skill applies to ALL coding work, not just specific frameworks.
---

# Code Quality

Production-grade coding standards for all application code. No prototypes. No "we'll fix it later." Every line ships.

## Core Principle

> There is no development mode. All code is production code.

## Logging

### DO: Use structured loggers

| Language | Logger | Why |
|----------|--------|-----|
| Node.js/TypeScript | `pino` | Fastest, JSON-native, production-proven |
| Node.js/TypeScript | `winston` | Flexible transports, wide adoption |
| Python | `structlog` | Structured logging, context binding |
| Python | `logging` (stdlib) | With proper formatters, not bare print |
| Go | `slog` (stdlib) | Structured, leveled, production-ready |
| Go | `zap` | High-performance structured logging |
| Rust | `tracing` | Spans + events, async-aware |
| Scala | `scala-logging` | SLF4J wrapper, macro-based |
| Scala | `log4cats` | Functional logging for cats-effect |

### DO NOT: Ever use these for application logging

```typescript
// WRONG - Never in application code
console.log("User logged in", userId);
console.error("Failed to connect");
console.debug("Processing request");

// RIGHT - Structured logger with context
logger.info({ userId, action: "login" }, "User authenticated");
logger.error({ err, service: "database" }, "Connection failed");
```

### Logging Requirements

1. **Always include context**: Never log bare strings. Include structured data.
   ```typescript
   // WRONG
   logger.info("Processing order");

   // RIGHT
   logger.info({ orderId, userId, items: items.length }, "Processing order");
   ```

2. **Use appropriate levels**:
   - `error`: Something failed that needs attention
   - `warn`: Unexpected but handled condition
   - `info`: Business-relevant events (user actions, transactions)
   - `debug`: Technical details for troubleshooting

3. **Never log sensitive data**: No passwords, tokens, PII, credit cards.

4. **Include correlation IDs**: Every request should have a traceable ID.
   ```typescript
   logger.info({ requestId, userId }, "Request started");
   ```

## Error Handling

### DO: Use discriminated unions (composition over inheritance)

```typescript
// Define errors as discriminated unions - no classes
type OrderError =
  | { type: "validation"; field: string; message: string }
  | { type: "not_found"; resource: string; id: string }
  | { type: "payment"; reason: string; code: string }
  | { type: "unauthorized"; requiredRole: string };

// Constructor functions - not classes
const ValidationError = (field: string, message: string): OrderError =>
  ({ type: "validation", field, message });

const NotFoundError = (resource: string, id: string): OrderError =>
  ({ type: "not_found", resource, id });

const PaymentError = (reason: string, code: string): OrderError =>
  ({ type: "payment", reason, code });

// Use with Result type (success or failure)
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
const err = <E>(error: E): Result<never, E> => ({ ok: false, error });

// Functions return Result, not throw
function createOrder(input: CreateOrderInput): Result<Order, OrderError> {
  if (!input.email) {
    return err(ValidationError("email", "Email is required"));
  }

  const user = findUser(input.userId);
  if (!user) {
    return err(NotFoundError("User", input.userId));
  }

  return ok(buildOrder(user, input));
}

// Pattern match on error type
function handleOrderError(error: OrderError): Response {
  switch (error.type) {
    case "validation":
      return { status: 400, body: { field: error.field, message: error.message } };
    case "not_found":
      return { status: 404, body: { message: `${error.resource} not found` } };
    case "payment":
      return { status: 402, body: { reason: error.reason, code: error.code } };
    case "unauthorized":
      return { status: 403, body: { required: error.requiredRole } };
  }
}
```

### DO NOT: Use class hierarchies or throw for control flow

```typescript
// WRONG - Class inheritance
class AppError extends Error { }
class ValidationError extends AppError { }
class NotFoundError extends AppError { }

// WRONG - Throwing for control flow
throw new Error("Something went wrong");
throw "User not found";
throw { message: "Failed" };

// WRONG - Swallowing errors
try {
  await riskyOperation();
} catch (e) {
  // Silent failure - NEVER do this
}

// WRONG - Catch-all without discrimination
try {
  await operation();
} catch (e) {
  return null; // Hides the problem
}
```

### Error Handling Requirements

1. **Return errors, don't throw them**: Use Result types for expected failures.
   ```typescript
   // WRONG
   function findUser(id: string): User {
     const user = db.find(id);
     if (!user) throw new NotFoundError("User", id);
     return user;
   }

   // RIGHT
   function findUser(id: string): Result<User, NotFoundError> {
     const user = db.find(id);
     if (!user) return err(NotFoundError("User", id));
     return ok(user);
   }
   ```

2. **Reserve try/catch for truly exceptional cases**: I/O failures, network errors.
   ```typescript
   // OK to use try/catch for I/O - these are exceptional
   async function fetchData(url: string): Promise<Result<Data, FetchError>> {
     try {
       const response = await fetch(url);
       if (!response.ok) {
         return err({ type: "http", status: response.status });
       }
       return ok(await response.json());
     } catch (e) {
       return err({ type: "network", message: e.message });
     }
   }
   ```

3. **Log errors with context**:
   ```typescript
   const result = createOrder(input);
   if (!result.ok) {
     logger.error({ error: result.error, input }, "Order creation failed");
   }
   ```

## Configuration Management

### DO: Use environment variables with validation

```typescript
// config.ts - Single source of truth
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url().optional(),
  API_KEY: z.string().min(1),
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
});

export const config = envSchema.parse(process.env);
```

### DO NOT: Hardcode values or scatter env access

```typescript
// WRONG - Hardcoded values
const port = 3000;
const apiUrl = "https://api.example.com";
const timeout = 5000;

// WRONG - Scattered env access without validation
const dbUrl = process.env.DATABASE_URL; // Could be undefined
const port = parseInt(process.env.PORT); // Could be NaN

// WRONG - Default values hiding missing config
const apiKey = process.env.API_KEY || "default-key"; // Silent failure in prod
```

### Configuration Requirements

1. **Validate on startup**: Fail fast if config is invalid.
   ```typescript
   // App crashes immediately if DATABASE_URL is missing
   // Not 10 minutes later when first query runs
   ```

2. **Type-safe config access**: Use typed config objects, not raw `process.env`.

3. **Document required variables**: Include `.env.example` with all variables.
   ```bash
   # .env.example
   NODE_ENV=development
   PORT=3000
   DATABASE_URL=postgresql://user:pass@localhost:5432/db
   API_KEY=your-api-key-here
   ```

4. **No secrets in code**: Ever. Use environment variables or secret managers.

## Database Patterns

### DO: Use connection pooling

```typescript
// PostgreSQL with pg
import { Pool } from "pg";

const pool = new Pool({
  connectionString: config.DATABASE_URL,
  max: 20,                    // Max connections
  idleTimeoutMillis: 30000,   // Close idle connections
  connectionTimeoutMillis: 2000,
});

// Use pool, not individual connections
const result = await pool.query("SELECT * FROM users WHERE id = $1", [userId]);
```

### DO: Use parameterized queries

```typescript
// WRONG - SQL injection vulnerability
const query = `SELECT * FROM users WHERE email = '${email}'`;

// RIGHT - Parameterized query
const query = "SELECT * FROM users WHERE email = $1";
const result = await pool.query(query, [email]);
```

### DO: Use transactions for multi-step operations

```typescript
const client = await pool.connect();
try {
  await client.query("BEGIN");
  await client.query("UPDATE accounts SET balance = balance - $1 WHERE id = $2", [amount, fromId]);
  await client.query("UPDATE accounts SET balance = balance + $1 WHERE id = $2", [amount, toId]);
  await client.query("COMMIT");
} catch (err) {
  await client.query("ROLLBACK");
  throw err;
} finally {
  client.release();
}
```

## API Client Patterns

### DO: Configure timeouts and retries

```typescript
import axios from "axios";
import axiosRetry from "axios-retry";

const apiClient = axios.create({
  baseURL: config.API_BASE_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    "Content-Type": "application/json",
  },
});

axiosRetry(apiClient, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error)
      || error.response?.status === 429;
  },
});
```

### DO NOT: Make unbounded requests

```typescript
// WRONG - No timeout, no retry, no error handling
const response = await fetch(url);
const data = await response.json();

// WRONG - No timeout
const response = await axios.get(url);
```

## Testing Requirements

### DO: Write tests for business logic

```typescript
describe("OrderService", () => {
  it("calculates total with tax", () => {
    const order = new Order([
      { price: 100, quantity: 2 },
      { price: 50, quantity: 1 },
    ]);

    expect(order.subtotal).toBe(250);
    expect(order.tax).toBe(25); // 10% tax
    expect(order.total).toBe(275);
  });

  it("throws ValidationError for empty orders", () => {
    expect(() => new Order([])).toThrow(ValidationError);
  });
});
```

### DO: Test error paths, not just happy paths

```typescript
describe("UserRepository", () => {
  it("throws NotFoundError when user does not exist", async () => {
    await expect(repo.findById("nonexistent"))
      .rejects
      .toThrow(NotFoundError);
  });

  it("throws ConnectionError when database is unavailable", async () => {
    await database.disconnect();
    await expect(repo.findById("123"))
      .rejects
      .toThrow(ConnectionError);
  });
});
```

## Code Organization

### DO: Separate concerns

```
src/
├── config/           # Configuration loading and validation
│   └── index.ts
├── errors/           # Custom error classes
│   └── index.ts
├── lib/              # Shared utilities (logger, database client)
│   ├── logger.ts
│   └── database.ts
├── services/         # Business logic
│   └── order.ts
├── repositories/     # Data access
│   └── user.ts
└── routes/           # HTTP handlers (thin, delegate to services)
    └── orders.ts
```

### DO: Export typed interfaces

```typescript
// services/order.ts
export interface CreateOrderInput {
  userId: string;
  items: Array<{ productId: string; quantity: number }>;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  createdAt: Date;
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  // Implementation
}
```

## Constants and Magic Values

### DO: Define named constants

```typescript
// constants.ts
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
} as const;

export const CACHE_TTL = {
  SHORT: 60,          // 1 minute
  MEDIUM: 300,        // 5 minutes
  LONG: 3600,         // 1 hour
  SESSION: 86400,     // 24 hours
} as const;

export const LIMITS = {
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE_SIZE: 20,
  MAX_UPLOAD_SIZE_MB: 10,
  MAX_RETRIES: 3,
} as const;
```

### DO NOT: Use magic numbers

```typescript
// WRONG
if (response.status === 200) { }
await sleep(5000);
if (items.length > 100) { }

// RIGHT
if (response.status === HTTP_STATUS.OK) { }
await sleep(CACHE_TTL.SHORT * 1000);
if (items.length > LIMITS.MAX_PAGE_SIZE) { }
```

## Scala Idioms

Scala requires functional patterns. Exceptions are for exceptional circumstances, not control flow.

### Logging in Scala

```scala
// With scala-logging
import com.typesafe.scalalogging.LazyLogging

class OrderService extends LazyLogging {
  def processOrder(orderId: String, userId: String): Unit = {
    logger.info(s"Processing order: orderId=$orderId, userId=$userId")
    // WRONG: logger.info(s"Processing order $orderId") - no structured context
  }
}

// With log4cats (cats-effect)
import org.typelevel.log4cats.Logger
import org.typelevel.log4cats.slf4j.Slf4jLogger

def processOrder[F[_]: Sync](orderId: String)(implicit logger: Logger[F]): F[Unit] =
  logger.info(s"Processing order: orderId=$orderId") *> doWork(orderId)
```

### DO NOT: Use println or exceptions for control flow

```scala
// WRONG - println
println(s"Processing order $orderId")

// WRONG - Exceptions for control flow
def findUser(id: String): User = {
  val maybeUser = db.find(id)
  if (maybeUser.isEmpty) throw new Exception("User not found") // WRONG
  maybeUser.get
}
```

### Error Handling: Use Either, Option, or Effect types

```scala
// Define domain errors as ADTs
sealed trait OrderError
case class ValidationError(field: String, message: String) extends OrderError
case class NotFoundError(resource: String, id: String) extends OrderError
case class PaymentError(reason: String) extends OrderError

// Return Either, not throw
def createOrder(input: CreateOrderInput): Either[OrderError, Order] = {
  for {
    _ <- validateInput(input).toRight(ValidationError("input", "Invalid order input"))
    user <- userRepo.find(input.userId).toRight(NotFoundError("User", input.userId))
    order <- processPayment(input).leftMap(e => PaymentError(e.message))
  } yield order
}

// With cats-effect IO
def createOrder(input: CreateOrderInput): IO[Either[OrderError, Order]] = {
  // Or use EitherT for cleaner composition
  EitherT(validateInput(input))
    .flatMap(valid => EitherT(findUser(valid.userId)))
    .flatMap(user => EitherT(processPayment(input)))
    .value
}
```

### DO NOT: Throw exceptions or use null

```scala
// WRONG - Throwing exceptions
def findUser(id: String): User = {
  db.find(id).getOrElse(throw new RuntimeException(s"User not found: $id"))
}

// WRONG - Returning null
def findUser(id: String): User = {
  db.find(id).orNull
}

// WRONG - Using .get on Option
val user = maybeUser.get // Throws NoSuchElementException

// RIGHT - Return Option or Either
def findUser(id: String): Option[User] = db.find(id)
def findUser(id: String): Either[NotFoundError, User] =
  db.find(id).toRight(NotFoundError("User", id))
```

### Configuration: Use pureconfig with case classes

```scala
import pureconfig._
import pureconfig.generic.auto._

// Define typed config
case class DatabaseConfig(
  url: String,
  maxConnections: Int = 20,
  connectionTimeout: FiniteDuration = 2.seconds
)

case class AppConfig(
  port: Int,
  database: DatabaseConfig,
  logLevel: String = "info"
)

// Load with validation - fails fast on startup
val config: AppConfig = ConfigSource.default.loadOrThrow[AppConfig]

// WRONG - Manual parsing without validation
val port = sys.env.getOrElse("PORT", "3000").toInt // Can throw
val dbUrl = sys.env("DATABASE_URL") // Can throw NoSuchElementException
```

### Database: Use Doobie with typed queries

```scala
import doobie._
import doobie.implicits._

// Typed, parameterized queries - SQL injection safe
def findUser(id: UserId): ConnectionIO[Option[User]] =
  sql"SELECT id, email, name FROM users WHERE id = $id"
    .query[User]
    .option

// WRONG - String interpolation in SQL
def findUser(id: String): ConnectionIO[Option[User]] =
  sql"SELECT * FROM users WHERE id = '$id'" // SQL INJECTION VULNERABILITY
    .query[User]
    .option

// Transactions are automatic within ConnectionIO
def transfer(from: AccountId, to: AccountId, amount: BigDecimal): ConnectionIO[Unit] =
  for {
    _ <- sql"UPDATE accounts SET balance = balance - $amount WHERE id = $from".update.run
    _ <- sql"UPDATE accounts SET balance = balance + $amount WHERE id = $to".update.run
  } yield ()

// Execute with transactor (connection pool)
val xa: Transactor[IO] = Transactor.fromDriverManager[IO](
  "org.postgresql.Driver",
  config.database.url,
  config.database.user,
  config.database.password
)

transfer(from, to, amount).transact(xa)
```

### API Clients: Use sttp with typed responses

```scala
import sttp.client3._
import sttp.client3.circe._
import io.circe.generic.auto._

case class ApiResponse(id: String, status: String)

// Typed client with timeout
val backend = HttpClientSyncBackend()

val request = basicRequest
  .get(uri"https://api.example.com/orders/$orderId")
  .readTimeout(10.seconds)
  .response(asJson[ApiResponse])

val response: Response[Either[ResponseException[String, Error], ApiResponse]] =
  request.send(backend)

// Handle response properly
response.body match {
  case Right(apiResponse) => processResponse(apiResponse)
  case Left(error) => logger.error(s"API call failed: $error")
}

// WRONG - No timeout, no error handling
val response = basicRequest.get(uri"$url").send(backend)
val body = response.body // Unhandled Either
```

### Functional Patterns: Prefer immutability and pure functions

```scala
// DO: Immutable data with copy
case class Order(id: OrderId, items: List[Item], status: OrderStatus) {
  def addItem(item: Item): Order = copy(items = items :+ item)
  def markShipped: Order = copy(status = OrderStatus.Shipped)
}

// DO: Pure functions - same input = same output
def calculateTotal(items: List[Item]): BigDecimal =
  items.map(i => i.price * i.quantity).sum

// WRONG: Mutable state
class Order(var items: ListBuffer[Item], var status: String) {
  def addItem(item: Item): Unit = items += item // Mutation
}

// WRONG: Side effects hidden in functions
def calculateTotal(items: List[Item]): BigDecimal = {
  logger.info("Calculating total") // Side effect - impure
  items.map(i => i.price * i.quantity).sum
}
```

### Resource Management: Use Resource or bracket

```scala
import cats.effect._

// DO: Safe resource management with Resource
def dbConnection: Resource[IO, Connection] =
  Resource.make(IO(dataSource.getConnection))(conn => IO(conn.close()))

def processWithDb: IO[Result] =
  dbConnection.use { conn =>
    // Connection automatically closed after use, even on error
    doWork(conn)
  }

// WRONG: Manual resource management
def processWithDb: IO[Result] = {
  val conn = dataSource.getConnection // Leak if doWork throws
  val result = doWork(conn)
  conn.close()
  result
}
```

## Final Checklist

Before considering any code complete:

**All Languages:**
- [ ] No `console.log`/`println`/`print` in application code (tooling/scripts excepted)
- [ ] All config loaded from environment with validation (fail fast on startup)
- [ ] All errors are typed as discriminated unions/ADTs (no class hierarchies)
- [ ] All database queries are parameterized (no string interpolation)
- [ ] All external calls have timeouts and retry logic
- [ ] All business logic has tests (including error paths)
- [ ] All constants are named, no magic values
- [ ] All functions have typed inputs and outputs

**TypeScript/JavaScript:**
- [ ] Using Result types for expected failures, not throw
- [ ] Using pino/winston, not console
- [ ] Config validated with zod on startup

**Scala:**
- [ ] Using Either/Option/IO, not exceptions for control flow
- [ ] No `.get` on Option, no `.orNull`
- [ ] Using pureconfig or similar for typed config
- [ ] Using Doobie/Slick for type-safe queries
- [ ] Using Resource/bracket for resource management
- [ ] All data is immutable (case classes with copy)
- [ ] Side effects pushed to the edges (IO/effect types)
