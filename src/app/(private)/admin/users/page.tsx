import { definePrivatePage } from "../../../../components/_common/page";
import { UserListWithPagination } from "../../../../components/admin/user-list";
import { getUsersPaginated } from "../../../../server/services/userService";

/**
 * 管理者用ユーザー一覧ページ
 */
export default definePrivatePage(
  async () => {
    const data = await getUsersPaginated(1);
    return <UserListWithPagination initialData={data} />;
  },
  {
    adminOnly: true,
    pageName: "admin_user_list",
  },
);
