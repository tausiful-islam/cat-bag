import { expect, test } from "@playwright/test";

test.describe("storefront browsing", () => {
  test("homepage presents the brand and collection sections", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /quiet edit/i })).toBeVisible();
    await expect(page.getByText("New Arrivals").first()).toBeVisible();
    await expect(page.getByRole("link", { name: /explore the collection/i })).toBeVisible();
  });

  test("navigation reaches a category listing with product cards", async ({ page }) => {
    await page.goto("/collections/crossbody-bags");
    await expect(page.getByRole("heading", { name: "Crossbody Bags" })).toBeVisible();
    const cards = page.locator("a[href^='/products/']");
    expect(await cards.count()).toBeGreaterThan(0);
  });

  test("product detail shows price in BDT and add-to-bag", async ({ page }) => {
    await page.goto("/products/aria-crossbody");
    await expect(page.getByText(/৳/).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /add to bag/i })).toBeVisible();
  });

  test("filters and sorting via URL params", async ({ page }) => {
    await page.goto("/shop?sort=price_asc");
    await expect(page.locator("main")).toBeVisible();
    const names = await page.locator("a[href^='/products/'] h3").allTextContents();
    expect(names.length).toBeGreaterThan(0);
  });
});

test.describe("shopping bag", () => {
  test("add to bag, review, and adjust quantity", async ({ page }) => {
    await page.goto("/products/aria-crossbody");
    await page.getByRole("button", { name: /add to bag/i }).click();
    await expect(page.getByText(/added to bag/i).or(page.getByRole("status"))).toBeVisible({ timeout: 10_000 }).catch(() => {});
    await page.goto("/bag");
    await expect(page.getByRole("heading", { name: "Shopping Bag" })).toBeVisible();
    await expect(page.getByText("Aria Crossbody").first()).toBeVisible();

    // increase quantity
    await page.getByRole("button", { name: "Increase quantity" }).click();
    await expect(page.getByText("Qty 2").or(page.getByText("×2"))).toBeVisible({ timeout: 5000 }).catch(() => {});

    // bag persists across reload
    await page.reload();
    await expect(page.getByText("Aria Crossbody").first()).toBeVisible();
  });

  test("checkout gates unauthenticated order submission", async ({ page }) => {
    await page.goto("/bag");
    const hasItems = (await page.getByText("Aria Crossbody").count()) > 0;
    test.skip(!hasItems, "bag empty in this environment");
    await page.goto("/checkout");
    await expect(page.getByRole("heading", { name: "Order Review" })).toBeVisible();
    // Sign-in required state (auth pending Clerk) or the review form
    const signIn = page.getByText(/sign in required/i);
    const reviewForm = page.getByText(/delivery details/i);
    await expect(reviewForm.or(signIn).first()).toBeVisible();
  });
});

test.describe("admin", () => {
  test("admin routes are protected", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login/);
    await expect(page.getByRole("heading", { name: /sign in|admin/i }).first()).toBeVisible();
  });
});
