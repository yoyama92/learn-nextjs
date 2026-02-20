"use client";

import Link from "next/link";

import {
  notificationArchiveFilterEnum,
  notificationAudienceEnum,
} from "../../schemas/admin-notification";
import { notificationTypeEnum } from "../../schemas/notification";
import { buildQuery } from "../../utils/searchParams";
import type { AdminNotificationSearchParams } from "./notification-list-types";

export const AdminNotificationSearchForm = ({
  searchParams,
}: {
  searchParams: AdminNotificationSearchParams;
}) => {
  return (
    <form method="get" className="card bg-base-100 shadow">
      <div className="card-body gap-3">
        <div className="join w-full max-md:join-vertical md:items-center">
          <input
            name="q"
            defaultValue={searchParams.q}
            className="input input-bordered join-item w-full"
            placeholder="検索（タイトル/本文）"
          />
          <select
            name="type"
            defaultValue={searchParams.type}
            className="select select-bordered join-item"
          >
            <option value={notificationTypeEnum.all}>種別: すべて</option>
            <option value={notificationTypeEnum.info}>info</option>
            <option value={notificationTypeEnum.warn}>warn</option>
            <option value={notificationTypeEnum.security}>security</option>
          </select>
          <select
            name="audience"
            defaultValue={searchParams.audience}
            className="select select-bordered join-item"
          >
            <option value={notificationAudienceEnum.all}>対象: すべて</option>
            <option value={notificationAudienceEnum.allUsers}>全員</option>
            <option value={notificationAudienceEnum.selectedUsers}>
              指定ユーザー
            </option>
          </select>
          <button className="btn join-item" type="submit">
            検索
          </button>
          <Link
            className="btn btn-ghost join-item"
            href="/admin/notifications"
            prefetch={false}
          >
            リセット
          </Link>
        </div>
        <div className="tabs tabs-boxed">
          <Link
            className={`tab ${
              searchParams.archived === notificationArchiveFilterEnum.active
                ? "tab-active"
                : ""
            }`}
            href={`/admin/notifications${buildQuery({
              archived: notificationArchiveFilterEnum.active,
              q: searchParams.q,
              type: searchParams.type,
              audience: searchParams.audience,
              page: "1",
            })}`}
            prefetch={false}
          >
            通常
          </Link>
          <Link
            className={`tab ${
              searchParams.archived === notificationArchiveFilterEnum.archived
                ? "tab-active"
                : ""
            }`}
            href={`/admin/notifications${buildQuery({
              archived: notificationArchiveFilterEnum.archived,
              q: searchParams.q,
              type: searchParams.type,
              audience: searchParams.audience,
              page: "1",
            })}`}
            prefetch={false}
          >
            アーカイブ済み
          </Link>
        </div>
      </div>
    </form>
  );
};
