"use client";

import { createContext, type ReactNode, useContext } from "react";

import type { PublicEnvStore } from "../../lib/env";

const EnvContext = createContext<PublicEnvStore | undefined>(undefined);

type EnvProviderProps = {
  children: ReactNode;
  envStore: PublicEnvStore;
};

export const EnvProvider: React.FC<EnvProviderProps> = ({
  children,
  envStore,
}) => {
  return <EnvContext value={envStore}>{children}</EnvContext>;
};

/**
 * 環境変数コンテキストを利用するためのカスタムフック
 */
export const useEnv = (): PublicEnvStore => {
  const context = useContext(EnvContext);
  if (!context) {
    throw new Error("useEnv must be used within a EnvProvider");
  }
  return context;
};
