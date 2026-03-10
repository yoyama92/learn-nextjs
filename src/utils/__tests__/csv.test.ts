import { describe, expect, test } from "vitest";
import { buildCSVContent, parseCSVContent } from "../csv";

describe("buildCSVContent", () => {
  test("正常系", () => {
    const header = ["column1", "column2"];
    const content = [
      ["column1_1", "column2_1"],
      ["column2_1", "column2_1"],
    ];
    expect(buildCSVContent(header, content)).toBe(
      '"column1","column2"\n"column1_1","column2_1"\n"column2_1","column2_1"\n',
    );
  });

  test("異常系（カラムの数が不一致・カラムが多い）", () => {
    const header = ["column1", "column2", "column3"];
    const content = [
      ["column1_1", "column2_1", "column3_1"],
      ["column2_1", "column2_1"],
    ];
    expect(() => buildCSVContent(header, content)).toThrow();
  });

  test("異常系（カラムの数が不一致・カラムが少ない）", () => {
    const header = ["column1"];
    const content = [
      ["column1_1", "column2_1", "column3_1"],
      ["column2_1", "column2_1"],
    ];
    expect(() => buildCSVContent(header, content)).toThrow();
  });
});

describe("parseCSVContent", () => {
  test("正常系", () => {
    const csv = '"name","email"\n"alice","alice@example.com"\n';
    expect(parseCSVContent(csv)).toEqual([
      ["name", "email"],
      ["alice", "alice@example.com"],
    ]);
  });

  test("ダブルクォートのエスケープをパースできる", () => {
    const csv = '"name","email"\n"alice ""A""","alice@example.com"\n';
    expect(parseCSVContent(csv)).toEqual([
      ["name", "email"],
      ['alice "A"', "alice@example.com"],
    ]);
  });

  test("クォートが閉じられていない場合はエラー", () => {
    const csv = '"name","email"\n"alice","alice@example.com';
    expect(() => parseCSVContent(csv)).toThrow("CSVのパースに失敗しました。");
  });
});
