# 🚀 TaskFlow — Project & Task Management Frontend

[![Next.js](https://img.shields.io/badge/Next.js-16.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![pnpm](https://img.shields.io/badge/pnpm-12.10-orange?style=for-the-badge&logo=pnpm)](https://pnpm.io/)

A modern, responsive, and robust **Fullstack Project & Task Management System** frontend built for the **Senior/Mid-Level Candidate Technical Assessment**. Designed with clean architecture, strict TypeScript typings, robust state synchronization, and a premium design system.

---

## 🌐 Live Deployment & API

- **Live Frontend (Vercel)**: [https://todo-task-frontend-three.vercel.app](https://todo-task-frontend-three.vercel.app/)
- **Live Backend API (Azure)**: `https://zmc-taskflow.centralindia.cloudapp.azure.com/api/v1`
- **Swagger / API Docs**: `https://zmc-taskflow.centralindia.cloudapp.azure.com/api/docs`

---

## 🔑 Test Credentials & Seeded Workspace

For instant assessment review, a complete workspace with projects and tasks has been pre-configured:

| Field | Value |
|---|---|
| **Account Email** | `apusutradhar77@gmail.com` |
| **Password** | *(Use password provided in assessment submission or test account)* |
| **Seeded Content** | **4 Projects**, **12 Tasks** (spanning `TODO`, `IN_PROGRESS`, `DONE` across `LOW` to `URGENT` priorities) |

> 💡 **Self-Registration**: You can also register a new account through the `/register` page with real email verification OTP delivery.

---

## ✨ Key Features

### 1. 🔐 Complete Authentication & Authorization Flow
- **Email & Password Login**: Instant JWT authentication with secure session persistence.
- **Registration with OTP Verification**: Automatic 6-digit OTP verification flow with resend countdown.
- **Password Recovery**: Complete 3-step recovery flow (`Forgot Password` ➔ `Verify Reset OTP` ➔ `Set New Password`).
- **Instant Profile Synchronization**: React Context (`AuthContext`) automatically synchronizes session state into memory on sign-in — eliminating empty profile delays and page reload flickers.
- **Automatic 401 Session Interceptor**: Transparently handles expired sessions and redirects to login.

### 2. 📊 Executive Dashboard
- **Key Metrics Grid**: Live counter metrics for Total Projects, Total Tasks, Completed Tasks, and Overdue Tasks.
- **Recent Projects Carousel**: Quick-access project cards showing member avatars, status badges, and description previews.
- **Urgent Tasks Watchlist**: Real-time overview of tasks requiring immediate attention.

### 3. 📁 Project Management Workspace
- **Full CRUD Support**: Create, edit, and delete projects with modal confirmations.
- **Dynamic Project Details (`/projects/[id]`)**: Deep-dive view of specific project tasks, progress metrics, and member lists.
- **Role-Based Access Control (RBAC)**:
  - **Owner**: Full administrative privileges including project deletion and member management.
  - **Admin / Member**: Collaborative privileges scoped to project role.
- **Team Collaboration Modal**: Search users by email/name, invite members, change roles, and remove collaborators with client-side deduplication.

### 4. 📝 Advanced Task Management
- **Status Lifecycle**: Tasks cycle seamlessly through `TODO`, `IN_PROGRESS`, and `DONE`.
- **Multi-Factor Filtering & Search**:
  - Search by task title or description.
  - Filter by Status (`ALL`, `TODO`, `IN_PROGRESS`, `DONE`).
  - Filter by Priority (`LOW`, `MEDIUM`, `HIGH`, `URGENT`).
  - Filter by Project association.
- **Task Modals**: Intuitive modal interfaces for creating, updating, and deleting tasks.
- **Due Date & Priority Badging**: Color-coded visual hierarchy for deadlines and severity.

---

## 🏗️ Architecture & Engineering Design

```
src/
├── app/                        # Next.js 16 App Router pages
│   ├── (auth)/                 # Route group for auth (Login, Register, OTP, Reset)
│   ├── projects/               # Projects listing & dynamic [id] details
│   ├── tasks/                  # Task board & filters
│   ├── page.tsx                # Dashboard overview
│   └── layout.tsx              # Root layout with AuthProvider & Toaster
├── components/                 # Modular, reusable UI components
│   ├── dashboard/              # Dashboard-specific metrics and widgets
│   ├── layout/                 # Navbar, Sidebar, and shell navigation
│   ├── projects/               # Project cards, creation and member modals
│   ├── tasks/                  # Task cards, creation and edit modals
│   └── ui/                     # Primitives (Buttons, Badges, Modals)
├── context/                    # React Context providers (AuthContext)
├── lib/
│   ├── api.ts                  # Axios client, interceptors & error handlers
│   ├── auth.ts                 # Storage helpers (cookie + localStorage sync)
│   ├── projectUtils.ts         # Member deduplication & data normalizers
│   ├── utils.ts                # Tailwind class mergers (clsx + twMerge)
│   └── services/               # 4-Pillar Service Layer
│       ├── authService.ts      # Authentication endpoints
│       ├── projectService.ts   # Project & member collaboration API
│       ├── taskService.ts      # Task filtering & CRUD API
│       └── dashboardService.ts # Dashboard overview API
└── types/                      # Strict TypeScript interfaces & DTOs
    ├── api.ts                  # Generic API & Paginated response models
    ├── auth.ts                 # Auth session & user profile types
    ├── dashboard.ts            # Overview statistics contracts
    ├── project.ts              # Project, Member & Query contracts
    └── task.ts                 # Task, Priority & Status contracts
```

### 💡 Architectural Highlights
1. **Decoupled Service Layer**: UI components never call raw Axios endpoints directly. All requests flow through typed services (`projectService`, `taskService`, `authService`, `dashboardService`), keeping pages testable and decoupled.
2. **Defensive Error Handling**: A centralized `getApiErrorMessage` utility normalizes disparate backend exceptions (Axios errors, NestJS HTTP exceptions, validation arrays, strings) into clean, human-readable notifications.
3. **Optimistic & Synchronized State**: In-memory React state seamlessly synchronizes with `localStorage` and cookies, eliminating blank-state flashes on client navigations.
4. **Zero-Lint & Zero-Type-Error Standard**: Strict TypeScript configuration ensuring 100% type safety (`tsc --noEmit` and `next build` exit with code 0).

---

## 🛠️ Getting Started Locally

### Prerequisites
- **Node.js**: `v20.x` or higher
- **Package Manager**: `pnpm` (recommended), `npm`, or `yarn`

### 1. Clone the repository
```bash
git clone https://github.com/apucsd/task-management-frontend.git
cd task-management-frontend
```

### 2. Install dependencies
```bash
pnpm install
```

### 3. Environment Configuration
Create a `.env.local` file in the root directory (refer to [`.env.example`](.env.example)):

```env
NEXT_PUBLIC_API_URL=https://zmc-taskflow.centralindia.cloudapp.azure.com/api/v1
```

> **Note**: If running against a local NestJS backend, set:
> `NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1`

### 4. Run Development Server
```bash
pnpm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production Build Verification
To test the production build locally:
```bash
pnpm run build
pnpm run start
```

---

## 🧪 Quality Assurance & Scripts

| Command | Description |
|---|---|
| `pnpm run dev` | Starts Next.js development server with Turbopack |
| `pnpm run build` | Compiles optimized production bundle |
| `pnpm run start` | Starts production server locally |
| `pnpm run lint` | Runs ESLint 9 code inspection |
| `pnpm exec tsc --noEmit` | Validates strict TypeScript types |

---

## 🚢 Deployment on Vercel

This application is built for native deployment on [Vercel](https://vercel.com):

1. Run the Vercel CLI from the root folder:
   ```bash
   vercel
   ```
2. Add the production environment variable:
   ```bash
   vercel env add NEXT_PUBLIC_API_URL production
   # Value: https://zmc-taskflow.centralindia.cloudapp.azure.com/api/v1
   ```
3. Deploy to production:
   ```bash
   vercel --prod
   ```

*Next.js App Router natively handles all dynamic routes (`/projects/[id]`, SSR, and client transitions) without requiring additional rewrite rules.*

---

## 👨‍💻 Candidate Submission Note

This assessment project highlights:
- **Clean Architecture**: Strong modularization across Types, Services, Context, and Components.
- **Enterprise UX**: Instant feedback via toast notifications, loading skeletons, responsive navigation, and accessible dialogs.
- **Resilience**: Thorough edge-case handling for token expiration, network errors, and unverified accounts.

Thank you for reviewing! Feel free to reach out with any questions.
