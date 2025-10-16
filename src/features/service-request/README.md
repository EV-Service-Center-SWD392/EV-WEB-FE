# Service Request Intake Feature

## Overview

The **Service Request Intake** feature allows staff members to record service requests from customers. This is the **first step** in the customer journey—capturing the customer's intent and preferences **before** any booking or scheduling occurs.

### Scope (STRICT)

- **Goal**: Record service request intake from customers for the Booking team to process later
- **NOT**: Does not create bookings, select slots, add to queue, or require approval
- **Result**: Creates a `ServiceRequest` entity with status `New` and stores preferences for future processing

### Status Flow

```
New → Validated → Contacted → Converted/Rejected
```

## Architecture

### Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand (feature-scoped)
- **Validation**: Zod + react-hook-form
- **Architecture**: Atomic Design + Container/Presentational pattern

### Design Patterns

1. **Atomic Design**
   - Atoms: Basic form inputs (AInput, ASelect, etc.)
   - Molecules: Composed components (CustomerSearch, VehiclePicker, etc.)
   - Organisms: Complex components (ServiceRequestForm, Modals)
   - Containers: Business logic layer (ServiceRequestContainer)

2. **Container/Presentational**
   - Containers: Handle all API calls, state management, and business logic
   - Presentational: Pure UI components with props only

3. **Custom Hooks**
   - `useCustomerSearch`: Customer search logic
   - `useQuickCreateCustomer`: Quick customer creation
   - `useQuickCreateVehicle`: Quick vehicle creation
   - `useBlacklistCheck`: Risk checking
   - `useCreateServiceRequest`: Service request creation with retry logic

## File Structure

```
src/
├── features/service-request/
│   ├── types/
│   │   ├── domain.ts          # Core business entities
│   │   └── dto.ts             # API data transfer objects
│   ├── schemas/
│   │   ├── createServiceRequest.schema.ts
│   │   ├── quickCustomer.schema.ts
│   │   └── quickVehicle.schema.ts
│   ├── services/
│   │   ├── customers.ts       # Customer API client
│   │   ├── vehicles.ts        # Vehicle API client
│   │   ├── requests.ts        # Service request API client
│   │   └── risk.ts            # Blacklist/risk checking
│   ├── hooks/
│   │   ├── useCustomerSearch.ts
│   │   ├── useQuickCreateCustomer.ts
│   │   ├── useQuickCreateVehicle.ts
│   │   ├── useBlacklistCheck.ts
│   │   └── useCreateServiceRequest.ts
│   ├── stores/
│   │   └── serviceRequest.store.ts  # Zustand store
│   └── README.md (this file)
│
└── app/(staff)/requests/
    ├── new/
    │   ├── page.tsx                  # New request page
    │   ├── _container/
    │   │   └── ServiceRequestContainer.tsx
    │   └── _components/
    │       ├── atoms/
    │       │   ├── AInput.tsx
    │       │   ├── AEmailInput.tsx
    │       │   ├── APhoneInput.tsx
    │       │   ├── ASelect.tsx
    │       │   ├── ATextarea.tsx
    │       │   ├── ADateRange.tsx
    │       │   ├── ATimeOfDayPicker.tsx
    │       │   ├── AFormMessage.tsx
    │       │   └── AFileDropzone.tsx
    │       ├── molecules/
    │       │   ├── CustomerSearch.tsx
    │       │   ├── VehiclePicker.tsx
    │       │   ├── ServiceMultiSelect.tsx
    │       │   ├── CenterPreference.tsx
    │       │   └── PreferredTimeWindow.tsx
    │       └── organisms/
    │           ├── ServiceRequestForm.tsx
    │           ├── QuickCustomerModal.tsx
    │           ├── QuickVehicleModal.tsx
    │           └── DuplicateWarningBanner.tsx
    └── [id]/
        └── page.tsx                  # Request detail page
```

## User Flows

### 1. Staff Intake Flow (Primary)

1. Staff member navigates to `/requests/new`
2. **Search or Create Customer**:
   - Search by phone, email, or name
   - If not found, click "+ New" to quick-create customer
   - Required: name, phone
3. **Select or Add Vehicle** (optional):
   - Select from customer's existing vehicles
   - Click "+ Add Vehicle" to create new one
4. **Select Service Types** (required):
   - Multi-select from available service types
   - At least one required
5. **Set Preferences**:
   - Preferred service center (optional)
   - Preferred time window: date range, time of day, days of week (optional)
6. **Additional Details**:
   - Channel: Walk-In, Phone, Web, Email
   - Notes: up to 500 characters
   - **Allow Contact**: MUST be checked to proceed
7. **Submit**:
   - Creates `ServiceRequest` with status "New"
   - Redirects to request detail page
   - Shows success toast

### 2. Public Form Flow (Optional, Future)

Same as staff flow but simplified:
- No customer search (new customer only)
- Simplified vehicle entry
- After submit, shows request ID for reference

## API Endpoints

### Customers

```typescript
GET    /api/customers/search?q={query}&limit={limit}
POST   /api/customers
GET    /api/customers/:id
GET    /api/customers/:id/vehicles
```

### Vehicles

```typescript
POST   /api/vehicles
GET    /api/vehicles/:id
GET    /api/vehicles?customerId={id}
```

### Service Requests

```typescript
POST   /api/service-requests
GET    /api/service-requests/:id
PATCH  /api/service-requests/:id
GET    /api/service-requests?status=New&page=1&limit=20
POST   /api/service-requests/check-duplicate
```

### Risk (Optional)

```typescript
POST   /api/risk/blacklist-check
GET    /api/risk/score/:customerId
```

## Domain Models

### ServiceRequest

```typescript
{
  id: string;
  customerId: string;
  vehicleId?: string;
  serviceTypeIds: string[];
  preferredCenterId?: string;
  preferredTimeWindow?: {
    dateFrom?: string;      // ISO date
    dateTo?: string;        // ISO date
    timeOfDay?: 'Morning' | 'Afternoon' | 'Evening' | 'Any';
    daysOfWeek?: number[];  // 0-6
  };
  notes?: string;           // max 500 chars
  channel: 'Phone' | 'WalkIn' | 'Web' | 'Email';
  allowContact: boolean;    // MUST be true
  status: 'New' | 'Validated' | 'Contacted' | 'Converted' | 'Rejected';
  flagged?: boolean;
  flagReason?: string;
  createdAt: string;
  updatedAt: string;
}
```

## Validation Rules

### Customer

- `name`: required, max 100 chars
- `phone`: required, E.164 format (e.g., +1234567890)
- `email`: optional, valid email
- `address`: optional, max 200 chars
- `notes`: optional, max 300 chars

### Vehicle

- All fields optional
- `year`: 1900 to current year + 1
- `vin`: exactly 17 characters if provided

### Service Request

- `customerId`: required
- `serviceTypeIds`: required, min 1 service type
- `allowContact`: must be `true`
- `notes`: max 500 chars
- `preferredTimeWindow.dateFrom` ≤ `dateTo`

## Error Handling

### Field Validation (400)

Server returns field-level errors:

```json
{
  "message": "Validation failed",
  "errors": [
    { "path": ["phone"], "message": "Invalid phone format" },
    { "path": ["allowContact"], "message": "Customer must allow contact" }
  ]
}
```

Hook maps these to form fields for display.

### Duplicate Detection (409)

```json
{
  "message": "Duplicate request found",
  "existingRequestId": "req_123"
}
```

Shows warning banner with link to existing request. User can proceed anyway.

### Server Errors (5xx)

Automatic retry with exponential backoff (max 3 attempts):
- 1st retry: 1s delay
- 2nd retry: 2s delay
- 3rd retry: 4s delay

## State Management

Uses Zustand for feature-scoped state:

```typescript
{
  selectedCustomer: Customer | null;
  selectedVehicle: Vehicle | null;
  selectedServiceTypes: ServiceType[];
  selectedCenter: Center | null;
  isQuickCustomerModalOpen: boolean;
  isQuickVehicleModalOpen: boolean;
  isDuplicateWarningVisible: boolean;
  duplicateRequestId: string | null;
  serviceTypes: ServiceType[];
  centers: Center[];
  // ... + setters
}
```

## Testing

### Running Tests

```bash
# Unit tests (schemas, hooks)
npm test features/service-request

# Component tests
npm test features/service-request/components

# E2E tests
npm run test:e2e -- --grep "Service Request Intake"
```

### Test Coverage

- ✅ Schema validation (createServiceRequest, quickCustomer, quickVehicle)
- ✅ Custom hooks (useCustomerSearch, useCreateServiceRequest)
- ✅ Component rendering (CustomerSearch, ServiceRequestForm)
- ✅ Form submission flow
- ✅ Error handling and retry logic
- ✅ Duplicate detection

### Example Test: useCreateServiceRequest

```typescript
it('should handle 409 duplicate with retry', async () => {
  const { result } = renderHook(() => useCreateServiceRequest());
  
  mockApi.post.mockRejectedValueOnce({
    response: { status: 409, data: { existingRequestId: 'req_123' } }
  });
  
  await act(async () => {
    await result.current.createRequest(mockDTO);
  });
  
  expect(result.current.duplicateRequestId).toBe('req_123');
});
```

## Accessibility

- Keyboard navigation: all interactive elements accessible via Tab/Enter
- ARIA labels: proper `role`, `aria-label`, `aria-describedby`
- Error announcements: `role="alert"` for screen readers
- Focus management: modals trap focus, restored on close
- Color contrast: WCAG AA compliant

## Performance

- Lazy loading: service types and centers loaded on mount
- Debounced search: customer search debounced (300ms)
- Optimistic updates: UI updates immediately, rolls back on error
- Skeleton loading states: shown during async operations

## Next Steps

1. **Integration**: Connect to actual backend APIs (replace mock loaders)
2. **Public Form**: Enable public-facing service request form
3. **Analytics**: Track conversion rates and common service types
4. **Automation**: Auto-fill preferences based on customer history
5. **Notifications**: SMS/Email confirmation to customer

## Support

For questions or issues:
- See main project README
- Contact: dev-team@ev-service-center.com
- Slack: #service-request-intake
