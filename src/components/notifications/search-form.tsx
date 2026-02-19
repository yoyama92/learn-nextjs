import Link from "next/link";

import {
  type NotificationType,
  notificationTypeEnum,
  type Tab,
} from "../../schemas/notification";
import { buildQuery } from "../../utils/searchParams";

export const SearchForm = ({
  searchParams,
  unreadCount,
}: {
  searchParams: {
    tab: Tab;
    q: string;
    type: NotificationType;
  };
  unreadCount: number;
}) => {
  const { q, tab, type } = searchParams;

  return (
    <form method="get" className="card bg-base-100 shadow">
      <div className="card-body gap-3">
        <div className="join w-full">
          <input
            name="q"
            defaultValue={q}
            className="input input-bordered join-item w-full"
            placeholder="検索（タイトル/本文）"
          />
          <select
            name="type"
            defaultValue={type}
            className="select select-bordered join-item"
          >
            <option value={notificationTypeEnum.all}>種別: すべて</option>
            <option value={notificationTypeEnum.info}>info</option>
            <option value={notificationTypeEnum.warn}>warn</option>
            <option value={notificationTypeEnum.security}>security</option>
          </select>
          <button className="btn join-item" type="submit">
            検索
          </button>
        </div>
        <div className="tabs tabs-boxed">
          <Link
            className={`tab ${tab === "unread" ? "tab-active" : ""}`}
            href={`/notifications${buildQuery({
              tab: "unread" satisfies Tab,
              q,
              type,
              page: "1",
            })}`}
          >
            未読
            {unreadCount > 0 && (
              <span className="badge badge-secondary ml-2">{unreadCount}</span>
            )}
          </Link>
          <Link
            className={`tab ${tab === "all" ? "tab-active" : ""}`}
            href={`/notifications${buildQuery({
              tab: "all" satisfies Tab,
              q,
              type,
              page: "1",
            })}`}
          >
            すべて
          </Link>
        </div>
      </div>
    </form>
  );
};
