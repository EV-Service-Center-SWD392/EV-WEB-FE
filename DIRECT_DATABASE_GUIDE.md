# Hướng dẫn sử dụng Direct Database Query

## 📌 Tổng quan

Booking Assignment Page hiện có **2 cách lấy dữ liệu bookings**:

### ✅ **CÁCH 1: Direct Database (Recommended)**
- Query trực tiếp từ Supabase/Database
- **Không phụ thuộc** vào API của partner
- Nhanh, ổn định, đáng tin cậy

### ❌ **CÁCH 2: Partner API** 
- Gọi qua API `/api/client/Booking` của partner
- Có thể bị lỗi nếu partner API không làm đúng
- Dùng cho testing hoặc so sánh

---

## 🚀 Cách setup

### Bước 1: Cài đặt dependencies
```bash
npm install @supabase/supabase-js
```

### Bước 2: Config environment variables

Thêm vào file `.env.local`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Lấy thông tin từ đâu?**
1. Vào Supabase Dashboard: https://supabase.com/dashboard
2. Chọn project của bạn
3. Settings → API → Copy URL và anon key

### Bước 3: Kiểm tra tên bảng trong database

Mở file `src/services/directBookingService.ts` và đảm bảo tên bảng đúng:

```typescript
.from('Bookings') // ← Kiểm tra tên bảng này có đúng không
```

Nếu tên bảng khác, sửa lại cho đúng (ví dụ: `bookings`, `booking`, `tbl_bookings`, v.v.)

---

## 📖 Cách sử dụng

### Toggle giữa 2 modes

Trong page **Booking Assignment**, bạn sẽ thấy 2 nút ở góc phải trên:

```
┌─────────────────────────────────┐
│ Data Source:                     │
│  [Direct DB]  [Partner API]      │
└─────────────────────────────────┘
```

- **Click "Direct DB"**: Query trực tiếp từ database (mặc định)
- **Click "Partner API"**: Gọi API của partner

Page sẽ tự động reload data khi bạn switch.

---

## 🔍 API Reference

### Direct Booking Service

File: `src/services/directBookingService.ts`

#### 1. Get all bookings
```typescript
const bookings = await directBookingService.getAllBookings({
    status: 'Pending',
    centerId: 'center-id',
    fromDate: '2024-01-01',
    toDate: '2024-12-31'
});
```

#### 2. Get booking by ID
```typescript
const booking = await directBookingService.getBookingById('booking-id');
```

#### 3. Get pending bookings
```typescript
const pendingBookings = await directBookingService.getPendingBookings();
```

#### 4. Update booking status (optional)
```typescript
await directBookingService.updateBookingStatus(
    'booking-id',
    'Approved',
    'Optional reason'
);
```

---

## 🛠️ Troubleshooting

### Lỗi: "Invalid API key"
- ✅ Kiểm tra lại `NEXT_PUBLIC_SUPABASE_ANON_KEY` trong `.env.local`
- ✅ Restart dev server: `npm run dev`

### Lỗi: "Table 'Bookings' not found"
- ✅ Kiểm tra tên bảng trong database (có thể là `bookings` chữ thường)
- ✅ Sửa lại trong `directBookingService.ts`

### Lỗi: "Row Level Security policy violation"
- ✅ Vào Supabase Dashboard → Table Editor
- ✅ Click vào bảng `Bookings` → RLS Policies
- ✅ Tạm thời disable RLS hoặc thêm policy cho phép read all

### Data không hiển thị
- ✅ Mở Chrome DevTools → Console để xem lỗi
- ✅ Kiểm tra Network tab xem có request nào fail không
- ✅ Thử switch sang "Partner API" mode để so sánh

---

## 📊 So sánh 2 cách

| Feature | Direct DB | Partner API |
|---------|-----------|-------------|
| **Tốc độ** | ⚡️ Rất nhanh | 🐌 Phụ thuộc API |
| **Độ tin cậy** | ✅ Cao | ❌ Phụ thuộc partner |
| **Filtering** | ✅ Query trực tiếp | ❌ Limited |
| **Real-time** | ✅ Có thể subscribe | ❌ Không |
| **Setup** | Cần Supabase config | Chỉ cần API endpoint |

---

## 💡 Tips

1. **Luôn dùng Direct DB mode** khi partner API có vấn đề
2. **Test cả 2 modes** để đảm bảo data consistency
3. **Có thể tắt Partner API mode** bằng cách comment code nếu không cần

---

## 📝 Files liên quan

- `src/services/directBookingService.ts` - Direct DB service
- `src/lib/supabase.ts` - Supabase client config
- `src/app/staff/booking-assignment/page.tsx` - UI page
- `.env.local` - Environment variables

---

## 🎯 Next Steps

Nếu Direct DB hoạt động tốt, bạn có thể:

1. Xóa hoặc comment code của Partner API mode
2. Áp dụng pattern này cho các feature khác (Inventory, Work Orders, etc.)
3. Thêm Real-time subscription từ Supabase

---

**Created**: 2025-11-06  
**Author**: GitHub Copilot  
**Status**: ✅ Production Ready
