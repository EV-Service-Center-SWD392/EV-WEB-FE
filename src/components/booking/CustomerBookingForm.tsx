"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { bookingService } from "@/services/bookingService";
import { staffDirectoryService } from "@/services/staffDirectoryService";
import { serviceCatalogService } from "@/services/serviceCatalogService";
import type { Center } from "@/entities/slot.types";
import type { ServiceCatalogOption } from "@/entities/service.types";
import type { CreateBookingRequest } from "@/entities/booking.types";

type CustomerBookingFormValues = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  vehicleType: string;
  vehicleBrand: string;
  vehicleModel?: string;
  vehicleVin?: string;
  serviceCenterId: string;
  serviceTypeId: string;
  preferredTime: string;
  description?: string;
};

interface CustomerBookingFormProps {
  redirectTo?: string | null;
  onSuccess?: (_bookingId: string) => void;
}

export function CustomerBookingForm({
  redirectTo = "/member/appointments",
  onSuccess,
}: CustomerBookingFormProps) {
  const router = useRouter();
  const [centers, setCenters] = React.useState<Center[]>([]);
  const [serviceTypes, setServiceTypes] = React.useState<ServiceCatalogOption[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CustomerBookingFormValues>({
    defaultValues: {
      vehicleType: "Ô tô điện",
      serviceCenterId: "",
      serviceTypeId: "",
      preferredTime: "",
    },
  });

  React.useEffect(() => {
    register("serviceCenterId", { required: "Vui lòng chọn trung tâm" });
    register("serviceTypeId", { required: "Vui lòng chọn loại dịch vụ" });
  }, [register]);

  const selectedCenterId = watch("serviceCenterId");
  const selectedServiceTypeId = watch("serviceTypeId");

  React.useEffect(() => {
    async function bootstrap() {
      try {
        const [centerOptions, serviceOptions] = await Promise.all([
          staffDirectoryService.getCenters(),
          serviceCatalogService.getServiceTypes(),
        ]);
        setCenters(centerOptions);
        setServiceTypes(serviceOptions);
        if (centerOptions.length === 1) {
          setValue("serviceCenterId", centerOptions[0].id);
        }
        if (serviceOptions.length === 1) {
          setValue("serviceTypeId", serviceOptions[0].id);
        }
      } catch (error) {
        console.error("Failed to load booking metadata", error);
        toast.error("Không thể tải danh sách trung tâm / dịch vụ");
      }
    }

    bootstrap();
  }, [setValue]);

  const onSubmit = handleSubmit(async (formValues) => {
    setIsLoading(true);
    try {
      const payload: CreateBookingRequest = {
        customerName: formValues.customerName.trim(),
        customerEmail: formValues.customerEmail.trim(),
        customerPhone: formValues.customerPhone.trim(),
        vehicleType: formValues.vehicleType.trim(),
        vehicleBrand: formValues.vehicleBrand.trim(),
        vehicleModel: formValues.vehicleModel?.trim() || "",
        vehicleVin: formValues.vehicleVin?.trim(),
        serviceCenterId: formValues.serviceCenterId,
        serviceTypeId: formValues.serviceTypeId,
        preferredTime: new Date(formValues.preferredTime).toISOString(),
        scheduledDate: new Date(formValues.preferredTime).toISOString(),
        description: formValues.description?.trim(),
      };

      const booking = await bookingService.createBooking(payload);
      toast.success("Đã tiếp nhận lịch hẹn", {
        description: "Chúng tôi sẽ liên hệ để xác nhận trong thời gian sớm nhất.",
      });
      onSuccess?.(booking.id);
      if (redirectTo) {
        router.push(redirectTo);
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error("create booking failed", error);
      toast.error("Không thể tạo lịch hẹn. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  });

  return (
    <Card className="max-w-2xl border border-border/70 shadow-lg">
      <CardHeader>
        <CardTitle>Đặt lịch dịch vụ EV</CardTitle>
        <CardDescription>
          Chọn trung tâm dịch vụ, loại dịch vụ và thời gian mong muốn. Chúng tôi sẽ xác nhận lại với bạn
          qua điện thoại hoặc email.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="customer-booking-form" onSubmit={onSubmit} className="space-y-6">
          <section className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="customerName">Họ và tên</Label>
              <Input
                id="customerName"
                placeholder="Nguyễn Văn A"
                {...register("customerName", { required: "Vui lòng nhập họ tên" })}
              />
              {errors.customerName && (
                <p className="text-xs text-red-500">{errors.customerName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerPhone">Số điện thoại</Label>
              <Input
                id="customerPhone"
                placeholder="0901 234 567"
                {...register("customerPhone", { required: "Vui lòng nhập số điện thoại" })}
              />
              {errors.customerPhone && (
                <p className="text-xs text-red-500">{errors.customerPhone.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerEmail">Email</Label>
              <Input
                id="customerEmail"
                type="email"
                placeholder="khachhang@email.com"
                {...register("customerEmail", {
                  required: "Vui lòng nhập email",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Email không hợp lệ",
                  },
                })}
              />
              {errors.customerEmail && (
                <p className="text-xs text-red-500">{errors.customerEmail.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicleType">Loại xe</Label>
              <Input
                id="vehicleType"
                placeholder="Ô tô điện, xe máy điện..."
                {...register("vehicleType", { required: "Vui lòng nhập loại xe" })}
              />
              {errors.vehicleType && (
                <p className="text-xs text-red-500">{errors.vehicleType.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicleBrand">Hãng xe</Label>
              <Input
                id="vehicleBrand"
                placeholder="VinFast, Tesla..."
                {...register("vehicleBrand", { required: "Vui lòng nhập hãng xe" })}
              />
              {errors.vehicleBrand && (
                <p className="text-xs text-red-500">{errors.vehicleBrand.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicleModel">Dòng xe (không bắt buộc)</Label>
              <Input id="vehicleModel" placeholder="VF8, Model 3..." {...register("vehicleModel")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicleVin">VIN (không bắt buộc)</Label>
              <Input id="vehicleVin" placeholder="VD: LCSVFE15..." {...register("vehicleVin")} />
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Trung tâm dịch vụ</Label>
              <Select
                value={selectedCenterId}
                onValueChange={(value) => setValue("serviceCenterId", value, { shouldValidate: true })}
              >
                <SelectTrigger id="serviceCenter">
                  <SelectValue placeholder="Chọn trung tâm" />
                </SelectTrigger>
                <SelectContent>
                  {centers.map((center) => (
                    <SelectItem key={center.id} value={center.id}>
                      {center.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.serviceCenterId && (
                <p className="text-xs text-red-500">
                  {errors.serviceCenterId.message as string}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Loại dịch vụ</Label>
              <Select
                value={selectedServiceTypeId}
                onValueChange={(value) => setValue("serviceTypeId", value, { shouldValidate: true })}
              >
                <SelectTrigger id="serviceType">
                  <SelectValue placeholder="Chọn loại dịch vụ" />
                </SelectTrigger>
                <SelectContent>
                  {serviceTypes.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.serviceTypeId && (
                <p className="text-xs text-red-500">
                  {errors.serviceTypeId.message as string}
                </p>
              )}
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="preferredTime">Thời gian mong muốn</Label>
              <Input
                id="preferredTime"
                type="datetime-local"
                {...register("preferredTime", { required: "Vui lòng chọn thời gian mong muốn" })}
              />
              {errors.preferredTime && (
                <p className="text-xs text-red-500">{errors.preferredTime.message}</p>
              )}
            </div>
          </section>

          <section className="space-y-2">
            <Label htmlFor="description">Ghi chú cho kỹ thuật viên</Label>
            <Textarea
              id="description"
              rows={4}
              placeholder="Mô tả vấn đề gặp phải, yêu cầu đặc biệt..."
              {...register("description")}
            />
          </section>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-3 sm:flex-row">
        <Button
          type="submit"
          form="customer-booking-form"
          className="w-full sm:w-auto"
          disabled={isLoading}
        >
          {isLoading ? "Đang gửi..." : "Gửi yêu cầu đặt lịch"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto"
          disabled={isLoading}
          onClick={() => router.back()}
        >
          Hủy
        </Button>
      </CardFooter>
    </Card>
  );
}
