export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {/* ✅ KHÔNG có navbar/footer - Tập trung vào form đăng nhập/đăng ký */}
      {children}
    </div>
  );
}
