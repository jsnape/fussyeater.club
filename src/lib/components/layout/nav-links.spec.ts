import { describe, expect, it } from "vitest";
import { siteNavLinks } from "./nav-links";

describe("siteNavLinks", () => {
  it("includes the expected top-level routes", () => {
    expect(siteNavLinks).toEqual([
      { label: "Home", href: "/" },
      { label: "Design", href: "/design" }
    ]);
  });

  it("has unique href values", () => {
    const hrefs = siteNavLinks.map((link) => link.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });
});
