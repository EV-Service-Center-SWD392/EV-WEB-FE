import Image from "next/image";
import {
  CalendarDaysIcon,
  WrenchScrewdriverIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  PhoneIcon,
  CurrencyDollarIcon,
  PencilIcon,
  PlusCircleIcon,
  MinusCircleIcon,
} from "@heroicons/react/24/outline";

export type BookingMode = "CREATE" | "PROPOSE" | "VIEW";

export interface BookingDetailsData {
  id: string;
  vehicleName: string;
  vehicleImageUrl: string;
  licensePlate: string;
  serviceCenter: string;
  scheduledAt: string;
  status: OrderStatus; // Using OrderStatus as requested
  technician?: {
    name: string;
    phone: string;
  };
  services: { id: string; name: string; price: number }[];
  parts: { id: string; name: string; price: number }[];
  notes?: string;
  totalAmount: number;
}

interface BookingModalContentProps {
  mode: BookingMode;
  bookingData: Partial<BookingDetailsData>; // Partial for create mode
  onClose: () => void;
  onSubmit?: (payload: any) => void; // Generic payload for submission
}

// Reusable component for displaying a detail item with an icon.
function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | React.ReactNode;
}) {
  return (
    <div className="flex items-start">
      <Icon className="h-5 w-5 text-indigo-500 mr-3 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-semibold text-gray-800">{value}</p>
      </div>
    </div>
  );
}

export function BookingModalContent({
  mode,
  bookingData,
  onClose,
  onSubmit,
}: BookingModalContentProps) {
  const isViewOnly = mode === "VIEW";

  const modalTitles: Record<BookingMode, string> = {
    CREATE: "Create a New Booking",
    PROPOSE: "Review Service Proposal",
    VIEW: "Booking Details",
  };

  return (
    <div className="p-1 max-w-4xl w-full">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {modalTitles[mode]}
      </h2>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column: Core Info & Notes */}
        <div className="lg:w-1/2 space-y-6">
          <div className="relative aspect-video w-full rounded-lg overflow-hidden border">
            <Image
              src={bookingData.vehicleImageUrl || "/images/placeholder.jpg"}
              alt={bookingData.vehicleName || "Vehicle"}
              layout="fill"
              objectFit="cover"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <DetailItem
              icon={Cog6ToothIcon}
              label="Vehicle"
              value={`${bookingData.vehicleName} (${bookingData.licensePlate})`}
            />
            <DetailItem
              icon={CalendarDaysIcon}
              label="Scheduled For"
              value={new Intl.DateTimeFormat("en-US", {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(new Date(bookingData.scheduledAt || Date.now()))}
            />
            {bookingData.technician && (
              <>
                <DetailItem
                  icon={UserCircleIcon}
                  label="Assigned Tech"
                  value={bookingData.technician.name}
                />
                <DetailItem
                  icon={PhoneIcon}
                  label="Tech Contact"
                  value={bookingData.technician.phone}
                />
              </>
            )}
          </div>
          {/* Sticky Note Section */}
          <div className="relative">
            <div className="bg-yellow-100 border-l-4 border-yellow-400 p-4 rounded-r-lg transform -rotate-1 shadow-sm">
              <div className="flex">
                <PencilIcon className="h-5 w-5 text-yellow-700 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-yellow-800">Notes</h4>
                  {isViewOnly ? (
                    <p className="text-sm text-yellow-900 mt-1">
                      {bookingData.notes || "No notes provided."}
                    </p>
                  ) : (
                    <textarea
                      rows={3}
                      className="w-full bg-transparent text-sm text-yellow-900 mt-1 focus:outline-none placeholder-yellow-700/50"
                      placeholder="Add notes for the technician..."
                      defaultValue={bookingData.notes}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Services, Parts & Summary */}
        <div className="lg:w-1/2 flex flex-col">
          <div className="flex-grow space-y-4">
            {/* Services Section */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Services</h3>
              <div className="max-h-32 overflow-y-auto space-y-2 p-2 bg-gray-50 rounded-md border">
                {/* This would be a list of available services in CREATE/PROPOSE mode */}
                {bookingData.services?.map((service) => (
                  <div
                    key={service.id}
                    className="flex justify-between items-center p-2 bg-white rounded shadow-sm"
                  >
                    <div>
                      <p className="font-medium">{service.name}</p>
                      <p className="text-xs text-gray-500">
                        {service.price.toLocaleString("en-US")} VND
                      </p>
                    </div>
                    {!isViewOnly && (
                      <button>
                        <PlusCircleIcon className="h-6 w-6 text-green-500 hover:text-green-700" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {/* Parts Section */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">
                Parts for Purchase
              </h3>
              <div className="max-h-32 overflow-y-auto space-y-2 p-2 bg-gray-50 rounded-md border">
                {bookingData.parts?.map((part) => (
                  <div
                    key={part.id}
                    className="flex justify-between items-center p-2 bg-white rounded shadow-sm"
                  >
                    <div>
                      <p className="font-medium">{part.name}</p>
                      <p className="text-xs text-gray-500">
                        {part.price.toLocaleString("en-US")} VND
                      </p>
                    </div>
                    {!isViewOnly && (
                      <button>
                        <PlusCircleIcon className="h-6 w-6 text-green-500 hover:text-green-700" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Summary & Total */}
          <div className="mt-6 pt-4 border-t">
            <h3 className="font-semibold text-gray-700 mb-2">
              Your Selections
            </h3>
            {/* List selected items here... */}
            <div className="flex justify-between items-center mt-4">
              <p className="text-lg font-bold text-gray-900">Total Amount</p>
              <p className="text-lg font-bold text-indigo-600">
                {bookingData.totalAmount?.toLocaleString("en-US") || 0} VND
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer with Action Buttons */}
      <div className="mt-8 pt-4 border-t flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold"
        >
          Close
        </button>
        {mode === "CREATE" && (
          <button
            onClick={onSubmit}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold"
          >
            Submit Request
          </button>
        )}
        {mode === "PROPOSE" && (
          <>
            <button
              onClick={onSubmit}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
            >
              Request Changes
            </button>
            <button
              onClick={onSubmit}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
            >
              Approve Proposal
            </button>
          </>
        )}
      </div>
    </div>
  );
}
