import { Header } from "../_common/header";

export const AuthenticatedLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <>
      <Header />
      <div className="p-4 flex flex-col gap-4">{children}</div>
    </>
  );
};
