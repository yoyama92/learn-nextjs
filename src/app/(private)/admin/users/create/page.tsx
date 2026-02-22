import { definePrivatePage } from "../../../../../components/_common/page";
import { NewUserForm } from "../../../../../components/admin/users/new-user-form";

/**
 * ユーザー新規作成ページ
 */
export default definePrivatePage({
  adminOnly: true,
  name: "create_user",
}).page(async () => {
  return <NewUserForm />;
});
