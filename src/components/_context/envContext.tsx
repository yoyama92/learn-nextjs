"use client";

import { createContext, type ReactNode, useContext } from "react";

import type { PublicEnvStore } from "../../lib/env";

export interface TabContextType {
  activeTab: number;
  setActiveTab: (index: number) => void;
}

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

export const useEnv = (): PublicEnvStore => {
  const context = useContext(EnvContext);
  if (!context) {
    throw new Error("useEnv must be used within a EnvProvider");
  }
  return context;
};
