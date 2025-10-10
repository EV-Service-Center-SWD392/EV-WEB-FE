import {
  RevenueData,
  RevenueFilters,
  RevenueStats,
  TopServiceCenter,
  RevenueChart,
} from "@/entities/revenue.types";

// Mock data for revenue
const mockRevenueData: RevenueData[] = [
  {
    id: "1",
    date: "2024-01-15",
    serviceCenter: "Trung tâm Quận 1",
    totalRevenue: 45000000,
    totalBookings: 25,
    completedBookings: 23,
    cancelledBookings: 2,
    averageOrderValue: 1956521,
    partsRevenue: 28000000,
    serviceRevenue: 17000000,
    technicianCount: 5,
  },
  {
    id: "2",
    date: "2024-01-15",
    serviceCenter: "Trung tâm Quận 7",
    totalRevenue: 38000000,
    totalBookings: 18,
    completedBookings: 16,
    cancelledBookings: 2,
    averageOrderValue: 2111111,
    partsRevenue: 22000000,
    serviceRevenue: 16000000,
    technicianCount: 4,
  },
  {
    id: "3",
    date: "2024-01-15",
    serviceCenter: "Trung tâm Quận 3",
    totalRevenue: 32000000,
    totalBookings: 20,
    completedBookings: 18,
    cancelledBookings: 2,
    averageOrderValue: 1600000,
    partsRevenue: 18000000,
    serviceRevenue: 14000000,
    technicianCount: 3,
  },
  {
    id: "4",
    date: "2024-01-14",
    serviceCenter: "Trung tâm Quận 1",
    totalRevenue: 42000000,
    totalBookings: 22,
    completedBookings: 20,
    cancelledBookings: 2,
    averageOrderValue: 1909091,
    partsRevenue: 25000000,
    serviceRevenue: 17000000,
    technicianCount: 5,
  },
  {
    id: "5",
    date: "2024-01-14",
    serviceCenter: "Trung tâm Quận 7",
    totalRevenue: 35000000,
    totalBookings: 16,
    completedBookings: 14,
    cancelledBookings: 2,
    averageOrderValue: 2187500,
    partsRevenue: 20000000,
    serviceRevenue: 15000000,
    technicianCount: 4,
  },
  {
    id: "6",
    date: "2024-01-13",
    serviceCenter: "Trung tâm Quận 1",
    totalRevenue: 48000000,
    totalBookings: 28,
    completedBookings: 26,
    cancelledBookings: 2,
    averageOrderValue: 1714286,
    partsRevenue: 30000000,
    serviceRevenue: 18000000,
    technicianCount: 5,
  },
  {
    id: "7",
    date: "2024-01-12",
    serviceCenter: "Trung tâm Quận 2",
    totalRevenue: 25000000,
    totalBookings: 12,
    completedBookings: 11,
    cancelledBookings: 1,
    averageOrderValue: 2083333,
    partsRevenue: 15000000,
    serviceRevenue: 10000000,
    technicianCount: 3,
  },
  {
    id: "8",
    date: "2024-01-11",
    serviceCenter: "Trung tâm Quận 5",
    totalRevenue: 30000000,
    totalBookings: 15,
    completedBookings: 14,
    cancelledBookings: 1,
    averageOrderValue: 2000000,
    partsRevenue: 18000000,
    serviceRevenue: 12000000,
    technicianCount: 4,
  },
];

class RevenueService {
  // Simulate API delay
  private delay(ms: number = 500): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Get revenue data with filters
  async getRevenueData(filters: RevenueFilters = {}): Promise<RevenueData[]> {
    await this.delay();

    let filteredData = [...mockRevenueData];

    // Apply filters
    if (filters.startDate) {
      filteredData = filteredData.filter(
        (item) => new Date(item.date) >= new Date(filters.startDate!)
      );
    }

    if (filters.endDate) {
      filteredData = filteredData.filter(
        (item) => new Date(item.date) <= new Date(filters.endDate!)
      );
    }

    if (filters.serviceCenter) {
      filteredData = filteredData.filter((item) =>
        item.serviceCenter
          .toLowerCase()
          .includes(filters.serviceCenter!.toLowerCase())
      );
    }

    // Sort by date descending
    filteredData.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return filteredData;
  }

  // Get revenue statistics
  async getRevenueStats(filters: RevenueFilters = {}): Promise<RevenueStats> {
    await this.delay();

    const data = await this.getRevenueData(filters);

    const totalRevenue = data.reduce((sum, item) => sum + item.totalRevenue, 0);
    const totalBookings = data.reduce(
      (sum, item) => sum + item.totalBookings,
      0
    );
    const completedBookings = data.reduce(
      (sum, item) => sum + item.completedBookings,
      0
    );

    const completionRate =
      totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0;
    const averageOrderValue =
      completedBookings > 0 ? totalRevenue / completedBookings : 0;

    // Calculate growth (mock data - comparing with previous period)
    const revenueGrowth = 12.5; // % growth
    const bookingsGrowth = 8.3; // % growth

    return {
      totalRevenue,
      totalBookings,
      completionRate,
      averageOrderValue,
      growth: {
        revenue: revenueGrowth,
        bookings: bookingsGrowth,
      },
    };
  }

  // Get top performing service centers
  async getTopServiceCenters(
    filters: RevenueFilters = {}
  ): Promise<TopServiceCenter[]> {
    await this.delay();

    const data = await this.getRevenueData(filters);

    // Group by service center
    const centerStats = data.reduce(
      (acc, item) => {
        if (!acc[item.serviceCenter]) {
          acc[item.serviceCenter] = {
            name: item.serviceCenter,
            revenue: 0,
            bookings: 0,
            completedBookings: 0,
            totalBookings: 0,
          };
        }

        acc[item.serviceCenter].revenue += item.totalRevenue;
        acc[item.serviceCenter].bookings += item.totalBookings;
        acc[item.serviceCenter].completedBookings += item.completedBookings;
        acc[item.serviceCenter].totalBookings += item.totalBookings;

        return acc;
      },
      {} as Record<
        string,
        {
          name: string;
          revenue: number;
          bookings: number;
          completedBookings: number;
          totalBookings: number;
        }
      >
    );

    // Convert to array and calculate completion rate
    return Object.values(centerStats)
      .map((center) => ({
        name: center.name,
        revenue: center.revenue,
        bookings: center.bookings,
        completionRate:
          center.totalBookings > 0
            ? (center.completedBookings / center.totalBookings) * 100
            : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }

  // Get revenue chart data
  async getRevenueChart(filters: RevenueFilters = {}): Promise<RevenueChart[]> {
    await this.delay();

    const data = await this.getRevenueData(filters);

    // Group by date
    const chartData = data.reduce(
      (acc, item) => {
        if (!acc[item.date]) {
          acc[item.date] = {
            date: item.date,
            revenue: 0,
            bookings: 0,
          };
        }

        acc[item.date].revenue += item.totalRevenue;
        acc[item.date].bookings += item.totalBookings;

        return acc;
      },
      {} as Record<string, RevenueChart>
    );

    // Convert to array and sort by date
    return Object.values(chartData).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }

  // Get revenue by service type (parts vs service)
  async getRevenueByType(filters: RevenueFilters = {}): Promise<{
    partsRevenue: number;
    serviceRevenue: number;
    partsPercentage: number;
    servicePercentage: number;
  }> {
    await this.delay();

    const data = await this.getRevenueData(filters);

    const partsRevenue = data.reduce((sum, item) => sum + item.partsRevenue, 0);
    const serviceRevenue = data.reduce(
      (sum, item) => sum + item.serviceRevenue,
      0
    );
    const totalRevenue = partsRevenue + serviceRevenue;

    return {
      partsRevenue,
      serviceRevenue,
      partsPercentage:
        totalRevenue > 0 ? (partsRevenue / totalRevenue) * 100 : 0,
      servicePercentage:
        totalRevenue > 0 ? (serviceRevenue / totalRevenue) * 100 : 0,
    };
  }

  // Export revenue report
  async exportRevenueReport(filters: RevenueFilters = {}): Promise<string> {
    await this.delay();

    // In real implementation, this would generate and return a file URL
    const data = await this.getRevenueData(filters);

    // Mock export - just return a success message
    return `Đã xuất báo cáo với ${data.length} bản ghi dữ liệu`;
  }
}

export const revenueService = new RevenueService();
