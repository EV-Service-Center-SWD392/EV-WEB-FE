# 📘 Technician Scheduling & Queue Management - Hướng dẫn đầy đủ

> **Feature**: Quản lý phân công kỹ thuật viên và hàng chờ cho trung tâm dịch vụ EV

---

## 📋 MỤC LỤC

1. [Tổng quan Feature](#tổng-quan-feature)
2. [Kiến trúc và File Structure](#kiến-trúc-và-file-structure)
3. [Hướng dẫn chi tiết từng file](#hướng-dẫn-chi-tiết-từng-file)
4. [Mock Data cho Development](#mock-data-cho-development)
5. [Hướng dẫn nối API](#hướng-dẫn-nối-api)
6. [Còn thiếu gì](#còn-thiếu-gì)

---

## 1️⃣ TỔNG QUAN FEATURE

### 🎯 Chức năng chính

**Page duy nhất**: `/staff/schedules` với 2 tabs

#### Tab 1: 📅 Schedule (Phân công kỹ thuật viên)
- Chọn trung tâm và ngày
- Xem danh sách công việc có thể gán (bookings + service requests đã validated)
- Hiển thị công suất slot của trung tâm
- Gán nhanh kỹ thuật viên cho công việc
- Kiểm tra xung đột lịch (1 tech không thể có 2 việc cùng lúc)
- Xem danh sách công việc đã gán

#### Tab 2: 📋 Queue (Quản lý hàng chờ walk-in)
- Thêm khách walk-in vào hàng chờ
- Drag & drop để sắp xếp thứ tự ưu tiên
- Cập nhật ETA (thời gian ước tính phục vụ)
- Đánh dấu No-show (khách không đến)
- Convert ticket thành assignment khi có tech sẵn

### 🏗️ Kiến trúc áp dụng

✅ **Atomic Design Pattern**: atoms → molecules → organisms → containers → pages  
✅ **Container/Presentational**: Logic tách biệt khỏi UI  
✅ **TanStack Query**: Caching, refetching, mutations  
✅ **Zustand**: UI state (center, date, preferences)  
✅ **Zod**: Schema validation  
✅ **React Hook Form**: Form handling

---

## 2️⃣ KIẾN TRÚC VÀ FILE STRUCTURE

```
src/
├── app/staff/schedules/           # PAGE CHÍNH
│   ├── page.tsx                   # ✅ Trang với tabs (Schedule + Queue)
│   └── _containers/               # ⏳ Container logic (chưa làm)
│       ├── ScheduleContainer.tsx  # TODO: Orchestrate Schedule
│       └── QueueContainer.tsx     # TODO: Orchestrate Queue
│
├── components/staff/scheduling/   # UI COMPONENTS (Staff-specific)
│   ├── atoms/                     # ✅ COMPLETE (5 components)
│   │   ├── ADayPicker.tsx         # Date picker
│   │   ├── ACenterSelect.tsx      # Center dropdown
│   │   ├── ATechSelect.tsx        # Technician dropdown
│   │   ├── APill.tsx              # Status/priority badges
│   │   └── ASectionHeader.tsx     # Section titles
│   │
│   ├── molecules/                 # ⏳ TODO (4 components)
│   │   ├── SlotCapacityBar.tsx    # Progress bar hiển thị capacity
│   │   ├── AssignableWorkList.tsx # Danh sách công việc có thể gán
│   │   ├── QueueList.tsx          # Drag-drop queue tickets
│   │   └── AssignmentQuickForm.tsx # Form gán nhanh tech
│   │
│   └── organisms/                 # ⏳ TODO (3 components)
│       ├── ScheduleBoard.tsx      # Main board cho Schedule tab
│       ├── QueueBoard.tsx         # Main board cho Queue tab
│       └── ConflictNotice.tsx     # Dialog báo xung đột lịch
│
├── hooks/scheduling/              # ✅ COMPLETE (7 hooks)
│   ├── index.ts                   # Export tất cả hooks
│   ├── useCenters.ts              # Fetch danh sách centers
│   ├── useTechnicians.ts          # Fetch techs theo center
│   ├── useTodayBookings.ts        # Fetch bookings đã confirmed
│   ├── useAssignableWork.ts       # Combine bookings + requests
│   ├── useAssignments.ts          # CRUD assignments + conflict check
│   ├── useQueue.ts                # Queue mutations (add/reorder/noshow)
│   └── useScheduleParams.ts       # Zustand state wrapper
│
├── services/                      # ✅ COMPLETE (3 services)
│   ├── assignmentService.ts       # API: assignments CRUD + conflict
│   ├── queueService.ts            # API: queue operations
│   └── staffDirectoryService.ts   # API: centers/techs/capacity
│
├── stores/                        # ✅ COMPLETE
│   └── scheduling.store.ts        # Zustand: centerId, date, preferences
│
├── entities/                      # ✅ COMPLETE (Types + Schemas)
│   ├── assignment.types.ts        # Assignment, CreateDTO, UpdateDTO
│   ├── queue.types.ts             # QueueTicket, CreateDTO, ReorderDTO
│   ├── slot.types.ts              # Center, Technician, SlotCapacity
│   └── schemas/scheduling/        # Zod validation schemas
│       ├── createAssignment.schema.ts  # XOR: bookingId OR serviceRequestId
│       └── createQueueTicket.schema.ts # Queue validation
│
└── lib/mockData/                  # 🧪 MOCK DATA
    └── schedulingMockData.ts      # ✅ Data giả để dev UI
```

### 📊 Tiến độ hiện tại

| Layer | Status | Completed | Total |
|-------|--------|-----------|-------|
| **Entities & Types** | ✅ | 5/5 | 100% |
| **Services** | ✅ | 3/3 | 100% |
| **Zustand Store** | ✅ | 1/1 | 100% |
| **Hooks** | ✅ | 7/7 | 100% |
| **Atoms** | ✅ | 5/5 | 100% |
| **Molecules** | ⏳ | 0/4 | 0% |
| **Organisms** | ⏳ | 0/3 | 0% |
| **Containers** | ⏳ | 0/2 | 0% |
| **Pages** | ✅ | 1/1 | 100% |

**Tổng tiến độ**: 22/31 = **71%** ✅

---

## 3️⃣ HƯỚNG DẪN CHI TIẾT TỪNG FILE

### 📦 A. ENTITIES & TYPES (Foundation Layer)

#### 1. `src/entities/assignment.types.ts`
**Chức năng**: Định nghĩa types cho việc phân công kỹ thuật viên

```typescript
// Core types
export enum AssignmentStatus {
  Pending = "Pending",     // Mới tạo
  InProgress = "InProgress", // Đang làm
  Completed = "Completed",   // Hoàn thành
  Cancelled = "Cancelled"    // Hủy
}

export interface Assignment {
  id: string;
  centerId: string;
  technicianId: string;
  bookingId?: string;           // XOR: hoặc bookingId
  serviceRequestId?: string;    // XOR: hoặc serviceRequestId
  assignedDate: string;         // ISO date
  status: AssignmentStatus;
  notes?: string;
}

// DTO cho API
export interface CreateAssignmentDTO {
  centerId: string;
  technicianId: string;
  bookingId?: string;           // Phải có 1 trong 2
  serviceRequestId?: string;    // Phải có 1 trong 2
  assignedDate: string;
  notes?: string;
}
```

**Lưu ý**: Assignment chỉ được gán **HOẶC** bookingId **HOẶC** serviceRequestId, không được cả 2.

---

#### 2. `src/entities/queue.types.ts`
**Chức năng**: Định nghĩa types cho hàng chờ walk-in

```typescript
export enum QueueStatus {
  Waiting = "Waiting",       // Đang chờ
  Ready = "Ready",           // Sẵn sàng phục vụ
  NoShow = "NoShow",         // Không đến
  Converted = "Converted"    // Đã convert thành assignment
}

export interface QueueTicket {
  id: string;
  centerId: string;
  serviceRequestId: string;  // Liên kết với service request
  queueNo: number;           // Số thứ tự (1, 2, 3...)
  priority: number;          // 1=cao, 2=trung bình, 3=thấp
  status: QueueStatus;
  estimatedStartUtc?: string; // Thời gian ước tính phục vụ
  createdAt: string;
}
```

**Lưu ý**: `queueNo` tự động tính khi reorder (drag & drop).

---

#### 3. `src/entities/slot.types.ts`
**Chức năng**: Định nghĩa Center, Technician, và Capacity

```typescript
export interface Center {
  id: string;
  name: string;
  address: string;
  capacity: number;  // Tổng số slot
}

export interface Technician {
  id: string;
  name: string;
  email: string;
  phone: string;
  centerId: string;
  specialties: string[];  // VD: ["Battery", "Motor"]
  isActive: boolean;
}

export interface SlotCapacity {
  centerId: string;
  date: string;       // ISO date
  capacity: number;   // Tổng slot
  occupied: number;   // Đã dùng
  available: number;  // Còn trống
}
```

---

#### 4. `src/entities/schemas/scheduling/createAssignment.schema.ts`
**Chức năng**: Zod validation cho CreateAssignmentDTO

```typescript
import { z } from 'zod';

export const createAssignmentSchema = z.object({
  centerId: z.string().min(1, "Center is required"),
  technicianId: z.string().min(1, "Technician is required"),
  bookingId: z.string().optional(),
  serviceRequestId: z.string().optional(),
  assignedDate: z.string().min(1, "Date is required"),
  notes: z.string().optional(),
}).refine(
  (data) => {
    // XOR: Phải có đúng 1 trong 2
    const hasBooking = !!data.bookingId;
    const hasRequest = !!data.serviceRequestId;
    return (hasBooking && !hasRequest) || (!hasBooking && hasRequest);
  },
  {
    message: "Must provide either bookingId or serviceRequestId, not both",
    path: ["bookingId"], // Hiển thị lỗi ở field bookingId
  }
);
```

**Quan trọng**: Schema này enforce XOR rule - chỉ 1 trong 2 fields được fill.

---

### 🔌 B. SERVICES LAYER (API Integration)

#### 5. `src/services/assignmentService.ts`
**Chức năng**: API calls cho Assignment CRUD

```typescript
const BASE_PATH = '/api/staff/assignments';

export const assignmentService = {
  // GET: Lấy danh sách assignments
  async getAssignments(filters: AssignmentFilters): Promise<Assignment[]> {
    const response = await api.get<Assignment[]>(BASE_PATH, { 
      params: filters  // centerId, technicianId, date, status
    });
    return response.data;
  },

  // POST: Tạo assignment mới
  async create(dto: CreateAssignmentDTO): Promise<Assignment> {
    const response = await api.post<Assignment>(BASE_PATH, dto);
    return response.data;
  },

  // PATCH: Cập nhật assignment
  async update(id: string, dto: UpdateAssignmentDTO): Promise<Assignment> {
    const response = await api.patch<Assignment>(`${BASE_PATH}/${id}`, dto);
    return response.data;
  },

  // DELETE: Xóa assignment
  async delete(id: string): Promise<void> {
    await api.delete(`${BASE_PATH}/${id}`);
  },

  // GET: Kiểm tra xung đột lịch
  async checkConflict(params: ConflictCheckParams): Promise<ConflictCheckResult> {
    const response = await api.get<ConflictCheckResult>(`${BASE_PATH}/check-conflict`, {
      params // technicianId, assignedDate, [excludeAssignmentId]
    });
    return response.data;
  }
};
```

**Khi nối API**: Thay đổi `BASE_PATH` nếu backend khác URL convention.

---

#### 6. `src/services/queueService.ts`
**Chức năng**: API calls cho Queue management

```typescript
const BASE_PATH = '/api/staff/queue';

export const queueService = {
  // GET: Lấy queue tickets
  async getQueue(filters: QueueFilters): Promise<QueueTicket[]> {
    const response = await api.get<QueueTicket[]>(BASE_PATH, { 
      params: filters  // centerId, date, status
    });
    return response.data;
  },

  // POST: Thêm ticket vào queue
  async add(dto: CreateQueueTicketDTO): Promise<QueueTicket> {
    const response = await api.post<QueueTicket>(BASE_PATH, dto);
    return response.data;
  },

  // PATCH: Reorder queue (drag & drop)
  async reorder(dto: QueueReorderDTO): Promise<QueueTicket[]> {
    const response = await api.patch<QueueTicket[]>(`${BASE_PATH}/reorder`, dto);
    return response.data;
  },

  // PATCH: Đánh dấu no-show
  async markNoShow(ticketId: string): Promise<QueueTicket> {
    const response = await api.patch<QueueTicket>(`${BASE_PATH}/${ticketId}/no-show`);
    return response.data;
  },

  // PATCH: Cập nhật ETA
  async updateEta(ticketId: string, estimatedStartUtc: string): Promise<QueueTicket> {
    const response = await api.patch<QueueTicket>(`${BASE_PATH}/${ticketId}/eta`, {
      estimatedStartUtc
    });
    return response.data;
  },

  // POST: Convert ticket thành assignment
  async convertToAssignment(
    ticketId: string, 
    dto: ConvertToAssignmentDTO
  ): Promise<Assignment> {
    const response = await api.post<Assignment>(
      `${BASE_PATH}/${ticketId}/convert`, 
      dto  // technicianId, notes
    );
    return response.data;
  }
};
```

---

#### 7. `src/services/staffDirectoryService.ts`
**Chức năng**: API calls cho Centers, Technicians, Capacity

```typescript
const CENTERS_PATH = '/api/staff/centers';
const TECHNICIANS_PATH = '/api/staff/technicians';
const CAPACITY_PATH = '/api/staff/capacity';

export const staffDirectoryService = {
  // GET: Danh sách centers
  async getCenters(): Promise<Center[]> {
    const response = await api.get<Center[]>(CENTERS_PATH);
    return response.data;
  },

  // GET: Danh sách technicians (optional filter by center)
  async getTechnicians(centerId?: string): Promise<Technician[]> {
    const response = await api.get<Technician[]>(TECHNICIANS_PATH, {
      params: centerId ? { centerId } : undefined,
    });
    return response.data;
  },

  // GET: Slot capacity của center
  async getSlotCapacity(centerId: string, date: string): Promise<SlotCapacity> {
    const response = await api.get<SlotCapacity>(
      `${CAPACITY_PATH}/${centerId}`,
      { params: { date } }
    );
    return response.data;
  }
};
```

---

### 🏪 C. STATE MANAGEMENT

#### 8. `src/stores/scheduling.store.ts`
**Chức năng**: Zustand store cho UI preferences

```typescript
interface SchedulingState {
  // Selected center & date
  centerId: string | null;
  selectedDate: string; // ISO date

  // UI preferences
  listDensity: 'comfortable' | 'compact';
  sortOption: 'time' | 'priority' | 'customer';

  // Drag & drop state
  isDragging: boolean;

  // Actions
  setCenterId: (id: string | null) => void;
  setSelectedDate: (date: string) => void;
  setListDensity: (density: 'comfortable' | 'compact') => void;
  setSortOption: (option: 'time' | 'priority' | 'customer') => void;
  setIsDragging: (dragging: boolean) => void;
  reset: () => void;
}

export const useSchedulingStore = create<SchedulingState>()(
  persist(
    (set) => ({
      centerId: null,
      selectedDate: new Date().toISOString().split('T')[0],
      listDensity: 'comfortable',
      sortOption: 'time',
      isDragging: false,

      setCenterId: (id) => set({ centerId: id }),
      setSelectedDate: (date) => set({ selectedDate: date }),
      setListDensity: (density) => set({ listDensity: density }),
      setSortOption: (option) => set({ sortOption: option }),
      setIsDragging: (dragging) => set({ isDragging: dragging }),
      reset: () => set({
        centerId: null,
        selectedDate: new Date().toISOString().split('T')[0],
        listDensity: 'comfortable',
        sortOption: 'time',
        isDragging: false,
      }),
    }),
    {
      name: 'scheduling-preferences', // localStorage key
      partialize: (state) => ({
        // Only persist preferences, not transient state
        listDensity: state.listDensity,
        sortOption: state.sortOption,
      }),
    }
  )
);
```

**Lưu ý**: `listDensity` và `sortOption` được lưu vào localStorage.

---

### 🪝 D. CUSTOM HOOKS (Business Logic)

#### 9-15. `src/hooks/scheduling/*.ts`

Tất cả hooks đều dùng **TanStack Query** cho caching và error handling.

```typescript
// useCenters.ts - Fetch centers
export function useCenters() {
  return useQuery<Center[], Error>({
    queryKey: ['centers'],
    queryFn: staffDirectoryService.getCenters,
    staleTime: 5 * 60 * 1000, // 5 phút
  });
}

// useTechnicians.ts - Fetch techs theo center
export function useTechnicians(centerId?: string) {
  return useQuery<Technician[], Error>({
    queryKey: ['technicians', centerId],
    queryFn: () => staffDirectoryService.getTechnicians(centerId),
    enabled: !!centerId, // Chỉ fetch khi có centerId
  });
}

// useAssignments.ts - CRUD với mutations
export function useAssignments(filters: AssignmentFilters) {
  const queryClient = useQueryClient();

  // Fetch assignments
  const query = useQuery({
    queryKey: ['assignments', filters],
    queryFn: () => assignmentService.getAssignments(filters),
  });

  // Create mutation
  const create = useMutation({
    mutationFn: assignmentService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      toast.success('Assignment created!');
    },
    onError: (error: any) => {
      if (error.response?.status === 409) {
        toast.error('Conflict: Technician already assigned');
      } else {
        toast.error('Failed to create assignment');
      }
    },
  });

  // Update, delete mutations tương tự...

  return { ...query, create, update, delete, checkConflict };
}
```

**Pattern**: Tất cả hooks đều có error handling cho 400/404/409/5xx và toast notifications.

---

### 🧩 E. ATOMIC COMPONENTS (Reusable UI)

#### 16-20. `src/components/staff/scheduling/atoms/*.tsx`

Đã complete 5 atoms:

1. **ADayPicker**: Date picker với react-day-picker
2. **ACenterSelect**: Dropdown chọn center
3. **ATechSelect**: Dropdown chọn technician
4. **APill**: Badge hiển thị status/priority
5. **ASectionHeader**: Section title với icon

**Đặc điểm chung**:
- Full TypeScript props
- Accessible (ARIA labels)
- Error states
- Consistent styling với Shadcn

---

## 4️⃣ MOCK DATA CHO DEVELOPMENT

### 📦 `src/lib/mockData/schedulingMockData.ts`

**Mục đích**: Data giả để dev UI mà không cần backend. **Dễ dàng xóa khi nối API thật**.

#### Mock Data bao gồm:

```typescript
// 3 Centers
export const mockCenters: Center[] = [
  {
    id: "center-1",
    name: "EV Service Center - Quận 1",
    address: "123 Nguyễn Huệ, Quận 1, TPHCM",
    capacity: 20
  },
  // ... 2 more
];

// 6 Technicians
export const mockTechnicians: Technician[] = [
  {
    id: "tech-1",
    name: "Nguyễn Văn A",
    email: "nguyenvana@evservice.com",
    centerId: "center-1",
    specialties: ["Battery", "Motor"],
    isActive: true
  },
  // ... 5 more
];

// 6 Assignable Work Items
export const mockAssignableWork: AssignableWorkItem[] = [
  {
    id: "work-1",
    type: "booking",
    customerName: "Nguyễn Minh Hoàng",
    vehicleInfo: "VinFast VF8",
    services: "Bảo dưỡng định kỳ",
    scheduledTime: "2025-10-15T09:00:00Z",
    // ...
  },
  // ... 5 more
];

// 5 Queue Tickets
export const mockQueueTicketDetails: QueueTicketDetail[] = [
  {
    id: "queue-1",
    queueNo: 1,
    priority: 1,
    status: "Waiting",
    customerName: "Võ Văn Nam",
    vehicleInfo: "VinFast VF5",
    // ...
  },
  // ... 4 more
];

// Helper functions với simulated delays
export async function getMockCenters(): Promise<Center[]> {
  await delay(300);
  return mockCenters;
}
```

### 🔧 Cách sử dụng Mock Data

#### Option 1: Import trực tiếp (nhanh nhất)
```typescript
import { mockCenters, mockTechnicians } from '@/lib/mockData/schedulingMockData';

function MyComponent() {
  return (
    <div>
      {mockCenters.map(center => (
        <div key={center.id}>{center.name}</div>
      ))}
    </div>
  );
}
```

#### Option 2: Mock trong Services (RECOMMENDED)
Sửa tạm thời services để return mock data:

```typescript
// staffDirectoryService.ts
import { getMockCenters, getMockTechnicians } from '@/lib/mockData/schedulingMockData';

export const staffDirectoryService = {
  async getCenters(): Promise<Center[]> {
    // TEMPORARY: Use mock data during development
    if (process.env.NODE_ENV === 'development') {
      return getMockCenters(); // 300ms delay
    }
    
    // Real API (uncomment when ready)
    // const response = await api.get<Center[]>(CENTERS_PATH);
    // return response.data;
    
    return [];
  },

  async getTechnicians(centerId?: string): Promise<Technician[]> {
    // TEMPORARY: Mock data
    if (process.env.NODE_ENV === 'development') {
      return getMockTechnicians(centerId);
    }
    
    // Real API
    // const response = await api.get<Technician[]>(TECHNICIANS_PATH, {
    //   params: centerId ? { centerId } : undefined,
    // });
    // return response.data;
    
    return [];
  },
};
```

**Lợi ích**: Hooks và components không cần thay đổi gì, chỉ services return mock data.

---

## 5️⃣ HƯỚNG DẪN NỐI API

### ✅ Checklist nối API

#### Bước 1: Xác nhận API endpoints
Kiểm tra backend có đúng URLs không:

```typescript
// Assignments
GET    /api/staff/assignments?centerId=xxx&date=xxx
POST   /api/staff/assignments
PATCH  /api/staff/assignments/{id}
DELETE /api/staff/assignments/{id}
GET    /api/staff/assignments/check-conflict?technicianId=xxx&assignedDate=xxx

// Queue
GET    /api/staff/queue?centerId=xxx&date=xxx
POST   /api/staff/queue
PATCH  /api/staff/queue/reorder
PATCH  /api/staff/queue/{id}/no-show
PATCH  /api/staff/queue/{id}/eta
POST   /api/staff/queue/{id}/convert

// Staff Directory
GET    /api/staff/centers
GET    /api/staff/technicians?centerId=xxx
GET    /api/staff/capacity/{centerId}?date=xxx
```

**Nếu khác**: Sửa `BASE_PATH` trong services.

---

#### Bước 2: Kiểm tra Response Format

Đảm bảo backend return đúng types:

```typescript
// Assignment response
{
  "id": "asgn-123",
  "centerId": "center-1",
  "technicianId": "tech-1",
  "bookingId": "booking-456",
  "serviceRequestId": null,
  "assignedDate": "2025-10-15",
  "status": "Pending",
  "notes": "Ưu tiên khách VIP"
}

// QueueTicket response
{
  "id": "queue-789",
  "centerId": "center-1",
  "serviceRequestId": "request-101",
  "queueNo": 1,
  "priority": 1,
  "status": "Waiting",
  "estimatedStartUtc": "2025-10-15T13:00:00Z",
  "createdAt": "2025-10-15T08:30:00Z"
}
```

**Nếu khác**: Thêm DTO mapping trong services.

---

#### Bước 3: Test API với Postman/Thunder Client

```bash
# Test lấy centers
GET http://localhost:3000/api/staff/centers

# Test tạo assignment
POST http://localhost:3000/api/staff/assignments
Content-Type: application/json

{
  "centerId": "center-1",
  "technicianId": "tech-1",
  "bookingId": "booking-123",
  "assignedDate": "2025-10-15",
  "notes": "Test assignment"
}

# Test conflict check
GET http://localhost:3000/api/staff/assignments/check-conflict?technicianId=tech-1&assignedDate=2025-10-15
```

---

#### Bước 4: Xóa Mock Data khỏi Services

**assignmentService.ts**:
```typescript
// XÓA BLOCK NÀY
// if (process.env.NODE_ENV === 'development') {
//   return getMockAssignments(filters.centerId!, filters.date!);
// }

// UNCOMMENT BLOCK NÀY
const response = await api.get<Assignment[]>(BASE_PATH, { params: filters });
return response.data;
```

Làm tương tự cho:
- `queueService.ts`
- `staffDirectoryService.ts`

---

#### Bước 5: Xóa Mock Data File

```bash
rm src/lib/mockData/schedulingMockData.ts
```

Hoặc giữ lại để reference nếu cần debug.

---

#### Bước 6: Test Error Handling

Test các error cases:

**409 Conflict** (Tech đã có assignment):
```typescript
// Backend nên return:
{
  "statusCode": 409,
  "message": "Technician already has an assignment at this time",
  "conflictingAssignmentId": "asgn-999"
}

// Hook sẽ tự động show toast: "Conflict: Technician already assigned"
```

**404 Not Found**:
```typescript
// Backend return 404 → Hook shows: "Resource not found"
```

**400 Bad Request**:
```typescript
// Backend return 400 → Hook shows: "Invalid request data"
```

**5xx Server Error** → Retry 3 lần với exponential backoff (200ms, 400ms, 800ms).

---

### 🔍 Debugging Tips

#### Issue: API returns nhưng UI không hiển thị
```typescript
// Check TanStack Query DevTools
// Vào tab "Queries" xem:
// - Query có status "success" không?
// - Data có đúng format không?
// - staleTime còn hiệu lực không?
```

#### Issue: Mutation thất bại nhưng không có error message
```typescript
// Check onError trong useMutation:
onError: (error: any) => {
  console.error('Mutation error:', error.response); // Log full error
  toast.error(error.response?.data?.message || 'Unknown error');
}
```

#### Issue: Query không refetch sau mutation
```typescript
// Đảm bảo invalidate đúng queryKey:
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['assignments'] }); // ✅
  // Không dùng: invalidateQueries(['assignments', specificFilter]) // ❌ Quá cụ thể
}
```

---

## 6️⃣ CÒN THIẾU GÌ

### ⏳ Molecules (4 components) - Priority 1

#### 1. `SlotCapacityBar.tsx`
**Chức năng**: Progress bar hiển thị capacity

```typescript
interface Props {
  capacity: number;      // VD: 20
  occupied: number;      // VD: 12
  available: number;     // VD: 8
}

// UI: [■■■■■■■■■■□□□□□□□□□□] 12/20 (60%)
// Color: >50% = green, 25-50% = yellow, <25% = red
```

#### 2. `AssignableWorkList.tsx`
**Chức năng**: Danh sách công việc có thể gán

```typescript
interface Props {
  workItems: AssignableWorkItem[];
  onSelectWork: (id: string) => void;
  selectedWorkId?: string;
  density?: 'comfortable' | 'compact';
}

// UI: List với checkbox, customer name, vehicle, services, time
```

#### 3. `QueueList.tsx`
**Chức năng**: Drag-drop queue tickets với @dnd-kit

```typescript
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

interface Props {
  tickets: QueueTicketDetail[];
  onReorder: (dto: QueueReorderDTO) => void;
  onNoShow: (id: string) => void;
  onUpdateEta: (id: string, eta: string) => void;
}

// UI: Draggable items, No-show button, ETA picker
```

#### 4. `AssignmentQuickForm.tsx`
**Chức năng**: Form gán nhanh tech

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createAssignmentSchema } from '@/entities/schemas/scheduling/createAssignment.schema';

interface Props {
  centerId: string;
  selectedWorkId?: string;
  onSubmit: (dto: CreateAssignmentDTO) => void;
}

// UI: Tech select, notes textarea, submit button
// Validation: Zod schema với XOR rule
```

---

### ⏳ Organisms (3 components) - Priority 2

#### 1. `ScheduleBoard.tsx`
**Chức năng**: Main board cho Schedule tab

```typescript
// Combines:
// - ACenterSelect + ADayPicker (filters)
// - SlotCapacityBar (capacity)
// - AssignableWorkList (work items)
// - AssignmentQuickForm (assignment form)
// - Danh sách assignments đã tạo

// Logic: Orchestrate data flow giữa các molecules
```

#### 2. `QueueBoard.tsx`
**Chức năng**: Main board cho Queue tab

```typescript
// Combines:
// - ACenterSelect + ADayPicker (filters)
// - QueueList (drag-drop queue)
// - Button "Add to Queue"

// Logic: Handle drag-drop, no-show, ETA updates
```

#### 3. `ConflictNotice.tsx`
**Chức năng**: Dialog cảnh báo xung đột

```typescript
interface Props {
  isOpen: boolean;
  conflictingAssignment?: Assignment;
  onClose: () => void;
  onForceAssign?: () => void;
}

// UI: Dialog với thông tin assignment bị conflict, options để resolve
```

---

### ⏳ Containers (2 files) - Priority 3

#### 1. `ScheduleContainer.tsx`
**Chức năng**: Orchestrate Schedule logic

```typescript
export default function ScheduleContainer() {
  const { centerId, selectedDate } = useScheduleParams();
  const { data: centers } = useCenters();
  const { data: technicians } = useTechnicians(centerId);
  const { data: capacity } = useSlotCapacity(centerId, selectedDate);
  const { data: workItems } = useAssignableWork(centerId, selectedDate);
  const { data: assignments, create } = useAssignments({ centerId, date: selectedDate });

  const [selectedWorkId, setSelectedWorkId] = useState<string>();

  const handleAssign = async (dto: CreateAssignmentDTO) => {
    const result = await checkConflict({
      technicianId: dto.technicianId,
      assignedDate: dto.assignedDate,
    });

    if (result.hasConflict) {
      // Show ConflictNotice
      setConflictDialogOpen(true);
    } else {
      await create.mutateAsync(dto);
    }
  };

  return (
    <ScheduleBoard
      centers={centers}
      technicians={technicians}
      capacity={capacity}
      workItems={workItems}
      assignments={assignments}
      selectedWorkId={selectedWorkId}
      onSelectWork={setSelectedWorkId}
      onAssign={handleAssign}
    />
  );
}
```

#### 2. `QueueContainer.tsx`
**Chức năng**: Orchestrate Queue logic

```typescript
export default function QueueContainer() {
  const { centerId, selectedDate, setIsDragging } = useScheduleParams();
  const { data: queue, reorder, markNoShow, updateEta } = useQueue({ centerId, date: selectedDate });

  const handleDragEnd = (event: DragEndEvent) => {
    setIsDragging(false);
    // Calculate new order and call reorder mutation
  };

  return (
    <QueueBoard
      queue={queue}
      onReorder={handleDragEnd}
      onNoShow={markNoShow}
      onUpdateEta={updateEta}
    />
  );
}
```

---

### ⏳ Integration (Final Step) - Priority 4

#### Update `schedules/page.tsx`
```typescript
'use client';

import { useState } from 'react';
import ScheduleContainer from './_containers/ScheduleContainer';
import QueueContainer from './_containers/QueueContainer';

export default function SchedulesPage() {
  const [activeTab, setActiveTab] = useState<'schedule' | 'queue'>('schedule');

  return (
    <div className="p-6">
      <div className="flex gap-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab('schedule')}
          className={activeTab === 'schedule' ? 'border-b-2 border-blue-600' : ''}
        >
          📅 Schedule
        </button>
        <button
          onClick={() => setActiveTab('queue')}
          className={activeTab === 'queue' ? 'border-b-2 border-blue-600' : ''}
        >
          📋 Queue
        </button>
      </div>

      {activeTab === 'schedule' && <ScheduleContainer />}
      {activeTab === 'queue' && <QueueContainer />}
    </div>
  );
}
```

---

## 📝 TÓM TẮT

### ✅ Đã hoàn thành (71%)
- Foundation layer: Types, Schemas, Services, Store, Hooks
- Atomic components: 5 reusable atoms
- Page structure: Unified page với tabs

### ⏳ Cần làm (29%)
- **Molecules**: 4 components (SlotCapacityBar, AssignableWorkList, QueueList, AssignmentQuickForm)
- **Organisms**: 3 components (ScheduleBoard, QueueBoard, ConflictNotice)
- **Containers**: 2 logic orchestrators (ScheduleContainer, QueueContainer)
- **Integration**: Connect containers to page tabs

### 🚀 Hướng dẫn nối API
1. ✅ Kiểm tra API endpoints
2. ✅ Verify response formats
3. ✅ Test với Postman
4. ✅ Xóa mock logic trong services
5. ✅ Delete `schedulingMockData.ts`
6. ✅ Test error handling

### 💡 Tips
- Mock data dùng trong development, dễ xóa khi production
- Hooks đã có full error handling và retry logic
- Services cần map DTO nếu backend response khác format
- TanStack Query DevTools giúp debug queries
- Zustand DevTools giúp debug store state

---

**Có câu hỏi gì về bất kỳ file nào, hãy hỏi tôi! 🎯**
