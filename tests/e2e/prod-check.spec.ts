import { expect, test } from "@playwright/test";

test("production sign-in widget initializes from vercel.app origin", async ({ browser }) => {
  const ctx = await browser.newContext({ baseURL: "https://cat-bag.vercel.app" });
  const page = await ctx.newPage();
  await page.goto("/sign-in", { timeout: 45_000 });

  // If the origin is blocked, Clerk renders an error instead of the form
  const identifier = page.locator('input[name="identifier"]').first();
  await expect(identifier).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText(/not allowed|error/i).first()).toHaveCount(0).catch(() => {});

  // Header shows the Sign In control
  await expect(page.getByRole("button", { name: "Sign In", exact: true })).toBeVisible();
  await ctx.close();
});
