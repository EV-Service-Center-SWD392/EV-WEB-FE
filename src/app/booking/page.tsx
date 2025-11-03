import { Metadata } from "next";

import { CustomerBookingForm } from "@/components/booking/CustomerBookingForm";

export const metadata: Metadata = {
  title: "Đặt lịch dịch vụ EV",
};

export default function BookingPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-120px)] w-full max-w-5xl flex-col items-center justify-center px-4 py-10">
      <div className="w-full space-y-6 text-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-primary">
            Đặt lịch
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Hẹn lịch bảo dưỡng & sửa chữa xe điện
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Điền thông tin xe và chọn trung tâm, chúng tôi sẽ xác nhận lịch hẹn sớm nhất có thể.
          </p>
        </div>
        <CustomerBookingForm />
      </div>
    </main>
  );
}
