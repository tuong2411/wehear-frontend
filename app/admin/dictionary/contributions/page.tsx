import AdminContributionManager from "@/components/admin/AdminContributionManager";

export default function AdminContributionsPage() {
  return (
    <div className="p-6 md:p-10">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-slate-900">Quản lý đóng góp</h1>
        <p className="text-slate-500 font-medium">Kiểm duyệt các từ vựng mới và bản chỉnh sửa từ cộng đồng.</p>
      </div>
      
      <AdminContributionManager />
    </div>
  );
}
