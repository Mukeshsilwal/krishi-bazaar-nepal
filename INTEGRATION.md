# Frontend-Backend Integration Guide

## Setup Instructions

### 1. Install Dependencies

```bash
npm install axios sockjs-client @stomp/stompjs
```

### 2. Configure Environment

Create `.env` file in the project root:

```env
VITE_API_URL=http://localhost:8080/api
VITE_WS_URL=http://localhost:8080/ws
VITE_ENV=development
```

### 3. Start Backend

```bash
cd backend
mvn spring-boot:run
```

Backend will run on `http://localhost:8080`

### 4. Start Frontend

```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## API Services Created

### 1. Authentication Service (`authService.js`)

- `register(userData)` - Register new user
- `login(mobileNumber)` - Request OTP
- `verifyOtp(mobileNumber, otp)` - Verify OTP and login
- `getCurrentUser()` - Get current user profile
- `updateProfile(profileData)` - Update user profile
- `logout()` - Logout user

### 2. Listing Service (`listingService.js`)

- `getListings(params)` - Get all listings with filters
- `getListing(id)` - Get single listing
- `getMyListings(page, size)` - Get farmer's listings
- `createListing(data)` - Create new listing
- `updateListing(id, data)` - Update listing
- `deleteListing(id)` - Delete listing
- `uploadImage(listingId, file, isPrimary)` - Upload image
- `searchListings(searchParams)` - Search with filters

### 3. Order Service (`orderService.js`)

- `createOrder(orderData)` - Place new order
- `getOrder(id)` - Get order details
- `getMyOrders(role, page, size)` - Get user's orders
- `updateOrderStatus(id, statusData)` - Update order status
- `cancelOrder(id)` - Cancel order

### 4. Payment Service (`paymentService.js`)

- `initiatePayment(paymentData)` - Start payment process
- `verifyPayment(transactionId, gatewayTransactionId)` - Verify payment
- `getTransaction(id)` - Get transaction details

### 5. Message Service (`messageService.js`)

- `sendMessage(messageData)` - Send message via REST
- `getConversations()` - Get all conversations
- `getConversation(userId)` - Get messages with user
- `getUnreadCount()` - Get unread message count
- `markAsRead(userId)` - Mark messages as read
- `connectWebSocket(onMessageReceived)` - Connect to WebSocket
- `sendMessageViaWebSocket(stompClient, messageData)` - Send via WebSocket
- `disconnectWebSocket(stompClient)` - Disconnect WebSocket

### 6. Market Price Service (`marketPriceService.js`)

- `getPrices(cropName, district)` - Get price history
- `getLatestPrice(cropName, district)` - Get latest price
- `getTodaysPrices()` - Get today's prices
- `getPricesByDate(date)` - Get prices by date
- `getAvailableCrops()` - Get crop list
- `getAvailableDistricts()` - Get district list

## React Context & Hooks

### AuthContext

Provides authentication state and methods throughout the app:

```jsx
import { useAuth } from './context/AuthContext';

function Component() {
  const { user, login, logout, isAuthenticated } = useAuth();
  
  // Use authentication methods
}
```

### Custom Hooks

**useListings(filters)**
```jsx
const { listings, loading, pagination, nextPage, prevPage } = useListings({
  cropName: 'टमाटर',
  district: 'Kathmandu',
});
```

**useOrders(role)**
```jsx
const { orders, loading, createOrder, updateStatus, cancelOrder } = useOrders('buyer');
```

## Protected Routes

Use `ProtectedRoute` component to protect routes:

```jsx
import ProtectedRoute from './components/ProtectedRoute';

<Route 
  path="/farmer/dashboard" 
  element={
    <ProtectedRoute requiredRole="FARMER">
      <FarmerDashboard />
    </ProtectedRoute>
  } 
/>
```

## Authentication Flow

### Registration

```jsx
const handleRegister = async (userData) => {
  const result = await authService.register({
    mobileNumber: userData.mobile,
    name: userData.name,
    role: userData.role,
    district: userData.district,
    ward: userData.ward,
    landSize: userData.landSize, // For farmers
  });
  
  if (result.success) {
    // OTP sent, show OTP verification screen
  }
};
```

### Login with OTP

```jsx
// Step 1: Request OTP
const handleRequestOtp = async (mobileNumber) => {
  const result = await authService.login(mobileNumber);
  if (result.success) {
    // Show OTP input
  }
};

// Step 2: Verify OTP
const handleVerifyOtp = async (mobileNumber, otp) => {
  const { success, data } = await login(mobileNumber, otp);
  if (success) {
    // User logged in, tokens stored
    navigate('/dashboard');
  }
};
```

## Usage Examples

### Create Listing

```jsx
const handleCreateListing = async (formData) => {
  // Create listing
  const result = await listingService.createListing({
    cropName: formData.cropName,
    quantity: formData.quantity,
    unit: formData.unit,
    pricePerUnit: formData.price,
    description: formData.description,
    location: formData.location,
    harvestDate: formData.harvestDate,
  });

  if (result.success) {
    // Upload images
    for (const file of formData.images) {
      await listingService.uploadImage(
        result.data.id,
        file,
        file === formData.images[0] // First image is primary
      );
    }
  }
};
```

### Place Order

```jsx
const handlePlaceOrder = async (listingId, quantity) => {
  const result = await orderService.createOrder({
    listingId,
    quantity,
    pickupDate: '2025-01-15',
    pickupLocation: 'Kathmandu',
    notes: 'Please call before delivery',
  });

  if (result.success) {
    // Order placed, navigate to payment
    navigate(`/payment/${result.data.id}`);
  }
};
```

### Process Payment

```jsx
const handlePayment = async (orderId, method) => {
  const result = await paymentService.initiatePayment({
    orderId,
    paymentMethod: method, // 'ESEWA' or 'KHALTI'
  });

  if (result.success) {
    // Redirect to payment gateway
    window.location.href = result.data.paymentUrl;
  }
};
```

### Real-time Chat

```jsx
import { useEffect, useState } from 'react';
import messageService from '../services/messageService';

function ChatComponent() {
  const [stompClient, setStompClient] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Connect to WebSocket
    const client = messageService.connectWebSocket((message) => {
      setMessages(prev => [...prev, message]);
    });
    setStompClient(client);

    return () => {
      messageService.disconnectWebSocket(client);
    };
  }, []);

  const sendMessage = (text, receiverId) => {
    messageService.sendMessageViaWebSocket(stompClient, {
      receiverId,
      message: text,
    });
  };

  return (
    // Chat UI
  );
}
```

## Error Handling

All API calls return a consistent format:

```javascript
{
  success: true/false,
  message: "Success/Error message",
  data: { ... } // Response data
}
```

Handle errors:

```jsx
try {
  const result = await listingService.createListing(data);
  if (result.success) {
    // Success
  } else {
    // Show error message
    toast.error(result.message);
  }
} catch (error) {
  // Network or unexpected error
  toast.error('Something went wrong');
}
```

## Next Steps

1. Update existing components to use new API services
2. Implement OTP verification UI
3. Add payment gateway integration UI
4. Build real-time chat interface
5. Add loading states and error handling
6. Implement image upload UI
7. Add market price display components

## Testing

1. Start backend: `cd backend && mvn spring-boot:run`
2. Start frontend: `npm run dev`
3. Test registration flow
4. Test listing creation
5. Test order placement
6. Test payment flow
7. Test real-time chat

## Troubleshooting

### CORS Issues
- Ensure backend CORS is configured for `http://localhost:5173`
- Check `application.yml` CORS settings

### Authentication Issues
- Check if tokens are stored in localStorage
- Verify JWT token format
- Check token expiration

### WebSocket Connection Issues
- Ensure WebSocket endpoint is accessible
- Check browser console for connection errors
- Verify authentication token is sent in headers
