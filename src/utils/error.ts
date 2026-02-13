export function unauthorized(): never {
  throw new UnauthorizedError();
}

export function forbidden(): never {
  throw new ForbiddenError();
}

export class ForbiddenError extends Error {
  static readonly MESSAGE = "認可エラー";
  constructor() {
    super(ForbiddenError.MESSAGE);
  }
}

export class UnauthorizedError extends Error {
  static readonly MESSAGE = "認証エラー";
  constructor() {
    super(UnauthorizedError.MESSAGE);
  }
}

export class ActionError extends Error {
  constructor(public actionName: string) {
    super("Action failed");
    this.name = "ActionError";
  }
}
