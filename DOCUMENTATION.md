# Lancaster Warranty System - Frontend Documentation

## 🎨 Overview
The frontend is a React application built with Vite and Tailwind CSS. It is designed to provide a seamless mobile-first experience for customers and a high-performance administrative panel for staff.

---

## 🛠 Features

### 1. **Customer Portal**
- **Scan-to-Register**: Scan a QR code on a Lancaster product to register for warranty.
- **Secure QR Flow**: The `s` parameter in URLs is base64-encoded to prevent manual serial-guessing.
- **Service Lookup**: Customers can track the repair status of their products via serial number.

### 2. **Admin Panel**
- **Analytics Dashboard**: Real-time stats on registered warranties and service statuses.
- **Product Management**: Create products, generate QR codes, and export lists.
- **Bulk QR Printing**: Tools for generating printable labels for factory apply.
- **Service Management**: Move repair tickets through the "Accept", "Service", and "Delivery" stages.

### 3. **Infrastructure & Security**
- **Context API Architecture**: Centralized `AuthContext` for login state and `DataContext` for caching large product/customer lists.
- **Protected Routing**: Role-based access control (RBAC) ensuring only authorized admins can access management pages.
- **CSP Compliance**: Configured in `vercel.json` to block XSS (Cross-Site Scripting) and prevent clickjacking.
- **Rate Limit Feedback**: User-friendly UI messages for locked accounts or throttled IP addresses.

---

## 📂 Folder Structure

### `src/Context/`
- `AuthContext.jsx`: Handles login logic and JWT storage. Includes role-based logic for "Service Team" vs. "Full Admins".
- `DataContext.jsx`: Optimized data caching for customers, products, and registrations to minimize redundant API calls.

### `src/pages/`
- `CustomerHome.jsx`: Landing page after QR scan.
- `RegisterWarranty.jsx`: Multi-step form for customer details and product verification.
- `Dashboard.jsx`: Main admin overview with charts and recent activity.
- `Products.jsx`: Inventory list and QR code generator tool.
- `ServiceDashboard.jsx`: Real-time tracking of active repairs.

### `src/api/`
- `axios.js`: Central axios configuration with automatic Authorization headers.

---

## 🚀 Deployment (Vercel/Netlify)
- **Framework**: Vite
- **Node Version**: 18.x
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Rewrite Rules**: Configured in `vercel.json` to ensure React Router paths (e.g., `/dashboard`) work correctly after page refresh.


### QR logic

- `generateQRCode(serialNumber, modelNumber)`
  - URL: `${baseUrl}/register-warranty?model=${modelNumber}&s=${base64(serialNumber)}`
  - produces data URL image.

---

## Core Flows

### Add product + QR
1. Admin creates product in `Products.jsx` form.
2. Backend `createProduct` checks duplicate serial.
3. `generateQRCode` builds payload and stores `qrCodeUrl`.
4. Product appears in grid and print preview.

### Customer scan + register
1. Scan code with mobile using `RegisterWarranty` camera.
2. If URL has `s` + `model`, form pre-fills with model and encoded serial.
3. `RegisterWarranty` fetches product details by serial.
4. Submit registration to `POST /register`.

### Security improvement made
- Removed `?serial=` from QR payload.
- Added `s` token base64(serial) + optional `model`.
- Retains fallback for old `serial` param.

---

## API Endpoints

### Auth
- `POST /api/auth/login`
- `POST /api/auth/register`

### Products
- `GET /api/products` (protected)
- `GET /api/products/:serial` (public)
- `POST /api/products` (protected)
- `POST /api/products/bulk` (protected)
- `DELETE /api/products/:id` (protected)
- `DELETE /api/products` (bulk, protected)

### Registration
- `POST /api/register` (public)
- `GET /api/register` (protected)
- `PUT /api/register/:id` (protected)
- `DELETE /api/register/:id` (protected)
- `DELETE /api/register` (bulk protected)

### Service
- `/api/service` with list and update routes.

---

## Security

- Password verify for deletion operations.
- Business logic ensures protected updates on core data.
- Use HTTPS on production for all endpoints.

### To further harden
- Replace base64 token with secure JWT/HMAC URL token.
- Rate limit registration endpoint.
- Validate `modelNumber` from token URL.

---

## Deployment

### Frontend
- Build: `npm run build`.
- Serve static from Netlify/Vercel or any static host.

### Backend
- `npm run start` or `npm run dev`.
- Ensure `MONGO_URI` in environment.
- `FRONTEND_URL` should match actual public frontend URL.

---

## Troubleshooting

- Favicon path for Vite should be `/src/assets/Logo11.png` in `frontend/index.html`.
- On auth failure, verify `JWT_SECRET` and token expiry.
- On product scanning mismatch, confirm `s` base64 decode of expected serial.

---

## Notes

- Keep docs in `DOCUMENTATION.md` and move to `/docs/` if desired.
- Add extra subsections as technology evolves.

---

## Quick commands

- `npm i` in both directories
- `npm run dev` in both directories
- `npm test` currently placeholder

---
## Today’s Updates (21 March 2026)

### Frontend
- Added functional "Forgot password" flow in `frontend/src/pages/AdminLogin.jsx`.
- New modal form includes email + current password + new password.
- Added visual status feedback for success/failure in modal (`ShieldCheck`, red error banner).
- Fixed modal submission scope: moved modal outside login form so password reset does not trigger login submission.
- Updated API call to `POST /api/auth/forgot-password`.
- Added `ShieldCheck` import to avoid runtime icon errors.

### Backend
- Replaced `changePassword` with `forgotPassword` in `webbackend/controllers/authController.js`.
- `forgotPassword` verifies current password, hashes new password with bcrypt, and updates using `findByIdAndUpdate` (robust against pre-save double-hashing issues).
- Added route `POST /api/auth/forgot-password` in `webbackend/routes/authRoutes.js`.
- Added seeded admin user `admin1@lancaster.com` in `webbackend/seedAdmin.js`.
- Reset all admin passwords in DB to `lancaster@123` with correct hashing.

### Notifications
- Enhanced `Navbar` and service logic to auto-load notifications (unread count + list) without manual click; the bell count refreshes every 10 seconds.
- Added service-specific notifications for `SERVICE_IN_PROGRESS` and `SERVICE_RETURNED` with technician name in message.

### QR Expiry and Service Dashboard
- `Products.jsx` now marks QR records created more than 24 hours ago as `Locked`, with `Deletable` only for records within the first 24 hours.
- Backend checks in `productController` reject deletes beyond 24h and returns count details for `deleted` vs `blocked`.
- AdminFooter and navbar now support a dedicated **Service dashboard** context with minimal service-only nav links (SERVICE_PORTAL mode) separated from main admin links.

### Verification
- Frontend production build passes: `vite build` success verified.
- No more 400 login errors from forgot-password flow.

---
## Conclusion

This file is the complete A-Z guidance for your app. Modify with your own environment values and continue iteration.
