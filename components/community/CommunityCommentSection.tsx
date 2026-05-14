"use client";

import { useState } from "react";
import { CommunityComment } from "@/types/community";
import { communityService } from "@/services/communityService";
import { toast } from "react-hot-toast";
import { Heart, Reply, Send, MessageCircle } from "lucide-react";

interface CommentSectionProps {
  postId: number;
  initialComments: CommunityComment[];
}

export default function CommunityCommentSection({ postId, initialComments }: CommentSectionProps) {
  const [comments, setComments] = useState<CommunityComment[]>(initialComments);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent, parentId?: number) => {
    e.preventDefault();
    const content = parentId ? (e.target as any).replyContent.value : newComment;
    
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await communityService.addComment({
        postId,
        content,
        parentId: parentId || undefined,
      });
      if (res.success) {
        toast.success("Đã đăng bình luận!");
        if (!parentId) setNewComment("");
        else setReplyTo(null);
        
        // Refresh comments (in a real app, we might fetch only comments or append)
        const updated = await communityService.getPostDetail(postId);
        if (updated.success) {
          // Note: getPostDetail should return comments nested. 
          // Our service currently returns post and comments separately in the controller.
          // Let's assume the component that calls this will handle the full refresh or we call it here.
          // For now, I'll just clear the input and suggest a page refresh or re-fetch.
          window.location.reload(); 
        }
      }
    } catch (error) {
      toast.error("Không thể đăng bình luận. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const CommentItem = ({ comment, isReply = false }: { comment: CommunityComment, isReply?: boolean }) => {
    const [liked, setLiked] = useState(comment.isLikedByCurrentUser || false);
    const [likes, setLikes] = useState(comment.likeCount || 0);

    const handleLike = async () => {
      try {
        const res = await communityService.toggleLike({ commentId: comment.id });
        if (res.success) {
          setLiked(res.liked);
          setLikes(res.liked ? likes + 1 : likes - 1);
        }
      } catch (error) {
        toast.error("Vui lòng đăng nhập.");
      }
    };

    return (
      <div className={`group ${isReply ? "ml-12 mt-4" : "mb-6"}`}>
        <div className="flex gap-3">
          <div className="h-8 w-8 rounded-full bg-slate-100 overflow-hidden shrink-0 border border-white shadow-sm">
            {comment.userAvatarUrl && <img src={comment.userAvatarUrl} className="h-full w-full object-cover" />}
          </div>
          <div className="flex-1">
            <div className="bg-slate-50 rounded-2xl px-4 py-3 relative">
               <h5 className="text-xs font-black text-slate-800 mb-1">{comment.userFullName}</h5>
               <p className="text-sm text-slate-600 leading-relaxed">{comment.content}</p>
            </div>
            
            <div className="flex items-center gap-4 mt-2 ml-2">
               <button 
                 onClick={handleLike}
                 className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider transition-colors ${liked ? "text-pink-500" : "text-slate-400 hover:text-pink-500"}`}
               >
                  <Heart size={12} fill={liked ? "currentColor" : "none"} />
                  {likes > 0 && likes} Thích
               </button>
               {!isReply && (
                 <button 
                   onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id!)}
                   className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-blue-600 uppercase tracking-wider"
                 >
                    <Reply size={12} /> Phản hồi
                 </button>
               )}
               <span className="text-[10px] font-bold text-slate-300 uppercase">
                  {new Date(comment.createdAt!).toLocaleDateString('vi-VN')}
               </span>
            </div>

            {replyTo === comment.id && (
              <form onSubmit={(e) => handleSubmit(e, comment.id)} className="mt-4 flex gap-2 animate-in slide-in-from-top-2">
                 <input 
                   name="replyContent"
                   autoFocus
                   placeholder={`Phản hồi ${comment.userFullName}...`}
                   className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm focus:border-blue-500 outline-none"
                 />
                 <button type="submit" disabled={isSubmitting} className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
                    <Send size={16} />
                 </button>
              </form>
            )}

            {comment.replies && comment.replies.map(reply => (
              <CommentItem key={reply.id} comment={reply} isReply />
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mt-10 pt-10 border-t border-slate-100">
      <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-2">
         <MessageCircle size={24} className="text-blue-600" />
         Thảo luận ({comments.length})
      </h3>

      {/* New Comment Input */}
      <form onSubmit={handleSubmit} className="mb-10 bg-slate-50 rounded-3xl p-4 border border-slate-100 focus-within:border-blue-200 focus-within:bg-white transition-all">
         <textarea 
           value={newComment}
           onChange={(e) => setNewComment(e.target.value)}
           placeholder="Viết bình luận của bạn..."
           rows={2}
           className="w-full bg-transparent border-none focus:ring-0 outline-none text-sm text-slate-700 resize-none"
         />
         <div className="flex justify-end mt-2">
            <button 
              type="submit" 
              disabled={isSubmitting || !newComment.trim()}
              className="flex items-center gap-2 px-6 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-all"
            >
               Gửi bình luận <Send size={14} />
            </button>
         </div>
      </form>

      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-center text-slate-400 py-10 font-medium">Chưa có bình luận nào. Hãy bắt đầu cuộc trò chuyện!</p>
        ) : (
          comments.map(comment => (
            <CommentItem key={comment.id} comment={comment} />
          ))
        )}
      </div>
    </div>
  );
}
