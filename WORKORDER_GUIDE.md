# 🔧 Work Order Management Module

## Overview

The **Work Order Management Module** is a complete system for managing maintenance and repair workflows in the EV Service Center. It enables technicians to create, update, and track work orders while allowing staff to monitor progress in real-time.

This module follows the Service Intake & Scheduling modules and integrates seamlessly with the existing system architecture.

---

## 📋 Features

### For Staff
- **Dashboard View**: Table-based overview of all work orders
- **Advanced Filtering**: Filter by status, technician, service type, and search
- **Detailed Management**: 
  - View work order details with tabs (Overview, Tasks, Photos, Progress)
  - Update work order status
  - Manage tasks and photos
  - Edit notes
- **Real-time Updates**: Automatic polling (60 seconds) for status changes
- **Quick Actions**: Mark completed, view details

### For Technicians
- **Card-Based Dashboard**: Visual, easy-to-navigate interface
- **My Work Orders**: View only assigned work orders
- **Status Management**: 
  - Start work
  - Pause/Resume
  - Request parts
  - Complete work
- **Task Tracking**: Create, update, and mark tasks as done
- **Photo Upload**: Document work with before/during/after photos
- **Real-time Updates**: Automatic polling (30 seconds)

### For Customers (Read-Only)
- View work order progress
- See status updates
- Track completion timeline

---

## 🗂️ File Structure

```
src/
├── entities/
│   └── workorder.types.ts          # Types, interfaces, Zod schemas
├── services/
│   └── workOrderService.ts         # API service layer
├── hooks/
│   └── workorders/
│       └── useWorkOrders.ts        # React Query hooks
├── components/
│   ├── ui/
│   │   ├── dropdown-menu.tsx       # Dropdown component
│   │   ├── skeleton.tsx            # Loading skeleton
│   │   ├── progress.tsx            # Progress bar
│   │   └── tabs.tsx                # Tabs component
│   └── workorders/
│       ├── WorkOrderForm.tsx       # Create work order form
│       ├── WorkOrderTable.tsx      # Staff table view
│       ├── WorkOrderCard.tsx       # Technician card view
│       ├── TaskList.tsx            # Task management
│       └── WorkOrderProgressTracker.tsx  # Visual progress
└── app/
    ├── (staff)/
    │   └── workorders/
    │       ├── page.tsx            # Staff dashboard
    │       └── [id]/
    │           └── page.tsx        # Staff detail page
    └── (technician)/
        └── workorders/
            └── page.tsx            # Technician dashboard
```

---

## 🔄 Work Order Lifecycle

```
Planned → In Progress → [Paused] → Waiting Parts → QA → Completed
```

### Status Definitions

| Status | Description | Who Can Set |
|--------|-------------|-------------|
| **Planned** | Work order created, awaiting technician | Staff, System |
| **In Progress** | Technician actively working | Technician, Staff |
| **Paused** | Temporarily stopped | Technician, Staff |
| **Waiting Parts** | Waiting for parts to arrive | Technician, Staff |
| **QA** | Under quality assurance review | Technician, Staff |
| **Completed** | Work finished and approved | Staff, QA Team |

---

## 🎯 Key Components

### 1. WorkOrderForm
Creates new work orders with:
- Service intake selection
- Technician assignment
- Service type
- Optional tasks
- Notes

**Usage:**
```tsx
<WorkOrderForm
  intakes={intakesList}
  technicians={techniciansList}
  onSubmitAction={handleCreateWorkOrder}
  onCancel={handleCancel}
/>
```

### 2. WorkOrderProgressTracker
Visual status progression with animated transitions.

**Features:**
- Horizontal step indicator
- Status-based colors
- Timestamp display
- Paused state indicator

**Usage:**
```tsx
<WorkOrderProgressTracker 
  workOrder={workOrder} 
  showTimestamps={true} 
/>
```

### 3. TaskList
Manage work order tasks with inline editing.

**Features:**
- Add/Edit/Delete tasks
- Status toggle (Not Started → In Progress → Done)
- Time tracking
- Progress calculation

**Usage:**
```tsx
<TaskList
  tasks={tasks}
  workOrderId={workOrderId}
  onUpdateTask={handleUpdateTask}
  onDeleteTask={handleDeleteTask}
  onAddTask={handleAddTask}
/>
```

### 4. WorkOrderTable (Staff)
Data table with sorting, filtering, and actions.

**Features:**
- Progress bars
- Status badges
- Quick actions menu
- Row click to detail

### 5. WorkOrderCard (Technician)
Card-based view optimized for mobile and quick actions.

**Features:**
- Visual progress
- Quick action buttons
- Status badges
- Customer info

---

## 🔌 API Integration

### Service Layer (`workOrderService.ts`)

All API calls are centralized in the service layer:

```typescript
// Fetch work orders
getWorkOrders(params?: { 
  centerId?: string;
  technicianId?: string;
  status?: WorkOrderStatus;
})

// Get by ID
getWorkOrderById(id: string)

// Create
createWorkOrder(data: CreateWorkOrderRequest)

// Update
updateWorkOrder(id: string, data: UpdateWorkOrderRequest)

// Update status
updateWorkOrderStatus(id: string, status: WorkOrderStatus)

// Tasks
createTask(workOrderId: string, data: CreateTaskRequest)
updateTask(taskId: string, data: UpdateTaskRequest)
deleteTask(taskId: string)

// Photos
uploadPhoto(workOrderId: string, file: File, type?: 'before' | 'during' | 'after')
deletePhoto(photoId: string)
```

### React Query Hooks

All hooks use React Query for caching and real-time updates:

```typescript
// Queries
useWorkOrders(params?)
useWorkOrderById(id, refetchInterval?)
useWorkOrdersByTechnician(technicianId, status?, refetchInterval?)

// Mutations
useCreateWorkOrder()
useUpdateWorkOrder()
useUpdateWorkOrderStatus()
useUpdateWorkOrderNotes()

// Tasks
useCreateTask()
useUpdateTask()
useDeleteTask()

// Photos
useUploadPhoto()
useDeletePhoto()
```

---

## 🎨 Design Guidelines

### Colors
- **Planned**: Slate (bg-slate-100)
- **In Progress**: Blue (bg-blue-100)
- **Paused**: Yellow (bg-yellow-100)
- **Waiting Parts**: Amber (bg-amber-100)
- **QA**: Purple (bg-purple-100)
- **Completed**: Green (bg-green-100)

### Spacing
- Card padding: `p-6`
- Section gaps: `gap-6`
- Form fields: `space-y-4`

### Animations
- Fade-in on mount
- Slide-up for modals
- Pulse for active states
- Smooth transitions (300ms)

---

## 🔧 Backend Requirements

### API Endpoints Needed

```
GET    /api/workorders
POST   /api/workorders
GET    /api/workorders/:id
PUT    /api/workorders/:id
DELETE /api/workorders/:id
PATCH  /api/workorders/:id/status

GET    /api/workorders/:id/tasks
POST   /api/workorders/:id/tasks
PUT    /api/tasks/:id
DELETE /api/tasks/:id

GET    /api/workorders/:id/photos
POST   /api/workorders/:id/photos
DELETE /api/photos/:id

GET    /api/intakes/:id/workorders
GET    /api/technicians/:id/workorders
```

### Database Schema

**WorkOrders Table:**
```sql
- id: UUID (PK)
- intakeId: UUID (FK)
- technicianId: UUID (FK)
- serviceType: VARCHAR
- status: ENUM
- notes: TEXT
- startedAt: TIMESTAMP
- completedAt: TIMESTAMP
- pausedAt: TIMESTAMP
- createdAt: TIMESTAMP
- updatedAt: TIMESTAMP
```

**WorkOrderTasks Table:**
```sql
- id: UUID (PK)
- workOrderId: UUID (FK)
- title: VARCHAR
- description: TEXT
- status: ENUM
- estimatedMinutes: INT
- actualMinutes: INT
- technicianNote: TEXT
- order: INT
- completedAt: TIMESTAMP
```

**WorkOrderPhotos Table:**
```sql
- id: UUID (PK)
- workOrderId: UUID (FK)
- url: VARCHAR
- name: VARCHAR
- type: ENUM ('before', 'during', 'after')
- uploadedAt: TIMESTAMP
```

---

## 🚀 Usage Examples

### Staff: Create Work Order
1. Navigate to `/staff/workorders`
2. Click "Create Work Order"
3. Fill in the form:
   - Select service intake
   - Assign technician
   - Enter service type
   - Add tasks (optional)
   - Add notes (optional)
4. Click "Create Work Order"

### Technician: Start Work
1. Navigate to `/technician/workorders`
2. Find your assigned work order
3. Click "Start Work"
4. Update tasks as you complete them
5. Upload photos for documentation
6. Click "Complete" when finished

### Staff: Monitor Progress
1. Navigate to `/staff/workorders`
2. Use filters to find work orders
3. Click on a work order to view details
4. Use tabs to view:
   - Overview (general info)
   - Tasks (task list)
   - Photos (uploaded images)
   - Progress (visual timeline)

---

## 🔄 Polling & Real-time Updates

The module uses **polling** instead of WebSockets for simplicity:

- **Staff Dashboard**: Polls every 60 seconds
- **Technician Dashboard**: Polls every 30 seconds
- **Detail Pages**: Polls every 30 seconds

To disable polling:
```typescript
useWorkOrders({ refetchInterval: false })
```

To change interval:
```typescript
useWorkOrders({ refetchInterval: 10000 }) // 10 seconds
```

---

## ✅ Testing Checklist

- [ ] Create work order from staff dashboard
- [ ] Assign technician
- [ ] Technician can view assigned work orders
- [ ] Start/pause/resume work order
- [ ] Add and update tasks
- [ ] Upload and delete photos
- [ ] Update notes
- [ ] Change status (Planned → QA → Completed)
- [ ] Filter work orders by status
- [ ] Search work orders
- [ ] View progress tracker
- [ ] Mobile responsiveness
- [ ] Dark mode support

---

## 📦 Dependencies

Required packages (already in project):
- `@tanstack/react-query` - Data fetching and caching
- `framer-motion` - Animations
- `lucide-react` - Icons
- `react-hook-form` - Form handling
- `zod` - Validation
- `@radix-ui/*` - UI primitives

---

## 🔮 Future Enhancements

1. **Real-time WebSocket Updates**: Replace polling with WebSocket for instant updates
2. **Push Notifications**: Notify technicians of new assignments
3. **Time Tracking**: Auto-calculate actual time spent
4. **Parts Inventory Integration**: Auto-request parts from inventory
5. **Customer Portal**: Read-only view for customers
6. **Mobile App**: Native mobile app for technicians
7. **Voice Notes**: Add voice memos for tasks
8. **AR/VR Support**: Augmented reality for repair guides

---

## 📞 Support

For questions or issues:
- Check existing Service Intake & Scheduling modules for patterns
- Review the types in `workorder.types.ts`
- Check the API service layer in `workOrderService.ts`
- Test with mock data before connecting to backend

---

**Built with ❤️ for EV Service Center Management System**
