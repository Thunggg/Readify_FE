import { CategoryContent } from "./category-content"

const categoryNames: Record<string, string> = {
  "van-hoc": "Văn học",
  "ky-nang-song": "Kỹ năng sống",
  "kinh-doanh": "Kinh doanh",
  "tam-ly": "Tâm lý",
  "lich-su": "Lịch sử",
  "kinh-te": "Kinh tế",
  "thieu-nhi": "Thiếu nhi",
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const categoryName = categoryNames[slug] ?? slug;
  return {
    title: `${categoryName} - BookStore`,
    description: `Khám phá các cuốn sách ${categoryName.toLowerCase()} hay nhất`,
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <CategoryContent slug={slug} categoryName={categoryNames[slug] ?? slug} />
  );
}
