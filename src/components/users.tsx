import { NewUserModal } from "./new-user-modal";

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
        <table className="table table-sm table-pin-rows table-pin-cols">
          <thead>
            <tr>
              <th></th>
              <td>Name</td>
              <td>Email</td>
              <td>Role</td>
              <td>Created At</td>
              <td>Updated At</td>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user.id}>
                <th>{index + 1}</th>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.isAdmin ? "Admin" : "User"}</td>
                <td>{user.createdAt.toLocaleString("ja-JP")}</td>
                <td>{user.updatedAt.toLocaleString("ja-JP")}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th></th>
              <td>Name</td>
              <td>Email</td>
              <td>Role</td>
              <td>Created At</td>
              <td>Updated At</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <NewUserModal />
    </div>
  );
};
