import type { getUsers } from "../../../actions/admin-user";

export type AdminUserListResult = Awaited<ReturnType<typeof getUsers>>;
export type AdminUserRow = AdminUserListResult["users"][number];
