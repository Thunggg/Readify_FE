import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Users, Award, Heart, TrendingUp, Shield } from "lucide-react"

export function AboutContent() {
  return (
    <div className="container py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">Về chúng tôi</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          BookStore - Nơi kết nối tri thức và niềm đam mê đọc sách. Chúng tôi tin rằng mỗi cuốn sách là một hành trình
          khám phá bản thân và thế giới xung quanh.
        </p>
      </div>

      {/* Story Section */}
      <div className="mb-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-4">Câu chuyện của chúng tôi</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Được thành lập từ năm 2015, BookStore bắt đầu từ một cửa hàng nhỏ với niềm đam mê chia sẻ tri thức qua
                sách. Từ những ngày đầu, chúng tôi đã cam kết mang đến cho độc giả những cuốn sách chất lượng với giá cả
                hợp lý.
              </p>
              <p>
                Qua hơn 8 năm hoạt động, chúng tôi đã phát triển thành một trong những nhà sách trực tuyến uy tín tại
                Việt Nam với hàng triệu khách hàng tin tưởng. Bộ sưu tập của chúng tôi bao gồm hơn 100,000 đầu sách
                thuộc mọi thể loại.
              </p>
              <p>
                Sứ mệnh của chúng tôi không chỉ là bán sách, mà là xây dựng một cộng đồng yêu sách, nơi mọi người có thể
                khám phá, chia sẻ và phát triển cùng nhau qua văn hóa đọc.
              </p>
            </div>
          </div>
          <div className="relative">
            <img src="/bookstore-interior-with-shelves.jpg" alt="BookStore interior" className="rounded-lg shadow-lg" />
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-4xl font-bold text-primary mb-2">100K+</div>
            <div className="text-sm text-muted-foreground">Đầu sách</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-4xl font-bold text-primary mb-2">500K+</div>
            <div className="text-sm text-muted-foreground">Khách hàng</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-4xl font-bold text-primary mb-2">2M+</div>
            <div className="text-sm text-muted-foreground">Đơn hàng</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-4xl font-bold text-primary mb-2">4.8/5</div>
            <div className="text-sm text-muted-foreground">Đánh giá</div>
          </CardContent>
        </Card>
      </div>

      {/* Values Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">Giá trị cốt lõi</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Chất lượng</h3>
              <p className="text-muted-foreground">
                Mỗi cuốn sách được chọn lọc kỹ lưỡng để đảm bảo giá trị nội dung và chất lượng in ấn tốt nhất.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Tận tâm</h3>
              <p className="text-muted-foreground">
                Đội ngũ tư vấn nhiệt tình, sẵn sàng hỗ trợ bạn tìm được cuốn sách phù hợp với nhu cầu và sở thích.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Uy tín</h3>
              <p className="text-muted-foreground">
                Cam kết sách chính hãng 100%, chính sách đổi trả linh hoạt và bảo vệ quyền lợi khách hàng tối đa.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Cộng đồng</h3>
              <p className="text-muted-foreground">
                Xây dựng cộng đồng yêu sách, nơi mọi người kết nối, chia sẻ và cùng nhau phát triển.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Đổi mới</h3>
              <p className="text-muted-foreground">
                Không ngừng cải tiến trải nghiệm mua sắm, từ website đến dịch vụ giao hàng và chăm sóc khách hàng.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Award className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Xuất sắc</h3>
              <p className="text-muted-foreground">
                Phấn đấu trở thành nhà sách hàng đầu Việt Nam với dịch vụ và trải nghiệm khách hàng xuất sắc.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Team Section */}
      <div>
        <h2 className="text-3xl font-bold text-center mb-4">Đội ngũ của chúng tôi</h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Chúng tôi là một đội ngũ đam mê sách, với nhiều năm kinh nghiệm trong ngành xuất bản và phân phối sách.
        </p>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { name: "Nguyễn Văn A", role: "CEO & Founder", image: "portrait businessman" },
            { name: "Trần Thị B", role: "Giám đốc Vận hành", image: "portrait businesswoman" },
            { name: "Lê Văn C", role: "Giám đốc Marketing", image: "portrait businessman casual" },
            { name: "Phạm Thị D", role: "Trưởng phòng CSKH", image: "portrait businesswoman smiling" },
          ].map((member, i) => (
            <Card key={i}>
              <CardContent className="pt-6 text-center">
                <img
                  src={`/.jpg?height=200&width=200&query=${member.image}`}
                  alt={member.name}
                  className="rounded-full w-32 h-32 mx-auto mb-4 object-cover"
                />
                <h3 className="font-semibold mb-1">{member.name}</h3>
                <p className="text-sm text-muted-foreground">{member.role}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
