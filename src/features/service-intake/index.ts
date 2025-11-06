/**
 * Service Intake Feature - Barrel Exports
 */

// Components
export { IntakeStatusBadge } from "./components/IntakeStatusBadge";
export { IntakeActionButtons } from "./components/IntakeActionButtons";
export { CreateIntakeDialog } from "./components/CreateIntakeDialog";

// Pages
export { default as ServiceIntakeList } from "./pages/ServiceIntakeList";
export { default as ApprovedBookingsList } from "./pages/ApprovedBookingsList";
export { default as ServiceIntakeDetail } from "./pages/ServiceIntakeDetail";

// Types
export type {
    IntakeStatus,
    ServiceIntake,
    CreateIntakeRequest,
    UpdateIntakeRequest,
    IntakeFilters,
    IntakeActionType,
} from "./types";

export {
    INTAKE_STATUS_WORKFLOW,
    INTAKE_ACTIONS,
} from "./types";

// Schemas
export {
    createIntakeSchema,
    updateIntakeSchema,
    createWalkInIntakeSchema,
} from "./schemas/intake.schema";

export type {
    CreateIntakeFormData,
    UpdateIntakeFormData,
    CreateWalkInIntakeFormData,
} from "./schemas/intake.schema";
