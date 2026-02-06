/**
 * ログイン不要でアクセス可能なパス
 */
export const publicPaths = /^\/(sign-in|reset-password)/;

/**
 * 管理者画面のパス
 */
export const adminPathReg = /^\/admin(?!\/sign-in)/;
