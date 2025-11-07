/**
 * Zod validation schemas for Service Intake forms
 */

import { z } from "zod";

/**
 * Schema for creating a new intake from booking
 */
export const createIntakeSchema = z.object({
    bookingId: z
        .string()
        .uuid("Booking ID phải là UUID hợp lệ")
        .min(1, "Vui lòng chọn booking"),

    licensePlate: z
        .string()
        .optional()
        .refine(
            (val) => !val || /^[A-Z0-9-]{5,12}$/i.test(val),
            "Biển số xe không hợp lệ (5-12 ký tự, chỉ chữ, số và dấu gạch ngang)"
        ),

    odometer: z
        .number()
        .int("Số km phải là số nguyên")
        .min(0, "Số km không thể âm")
        .max(9999999, "Số km vượt quá giới hạn")
        .optional()
        .or(z.string().transform((val) => (val ? parseInt(val, 10) : undefined))),

    batterySoC: z
        .number()
        .int("Pin phải là số nguyên")
        .min(0, "Pin phải từ 0-100%")
        .max(100, "Pin phải từ 0-100%")
        .optional()
        .or(z.string().transform((val) => (val ? parseInt(val, 10) : undefined))),

    arrivalNotes: z
        .string()
        .max(1000, "Ghi chú không quá 1000 ký tự")
        .optional(),

    notes: z
        .string()
        .max(1000, "Ghi chú không quá 1000 ký tự")
        .optional(),
});

export type CreateIntakeFormData = z.infer<typeof createIntakeSchema>;

/**
 * Schema for updating an existing intake
 */
export const updateIntakeSchema = z.object({
    licensePlate: z
        .string()
        .optional()
        .refine(
            (val) => !val || /^[A-Z0-9-]{5,12}$/i.test(val),
            "Biển số xe không hợp lệ"
        ),

    odometer: z
        .number()
        .int()
        .min(0)
        .max(9999999)
        .optional()
        .or(z.string().transform((val) => (val ? parseInt(val, 10) : undefined))),

    batterySoC: z
        .number()
        .int()
        .min(0)
        .max(100)
        .optional()
        .or(z.string().transform((val) => (val ? parseInt(val, 10) : undefined))),

    arrivalNotes: z.string().max(1000).optional(),
    notes: z.string().max(1000).optional(),
});

export type UpdateIntakeFormData = z.infer<typeof updateIntakeSchema>;

/**
 * Schema for walk-in intake creation
 */
export const createWalkInIntakeSchema = z.object({
    customerName: z
        .string()
        .min(2, "Tên khách hàng phải có ít nhất 2 ký tự")
        .max(100, "Tên khách hàng quá dài"),

    customerPhone: z
        .string()
        .regex(/^(\+84|0)[0-9]{9,10}$/, "Số điện thoại không hợp lệ (VN format)"),

    customerEmail: z
        .string()
        .email("Email không hợp lệ")
        .optional()
        .or(z.literal("")),

    vehicleBrand: z.string().min(1, "Vui lòng nhập hãng xe"),
    vehicleModel: z.string().optional(),
    vehicleType: z.string().optional(),

    licensePlate: z
        .string()
        .regex(/^[A-Z0-9-]{5,12}$/i, "Biển số xe không hợp lệ"),

    odometer: z
        .number()
        .int()
        .min(0)
        .max(9999999)
        .optional()
        .or(z.string().transform((val) => (val ? parseInt(val, 10) : undefined))),

    batterySoC: z
        .number()
        .int()
        .min(0)
        .max(100)
        .optional()
        .or(z.string().transform((val) => (val ? parseInt(val, 10) : undefined))),

    arrivalNotes: z.string().max(1000).optional(),
    notes: z.string().max(1000).optional(),
});

export type CreateWalkInIntakeFormData = z.infer<typeof createWalkInIntakeSchema>;
