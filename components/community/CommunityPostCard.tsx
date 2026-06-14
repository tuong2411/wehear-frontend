"use client";

import { CommunityPost } from "@/types/community";
import { Heart, MessageCircle, Share2, MoreVertical, Flag, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { communityService } from "@/services/communityService";
import { toast } from "react-hot-toast";
import Link from "next/link";

interface PostCardProps {
  post: CommunityPost;
  onLikeUpdate?: (id: number, liked: boolean, count: number) => void;
}

export default function CommunityPostCard({ post, onLikeUpdate }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLikedByCurrentUser || false);
  const [likes, setLikes] = useState(post.likeCount || 0);
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLiking) return;
    
    setIsLiking(true);
    try {
      const res = await communityService.toggleLike({ postId: post.id });
      if (res.success) {
        const newLiked = res.liked;
        setIsLiked(newLiked);
        const newCount = newLiked ? likes + 1 : likes - 1;
        setLikes(newCount);
        onLikeUpdate?.(post.id!, newLiked, newCount);
      }
    } catch (error) {
      toast.error("Vui lòng đăng nhập để thực hiện.");
    } finally {
      setIsLiking(false);
    }
  };

  const handleReport = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const reason = window.prompt("Nhập lý do báo cáo bài viết này:");
    if (!reason || !reason.trim()) return;

    try {
      const res = await communityService.reportContent({
        postId: post.id,
        reason: reason.trim(),
        reporterId: 0, // Backend handles this from JWT
      });
      if (res.success) {
        toast.success("Cảm ơn bạn! Báo cáo đã được gửi tới ban quản trị.");
      }
    } catch (error) {
      toast.error("Vui lòng đăng nhập để báo cáo.");
    }
  };

  const getFullUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://wehear-backend-production.up.railway.app";
    return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  return (
    <Link href={`/community/${post.id}`}>
      <div className="bg-white rounded-3xl border border-slate-100 p-6 hover:shadow-xl hover:shadow-blue-500/5 transition-all group">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-slate-100 overflow-hidden border-2 border-white shadow-sm">
              {post.userAvatarUrl ? (
                <img src={getFullUrl(post.userAvatarUrl)} alt={post.userFullName} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold">
                  {post.userFullName?.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-800">{post.userFullName}</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                {new Date(post.createdAt!).toLocaleDateString('vi-VN')}
              </p>
            </div>
          </div>
          <button className="text-slate-300 hover:text-slate-600 transition-colors">
            <MoreVertical size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-3 mb-6">
          <h3 className="text-lg font-black text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">
            {post.title}
          </h3>
          <p className="text-slate-600 text-sm line-clamp-3 leading-relaxed">
            {post.content}
          </p>
          
          {post.mediaUrl && (
            <div className="rounded-2xl overflow-hidden bg-slate-100 border border-slate-100">
              {post.mediaType === 'IMAGE' ? (
                <img
                  src={getFullUrl(post.mediaUrl)}
                  alt="Post media"
                  className="max-h-[520px] w-full object-contain"
                />
              ) : (
                <video
                  src={getFullUrl(post.mediaUrl)}
                  className="max-h-[520px] w-full object-contain"
                  preload="metadata"
                />
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
          <div className="flex items-center gap-6">
            <button 
              onClick={handleLike}
              className={`flex items-center gap-2 text-sm font-bold transition-all ${isLiked ? "text-pink-500" : "text-slate-400 hover:text-pink-500"}`}
            >
              <Heart size={20} fill={isLiked ? "currentColor" : "none"} className={isLiking ? "animate-ping" : ""} />
              {likes}
            </button>
            <div className="flex items-center gap-2 text-slate-400 text-sm font-bold">
              <MessageCircle size={20} />
              {post.commentCount}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-blue-600 transition-all">
              <Share2 size={18} />
            </button>
            <button 
              onClick={handleReport}
              className="p-2 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
            >
              <Flag size={18} />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
