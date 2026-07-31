# Content Universe V21 – Personal Cloud Sync

Bản dành cho một người dùng, không cần đăng nhập tài khoản.

## Đồng bộ máy tính và điện thoại

1. Tạo một dự án Supabase miễn phí.
2. Mở SQL Editor và chạy file `supabase.sql`.
3. Thêm các biến trong `.env.example` vào Vercel.
4. Deploy lại ứng dụng.
5. Vào **Cài đặt → Đồng bộ Cloud cá nhân**.
6. Bấm **Tạo mã an toàn**, sau đó **Kết nối Cloud**.
7. Trên điện thoại, mở cùng website và nhập đúng mã đó.

Mã đồng bộ không được lưu nguyên văn trong Supabase. Máy chủ băm mã thành một ID riêng trước khi đọc hoặc ghi dữ liệu.

## Cách lưu dữ liệu

- Dữ liệu luôn được lưu cục bộ để không mất khi F5 hoặc mất mạng.
- Khi có mã đồng bộ và Supabase hoạt động, dữ liệu tự lưu lên Cloud sau khoảng 0,9 giây.
- Ứng dụng kiểm tra bản mới mỗi 10 giây và khi quay lại tab.
- Kịch bản Gemini tạo ra, nội dung đang sửa, Prompt, Hook, Formula, Knowledge Base và lịch sử phiên bản đều được lưu.

## Lưu ý bảo mật

- Không đưa `SUPABASE_SERVICE_ROLE_KEY` vào biến `NEXT_PUBLIC_*`.
- Đặt `CONTENT_UNIVERSE_SYNC_PEPPER` thành chuỗi dài, ngẫu nhiên và chỉ lưu trên Vercel.
- Giữ kín mã đồng bộ vì người có mã có thể truy cập vùng dữ liệu cá nhân đó.
