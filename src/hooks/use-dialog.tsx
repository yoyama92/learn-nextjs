"use client";

import { type RefObject, useEffect, useRef } from "react";

/**
 * ダイアログを操作するためのカスタムフック
 * @param param.onClose ダイアログが閉じたときに呼び出す関数
 */
export const useDialog = ({
  onClose,
}: {
  onClose: () => void;
}): RefObject<HTMLDialogElement | null> => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const handleClose = () => {
      onClose();
    };
    if (dialogRef.current) {
      dialogRef.current.addEventListener("close", handleClose);
    }

    return () => {
      if (dialogRef.current) {
        dialogRef.current.removeEventListener("close", handleClose);
      }
    };
  }, [onClose]);

  return dialogRef;
};
