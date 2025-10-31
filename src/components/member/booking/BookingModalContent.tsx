import Image from "next/image";
import { useState, useMemo, useEffect } from "react";
import VEHICLES from "../../../mockData/vehicles.json";
import SERVICES from "../../../mockData/services.json";
import BOOKINGSCHEDULES from "../../../mockData/bookingschedules.json";
import { bookingService } from "@/services/bookingService";

export type BookingMode = "CREATE" | "PROPOSE" | "VIEW";

export interface BookingDetailsData {
  id: string;
  vehicleName: string;
  vehicleImageUrl: string;
  licensePlate?: string;
  serviceCenter?: string;
  scheduledAt?: string;
  status?: string;
  technician?: { name: string; phone: string };
  services?: { id: string; name: string; price: number }[];
  notes?: string;
  totalAmount?: number;
}

interface BookingModalContentProps {
  mode: BookingMode;
  bookingData: Partial<BookingDetailsData>;
  onClose: () => void;
  onSubmit?: (payload: any) => void;
}

export function BookingModalContent({
  mode,
  bookingData,
  onClose,
  onSubmit,
}: BookingModalContentProps) {
  const isViewOnly = mode === "VIEW";

  const [vehicleId, setVehicleId] = useState<string | undefined>(undefined);
  const [centerId, setCenterId] = useState<string | undefined>(undefined);
  const [centers, setCenters] = useState<any[]>([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [scheduleId, setScheduleId] = useState<string | undefined>(undefined);
  const [notes, setNotes] = useState<string | undefined>(bookingData.notes);

  // Step state for unreachable effect
  const hasVehicle = Boolean(vehicleId);
  const hasCenter = Boolean(centerId) && hasVehicle;
  const hasServices = selectedServiceIds.length > 0 && hasCenter;
  const hasSchedule = Boolean(scheduleId) && hasServices;

  const availableSchedules = useMemo(() => {
    if (!centerId) return [];
    return (BOOKINGSCHEDULES as any[]).filter((s) => s.centerId === centerId);
  }, [centerId]);

  const totalAmount = useMemo(() => {
    const sel = (SERVICES as any[]).filter((s) =>
      selectedServiceIds.includes(s.serviceId)
    );
    return sel.reduce((sum, s) => sum + (s.basePrice || 0), 0);
  }, [selectedServiceIds]);

  const handleToggleService = (id: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const modalTitles: Record<BookingMode, string> = {
    CREATE: "Create a New Booking",
    PROPOSE: "Review Service Proposal",
    VIEW: "Booking Details",
  };

  const handleSubmit = () => {
    const payload = {
      vehicleId,
      centerId,
      services: selectedServiceIds,
      scheduleId,
      notes,
    };
    onSubmit?.(payload);
  };

  const selectedVehicle = (VEHICLES as any[]).find(
    (v) => v.vehicleId === vehicleId
  );
  useEffect(() => {
    let mounted = true;
    bookingService
      .getCenters()
      .then((c) => mounted && setCenters(c || []))
      .catch(() => mounted && setCenters([]));
    return () => {
      mounted = false;
    };
  }, []);

  // Accessibility: compute aria-disabled for form regions
  const vehicleRegionDisabled = isViewOnly === true ? true : false;
  const centerRegionDisabled = isViewOnly || !hasVehicle;
  const servicesRegionDisabled = isViewOnly || !hasCenter;
  const scheduleRegionDisabled = isViewOnly || !hasServices;

  const selectedSchedule = (availableSchedules as any[]).find((s) => s.slotId === scheduleId);

  return (
    <div className="p-1 max-w-4xl w-full">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {modalTitles[mode]}
      </h2>

      {/* Stepper: shows unreachable / completed steps */}
      <div className="mb-6">
        <div className="flex items-center gap-3 justify-between">
          <div className="flex-1 hidden sm:flex items-center gap-3">
            {[
              { key: "vehicle", label: "Vehicle", done: hasVehicle },
              { key: "center", label: "Center", done: hasCenter },
              { key: "services", label: "Services", done: hasServices },
              { key: "schedule", label: "Schedule", done: hasSchedule },
            ].map((step, idx) => (
              <div key={step.key} className="flex items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    step.done
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {idx + 1}
                </div>
                <div className="ml-3 text-sm">
                  <div className={`font-medium ${step.done ? "text-gray-900" : "text-gray-500"}`}>
                    {step.label}
                  </div>
                </div>
                {idx < 3 && <div className="w-8 h-[2px] bg-gray-200 mx-3"></div>}
              </div>
            ))}
          </div>
          <div className="sm:hidden text-sm text-gray-600">
            Step: {hasSchedule ? 4 : hasServices ? 3 : hasCenter ? 2 : hasVehicle ? 1 : 0}/4
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/2 space-y-6">
          <div className="relative aspect-video w-full rounded-lg overflow-hidden border">
            <Image
              src={
                selectedVehicle?.image ||
                bookingData.vehicleImageUrl ||
                "/images/placeholder.jpg"
              }
              alt={
                selectedVehicle?.name || bookingData.vehicleName || "Vehicle"
              }
              layout="fill"
              objectFit="cover"
            />
          </div>

          <div className="space-y-3 relative">
            <label htmlFor="vehicle-select" className="block text-sm font-medium text-gray-700">
              Select Vehicle
            </label>
            <select
              id="vehicle-select"
              className="mt-1 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition-shadow"
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value || undefined)}
              disabled={isViewOnly}
            >
              <option value="">-- Choose a vehicle --</option>
              {(VEHICLES as any[]).map((v) => (
                <option key={v.vehicleId} value={v.vehicleId}>
                  {v.vehicleId} ({v.licensePlate})
                </option>
              ))}
            </select>
            {isViewOnly && <div aria-hidden className="absolute inset-0 bg-white/50" />}
          </div>

          <div className={`space-y-3 relative ${centerRegionDisabled ? "opacity-60 pointer-events-none" : ""}`}>
            <label htmlFor="center-select" className="block text-sm font-medium text-gray-700">
              Select Center
            </label>
            <select
              id="center-select"
              className="mt-1 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition-shadow"
              value={centerId}
              onChange={(e) => setCenterId(e.target.value || undefined)}
              disabled={isViewOnly || !vehicleId}
            >
              <option value="">-- Choose a center --</option>
              {centers.map((c: any) => {
                const id = c.centerId || c.id;
                return (
                  <option key={id} value={id}>
                    {c.name}
                  </option>
                );
              })}
            </select>
            {centerRegionDisabled && <div aria-hidden className="absolute inset-0 bg-white/40 backdrop-blur-sm" />}
          </div>

          <div className={`space-y-3 relative ${servicesRegionDisabled ? "opacity-60 pointer-events-none" : ""}`}>
            <label id="services-label" className="block text-sm font-medium text-gray-700">Select Services</label>
            <div className="grid grid-cols-1 gap-2" aria-labelledby="services-label">
              {(SERVICES as any[]).map((s) => (
                <label
                  key={s.serviceId}
                  className={`flex items-center p-2 border rounded-lg transition-shadow ${selectedServiceIds.includes(s.serviceId) ? "bg-indigo-50 border-indigo-200 shadow-sm" : "bg-white"}`}
                >
                  <input
                    type="checkbox"
                    className="mr-3 h-4 w-4 text-indigo-600 focus:ring-indigo-500 transition-colors"
                    checked={selectedServiceIds.includes(s.serviceId)}
                    onChange={() => handleToggleService(s.serviceId)}
                    disabled={isViewOnly || !centerId}
                  />
                  <div className="flex-1">
                    <div className="font-medium">{s.name}</div>
                    <div className="text-sm text-gray-500">
                      {(s.basePrice || 0).toLocaleString("en-US")} VND
                    </div>
                  </div>
                </label>
              ))}
            </div>
            {servicesRegionDisabled && <div aria-hidden className="absolute inset-0 bg-white/40 backdrop-blur-sm" />}
          </div>

          <div className={`space-y-3 relative ${scheduleRegionDisabled ? "opacity-60 pointer-events-none" : ""}`}>
            <label htmlFor="schedule-select" className="block text-sm font-medium text-gray-700">Select Schedule</label>
            <select
              id="schedule-select"
              className="mt-1 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition-shadow"
              value={scheduleId}
              onChange={(e) => setScheduleId(e.target.value || undefined)}
              disabled={isViewOnly || !selectedServiceIds.length}
            >
              <option value="">-- Choose a schedule --</option>
              {availableSchedules.map((sc: any) => (
                <option key={sc.slotId} value={sc.slotId}>
                  {new Intl.DateTimeFormat("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date(sc.startUtc))}
                </option>
              ))}
            </select>
            {scheduleRegionDisabled && <div aria-hidden className="absolute inset-0 bg-white/40 backdrop-blur-sm" />}
          </div>

          <div className="relative">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes (optional)</label>
            <textarea
              id="notes"
              rows={3}
              className="mt-1 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition-shadow"
              value={notes || ""}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any notes for the technician"
              disabled={isViewOnly}
            />
          </div>
        </div>

        <div className="lg:w-1/2 flex flex-col">
          <div className="flex-grow space-y-4">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Summary</h3>
              <div className="p-4 bg-gray-50 rounded border">
                <p className="text-sm text-gray-600">
                  Vehicle:{" "}
                  {selectedVehicle?.licensePlate ||
                    bookingData.vehicleName ||
                    "-"}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Center:{" "}
                  {centers.find((c) => (c.centerId || c.id) === centerId)
                    ?.name || "-"}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Services: {selectedServiceIds.length || 0}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Schedule: {selectedSchedule ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(selectedSchedule.startUtc)) : "-"}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t">
              <h3 className="font-semibold text-gray-700 mb-2">Total</h3>
              <div className="flex justify-between items-center mt-4">
                <p className="text-lg font-bold text-gray-900">Total Amount</p>
                <p className="text-lg font-bold text-indigo-600">
                  {totalAmount.toLocaleString("en-US")} VND
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold"
            >
              Close
            </button>
            {mode === "CREATE" && (
              <button
                onClick={handleSubmit}
                disabled={
                  !vehicleId ||
                  !centerId ||
                  !selectedServiceIds.length ||
                  !scheduleId
                }
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold disabled:opacity-50"
              >
                Submit Request
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
