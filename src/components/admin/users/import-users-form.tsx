"use client";

import Link from "next/link";
import { useImportUsersForm } from "../../../hooks/admin/use-import-users-form";
import { useEnv } from "../../_context/envContext";

export const ImportUsersForm = () => {
  const {
    preview,
    result,
    isSubmitting,
    isLoading,
    errorMessage,
    hasPreviewErrors,
    handleFileChange,
    handleCreatePreview,
    handleSubmit,
    downloadTemplate,
  } = useImportUsersForm();
  const envStore = useEnv();
  return (
    <>
      <h2 className="text-lg font-bold">ユーザー一括登録</h2>
      <form className="flex flex-col gap-4">
        <div className="card bg-base-100">
          <div className="card-body gap-4">
            <div className="card-title">CSVファイル取り込み</div>
            <p className="text-sm text-gray-600">
              必須列: name, email / 上限: {envStore.MAX_BULK_USERS}名
            </p>
            <button
              className="btn btn-outline btn-sm w-fit"
              type="button"
              onClick={downloadTemplate}
              disabled={isSubmitting}
            >
              テンプレートCSVをダウンロード
            </button>
            <input
              className="file-input file-input-bordered"
              type="file"
              name="csv"
              accept=".csv,text/csv"
              disabled={isSubmitting}
              onChange={(event) => {
                handleFileChange(event.target.files?.[0] ?? null);
              }}
            />
            {errorMessage && (
              <p className="text-error text-sm">{errorMessage}</p>
            )}
          </div>
        </div>
        <div className="flex flex-row justify-between">
          <div />
          <div className="flex flex-row gap-2">
            <Link type="button" className="btn btn-outline" href="/admin/users">
              一覧に戻る
            </Link>
            <button
              className="btn btn-outline"
              type="button"
              disabled={isSubmitting || isLoading}
              onClick={handleCreatePreview}
            >
              {isLoading ? "解析中..." : "プレビュー作成"}
            </button>
            <button
              className="btn btn-primary"
              type="button"
              disabled={isSubmitting || !preview || hasPreviewErrors}
              onClick={handleSubmit}
            >
              {isSubmitting ? (
                <span className="loading loading-spinner loading-md">
                  取り込み中
                </span>
              ) : (
                "取り込み"
              )}
            </button>
          </div>
        </div>
      </form>
      {preview && (
        <div className="card bg-base-100 mt-4">
          <div className="card-body gap-2">
            <div className="card-title">取り込みプレビュー</div>
            <p className="text-sm">
              対象 {preview.rows.length} 件 / 取り込み可能{" "}
              {preview.validUsers.length} 件 / エラー{" "}
              {preview.rows.length - preview.validUsers.length} 件
            </p>
            <div className="overflow-x-auto">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>行</th>
                    <th>名前</th>
                    <th>メールアドレス</th>
                    <th>判定</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.rows.map((row) => (
                    <tr key={row.rowNumber}>
                      <td>{row.rowNumber}</td>
                      <td>{row.name}</td>
                      <td>{row.email}</td>
                      <td>
                        {row.errors.length === 0 ? (
                          <span className="badge badge-success badge-outline">
                            OK
                          </span>
                        ) : (
                          <div className="flex flex-col gap-1">
                            <span className="badge badge-error badge-outline">
                              NG
                            </span>
                            <p className="text-error text-xs">
                              {row.errors.join(" / ")}
                            </p>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {result && (
        <div className="card bg-base-100 mt-4">
          <div className="card-body gap-2">
            <div className="card-title">取り込み結果</div>
            <p className="text-sm">
              対象 {result.total} 件 / 成功 {result.successCount} 件 / 失敗{" "}
              {result.failedCount} 件
            </p>
            {result.failures.length > 0 && (
              <div className="overflow-x-auto">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>行</th>
                      <th>メールアドレス</th>
                      <th>理由</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.failures.map((failure) => (
                      <tr key={`${failure.rowNumber}-${failure.email}`}>
                        <td>{failure.rowNumber}</td>
                        <td>{failure.email}</td>
                        <td>{failure.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
