import { getUsers } from "../../../../actions/admin";
import { definePrivatePage } from "../../../../components/_common/page";
import { UserListWithPagination } from "../../../../components/admin/user-list";

/**
 * 管理者用ユーザー一覧ページ
 */
export default definePrivatePage(
  async () => {
    const data = await getUsers({
      page: 1,
      pageSize: 10,
    });
    return <UserListWithPagination initialData={data} />;
  },
  {
    adminOnly: true,
    pageName: "admin_user_list",
  },
);
