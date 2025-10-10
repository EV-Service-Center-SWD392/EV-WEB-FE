# EV Service Center Frontend - React/Next.js Application

[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.0-38B2AC.svg)](https://tailwindcss.com/)
[![Shadcn/ui](https://img.shields.io/badge/Shadcn/ui-Latest-black.svg)](https://ui.shadcn.com/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

**Giao diện người dùng hiện đại cho hệ thống quản lý bảo dưỡng xe điện**

Ứng dụng web frontend được xây dựng với Next.js 15, React 19, và Shadcn UI, cung cấp giao diện tối giản, hiện đại và responsive cho hệ thống quản lý trung tâm bảo dưỡng xe điện.

---

## � Mục lục

- [Tổng quan](#-tổng-quan)
- [Kiến trúc hệ thống](#-kiến-trúc-hệ-thống)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Tính năng chính](#-tính-năng-chính)
- [Cài đặt và triển khai](#-cài-đặt-và-triển-khai)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [Design System](#-design-system)
- [State Management](#-state-management)
- [Authentication](#-authentication)
- [Đóng góp](#-đóng-góp)

---

## 🎯 Tổng quan

EV Service Center Frontend là ứng dụng web single-page được thiết kế theo **Clean Architecture** và **Component-Driven Development**, đảm bảo tính mở rộng, bảo trì và tái sử dụng cao. Ứng dụng phục vụ 4 nhóm người dùng chính:

- **Customer (Khách hàng)**: Dashboard theo dõi xe, đặt lịch dịch vụ, quản lý chi phí
- **Staff (Nhân viên)**: Quản lý lịch hẹn, tiếp nhận yêu cầu khách hàng
- **Technician (Kỹ thuật viên)**: Dashboard công việc, cập nhật tiến độ bảo dưỡng
- **Admin (Quản trị viên)**: Dashboard tổng quan, quản lý users, bookings, inventory, revenue

---

## 🏗️ Kiến trúc hệ thống

Dự án được tổ chức theo **Feature-Based Architecture** với **Separation of Concerns**:

```
┌─────────────────────────────────────────┐
│            Presentation Layer            │
│         (Pages & Layouts)               │
│   • App Router (Next.js 15)             │
│   • Route Groups & Layouts               │
│   • Server Components & Client Components│
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│          Component Layer                 │
│        (UI Components)                  │
│   • Feature Components                   │
│   • Shadcn UI Components                │
│   • Custom Reusable Components          │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         Business Logic Layer             │
│       (Hooks & Services)                │
│   • Custom Hooks                        │
│   • API Services                        │
│   • State Management (Zustand)          │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│           Data Layer                     │
│        (Types & Entities)               │
│   • TypeScript Interfaces               │
│   • API Response Types                  │
│   • Business Domain Models              │
└─────────────────────────────────────────┘
```

### Nguyên tắc thiết kế

- **Atomic Design**: Components được tổ chức theo atoms, molecules, organisms
- **Container/Presentational Pattern**: Tách logic và UI components
- **Custom Hooks**: Business logic được abstract vào custom hooks
- **Type Safety**: Full TypeScript coverage với strict mode
- **Responsive First**: Mobile-first design approach

---

## 🛠️ Công nghệ sử dụng

### Core Framework

- **Next.js 15.5.4** - React framework với App Router
- **React 19.1.0** - UI library với Server Components
- **TypeScript 5.0** - Static type checking

### UI & Styling

- **Tailwind CSS 4.0** - Utility-first CSS framework
- **Shadcn/ui** - Modern component library
- **Radix UI** - Headless UI primitives
- **Lucide React** - Beautiful icon library
- **Class Variance Authority** - Component variants
- **Tailwindcss Animate** - Animation utilities

### State Management & Data Fetching

- **Zustand 5.0.8** - Lightweight state management
- **TanStack Query 5.90.2** - Server state management
- **Axios 1.12.2** - HTTP client
- **React Hook Form 7.64.0** - Form management
- **Zod 4.1.11** - Schema validation

### Development Tools

- **ESLint 9.0** - Code linting
- **Prettier 3.6.2** - Code formatting
- **Turbopack** - Fast bundler (Next.js)

---

## ✨ Tính năng chính

### 1. 🏠 Landing Page & Authentication

#### a. Landing Page

- ✅ **Hero Section**: CTA rõ ràng và compelling
- ✅ **Features Section**: Tính năng nổi bật của hệ thống
- ✅ **Services Section**: Dịch vụ bảo dưỡng xe điện
- ✅ **Modern Design**: Minimal, clean với Shadcn UI
- ✅ **Responsive**: Tối ưu cho mọi thiết bị

#### b. Authentication System

- ✅ **Login/Register**: Form validation với Zod
- ✅ **Forgot Password**: Reset password workflow
- ✅ **Role-based Routing**: Điều hướng theo role
- ✅ **Auto-logout**: Session management
- ✅ **JWT Integration**: Token-based authentication

### 2. 👑 Admin Dashboard (Comprehensive Management)

#### a. Dashboard Overview

- ✅ **Statistics Cards**: Tổng quan users, bookings, revenue, inventory
- ✅ **Quick Actions**: Shortcut đến các tính năng chính
- ✅ **Recent Activities**: Timeline hoạt động gần đây
- ✅ **System Status**: Health check và notifications

#### b. Manager Users

- ✅ **User Table**: Danh sách users với 4 roles (Admin, Staff, Technician, Member)
- ✅ **CRUD Operations**: Thêm, sửa, xóa, kích hoạt/khóa users
- ✅ **Advanced Filters**: Tìm kiếm theo tên, email, role, trạng thái
- ✅ **Bulk Actions**: Xử lý hàng loạt users
- ✅ **Export Data**: Xuất danh sách ra Excel/CSV

#### c. Manager Bookings

- ✅ **Booking Table**: Quản lý lịch đặt sửa chữa xe điện
- ✅ **Status Tracking**: Pending → Confirmed → In Progress → Completed
- ✅ **Booking Details**: STT, khách hàng, loại xe, hãng xe, trung tâm, kỹ thuật viên
- ✅ **Time Management**: Thời gian đặt, thời gian sửa, deadline
- ✅ **Parts Integration**: Liên kết với inventory parts
- ✅ **Advanced Filters**: Theo khách hàng, trạng thái, dịch vụ, ngày

#### d. Manager Inventory

- ✅ **Parts Management**: Quản lý bộ phận xe, linh kiện
- ✅ **Stock Tracking**: Số lượng tồn kho real-time
- ✅ **Multi-location**: Quản lý theo trung tâm dịch vụ
- ✅ **Vehicle Compatibility**: Hãng xe, loại xe tương thích
- ✅ **Stock Alerts**: Cảnh báo hết hàng, tồn kho thấp
- ✅ **Cost Management**: Giá nhập, giá bán, profit tracking

#### e. Manager Revenue

- ✅ **Revenue Dashboard**: Thống kê doanh thu tổng quan
- ✅ **Time-based Analysis**: Theo ngày, tuần, tháng, quý, năm
- ✅ **Service Center Comparison**: So sánh doanh thu các trung tâm
- ✅ **Revenue Breakdown**: Dịch vụ vs Linh kiện
- ✅ **Growth Tracking**: Tỷ lệ tăng trưởng, trends
- ✅ **Export Reports**: Báo cáo Excel/PDF

### 3. 👷 Staff Dashboard (Service Management)

#### a. Staff Overview

- ✅ **Today's Appointments**: Lịch hẹn hôm nay
- ✅ **Pending Requests**: Yêu cầu chờ xử lý
- ✅ **Service Queue**: Hàng đợi dịch vụ
- ✅ **Quick Stats**: Thống kê nhanh công việc

#### b. Appointment Management

- ✅ **Appointment Calendar**: Lịch hẹn theo calendar view
- ✅ **Customer Communication**: Chat/note với khách hàng
- ✅ **Service Assignment**: Phân công kỹ thuật viên
- ✅ **Status Updates**: Cập nhật tiến độ service

### 4. 🔧 Technician Dashboard (Work Management)

#### a. Work Queue

- ✅ **Assigned Tasks**: Công việc được phân công
- ✅ **Task Progress**: Cập nhật tiến độ từng công việc
- ✅ **Parts Request**: Yêu cầu linh kiện cần thiết
- ✅ **Work Reports**: Báo cáo hoàn thành công việc

#### b. Technical Tools

- ✅ **EV Checklist**: Checklist chuẩn cho xe điện
- ✅ **Diagnostic Tools**: Công cụ chẩn đoán
- ✅ **Part Scanner**: Scan QR/barcode linh kiện
- ✅ **Photo Upload**: Chụp ảnh trước/sau service

### 5. 👤 Member Dashboard (Customer Portal)

#### a. Vehicle Management

- ✅ **My Vehicles**: Danh sách xe của khách hàng
- ✅ **Service History**: Lịch sử bảo dưỡng chi tiết
- ✅ **Maintenance Reminders**: Nhắc nhở bảo dưỡng định kỳ
- ✅ **Vehicle Health**: Tình trạng sức khỏe xe

#### b. Booking System

- ✅ **Book Service**: Đặt lịch bảo dưỡng/sửa chữa
- ✅ **Service Centers**: Chọn trung tâm gần nhất
- ✅ **Time Slots**: Chọn khung giờ phù hợp
- ✅ **Service History**: Theo dõi trạng thái đặt lịch

---

## 🚀 Cài đặt và triển khai

### Yêu cầu hệ thống

- **Node.js 18+** hoặc cao hơn
- **npm 9+** hoặc **yarn 1.22+**
- **Git**

### 1. Clone repository

```bash
git clone https://github.com/EV-Service-Center-SWD392/EV_SCMMS_BE.git
cd EV-Service-Center-SWD/fe-website
```

### 2. Cài đặt dependencies

```bash
# Sử dụng npm
npm install

# Hoặc sử dụng yarn
yarn install
```

### 3. Cấu hình environment variables

Tạo file `.env.local` trong root directory:

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
NEXT_PUBLIC_API_TIMEOUT=30000

# Authentication
NEXT_PUBLIC_JWT_SECRET=your_jwt_secret_key
NEXT_PUBLIC_TOKEN_EXPIRY=3600

# App Configuration
NEXT_PUBLIC_APP_NAME="EV Service Center"
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_ENVIRONMENT=development

# External Services (Optional)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
NEXT_PUBLIC_FIREBASE_CONFIG=your_firebase_config
```

**⚠️ Lưu ý**: File này đã được thêm vào `.gitignore` để bảo mật thông tin nhạy cảm.

### 4. Chạy development server

```bash
# Sử dụng npm
npm run dev

# Hoặc sử dụng yarn
yarn dev
```

### 5. Build production

```bash
# Build ứng dụng
npm run build

# Chạy production server
npm run start
```

### 6. Linting và formatting

```bash
# Chạy ESLint
npm run lint

# Format code với Prettier
npx prettier --write .
```

### 7. Truy cập ứng dụng

- **Development**: `http://localhost:3000`
- **Production**: Tùy thuộc vào deployment platform

---

## 📁 Cấu trúc dự án

```
fe-website/
├── public/                               # Static assets
│   ├── favicon.ico
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
│
├── src/
│   ├── app/                             # Next.js App Router
│   │   ├── layout.tsx                   # Root layout
│   │   ├── page.tsx                     # Home page
│   │   ├── not-found.tsx               # 404 page
│   │   ├── globals.css                  # Global styles
│   │   │
│   │   ├── (auth)/                     # Auth route group
│   │   │   ├── layout.tsx              # Auth layout
│   │   │   ├── login/page.tsx          # Login page
│   │   │   ├── register/page.tsx       # Register page
│   │   │   ├── forgot-password/page.tsx # Forgot password
│   │   │   ├── reset-password/page.tsx  # Reset password
│   │   │   └── sign-out/page.tsx       # Sign out
│   │   │
│   │   ├── admin/                      # Admin routes
│   │   │   ├── layout.tsx              # Admin layout
│   │   │   ├── dashboard/page.tsx      # Admin dashboard
│   │   │   ├── manager-users/page.tsx  # User management
│   │   │   ├── manager-bookings/page.tsx # Booking management
│   │   │   ├── manager-inventory/page.tsx # Inventory management
│   │   │   └── manager-revenue/page.tsx  # Revenue management
│   │   │
│   │   ├── staff/                      # Staff routes
│   │   │   ├── layout.tsx              # Staff layout
│   │   │   └── dashboard/page.tsx      # Staff dashboard
│   │   │
│   │   ├── technician/                 # Technician routes
│   │   │   ├── layout.tsx              # Technician layout
│   │   │   └── dashboard/page.tsx      # Technician dashboard
│   │   │
│   │   └── member/                     # Member routes
│   │       ├── layout.tsx              # Member layout
│   │       └── dashboard/page.tsx      # Member dashboard
│   │
│   ├── components/                     # React components
│   │   ├── ui/                        # Shadcn UI components
│   │   │   ├── button.tsx             # Button component
│   │   │   ├── card.tsx               # Card component
│   │   │   ├── input.tsx              # Input component
│   │   │   ├── label.tsx              # Label component
│   │   │   ├── select.tsx             # Select component
│   │   │   ├── table.tsx              # Table component
│   │   │   ├── badge.tsx              # Badge component
│   │   │   ├── avatar.tsx             # Avatar component
│   │   │   ├── separator.tsx          # Separator component
│   │   │   ├── LoadingSpinner.tsx     # Loading component
│   │   │   └── ErrorBoundary.tsx      # Error boundary
│   │   │
│   │   ├── home/                      # Landing page components
│   │   │   ├── HeroSection.tsx        # Hero section
│   │   │   ├── FeaturesSection.tsx    # Features section
│   │   │   ├── ServicesSection.tsx    # Services section
│   │   │   ├── CTASection.tsx         # Call-to-action
│   │   │   └── index.ts               # Barrel exports
│   │   │
│   │   ├── pages/                     # Page components
│   │   │   ├── LandingPage.tsx        # Landing page
│   │   │   ├── NotFoundPage.tsx       # 404 page
│   │   │   └── admin/                 # Admin page components
│   │   │       ├── AdminDashboardPage.tsx
│   │   │       ├── ManagerUsersPage.tsx
│   │   │       ├── ManagerBookingsPage.tsx
│   │   │       ├── ManagerInventoryPage.tsx
│   │   │       └── ManagerRevenuePage.tsx
│   │   │
│   │   ├── admin/                     # Admin-specific components
│   │   │   ├── AdminNavbar.tsx        # Admin navigation
│   │   │   ├── AdminSidebar.tsx       # Admin sidebar
│   │   │   ├── UserFilters.tsx        # User filters
│   │   │   ├── UserTable.tsx          # User table
│   │   │   ├── UserForm.tsx           # User form
│   │   │   ├── BookingFilters.tsx     # Booking filters
│   │   │   ├── BookingTable.tsx       # Booking table
│   │   │   ├── BookingForm.tsx        # Booking form
│   │   │   ├── InventoryFilters.tsx   # Inventory filters
│   │   │   ├── InventoryTable.tsx     # Inventory table
│   │   │   └── InventoryForm.tsx      # Inventory form
│   │   │
│   │   ├── staff/                     # Staff-specific components
│   │   │   ├── StaffNavbar.tsx        # Staff navigation
│   │   │   └── StaffSidebar.tsx       # Staff sidebar
│   │   │
│   │   ├── technician/                # Technician-specific components
│   │   │   ├── TechnicianNavbar.tsx   # Technician navigation
│   │   │   └── TechnicianSidebar.tsx  # Technician sidebar
│   │   │
│   │   ├── Navbar.tsx                 # Main navigation
│   │   ├── Footer.tsx                 # Footer component
│   │   └── AuthInitializer.tsx        # Auth initialization
│   │
│   ├── entities/                      # TypeScript type definitions
│   │   ├── user.types.ts              # User-related types
│   │   ├── booking.types.ts           # Booking-related types
│   │   ├── inventory.types.ts         # Inventory-related types
│   │   └── revenue.types.ts           # Revenue-related types
│   │
│   ├── services/                      # API services
│   │   ├── api.ts                     # Base API configuration
│   │   ├── auth.ts                    # Authentication service
│   │   ├── mockAuth.ts                # Mock auth for development
│   │   ├── userService.ts             # User API calls
│   │   ├── bookingService.ts          # Booking API calls
│   │   ├── inventoryService.ts        # Inventory API calls
│   │   └── revenueService.ts          # Revenue API calls
│   │
│   ├── stores/                        # State management
│   │   └── auth.ts                    # Auth store (Zustand)
│   │
│   ├── hooks/                         # Custom React hooks
│   │   └── useAsync.ts                # Async operations hook
│   │
│   ├── lib/                          # Utility libraries
│   │   ├── utils.ts                   # Utility functions
│   │   └── providers.tsx              # React providers
│   │
│   └── styles/                        # Additional styles
│
├── .env.example                       # Environment variables template
├── .env.local                         # Local environment (gitignored)
├── .gitignore                         # Git ignore rules
├── components.json                    # Shadcn UI configuration
├── eslint.config.mjs                  # ESLint configuration
├── middleware.ts                      # Next.js middleware
├── next.config.ts                     # Next.js configuration
├── next-env.d.ts                      # Next.js type definitions
├── package.json                       # Project dependencies
├── postcss.config.mjs                 # PostCSS configuration
├── README.md                          # Project documentation
├── tailwind.config.js                 # Tailwind CSS configuration
└── tsconfig.json                      # TypeScript configuration
```

---

## 🎨 Design System

### Shadcn/ui Component Library

Dự án sử dụng **Shadcn/ui** - một component library hiện đại được xây dựng trên **Radix UI** và **Tailwind CSS**.

#### Core Design Tokens

```typescript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // Semantic color system
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        secondary: "hsl(var(--secondary))",
        "secondary-foreground": "hsl(var(--secondary-foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
      },
    },
  },
};
```

#### Design Principles

1. **Consistent Spacing**: Sử dụng Tailwind spacing scale (4px base)
2. **Minimal Color Palette**: Chủ yếu trắng, xám, đen cho professional look
3. **Typography Hierarchy**: Clear font sizes và weights
4. **Accessibility First**: WCAG 2.1 AA compliant
5. **Responsive Design**: Mobile-first approach

---

## 🔄 State Management

### Zustand Store Architecture

```typescript
// stores/auth.ts
interface AuthState {
  // State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  updateUser: (user: User) => void;
}

const useAuthStore = create<AuthState>((set, get) => ({
  // Implementation
}));
```

### TanStack Query for Server State

```typescript
// hooks/useUsers.ts
export const useUsers = (filters: UserFilters) => {
  return useQuery({
    queryKey: ["users", filters],
    queryFn: () => userService.getUsers(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userService.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
    },
  });
};
```

---

## 🔐 Authentication

### JWT Token Management

```typescript
// services/auth.ts
class AuthService {
  private tokenKey = "ev_service_token";

  async login(credentials: LoginCredentials): Promise<AuthResult> {
    const response = await api.post("/auth/login", credentials);
    const { token, user } = response.data;

    localStorage.setItem(this.tokenKey, token);
    this.setAuthHeader(token);

    return { token, user };
  }

  async refreshToken(): Promise<string> {
    const response = await api.post("/auth/refresh");
    const { token } = response.data;

    localStorage.setItem(this.tokenKey, token);
    this.setAuthHeader(token);

    return token;
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    delete api.defaults.headers.common["Authorization"];
  }
}
```

### Route Protection

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value;
  const { pathname } = request.nextUrl;

  // Public routes
  if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
    return NextResponse.next();
  }

  // Protected routes
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Role-based routing
  const userRole = getUserRoleFromToken(token);
  if (pathname.startsWith("/admin") && userRole !== "admin") {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return NextResponse.next();
}
```

---

## 📱 Responsive Design

### Breakpoint System

```css
/* Tailwind CSS breakpoints */
sm: 640px   /* Tablet portrait */
md: 768px   /* Tablet landscape */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large desktop */
```

---

## 🚀 Performance Optimization

### Next.js 15 Features

- **Turbopack**: Faster development builds
- **Server Components**: Reduce client-side JavaScript
- **Image Optimization**: Automatic image optimization
- **Route Groups**: Better code organization
- **Middleware**: Edge runtime for better performance

---

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

---

## 🤝 Đóng góp

### Development Workflow

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Follow code standards**: ESLint + Prettier
4. **Write tests**: Unit tests for new features
5. **Commit changes**: `git commit -m 'Add some amazing feature'`
6. **Push to branch**: `git push origin feature/amazing-feature`
7. **Open Pull Request**

### Coding Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Following Next.js recommended rules
- **Prettier**: Consistent code formatting
- **Commit Messages**: Conventional commits format
- **Component Structure**: Consistent component patterns

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 👥 Team

**EV Service Center SWD392**

- **Repository**:
- **Frontend**: [fe-website]
- **Backend**: [EV_SCMMS_BE](https://github.com/EV-Service-Center-SWD392/EV_SCMMS_BE)

---

## 📞 Liên hệ

Project Link:

---

## 🙏 Acknowledgments

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://reactjs.org/docs)
- [Shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [TanStack Query](https://tanstack.com/query)

---

**Made with ❤️ and ⚡ by EV Service Center Team**

_Building the future of electric vehicle maintenance management_
