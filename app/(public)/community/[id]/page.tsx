"use client";

export const runtime = "edge";

import { useEffect, useState, use } from "react";
import { communityService } from "@/services/communityService";
import { CommunityPost, CommunityComment } from "@/types/community";
import { Heart, MessageCircle, Share2, Flag, ArrowLeft, Loader2, User, Calendar, MoreHorizontal } from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CommunityCommentSection from "@/components/community/CommunityCommentSection";

export default function CommunityPostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [post, setPost] = useState<CommunityPost | null>(null);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(0);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    setIsLoading(true);
    try {
      const res = await communityService.getPostDetail(Number(id));
      if (res.success) {
        setPost(res.data);
        setComments(res.comments || []);
        setIsLiked(res.data.isLikedByCurrentUser);
        setLikes(res.data.likeCount);
      }
    } catch (error) {
      toast.error("Không tìm thấy bài viết.");
      router.push("/community");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      const res = await communityService.toggleLike({ postId: Number(id) });
      if (res.success) {
        setIsLiked(res.liked);
        setLikes(res.liked ? likes + 1 : likes - 1);
      }
    } catch (error) {
      toast.error("Vui lòng đăng nhập.");
    }
  };

  const getFullUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL 
      ? process.env.NEXT_PUBLIC_API_BASE_URL.replace("/api", "") 
      : "http://localhost:8668";
    return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#f8fafc]">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Đang tải nội dung...</p>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-20">
      <div className="max-w-4xl mx-auto py-10 px-4">
        {/* Navigation */}
        <Link href="/community" className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-600 font-bold mb-8 transition-colors group">
           <div className="p-2 rounded-xl bg-white border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-all">
              <ArrowLeft size={20} />
           </div>
           Quay lại cộng đồng
        </Link>

        {/* Main Post Content */}
        <div className="bg-white rounded-[40px] border border-slate-100 p-8 md:p-12 shadow-sm">
           {/* Author Info */}
           <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                 <div className="h-14 w-14 rounded-full bg-blue-50 overflow-hidden border-4 border-white shadow-md">
                    {post.userAvatarUrl ? (
                      <img src={getFullUrl(post.userAvatarUrl)} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-blue-600 text-xl font-black">
                         {post.userFullName?.charAt(0)}
                      </div>
                    )}
                 </div>
                 <div>
                    <h3 className="text-lg font-black text-slate-900">{post.userFullName}</h3>
                    <div className="flex items-center gap-3 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                       <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(post.createdAt!).toLocaleDateString('vi-VN')}</span>
                       <span className="h-1 w-1 rounded-full bg-slate-200"></span>
                       <span className="flex items-center gap-1"><User size={12} /> Thành viên</span>
                    </div>
                 </div>
              </div>
              <button className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:text-slate-600 transition-all">
                 <MoreHorizontal size={24} />
              </button>
           </div>

           {/* Post Text */}
           <div className="space-y-6 mb-10">
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">
                 {post.title}
              </h1>
              <div className="text-slate-600 text-lg leading-relaxed whitespace-pre-wrap">
                 {post.content}
              </div>
           </div>

           {/* Post Media */}
           {post.mediaUrl && (
             <div className="rounded-[32px] overflow-hidden bg-slate-100 border border-slate-100 mb-10 shadow-inner">
                {post.mediaType === 'IMAGE' ? (
                   <img src={getFullUrl(post.mediaUrl)} className="w-full h-auto" />
                ) : (
                   <video src={getFullUrl(post.mediaUrl)} controls className="w-full h-auto" />
                )}
             </div>
           )}

           {/* Interaction Bar */}
           <div className="flex items-center justify-between pt-8 border-t border-slate-50">
              <div className="flex items-center gap-4 md:gap-8">
                 <button 
                   onClick={handleLike}
                   className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all font-black text-sm ${isLiked ? "bg-pink-50 text-pink-600" : "bg-slate-50 text-slate-400 hover:bg-pink-50 hover:text-pink-600"}`}
                 >
                    <Heart size={24} fill={isLiked ? "currentColor" : "none"} />
                    {likes} Thích
                 </button>
                 <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-slate-50 text-slate-400 font-black text-sm">
                    <MessageCircle size={24} />
                    {comments.length} Bình luận
                 </div>
              </div>
              <div className="flex items-center gap-3">
                 <button className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all">
                    <Share2 size={24} />
                 </button>
                 <button className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all">
                    <Flag size={24} />
                 </button>
              </div>
           </div>

           {/* Comments Section */}
           <CommunityCommentSection postId={Number(id)} initialComments={comments} />
        </div>
      </div>
    </div>
  );
}
