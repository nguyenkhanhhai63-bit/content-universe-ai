# Content Universe V7 – Siêu Di Động

Phiên bản V7 đã được viết lại giao diện và nâng cấp Prompt Engine cho Gemini.

## Nâng cấp chính

- Giao diện mới hiện đại, responsive và có Dark Mode.
- AI Writer dạng một ô mô tả, không còn ghép nhiều trường máy móc.
- Tạo 1, 3 hoặc 5 phiên bản kịch bản.
- AI Review chấm Hook, Logic, Twist, Cảm xúc và Giữ chân.
- Hook Library dạng card, có yêu thích, tìm kiếm và chỉnh sửa.
- Formula Library có mô tả và cấu trúc kể chuyện.
- Script Library có tìm kiếm, yêu thích, trạng thái, sao chép và chỉnh sửa.
- Content Universe dạng bản đồ ý tưởng.
- Analytics cơ bản.
- Import/Export dữ liệu JSON.
- Gemini tự thử model dự phòng khi model cấu hình không còn dùng được.

## Biến môi trường Vercel

```env
GEMINI_API_KEY=API_KEY_CUA_BAN
GEMINI_MODEL=gemini-3.5-flash-lite
```

`GEMINI_MODEL` có thể bỏ trống. Backend sẽ tự thử model dự phòng.

Dữ liệu được lưu trực tiếp trong trình duyệt bằng localStorage và có thể xuất/nhập bằng file JSON.

## Cách cập nhật GitHub

Cách an toàn nhất:

1. Giải nén file ZIP.
2. Mở repository `content-universe-ai`.
3. Upload toàn bộ file và thư mục trong ZIP, chọn ghi đè file cũ.
4. Commit thay đổi.
5. Vercel tự deploy lại.

Không đưa API key vào GitHub.
