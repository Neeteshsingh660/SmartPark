# 🚗 SmartPark — Smart Parking Management System

<div align="center">

![SmartPark Banner](https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1200&q=80)

**A full-stack, production-ready parking management platform**  
built with Spring Boot · React · MySQL · Redis · Kafka · Docker

[![Java](https://img.shields.io/badge/Java-17-orange?style=flat-square&logo=openjdk)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-brightgreen?style=flat-square&logo=springboot)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-purple?style=flat-square&logo=vite)](https://vite.dev/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

</div>

---

## 📖 Overview

SmartPark connects **space owners** who want to monetise unused parking spots with **drivers** who need quick, hassle-free parking. The platform handles everything end-to-end — discovery, booking, real-time availability, payments, QR check-in/check-out, and automated refunds.

---

## ✨ Features

### 🔐 Authentication & Security
- JWT-based stateless authentication
- Role-based access control (`DRIVER`, `OWNER`, `ADMIN`)
- OTP email verification on signup
- Bcrypt password hashing

### 🅿️ Parking Spot Management (Owner)
- List, edit, and delete parking spots with photo uploads
- Interactive map location picker (OpenStreetMap + Nominatim geocoding)
- Address search with live autocomplete suggestions
- Set base price, peak price, capacity, operating hours, and amenities (Covered / Security / EV Charging)

### 📅 Booking System (Driver)
- Real-time spot availability calendar
- Book spots with vehicle details
- Upcoming reserved time-slot banner to avoid conflicts
- Redis distributed locking to prevent double-booking
- Booking filter tabs: **Upcoming · Past / Completed · Cancelled · All**

### 💳 Payments & Wallet
- **SmartPark Wallet** — balance credited on refunds and penalty compensation
- **Razorpay integration** for card/UPI/netbanking payments
- **Split payment** — pay part from wallet, rest via Razorpay
- Atomic wallet deduction inside `@Transactional` on payment verification

### ↩️ Smart Cancellation & Refund Policy

| Cancellation Timing | Driver Refund | Owner Compensation |
|---|---|---|
| > 2 hours before start | 100% to wallet | ₹0 |
| < 2 hours before start | 50% to wallet | 50% penalty credited to owner wallet |
| After start time | ₹0 | Full booking amount |

### 📱 QR Check-in / Check-out
- Unique QR code token per booking
- Owner scans driver QR via in-app camera scanner

### 📧 Notifications
- HTML email confirmation on successful booking (async via `@Async` + Spring Mail)
- Real-time WebSocket / STOMP notifications (Kafka-backed)
- OTP delivery for email verification

### 🗺️ Map & Discovery
- Interactive Leaflet map for drivers to find nearby spots
- Map auto-pans and reverse-geocodes on location selection
- Spot detail cards with amenity badges and distance

### 👑 Admin Panel
- User management
- Spot approval / moderation

---

## 🛠️ Tech Stack

### Backend
| Layer | Technology |
|---|---|
| Language | Java 17 |
| Framework | Spring Boot 3.x |
| Security | Spring Security + JWT |
| ORM | Spring Data JPA / Hibernate |
| Messaging | Apache Kafka |
| Real-time | WebSocket / STOMP |
| Mail | Spring Mail (SMTP / Gmail) |
| Payments | Razorpay Java SDK |
| Build | Maven |

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 19 |
| Build Tool | Vite 8 |
| Maps | Leaflet + React-Leaflet |
| WebSocket | STOMP.js + SockJS |
| Icons | Lucide React |
| Styling | Vanilla CSS (custom design system) |

### Infrastructure
| Component | Technology |
|---|---|
| Database | MySQL 8.0 |
| Cache & Locks | Redis 7.2 |
| Message Broker | Apache Kafka (KRaft mode) |
| Containerisation | Docker + Docker Compose |
| Frontend Server | Nginx 1.27 (Alpine) |

---

## 🏗️ Architecture

```text
                        ┌──────────────────────────────┐
                        │    Browser (React + Vite)     │
                        │       Port 3000 (Docker)      │
                        │       Port 5173 (Dev)         │
                        └──────────────┬───────────────┘
                                       │  HTTP / WebSocket
                        ┌──────────────▼───────────────┐
                        │         Nginx (Docker)        │
                        │  /api/* → backend:8080        │
                        │  /ws/*  → backend:8080 (WS)   │
                        └──────────────┬───────────────┘
                                       │
                        ┌──────────────▼───────────────┐
                        │    Spring Boot REST API       │
                        │         Port 8080             │
                        └──────┬──────────┬────────────┘
                               │          │
               ┌───────────────▼──┐  ┌───▼──────────────┐
               │   MySQL 8.0      │  │    Redis 7.2       │
               │  (Persistent DB) │  │  OTPs, Locks,     │
               │   Port 3307      │  │  Booking Locks    │
               └──────────────────┘  └──────────────────┘
                                            │
                        ┌───────────────────▼──────────┐
                        │    Apache Kafka (KRaft)       │
                        │   Async Notifications         │
                        │         Port 9092             │
                        └──────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- [Git](https://git-scm.com/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

> No local Java or Node.js installation required — everything runs in Docker.

### 1. Clone the Repository

```bash
git clone https://github.com/Neeteshsingh660/SmartPark.git
cd SmartPark
```

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```env
# Database
DB_USERNAME=root
DB_PASSWORD=your_mysql_password

# JWT
JWT_SECRET=your_super_secret_jwt_key_at_least_32_chars

# Email (Gmail SMTP — use an App Password)
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_gmail_app_password

# Razorpay (get from https://razorpay.com/docs/)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

> **Never commit `.env` to Git.** It is already in `.gitignore`.

### 3. Build & Run All Services

```bash
docker compose up -d --build
```

This starts five containers:

| Container | Service | Port |
|---|---|---|
| `smartpark-mysql` | MySQL 8.0 | `3307` (host) |
| `smartpark-redis` | Redis 7.2 | `6379` |
| `smartpark-kafka` | Apache Kafka | `9092` |
| `smartpark-backend` | Spring Boot API | `8080` |
| `smartpark-frontend` | React + Nginx | **`3000`** |

### 4. Open the App

```
http://localhost:3000
```

The backend API is also directly accessible at `http://localhost:8080`.

---

## 🔧 Development Mode

If you want hot-reload for frontend development:

```bash
# Terminal 1 — start infra + backend
docker compose up -d mysql redis kafka backend

# Terminal 2 — run frontend dev server
cd frontend
npm install
npm run dev
```

Frontend dev server: `http://localhost:5173`  
The Vite proxy automatically forwards `/api` and `/ws` to `localhost:8080`.

---

## 🐳 Docker Commands Reference

```bash
# Start all services
docker compose up -d --build

# View running containers
docker ps

# Stream backend logs
docker compose logs -f backend

# Stream frontend logs
docker compose logs -f frontend

# Stop all services
docker compose down

# Stop and wipe database volume
docker compose down -v

# Rebuild only the frontend
docker compose build frontend
docker compose up -d frontend
```

---

## 📂 Project Structure

```text
SmartPark/
├── src/                          # Spring Boot backend
│   └── main/java/com/smartpark/
│       ├── config/               # Security, Kafka, WebSocket config
│       ├── controller/           # REST controllers
│       │   ├── AuthController
│       │   ├── BookingController
│       │   ├── PaymentController
│       │   ├── ParkingController
│       │   ├── PublicParkingController
│       │   ├── WalletController
│       │   └── AdminController
│       ├── service/              # Business logic
│       │   ├── BookingService    # Bookings, cancellations, refunds
│       │   ├── PaymentService    # Wallet + Razorpay split payments
│       │   ├── EmailService      # Async HTML confirmation emails
│       │   ├── PublicParkingService
│       │   └── RedisLockService  # Distributed booking locks
│       ├── entity/               # JPA entities
│       │   ├── User              # + walletBalance field
│       │   ├── Booking           # + cancellationFee field
│       │   ├── ParkingSpot
│       │   ├── Payment           # VARCHAR(50) method column
│       │   ├── BookingStatus
│       │   └── PaymentMethod     # WALLET, RAZORPAY, CASH
│       ├── dto/                  # Request / Response DTOs
│       ├── repository/           # Spring Data JPA repositories
│       ├── kafka/                # Kafka producers & consumers
│       ├── security/             # JWT filter, UserDetails
│       └── util/                 # QR code, helper utilities
│
├── frontend/                     # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/             # Login, Register, OTP verification
│   │   │   ├── driver/           # MyBookings, PaymentModal, BookingModal
│   │   │   ├── owner/            # OwnerDashboard, SpotFormModal
│   │   │   ├── admin/            # Admin panel
│   │   │   ├── landing/          # Home page, spot discovery map
│   │   │   └── common/           # Navbar, Modal, Toast, LoadingSpinner
│   │   ├── context/              # AuthContext, ToastContext
│   │   ├── services/             # API client modules
│   │   └── main.jsx
│   ├── Dockerfile                # Multi-stage Node → Nginx build
│   ├── nginx.conf                # SPA routing + API proxy config
│   └── vite.config.js
│
├── Dockerfile                    # Backend multi-stage Maven → JRE build
├── docker-compose.yml            # Orchestrates all 5 services
├── pom.xml
└── README.md
```

---

## 🔐 Security Notes

- All sensitive credentials are loaded from environment variables — never hardcoded.
- `.env` is excluded from Git via `.gitignore`.
- JWT tokens are validated on every protected request via a custom `OncePerRequestFilter`.
- Wallet deductions and Razorpay verification are wrapped in `@Transactional` to prevent partial state.
- Redis locks prevent concurrent double-booking on the same time slot.

---


## 📄 License

This project is licensed under the [MIT License](LICENSE).
