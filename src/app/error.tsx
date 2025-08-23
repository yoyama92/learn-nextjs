"use client"; // Error boundaries must be Client Components

import { ErrorPage } from "../components/_common/error";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorPage error={error} reset={reset} />;
}
