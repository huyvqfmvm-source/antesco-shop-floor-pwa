import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const { chromium } = await import('file:///C:/Users/vuqua/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.60.0/node_modules/playwright/index.mjs');

const baseUrl = process.env.BASE_URL || 'https://readdy.cc/preview/26f26c3b-da8a-45c1-a21b-b3d5ca5c1b26/11135740';
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(scriptDir, 'screenshots_first5_slides');
const chromePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const accounts = {
  worker: { username: 'an.nguyen', password: '123456' },
  warehouse: { username: 'binh.tran', password: '123456' },
  qm: { username: 'cuong.le', password: '123456' },
  manager: { username: 'dung.pham', password: '123456' },
  tech: { username: 'em.hoang', password: '123456' },
  admin: { username: 'admin', password: 'admin123' },
};

const shots = [
  { file: '01_Overview_HomeAdmin_Admin.png', account: 'admin', route: '/home', slide: 1, note: 'Home Admin tổng quan hệ thống' },
  { file: '01_Overview_HomeThuKho_ThuKho.png', account: 'warehouse', route: '/home', slide: 1, note: 'Home Thủ kho thay đổi theo role' },
  { file: '01_Overview_ProductionModule_Admin.png', account: 'admin', route: '/production', slide: 1, note: 'Module Sản xuất' },

  { file: '02_Common_Login.png', route: '/login', slide: 2, note: 'Màn hình Login' },
  { file: '02_Common_SampleAccounts.png', route: '/login/sample-accounts', slide: 2, note: 'Tài khoản mẫu' },
  { file: '02_Common_HomeNavigation.png', account: 'admin', route: '/home', slide: 2, note: 'Home navigation sau login' },
  { file: '02_Common_ScanAction.png', account: 'warehouse', route: '/outbound/fefo-picking/OD-2026-0098', slide: 2, note: 'Màn có thao tác scan/QR' },
  { file: '02_Common_OfflineSync.png', account: 'admin', route: '/settings', slide: 2, note: 'Online/Offline và SAP mock', afterGoto: async (page) => {
    await page.getByText('Trạng thái mạng (Mock SAP)').scrollIntoViewIfNeeded();
    await clickNearestText(page, /Offline kho lạnh/i);
  } },

  { file: '03_Production_Overview_Admin.png', account: 'admin', route: '/production', slide: 3, note: 'Sản xuất tổng quan Admin' },
  { file: '03_Production_Detail_Admin.png', account: 'admin', route: '/production/detail/10000456', slide: 3, note: 'Chi tiết lệnh Admin' },
  { file: '03_Production_Release_QuanDoc.png', account: 'manager', route: '/production/detail/10000456', slide: 3, note: 'Phát lệnh Quản đốc' },
  { file: '03_Production_WIP_CongNhanSX.png', account: 'worker', route: '/production/wip/10000456', slide: 3, note: 'Ghi WIP Công nhân' },
  { file: '03_Production_PalletBTP_CongNhanSX.png', account: 'worker', route: '/production/pallet/10000456', slide: 3, note: 'Tạo pallet BTP' },
  { file: '03_Production_Utility_KyThuat.png', account: 'tech', route: '/production/utility', slide: 3, note: 'Utility Kỹ thuật' },

  { file: '04_Warehouse_InboundOverview_ThuKho.png', account: 'warehouse', route: '/inbound', slide: 4, note: 'Inbound overview' },
  { file: '04_Warehouse_ReceiveRM_ThuKho.png', account: 'warehouse', route: '/inbound/receive-rm', slide: 4, note: 'Nhận nguyên liệu' },
  { file: '04_Warehouse_FGReceiving_ThuKho.png', account: 'warehouse', route: '/inbound/fg-receiving', slide: 4, note: 'Nhận thành phẩm' },
  { file: '04_Warehouse_Putaway_ThuKho.png', account: 'warehouse', route: '/inbound/putaway', slide: 4, note: 'Putaway' },
  { file: '04_Warehouse_OutboundOverview_ThuKho.png', account: 'warehouse', route: '/outbound', slide: 4, note: 'Outbound overview' },
  { file: '04_Warehouse_FEFOPicking_ThuKho.png', account: 'warehouse', route: '/outbound/fefo-picking/OD-2026-0098', slide: 4, note: 'FEFO Picking' },
  { file: '04_Warehouse_LoadingContainer_ThuKho.png', account: 'warehouse', route: '/outbound/container-loading/OD-2026-0102', slide: 4, note: 'Loading container' },
  { file: '04_Warehouse_InternalTransfer_ThuKho.png', account: 'warehouse', route: '/internal-qm/transfer-order', slide: 4, note: 'Transfer nội bộ' },

  { file: '05_RBAC_Admin.png', account: 'admin', route: '/settings', slide: 5, note: 'Admin RBAC', afterGoto: async (page) => {
    await page.getByText('Admin Role Control').scrollIntoViewIfNeeded();
  } },
  { file: '05_RBAC_SampleAccounts.png', route: '/login/sample-accounts', slide: 5, note: 'Danh sách role' },
  { file: '05_RBAC_Home_Admin.png', account: 'admin', route: '/home', slide: 5, note: 'Home Admin toàn quyền' },
  { file: '05_RBAC_Home_QuanDoc.png', account: 'manager', route: '/home', slide: 5, note: 'Home Quản đốc' },
  { file: '05_RBAC_Home_ThuKho.png', account: 'warehouse', route: '/home', slide: 5, note: 'Home Thủ kho' },
  { file: '05_RBAC_RestrictedAction.png', account: 'warehouse', route: '/outbound/fefo-picking/OD-2026-0098', slide: 5, note: 'Hạn chế quyền Override FEFO' },
  { file: '05_RBAC_SensitivePermission.png', account: 'manager', route: '/outbound/fefo-picking/OD-2026-0098', slide: 5, note: 'Quyền nhạy cảm Override FEFO' },
];

async function login(page, accountKey) {
  const account = accounts[accountKey];
  await page.goto(`${baseUrl}/login`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.getByPlaceholder('Nhập tên đăng nhập').fill(account.username);
  await page.getByPlaceholder('Nhập mật khẩu').fill(account.password);
  await page.getByRole('button', { name: /Đăng nhập/i }).click();
  await page.waitForURL(/\/home$/, { timeout: 15000 });
  await settle(page);
}

async function settle(page) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(900);
}

async function clickNearestText(page, pattern) {
  const buttons = page.locator('button').filter({ hasText: pattern });
  if (await buttons.count()) {
    await buttons.first().click({ timeout: 2000 }).catch(() => {});
    await page.waitForTimeout(350);
    return;
  }
  const candidates = page.locator('button, label, [role="button"], [role="switch"], div');
  const count = await candidates.count();
  for (let i = 0; i < Math.min(count, 220); i += 1) {
    const el = candidates.nth(i);
    const text = await el.innerText().catch(() => '');
    if (pattern.test(text)) {
      await el.click({ timeout: 1500 }).catch(() => {});
      await page.waitForTimeout(350);
      return;
    }
  }
}

async function capture(browser, shot) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    locale: 'vi-VN',
  });
  const page = await context.newPage();
  page.setDefaultTimeout(12000);
  const errors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(err.message));
  try {
    if (shot.account) await login(page, shot.account);
    await page.goto(`${baseUrl}${shot.route}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await settle(page);
    if (shot.afterGoto) {
      await shot.afterGoto(page);
      await settle(page);
    }
    await page.screenshot({ path: path.join(outDir, shot.file), fullPage: false });
    const visibleSample = (await page.locator('body').innerText().catch(() => '')).slice(0, 240).replace(/\s+/g, ' ');
    return { ...shot, ok: true, finalUrl: page.url(), visibleSample, errors: errors.slice(0, 5) };
  } catch (error) {
    await page.screenshot({ path: path.join(outDir, shot.file.replace('.png', '_FAILED.png')), fullPage: false }).catch(() => {});
    return { ...shot, ok: false, finalUrl: page.url(), error: error.message, errors: errors.slice(0, 5) };
  } finally {
    await context.close();
  }
}

await fs.mkdir(outDir, { recursive: true });
const shotFilter = process.env.SHOT_FILTER;
if (!shotFilter) {
  const old = await fs.readdir(outDir).catch(() => []);
  for (const file of old) {
    if (file.endsWith('.png') || file.endsWith('.json') || file.endsWith('.csv')) {
      await fs.unlink(path.join(outDir, file)).catch(() => {});
    }
  }
}

const browser = await chromium.launch({ headless: true, executablePath: chromePath });
const results = [];
const selectedShots = shotFilter ? shots.filter((shot) => shot.file.includes(shotFilter)) : shots;
for (const shot of selectedShots) {
  const result = await capture(browser, shot);
  results.push(result);
  console.log(`${result.ok ? 'OK' : 'FAIL'} ${result.file}`);
}
await browser.close();

await fs.writeFile(path.join(outDir, shotFilter ? `capture-report-${shotFilter}.json` : 'capture-report.json'), JSON.stringify(results, null, 2), 'utf8');
const csv = [
  'Slide,TenAnh,Role,TrangThai,Note,FinalUrl',
  ...results.map((r) => [
    r.slide,
    r.file,
    r.account || 'All',
    r.ok ? 'Đã chụp' : 'Lỗi',
    r.ok ? r.note : `${r.note} - ${r.error}`,
    r.finalUrl || '',
  ].map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')),
].join('\n');
if (!shotFilter) {
  await fs.writeFile(path.join(outDir, 'tracking_first5.csv'), csv, 'utf8');
}
console.log(`DONE total=${results.length} failed=${results.filter((r) => !r.ok).length} outDir=${outDir}`);
