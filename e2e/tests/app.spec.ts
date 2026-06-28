import { expect, test } from '@playwright/test';

test.describe('Dash Panel', () => {
  test.beforeEach(async ({ page }) => {
    page.on('pageerror', err => console.error('PAGE ERROR:', err.message));
    await page.goto('/');
    await page.waitForSelector('.grid');
    await page.waitForTimeout(500);
    const pinBtn = page.locator('header button').first();
    await pinBtn.click();
    await page.waitForTimeout(200);
  });

  test('app loads with default grid', async ({ page }) => {
    await expect(page).toHaveTitle('Dash Panel');
    await expect(page.locator('.grid > div')).toHaveCount(4);

    const filled = page.locator('.grid > div').filter({
      has: page.locator('.rounded-lg.shadow-sm')
    });
    await expect(filled).toHaveCount(3);
  });

  test('theme toggle switches between light and dark', async ({ page }) => {
    const html = page.locator('html');
    const themeBtn = page.locator('header button').nth(1);

    const isDark = await html.evaluate(el => el.classList.contains('dark'));
    await themeBtn.click();
    await page.waitForTimeout(300);
    const nowDark = await html.evaluate(el => el.classList.contains('dark'));
    expect(nowDark).toBe(!isDark);

    await themeBtn.click();
    await page.waitForTimeout(300);
    const backTo = await html.evaluate(el => el.classList.contains('dark'));
    expect(backTo).toBe(isDark);
  });

  test('card opens edit mode and saves content', async ({ page }) => {
    const firstCard = page.locator('.rounded-lg.shadow-sm').first();
    const editBtn = firstCard.locator('button').first();

    await editBtn.click({ force: true });

    const editable = firstCard.locator('[contenteditable]');
    await expect(editable).toBeVisible({ timeout: 3000 });

    await editable.evaluate(el => {
      el.textContent = 'Edited content';
    });

    const saveBtn = firstCard.locator('button').filter({ has: page.locator('.lucide-save') });
    await saveBtn.click();

    await expect(firstCard).toContainText('Edited content');
  });

  test('card editing cancel reverts content', async ({ page }) => {
    const firstCard = page.locator('.rounded-lg.shadow-sm').first();
    const originalText = await firstCard.textContent();

    const editBtn = firstCard.locator('button').first();
    await editBtn.click({ force: true });
    await expect(firstCard.locator('[contenteditable]')).toBeVisible({ timeout: 3000 });

    await firstCard.locator('[contenteditable]').evaluate(el => {
      el.textContent = 'Temporary change';
    });

    const cancelBtn = firstCard.locator('button').filter({ has: page.locator('.lucide-x') });
    await cancelBtn.click();

    await page.waitForTimeout(300);
    expect(await firstCard.textContent()).toContain(originalText!.trim().slice(0, 20));
  });

  test('delete card with confirmation and cancellation', async ({ page }) => {
    const firstCard = page.locator('.rounded-lg.shadow-sm').first();
    const deleteBtn = firstCard.locator('button').filter({ has: page.locator('.lucide-trash-2') });

    await deleteBtn.click({ force: true });

    const modal = page.locator('.fixed.inset-0.z-50');
    await expect(modal).toBeVisible({ timeout: 3000 });
    await expect(modal).toContainText('Delete card');

    await modal.getByText('Cancel').click();
    await page.waitForTimeout(300);
    await expect(modal).not.toBeVisible();
    await expect(firstCard).toBeVisible();
  });

  test('delete card with confirmation removes the card', async ({ page }) => {
    const firstCard = page.locator('.rounded-lg.shadow-sm').first();
    const deleteBtn = firstCard.locator('button').filter({ has: page.locator('.lucide-trash-2') });

    await deleteBtn.click({ force: true });

    const modal = page.locator('.fixed.inset-0.z-50');
    await expect(modal).toBeVisible({ timeout: 3000 });

    await modal.getByText('Confirm').click();
    await page.waitForTimeout(600);
    await expect(modal).not.toBeVisible();

    const remainingCards = await page.locator('.rounded-lg.shadow-sm').count();
    expect(remainingCards).toBe(2);
  });

  test('adds card to empty cell', async ({ page }) => {
    const emptyCell = page
      .locator('.grid > div')
      .filter({
        has: page.locator('.lucide-plus')
      })
      .first();

    await emptyCell.click();

    await page.waitForTimeout(300);
    const filled = page.locator('.grid > div').filter({
      has: page.locator('.rounded-lg.shadow-sm')
    });
    await expect(filled).toHaveCount(4);
  });

  test('changes column count', async ({ page }) => {
    const select = page.locator('header select').first();
    if ((await select.count()) === 0) return;

    await select.selectOption('2');
    await page.waitForTimeout(300);

    const cols = await page
      .locator('.grid')
      .evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length);
    expect(cols).toBe(2);
  });

  test('switches language to English', async ({ page }) => {
    const langBtn = page.locator('header button').nth(2);
    await expect(langBtn).toBeVisible({ timeout: 3000 });
    await langBtn.click();

    const dropdownOption = page
      .locator('.absolute.right-0.top-full button')
      .filter({ hasText: 'English' });
    await expect(dropdownOption).toBeVisible({ timeout: 3000 });
    await dropdownOption.click();
    await page.waitForTimeout(300);

    await expect(langBtn).toContainText('English');
  });

  test('reset dimensions equalises column widths', async ({ page }) => {
    const grid = page.locator('.grid');

    const resizeHandle = page.locator('[style*="right: -8px"][style*="width: 8px"]').first();
    const box = await resizeHandle.boundingBox();
    if (box) {
      await page.mouse.move(box.x + 4, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + 4 + 60, box.y + box.height / 2);
      await page.mouse.up();
      await page.waitForTimeout(200);
    }

    const resetBtn = page
      .locator('header button')
      .filter({ has: page.locator('.lucide-rotate-ccw') });
    await resetBtn.click();
    await page.waitForTimeout(300);

    const widths = await grid.evaluate(el => getComputedStyle(el).gridTemplateColumns);
    const parsed = widths.split(' ').map(w => parseFloat(w));
    const allEqual = parsed.every(w => Math.abs(w - parsed[0]) < 0.5);
    expect(allEqual).toBe(true);
  });

  test('responsive grid on phone viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);

    const cols = await page
      .locator('.grid')
      .evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length);
    expect(cols).toBe(1);
  });

  test('destructive reset opens confirmation modal', async ({ page }) => {
    const trashBtn = page.locator('header button').filter({
      has: page.locator('.lucide-trash')
    });
    await trashBtn.click();

    const modal = page.locator('.fixed.inset-0.z-50');
    await expect(modal).toBeVisible({ timeout: 3000 });
    await expect(modal).toContainText('Reset grid');
  });
});
