import { type JSX, Suspense } from "react";

import { createRequestLogger } from "../../lib/logger";
import { runWithLogger } from "../../lib/request-context";
import { requestSession, type Session } from "../../lib/session";
import { Loading } from "./loading";

type SearchParams = Record<string, string | string[] | undefined>;

type PageProps<
  TParam extends object | undefined = undefined,
  TSearchParams extends SearchParams | undefined = undefined,
> = {
  params: Promise<TParam>;
  searchParams: Promise<Partial<TSearchParams>>;
};

type DefinePrivatePageOptions = {
  /** ログ用のページ名 */
  name: string;
  /** 管理者のみに認可 */
  adminOnly?: boolean;

  /** 未ログイン時に /sign-in へ */
  redirect?: boolean;

  /** Suspense fallback を使うか（デフォルトtrue） */
  suspense?: boolean;
};

/**
 * ページ読み込み中にローディングを表示するためのラッパーコンポーネント
 */
export const PageWrapper = ({ children }: { children: React.ReactNode }) => {
  return <Suspense fallback={<Loading />}>{children}</Suspense>;
};

export const definePrivatePage = <
  TParam extends object | undefined = undefined,
  TSearchParams extends SearchParams | undefined = undefined,
>(
  opts: DefinePrivatePageOptions,
) => {
  return {
    page: (
      Page: (args: {
        props: PageProps<TParam, TSearchParams>;
        session: NonNullable<Session>;
      }) => Promise<JSX.Element>,
    ) => {
      return async (
        props: PageProps<TParam, TSearchParams>,
      ): Promise<JSX.Element> => {
        const session = await requestSession(opts);
        const requestId = crypto.randomUUID();
        const log = createRequestLogger(session, {
          page: opts.name,
          scope: "page",
          requestId: requestId,
          adminOnly: opts.adminOnly,
        });

        return runWithLogger(log, async () => {
          log.info({ event: "render_element" }, "start");

          const inner = <Page props={props} session={session} />;
          const page =
            opts?.suspense === false ? (
              inner
            ) : (
              <PageWrapper>{inner}</PageWrapper>
            );

          return page;
        });
      };
    },
  };
};
