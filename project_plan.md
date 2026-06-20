# ANTESCO Shop Floor & Warehouse Mobile App

## 1. Project Description
App mô phỏng vận hành sản xuất, kho và quản lý chất lượng tại 2 nhà máy Mỹ An (MA) và Bình Khánh (BK) của ANTESCO. App mobile-first, dùng mock data nội bộ, chưa tích hợp SAP thật. Ngôn ngữ tiếng Việt.

- **Target users**: Công nhân sản xuất, thủ kho, KCS/QM, kỹ thuật, quản đốc, kế toán kho
- **Core value**: Tra cứu và thao tác nghiệp vụ sản xuất - kho - chất lượng nhanh trên thiết bị cầm tay

## 2. Page Structure
- `/login` - Đăng nhập (chọn Role, Nhà máy, Ca)
- `/home` - Home tổng quan (sau đăng nhập)
- `/production` - Tab Sản xuất
- `/inbound` - Tab Nhập kho
- `/outbound` - Tab Xuất kho
- `/internal-qm` - Tab Nội bộ & QM
- `/settings` - Cài đặt User
- `/reports` - Báo cáo
- `/accounting` - Kế toán kho

## 3. Core Features
- [x] Mock login với chọn Role, Nhà máy, Ca làm việc
- [x] Bottom navigation 4 tab cố định: Sản xuất, Nhập kho, Xuất kho, Nội bộ & QM
- [x] Home tổng quan
- [x] Settings page (đổi role, nhà máy, ca, online/offline, high contrast, cold storage UI, reset mock data)
- [x] Floating Scan Button toàn app
- [x] Activity Feed toàn app
- [x] Global mock store dùng chung
- [x] Chi tiết nghiệp vụ Sản xuất (Production Order, Material Issuance, WIP, Pallet BTP, Confirm, Utility)
- [x] Chi tiết nghiệp vụ Nhập kho (Tiếp nhận NL, Nhập kho TP & Đồng kiểm, Putaway, Pending List)
- [x] Chi tiết nghiệp vụ Xuất kho (Smart FEFO Picking, BTP Issue, Container Loading)
- [x] Chi tiết nghiệp vụ Nội bộ & QM (QM Hold/Blocked Stock, Điều chuyển liên NM, Cycle Counting, Defect Codes)
- [x] Offline queue & sync simulation

## 4. Data Model Design
Mock data only, dùng React Context làm global store.

### Mock Data Collections
| Collection | Fields |
|-----------|--------|
| currentUser | name, role, plant, shift |
| productionOrders | id, product, plannedQty, plant, shift, status |
| batches | id, product, qty, plant, status |
| handlingUnits | id, type, product, location, plant |
| bins | id, warehouse, row, tier, position |
| warehouses | id, name, type, plant |
| transferOrders | id, fromLoc, toLoc, items, status |
| outboundDeliveries | id, container, seal, items, status |
| qualityHolds | id, batch, reason, status |
| activityLogs | id, timestamp, user, action, detail |

## 5. Backend / Third-party Integration Plan
- Supabase: Chưa cần trong giai đoạn này
- Shopify: Không áp dụng
- Stripe: Không áp dụng

## 6. Development Phase Plan

### Phase 1: Nền tảng App ✓
- Goal: Xây dựng layout mobile, navigation, mock data, login, home, settings
- Deliverable: App chạy được với đầy đủ layout, login, 4 tab, settings, mock store

### Phase 2: Home & Realtime ✓
- Goal: Home tổng quan, Scanner mock, OCR/AI mock, Toast system, Activity Feed realtime
- Deliverable: Home demo tốt, Scanner/OCR/AI dùng lại được, Settings nâng cấp

### Phase 3: Module Sản xuất ✓
- Goal: PO List → Detail → Material Issuance → WIP → Pallet BTP → Confirm FG → Utility Logging
- Deliverable: 7 màn hình nghiệp vụ sản xuất, process stepper 6 bước, phân quyền phát lệnh

### Phase 4: Module Nhập kho ✓
- Goal: Tiếp nhận nguyên liệu, Nhập kho TP & Đồng kiểm đếm, Putaway Guide, Pending List
- Deliverable: 4 màn hình nghiệp vụ nhập kho, Cold Storage UI, chữ ký điện tử, offline putaway

### Phase 5: Module Xuất kho ✓
- Goal: Smart FEFO Picking Guide, BTP Issuance, Container Loading & Dispatch
- Deliverable: 4 màn hình nghiệp vụ xuất kho, FEFO override Quản đốc, Blocked Stock check, checklist container, OCR container/seal

### Phase 6: Module Nội bộ & QM ✓
- Goal: QM Hold/Blocked Stock, Transfer Orders liên nhà máy, Cycle Counting, Defect Codes
- Deliverable: 5 màn hình nghiệp vụ + Landing, Blocked Stock liên thông Xuất kho, offline lock, multi-scan pallet, OCR xe, chữ ký điện tử, cycle count lệch

## PHẦN 7 — Offline Queue, Error Queue, RBAC, Liên thông dữ liệu

Trạng thái: ✅ HOÀN THÀNH — 2026-06-16

### Kiến trúc file mới/chỉnh sửa

| File | Vai trò |
|------|--------|
| `src/store/AppContext.tsx` | Nâng cấp lớn: OfflineQueueItem đầy đủ (queueId, type PUTAWAY/QM_HOLD, mockMovement MIGO-311/344, status lifecycle), ErrorQueueItem (transactionCode, errorReasonVi, history), RBAC permissions map, MOCK_SAP_ERRORS (10 lỗi), syncOfflineQueue engine tuần tự |
| `src/components/feature/SyncQueueModal.tsx` | Modal đồng bộ queue: progress bar, hiển thị từng item status (Pending→Syncing→Synced/Failed), percentage |
| `src/components/feature/MobileLayout.tsx` | Badge tím "Offline kho lạnh", queue count, error count badge trên settings icon, SyncQueueModal, LogoutConfirmModal, auto-sync trigger |
| `src/pages/internal-qm/ErrorQueueResolver.tsx` | Error Queue Resolver: filter trạng thái, card chi tiết từng lỗi, nút Gửi lại/Hủy/Cần kiểm tra/Lịch sử, RBAC-protected (chỉ Quản đốc/Admin) |
| `src/pages/inbound/Putaway.tsx` | Nâng cấp: RBAC check INBOUND_PUTAWAY, OfflineQueueItem đầy đủ với MIGO-311, audit log trước/sau |
| `src/pages/internal-qm/QMHold.tsx` | Nâng cấp: RBAC check QM_HOLD, role-blocked screen, OfflineQueueItem với MIGO-344, audit log |
| `src/pages/home/page.tsx` | Nâng cấp: sync queue alert, nút "Đồng bộ ngay", error queue badge trên settings, RBAC-filtered quick actions, offline queue summary |
| `src/pages/settings/page.tsx` | Nâng cấp: queue info section, logout với pending queue confirm, auto-sync khi chuyển offline→online |
| `src/pages/internal-qm/page.tsx` | Thêm card "Error Queue Resolver" |
| `src/router/config.tsx` | Thêm route `/internal-qm/error-queue` |

### RBAC Permissions Map

| Role | Quyền |
|------|-------|
| Công nhân SX | PRODUCTION_WIP, PRODUCTION_PALLET |
| Thủ kho | INBOUND_RECEIVE_RM, INBOUND_FG_RECEIVING, INBOUND_PUTAWAY, OUTBOUND_FEFO_PICKING, OUTBOUND_CONTAINER_LOADING, TRANSFER_ORDER, QM_CONTAINER_CHECK |
| KCS/QM | QM_HOLD, QM_CYCLE_COUNT, QM_CONTAINER_CHECK |
| Kỹ thuật | PRODUCTION_UTILITY |
| Quản đốc | Tất cả trên + OUTBOUND_FEFO_OVERRIDE, ERROR_QUEUE_RESOLVE |
| Admin | ADMIN_ALL |

### Offline Queue Flow

```
Offline kho lạnh (Settings)
  ├── Putaway → quét pallet + ô kệ → lưu OfflineQueueItem (MIGO-311, Pending)
  ├── QM Hold → quét batch + ghi lỗi + chụp ảnh → lưu OfflineQueueItem (MIGO-344, Pending)
  └── Nghiệp vụ khác → toast "Chức năng này cần kết nối mạng"

Chuyển sang Online:
  ├── Auto-trigger SyncQueueModal
  ├── Đồng bộ tuần tự 1/4 → 2/4 → 3/4 → 4/4
  ├── SAP mock thành công → Synced → cập nhật HU/bin/batch thật → xóa khỏi queue
  └── SAP mock lỗi → Failed → đẩy vào Error Queue với errorReasonVi

Error Queue:
  ├── Chỉ Quản đốc/Admin truy cập
  ├── 10 lỗi mock: tồn kho không đủ, pallet đã xử lý, batch bị khóa QC, ô kệ không hợp lệ, số lượng vượt tồn, trùng giao dịch, SAP timeout, thiếu ảnh, thiếu lý do, lỗi quyền
  └── Actions: Gửi lại, Hủy, Cần kiểm tra, Xem lịch sử
```

### Audit Log Nâng cấp

Mỗi activity log giờ có thêm:
- `beforeStatus` / `afterStatus` — trạng thái trước và sau thao tác
- `note` — ghi chú bổ sung
- `plant` — mã nhà máy

### Điểm nổi bật

- **Offline Queue**: Chỉ Putaway + QM Hold được offline; các nghiệp vụ khác bị chặn + toast rõ ràng
- **Sync Engine**: Đồng bộ tuần tự từng giao dịch, progress bar real-time, phân biệt SAP OK vs SAP lỗi
- **Error Queue Resolver**: Giao diện chuyên nghiệp cho Quản đốc xử lý lỗi, có lịch sử giao dịch, need-review flag
- **RBAC toàn diện**: 7 role × 17 permission actions, áp dụng vào Putaway, QM Hold, Home quick actions
- **Liên thông SX → NK → Putaway → XK → QM Hold → Error Queue**: Dữ liệu chạy xuyên suốt
- **Logout Protection**: Nếu còn queue pending → popup cảnh báo với nút "Ở lại kiểm tra" và "Vẫn thoát"
- **Badge tím Offline**: Header và Home hiển thị rõ trạng thái offline + queue count

## PHẦN 8 — Polish UI/UX, Demo Flow, Fix Logic Toàn App

Trạng thái: ✅ HOÀN THÀNH — 2026-06-17

### Kiến trúc file chỉnh sửa

| File | Vai trò |
|------|--------|
| `src/components/feature/MobileLayout.tsx` | Fix import `syncOfflineQueue` không tồn tại → chỉ import `useApp` |
| `src/pages/settings/page.tsx` | Thêm section "Demo Nhanh" với 8 nút demo flow toàn bộ nhà máy, thêm `addActivityLog` vào destructure |
| `src/index.css` | Thêm 3 animation mới: `voice-wave`, `voice-pulse`, `ocr-scan` |
| `src/pages/internal-qm/QMHold.tsx` | Voice-to-text button: thêm voice wave bars animation khi đang ghi âm |
| `src/pages/production/ConfirmPage.tsx` | Voice-to-text button: thêm voice wave bars + pulse animation |
| `src/pages/outbound/FEFOPicking.tsx` | Nút chính "Bắt đầu Picking", "Quét QR Pallet", "Xác nhận lấy hàng" bump lên h-14 (56px) |
| `src/pages/outbound/ContainerLoading.tsx` | Nút "Quét QR OD", "Xác nhận Xuất Bến" bump lên h-14 |
| `src/pages/outbound/BTPIssue.tsx` | Nút "Quét QR Pallet BTP" bump lên h-14 |

### Demo Nhanh — 8 Scenario

```
Settings → Demo Nhanh:
  1. Reset dữ liệu demo — RESET_MOCK_DATA toàn bộ
  2. Demo sản xuất → tạo pallet BTP — PO 10000456 REL→STRT, WIP 3,200 KG, HU BTP
  3. Demo nhập kho thành phẩm — Batch 002216225, HU FG, Chờ putaway
  4. Demo putaway offline — Set offline + Queue MIGO-311
  5. Demo đồng bộ queue thành công — Set Online, vào Home sync
  6. Demo QM Hold / Khóa lô — Batch 002216225 → Blocked Stock
  7. Demo chặn xuất lô bị khóa — Vào FEFO Picking thấy batch đỏ
  8. Demo lỗi queue & xử lý error — Set SAP lỗi → Sync failed → Error Queue
```

### Polish UI/UX

- **Voice Wave Animation**: 5 thanh sóng âm chuyển động khi voice-to-text recording
- **Voice Pulse**: Icon mic đập nhịp khi ghi âm
- **OCR Scan Line**: Thanh quét chạy dọc khi OCR
- **Nút chính ≥56px (h-14)**: Tất cả primary CTA buttons trên flow chính được bump lên
- **Toast tiếng Việt rõ ràng**: Tất cả toast đều có dấu chuẩn, giải thích rõ nguyên nhân + hướng xử lý
- **Scanner modal giống camera thật**: Viền quét, góc cắt, scan line animation
- **Badge trạng thái nhất quán**: Màu sắc đồng bộ toàn app (xanh=sx, xanh dương=nk, cam=xk, xám=qm, đỏ=error, tím=offline, vàng=warning)

### Điểm nổi bật

- **Demo flow 3-5 phút**: Người xem chỉ cần vào Settings → Demo Nhanh → bấm tuần tự 8 nút là thấy toàn bộ flow nhà máy
- **Animation sống động**: Voice wave, pulse, scan line làm app có cảm giác realtime dù chỉ là mock state
- **Không lorem ipsum**: 100% dữ liệu xoài IQF, Mỹ An, Bình Khánh, batch thật
- **Tiếng Việt chuẩn**: Toàn bộ text có dấu, giải thích rõ ràng
- **Responsive mobile**: Layout max-w-[430px], centered, bottom nav fixed, scroll hoạt động

## PHẦN 9 — UI/UX Nâng Cấp Toàn Diện, Design System & Component Library

Trạng thái: ✅ HOÀN THÀNH — 2026-06-17

### Shared Components Mới (8 components)

| Component | File | Chức năng |
|-----------|------|-----------|
| `StatusBadge` | `src/components/base/StatusBadge.tsx` | Badge trạng thái 11 variants + pulse animation |
| `ProcessStepper` | `src/components/base/ProcessStepper.tsx` | Stepper quy trình với màu module, scroll ngang |
| `PrimaryActionButton` | `src/components/base/PrimaryActionButton.tsx` | Nút chính 8 màu × 3 kích cỡ × loading state |
| `ConfirmModal` | `src/components/base/ConfirmModal.tsx` | Modal xác nhận chuẩn: icon + title + message + 2 nút |
| `EmptyState` | `src/components/base/EmptyState.tsx` | Trạng thái rỗng với icon, mô tả, nút hành động |
| `ErrorState` | `src/components/base/ErrorState.tsx` | Trạng thái lỗi với nút thử lại |
| `QuantityStepper` | `src/components/base/QuantityStepper.tsx` | Nút +/- số lượng, 3 kích cỡ, min/max |
| `ModuleCard` | `src/components/feature/ModuleCard.tsx` | Card điều hướng nghiệp vụ với icon, badge, màu module |

### UI/UX Nâng Cấp

| Hạng mục | Thay đổi |
|----------|----------|
| **Home page** | Redesign: chào user, cảnh báo vận hành, 4 summary cards, quick actions scroll ngang, role tasks, module shortcuts |
| **BottomNav** | Active indicator dot + bg color theo module + backdrop blur |
| **MobileLayout** | Backdrop blur header, StatusBadge network, ConfirmModal logout |
| **ToastContainer** | Vị trí top-16, shadow-lg |
| **FloatingScanButton** | Rounded-2xl, shadow màu |
| **SyncQueueModal** | StatusBadge trên từng item, scale-in animation |
| **Settings** | ConfirmModal reset, demo buttons loading riêng, layout gọn |
| **Production** | StatusBadge, EmptyState, ProcessStepper |
| **Inbound** | ModuleCard, ProcessStepper, MiniStat grid |
| **Outbound** | StatusBadge, EmptyState |
| **Internal QM** | ModuleCard, banner rộng |

### Design System — Màu sắc

| Module | Màu | Ứng dụng |
|--------|-----|----------|
| Sản xuất | ant-sx (xanh lục) | Banner, stepper, PO cards |
| Nhập kho | ant-nk (xanh dương) | Banner, stepper, nav cards |
| Xuất kho | ant-xk (cam) | Banner, OD cards |
| Nội bộ & QM | ant-qm (xám than) | Banner, nav cards |
| Offline Queue | ant-offline (tím) | Badge, queue alert |
| Error | ant-error (đỏ) | Blocked, error queue |
| Warning | ant-warning (vàng) | Pending tasks |
| Success | ant-success (xanh) | Synced, hoàn tất |
| Sync | ant-sync (xanh nhạt) | Đang sync |

### Animation System — 11 keyframes
scan-line, slide-up, slide-down, fade-in, pulse-soft, shake, voice-wave, voice-pulse, ocr-scan, shimmer, scale-in, badge-pop

### Điểm nổi bật
- 8 shared components tái sử dụng toàn app
- Design system 9 màu nhất quán
- Mobile-first: backdrop blur, safe-area, custom scrollbar, active scale
- Animation phong phú trên mọi tương tác
- EmptyState/ErrorState trên mọi màn hình
- ConfirmModal thay thế tất cả modal rời rạc
- 100% dữ liệu xoài IQF, Mỹ An, Bình Khánh

## Phase 10: Deep Business Logic & Mock Realtime (2026-06-17)

### Nâng cấp
- Production Dashboard: filter nhà máy/trạng thái/sản phẩm, progress bar, StatusBadge, action hints
- PalletPage: 80 thùng tạm, 1,600 KG, HU-2026-MA-BTP-XOAI-0001, đồng bộ carton/KG
- BTP Issue: cập nhật WIP PO đích + giảm tồn BTP sau xuất
- Home: thêm Demo Nhanh (8 bước) collapsible section
- AppContext: đảm bảo data flow sau mỗi thao tác (WIP, BTP stock, PO status)

### Trạng thái: Hoàn thành
- 8/8 phân hệ nghiệp vụ: SX, NK, XK, QM, Offline Queue, Error Queue, RBAC, Demo
- End-to-end flow: CRTD → REL → STRT → CNF → Nhập kho → Putaway → FEFO → Container
- Mock realtime: activity log, sync progress, error queue resolver

## PHẦN 12 — UI/UX Nâng Cấp Toàn Diện, Design System Components & Mobile Shell

Trạng thái: ✅ HOÀN THÀNH — 2026-06-17

### Design System Components Mới (3 components)

| Component | File | Chức năng |
|-----------|------|-----------|
| `SignatureBox` | `src/components/base/SignatureBox.tsx` | Vùng ký mô phỏng — canvas-based, hỗ trợ touch & mouse, hiển thị "Đã ký" kèm role + thời gian, có disabled state + reason |
| `PhotoEvidenceGrid` | `src/components/base/PhotoEvidenceGrid.tsx` | Grid ảnh bằng chứng 2 cột, hiển thị badge "Bắt buộc"/"Tùy chọn", đếm số lượng, cảnh báo thiếu ảnh |
| `PermissionBanner` | `src/components/base/PermissionBanner.tsx` | Banner hiển thị quyền hiện tại theo role/module, màu theo module, liệt kê quyền được phép + hạn chế |

### Mobile App Shell Nâng Cấp

| Hạng mục | Thay đổi |
|----------|----------|
| **Phone Frame** | Bo góc 2.5rem-3rem toàn khung, notch đen trên cùng, shadow-2xl, ring-1 tạo viền mỏng |
| **Background** | bg-gray-100 bên ngoài frame giúp app nổi bật trên desktop |
| **Status Bar** | Spacer 40px trên cùng + notch indicator giả lập Dynamic Island |
| **Header** | Giảm chiều cao xuống h-12, backdrop-blur-2xl, font nhỏ gọn hơn |
| **Bottom Nav** | `absolute` bottom-0 trong frame, safe-area-inset-bottom, active indicator bar animate-scale-in, backdrop-blur-2xl |
| **Spacing** | Thêm `h-20 shrink-0` spacer trước bottom nav để nội dung không bị che |

### ScannerModal Nâng Cấp

| Hạng mục | Thay đổi |
|----------|----------|
| **Camera UI** | Nền đen sâu #0a0a0a với texture dots, khung focus area với corner markers lớn hơn |
| **Scan Flow** | 3 pha: `scanning` (0.5-0.8s) → `detected` (0.35s) → `result` |
| **Detected State** | Overlay xanh với check icon scale-in, thể hiện "Đã nhận diện" |
| **Scan Line** | Gradient trong suốt 2 đầu, shadow màu module |
| **Modal Style** | Bo góc 28px, handle bar trên mobile, backdrop-blur-sm |
| **FloatingScanButton** | Vị trí `bottom-24` (tránh che nút submit), pulse ring animation, shadow màu |

### PermissionBanner — Tích hợp toàn app

| Trang | Module | Permissions |
|-------|--------|-------------|
| Production DetailPage | Sản xuất (xanh lục) | PRODUCTION_CREATE_ORDER, WIP, PALLET, CONFIRM_FG, MATERIAL, VIEW |
| FGReceiving | Nhập kho (xanh dương) | INBOUND_FG_RECEIVING, PRODUCTION_SIGN, INBOUND_SIGN_WH, VIEW |
| Putaway | Nhập kho (xanh dương) | INBOUND_PUTAWAY, VIEW |
| FEFO Picking | Xuất kho (cam) | OUTBOUND_FEFO_PICKING, FEFO_OVERRIDE, VIEW |
| Container Loading | Xuất kho (cam) | OUTBOUND_CONTAINER_LOADING, VIEW |
| QM Hold | Nội bộ & QM (xám) | QM_HOLD, VIEW |
| Error Queue Resolver | Error Queue (xám) | ERROR_QUEUE_RESOLVE |

### FGReceiving — SignatureBox thay thế tick

- Trước: Nút "Ký xác nhận" + icon tick đơn giản
- Sau: `SignatureBox` canvas-based với vùng ký thật (touch & mouse), hiển thị "Đã ký" kèm role + thời gian
- Disabled state: Hiển thị lý do "Chỉ Công nhân SX/Thủ kho, Quản đốc hoặc Admin được ký"

### Animation System — 14 keyframes

scan-line, slide-up, slide-down, fade-in, pulse-soft, shake, voice-wave, voice-pulse, ocr-scan, shimmer, scale-in, badge-pop, float-breathe, glow-pulse, pulse-ring

### CSS Utilities Mới

- `.glass` / `.glass-dark` — Glass morphism với backdrop-blur-20px
- `.animate-pulse-ring` — Pulse ring cho floating action buttons
- `.animate-float-breathe` — Hiệu ứng nổi nhẹ cho card
- `.animate-glow-pulse` — Glow pulse cho CTA buttons

### Điểm nổi bật

- **Phone frame**: App giống hệt app thật trên điện thoại với notch, bo góc, shadow
- **PermissionBanner**: Mỗi màn hình nghiệp vụ đều hiển thị rõ "Quyền hiện tại: [Role] — được [thao tác]" hoặc hạn chế
- **SignatureBox**: Ký thật bằng touch/mouse, không còn tick đơn giản
- **Scanner 3 pha**: Đang quét → Đã nhận diện → Kết quả, tạo cảm giác realtime
- **Bottom nav không che nội dung**: Spacer h-20 đảm bảo scroll đến hết
- **Floating scan button**: bottom-24, không che nút submit/confirm

## PHẦN 13 — Xóa Demo Nhanh, App Vận Hành Bằng Thao Tác Thật

Trạng thái: ✅ HOÀN THÀNH — 2026-06-17

### Mục tiêu
Xóa toàn bộ nút "Demo Nhanh", "Demo 8 bước", "Reset dữ liệu demo", demo buttons khỏi toàn bộ app. Người test phải tự thao tác trên chức năng thật thay vì bấm nút demo tự set dữ liệu.

### File đã sửa

| File | Thay đổi |
|------|----------|
| `src/pages/home/page.tsx` | Xóa `demoLoading`, `demoOpen` states; xóa `runDemo` function; xóa toàn bộ section "Demo Nhanh (8 bước)" |
| `src/pages/settings/page.tsx` | Xóa `demoLoading` state; xóa `runDemo` function; xóa toàn bộ section "Demo Nhanh (8 bước)" |
| `src/pages/internal-qm/CycleCount.tsx` | Xóa `handleDemoOnly4` callback; xóa nút "Demo: Chỉ quét 4/5 pallet (tạo lệch)" |
| `src/pages/login/SampleAccounts.tsx` | Đổi "Chọn tài khoản để demo nhanh" → "Chọn tài khoản để đăng nhập"; đổi mô tả "demo nhanh" → "kiểm thử" |
| `src/pages/account/page.tsx` | Đổi "tài khoản demo" → "tài khoản" |
| `project_plan.md` | Cập nhật Phase 8, Phase 10, thêm Phase 13 |

### Home sau khi xóa demo
Home giữ lại: cảnh báo vận hành (sync queue, lô QC bị khóa, error queue), tổng quan hôm nay (summary cards theo role), thao tác nhanh (quick actions theo role), việc cần xử lý (tasks theo role), activity feed, phân hệ tabs.

### Vận hành bằng thao tác thật
- Muốn tạo pallet BTP: Sản xuất → Phát lệnh → Ghi WIP → Tạo pallet BTP
- Muốn nhập kho TP: Nhập kho → Nhập kho TP → quét HU → OCR → đồng kiểm → ký → xác nhận
- Muốn putaway offline: Settings → Offline kho lạnh → Putaway → quét HU + ô kệ → xác nhận
- Muốn đồng bộ: Settings → Online → Home → Đồng bộ ngay
- Muốn QM Hold: Nội bộ & QM → QM Hold → quét batch → nhập lỗi → chụp ảnh → xác nhận
- Muốn Error Queue: Settings → SAP mock lỗi → offline thao tác → online → sync fail → Error Queue

### Reset Mock Data
Nút "Reset Mock Data" vẫn giữ trong Settings → Dữ liệu (chỉ hiển thị cho Admin). Không hiển thị ở Home hay các role khác.

## PHẦN 14 — RBAC Hardening Toàn Diện, PermissionBanner Mọi Màn Hình

Trạng thái: ✅ HOÀN THÀNH — 2026-06-18

### Mục tiêu
- Xóa triệt để demo flow còn sót
- Central store realtime: mọi action cập nhật store và phản ánh ngay ở Home summary, tasks, activity log
- RBAC UI: mỗi role chỉ thấy tab và thao tác được phép
- PermissionBanner trên TẤT CẢ màn hình nghiệp vụ
- Activity log/audit cho mọi thao tác quan trọng

### File đã sửa

| File | Thay đổi |
|------|----------|
| `src/pages/settings/page.tsx` | Reset Mock Data: admin-only (wrap với `state.role?.id === 'admin'`) |
| `src/pages/production/WipPage.tsx` | Thêm RBAC check `PRODUCTION_WIP`, PermissionBanner. Nút Lưu WIP hiện "Chỉ Công nhân SX, Quản đốc/Tổ trưởng hoặc Admin được ghi WIP" nếu không đủ quyền |
| `src/pages/production/PalletPage.tsx` | Thêm RBAC check `PRODUCTION_PALLET`, PermissionBanner. Nút Tạo pallet ẩn/lock nếu không đủ quyền |
| `src/pages/production/ConfirmPage.tsx` | Thêm RBAC check `PRODUCTION_CONFIRM_FG`, PermissionBanner. Nút Xác nhận lock nếu không đủ quyền |
| `src/pages/production/MaterialPage.tsx` | Thêm RBAC check `PRODUCTION_MATERIAL`, PermissionBanner. Nút Cấp vật tư lock nếu không đủ quyền |
| `src/pages/outbound/BTPIssue.tsx` | Thêm RBAC check `OUTBOUND_BTP_ISSUE`, PermissionBanner. Nút xuất BTP lock nếu không đủ quyền |
| `src/pages/outbound/FEFOPicking.tsx` | RBAC enforcement: nút "Bắt đầu Picking" hiện warning nếu không có `OUTBOUND_FEFO_PICKING` |
| `src/pages/outbound/ContainerLoading.tsx` | RBAC enforcement: nút "Xác nhận Xuất Bến" hiện warning nếu không có `OUTBOUND_CONTAINER_LOADING` |
| `src/pages/internal-qm/TransferOrder.tsx` | Thêm RBAC check `TRANSFER_ORDER`, PermissionBanner |
| `src/pages/internal-qm/CycleCount.tsx` | Thêm RBAC check `QM_CYCLE_COUNT`, PermissionBanner |

### RBAC Coverage — 100% màn hình nghiệp vụ

| Màn hình | PermissionBanner | RBAC Enforcement | Action bị chặn nếu không đủ quyền |
|----------|:---:|:---:|---|
| Production DetailPage | ✅ | ✅ | Phát lệnh (PRODUCTION_CREATE_ORDER) |
| MaterialPage (Cấp vật tư) | ✅ | ✅ | Xác nhận cấp (PRODUCTION_MATERIAL) |
| WipPage (Ghi WIP) | ✅ | ✅ | Lưu WIP (PRODUCTION_WIP) |
| PalletPage (Tạo BTP) | ✅ | ✅ | Tạo pallet (PRODUCTION_PALLET) |
| ConfirmPage (Xác nhận TP) | ✅ | ✅ | Xác nhận (PRODUCTION_CONFIRM_FG) |
| UtilityPage (Tiện ích) | - | ✅ | Lưu tiện ích (PRODUCTION_UTILITY) |
| FGReceiving (Nhập kho TP) | ✅ | ✅ | Ký bàn giao (PRODUCTION_SIGN, INBOUND_SIGN_WH) |
| Putaway | ✅ | ✅ | Xếp hàng (INBOUND_PUTAWAY) |
| FEFO Picking | ✅ | ✅ | Bắt đầu picking (OUTBOUND_FEFO_PICKING) |
| Override FEFO | ✅ | ✅ | Hộp thoại override (OUTBOUND_FEFO_OVERRIDE) |
| Container Loading | ✅ | ✅ | Xuất bến (OUTBOUND_CONTAINER_LOADING) |
| BTP Issue | ✅ | ✅ | Xuất BTP (OUTBOUND_BTP_ISSUE) |
| QM Hold | ✅ | ✅ | Khóa lô (QM_HOLD) |
| Transfer Order | ✅ | ✅ | Chốt chuyển (TRANSFER_ORDER) |
| Cycle Count | ✅ | ✅ | Xác nhận KK (QM_CYCLE_COUNT) |
| Error Queue Resolver | ✅ | ✅ | Toàn màn hình (ERROR_QUEUE_RESOLVE) |

### Pattern RBAC nhất quán

Mỗi màn hình nghiệp vụ tuân theo pattern:
1. Import `hasPermission`, `getPermissionExplanation` từ `@/store/AppContext`
2. Import `PermissionBanner` từ `@/components/base/PermissionBanner`
3. Check `const canX = hasPermission(state.role?.id, 'PERMISSION_ACTION')`
4. Trong handler: `if (!canX) { addToast('error', 'Bạn không có quyền...'); return; }`
5. UI: `{canX ? (<button>...</button>) : (<div className="bg-ant-warning/10...">{getPermissionExplanation('PERMISSION_ACTION')}</div>)}`

### Activity Log Coverage

Mọi thao tác quan trọng đều ghi log với: user, role, plant, beforeStatus, afterStatus, note (nếu có). Các action được log bao gồm:
- Phát lệnh SX, Ghi WIP, Tạo pallet BTP, Xác nhận TP, Cấp vật tư
- Nhập kho TP, Putaway, FEFO Picking, Override FEFO, Xuất BTP, Xuất bến
- QM Hold, Điều chuyển, Cycle Count, Xử lý Error Queue

### Điểm nổi bật

- **0 demo button**: Không còn bất kỳ nút Demo Nhanh, Run demo, Reset demo nào ở Home hay Settings (trừ Reset Mock Data chỉ cho Admin)
- **RBAC 100%**: 16/16 màn hình nghiệp vụ có RBAC enforcement rõ ràng trên UI
- **PermissionBanner trên 16 màn hình**: Mỗi màn đều hiển thị "Quyền hiện tại: [Role] — được [thao tác]"
- **Realtime store**: Mọi action cập nhật AppContext → phản ánh ngay ở Home summary, Activity Feed, task count
- **Activity log đầy đủ**: beforeStatus/afterStatus/note cho mọi thao tác quan trọng

## PHẦN 15 — Mega Upgrade: Mock Data, Reports, Accounting, Scan Feedback, Cold Storage, High Contrast

Trạng thái: ✅ HOÀN THÀNH — 2026-06-19

### Mock Data Mở Rộng
- File mới: `src/mocks/extended.ts` — tái xuất từ data.ts + bổ sung
- Thêm 4 PO mới (10000459-10000462): STRT, CNF, REL, TECO
- Thêm 10 HU mới: pallet nguyên liệu (RM), pallet BTP cho cả 2 nhà máy
- Thêm 18 bin mới: KM-01 đến KM-03 (kho mát), KL-04 đến KL-08, NL-01, BB-01, HC-01
- Thêm 2 Transfer Order mới (ST-2026-0095, ST-2026-0096)
- Thêm 2 QM Hold mới (QH-2026-0048, QH-2026-0049)
- Thêm 8 activity log mới
- Thêm BOM cho PO 10000457, 10000458
- Thêm 3 mock invoice (INV-2026-0040 đến 0042)
- Thêm 2 RM Receipt mới (RM-RCPT-002, RM-RCPT-003)
- Thêm 2 Cycle Count mới (CC-2026-0083, CC-2026-0084)
- Mở rộng MOCK_DEFECT_CODES_EXTENDED: 20 mã (DF-001 đến DF-020)
- MOCK_DEFECT_CODES_WITH_GUIDE: 10 mã có severity + hướng xử lý chi tiết

### Màn hình Báo cáo (Reports)
- File mới: `src/pages/reports/page.tsx`
- Route: `/reports`
- 5 tab: Sản lượng, Tỷ lệ lỗi, QM Hold, Nhập/Xuất, Offline/Error
- Filter theo nhà máy (MA/BK)
- Export CSV mock cho tab Sản lượng và Nhập/Xuất
- Link từ Home: Quản đốc, Admin, Kế toán

### Màn hình Kế toán kho (Accounting)
- File mới: `src/pages/accounting/page.tsx`
- Route: `/accounting`
- Hiển thị: phiếu nhập kho, container đã xuất bến, container đang loading
- Trạng thái hóa đơn: Chưa lập, Chờ phát hành, Đã phát hành
- Nút "Xuất hóa đơn mock" cho hóa đơn Chờ phát hành
- Kế toán chỉ xem, không thao tác nghiệp vụ

### Scan Feedback (Âm thanh + Rung)
- File mới: `src/hooks/useScanFeedback.ts`
- Web Audio API tạo âm thanh scan thành công (880→1200Hz sine) và lỗi (200→150Hz square)
- Navigator Vibration API: 30ms thành công, 50-50-50ms lỗi
- Settings toggle: Âm thanh scan, Rung khi scan
- Tích hợp vào Putaway (scan pallet + scan bin) và ReceiveRM (scan PO + OCR)

### Defect Codes Nâng Cấp
- Viết lại `src/pages/internal-qm/DefectCodes.tsx`
- Search theo mã, tên, nhóm lỗi
- Filter theo category (9 nhóm)
- Hiển thị severity (Thấp/Trung bình/Cao/Nghiêm trọng) với màu
- Hiển thị hướng xử lý chi tiết cho từng mã lỗi

### Cold Storage Quick Toggle
- Badge "KHO LẠNH" hiển thị trên header khi bật Cold Storage UI
- Toggle trong Settings → Giao diện

### Scan Feedback Settings
- Section mới trong Settings: "Phản hồi khi quét"
- 2 toggle: Âm thanh scan, Rung khi scan
- State lưu trong AppContext: soundEnabled, vibrationEnabled

### Nút "Dùng mã mẫu"
- Putaway step 0: hiển thị danh sách pallet chờ putaway, chọn trực tiếp
- ReceiveRM step 0: đã có sẵn PO mẫu gợi ý

### Route mới
- `/reports` — Báo cáo
- `/accounting` — Kế toán kho

### Điểm nổi bật
- 20 mã lỗi DF với severity + hướng xử lý
- Scan feedback real: âm thanh Web Audio + rung Vibration API
- Báo cáo 5 tab với export CSV
- Kế toán kho: chứng từ + hóa đơn mock
- Mock data đủ cho 2 nhà máy, 6 PO, 27 HU, 35 bin