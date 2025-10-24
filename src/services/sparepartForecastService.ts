import {
  SparepartForecastDto,
  CreateSparepartForecastDto,
  UpdateSparepartForecastDto,
} from "@/entities/sparepart.types";

class SparepartForecastService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // Helper method for API requests
  private async apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}/api${endpoint}`;
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(errorData || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Forecast CRUD operations
  async getAllForecasts(): Promise<SparepartForecastDto[]> {
    return this.apiRequest<SparepartForecastDto[]>("/sparepartforecast");
  }

  async getForecastById(id: string): Promise<SparepartForecastDto> {
    return this.apiRequest<SparepartForecastDto>(`/sparepartforecast/${id}`);
  }

  async createForecast(data: CreateSparepartForecastDto): Promise<SparepartForecastDto> {
    return this.apiRequest<SparepartForecastDto>("/sparepartforecast", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateForecast(id: string, data: UpdateSparepartForecastDto): Promise<SparepartForecastDto> {
    return this.apiRequest<SparepartForecastDto>(`/sparepartforecast/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteForecast(id: string): Promise<void> {
    await this.apiRequest<void>(`/sparepartforecast/${id}`, {
      method: "DELETE",
    });
  }

  // Specialized forecast operations
  async getForecastsBySparepart(sparepartId: string): Promise<SparepartForecastDto[]> {
    return this.apiRequest<SparepartForecastDto[]>(`/sparepartforecast/sparepart/${sparepartId}`);
  }

  async getForecastsByCenter(centerId: string): Promise<SparepartForecastDto[]> {
    return this.apiRequest<SparepartForecastDto[]>(`/sparepartforecast/center/${centerId}`);
  }

  async getLowReorderPointForecasts(): Promise<SparepartForecastDto[]> {
    return this.apiRequest<SparepartForecastDto[]>("/sparepartforecast/low-reorder");
  }

  async approveForecast(id: string, approvedBy: string): Promise<SparepartForecastDto> {
    return this.apiRequest<SparepartForecastDto>(`/sparepartforecast/${id}/approve`, {
      method: "PUT",
      body: JSON.stringify({ approvedBy }),
    });
  }

  // AI-based forecasting (mock implementation)
  async generateAIForecast(
    _sparepartId: string,
    _centerId: string,
    _historicalData?: Record<string, unknown>
  ): Promise<{
    predictedUsage: number;
    safetyStock: number;
    reorderPoint: number;
    confidence: number;
    reasoning: string;
  }> {
    // Mock AI forecast generation
    // In real implementation, this would call an ML service
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing time

    const baseUsage = Math.floor(Math.random() * 50) + 10;
    const seasonalFactor = 1 + (Math.random() - 0.5) * 0.3;
    const trendFactor = 1 + (Math.random() - 0.5) * 0.2;
    
    const predictedUsage = Math.floor(baseUsage * seasonalFactor * trendFactor);
    const safetyStock = Math.ceil(predictedUsage * 0.2);
    const reorderPoint = predictedUsage + safetyStock;
    const confidence = Math.round((0.7 + Math.random() * 0.25) * 100) / 100;

    let reasoning = `Dự báo dựa trên phân tích dữ liệu lịch sử và xu hướng thị trường:\n`;
    reasoning += `• Mức sử dụng cơ bản: ${baseUsage} đơn vị/tháng\n`;
    reasoning += `• Yếu tố theo mùa: ${(seasonalFactor * 100 - 100).toFixed(1)}%\n`;
    reasoning += `• Xu hướng phát triển: ${(trendFactor * 100 - 100).toFixed(1)}%\n`;
    reasoning += `• Độ tin cậy: ${(confidence * 100).toFixed(0)}%`;

    return {
      predictedUsage,
      safetyStock,
      reorderPoint,
      confidence,
      reasoning,
    };
  }

  // Forecast analytics
  async getForecastAccuracy(_centerId?: string): Promise<{
    accuracy: number;
    totalForecasts: number;
    accurateForecasts: number;
    avgConfidence: number;
  }> {
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      accuracy: 0.85,
      totalForecasts: 156,
      accurateForecasts: 132,
      avgConfidence: 0.82,
    };
  }
}

export const sparepartForecastService = new SparepartForecastService();