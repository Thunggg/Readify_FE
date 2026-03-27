'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { BlogApiRequest } from '@/api-request/blog';
import { useCurrentUser } from '@/contexts/user-context';
import { handleErrorApi } from '@/lib/utils';
import type { BlogComment } from '@/types/blog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, Reply, Pencil, Trash2, Send } from 'lucide-react';

type BlogCommentsSectionProps = {
  postId: string;
};

function formatDate(date?: string) {
  if (!date) return '';
  return new Date(date).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function initialOf(name?: string) {
  return (name || '?').trim().charAt(0).toUpperCase() || '?';
}

export function BlogCommentsSection({ postId }: BlogCommentsSectionProps) {
  const { currentUser, loading: loadingUser } = useCurrentUser();

  const [comments, setComments] = useState<BlogComment[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submittingRoot, setSubmittingRoot] = useState(false);
  const [rootContent, setRootContent] = useState('');

  const [replyOpenId, setReplyOpenId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [replying, setReplying] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [editing, setEditing] = useState(false);

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await BlogApiRequest.getPostComments(postId, { page: 1, limit: 100 });
      if (res?.payload?.success) {
        const data = res.payload.data;
        setComments(data?.comments ?? []);
        setTotal(data?.total ?? 0);
      } else {
        setComments([]);
        setTotal(0);
      }
    } catch {
      setComments([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const canWrite = !!currentUser?._id;

  const isOwner = (comment: BlogComment) => {
    if (!currentUser?._id) return false;
    if (comment.user?._id && comment.user._id === currentUser._id) return true;
    if (currentUser.email && comment.authorEmail && currentUser.email === comment.authorEmail) return true;
    return false;
  };

  const canEdit = (comment: BlogComment) => {
    if (!isOwner(comment)) return false;
    if (comment.status === 'deleted') return false;
    if (!comment.createdAt) return false;

    const createdAt = new Date(comment.createdAt).getTime();
    return Date.now() - createdAt <= 15 * 60 * 1000;
  };

  const submitRootComment = async () => {
    if (!canWrite) {
      toast.error('Vui lòng đăng nhập để bình luận');
      return;
    }

    const content = rootContent.trim();
    if (!content) {
      toast.error('Vui lòng nhập nội dung bình luận');
      return;
    }

    try {
      setSubmittingRoot(true);
      const res = await BlogApiRequest.createMyComment(postId, content);
      if (res?.payload?.success) {
        setRootContent('');
        toast.success('Đã đăng bình luận');
        await fetchComments();
      }
    } catch (error) {
      handleErrorApi({ error });
    } finally {
      setSubmittingRoot(false);
    }
  };

  const submitReply = async (commentId: string) => {
    if (!canWrite) {
      toast.error('Vui lòng đăng nhập để trả lời bình luận');
      return;
    }

    const content = replyContent.trim();
    if (!content) {
      toast.error('Vui lòng nhập nội dung trả lời');
      return;
    }

    try {
      setReplying(true);
      const res = await BlogApiRequest.replyMyComment(commentId, content);
      if (res?.payload?.success) {
        setReplyOpenId(null);
        setReplyContent('');
        toast.success('Đã gửi trả lời');
        await fetchComments();
      }
    } catch (error) {
      handleErrorApi({ error });
    } finally {
      setReplying(false);
    }
  };

  const startEdit = (comment: BlogComment) => {
    setEditingId(comment._id);
    setEditingContent(comment.content || '');
  };

  const submitEdit = async (commentId: string) => {
    const content = editingContent.trim();
    if (!content) {
      toast.error('Vui lòng nhập nội dung bình luận');
      return;
    }

    try {
      setEditing(true);
      const res = await BlogApiRequest.updateMyComment(commentId, content);
      if (res?.payload?.success) {
        setEditingId(null);
        setEditingContent('');
        toast.success('Đã cập nhật bình luận');
        await fetchComments();
      }
    } catch (error) {
      handleErrorApi({ error });
    } finally {
      setEditing(false);
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!confirm('Bạn có chắc muốn xoá bình luận này?')) return;

    try {
      const res = await BlogApiRequest.deleteMyComment(commentId);
      if (res?.payload?.success) {
        toast.success('Đã xoá bình luận');
        await fetchComments();
      }
    } catch (error) {
      handleErrorApi({ error });
    }
  };

  const renderComment = (comment: BlogComment, depth = 0) => {
    const canReply = canWrite && depth < 2;
    const deleted = comment.status === 'deleted';

    return (
      <div key={comment._id} className={depth > 0 ? 'mt-3 ml-6 border-l pl-4' : 'mt-4'}>
        <div className="rounded-lg border bg-background p-3">
          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={comment.user?.avatarUrl || ''} alt={comment.authorName} />
              <AvatarFallback>{initialOf(comment.authorName)}</AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                <span className="font-semibold text-foreground">{comment.authorName}</span>
                <span className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</span>
              </div>

              {editingId === comment._id ? (
                <div className="mt-2 space-y-2">
                  <Textarea
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    rows={3}
                    maxLength={1000}
                    placeholder="Nhập nội dung bình luận..."
                  />
                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={() => submitEdit(comment._id)} disabled={editing}>
                      {editing ? 'Đang lưu...' : 'Lưu'}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingId(null);
                        setEditingContent('');
                      }}
                    >
                      Huỷ
                    </Button>
                  </div>
                </div>
              ) : (
                <p className={`mt-2 whitespace-pre-wrap text-sm ${deleted ? 'italic text-muted-foreground' : 'text-foreground'}`}>
                  {deleted ? 'Comment đã bị xoá' : comment.content}
                </p>
              )}

              <div className="mt-2 flex flex-wrap items-center gap-1">
                {canReply && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-8 px-2 text-xs"
                    onClick={() => {
                      setReplyOpenId(replyOpenId === comment._id ? null : comment._id);
                      setReplyContent('');
                    }}
                  >
                    <Reply className="mr-1 h-3.5 w-3.5" />
                    Trả lời
                  </Button>
                )}

                {canEdit(comment) && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-8 px-2 text-xs"
                    onClick={() => startEdit(comment)}
                  >
                    <Pencil className="mr-1 h-3.5 w-3.5" />
                    Sửa
                  </Button>
                )}

                {isOwner(comment) && !deleted && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-8 px-2 text-xs text-destructive hover:text-destructive"
                    onClick={() => deleteComment(comment._id)}
                  >
                    <Trash2 className="mr-1 h-3.5 w-3.5" />
                    Xoá
                  </Button>
                )}
              </div>

              {replyOpenId === comment._id && (
                <div className="mt-3 rounded-md border p-3">
                  <Textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    rows={3}
                    maxLength={1000}
                    placeholder="Nhập nội dung trả lời..."
                  />
                  <div className="mt-2 flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setReplyOpenId(null);
                        setReplyContent('');
                      }}
                    >
                      Huỷ
                    </Button>
                    <Button type="button" size="sm" onClick={() => submitReply(comment._id)} disabled={replying}>
                      {replying ? 'Đang gửi...' : 'Gửi trả lời'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {comment.replies?.length ? (
          <div className="space-y-0">
            {comment.replies.map((reply) => renderComment(reply, depth + 1))}
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-xl">
          <MessageCircle className="h-5 w-5" />
          Bình luận ({total})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border p-3">
          <Textarea
            value={rootContent}
            onChange={(e) => setRootContent(e.target.value)}
            rows={4}
            maxLength={1000}
            placeholder={
              canWrite
                ? 'Chia sẻ suy nghĩ của bạn về bài viết này...'
                : 'Đăng nhập để viết bình luận...'
            }
            disabled={!canWrite || submittingRoot}
          />
          <div className="mt-2 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{rootContent.trim().length}/1000 ký tự</p>
            {canWrite ? (
              <Button type="button" onClick={submitRootComment} disabled={submittingRoot}>
                <Send className="mr-2 h-4 w-4" />
                {submittingRoot ? 'Đang gửi...' : 'Gửi bình luận'}
              </Button>
            ) : (
              !loadingUser && (
                <Button asChild>
                  <Link href="/login">Đăng nhập</Link>
                </Button>
              )
            )}
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Đang tải bình luận...</p>
        ) : comments.length === 0 ? (
          <p className="text-sm text-muted-foreground">Chưa có bình luận nào. Hãy là người đầu tiên bình luận.</p>
        ) : (
          <div>{comments.map((comment) => renderComment(comment))}</div>
        )}
      </CardContent>
    </Card>
  );
}
