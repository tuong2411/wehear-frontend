import AdminCommunityManager from "@/components/admin/AdminCommunityManager";

export const metadata = {
  title: "Quản lý Cộng đồng | Admin Wehear",
};

export default function AdminCommunityPage() {
  return (
    <div className="p-4 md:p-8">
      <AdminCommunityManager />
    </div>
  );
}
