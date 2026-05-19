import { describe, test, expect, beforeEach } from "vitest";
import { setCookie, getCookie } from "./cookies.jsx";

describe("cookies utility", () => {
  beforeEach(() => {
    document.cookie.split(";").forEach((c) => {
      const name = c.split("=")[0].trim();
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
  });

  test("setCookie and getCookie work together", () => {
    setCookie("testKey", "testValue");
    expect(getCookie("testKey")).toBe("testValue");
  });

  test("getCookie returns empty string for non-existent cookie", () => {
    expect(getCookie("nonExistent")).toBe("");
  });

  test("setCookie overwrites existing cookie", () => {
    setCookie("myKey", "firstValue");
    setCookie("myKey", "secondValue");
    expect(getCookie("myKey")).toBe("secondValue");
  });

  test("setCookie encodes special characters", () => {
    setCookie("special", "hello world&foo=bar");
    expect(getCookie("special")).toBe("hello world&foo=bar");
  });

  test("setCookie accepts custom days parameter", () => {
    setCookie("expiring", "value", 30);
    expect(getCookie("expiring")).toBe("value");
  });
});
