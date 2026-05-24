"use client";

import { useEffect, useState } from "react";
import { communityService } from "@/services/communityService";
import { CommunityPost } from "@/types/community";
import CommunityPostCard from "./CommunityPostCard";
import CommunityPostForm from "./CommunityPostForm";
import { Loader2, MessageSquareText, TrendingUp, Users, ShieldCheck, Star } from "lucide-react";

export default function CommunityFeed() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);

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
            <div className="flex justify-between items-center py-4 border-y border-slate-50">
              <div className="text-center">
                <div className="font-black text-xl text-slate-800">1.2K</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Thành viên</div>
              </div>
              <div className="w-px h-8 bg-slate-100"></div>
              <div className="text-center">
                <div className="font-black text-xl text-slate-800">340</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bài viết</div>
              </div>
            </div>
          </div>

          {/* Trending Topics Widget */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
            <h3 className="font-black text-slate-900 text-lg mb-4 flex items-center gap-2">
              <TrendingUp className="text-red-500" size={20} /> Chủ đề nổi bật
            </h3>
            <div className="space-y-4">
              {['Hỏi đáp từ vựng', 'Kỹ năng giao tiếp', 'Góc chia sẻ', 'Sự kiện Offline'].map((topic, idx) => (
                <div key={idx} className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-300 font-black text-lg group-hover:text-blue-300 transition-colors">0{idx + 1}</span>
                    <span className="font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{topic}</span>
                  </div>
                  <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">{(50 - idx * 10)} bài</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Contributors Widget */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
            <h3 className="font-black text-slate-900 text-lg mb-4 flex items-center gap-2">
              <Star className="text-yellow-400" size={20} /> Đóng góp tích cực
            </h3>
            <div className="space-y-4">
              {[
                { name: 'Nguyễn Trọng Tường', role: 'Chuyên gia', initials: 'T', color: 'bg-blue-100 text-blue-600' },
                { name: 'Trần Thị Mai', role: 'Thành viên tích cực', initials: 'M', color: 'bg-pink-100 text-pink-600' },
                { name: 'Lê Hoàng', role: 'Học viên', initials: 'H', color: 'bg-emerald-100 text-emerald-600' }
              ].map((user, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center font-black ${user.color}`}>
                    {user.initials}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-800">{user.name}</div>
                    <div className="text-xs font-medium text-slate-500">{user.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
