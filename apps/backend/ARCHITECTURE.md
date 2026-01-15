# Backend Architecture Standardization & Design Pattern Analysis
## Krishi Bazaar Nepal

> [!IMPORTANT]
> This document serves as the **Supreme Law** for all backend development. Deviations must be approved by the Lead Architect.

---

## 1. Design Pattern Placement Map

We follow a **Modular Monolith** architecture with strict separation of concerns.

| Layer | Design Pattern | Responsibility | Justification |
|-------|---------------|----------------|---------------|
| **Controller** | **Facade Pattern** | Entry point, DTO mapping, HTTP handling | Controllers must remain "dumb". They only delegate to a Facade/Service and return a standardized response. Blocks business logic leakage into HTTP layer. |
| **Service** | **Application Service Pattern** | Orchestration of business flows | Each service method corresponds to one business use case (e.g., `registerFarmer`, `calculateMarketAverage`). Handles transactions. |
| **Domain Logic** | **Strategy Pattern** | Complex business rules (Pricing, Eligibility) | Avoids `if/else` hell. Example: `InterestCalculationStrategy` (Standard vs Subsidized). |
| **Integrations** | **Adapter Pattern** | External APIs (SMS, Bank, Weather) | Decouples core logic from vendor-specific implementations. Easy to swap providers (e.g., Sparrow SMS <-> Aakash SMS). |
| **Creation** | **Factory Pattern** | Complex Object/DTO construction | Centralizes creation logic, especially for varying DTOs based on user role (Farmer vs Admin). |
| **Config** | **Centralized Configuration** | Environment & System Constants | No hardcoded values. Use `SystemConfigService` backed by DB/Redis. |
| **Cross-Cutting**| **Aspect (Interceptor) Pattern**| Logging, Auditing, Security | Keeps services clean. Annotations like `@LogActivity` or `@Secured` handle cross-cutting concerns. |

---

## 2. Current Architecture vs Target State

### 🔴 Identified Violations (Current State)
1. **God Classes**: `AuthService.java` (~500 lines) handles Registration, Login, OTP, Password Reset, and Redis Locking.
2. **Controller Logic**: `MarketPriceController.java` contains pagination fallback logic and direct stream filtering which belongs in the service.
3. **Concrete Integrations**: `SmsService.java` hardcodes vendor-specific (Sparrow/Aakash) logic and does not use an interface/adapter.
4. **Inconsistent API Response**: `ApiResponse` uses `success` (boolean) but requirements specify `status` (enum/string).

### 🟢 Target State (Refactored)
*   **Split AuthService**: `UserRegistrationService`, `AuthenticationService`, `UserProfileService`.
*   **Thin Controllers**: `MarketPriceController` delegates *all* filtering to `MarketPriceService`.
*   **Adapter Interface**: `SmsGateway` interface with `SparrowSmsAdapter` and `DevLoggingSmsAdapter`.
*   **Unified API Contract**: Standardize Generic Response to match Farmer-centric constraints.

---

## 3. Refactoring Plan (Non-Breaking)

### Phase 1: Structural Cleanup (Completed)
*   [x] **Extract Facades**: Create `MarketPriceFacade` to handle DTO mapping and obscure service complexity from `MarketPriceController`.
*   [x] **Interface Extraction**: Extract `SmsGateway` interface from `SmsService`.
*   [x] **Standardize Response**: Update `ApiResponse` to support `status`: "SUCCESS" (mapped from `success`: true).

### Phase 2: Service Decomposition (Completed)
*   [x] **Decompose AuthService**:
    *   Move OTP logic to `OtpService`.
    *   Move Redis lock logic to `SessionManagementService`.
    *   Keep `AuthService` only as a Facade or Coordinator.
*   [x] **Refactor MarketPriceController**: Remove lines 63-82 (pagination logic) and push to `MarketPriceService`.

### Phase 3: Pattern Enforcement (Ongoing)
*   [x] Apply **Strategy Pattern** for Price Calculations (`MarketPriceRuleEvaluator` refactored).
*   [x] Apply **Strategy Pattern** for Payment Gateways (`PaymentService` - abstract `Esewa`/`Khalti` selection).
*   [x] Apply **Strategy Pattern** for Order Processing (`OrderService` - abstract `Marketplace` vs `AgriStore` logic).
*   [x] Apply **Adapter Pattern** for Notification (`NotificationOrchestrator` & `SmsGateway` standardization).
*   [ ] Enforce **Factory Pattern** for creating `UserDto` to ensure consistent masking of sensitive data.

---

## 4. Coding Standards (System Law)

### Mandatory Constraints
1.  **Controllers**: Max **50 lines** of code. If longer, you are doing too much. Delegate.
2.  **Services**: No `HttpServletRequest`, `ResponseEntity`, or `DTO` mapping logic inside business methods (receive DTO/Entity, return Entity/DTO).
3.  **Repositories**: Never called from Controller.
4.  **Field Names**: CamelCase.
5.  **Constants**: No `public static final String` for config values. Use `SystemConfigService`.

### Code Style
*   **Lombok**: Use `@RequiredArgsConstructor` for Dependency Injection.
*   **Validation**: Use `jakarta.validation` annotations on DTOs, not manual checks in controllers.
*   **Logging**: Use `@Slf4j`. Log significant business events, not every step.

---

## 5. Backend-to-Frontend Contract (Farmer Centric)

### JSON Response Format
All APIs **MUST** return this structure.

```json
{
  "status": "SUCCESS",   // or "ERROR"
  "message": "Localized user-friendly message",
  "data": { ... }        // Object or Array
}
```

### Rules
1.  **Flatness**: Avoid deep nesting. `data.user.profile.address.district` -> `data.district`.
2.  **Localization**: `message` should be capable of being Nepali (or keys provided).
3.  **Null Safety**: `data` is `null` on error. Lists are empty `[]` never `null`.

---

## 6. SPA-Safe Behavior Rules

1.  **Statelessness**: No `HttpSession`. JWT only.
2.  **Idempotency**: `GET`, `PUT`, `DELETE` must be idempotent.
3.  **Concurrent Logins**: Enforce Single Session via Redis (already partially implemented).
4.  **Cache**: Use `ETag` or `Last-Modified` headers for heavy resources (like Market Prices).

---

## 7. PR Review Checklist

*   [ ] **Architecture**: Does logic live in the correct layer?
*   [ ] **Complexity**: Is the Controller under 50 lines?
*   [ ] **Security**: Is Input Validation present on DTOs?
*   [ ] **Performance**: Are there N+1 query issues? (Check Repositories).
*   [ ] **Localization**: Are error messages hardcoded strings?
*   [ ] **Testing**: Is there a unit test for the business logic?

---

## 8. Onboarding Guide for New Developers

### "The 1-Day Context"
1.  **Read this document.**
2.  **Clone & Run**: `mvn clean install` -> `docker-compose up`.
3.  **Architecture**: `Controller` -> `Facade` -> `Service` -> `Repository`.
4.  **Key Services**: `AuthService` (Security), `MarketPriceService` (Core Domain).
5.  **Database**: Postgres (Flyway managed). Never modify schema manually.

### "How to add a Feature"
1.  Define **Entity**.
2.  Create **Repository**.
3.  Create **DTOs** (Request/Response).
4.  Create **Service** (Business Logic + Transaction).
5.  Create **Controller** (Endpoint definition only).
6.  Add **Migration** (if DB changed).
