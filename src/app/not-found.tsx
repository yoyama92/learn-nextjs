import Link from "next/link";

import { SignOut } from "../components/auth/sign-out";

export default function NotFound() {
  return (
    <div className="flex flex-col gap-2 p-4">
      <h2 className="text-lg font-bold">Not Found</h2>
      <p>Could not find requested resource</p>
      <div className="flex flex-row gap-2">
        <div>
          <Link href="/" className="btn btn-outline">
            Return Home
          </Link>
        </div>
        <SignOut />
      </div>
    </div>
  );
}
