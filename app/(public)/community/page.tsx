import CommunityFeed from "@/components/community/CommunityFeed";

export const metadata = {
  title: "Cộng đồng Wehear - Hỏi đáp & Chia sẻ",
  description: "Tham gia cộng đồng Wehear để cùng nhau học tập và chia sẻ kiến thức về ngôn ngữ ký hiệu.",
};

export default function CommunityPage() {
  return (
    <div className="bg-[#f8fafc] min-h-screen pb-20">
      <CommunityFeed />
    </div>
  );
}
