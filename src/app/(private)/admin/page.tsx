import { definePrivatePage } from "../../../components/_common/page";
import { AdminNavigation } from "../../../components/admin/navigation";

/**
 * 管理者用ページ
 */
export default definePrivatePage({
  adminOnly: true,
  name: "admin",
}).page(async () => {
  return (
    <>
      <h2 className="text-lg font-bold">管理者ページ </h2>
      <AdminNavigation />
    </>
  );
});
