import { useState, useMemo, useEffect } from "react";
import { bookingService } from "@/services/bookingService";

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
  bookingData?: Partial<BookingDetailsData>;
  onClose: () => void;
  onSubmit?: (payload: any) => void;
}

export function BookingModalContent({
  bookingData = {},
  onClose,
  onSubmit,
}: BookingModalContentProps) {
  const isViewOnly = false;

  const [vehicleId, setVehicleId] = useState<string | undefined>(undefined);
  const [vehicles, setVehicles] = useState<any[]>([]);

  // Load vehicles from API only
  useEffect(() => {
    let mounted = true;
    bookingService
      .getVehicle()
      .then((v) => {
        if (!mounted) return;
        if (Array.isArray(v)) setVehicles(v);
        else setVehicles([]);
      })
      .catch(() => {
        if (!mounted) return;
        setVehicles([]);
      });
    return () => {
      mounted = false;
    };
  }, []);
  const [centerId, setCenterId] = useState<string | undefined>(undefined);
  const [centers, setCenters] = useState<any[]>([]);
  const [selectedslot, setSelectedslot] = useState<string | undefined>(
    undefined
  );
  const [availableSchedulesState, setAvailableSchedulesState] = useState<any[]>(
    []
  );
  const [selectedDate, setSelectedDate] = useState<string | undefined>(
    undefined
  );
  const [notes, setNotes] = useState<string | undefined>(bookingData.notes);

  type SlotLike = {
    slot?: number | string;
    slotId?: number | string;
    startUtc?: string;
    startutc?: string;
  };

  // Step state for unreachable effect (vehicle -> center -> date -> slot)
  const hasVehicle = Boolean(vehicleId);
  const hasCenter = Boolean(centerId) && hasVehicle;
  const hasDate = Boolean(selectedDate) && hasCenter;
  const hasSlot = Boolean(selectedslot) && hasDate;

  // availableSchedulesState will be populated from API when centerId changes
  const availableSchedules = useMemo(
    () => availableSchedulesState,
    [availableSchedulesState]
  );

  // available slots for the chosen date
  const availableSlotsForDate = useMemo(() => {
    if (!selectedDate) return [];
    return availableSchedules.filter((s) => {
      const d = new Date(s.startUtc).toISOString().slice(0, 10);
      return d === selectedDate;
    });
  }, [availableSchedules, selectedDate]);

  // dates in the loaded week that have at least one slot
  const availableDates = useMemo(() => {
    const set = new Set<string>();
    availableSchedules.forEach((s) => {
      try {
        const d = new Date(s.startUtc).toISOString().slice(0, 10);
        set.add(d);
      } catch {
        // ignore
      }
    });
    return Array.from(set).sort();
  }, [availableSchedules]);

  const selectedSlotDisplay = useMemo(() => {
    if (!selectedslot) return null;
    const findByVal = (arr: SlotLike[]) =>
      arr.find(
        (s, idx) => String(s.slot ?? s.slotId ?? idx) === String(selectedslot)
      );
    return (
      findByVal(availableSchedules as SlotLike[]) ||
      findByVal(availableSlotsForDate) ||
      null
    );
  }, [availableSchedules, availableSlotsForDate, selectedslot]);

  const currentStep = hasSlot
    ? 4
    : hasDate
      ? 3
      : hasCenter
        ? 2
        : hasVehicle
          ? 1
          : 0;

  const modalTitle = "Create a New Booking";
  const dataVehicles = vehicles;
  const selectedVehicle = dataVehicles.find((v) => v.vehicleId === vehicleId);

  // Fetch centers when a vehicle is selected (unreachable effect until vehicle chosen)
  useEffect(() => {
    let mounted = true;
    if (!vehicleId) {
      setCenters([]);
      return () => {
        mounted = false;
      };
    }

    bookingService
      .getCenters()
      .then((c) => mounted && setCenters(c || []))
      .catch(() => mounted && setCenters([]));

    return () => {
      mounted = false;
    };
  }, [vehicleId]);

  // When center changes, load schedules for that center (unreachable until center chosen)
  useEffect(() => {
    let mounted = true;
    setAvailableSchedulesState([]);
    setSelectedDate(undefined);
    setSelectedslot(undefined);
    if (!centerId)
      return () => {
        mounted = false;
      };

    // compute StartDate = today, EndDate = 7 days later (YYYY-MM-DD)
    const start = new Date();
    const startStr = start.toISOString().slice(0, 10);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    const endStr = end.toISOString().slice(0, 10);

    bookingService
      .getBookingSchedule(centerId, startStr, endStr)
      .then(
        (s) => mounted && setAvailableSchedulesState(Array.isArray(s) ? s : [])
      )
      .catch(() => mounted && setAvailableSchedulesState([]));

    return () => {
      mounted = false;
    };
  }, [centerId]);

  const handleSubmit = async () => {
    // Build payload expected by /api/client/Booking
    const slotNumber = Number(selectedslot ?? 0);

    // Find slot object by numeric slot value
    const findSlotObj = (arr: SlotLike[]) => {
      const found = arr.find((s) => {
        const currentSlot = s.slot ?? arr.indexOf(s) + 1;
        return Number(currentSlot) === slotNumber;
      });
      return found;
    };

    const slotObj =
      findSlotObj(availableSchedules) || findSlotObj(availableSlotsForDate);

    // Prefer the explicitly chosen date from the modal (selectedDate).
    // Fall back to the slot start time if available, otherwise use today.
    const bookingDate =
      selectedDate ??
      (
        slotObj?.startUtc ??
        slotObj?.startutc ??
        new Date().toISOString()
      ).split("T")[0];

    const payload = {
      bookingDate,
      slot: slotNumber,
      vehicleId: vehicleId ?? "",
      notes: notes ?? "",
      centerId: centerId ?? "",
    };

    // Call service directly if parent didn't provide custom handler
    if (onSubmit) {
      onSubmit(payload);
    } else {
      try {
        await bookingService.createBooking(payload as any);
        // optional: show toast is handled by api interceptors
      } catch {
        // swallow — api layer already shows toast
      }
    }
  };

  return (
    <div className="p-6 max-w-4xl w-full max-h-[80vh] overflow-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{modalTitle}</h2>

      {/* Stepper: shows unreachable / completed steps */}
      <div className="mb-6">
        <div className="flex items-center gap-3 justify-between">
          <div className="flex-1 hidden sm:flex items-center gap-3">
            {[
              { key: "vehicle", label: "Vehicle", done: hasVehicle },
              { key: "center", label: "Center", done: hasCenter },
              { key: "date", label: "Date", done: hasDate },
              { key: "slot", label: "Slot", done: hasSlot },
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
                  <div
                    className={`font-medium ${step.done ? "text-gray-900" : "text-gray-500"}`}
                  >
                    {step.label}
                  </div>
                </div>
                {idx < 3 && (
                  <div className="w-8 h-[2px] bg-gray-200 mx-3"></div>
                )}
              </div>
            ))}
          </div>
          <div className="sm:hidden text-sm text-gray-600">
            Step: {currentStep}/4
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Column 1: Vehicle + Center */}
        <div className="space-y-6">
          <div className="space-y-3">
            <label
              htmlFor="vehicle-select"
              className="block text-sm font-medium text-gray-700"
            >
              Select Vehicle
            </label>
            <select
              id="vehicle-select"
              className="mt-1 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value || undefined)}
              disabled={isViewOnly}
            >
              <option value="">-- Choose a vehicle --</option>
              {dataVehicles.map((v: any) => (
                <option key={v.vehicleId} value={v.vehicleId}>
                  {v.licensePlate} ({v.year} {v.color})
                </option>
              ))}
            </select>
          </div>

          <div
            className={`space-y-3 ${isViewOnly || !hasVehicle ? "opacity-60 pointer-events-none" : ""}`}
          >
            <label
              htmlFor="center-select"
              className="block text-sm font-medium text-gray-700"
            >
              Select Center
            </label>
            <select
              id="center-select"
              className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm"
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
          </div>
        </div>

        {/* Column 2: Date & Slot */}
        <div
          className={`space-y-4 ${isViewOnly || !hasCenter ? "opacity-60 pointer-events-none" : ""}`}
        >
          <div>
            <label
              htmlFor="date-select"
              className="block text-sm font-medium text-gray-700"
            >
              Select Date
            </label>

            {/* quick week picker: show days that have slots */}
            <div className="mt-3 flex gap-2 flex-wrap">
              {availableDates.length === 0 ? (
                <div className="text-sm text-gray-500">No slots this week</div>
              ) : (
                availableDates.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      setSelectedDate(d);
                      setSelectedslot(undefined);
                    }}
                    className={`px-3 py-1 rounded-md text-sm border ${
                      selectedDate === d
                        ? "bg-indigo-600 text-white"
                        : "bg-white text-gray-700"
                    }`}
                    disabled={isViewOnly}
                  >
                    {new Date(d).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </button>
                ))
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="slot-select"
              className="block text-sm font-medium text-gray-700"
            >
              Select Slot
            </label>
            <select
              id="slot-select"
              className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm"
              value={selectedslot}
              onChange={(e) => setSelectedslot(e.target.value || undefined)}
              disabled={
                isViewOnly ||
                !selectedDate ||
                availableSlotsForDate.length === 0
              }
            >
              <option value="">-- Choose a slot --</option>
              {availableSlotsForDate.map((s: any, idx: number) => {
                // Each slot should have a unique position in the array even if slot numbers are missing
                const slotNumber = s.slot ?? idx + 1; // Use array index + 1 as fallback
                const startRaw = s.startUtc ?? s.startutc ?? "";
                const endRaw = s.endUtc ?? s.endutc ?? "";
                const startTime =
                  startRaw.split("T")[1]?.split(":").slice(0, 2).join(":") ??
                  startRaw;
                const startIsDate =
                  startRaw && !Number.isNaN(Date.parse(startRaw));
                const endIsDate = endRaw && !Number.isNaN(Date.parse(endRaw));

                const displayStart = startIsDate
                  ? new Date(startRaw).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "numeric",
                      timeZone: "UTC",
                    })
                  : startTime || `Slot ${slotNumber}`;

                const displayEnd = endIsDate
                  ? new Date(endRaw).toLocaleString("en-US", {
                      hour: "numeric",
                      minute: "numeric",
                      timeZone: "UTC",
                    })
                  : "";

                // Use both index and time for guaranteed unique keys
                const key = `slot-${idx}-${startTime || slotNumber}`;

                return (
                  <option key={key} value={slotNumber}>
                    {displayStart} - {displayEnd}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Column 3: Summary + Notes + Submit */}
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded border">
            <p className="text-sm text-gray-600">
              Vehicle:{" "}
              {selectedVehicle?.licensePlate || bookingData.vehicleName || "-"}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Center:{" "}
              {centers.find((c) => (c.centerId || c.id) === centerId)?.name ||
                "-"}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Date: {selectedDate || "-"}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Slot:{" "}
              {(() => {
                const startRaw =
                  selectedSlotDisplay?.startUtc ??
                  selectedSlotDisplay?.startutc ??
                  "";
                const display =
                  startRaw && !Number.isNaN(Date.parse(startRaw))
                    ? new Date(startRaw).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "numeric",
                        timeZone: "UTC",
                      })
                    : "-";
                return display;
              })()}
            </p>
          </div>

          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-gray-700"
            >
              Notes (optional)
            </label>
            <textarea
              id="notes"
              rows={3}
              className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm"
              value={notes || ""}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any notes for the technician"
              disabled={isViewOnly}
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold"
            >
              Close
            </button>
            <button
              onClick={handleSubmit}
              disabled={
                !vehicleId || !centerId || !selectedDate || !selectedslot
              }
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold disabled:opacity-50"
            >
              Submit Request
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
