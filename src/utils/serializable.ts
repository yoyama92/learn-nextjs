/**
 * JSON の primitive（bigint は運用上事故りやすいので除外）
 */
type JsonPrimitive = string | number | boolean | null;

/**
 * JSON 値
 */
type JsonValue = JsonPrimitive | JsonObject | JsonArray;

/**
 * JSON 配列
 */
type JsonArray = JsonValue[];

/** JSON オブジェクト（プレーンオブジェクト想定） */
type JsonObject = { [key: string]: JsonValue };

/**
 * Server Actions の引数として安全寄りに使える型
 * - プレーンな JSON（配列/オブジェクト/プリミティブ）
 * - undefined は「省略」扱いで送ると落ちることがあるので原則使わない
 */
export type StrictSerializable = JsonValue;
