import { definePrivatePage } from "../../../../../components/_common/page";
import { NewUserForm } from "../../../../../components/admin/new-user-form";

/**
 * ユーザー新規作成ページ
 */
export default definePrivatePage(
  async () => {
    return <NewUserForm />;
  },
  {
    adminOnly: true,
    pageName: "create_user",
  },
);
