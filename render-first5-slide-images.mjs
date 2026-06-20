import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const { chromium } = await import('file:///C:/Users/vuqua/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.60.0/node_modules/playwright/index.mjs');

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const assetDir = path.join(scriptDir, 'screenshots_first5_slides');
const outDir = path.join(scriptDir, 'generated_slide_images_first5');
const chromePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const imageCache = new Map();
const img = (name) => {
  if (!imageCache.has(name)) {
    const bytes = fsSync.readFileSync(path.join(assetDir, name));
    imageCache.set(name, `data:image/png;base64,${bytes.toString('base64')}`);
  }
  return imageCache.get(name);
};

const commonCss = `
  :root {
    --green: #16a34a;
    --green-dark: #087c3a;
    --ink: #101828;
    --muted: #667085;
    --line: #d9e2ec;
    --bg: #f5f7f8;
    --card: #ffffff;
    --orange: #f97316;
    --blue: #2563eb;
    --slate: #344054;
    --red: #dc2626;
  }
  * { box-sizing: border-box; }
  body { margin: 0; background: #e5e7eb; font-family: Arial, "Helvetica Neue", sans-serif; color: var(--ink); }
  .slide {
    width: 1024px;
    height: 768px;
    background:
      radial-gradient(circle at 96% 4%, rgba(22, 163, 74, .08), transparent 210px),
      linear-gradient(180deg, #ffffff 0%, var(--bg) 100%);
    padding: 34px 38px 26px;
    position: relative;
    overflow: hidden;
  }
  .topline { height: 6px; width: 138px; border-radius: 999px; background: var(--green); margin-bottom: 14px; }
  .title { font-size: 34px; line-height: 1.08; margin: 0; font-weight: 800; letter-spacing: 0; }
  .subtitle { margin: 8px 0 0; color: var(--muted); font-size: 17px; line-height: 1.35; }
  .footer { position: absolute; left: 38px; right: 38px; bottom: 18px; display: flex; justify-content: space-between; align-items: center; color: #98a2b3; font-size: 12px; }
  .brand { color: var(--green-dark); font-weight: 800; }
  .grid { display: grid; gap: 16px; }
  .card {
    background: rgba(255,255,255,.92);
    border: 1px solid #e6ebef;
    border-radius: 18px;
    box-shadow: 0 10px 28px rgba(16, 24, 40, .07);
  }
  .label { color: var(--green-dark); font-weight: 800; font-size: 12px; text-transform: uppercase; letter-spacing: .04em; }
  .small { font-size: 13px; line-height: 1.35; color: var(--muted); }
  .bullets { margin: 0; padding-left: 18px; color: var(--slate); font-size: 15px; line-height: 1.45; }
  .bullets li { margin: 6px 0; }
  .phone {
    background: #fff;
    border: 8px solid #111827;
    border-radius: 26px;
    overflow: hidden;
    box-shadow: 0 14px 26px rgba(16, 24, 40, .16);
  }
  .phone img { width: 100%; height: 100%; object-fit: contain; display: block; background: white; }
  .phone.soft { border-width: 5px; border-radius: 20px; }
  .thumb-label {
    text-align: center;
    font-size: 12px;
    color: var(--slate);
    font-weight: 700;
    margin-top: 6px;
  }
  .pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border-radius: 999px;
    background: #ecfdf3;
    color: var(--green-dark);
    border: 1px solid #bbf7d0;
    padding: 7px 11px;
    font-size: 13px;
    font-weight: 800;
  }
  .flow { display: flex; align-items: center; gap: 10px; }
  .flow .step {
    flex: 1;
    min-height: 58px;
    border-radius: 16px;
    background: #fff;
    border: 1px solid #e2e8f0;
    padding: 10px 12px;
    font-size: 13px;
    line-height: 1.25;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
  }
  .arrow { color: #94a3b8; font-weight: 900; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border-bottom: 1px solid #e6ebef; padding: 8px 9px; text-align: left; vertical-align: top; }
  th { color: var(--green-dark); font-size: 12px; text-transform: uppercase; letter-spacing: .03em; }
  td { font-size: 13px; line-height: 1.25; color: #344054; }
`;

function phoneBlock(file, label, cls = '', style = '') {
  return `
    <div>
      <div class="phone soft ${cls}" style="${style}"><img src="${img(file)}" /></div>
      <div class="thumb-label">${label}</div>
    </div>
  `;
}

const slides = [
  {
    name: 'slide_01_tong_quan_cau_truc.png',
    html: `
      <section class="slide">
        <div class="topline"></div>
        <h1 class="title">Tổng quan cấu trúc mô tả<br/>App Kho & Sản xuất</h1>
        <p class="subtitle">Tài liệu được tổ chức từ tổng quan đến chi tiết: phân hệ, vai trò và luồng nghiệp vụ.</p>
        <div class="grid" style="grid-template-columns: 1.18fr .82fr; margin-top: 26px;">
          <div class="card" style="padding: 22px;">
            <div class="label">Cấu trúc mô tả</div>
            <div class="flow" style="margin-top: 16px;">
              <div class="step" style="background:#ecfdf3;border-color:#bbf7d0;">Phân hệ<br/><span class="small">SX · NK · XK · QM · Admin</span></div>
              <div class="arrow">→</div>
              <div class="step" style="background:#eff6ff;border-color:#bfdbfe;">Vai trò<br/><span class="small">Admin · Quản đốc · Thủ kho</span></div>
              <div class="arrow">→</div>
              <div class="step" style="background:#fff7ed;border-color:#fed7aa;">Chức năng / luồng<br/><span class="small">Scan · WIP · FEFO · RBAC</span></div>
            </div>
            <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:14px;margin-top:20px;">
              <div class="card" style="padding:14px;box-shadow:none;"><div class="label">Mỗi slide trả lời</div><ul class="bullets"><li>Mục đích màn hình</li><li>Luồng thao tác chính</li><li>Role & quyền</li></ul></div>
              <div class="card" style="padding:14px;box-shadow:none;"><div class="label">Điểm review</div><ul class="bullets"><li>Đã đúng quy trình</li><li>Thiếu dữ liệu test</li><li>Cần xác nhận nghiệp vụ</li></ul></div>
            </div>
            <div style="margin-top:20px;" class="pill">Trọng tâm: mô tả hiện trạng app, không đi sâu từng field nhỏ</div>
          </div>
          <div class="card" style="padding:16px;">
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;">
              ${phoneBlock('01_Overview_HomeAdmin_Admin.png', 'Home Admin')}
              ${phoneBlock('01_Overview_HomeThuKho_ThuKho.png', 'Home Thủ kho')}
              ${phoneBlock('01_Overview_ProductionModule_Admin.png', 'Module SX')}
            </div>
            <p class="small" style="margin:18px 2px 0;">Ảnh minh họa cho thấy app có nhiều role, nhiều phân hệ và cách điều hướng khác nhau theo quyền.</p>
          </div>
        </div>
        <div class="footer"><span class="brand">ANTESCO</span><span>App Kho & Sản xuất - Review hiện trạng</span></div>
      </section>
    `,
  },
  {
    name: 'slide_02_chuc_nang_chung.png',
    html: `
      <section class="slide">
        <div class="topline"></div>
        <h1 class="title">Chức năng chung toàn hệ thống</h1>
        <p class="subtitle">Login, tài khoản mẫu, home theo role, scan QR/barcode và trạng thái online/offline.</p>
        <div class="flow" style="margin-top:20px;">
          ${['Login','Tài khoản mẫu','Home theo role','Scan QR / Barcode','Offline / Sync'].map((s, i) => `<div class="step">${i + 1}. ${s}</div>${i < 4 ? '<div class="arrow">→</div>' : ''}`).join('')}
        </div>
        <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:11px;margin-top:22px;">
          ${phoneBlock('02_Common_Login.png', 'Login')}
          ${phoneBlock('02_Common_SampleAccounts.png', 'Role mẫu')}
          ${phoneBlock('02_Common_HomeNavigation.png', 'Home')}
          ${phoneBlock('02_Common_ScanAction.png', 'Scan')}
          ${phoneBlock('02_Common_OfflineSync.png', 'Offline')}
        </div>
        <div class="grid" style="grid-template-columns: 1fr 1fr 1fr; margin-top:22px;">
          <div class="card" style="padding:14px;"><div class="label">Điểm vào</div><p class="small">Login hiện dùng mock account; cần xác nhận auth thật khi triển khai.</p></div>
          <div class="card" style="padding:14px;"><div class="label">Điều hướng</div><p class="small">Home và quick action thay đổi theo role, nhà máy và phạm vi quyền.</p></div>
          <div class="card" style="padding:14px;"><div class="label">Đồng bộ</div><p class="small">Offline kho lạnh/SAP mock cần test luồng queue và lỗi đồng bộ.</p></div>
        </div>
        <div class="footer"><span class="brand">ANTESCO</span><span>App Kho & Sản xuất - Review hiện trạng</span></div>
      </section>
    `,
  },
  {
    name: 'slide_03_summary_san_xuat.png',
    html: `
      <section class="slide">
        <div class="topline"></div>
        <h1 class="title">Summary phân hệ Sản xuất</h1>
        <p class="subtitle">Từ lệnh sản xuất đến WIP, Pallet BTP và ghi nhận tiện ích theo ca.</p>
        <div class="flow" style="margin-top:18px;">
          ${['Tổng quan lệnh','Chi tiết PO','Phát lệnh','Ghi WIP','Pallet BTP','Utility'].map((s, i) => `<div class="step" style="font-size:12px;">${s}</div>${i < 5 ? '<div class="arrow">→</div>' : ''}`).join('')}
        </div>
        <div class="grid" style="grid-template-columns: .98fr 1.02fr; margin-top:18px;">
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;">
            ${phoneBlock('03_Production_Overview_Admin.png', 'Overview')}
            ${phoneBlock('03_Production_Detail_Admin.png', 'Detail PO')}
            ${phoneBlock('03_Production_Release_QuanDoc.png', 'Phát lệnh')}
            ${phoneBlock('03_Production_WIP_CongNhanSX.png', 'WIP')}
            ${phoneBlock('03_Production_PalletBTP_CongNhanSX.png', 'Pallet BTP')}
            ${phoneBlock('03_Production_Utility_KyThuat.png', 'Utility')}
          </div>
          <div class="card" style="padding:16px;">
            <div class="label">Chức năng chính & điểm review</div>
            <table style="margin-top:10px;">
              <tr><th>Chức năng</th><th>Role chính</th><th>Ghi chú</th></tr>
              <tr><td>Tổng quan / Chi tiết PO</td><td>Admin, Quản đốc</td><td>Đối chiếu trạng thái PO</td></tr>
              <tr><td>Phát lệnh SX</td><td>Quản đốc/Admin</td><td>Cần xác nhận bước duyệt/log</td></tr>
              <tr><td>Ghi WIP</td><td>Công nhân SX</td><td>Review số lượng, hao hụt</td></tr>
              <tr><td>Tạo Pallet BTP</td><td>Công nhân SX</td><td>Review mã pallet, tem QR</td></tr>
              <tr><td>Utility Logging</td><td>Kỹ thuật</td><td>Review điện/nước/hơi</td></tr>
            </table>
            <div class="pill" style="margin-top:14px;">Flow xuyên suốt đề xuất: PO 10000456 → WIP → Pallet BTP</div>
          </div>
        </div>
        <div class="footer"><span class="brand">ANTESCO</span><span>App Kho & Sản xuất - Review hiện trạng</span></div>
      </section>
    `,
  },
  {
    name: 'slide_04_summary_kho.png',
    html: `
      <section class="slide">
        <div class="topline"></div>
        <h1 class="title">Summary phân hệ Kho</h1>
        <p class="subtitle">Inbound, Putaway, Outbound, FEFO, Loading Container và Transfer nội bộ.</p>
        <div class="grid" style="grid-template-columns: 1.08fr .92fr; margin-top:18px;">
          <div class="card" style="padding:14px;">
            <div class="label">Luồng kho chính</div>
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:9px;margin-top:12px;">
              ${phoneBlock('04_Warehouse_InboundOverview_ThuKho.png', 'Inbound', '', 'height:238px;')}
              ${phoneBlock('04_Warehouse_Putaway_ThuKho.png', 'Putaway', '', 'height:238px;')}
              ${phoneBlock('04_Warehouse_FEFOPicking_ThuKho.png', 'FEFO', '', 'height:238px;')}
              ${phoneBlock('04_Warehouse_LoadingContainer_ThuKho.png', 'Loading', '', 'height:238px;')}
            </div>
            <div class="flow" style="margin-top:16px;">
              ${['Nhập kho','Putaway','Lưu kho','FEFO Picking','Xuất bến'].map((s, i) => `<div class="step" style="font-size:12px;min-height:44px;">${s}</div>${i < 4 ? '<div class="arrow">→</div>' : ''}`).join('')}
            </div>
          </div>
          <div>
            <div class="grid" style="grid-template-columns:repeat(2,1fr);gap:9px;">
              ${phoneBlock('04_Warehouse_ReceiveRM_ThuKho.png', 'Nhận NL', '', 'height:205px;')}
              ${phoneBlock('04_Warehouse_FGReceiving_ThuKho.png', 'Nhận TP/BTP', '', 'height:205px;')}
              ${phoneBlock('04_Warehouse_OutboundOverview_ThuKho.png', 'Outbound', '', 'height:205px;')}
              ${phoneBlock('04_Warehouse_InternalTransfer_ThuKho.png', 'Transfer', '', 'height:205px;')}
            </div>
          </div>
        </div>
        <div class="grid" style="grid-template-columns:repeat(3,1fr);gap:12px;margin-top:16px;">
          <div class="card" style="padding:13px;"><div class="label">Inbound</div><p class="small">Cần thấy trạng thái chờ nhận, đồng kiểm và putaway.</p></div>
          <div class="card" style="padding:13px;"><div class="label">FEFO</div><p class="small">Cần test quét sai lô, pallet QM Hold và vị trí đề xuất.</p></div>
          <div class="card" style="padding:13px;"><div class="label">Loading</div><p class="small">Review checklist, seal/OCR và chữ ký xác nhận.</p></div>
        </div>
        <div class="footer"><span class="brand">ANTESCO</span><span>App Kho & Sản xuất - Review hiện trạng</span></div>
      </section>
    `,
  },
  {
    name: 'slide_05_ma_tran_quyen.png',
    html: `
      <section class="slide">
        <div class="topline"></div>
        <h1 class="title">Ma trận vai trò & phạm vi quyền</h1>
        <p class="subtitle">RBAC theo user, phân hệ và action; làm rõ quyền nhạy cảm cần audit.</p>
        <div class="grid" style="grid-template-columns: 220px 1fr 190px; margin-top:14px; align-items:start;">
          <div>
            ${phoneBlock('05_RBAC_Admin.png', 'Admin Role Control', 'main-rbac', 'height:372px;')}
            <div class="pill" style="margin-top:9px;">RBAC quản lý user · role · plant</div>
          </div>
          <div class="card" style="padding:14px;">
            <div class="label">Ma trận quyền tóm tắt</div>
            <table style="margin-top:8px;">
              <tr><th>Role</th><th>Phạm vi chính</th><th>Quyền nhạy cảm</th></tr>
              <tr><td>Admin</td><td>Toàn hệ thống/RBAC</td><td>Toàn quyền</td></tr>
              <tr><td>Quản đốc</td><td>Điều phối, override, lỗi</td><td>Phát lệnh, Override FEFO</td></tr>
              <tr><td>Thủ kho</td><td>Nhập, xuất, putaway</td><td>Không tự override FEFO</td></tr>
              <tr><td>KCS/QM</td><td>QM Hold, kiểm kê</td><td>Khóa lô, mã lỗi, ảnh</td></tr>
              <tr><td>Công nhân SX</td><td>WIP, Pallet BTP</td><td>Không phát lệnh</td></tr>
              <tr><td>Kế toán kho</td><td>Chứng từ, hóa đơn</td><td>Chủ yếu chỉ xem</td></tr>
            </table>
            <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;">
              <span class="pill">Được thao tác</span>
              <span class="pill" style="background:#eff6ff;color:#1d4ed8;border-color:#bfdbfe;">Chỉ xem</span>
              <span class="pill" style="background:#f8fafc;color:#64748b;border-color:#e2e8f0;">Bị chặn</span>
            </div>
          </div>
          <div class="grid" style="grid-template-columns:1fr;gap:10px;">
            ${phoneBlock('05_RBAC_Home_Admin.png', 'Home Admin', '', 'height:104px;')}
            ${phoneBlock('05_RBAC_Home_QuanDoc.png', 'Home Quản đốc', '', 'height:104px;')}
            ${phoneBlock('05_RBAC_Home_ThuKho.png', 'Home Thủ kho', '', 'height:104px;')}
          </div>
        </div>
        <div class="grid" style="grid-template-columns:1fr 1fr;gap:12px;margin-top:8px;">
          <div class="card" style="padding:9px 12px;display:flex;gap:10px;align-items:center;min-height:82px;">
            <div class="phone soft" style="width:46px;height:74px;border-width:2px;border-radius:9px;"><img src="${img('05_RBAC_RestrictedAction.png')}" /></div>
            <div><div class="label" style="color:var(--orange);">Hạn chế quyền</div><p class="small" style="margin:4px 0 0;">Thủ kho được FEFO Picking nhưng bị hạn chế Override FEFO.</p></div>
          </div>
          <div class="card" style="padding:9px 12px;display:flex;gap:10px;align-items:center;min-height:82px;">
            <div class="phone soft" style="width:46px;height:74px;border-width:2px;border-radius:9px;"><img src="${img('05_RBAC_SensitivePermission.png')}" /></div>
            <div><div class="label" style="color:var(--red);">Quyền nhạy cảm</div><p class="small" style="margin:4px 0 0;">Override/xử lý ngoại lệ cần lưu log và xác nhận nghiệp vụ.</p></div>
          </div>
        </div>
        <div class="footer"><span class="brand">ANTESCO</span><span>App Kho & Sản xuất - Review hiện trạng</span></div>
      </section>
    `,
  },
];

await fs.mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true, executablePath: chromePath });
const page = await browser.newPage({ viewport: { width: 1024, height: 768 }, deviceScaleFactor: 1 });

for (const slide of slides) {
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>${commonCss}</style></head><body>${slide.html}</body></html>`;
  await page.setContent(html, { waitUntil: 'load' });
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: path.join(outDir, slide.name), fullPage: false });
  console.log(`OK ${slide.name}`);
}

await browser.close();
console.log(`DONE ${outDir}`);
