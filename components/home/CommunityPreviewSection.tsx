"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Heart,
  MessageCircle,
  MessageSquarePlus,
  UsersRound,
} from "lucide-react";
import { communityService } from "@/services/communityService";
import { CommunityPost } from "@/types/community";

const fallbackPosts: CommunityPost[] = [
  {
    id: 1,
    title: "Mọi người thường luyện ký hiệu giao tiếp hằng ngày như thế nào?",
    content:
      "Chia sẻ kinh nghiệm học VSL theo tình huống thực tế: chào hỏi, hỏi đường, đặt lịch khám và trao đổi trong gia đình.",
    userFullName: "Cộng đồng WeHear",
    likeCount: 24,
    commentCount: 8,
  },
  {
    id: 2,
    title: "Góp ý thêm video mẫu cho các ký hiệu dễ nhầm",
    content:
      "Nếu bạn thấy một ký hiệu trong từ điển chưa rõ, hãy gửi video hoặc góp ý để nhóm quản trị kiểm tra và cập nhật dữ liệu.",
    userFullName: "Nhóm đóng góp",
    likeCount: 18,
    commentCount: 5,
  },
  {
    id: 3,
    title: "Cần hỗ trợ dịch một đoạn ký hiệu ngắn",
    content:
      "Bạn có thể đăng câu hỏi, đính kèm video và nhờ cộng đồng cùng thảo luận để kết quả dịch chính xác hơn.",
    userFullName: "Thành viên mới",
    likeCount: 12,
    commentCount: 4,
  },
];

const getPostDate = (post: CommunityPost) => {
  if (!post.createdAt) return "Chủ đề cộng đồng";

  return new Date(post.createdAt).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export default function CommunityPreviewSection() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await communityService.getPosts(0, 3);
        if (res?.success && Array.isArray(res.data)) {
          setPosts(res.data.slice(0, 3));
        }
      } catch (error) {
        console.error("Failed to fetch community posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const displayPosts = posts.length > 0 ? posts : fallbackPosts;

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase text-blue-600">
              <UsersRound className="h-4 w-4" />
              Cộng đồng WeHear
            </div>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
              Cùng hỏi đáp và chia sẻ ngôn ngữ ký hiệu
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">
              Theo dõi các bài chia sẻ mới, đặt câu hỏi khi cần hỗ trợ và cùng
              nhau lan tỏa cách giao tiếp dễ tiếp cận hơn.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/community"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              <MessageSquarePlus className="h-4 w-4" />
              Đăng bài
            </Link>
            <Link
              href="/community"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Xem cộng đồng
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {loading && posts.length === 0 ? (
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-56 animate-pulse rounded-2xl bg-slate-100"
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {displayPosts.map((post) => (
              <Link
                key={post.id ?? post.title}
                href={post.id ? `/community/${post.id}` : "/community"}
                className="group flex min-h-64 flex-col rounded-2xl border border-slate-100 bg-slate-50 p-6 transition hover:-translate-y-1 hover:border-blue-100 hover:bg-white hover:shadow-xl hover:shadow-blue-100/60"
              >
                <div className="flex items-center justify-between text-xs font-bold uppercase text-slate-400">
                  <span>{post.userFullName || "Thành viên WeHear"}</span>
                  <span>{getPostDate(post)}</span>
                </div>
                <h3 className="mt-5 line-clamp-2 text-xl font-extrabold leading-snug text-slate-900 transition group-hover:text-blue-600">
                  {post.title}
                </h3>
                <p className="mt-3 line-clamp-4 flex-1 text-sm leading-6 text-slate-600">
                  {post.content}
                </p>
                <div className="mt-6 flex items-center gap-5 border-t border-slate-200 pt-4 text-sm font-bold text-slate-500">
                  <span className="inline-flex items-center gap-2">
                    <Heart className="h-4 w-4 text-rose-500" />
                    {post.likeCount || 0}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-blue-500" />
                    {post.commentCount || 0}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
