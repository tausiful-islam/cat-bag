import { expect, test } from "@playwright/test";

const EMAIL = "tausif+clerk_test@hotmail.com";

test.describe("authenticated order flow", () => {
  test("sign in, add to bag, place order", async ({ page }) => {
    test.setTimeout(180_000);

    // 1. Sign in via Clerk
    await page.goto("/sign-in");
    const identifier = page.locator('input[name="identifier"]').first();
    await identifier.waitFor({ state: "visible", timeout: 30_000 });
    await identifier.fill(EMAIL);
    const pwField = page.locator('input[name="password"]').first();
    await pwField.fill(String(process.env.TEST_PASSWORD));
    await pwField.press("Enter");

    // Email verification code step (dev instance accepts 424242)
    const codeField = page
      .getByLabel(/enter verification code/i)
      .or(page.getByPlaceholder(/enter verification code/i))
      .first();
    await codeField.waitFor({ state: "visible", timeout: 45_000 });
    await codeField.click();
    await codeField.pressSequentially("424242", { delay: 120 });
    await page.waitForTimeout(1_500);
    await codeField.press("Enter");

    // Signed in: navigates away from /sign-in and avatar appears
    await page.waitForURL(url => !url.pathname.startsWith("/sign-in"), { timeout: 40_000 });
    await expect(
      page.locator("[class*='userButton']").first(),
    ).toBeVisible({ timeout: 40_000 });

    // 2. Add a product to the bag
    await page.goto("/products/odessa-tote");
    await page.getByRole("button", { name: /add to bag/i }).click();
    await page.goto("/bag");
    await expect(page.getByText("Odessa Tote").first()).toBeVisible();

    // 3. Checkout as a signed-in customer (form, not the sign-in gate)
    await page.goto("/checkout");
    await expect(page.getByText(/delivery details/i).first()).toBeVisible({ timeout: 20_000 });
    await page.locator("#co-name").fill("Test Customer");
    await page.locator("#co-phone").fill("01712345678");
    await page.locator("#co-address").fill("House 12, Road 5, Banani");
    await page.locator("#co-district").click();
    await page.getByRole("option", { name: "Dhaka" }).click();

    // 4. Confirm order
    await page.getByRole("button", { name: /confirm order/i }).click();
    await expect(page.getByRole("heading", { name: "Thank you" })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(/Order Reference/i)).toBeVisible();

    // 5. Order appears in account history
    await page.goto("/account");
    await expect(page.getByText("Order History").first()).toBeVisible();
    await expect(page.getByText(/CB-\d{6}-\w{6}/).first()).toBeVisible();
  });
});
