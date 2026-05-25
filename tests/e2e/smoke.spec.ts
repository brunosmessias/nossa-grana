import { expect, test } from "@playwright/test"

test("home renders project title", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByRole("heading", { name: "Nossa Grana V2" })).toBeVisible()
})
