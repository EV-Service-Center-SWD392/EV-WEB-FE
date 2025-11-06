# 🚀 Hướng dẫn lấy Supabase Anon Key

## 📌 Thông tin project của bạn:

Từ connection string trong `appsettings.json`:
```
Server=aws-1-ap-southeast-1.pooler.supabase.com
Database=postgres
User Id=postgres.sxevedgnmakrccaqsdfq
```

→ **Project ID**: `sxevedgnmakrccaqsdfq`  
→ **Supabase URL**: `https://sxevedgnmakrccaqsdfq.supabase.co`

---

## 🔑 Cách lấy Anon Key (5 bước đơn giản):

### Bước 1: Đăng nhập Supabase
Truy cập: https://supabase.com/

### Bước 2: Vào Project Dashboard
Click vào link này (hoặc tìm project trong dashboard):
```
https://supabase.com/dashboard/project/sxevedgnmakrccaqsdfq
```

### Bước 3: Vào Settings → API
1. Click icon **⚙️ Settings** (menu bên trái)
2. Click **API**

### Bước 4: Copy Anon Key
Bạn sẽ thấy phần **"Project API keys"**:

```
┌──────────────────────────────────────┐
│ anon public                           │
│ eyJhbGciOiJIUzI1NiIsInR5cCI6Ikp...   │
│ [Copy] [Show/Hide]                    │
└──────────────────────────────────────┘
```

Click **Copy** để copy key.

### Bước 5: Paste vào .env.local
Mở file `.env.local` và thay thế:

```bash
# TRƯỚC
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE

# SAU
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4ZXZlZGdubWFrcmNjYXFzZGZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzEyMDE2MDAsImV4cCI6MTk4Njc3NzYwMH0...
```

---

## ✅ Kiểm tra config đã đúng chưa:

Sau khi config xong, restart server:

```bash
npm run dev
```

Mở browser console (F12) và check:
- ✅ Không có lỗi "SUPABASE_ANON_KEY chưa được config"
- ✅ Page Booking Assignment load được data khi click "Direct DB"

---

## 🎯 File .env.local hoàn chỉnh:

```bash
# Backend API
NEXT_PUBLIC_API_BASE_URL=https://evscmmsbe-production.up.railway.app/api

# Supabase (đã điền sẵn URL, chỉ cần thêm anon key)
NEXT_PUBLIC_SUPABASE_URL=https://sxevedgnmakrccaqsdfq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE_FROM_DASHBOARD
```

---

## ⚠️ Lưu ý:

1. **Anon key là PUBLIC** - không sao nếu commit lên git (vì có Row Level Security)
2. **Service Role key KHÔNG được expose** - chỉ dùng trong backend
3. **Connection string trong appsettings.json** là cho backend .NET, không dùng ở frontend

---

## 🐛 Troubleshooting:

### Lỗi: "Invalid API key"
→ Copy lại anon key từ dashboard, có thể bạn copy nhầm service role key

### Lỗi: "supabase is not defined"
→ Restart dev server: `Ctrl+C` rồi `npm run dev`

### Không thấy Settings trong dashboard
→ Kiểm tra bạn đã đăng nhập đúng account không (account có quyền truy cập project)

---

## 🎉 Done!

Sau khi config xong, bạn có thể:
1. Vào **Booking Assignment** page
2. Click nút **"Direct DB"**
3. Data sẽ load trực tiếp từ Supabase database! 🚀

---

**Link nhanh**: https://supabase.com/dashboard/project/sxevedgnmakrccaqsdfq/settings/api
