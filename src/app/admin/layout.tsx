import { SignOut } from "@/components/auth/sign-out";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="p-4 flex flex-col gap-4 h-screen">
      <SignOut />
      {children}
    </div>
  );
}
