import { Header } from "../_common/header";

export const AuthenticatedLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <>
      <Header />
      <div className="max-sm:p-4 p-6 flex flex-col gap-4">{children}</div>
    </>
  );
};
