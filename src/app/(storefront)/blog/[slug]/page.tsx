import { BlogDetailContent } from './blog-detail-content';

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <BlogDetailContent slug={slug} />
      </main>
    </div>
  );
}
