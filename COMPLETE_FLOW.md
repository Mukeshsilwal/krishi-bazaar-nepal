# KrishiHub Nepal - Complete Application Guide

## 🎯 Complete User Flow

### 1. Registration Flow
1. User visits `/register`
2. Fills registration form (mobile, name, role, district, ward)
3. Submits form → OTP sent to mobile
4. Enters OTP → Account created & logged in
5. Redirected to marketplace

### 2. Login Flow
1. User visits `/login`
2. Enters mobile number → OTP sent
3. Enters OTP → Logged in
4. Redirected to marketplace

### 3. Browse & Order Flow (Buyer)
1. Browse marketplace at `/`
2. Search/filter crops
3. Click on listing → View details at `/listing/:id`
4. Enter quantity → Place order
5. Order created → Redirected to `/orders/:id`
6. Wait for farmer confirmation

### 4. Confirm & Payment Flow
1. Farmer confirms order
2. Buyer receives notification
3. Buyer clicks "Pay with eSewa" or "Pay with Khalti"
4. Redirected to payment gateway
5. Complete payment
6. Payment verified → Order marked as PAID

### 5. Fulfillment Flow
1. Farmer prepares order
2. Farmer marks order as READY
3. Buyer picks up order
4. Buyer marks order as COMPLETED

## 🚀 Quick Start

### Backend Setup

```bash
# Navigate to backend
cd backend

# Start PostgreSQL (if not running)
# Create database: krishihub

# Run backend
mvn spring-boot:run
```

Backend runs on: `http://localhost:8080`

### Frontend Setup

```bash
# Install dependencies
npm install

# Start frontend
npm run dev
```

Frontend runs on: `http://localhost:5173`

## 📱 Testing the Complete Flow

### Step 1: Register as Farmer

1. Go to http://localhost:5173/register
2. Fill form:
   - Mobile: `9841234567`
   - Name: `Ram Bahadur`
   - Role: `Farmer`
   - District: `Kathmandu`
   - Ward: `5`
   - Land Size: `2.5`
3. Click "Create Account"
4. Check backend console for OTP (e.g., `123456`)
5. Enter OTP → Registered & logged in

### Step 2: Create Listing (Farmer)

Use API directly or create farmer dashboard:

```bash
curl -X POST http://localhost:8080/api/listings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cropName": "टमाटर (Tomato)",
    "quantity": 100,
    "unit": "kg",
    "pricePerUnit": 85,
    "description": "Fresh organic tomatoes",
    "location": "Kathmandu"
  }'
```

### Step 3: Register as Buyer

1. Logout (or use incognito)
2. Go to http://localhost:5173/register
3. Fill form:
   - Mobile: `9851234567`
   - Name: `Sita Sharma`
   - Role: `Buyer`
   - District: `Kathmandu`
4. Complete OTP verification

### Step 4: Browse & Order

1. Go to http://localhost:5173/
2. See tomato listing
3. Click on listing
4. Enter quantity: `10`
5. Click "Place Order"
6. Order created!

### Step 5: Confirm Order (Farmer)

1. Login as farmer
2. Go to order detail page
3. Click "Confirm Order"
4. Order status → CONFIRMED

### Step 6: Make Payment (Buyer)

1. Login as buyer
2. Go to order detail page
3. Click "Pay with eSewa" or "Pay with Khalti"
4. In development, you'll see mock payment URL
5. Payment auto-verified
6. Order status → PAID

### Step 7: Complete Order

1. Farmer marks as READY
2. Buyer picks up
3. Buyer marks as COMPLETED

## 🔑 Key Features Implemented

### Authentication
- ✅ Mobile OTP registration
- ✅ Mobile OTP login
- ✅ JWT token management
- ✅ Role-based access (FARMER, BUYER, VENDOR)
- ✅ Protected routes

### Marketplace
- ✅ Browse listings
- ✅ Search by crop name
- ✅ Filter by district, price
- ✅ Sort by price, date
- ✅ Pagination
- ✅ View listing details
- ✅ Multi-image support

### Orders
- ✅ Place order
- ✅ Order status tracking
- ✅ Farmer confirmation
- ✅ Pickup scheduling
- ✅ Order cancellation

### Payments
- ✅ eSewa integration
- ✅ Khalti integration
- ✅ Payment verification
- ✅ Transaction tracking

## 📂 Project Structure

```
krishi-bazaar-nepal/
├── backend/                    # Spring Boot backend
│   ├── src/main/java/com/krishihub/
│   │   ├── auth/              # Authentication module
│   │   ├── marketplace/       # Marketplace module
│   │   ├── order/             # Order module
│   │   ├── payment/           # Payment module
│   │   ├── messaging/         # Messaging module
│   │   └── marketprice/       # Market price module
│   └── src/main/resources/
│       ├── application.yml
│       └── db/migration/      # Database migrations
│
├── src/                       # React frontend
│   ├── components/
│   │   └── ProtectedRoute.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── hooks/
│   │   ├── useListings.js
│   │   └── useOrders.js
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── MarketplacePage.tsx
│   │   ├── ListingDetailPage.tsx
│   │   └── OrderDetailPage.tsx
│   └── services/
│       ├── api.js
│       ├── authService.js
│       ├── listingService.js
│       ├── orderService.js
│       ├── paymentService.js
│       ├── messageService.js
│       └── marketPriceService.js
│
└── INTEGRATION.md            # Integration guide
```

## 🎨 Pages Created

1. **LoginPage** - OTP-based login
2. **RegisterPage** - User registration with role selection
3. **MarketplacePage** - Browse and search listings
4. **ListingDetailPage** - View listing details and place order
5. **OrderDetailPage** - Manage order status and payments

## 🔄 API Endpoints Used

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Request OTP
- `POST /api/auth/verify-otp` - Verify OTP
- `GET /api/auth/me` - Get current user

### Listings
- `GET /api/listings` - Get all listings
- `GET /api/listings/:id` - Get listing details
- `POST /api/listings` - Create listing
- `POST /api/listings/:id/images` - Upload image

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/status` - Update order status
- `DELETE /api/orders/:id` - Cancel order

### Payments
- `POST /api/payments/initiate` - Initiate payment
- `POST /api/payments/verify` - Verify payment

## 🐛 Troubleshooting

### Backend Issues

**Database Connection Error:**
```bash
# Check PostgreSQL is running
# Create database if not exists
CREATE DATABASE krishihub;
```

**Port Already in Use:**
```bash
# Change port in application.yml
server:
  port: 8081
```

### Frontend Issues

**CORS Error:**
- Check backend CORS configuration in `application.yml`
- Ensure `http://localhost:5173` is in allowed origins

**Token Not Found:**
- Check localStorage for `accessToken`
- Try logging in again

**API Connection Failed:**
- Ensure backend is running on port 8080
- Check `.env` file has correct API URL

## 🚀 Next Steps

### Additional Features to Build

1. **Farmer Dashboard**
   - Create/manage listings
   - View orders
   - Upload images

2. **Buyer Dashboard**
   - Order history
   - Saved listings
   - Payment history

3. **Real-time Chat**
   - Buyer-Farmer messaging
   - WebSocket integration

4. **Market Prices**
   - View daily prices
   - Price trends
   - District-wise comparison

5. **Admin Panel**
   - User management
   - Listing moderation
   - Analytics

## 📝 Development Tips

1. **Check Backend Logs** for OTP codes during development
2. **Use Browser DevTools** to inspect API calls
3. **Test with Multiple Roles** (Farmer, Buyer)
4. **Use Incognito Mode** for testing different users

## 🎉 Success!

You now have a fully functional agricultural marketplace with:
- ✅ User authentication
- ✅ Crop listings
- ✅ Order management
- ✅ Payment integration
- ✅ Complete user flow

Happy coding! 🌾
