"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { register as registerApi } from "@/services/auth";

const schema = z
  .object({
    firstName: z.string().min(1, "Tên phải có ít nhất 1 ký tự"),
    lastName: z.string().min(1, "Họ phải có ít nhất 1 ký tự"),
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirmPassword: z
      .string()
      .min(6, "Xác nhận mật khẩu phải có ít nhất 6 ký tự"),
    phoneNumber: z.string().min(10, "Số điện thoại phải có ít nhất 10 số"),
    address: z.string().min(5, "Địa chỉ phải có ít nhất 5 ký tự"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
  });
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setMsg("");
    try {
      await registerApi({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        phoneNumber: data.phoneNumber,
        address: data.address,
      });
      const successMessage = "Đăng ký thành công — chuyển tới đăng nhập…";
      setMsg(successMessage);
      toast.success("Đăng ký tài khoản thành công!");
      setTimeout(() => router.push("/login"), 800);
    } catch (e: unknown) {
      const error = e as { response?: { data?: { message?: string } } };
      const errorMessage = error?.response?.data?.message || "Đăng ký thất bại";
      setMsg(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center px-4 py-4">
      <Card className="max-w-4xl w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
          <CardTitle className="text-2xl">Tạo tài khoản</CardTitle>
          <CardDescription>
            Tham gia EV Service Center ngay hôm nay
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Row 1: First Name & Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name Field */}
              <div className="space-y-2">
                <Label htmlFor="firstName">Tên</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Văn A"
                  {...register("firstName")}
                />
                {errors.firstName && (
                  <p className="text-sm text-destructive">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              {/* Last Name Field */}
              <div className="space-y-2">
                <Label htmlFor="lastName">Họ</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Nguyễn"
                  {...register("lastName")}
                />
                {errors.lastName && (
                  <p className="text-sm text-destructive">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            {/* Row 2: Email & Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Phone Number Field */}
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Số điện thoại</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="0123456789"
                  {...register("phoneNumber")}
                />
                {errors.phoneNumber && (
                  <p className="text-sm text-destructive">
                    {errors.phoneNumber.message}
                  </p>
                )}
              </div>
            </div>

            {/* Row 3: Address (Full Width) */}
            <div className="space-y-2">
              <Label htmlFor="address">Địa chỉ</Label>
              <Input
                id="address"
                type="text"
                placeholder="123 Đường ABC, Quận XYZ, TP HCM"
                {...register("address")}
              />
              {errors.address && (
                <p className="text-sm text-destructive">
                  {errors.address.message}
                </p>
              )}
            </div>

            {/* Row 4: Password & Confirm Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="pr-10"
                    placeholder="••••••••"
                    {...register("password")}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    className="pr-10"
                    placeholder="••••••••"
                    {...register("confirmPassword")}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            {/* Success/Error Message */}
            {msg && (
              <div
                className={`rounded-lg p-4 ${
                  msg.includes("thành công")
                    ? "bg-green-50 border border-green-200"
                    : "bg-red-50 border border-red-200"
                }`}
              >
                <div className="flex items-start">
                  {msg.includes("thành công") ? (
                    <svg
                      className="w-5 h-5 text-green-500 mt-0.5 mr-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5 text-red-500 mt-0.5 mr-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  <div className="flex-1">
                    <p
                      className={`text-sm ${
                        msg.includes("thành công")
                          ? "text-green-700"
                          : "text-red-700"
                      }`}
                    >
                      {msg}
                    </p>
                    {!msg.includes("thành công") && (
                      <Button
                        type="button"
                        variant="link"
                        className="text-red-600 hover:text-red-700 p-0 h-auto text-sm"
                        onClick={() => setMsg("")}
                      >
                        Đóng
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
              size="lg"
            >
              {loading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
            </Button>
          </form>

          {/* Footer Links */}
          <div className="mt-8 text-center space-y-4">
            <p className="text-muted-foreground text-sm">
              Đã có tài khoản?{" "}
              <Link
                href="/login"
                className="text-primary hover:underline font-medium"
              >
                Đăng nhập ngay
              </Link>
            </p>
            <p className="text-muted-foreground text-xs">
              <Link href="/" className="hover:text-foreground hover:underline">
                ← Về trang chủ
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
