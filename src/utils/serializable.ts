/**
 * JSON の primitive（bigint は運用上事故りやすいので除外推奨）
 */
export type JsonPrimitive = string | number | boolean | null;

/**
 * JSON 値
 */
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;

/**
 * JSON 配列
 */
export type JsonArray = JsonValue[];

/** JSON オブジェクト（プレーンオブジェクト想定） */
export type JsonObject = { [key: string]: JsonValue };

/**
 * Server Actions の引数として安全寄りに使える型
 * - プレーンな JSON（配列/オブジェクト/プリミティブ）
 * - undefined は「省略」扱いで送ると落ちることがあるので原則使わない運用推奨
 */
export type StrictSerializable = JsonValue;

/**
 * “入力”としてよく使う形（オブジェクト限定にしたい場合）
 */
export type StrictSerializableObject = JsonObject;
