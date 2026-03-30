# 🏨 Hotel Room Reservation System

A production-ready full-stack application designed to optimally allocate hotel rooms for group bookings. The system manages 97 rooms across 10 floors and utilizes an advanced mathematical algorithm to minimize the physical travel time between requested rooms.

## ✨ Key Features

- **Advanced Allocation Algorithm**: 
  - **Phase 1 (Same-Floor Contiguous)**: Prioritizes keeping groups together on a single floor, finding the contiguous block nearest to the elevator/stairwell.
  - **Phase 2 (Cross-Floor Clustering)**: When contiguous rooms aren't available, uses a K-Nearest Neighbor (KNN) heuristic to form tight floor clusters.
  - **TSP Path Calculation**: Utilizes a precise permutation traversal (Traveling Salesperson heuristic) to find the absolute minimum true travel time coefficient for groups up to 5 rooms.
- **Enterprise-Grade Security**: Global rate limiting (`express-rate-limit`), request validation (`express-validator`), and HTTP header security (`helmet`).
- **Data Integrity**: Asynchronous Mutex lock implementation ensures zero race-conditions or double-bookings during concurrent traffic.
- **Modern React UI**: Premium dark-mode dashboard with real-time status tracking, animated room grids, and automated random occupancy generation for testing.

## 🛠️ Tech Stack

**Frontend:**
- React 18
- Vanilla CSS3 (Custom Design System)
- Concurrent API Polling Hooks

**Backend:**
- Node.js & Express
- Advanced Async Mutex Controllers
- `jest` (24/24 passing unit tests covering all edge cases)

## 🚀 Setup & Installation

### Prerequisites
- Node.js `v18.0.0` or higher
- NPM

### Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Firefistace20/hotel-reservation.git
   cd hotel-reservation
   ```

2. **Run the initial setup:**
   Install backend dependencies:
   ```bash
   npm install
   ```
   Install frontend dependencies:
   ```bash
   cd client
   npm install
   cd ..
   ```

3. **Start the development servers:**
   Open two terminal tabs:
   - **Terminal 1 (Backend)**: `npm run dev` (Runs on `http://localhost:3001`)
   - **Terminal 2 (Frontend)**: `cd client && npm start` (Runs on `http://localhost:3000`)

---

## 📡 API Reference

| Method | Endpoint | Description | Payload Example |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/rooms` | Retrieve all 97 rooms and their states | - |
| `GET` | `/api/stats` | Retrieve hotel occupancy statistics | - |
| `POST` | `/api/book` | Book optimal rooms for a group | `{ "count": 3 }` |
| `POST` | `/api/rooms/random-occupancy` | Randomly fill hotel (testing tool) | `{ "probability": 0.4 }` |
| `POST` | `/api/rooms/reset` | Clear all bookings | - |

---

## ☁️ Deployment

This project is configured for **Unified Production Deployment** (the Express server hosts the optimized React static build). This makes it perfectly built for one-click deployment on platforms like Render or Railway.

**Deployment Config:**
- **Build Command**: `npm run build` *(Installs backend, jumps to client, installs client, and creates the React production bundle)*
- **Start Command**: `npm start`
- **Environment Value**: `NODE_ENV=production`

## 🧪 Testing

The core algorithm is fully unit tested using Jest.

```bash
npm run test
```
*Current Coverage: 100% path coverage for `BookingService.js` allocation rules, constraints, edge cases, and math algorithms.*

---
*Built with React & Node.js*
