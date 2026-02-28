import Link from "next/link";

import type { NotificationType, Tab } from "../../schemas/notification";
import { buildQuery } from "../../utils/searchParams";

export const Footer = ({
  total,
  totalPages,
  searchParams,
}: {
  total: number;
  totalPages: number;
  searchParams: {
    page: number;
    tab: Tab;
    q: string;
    type: NotificationType;
  };
}) => {
  const { q, tab, type, page } = searchParams;
  return (
    <footer className="flex items-center justify-between">
      <div className="text-sm">
        {total} 件中 / {page} / {totalPages} ページ
      </div>
      <div className="join">
        <Link
          className={`btn btn-sm join-item ${page <= 1 ? "btn-disabled" : "btn-outline"}`}
          href={`/notifications${buildQuery({
            tab,
            q,
            type,
            page: String(Math.max(1, page - 1)),
          })}`}
        >
          前へ
        </Link>
        <Link
          className={`btn btn-sm join-item ${
            page >= totalPages ? "btn-disabled" : "btn-outline"
          }`}
          href={`/notifications${buildQuery({
            tab,
            q,
            type,
            page: String(Math.min(totalPages, page + 1)),
          })}`}
        >
          次へ
        </Link>
      </div>
    </footer>
  );
};
