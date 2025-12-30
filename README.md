# 🌾 KrishiHub Nepal

A comprehensive digital agricultural marketplace platform connecting farmers directly with buyers across Nepal.

## 🎯 Project Overview

KrishiHub Nepal is a full-stack web application designed to revolutionize agricultural commerce in Nepal by providing a direct marketplace for farmers to sell their crops and for buyers to purchase fresh produce at fair prices.

### Key Features

- 🔐 **Mobile OTP Authentication** - Secure login for farmers and buyers
- 🌾 **Crop Marketplace** - Browse, search, and filter agricultural products
- 📦 **Order Management** - Complete order lifecycle from placement to completion
- 💳 **Payment Integration** - eSewa and Khalti payment gateways
- 💬 **Real-time Chat** - Direct communication between buyers and farmers
- 📊 **Market Prices** - Track daily crop prices across districts
- 📱 **Mobile-First Design** - Optimized for mobile devices

## 🛠️ Technology Stack

### Backend
- **Java 17** with **Spring Boot 3.2.1**
- **PostgreSQL** - Database
- **Flyway** - Database migrations
- **JWT** - Authentication
- **WebSocket** - Real-time messaging
- **Cloudinary** - Image storage

### Frontend
- **React 18** with **TypeScript**
- **Vite** - Build tool
- **React Router** - Navigation
- **Axios** - HTTP client
- **Tailwind CSS** - Styling

## 🚀 Quick Start

### Prerequisites

- Java 17+
- Node.js 18+
- PostgreSQL 14+
- Maven 3.6+

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create PostgreSQL database
createdb krishihub

# Run the application
mvn spring-boot:run
```

Backend runs on: `http://localhost:8080`

### Frontend Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs on: `http://localhost:5173`

## 📖 Documentation

- **[SETUP.md](backend/SETUP.md)** - Detailed backend setup guide
- **[INTEGRATION.md](INTEGRATION.md)** - API integration reference
- **[COMPLETE_FLOW.md](COMPLETE_FLOW.md)** - End-to-end testing guide

## 🏗️ Project Structure

```
krishi-bazaar-nepal/
├── backend/                    # Spring Boot backend
│   ├── src/main/java/
│   │   └── com/krishihub/
│   │       ├── auth/          # Authentication module
│   │       ├── marketplace/   # Marketplace module
│   │       ├── order/         # Order module
│   │       ├── payment/       # Payment module
│   │       ├── messaging/     # Messaging module
│   │       └── marketprice/   # Market price module
│   └── src/main/resources/
│       └── db/migration/      # Database migrations
│
└── src/                       # React frontend
    ├── components/
    ├── context/
    ├── hooks/
    ├── pages/
    └── services/
```

## 🔑 Key Modules

### 1. Authentication
- Mobile OTP registration & login
- JWT token management
- Role-based access control (FARMER, BUYER, VENDOR, ADMIN)

### 2. Marketplace
- Crop listing creation & management
- Multi-image upload
- Advanced search & filtering
- Pagination & sorting

### 3. Order Management
- Order placement & tracking
- 7-state order lifecycle
- Farmer confirmation workflow
- Pickup scheduling

### 4. Payment Processing
- eSewa integration
- Khalti integration
- Payment verification
- Transaction tracking

### 5. Real-time Messaging
- WebSocket-based chat
- Conversation management
- Unread message tracking

### 6. Market Prices
- Daily price tracking
- District-wise pricing
- Historical price data

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Request OTP
- `POST /api/auth/verify-otp` - Verify OTP & login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/me` - Update profile

### Marketplace
- `GET /api/listings` - Browse listings
- `GET /api/listings/{id}` - Get listing details
- `POST /api/listings` - Create listing (Farmer)
- `PUT /api/listings/{id}` - Update listing
- `POST /api/listings/{id}/images` - Upload images

### Orders
- `POST /api/orders` - Place order
- `GET /api/orders/{id}` - Get order details
- `GET /api/orders/my` - Get my orders
- `PUT /api/orders/{id}/status` - Update status
- `DELETE /api/orders/{id}` - Cancel order

### Payments
- `POST /api/payments/initiate` - Initiate payment
- `POST /api/payments/verify` - Verify payment
- `GET /api/payments/{id}` - Get transaction

[See INTEGRATION.md for complete API documentation]

## 🧪 Testing

### Manual Testing Flow

1. **Register as Farmer**
   - Visit `/register`
   - Fill form with role "FARMER"
   - Verify OTP from console

2. **Create Listing** (via API or dashboard)
   ```bash
   curl -X POST http://localhost:8080/api/listings \
     -H "Authorization: Bearer TOKEN" \
     -d '{"cropName":"टमाटर","quantity":100,"unit":"kg","pricePerUnit":85}'
   ```

3. **Register as Buyer**
   - Use different mobile number
   - Role: "BUYER"

4. **Browse & Order**
   - Browse marketplace
   - Place order
   - Complete payment

5. **Complete Order Flow**
   - Farmer confirms
   - Buyer pays
   - Farmer marks ready
   - Buyer completes

## 🌐 Deployment

### Backend (Railway/Render)

```bash
# Build
mvn clean package

# Deploy
# Set environment variables in platform dashboard
```

### Frontend (Vercel/Netlify)

```bash
# Build
npm run build

# Deploy
# Connect GitHub repository
```

### Environment Variables

**Backend:**
```env
DATABASE_URL=jdbc:postgresql://...
JWT_SECRET=your-secret-key
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

**Frontend:**
```env
VITE_API_URL=https://api.krishihub.com
VITE_WS_URL=wss://api.krishihub.com/ws
```

## 🤝 Contributing

This is a proprietary project for KrishiHub Nepal.

## 📄 License

Proprietary - All rights reserved

## 👥 Team

Developed for KrishiHub Nepal

## 📞 Support

For issues or questions, please contact the development team.

---

**Built with ❤️ for Nepali Farmers**
