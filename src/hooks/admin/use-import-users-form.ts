"use client";

import { useCallback, useState } from "react";

import { postBulkCreateUsers } from "../../actions/admin-user";
import {
  type BulkCreateUsersResponseSchema,
  bulkCreateUsersSchema,
} from "../../schemas/admin";
import { buildCSVContent, parseCSVContent } from "../../utils/csv";

const REQUIRED_HEADERS = ["name", "email"] as const;

type PreviewRow = {
  rowNumber: number;
  name: string;
  email: string;
  errors: string[];
};

type CsvPreview = {
  rows: PreviewRow[];
  validUsers: {
    rowNumber: number;
    name: string;
    email: string;
  }[];
  hasErrors: boolean;
};

const parseCsvUsers = async (file: File): Promise<CsvPreview> => {
  const csv = await file.text();
  const rows = parseCSVContent(csv);

  if (rows.length === 0) {
    throw new Error("CSVが空です。");
  }

  const [headerRow, ...userRows] = rows;
  if (!headerRow) {
    throw new Error("CSVが空です。");
  }
  const normalizedHeaders = headerRow.map((header) =>
    header.trim().toLowerCase(),
  );
  const hasExpectedHeaders =
    normalizedHeaders.length === REQUIRED_HEADERS.length &&
    REQUIRED_HEADERS.every(
      (requiredHeader, index) => normalizedHeaders[index] === requiredHeader,
    );

  if (!hasExpectedHeaders) {
    throw new Error("ヘッダーは name,email の順で指定してください。");
  }

  const rawRows = userRows.map((row, index): Omit<PreviewRow, "errors"> => {
    // 行番号は1始まりで、ヘッダー行を含めない
    const rowNumber = index + 1;

    if (row.length !== REQUIRED_HEADERS.length) {
      throw new Error(
        `[${rowNumber}行目] 列数が不正です。name,email を指定してください。`,
      );
    }

    const [name = "", email = ""] = row;
    return {
      rowNumber,
      name: name.trim(),
      email: email.trim(),
    };
  });

  const previewRows: PreviewRow[] = rawRows.map((row) => {
    return { ...row, errors: [] };
  });

  const validationResult = bulkCreateUsersSchema.safeParse({
    users: rawRows,
  });

  if (!validationResult.success) {
    const globalErrors: string[] = [];
    for (const issue of validationResult.error.issues) {
      const [scope, index] = issue.path;
      if (scope === "users" && typeof index === "number") {
        previewRows[index]?.errors.push(issue.message);
      } else {
        globalErrors.push(issue.message);
      }
    }
    const firstGlobalError = globalErrors[0];
    if (firstGlobalError) {
      throw new Error(firstGlobalError);
    }
  }

  const validUsers = previewRows
    .filter((row) => row.errors.length === 0)
    .map((row) => {
      return {
        rowNumber: row.rowNumber,
        name: row.name,
        email: row.email,
      };
    });

  return {
    rows: previewRows,
    validUsers,
    hasErrors: previewRows.some((row) => row.errors.length > 0),
  };
};

export const useImportUsersForm = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [preview, setPreview] = useState<CsvPreview | null>(null);
  const [result, setResult] = useState<BulkCreateUsersResponseSchema | null>(
    null,
  );

  const handleFileChange = useCallback((nextFile: File | null) => {
    setFile(nextFile);
    setPreview(null);
    setResult(null);
    setErrorMessage(null);
  }, []);

  const handleCreatePreview = useCallback(async () => {
    if (!file || file.size === 0) {
      setErrorMessage("CSVファイルを選択してください。");
      setResult(null);
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setResult(null);

    try {
      const parsedPreview = await parseCsvUsers(file);
      setPreview(parsedPreview);
    } catch (error) {
      setErrorMessage(
        `CSVの解析に失敗しました。 ${error instanceof Error ? error.message : ""}`,
      );
    } finally {
      setLoading(false);
    }
  }, [file]);

  const handleSubmit = useCallback(async () => {
    if (!preview) {
      setErrorMessage("先にプレビューを作成してください。");
      return;
    }

    if (preview.hasErrors) {
      setErrorMessage(
        "エラーがあるため取り込みできません。CSVを修正してください。",
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setResult(null);

    try {
      const createdResult = await postBulkCreateUsers({
        users: preview.validUsers,
      });
      setResult(createdResult);
      window.alert(
        [
          "取り込み完了！",
          `対象 ${createdResult.total} 件 / 取り込み成功 ${createdResult.successCount} 件 / 取り込み失敗 ${createdResult.failedCount} 件`,
        ].join("\n"),
      );
    } catch (error) {
      window.alert(
        `取り込みに失敗しました。 ${error instanceof Error ? error.message : ""}`,
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [preview]);

  const downloadTemplate = useCallback(() => {
    const csv = buildCSVContent(
      [...REQUIRED_HEADERS],
      [["山田太郎", "taro@example.com"]],
    );
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "user-import-template.csv";
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }, []);

  return {
    preview,
    result,
    isSubmitting,
    isLoading,
    errorMessage,
    hasPreviewErrors: preview?.hasErrors ?? false,
    handleFileChange,
    handleCreatePreview,
    handleSubmit,
    downloadTemplate,
  };
};
