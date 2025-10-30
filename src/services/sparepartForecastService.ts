import type {
  SparepartForecastDto,
  CreateSparepartForecastDto,
  UpdateSparepartForecastDto,
} from "@/entities/sparepart.types";

import { api } from "./api";

const FORECAST_PATH = "/api/sparepartforecast";

/**
 * Sparepart Forecast Service
 * Manages sparepart forecast operations
 */
export const sparepartForecastService = {
  /**
   * Get all forecasts
   */
  async getAllForecasts(): Promise<SparepartForecastDto[]> {
    const response = await api.get<SparepartForecastDto[]>(FORECAST_PATH);
    return response.data;
  },

  /**
   * Get a single forecast by ID
   */
  async getForecastById(id: string): Promise<SparepartForecastDto> {
    const response = await api.get<SparepartForecastDto>(`${FORECAST_PATH}/${id}`);
    return response.data;
  },

  /**
   * Create a new forecast
   */
  async createForecast(data: CreateSparepartForecastDto): Promise<SparepartForecastDto> {
    const response = await api.post<SparepartForecastDto>(FORECAST_PATH, data);
    return response.data;
  },

  /**
   * Update an existing forecast
   */
  async updateForecast(id: string, data: UpdateSparepartForecastDto): Promise<SparepartForecastDto> {
    const response = await api.put<SparepartForecastDto>(`${FORECAST_PATH}/${id}`, data);
    return response.data;
  },

  /**
   * Delete a forecast
   */
  async deleteForecast(id: string): Promise<void> {
    await api.delete(`${FORECAST_PATH}/${id}`);
  },

  /**
   * Get forecasts by sparepart
   */
  async getForecastsBySparepart(sparepartId: string): Promise<SparepartForecastDto[]> {
    const response = await api.get<SparepartForecastDto[]>(`${FORECAST_PATH}/sparepart/${sparepartId}`);
    return response.data;
  },

  /**
   * Get forecasts by center
   */
  async getForecastsByCenter(centerId: string): Promise<SparepartForecastDto[]> {
    const response = await api.get<SparepartForecastDto[]>(`${FORECAST_PATH}/center/${centerId}`);
    return response.data;
  },

  /**
   * Get low reorder point forecasts
   */
  async getLowReorderPointForecasts(): Promise<SparepartForecastDto[]> {
    const response = await api.get<SparepartForecastDto[]>(`${FORECAST_PATH}/low-reorder`);
    return response.data;
  },

  /**
   * Approve a forecast
   */
  async approveForecast(id: string, approvedBy: string): Promise<SparepartForecastDto> {
    const response = await api.put<SparepartForecastDto>(`${FORECAST_PATH}/${id}/approve`, { approvedBy });
    return response.data;
  },

  /**
   * Generate AI forecast
   */
  async generateAIForecast(
    sparepartId: string,
    centerId: string,
    historicalData?: Record<string, unknown>
  ): Promise<{
    predictedUsage: number;
    safetyStock: number;
    reorderPoint: number;
    confidence: number;
    reasoning: string;
  }> {
    const response = await api.post(`${FORECAST_PATH}/ai-generate`, {
      sparepartId,
      centerId,
      historicalData,
    });
    return response.data;
  },

  /**
   * Get forecast accuracy
   */
  async getForecastAccuracy(centerId?: string): Promise<{
    accuracy: number;
    totalForecasts: number;
    accurateForecasts: number;
    avgConfidence: number;
  }> {
    const response = await api.get(`${FORECAST_PATH}/accuracy`, {
      params: centerId ? { centerId } : undefined,
    });
    return response.data;
  },
};

export default sparepartForecastService;