import { definePrivatePage } from "../../../../../components/_common/page";
import { ImportUsersForm } from "../../../../../components/admin/users/import-users-form";

/**
 * ユーザー一括作成ページ
 */
export default definePrivatePage({
  adminOnly: true,
  name: "import_users",
}).page(async () => {
  return <ImportUsersForm />;
});
