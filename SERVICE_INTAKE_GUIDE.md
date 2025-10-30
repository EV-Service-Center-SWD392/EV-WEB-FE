# Service Intake & EV Checklist Feature

## Overview
This feature allows FrontDesk/Advisor staff to create and manage Service Intake records when a booking is checked in, including filling out an EV checklist with photos and notes.

## Architecture

### 📁 File Structure
```
src/
├── entities/
│   ├── intake.types.ts              # TypeScript types and interfaces
│   └── schemas/
│       └── intake.schema.ts          # Zod validation schemas
├── services/
│   └── intakeService.ts              # API service functions
├── hooks/
│   └── intake/
│       ├── useIntake.ts              # Intake CRUD hooks
│       ├── useChecklist.ts           # Checklist data hooks
│       ├── useAutoSave.ts            # Auto-save with debouncing
│       └── index.ts                  # Barrel export
├── components/
│   └── staff/
│       └── intake/
│           ├── ServiceIntakeForm.tsx      # Vehicle condition form
│           ├── ChecklistItemRow.tsx       # Individual checklist item
│           ├── ChecklistTable.tsx         # Grouped checklist display
│           ├── IntakeSummaryCard.tsx      # Read-only summary
│           └── index.ts                   # Barrel export
└── app/
    └── staff/
        └── intake/
            └── [intakeId]/
                └── page.tsx               # Intake detail page
```

## Features

### ✅ Implemented

1. **Service Intake Creation**
   - Create intake linked to a checked-in booking
   - Record odometer reading (optional)
   - Record battery state of charge 0-100% (optional)
   - Add notes up to 500 characters (optional)
   - Upload multiple condition photos

2. **EV Checklist Management**
   - Dynamic checklist items grouped by category:
     - Exterior
     - Tires
     - Battery
     - Electrical
     - Safety
   - Support for three input types:
     - **Boolean**: Pass/Fail buttons
     - **Number**: Numeric input field
     - **Text**: Text area for detailed notes
   - Severity levels: Low, Medium, High
   - Photo attachment per item
   - Additional notes per item

3. **Draft & Finalize Workflow**
   - Auto-save draft every 30 seconds
   - Manual "Save Draft" button
   - "Finalize" button (disabled until all required items completed)
   - Read-only view for completed intakes

4. **UI/UX Features**
   - Responsive layout (mobile-first)
   - Accessible (ARIA labels, keyboard navigation)
   - Progress indicator for checklist completion
   - Status badges (Draft/Completed)
   - Toast notifications for actions
   - Form validation with error messages

## API Integration

### Endpoints Used

```typescript
// Create intake
POST /api/bookings/{bookingId}/intakes
Body: { odometer?, batterySoC?, notes?, photos? }

// Get intake
GET /api/intakes/{intakeId}

// Get intake by booking
GET /api/bookings/{bookingId}/intakes

// Update intake
PUT /api/intakes/{intakeId}
Body: { odometer?, batterySoC?, notes?, photos?, status? }

// Get checklist items
GET /api/checklist-items

// Get checklist responses
GET /api/intakes/{intakeId}/responses

// Save checklist responses
POST /api/intakes/{intakeId}/responses
Body: { responses: Array<ChecklistResponse> }

// Finalize intake
PATCH /api/intakes/{intakeId}/finalize

// Upload photos
POST /api/uploads/intake-photos
POST /api/uploads/checklist-photos
```

## Data Models

### ServiceIntake
```typescript
{
  id: string;
  bookingId: string;
  odometer?: number;
  batterySoC?: number;
  photos?: IntakePhoto[];
  notes?: string;
  status: 'Draft' | 'Completed';
  createdAt: string;
  updatedAt?: string;
}
```

### ChecklistItem
```typescript
{
  id: string;
  category: 'Exterior' | 'Tires' | 'Battery' | 'Electrical' | 'Safety';
  label: string;
  description?: string;
  type: 'Bool' | 'Number' | 'Text';
  order: number;
  isRequired?: boolean;
  isActive: boolean;
}
```

### ChecklistResponse
```typescript
{
  id?: string;
  checklistItemId: string;
  boolValue?: boolean;
  numberValue?: number;
  textValue?: string;
  severity?: 'Low' | 'Medium' | 'High';
  note?: string;
  photoUrl?: string;
}
```

## Usage

### 1. Navigate to Intake Page
```typescript
// From booking detail (when status = CheckedIn)
router.push(`/staff/intake/${intakeId}`);
```

### 2. Fill Service Intake Form
- Enter vehicle odometer reading
- Enter battery state of charge
- Upload condition photos
- Add general notes

### 3. Complete EV Checklist
- For each category (Exterior, Tires, etc.):
  - Fill required items (marked with badge)
  - Select severity if issue found
  - Add notes and photos as needed
- Progress bar shows completion status

### 4. Save and Finalize
- Click "Save Draft" to save progress
- Auto-save runs every 30 seconds
- Click "Finalize" when all required items completed
- Finalized intakes become read-only

## Validation Rules

- **Odometer**: Must be ≥ 0
- **Battery SoC**: Must be between 0-100
- **Notes**: Maximum 500 characters
- **Checklist Note**: Maximum 500 characters
- **Checklist Text Value**: Maximum 1000 characters
- **Photos**: Must be valid image URLs

## Error Handling

- **400 Bad Request**: Field validation errors mapped to form inputs
- **404 Not Found**: Intake/item not found → show empty state
- **409 Conflict**: Intake already exists → redirect to existing
- **5xx Server Error**: Toast error message with retry option

## Accessibility

- All form fields have proper labels
- ARIA attributes for screen readers
- Keyboard navigation support
- Error messages associated with inputs
- Focus management for modals/dialogs

## Performance

- Auto-save debounced to 30 seconds
- Checklist items cached for 5 minutes
- Optimistic updates for better UX
- Image lazy loading for photo grids

## Future Enhancements

- [ ] Bulk photo upload with drag & drop
- [ ] Print/PDF export of completed intake
- [ ] History/audit log of changes
- [ ] Duplicate intake to new booking
- [ ] Email notification on finalization
- [ ] Mobile app integration
- [ ] Offline support with sync

## Testing Checklist

- [x] TypeScript strict mode passes
- [x] Form validation works correctly
- [x] Auto-save triggers after 30s
- [x] Manual save works immediately
- [x] Finalize button disabled when incomplete
- [x] Read-only mode for completed intakes
- [x] Responsive layout on mobile
- [x] Accessible with keyboard
- [x] Error messages display properly
- [x] Photos upload and display correctly

## Related Documentation

- `SWD_ThanhThao_Rule.txt` - Section B3: Service Intake workflow
- `SHADCN_GUIDE.md` - UI component library usage
- Backend API documentation (when available)
