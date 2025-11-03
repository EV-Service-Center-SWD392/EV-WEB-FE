import { api } from "@/services/api";

import type { ServiceCatalogOption, ServiceType } from "@/entities/service.types";

const SERVICE_TYPES_PATH = "/api/service-types";
const USE_MOCK_DATA = true;

const mockServiceTypes: ServiceType[] = [
  {
    id: "svc-maintenance",
    name: "Bảo dưỡng định kỳ",
    description: "Kiểm tra tổng quát và bảo dưỡng đầu kỳ",
    durationMinutes: 90,
    category: "Maintenance",
    isActive: true,
  },
  {
    id: "svc-charger",
    name: "Sửa chữa hệ thống sạc",
    description: "Chẩn đoán và sửa chữa bộ sạc / cổng sạc",
    durationMinutes: 120,
    category: "Electrical",
    isActive: true,
  },
  {
    id: "svc-safety",
    name: "Kiểm tra an toàn",
    description: "Đánh giá hệ thống phanh, đèn, cảm biến",
    durationMinutes: 75,
    category: "Inspection",
    isActive: true,
  },
  {
    id: "svc-parts",
    name: "Thay thế phụ tùng",
    description: "Thay mới phụ tùng đã hao mòn theo yêu cầu",
    durationMinutes: 60,
    category: "Repair",
    isActive: true,
  },
];

function mapServiceType(option: ServiceType): ServiceCatalogOption {
  return {
    id: option.id,
    name: option.name,
    description: option.description,
    durationMinutes: option.durationMinutes,
    group: option.category,
  };
}

export const serviceCatalogService = {
  async getServiceTypes(): Promise<ServiceCatalogOption[]> {
    if (USE_MOCK_DATA) {
      return mockServiceTypes.filter((svc) => svc.isActive !== false).map(mapServiceType);
    }

    try {
      const { data } = await api.get<ServiceType[]>(SERVICE_TYPES_PATH);
      return data.map(mapServiceType);
    } catch (error) {
      console.warn("[serviceCatalogService] fallback to mock service types", error);
      return mockServiceTypes.map(mapServiceType);
    }
  },
};

export default serviceCatalogService;
