"use client";

import { useEffect, useState } from "react";
import { communityService } from "@/services/communityService";
import { CommunityPost } from "@/types/community";
import CommunityPostCard from "./CommunityPostCard";
import CommunityPostForm from "./CommunityPostForm";
import { Clock3, Gift, Loader2, MessageSquareText, ShieldCheck, UsersRound, Zap } from "lucide-react";

const communityStrengths = [
  {
    title: "Tham gia miễn phí",
    desc: "Đăng câu hỏi, chia sẻ kinh nghiệm và góp ý nội dung mà không mất phí.",
    icon: Gift,
  },
  {
    title: "Phản hồi nhanh",
    desc: "Bài viết mới xuất hiện trực tiếp trong cộng đồng để mọi người cùng trao đổi.",
    icon: Zap,
  },
  {
    title: "Bắt đầu dễ dàng",
    desc: "Có thể đăng bài, đính kèm hình ảnh hoặc video ngay khi cần hỗ trợ.",
    icon: Clock3,
  },
];

export default function CommunityFeed() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const res = await communityService.getPosts(0, 20);
      if (res.success) {
        setPosts(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch posts", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 md:px-8">
      {/* Header Section */}
      <div className="mb-10 text-center md:text-left bg-gradient-to-r from-blue-600 to-blue-800 rounded-[32px] p-10 md:p-14 text-white shadow-xl shadow-blue-900/20 relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            Cộng đồng <span className="text-blue-200">WeHear</span>
          </h1>
          <p className="text-blue-100 font-medium text-lg max-w-2xl">
            Nơi kết nối, học hỏi và chia sẻ kiến thức về ngôn ngữ ký hiệu. Cùng nhau xây dựng một cộng đồng không rào cản.
          </p>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-40 -mb-20 w-60 h-60 bg-blue-400/20 rounded-full blur-2xl"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Feed Column */}
        <div className="lg:col-span-8">
          <CommunityPostForm onPostCreated={fetchPosts} />

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white rounded-3xl border border-slate-100">
              <Loader2 className="animate-spin text-blue-600" size={40} />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Đang tải thảo luận...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
               <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                  <MessageSquareText size={40} />
               </div>
               <p className="text-slate-400 font-bold">Chưa có thảo luận nào. Hãy là người đầu tiên!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map(post => (
                <CommunityPostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="hidden lg:block lg:col-span-4 space-y-6">
          {/* About Widget */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
            <h3 className="font-black text-slate-900 text-lg mb-4 flex items-center gap-2">
              <ShieldCheck className="text-blue-600" size={20} /> Về cộng đồng
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              WeHear là không gian an toàn và tôn trọng. Mọi đóng góp đều có giá trị trong việc lan tỏa ngôn ngữ ký hiệu Việt Nam.
            </p>
            <div className="space-y-3 border-y border-slate-50 py-4">
              {communityStrengths.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex gap-3 rounded-2xl bg-slate-50 p-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 ring-1 ring-slate-100">
                      <Icon size={18} />
                    </div>
                    <div>
                      <div className="text-sm font-black text-slate-800">{item.title}</div>
                      <p className="mt-1 text-xs font-medium leading-5 text-slate-500">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contribution Widget */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
            <h3 className="font-black text-slate-900 text-lg mb-4 flex items-center gap-2">
              <UsersRound className="text-emerald-600" size={20} /> Tham gia ngay
            </h3>
            <p className="text-sm leading-6 text-slate-600">
              Bạn có thể đặt câu hỏi, chia sẻ trải nghiệm học VSL hoặc trao đổi về một ký hiệu
              đang cần làm rõ. Mọi thao tác đều gọn và miễn phí.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
