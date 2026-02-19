import { markAllAsRead } from "../../actions/notifications";

export const Header = ({ unreadCount }: { unreadCount: number }) => {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold">通知センター</h1>
        <p className="text-sm opacity-70">未読: {unreadCount} 件</p>
      </div>
      {unreadCount > 0 && (
        <form
          action={async () => {
            "use server";
            await markAllAsRead();
          }}
        >
          <button className="btn btn-primary btn-sm" type="submit">
            一括既読
          </button>
        </form>
      )}
    </div>
  );
};
