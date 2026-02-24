'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BlogApiRequest } from '@/api-request/blog';
import type { BlogPost, BlogPostDetail } from '@/types/blog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Calendar,
  Eye,
  MessageCircle,
  ArrowLeft,
  Share2,
  BookOpen,
  Tag,
} from 'lucide-react';

interface BlogDetailContentProps {
  slug: string;
}

export function BlogDetailContent({ slug }: BlogDetailContentProps) {
  const [post, setPost] = useState<BlogPostDetail | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    let mounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch post detail
        const postRes = await BlogApiRequest.getBlogBySlug(slug);
        if (!mounted) return;

        if (postRes && postRes.payload.success) {
          const postData = postRes.payload.data as BlogPostDetail;
          setPost(postData);

          // Fetch related posts using post ID
          if (postData._id) {
            try {
              const relatedRes = await BlogApiRequest.getRelatedPosts(postData._id, 4);
              if (mounted && relatedRes && relatedRes.payload.success) {
                setRelatedPosts((relatedRes.payload.data as BlogPost[]) ?? []);
              }
            } catch {
              // Related posts are optional
              if (mounted) setRelatedPosts([]);
            }
          }
        } else {
          setPost(null);
        }
      } catch (err) {
        if (!mounted) return;
        console.error('Failed to fetch blog post:', err);
        setPost(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      mounted = false;
    };
  }, [slug]);

  // Format date
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatShortDate = (dateStr?: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Skeleton className="h-6 w-32 mb-6" />
        <Skeleton className="h-10 w-3/4 mb-4" />
        <div className="flex gap-4 mb-6">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="w-full aspect-[16/9] rounded-lg mb-8" />
        <div className="space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // Not found
  if (!post) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Bài viết không tồn tại</h1>
        <p className="text-muted-foreground mb-6">
          Bài viết bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
        </p>
        <Button asChild>
          <Link href="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại Blog
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <article className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            Trang chủ
          </Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-foreground transition-colors">
            Blog
          </Link>
          {post.category && (
            <>
              <span>/</span>
              <Link
                href={`/blog?category=${post.category.slug}`}
                className="hover:text-foreground transition-colors"
              >
                {post.category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-foreground line-clamp-1">{post.title}</span>
        </nav>

        {/* Header */}
        <header className="mb-8">
          {post.category && (
            <Link href={`/blog?category=${post.category.slug}`}>
              <Badge className="mb-3">{post.category.name}</Badge>
            </Link>
          )}

          <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">{post.title}</h1>

          {post.excerpt && (
            <p className="text-lg text-muted-foreground mb-4">{post.excerpt}</p>
          )}

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {/* Author */}
            {post.author && (
              <div className="flex items-center gap-2">
                {post.author.avatarUrl ? (
                  <Image
                    src={post.author.avatarUrl}
                    alt={`${post.author.firstName} ${post.author.lastName}`}
                    width={32}
                    height={32}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                    {post.author.firstName?.charAt(0)}
                  </div>
                )}
                <span className="font-medium text-foreground">
                  {post.author.firstName} {post.author.lastName}
                </span>
              </div>
            )}

            {post.publishedAt && (
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(post.publishedAt)}
              </span>
            )}

            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {post.viewCount ?? 0} lượt xem
            </span>

            {post.commentCount !== undefined && post.commentCount > 0 && (
              <span className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                {post.commentCount} bình luận
              </span>
            )}
          </div>
        </header>

        {/* Featured image */}
        {post.featuredImage && (
          <div className="relative aspect-[16/9] rounded-lg overflow-hidden mb-8">
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Content */}
        <div
          className="prose prose-lg max-w-none dark:prose-invert
            prose-headings:font-bold prose-headings:text-foreground
            prose-p:text-muted-foreground prose-p:leading-relaxed
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
            prose-img:rounded-lg prose-img:shadow-md
            prose-blockquote:border-l-primary prose-blockquote:bg-muted/30 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg
            mb-8"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="h-4 w-4 text-muted-foreground" />
              {post.tags.map((tag) => (
                <Link key={tag} href={`/blog?tag=${encodeURIComponent(tag)}`}>
                  <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                    {tag}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Related book */}
        {post.book && (
          <Card className="mb-8">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3 text-sm font-medium text-muted-foreground">
                <BookOpen className="h-4 w-4" />
                Sách liên quan
              </div>
              <Link
                href={`/book/${post.book.slug}`}
                className="flex items-center gap-4 group"
              >
                {post.book.thumbnailUrl && (
                  <div className="relative w-16 h-20 rounded overflow-hidden shrink-0">
                    <Image
                      src={post.book.thumbnailUrl}
                      alt={post.book.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div>
                  <h4 className="font-semibold group-hover:text-primary transition-colors">
                    {post.book.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">Xem chi tiết sách →</p>
                </div>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Share + Back */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="outline" asChild>
            <Link href="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại Blog
            </Link>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: post.title, url: window.location.href });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert('Đã sao chép liên kết!');
              }
            }}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>

        <Separator className="mb-8" />
      </article>

      {/* Related posts */}
      {relatedPosts.length > 0 && (
        <section className="max-w-6xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Bài viết liên quan</h2>
            <Button variant="link" asChild>
              <Link href="/blog">Xem tất cả</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedPosts.map((related) => (
              <Link key={related._id} href={`/blog/${related.slug}`} className="group">
                <Card className="overflow-hidden h-full transition-shadow hover:shadow-lg">
                  <div className="relative aspect-[16/9] bg-muted overflow-hidden">
                    {related.featuredImage ? (
                      <Image
                        src={related.featuredImage}
                        alt={related.title}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                        No image
                      </div>
                    )}
                  </div>
                  <CardContent className="p-3 space-y-2">
                    {related.category && (
                      <Badge variant="secondary" className="text-xs">
                        {related.category.name}
                      </Badge>
                    )}
                    <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                      {related.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {related.publishedAt && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatShortDate(related.publishedAt)}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {related.viewCount ?? 0}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
