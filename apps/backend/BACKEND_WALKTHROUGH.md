# Backend Architecture Standardization Walkthrough

## 🎯 Changes Implemented

### 1. Architecture Map & Standards (`ARCHITECTURE.md`)
We have established a "Supreme Law" for the backend.
- **Design Pattern Map**: Defined where to use Facades, Adapters, Strategies.
- **Rules**: Enforced "Thin Controllers" and "Orchestrator Services".
- **Contract**: Defined `ApiResponse` structure with `status: SUCCESS` for farmers.

### 2. Service Decomposition: AuthService (Phase 2)
**Before**: `AuthService` was a 550+ line "God Class" handling OTPs, Locks, Login, and Registration.
**After**:
- **`OtpService`**: Extracted all OTP generation and verification logic.
- **`SessionManagementService`**: Extracted Redis lock enforcing single-login.
- **`AuthService`**: Now acts as a **Facade**, delegating to these services.
- **Benefit**: Adheres to Single Responsibility Principle (SRP). Easier to test OTP logic in isolation.

### 3. Strategy Pattern: Market Price Rules (Phase 2)
**Before**: `MarketPriceRuleEvaluator` had a rigid `evaluateRules` method with hardcoded calls to `checkUserAlerts` and `checkPriceSurge`.
**After**:
- **`PriceEvaluationRule` Interface**: Defines a common contract `void evaluate(MarketPriceDto price)`.
- **Implementations**: `UserAlertRule` and `PriceSurgeRule` implement the interface.
- **Evaluator**: Injects `List<PriceEvaluationRule>` and iterates.
- **Benefit**: Open-Closed Principle. New rules (e.g., `SeasonalBonusRule`) can be added without modifying the evaluator.

### 4. Strategy Pattern: Payment Gateways (Phase 3)
**Before**: `PaymentService` and `PaymentVerificationService` used `if-else` blocks to choose between `EsewaPaymentService` and `KhaltiPaymentService`.
**After**:
- **`PaymentStrategy` Interface**: Defines `initiatePayment` and `verifyPayment`.
- **Implementations**: `EsewaPaymentStrategy` and `KhaltiPaymentStrategy` implements logic.
- **Service**: `PaymentService` injects a Map of strategies.
- **Benefit**: Adding a new gateway (e.g., IME Pay) only requires adding a new `ImePayStrategy` class, adhering to Open-Closed Principle.

### 5. Adapter Pattern: SMS Integration (Phase 1)
**Before**: `AuthService` depended on a concrete `SmsService` with hardcoded `WebClient` logic.
**After**:
- Created `SmsGateway` Interface.
- Created `SparrowSmsGateway` (Implementation).
- Refactored `SmsService` to just delegate to the gateway.
- **Benefit**: We can switch to `AakashSMS` or `MockSMS` without touching `AuthService`.

### 6. Controller Cleanup: Market Prices
**Before**: `MarketPriceController` fetched *all* prices and filtered by District in-memory (Legacy support).
**After**:
- Added `getTodaysPricesList(district)` to Service.
- Controller simply delegates to this method.
- **Benefit**: Logic is in the Service/DB layer. Controller is dumb.

### 7. API Contract Standardization
**Before**: `ApiResponse` only had `success: boolean`.
**After**: Added `status: SUCCESS/ERROR` string field.
- **Benefit**: Satisfies the project requirement for explicit status fields while maintaining backward compatibility.

### 8. Strategy Pattern: Order Processing (Phase 4)
**Before**: `OrderService` contained complex `if-else` logic to distinct between `MARKETPLACE` (C2C) and `AGRI_STORE` (B2C) orders, including validation, creation, and stock management.
**After**:
- **`OrderProcessingStrategy` Interface**: Defines `createOrder`, `handlePaymentCompletion`, `handleOrderCancellation`.
- **Implementations**:
    - `MarketplaceOrderStrategy`: Handles C2C logic (Harvest dates, daily limits, quantity checks).
    - `AgriStoreOrderStrategy`: Handles B2C logic (Inventory check, stock deduction).
- **Service**: `OrderService` delegates to these strategies based on `OrderSource`.
- **Benefit**: Clean separation of concerns. Adding a new source (e.g., `AUCTION`) is now easy.

### 9. Notification Architecture Standardization
**Before**: `AuthService` and `NotificationEventListener` partially used `NotificationOrchestrator` but bypassed it for SMS, using a legacy `SmsService` directly.
**After**:
- Refactored `SmsMessageService` to use `SmsGateway` directly.
- Updated `AuthService` and `NotificationEventListener` to use `NotificationOrchestrator` for **all** notifications (Email & SMS).
- Deleted legacy `SmsService` to enforce the new architectural standard.
- **Benefit**: Centralized notification logic. Adding a new channel (e.g., WhatsApp) now automatically works for all services without code changes in `AuthService`.

### 10. Functional Implementation: Market Price Analytics (Phase 5)
**Before**: `MarketPriceController.getAnalytics` returned an empty mock list to satisfy the API contract, hiding missing business logic.
**After**:
- Implemented `MarketPriceService.getAnalytics`.
- Calculates real **Min/Max/Avg** prices over the last 30 days.
- Implemented **Trend Detection** algorithm: Compares last 7 days average vs previous 7 days to flag "UP", "DOWN", or "STABLE".
- **Benefit**: Provides real, actionable insights to farmers instead of placeholders.

### 11. Functional Implementation: Khalti Payment Integration (Phase 5)
**Before**: `KhaltiPaymentStrategy` was a development mock returning fake URLs.
**After**:
- Created `KhaltiProperties` to securely manage API keys.
- Implemented real `WebClient` calls to Khalti v2 API (`/epayment/initiate/`, `/epayment/lookup/`).
- **Benefit**: The system is now technically ready for production Khalti payments (pending valid credentials).

## 🧱 Verification

### Build Status
The backend compiles successfully with the new architecture.

```bash
[INFO] BUILD SUCCESS
```

### Artifacts Created
- `apps/backend/ARCHITECTURE.md`: The central documentation.
- `apps/backend/src/main/java/com/krishihub/payment/service/strategy/PaymentStrategy.java`: Payment Strategy Interface.
- `apps/backend/src/main/java/com/krishihub/payment/service/strategy/EsewaPaymentStrategy.java`: Implementation.
- `apps/backend/src/main/java/com/krishihub/payment/service/strategy/KhaltiPaymentStrategy.java`: Implementation.
- `apps/backend/src/main/java/com/krishihub/payment/config/KhaltiProperties.java`: Configuration.

## 🔮 Next Steps for Developers
1.  Read `ARCHITECTURE.md`.
2.  Add `app.payment.khalti.secret-key` to environment variables.
3.  Continue identifying "God Classes" (e.g., `OrderService` if it grows too large).
4.  Check `Notification` module for similar Strategy/Adapter opportunities (Email is a candidate).
