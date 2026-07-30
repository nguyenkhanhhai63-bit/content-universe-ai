# Content Universe V6 – Siêu Di Động

Bản V6 dùng Next.js, OpenAI API và Supabase.

## Có sẵn

- Dashboard.
- Tạo bản nháp miễn phí.
- AI Writer.
- AI Editor.
- AI Analyst.
- AI tạo 20 hook.
- Kho Hook, Công thức, Kịch bản.
- Trạng thái đã đăng/chưa đăng.
- Content Universe.
- Thiết lập giọng viết.
- LocalStorage dự phòng.
- Lưu kịch bản lên Supabase khi đã cấu hình.
- Trang đăng nhập magic-link tại `/login`.

## Cập nhật GitHub/Vercel

Thay toàn bộ mã trong repository hiện tại bằng các file trong ZIP này rồi Commit. Vercel nhận diện Next.js và tự deploy.

## Environment Variables trên Vercel

```env
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-5-mini
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Chỉ hai biến OpenAI là bắt buộc cho AI. Không có Supabase thì ứng dụng vẫn chạy và lưu ở trình duyệt.

## Thiết lập Supabase

1. Tạo project tại Supabase.
2. Mở SQL Editor.
3. Chạy file `supabase/schema.sql`.
4. Vào Project Settings → API.
5. Sao chép Project URL vào `NEXT_PUBLIC_SUPABASE_URL`.
6. Sao chép anon public key vào `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
7. Trong Authentication → URL Configuration, thêm URL Vercel của bạn vào Site URL và Redirect URLs.
8. Redeploy Vercel.

Supabase khuyến nghị dùng client SSR/cookie cho App Router khi xây auth đầy đủ; bản này đã dùng `@supabase/ssr` ở browser client và có thể mở rộng middleware sau. 
