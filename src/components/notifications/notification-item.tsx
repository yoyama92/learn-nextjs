"use client";

import { useRef } from "react";
import { markAsRead } from "../../actions/notifications";
import type { NotificationType } from "../../schemas/notification";

export const NotificationItem = ({
  item,
}: {
  item: {
    type: NotificationType;
    title: string;
    body: string;
    createdAt: Date;
    id: string;
    readAt: Date | null;
  };
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const isUnread = item.readAt === null;
  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="badge">{item.type.toUpperCase()}</span>
              {isUnread && <span className="badge badge-accent">未読</span>}
            </div>
            <h2 className="font-semibold">{item.title}</h2>
            <p className="text-sm opacity-80 line-clamp-2">{item.body}</p>
            <p className="text-xs opacity-60">
              {item.createdAt.toLocaleString("ja-JP")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => dialogRef.current?.showModal()}
            >
              詳細
            </button>
            <div className="dropdown dropdown-end">
              <button
                tabIndex={0}
                type="button"
                className="btn btn-ghost btn-sm"
                disabled={!isUnread}
              >
                ⋯
              </button>
              <ul className="dropdown-content menu bg-base-100 rounded-box shadow w-44">
                {isUnread && (
                  <li>
                    <form
                      className="block p-0 px-3 py-1"
                      action={async () => {
                        await markAsRead(item.id);
                      }}
                    >
                      <button type="submit" className="w-full text-left">
                        既読にする
                      </button>
                    </form>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
        <dialog className="modal" ref={dialogRef}>
          <div className="modal-box">
            <h3 className="font-bold text-lg">{item.title}</h3>
            <div className="mt-2 flex items-center gap-2">
              <span className="badge">{item.type.toUpperCase()}</span>
              {isUnread && <span className="badge badge-accent">未読</span>}
            </div>
            <p className="py-4 whitespace-pre-wrap">{item.body}</p>
            <div className="modal-action">
              {isUnread && (
                <form
                  action={async () => {
                    await markAsRead(item.id);
                  }}
                >
                  <input type="hidden" name="id" value={item.id} />
                  <button className="btn btn-primary" type="submit">
                    既読にする
                  </button>
                </form>
              )}
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => dialogRef.current?.close()}
              >
                閉じる
              </button>
            </div>
          </div>
        </dialog>
      </div>
    </div>
  );
};
