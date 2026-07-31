# Content Universe V20 – Cloud Sync

## Tính năng mới
- Đồng bộ toàn bộ dữ liệu giữa máy tính và điện thoại qua Supabase.
- Tự lưu sau khoảng 0,9 giây khi có thay đổi.
- Tự kéo dữ liệu mới khi mở lại tab, quay lại ứng dụng hoặc mỗi 10 giây.
- Bài Gemini vừa tạo, tiêu đề và ý tưởng đang nhập đều được giữ nguyên sau khi tải lại trang.
- Khi Supabase chưa cấu hình, ứng dụng vẫn tự lưu bằng localStorage trên thiết bị hiện tại.

## Cài Supabase
1. Tạo project Supabase.
2. Mở SQL Editor và chạy file `supabase.sql`.
3. Trên Vercel, thêm:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `CONTENT_UNIVERSE_WORKSPACE_ID=sieu-di-dong`
4. Redeploy dự án.

Dùng cùng website trên máy tính và điện thoại sẽ thấy chung một kho dữ liệu. Không đặt `SUPABASE_SERVICE_ROLE_KEY` dưới tên bắt đầu bằng `NEXT_PUBLIC_`.
