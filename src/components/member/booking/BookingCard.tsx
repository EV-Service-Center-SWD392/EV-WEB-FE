// Using English for all code and comments as requested.
import Image from "next/image";
import {
  TagIcon,
  WrenchScrewdriverIcon,
  CircleStackIcon,
} from "@heroicons/react/24/outline";

// IMPORTANT: Using OrderStatus now as the primary status indicator.
export type OrderStatus =
  | "PENDING"
  | "PROPOSING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

// Updated data interface for the card
export interface BookingCardData {
  id: string;
  vehicleName: string;
  vehicleImageUrl: string;
  scheduledAt: string;
  serviceCount: number;
  partsCount: number;
  totalAmount: number;
  status: OrderStatus; // Changed from BookingStatus
}

// MOCK DATA using the new interface for demonstration
export const MOCK_BOOKINGS_DATA: BookingCardData[] = [
  {
    id: "1",
    vehicleName: "Vinfast VF8",
    vehicleImageUrl: "/images/vf8.jpg",
    scheduledAt: "2025-10-20T09:00:00Z",
    serviceCount: 3,
    partsCount: 2,
    totalAmount: 2500000,
    status: "PROPOSING",
  },
  {
    id: "2",
    vehicleName: "Tesla Model 3",
    vehicleImageUrl: "/images/model3.jpg",
    scheduledAt: "2025-10-22T14:00:00Z",
    serviceCount: 1,
    partsCount: 0,
    totalAmount: 500000,
    status: "IN_PROGRESS",
  },
  {
    id: "3",
    vehicleName: "Porsche Taycan",
    vehicleImageUrl: "/images/taycan.jpg",
    scheduledAt: "2025-09-15T11:00:00Z",
    serviceCount: 5,
    partsCount: 8,
    totalAmount: 15200000,
    status: "COMPLETED",
  },
  {
    id: "4",
    vehicleName: "Hyundai Ioniq 5",
    vehicleImageUrl: "/images/ioniq5.jpg",
    scheduledAt: "2025-09-10T16:00:00Z",
    serviceCount: 2,
    partsCount: 0,
    totalAmount: 0,
    status: "CANCELLED",
  },
];

// UPDATED styles to match OrderStatus
const statusStyles: Record<
  OrderStatus,
  { text: string; bg: string; dot: string }
> = {
  PENDING: {
    text: "text-yellow-800",
    bg: "bg-yellow-100",
    dot: "bg-yellow-500",
  },
  PROPOSING: { text: "text-sky-800", bg: "bg-sky-100", dot: "bg-sky-500" },
  IN_PROGRESS: { text: "text-blue-800", bg: "bg-blue-100", dot: "bg-blue-500" },
  COMPLETED: {
    text: "text-green-800",
    bg: "bg-green-100",
    dot: "bg-green-500",
  },
  CANCELLED: { text: "text-gray-800", bg: "bg-gray-100", dot: "bg-gray-500" },
};

export function BookingCard({ booking }: { booking: BookingCardData }) {
  const {
    vehicleName,
    vehicleImageUrl,
    scheduledAt,
    serviceCount,
    partsCount,
    totalAmount,
    status,
  } = booking;
  const style = statusStyles[status];

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(scheduledAt));

  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "VND", // You can change this to USD if needed
  }).format(totalAmount);

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col min-h-[280px] cursor-pointer">
      {/* Image Section */}
      <div className="relative h-36">
        <Image
          src={vehicleImageUrl}
          alt={vehicleName}
          layout="fill"
          objectFit="cover"
          className="transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Content Section */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Header with Name and Status */}
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg text-gray-800 pr-2">
            {vehicleName}
          </h3>
          <div
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text} flex-shrink-0`}
          >
            <span className={`w-2 h-2 mr-1.5 rounded-full ${style.dot}`}></span>
            {status.replace("_", " ")}
          </div>
        </div>
        <p className="text-sm text-gray-500 mb-4">{formattedDate}</p>

        {/* Details Section */}
        <div className="space-y-2 text-sm text-gray-600 mt-auto">
          <div className="flex items-center">
            <WrenchScrewdriverIcon className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
            <span>{serviceCount} services</span>
          </div>
          <div className="flex items-center">
            <CircleStackIcon className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
            <span>{partsCount} parts</span>
          </div>
          <div className="flex items-center">
            <TagIcon className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
            <span className="font-semibold">{formattedAmount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
