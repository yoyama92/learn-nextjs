/**
 * ログイン不要でアクセス可能なパス
 */
export const publicPaths = /^\/(sign-in|password-reset|admin\/sign-in)/;

/**
 * 管理者画面のパス
 */
export const adminPathReg = /^\/admin(?!\/sign-in)/;
