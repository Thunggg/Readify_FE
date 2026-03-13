import { z } from "zod";

// ===== MONGO ID =====
const mongoIdRegex = /^[a-f\d]{24}$/i;

// ===== CREATE BOOK API SCHEMA =====
export const createBookApiSchema = z.object({
  title: z
    .string()
    .min(1, "Tên sách không được để trống")
    .max(500, "Tên sách tối đa 500 ký tự"),

  slug: z
    .string()
    .max(200, "Slug tối đa 200 ký tự")
    .optional(),

  subtitle: z
    .string()
    .max(500, "Phụ đề tối đa 500 ký tự")
    .optional(),

  description: z.string().optional(),

  authors: z
    .array(z.string().regex(mongoIdRegex, "ID tác giả không hợp lệ"))
    .max(10, "Tối đa 10 tác giả")
    .optional(),

  language: z
    .enum(["vi", "en", "ja", "ko", "zh"], {
      errorMap: () => ({ message: "Ngôn ngữ không hợp lệ" }),
    })
    .optional(),

  publishDate: z.string().optional(),

  pageCount: z.coerce
    .number()
    .int("Số trang phải là số nguyên")
    .min(1, "Số trang phải ít nhất 1")
    .max(20000, "Số trang tối đa 20,000")
    .optional(),

  isbn: z
    .string()
    .regex(/^(?:\d{9}[\dX]|\d{13})$/, "ISBN phải là ISBN-10 hoặc ISBN-13")
    .optional(),

  publisherId: z
    .string()
    .min(1, "Nhà xuất bản là bắt buộc")
    .regex(mongoIdRegex, "ID nhà xuất bản không hợp lệ"),

  categoryIds: z
    .array(z.string().regex(mongoIdRegex, "ID danh mục không hợp lệ"))
    .min(1, "Phải chọn ít nhất 1 danh mục")
    .max(10, "Tối đa 10 danh mục"),

  basePrice: z.coerce
    .number()
    .min(0, "Giá phải lớn hơn hoặc bằng 0")
    .max(10000000000, "Giá tối đa 10 tỷ"),

  currency: z
    .enum(["VND", "USD", "CNY"], {
      errorMap: () => ({ message: "Loại tiền không hợp lệ" }),
    })
    .optional(),

  images: z
    .array(z.string().regex(mongoIdRegex, "ID hình ảnh không hợp lệ"))
    .max(20, "Tối đa 20 hình ảnh")
    .optional(),

  thumbnailUrl: z.string().optional(),

  tags: z
    .array(z.string())
    .max(20, "Tối đa 20 tag")
    .optional(),

  initialQuantity: z.coerce
    .number()
    .int("Số lượng phải là số nguyên")
    .min(0, "Số lượng không được âm")
    .max(100000, "Số lượng tối đa 100,000")
    .optional(),

  stockLocation: z.string().optional(),
});

export type CreateBookApiInput = z.infer<typeof createBookApiSchema>;

// ===== UPDATE BOOK API SCHEMA =====
export const updateBookApiSchema = z.object({
  title: z
    .string()
    .min(1, "Tên sách không được để trống")
    .max(500, "Tên sách tối đa 500 ký tự")
    .optional(),

  slug: z
    .string()
    .max(200, "Slug tối đa 200 ký tự")
    .optional(),

  subtitle: z
    .string()
    .max(500, "Phụ đề tối đa 500 ký tự")
    .optional(),

  description: z.string().optional(),

  authors: z
    .array(z.string().regex(mongoIdRegex, "ID tác giả không hợp lệ"))
    .max(10, "Tối đa 10 tác giả")
    .optional(),

  language: z
    .enum(["vi", "en", "ja", "ko", "zh"], {
      errorMap: () => ({ message: "Ngôn ngữ không hợp lệ" }),
    })
    .optional(),

  publishDate: z.string().optional(),

  pageCount: z.coerce
    .number()
    .int("Số trang phải là số nguyên")
    .min(1, "Số trang phải ít nhất 1")
    .max(20000, "Số trang tối đa 20,000")
    .optional(),

  isbn: z
    .string()
    .regex(/^(?:\d{9}[\dX]|\d{13})$/, "ISBN phải là ISBN-10 hoặc ISBN-13")
    .optional(),

  publisherId: z
    .string()
    .regex(mongoIdRegex, "ID nhà xuất bản không hợp lệ")
    .optional(),

  categoryIds: z
    .array(z.string().regex(mongoIdRegex, "ID danh mục không hợp lệ"))
    .min(1, "Phải chọn ít nhất 1 danh mục")
    .max(10, "Tối đa 10 danh mục")
    .optional(),

  basePrice: z.coerce
    .number()
    .min(0, "Giá phải lớn hơn hoặc bằng 0")
    .max(10000000000, "Giá tối đa 10 tỷ")
    .optional(),

  currency: z
    .enum(["VND", "USD", "CNY"], {
      errorMap: () => ({ message: "Loại tiền không hợp lệ" }),
    })
    .optional(),

  addImages: z
    .array(z.string().regex(mongoIdRegex, "ID hình ảnh không hợp lệ"))
    .max(20, "Tối đa 20 hình ảnh")
    .optional(),

  removeImages: z
    .array(z.string().regex(mongoIdRegex, "ID hình ảnh không hợp lệ"))
    .max(20, "Tối đa 20 hình ảnh")
    .optional(),

  thumbnailUrl: z.string().optional(),

  status: z.coerce.number().int().optional(),

  tags: z
    .array(z.string())
    .max(20, "Tối đa 20 tag")
    .optional(),
});

export type UpdateBookApiInput = z.infer<typeof updateBookApiSchema>;

// ===== CREATE BOOK FORM SCHEMA (for UI validation) =====
export const createBookFormSchema = z.object({
  title: z
    .string()
    .min(1, "Tên sách không được để trống")
    .max(500, "Tên sách tối đa 500 ký tự"),
  subtitle: z
    .string()
    .max(500, "Phụ đề tối đa 500 ký tự")
    .optional(),
  description: z.string().optional(),
  isbn: z
    .string()
    .regex(/^(?:\d{9}[\dX]|\d{13})$/, "ISBN phải là ISBN-10 hoặc ISBN-13")
    .optional(),
  publisherId: z.string().min(1, "Nhà xuất bản là bắt buộc"),
  categoryIds: z
    .array(z.string())
    .min(1, "Phải chọn ít nhất 1 danh mục")
    .max(10, "Tối đa 10 danh mục"),
  basePrice: z.coerce
    .number()
    .min(0, "Giá phải lớn hơn hoặc bằng 0")
    .max(10000000000, "Giá tối đa 10 tỷ"),
  currency: z.string().optional(),
  language: z.string().optional(),
  publishDate: z.string().optional(),
  pageCount: z.coerce
    .number()
    .int("Số trang phải là số nguyên")
    .min(0, "Số trang không được âm")
    .max(20000, "Số trang tối đa 20,000")
    .optional(),
  tags: z.string().optional(), // comma-separated, will be split
  initialQuantity: z.coerce
    .number()
    .int("Số lượng phải là số nguyên")
    .min(0, "Số lượng không được âm")
    .max(100000, "Số lượng tối đa 100,000")
    .optional(),
  stockLocation: z.string().optional(),
});

export type CreateBookFormInput = z.infer<typeof createBookFormSchema>;

// ===== UPDATE BOOK FORM SCHEMA =====
// Same validation rules as create, but all fields optional.
// When a field IS provided, it must pass the same checks.
export const updateBookFormSchema = z.object({
  title: z
    .string()
    .min(1, "Tên sách không được để trống")
    .max(500, "Tên sách tối đa 500 ký tự"),
  subtitle: z
    .string()
    .max(500, "Phụ đề tối đa 500 ký tự")
    .optional(),
  description: z.string().optional(),
  isbn: z
    .string()
    .regex(/^(?:\d{9}[\dX]|\d{13})$/, "ISBN phải là ISBN-10 hoặc ISBN-13")
    .optional(),
  publisherId: z.string().min(1, "Nhà xuất bản là bắt buộc"),
  categoryIds: z
    .array(z.string())
    .min(1, "Phải chọn ít nhất 1 danh mục")
    .max(10, "Tối đa 10 danh mục"),
  basePrice: z.coerce
    .number()
    .min(0, "Giá phải lớn hơn hoặc bằng 0")
    .max(10000000000, "Giá tối đa 10 tỷ"),
  currency: z.string().optional(),
  language: z.string().optional(),
  publishDate: z.string().optional(),
  pageCount: z.coerce
    .number()
    .int("Số trang phải là số nguyên")
    .min(0, "Số trang không được âm")
    .max(20000, "Số trang tối đa 20,000")
    .optional(),
  tags: z.string().optional(),
  thumbnailUrl: z.string().optional(),
});

export type UpdateBookFormInput = z.infer<typeof updateBookFormSchema>;
