import { Card, CardContent } from "@/components/ui/card";
import {
  BookOpen,
  Users,
  Award,
  Heart,
  TrendingUp,
  Shield,
} from "lucide-react";

export function AboutContent() {
  return (
    <div className="container py-12 max-w-7xl">
      {/* Hero Section */}
      <div className="text-center mb-20">
        <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
          <BookOpen className="h-4 w-4 mr-2" />
          Since 2015
        </div>
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
          Về chúng tôi
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          BookStore - Nơi kết nối tri thức và niềm đam mê đọc sách. Chúng tôi
          tin rằng mỗi cuốn sách là một hành trình khám phá bản thân và thế giới
          xung quanh.
        </p>
      </div>

      {/* Story Section */}
      <div className="mb-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-2">
              Our Journey
            </div>
            <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Câu chuyện của chúng tôi
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed text-base">
              <p>
                Được thành lập từ năm 2015, BookStore bắt đầu từ một cửa hàng
                nhỏ với niềm đam mê chia sẻ tri thức qua sách. Từ những ngày
                đầu, chúng tôi đã cam kết mang đến cho độc giả những cuốn sách
                chất lượng với giá cả hợp lý.
              </p>
              <p>
                Qua hơn 8 năm hoạt động, chúng tôi đã phát triển thành một trong
                những nhà sách trực tuyến uy tín tại Việt Nam với hàng triệu
                khách hàng tin tưởng. Bộ sưu tập của chúng tôi bao gồm hơn
                100,000 đầu sách thuộc mọi thể loại.
              </p>
              <p>
                Sứ mệnh của chúng tôi không chỉ là bán sách, mà là xây dựng một
                cộng đồng yêu sách, nơi mọi người có thể khám phá, chia sẻ và
                phát triển cùng nhau qua văn hóa đọc.
              </p>
            </div>
          </div>
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-primary/50 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
            <div className="relative bg-background rounded-2xl overflow-hidden shadow-xl">
              <img
                src="/bookstore-interior-with-shelves.jpg"
                alt="BookStore interior"
                className="rounded-xl w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
        <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <CardContent className="pt-8 pb-6 text-center relative">
            <div className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2">
              100K+
            </div>
            <div className="text-sm font-medium text-muted-foreground">
              Đầu sách
            </div>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <CardContent className="pt-8 pb-6 text-center relative">
            <div className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2">
              500K+
            </div>
            <div className="text-sm font-medium text-muted-foreground">
              Khách hàng
            </div>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <CardContent className="pt-8 pb-6 text-center relative">
            <div className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2">
              2M+
            </div>
            <div className="text-sm font-medium text-muted-foreground">
              Đơn hàng
            </div>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <CardContent className="pt-8 pb-6 text-center relative">
            <div className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2">
              4.8/5
            </div>
            <div className="text-sm font-medium text-muted-foreground">
              Đánh giá
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Values Section */}
      <div className="mb-20">
        <div className="text-center mb-12">
          <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
            What We Stand For
          </div>
          <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Giá trị cốt lõi
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="text-center group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-primary/30">
            <CardContent className="pt-8 pb-6">
              <div className="flex justify-center mb-6">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 group-hover:from-primary/30 group-hover:to-primary/10 transition-all duration-300 group-hover:scale-110">
                  <BookOpen className="h-10 w-10 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3">Chất lượng</h3>
              <p className="text-muted-foreground">
                Mỗi cuốn sách được chọn lọc kỹ lưỡng để đảm bảo giá trị nội dung
                và chất lượng in ấn tốt nhất.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-primary/30">
            <CardContent className="pt-8 pb-6">
              <div className="flex justify-center mb-6">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 group-hover:from-primary/30 group-hover:to-primary/10 transition-all duration-300 group-hover:scale-110">
                  <Heart className="h-10 w-10 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3">Tận tâm</h3>
              <p className="text-muted-foreground">
                Đội ngũ tư vấn nhiệt tình, sẵn sàng hỗ trợ bạn tìm được cuốn
                sách phù hợp với nhu cầu và sở thích.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-primary/30">
            <CardContent className="pt-8 pb-6">
              <div className="flex justify-center mb-6">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 group-hover:from-primary/30 group-hover:to-primary/10 transition-all duration-300 group-hover:scale-110">
                  <Shield className="h-10 w-10 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3">Uy tín</h3>
              <p className="text-muted-foreground">
                Cam kết sách chính hãng 100%, chính sách đổi trả linh hoạt và
                bảo vệ quyền lợi khách hàng tối đa.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-primary/30">
            <CardContent className="pt-8 pb-6">
              <div className="flex justify-center mb-6">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 group-hover:from-primary/30 group-hover:to-primary/10 transition-all duration-300 group-hover:scale-110">
                  <Users className="h-10 w-10 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3">Cộng đồng</h3>
              <p className="text-muted-foreground">
                Xây dựng cộng đồng yêu sách, nơi mọi người kết nối, chia sẻ và
                cùng nhau phát triển.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-primary/30">
            <CardContent className="pt-8 pb-6">
              <div className="flex justify-center mb-6">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 group-hover:from-primary/30 group-hover:to-primary/10 transition-all duration-300 group-hover:scale-110">
                  <TrendingUp className="h-10 w-10 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3">Đổi mới</h3>
              <p className="text-muted-foreground">
                Không ngừng cải tiến trải nghiệm mua sắm, từ website đến dịch vụ
                giao hàng và chăm sóc khách hàng.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-primary/30">
            <CardContent className="pt-8 pb-6">
              <div className="flex justify-center mb-6">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 group-hover:from-primary/30 group-hover:to-primary/10 transition-all duration-300 group-hover:scale-110">
                  <Award className="h-10 w-10 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3">Xuất sắc</h3>
              <p className="text-muted-foreground">
                Phấn đấu trở thành nhà sách hàng đầu Việt Nam với dịch vụ và
                trải nghiệm khách hàng xuất sắc.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Team Section */}
      <div className="mb-20">
        <div className="text-center mb-12">
          <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
            Meet The Team
          </div>
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Đội ngũ của chúng tôi
          </h2>
          <p className="text-center text-muted-foreground max-w-2xl mx-auto text-lg">
            Chúng tôi là một đội ngũ đam mê sách, với nhiều năm kinh nghiệm
            trong ngành xuất bản và phân phối sách.
          </p>
        </div>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            {
              name: "Nguyễn Văn A",
              role: "CEO & Founder",
              image: "portrait businessman",
            },
            {
              name: "Trần Thị B",
              role: "Giám đốc Vận hành",
              image: "portrait businesswoman",
            },
            {
              name: "Lê Văn C",
              role: "Giám đốc Marketing",
              image: "portrait businessman casual",
            },
            {
              name: "Phạm Thị D",
              role: "Trưởng phòng CSKH",
              image: "portrait businesswoman smiling",
            },
          ].map((member, i) => (
            <Card
              key={i}
              className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-primary/30"
            >
              <CardContent className="pt-8 pb-6 text-center">
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/50 rounded-full blur opacity-25 group-hover:opacity-50 transition-opacity"></div>
                  <img
                    src={`/.jpg?height=200&width=200&query=${member.image}`}
                    alt={member.name}
                    className="relative rounded-full w-32 h-32 object-cover border-4 border-background shadow-xl group-hover:scale-105 transition-transform"
                  />
                </div>
                <h3 className="font-bold text-lg mb-2">{member.name}</h3>
                <p className="text-sm text-primary font-medium">
                  {member.role}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Location & Contact Section */}
      <div>
        <div className="text-center mb-12">
          <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
            Get In Touch
          </div>
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Visit Us
          </h2>
          <p className="text-center text-muted-foreground max-w-2xl mx-auto text-lg">
            Come visit our physical stores or reach out to us. We're here to
            help you find your next great read!
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/30">
            <CardContent className="pt-8 pb-6">
              <h3 className="font-semibold mb-3 text-lg">Main Store</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>123 Book Street, District 1</p>
                <p>Ho Chi Minh City, Vietnam</p>
                <p className="pt-2">
                  <span className="font-medium text-foreground">Phone:</span>{" "}
                  (028) 1234 5678
                </p>
                <p>
                  <span className="font-medium text-foreground">Email:</span>{" "}
                  contact@bookstore.vn
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/30">
            <CardContent className="pt-8 pb-6">
              <h3 className="font-bold mb-4 text-xl">Branch Store</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>456 Reading Avenue, Hoan Kiem</p>
                <p>Hanoi, Vietnam</p>
                <p className="pt-2">
                  <span className="font-medium text-foreground">Phone:</span>{" "}
                  (024) 9876 5432
                </p>
                <p>
                  <span className="font-medium text-foreground">Email:</span>{" "}
                  hanoi@bookstore.vn
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/30">
            <CardContent className="pt-8 pb-6">
              <h3 className="font-bold mb-4 text-xl">Opening Hours</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  <span className="font-medium text-foreground">
                    Mon - Fri:
                  </span>{" "}
                  8:00 AM - 9:00 PM
                </p>
                <p>
                  <span className="font-medium text-foreground">Saturday:</span>{" "}
                  8:00 AM - 10:00 PM
                </p>
                <p>
                  <span className="font-medium text-foreground">Sunday:</span>{" "}
                  9:00 AM - 8:00 PM
                </p>
                <p className="pt-2">
                  <span className="font-medium text-foreground">Holidays:</span>{" "}
                  Special hours apply
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Map Container */}
        <Card className="overflow-hidden border-2 shadow-xl">
          <CardContent className="p-0">
            <div className="relative w-full h-[500px] bg-muted">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3929.053354256999!2d105.72985667532924!3d10.012451790093634!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31a0882139720a77%3A0x3916a227d0b95a64!2sFPT%20University!5e0!3m2!1svi!2s!4v1768151012650!5m2!1svi!2s"
                width="100%"
                height="500"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="FPT University Location"
                className="w-full h-full"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
