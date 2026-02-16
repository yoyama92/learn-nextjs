import { signOut } from "../../actions/auth";

export const SignOut = () => {
  return (
    <form action={signOut}>
      <button type="submit" className="btn btn-outline">
        ログアウト
      </button>
    </form>
  );
};
