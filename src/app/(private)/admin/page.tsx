import { definePrivatePage } from "../../../components/_common/page";
import { AdminNavigation } from "../../../components/admin/navigation";

/**
 * 管理者用ページ
 */
export default definePrivatePage(
  async () => {
    return (
      <>
        <h2 className="text-lg font-bold">管理者ページ </h2>
        <AdminNavigation />
      </>
    );
  },
  {
    adminOnly: true,
    pageName: "admin",
  },
);
