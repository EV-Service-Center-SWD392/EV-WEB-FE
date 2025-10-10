import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ServicesSection() {
  const services = [
    {
      icon: "⚡",
      title: "Bảo dưỡng xe điện",
      description: "Dịch vụ bảo dưỡng toàn diện với công cụ chẩn đoán hiện đại",
    },
    {
      icon: "🔋",
      title: "Kiểm tra pin",
      description:
        "Phân tích và tối ưu hóa pin để tối đa hóa hiệu suất xe điện",
    },
    {
      icon: "🌱",
      title: "Giải pháp xanh",
      description: "Thực hành bền vững với công nghệ thân thiện môi trường",
    },
    {
      icon: "📊",
      title: "Giám sát thông minh",
      description: "Theo dõi tình trạng xe theo thời gian thực với AI",
    },
  ];

  return (
    <section id="services" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Dịch vụ của chúng tôi
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Từ bảo dưỡng định kỳ đến chẩn đoán nâng cao, chúng tôi cung cấp mọi
            thứ xe điện của bạn cần
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <Card
              key={index}
              className="text-center hover:shadow-md transition-shadow"
            >
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">{service.icon}</span>
                </div>
                <CardTitle className="text-lg">{service.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {service.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button size="lg">Xem tất cả dịch vụ</Button>
        </div>
      </div>
    </section>
  );
}
