import { describe, expect, it } from "vitest";

import { buildAchievementStates, type AchievementProgressRow } from "@/data/achievements";

const row = (overrides: Partial<AchievementProgressRow>): AchievementProgressRow => ({
  simulationCode: "ibd-ipo",
  simulationStatus: "in_progress",
  offerAccepted: true,
  title: "默认任务",
  orderIndex: 0,
  status: "done",
  score: 80,
  submissionQuality: "pass",
  submittedAt: "2026-04-19T10:00:00.000Z",
  selfEvalSubmitted: true,
  ...overrides,
});

describe("buildAchievementStates", () => {
  it("解锁第一枚入场勋章", () => {
    const states = buildAchievementStates([row({ orderIndex: 0 })]);
    expect(states.find((item) => item.id === "entry")?.unlocked).toBe(true);
  });

  it("完成一整条模拟线后点亮 full-close", () => {
    const states = buildAchievementStates([
      row({ simulationCode: "ibd-ipo", simulationStatus: "completed", orderIndex: 0 }),
      row({ simulationCode: "ibd-ipo", simulationStatus: "completed", orderIndex: 1 }),
      row({ simulationCode: "ibd-ipo", simulationStatus: "completed", orderIndex: 2 }),
    ]);
    expect(states.find((item) => item.id === "full-close")?.unlocked).toBe(true);
  });

  it("三条线都至少完成一个任务后点亮 three-angles", () => {
    const states = buildAchievementStates([
      row({ simulationCode: "ibd-ipo", orderIndex: 0 }),
      row({ simulationCode: "pe-growth", orderIndex: 0, title: "投资备忘录" }),
      row({ simulationCode: "er-new-energy", orderIndex: 0, title: "行业框架" }),
    ]);
    expect(states.find((item) => item.id === "three-angles")?.unlocked).toBe(true);
  });

  it("根据高分任务解锁 working-paper 和 sector-insight", () => {
    const states = buildAchievementStates([
      row({ simulationCode: "ibd-ipo", orderIndex: 2, score: 88, title: "财务勾稽" }),
      row({ simulationCode: "er-new-energy", orderIndex: 1, score: 92, title: "赛道梳理" }),
    ]);
    expect(states.find((item) => item.id === "working-paper")?.unlocked).toBe(true);
    expect(states.find((item) => item.id === "sector-insight")?.unlocked).toBe(true);
  });
});
