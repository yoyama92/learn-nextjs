import { NewUserModal } from "./new-user-modal";
import { UserTable } from "./user-table";

export const UserList = ({
  users,
}: {
  users: {
    id: string;
    name: string;
    email: string;
    isAdmin?: boolean;
    createdAt: Date;
    updatedAt: Date;
  }[];
}) => {
  return (
    <div className="flex flex-col gap-4 p-4 bg-base-100 border-base-300 rounded-box">
      <h2 className="text-lg font-bold">ユーザー一覧</h2>
      <div className="overflow-x-auto max-h-[400px]">
        <UserTable rows={users} />
      </div>
      <NewUserModal />
    </div>
  );
};
