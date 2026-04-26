import { describe, expect, it } from "vitest";
import {
  galleryCategories,
  navLinks,
  newsCategories,
  noticeIcons,
  noticeTypes,
  toneOptions,
  workTypes,
} from "@/lib/site-config";

describe("site configuration", () => {
  it("keeps public navigation paths unique", () => {
    const hrefs = navLinks.map((link) => link.href);

    expect(new Set(hrefs).size).toBe(hrefs.length);
    expect(hrefs).not.toContain("/admin");
  });

  it("provides option lists used by the admin forms", () => {
    expect(newsCategories.length).toBeGreaterThan(0);
    expect(galleryCategories.length).toBeGreaterThan(0);
    expect(workTypes.length).toBeGreaterThan(0);
    expect(noticeTypes.length).toBeGreaterThan(0);
    expect(noticeIcons).toEqual(expect.arrayContaining(["alert", "star", "info", "megaphone"]));
    expect(toneOptions.every((tone) => tone.includes("from-") && tone.includes("to-"))).toBe(true);
  });
});
