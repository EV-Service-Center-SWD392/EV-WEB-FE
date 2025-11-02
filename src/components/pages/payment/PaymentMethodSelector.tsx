"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export interface PaymentMethodSelectorProps {
  onSelectPaymentMethod?: (_methodId: number) => void;
  isProcessing?: boolean;
}

const PAYMENT_METHODS = [
  {
    id: 1,
    name: "Tiền mặt",
    image: "/dollarbills.svg",
    description: "Pay with cash",
  },
  {
    id: 2,
    name: "Thanh toán trực tuyến Payos",
    image: "/logo.svg",
    description: "Pay online securely",
  },
];

export default function PaymentMethodSelector({
  onSelectPaymentMethod,
  isProcessing = false,
}: PaymentMethodSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<number | null>(null);

  const handleSelectMethod = (methodId: number) => {
    setSelectedMethod(methodId);
  };

  const handleConfirm = () => {
    if (selectedMethod && onSelectPaymentMethod) {
      onSelectPaymentMethod(selectedMethod);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Chọn Phương Thức Thanh Toán</CardTitle>
        <CardDescription>Chọn cách bạn muốn thanh toán</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PAYMENT_METHODS.map((method) => (
            <button
              key={method.id}
              onClick={() => handleSelectMethod(method.id)}
              disabled={isProcessing}
              className={`relative p-4 border-2 rounded-lg transition-all duration-200 ${
                selectedMethod === method.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {selectedMethod === method.id && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
              )}

              <div className="space-y-3">
                <div
                  className="w-full h-24 relative flex items-center justify-center bg-gray-50 rounded-md transition-transform duration-200 ease-in-out 
               hover:scale-105"
                >
                  <Image
                    src={method.image}
                    alt={method.name}
                    width={100}
                    height={100}
                    className="object-contain"
                  />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-sm">{method.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {method.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {selectedMethod && (
          <div className="mt-6 flex gap-3">
            <Button
              variant="outline"
              onClick={handleConfirm}
              className="flex-1"
              disabled={isProcessing}
            >
              {isProcessing
                ? "Đang xử lý..."
                : `Tiếp tục với ${PAYMENT_METHODS.find((m) => m.id === selectedMethod)?.name}`}
            </Button>
            <Button
              variant="outline"
              onClick={() => setSelectedMethod(null)}
              className="flex-1"
              disabled={isProcessing}
            >
              Thay đổi
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
