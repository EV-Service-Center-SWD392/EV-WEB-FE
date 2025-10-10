export interface RevenueData {
  id: string;
  date: string;
  serviceCenter: string;
  totalRevenue: number;
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  averageOrderValue: number;
  partsRevenue: number; // doanh thu từ linh kiện
  serviceRevenue: number; // doanh thu từ dịch vụ
  technicianCount: number; // số kỹ thuật viên hoạt động
}

export interface RevenueFilters {
  startDate?: string;
  endDate?: string;
  serviceCenter?: string;
  period?: "daily" | "weekly" | "monthly" | "yearly";
}

export interface RevenueStats {
  totalRevenue: number;
  totalBookings: number;
  completionRate: number;
  averageOrderValue: number;
  growth: {
    revenue: number; // % tăng trưởng doanh thu
    bookings: number; // % tăng trưởng lượng đơn
  };
}

export interface TopServiceCenter {
  name: string;
  revenue: number;
  bookings: number;
  completionRate: number;
}

export interface RevenueChart {
  date: string;
  revenue: number;
  bookings: number;
}
