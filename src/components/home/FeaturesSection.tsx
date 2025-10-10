import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function FeaturesSection() {
  const features = [
    {
      icon: "🤖",
      title: "Chẩn đoán AI",
      description:
        "Công nghệ AI tiên tiến giúp phát hiện sự cố nhanh chóng và chính xác",
    },
    {
      icon: "⚡",
      title: "Dịch vụ nhanh",
      description:
        "Quy trình tự động hóa tiết kiệm thời gian tối đa cho khách hàng",
    },
    {
      icon: "🔒",
      title: "An toàn & Tin cậy",
      description:
        "Hệ thống bảo mật cao cấp đảm bảo thông tin khách hàng được bảo vệ",
    },
    {
      icon: "📱",
      title: "Ứng dụng di động",
      description:
        "Theo dõi và quản lý dịch vụ mọi lúc mọi nơi trên điện thoại",
    },
  ];

  return (
    <section id="features" className="py-24 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Tại sao chọn chúng tôi?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Trải nghiệm dịch vụ xe điện chuyên nghiệp với công nghệ hiện đại
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="text-center hover:shadow-md transition-shadow"
            >
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">{feature.icon}</span>
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
