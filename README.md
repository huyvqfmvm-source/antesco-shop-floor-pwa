# ANTESCO Shop Floor & Warehouse PWA

Ứng dụng web/PWA cho vận hành phân xưởng, nhập kho, xuất kho, kiểm nội bộ và QM của ANTESCO. Source này được phát triển tiếp từ bản `Code kho update`, tập trung vào trải nghiệm mobile, thao tác nhanh theo role, offline queue và đồng bộ realtime trong phạm vi trình duyệt/PWA.

## Điểm chính

- Mobile-first PWA: manifest, service worker, offline app shell, Add to Home Screen.
- Home theo role: Công nhân SX, Thủ kho, KCS/QM, Kỹ thuật, Quản đốc, Kế toán kho, Admin.
- Local persistence: dữ liệu vận hành, session, queue, activity log và user được lưu lại sau reload.
- Realtime local sync: nhiều tab/cửa sổ đồng bộ trạng thái qua BroadcastChannel và storage event.
- Offline queue: Putaway và QM Hold có thể xếp hàng khi offline, tự đồng bộ khi online.
- Scanner modal: mô phỏng camera và hỗ trợ nhập mã nhanh cho máy quét dạng keyboard-wedge.
- Admin Role Control: xem user, đổi role/plant/bộ phận, xem số tab và action theo role.
- Sửa lỗi nghiệp vụ: KPI Putaway theo đúng plant/status; FEFO chặn picking lô QM Hold/Blocked Stock.

## Tài khoản mẫu

- `an.nguyen` / `123456` - Công nhân sản xuất
- `binh.tran` / `123456` - Thủ kho
- `cuong.le` / `123456` - KCS/QM
- `dung.pham` / `123456` - Quản đốc/Tổ trưởng
- `em.hoang` / `123456` - Kỹ thuật
- `phuong.ngo` / `123456` - Kế toán kho
- `admin` / `admin123` - Admin

## Chạy local

```bash
pnpm install
pnpm dev
```

Build production:

```bash
pnpm build
pnpm preview
```

## Giới hạn hiện tại

- Chưa tích hợp SAP S/4HANA thật, backend auth thật hoặc API server.
- Camera/OCR/Bluetooth scale/mobile printer đang ở mức PWA/mock hoặc nhập mã thủ công.
- Offline queue hiện lưu trong browser local storage, chưa phải SQLite/Realm native.

Các phần này là bước tiếp theo nếu chuyển sang backend production hoặc Flutter/Android native.
