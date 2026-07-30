# Content Universe AI – Siêu Di Động

## Chức năng

- Viết kịch bản mới bằng AI.
- Đọc lại và viết hoàn thiện kịch bản có sẵn.
- Chỉ ra lỗi logic, hook, twist và cách sửa.
- Sinh 10 hook khác nhau.
- Tự chỉnh công thức và giọng viết.
- Sao chép hoạt động khi chạy online.
- Lưu nội dung trong trình duyệt.

## Đưa website lên Vercel

1. Tạo tài khoản Vercel.
2. Tạo project mới và tải thư mục này lên GitHub, hoặc dùng Vercel CLI.
3. Trong Project Settings → Environment Variables, thêm:
   - `OPENAI_API_KEY`: khóa API OpenAI của bạn.
   - `OPENAI_MODEL`: tên model bạn muốn sử dụng, ví dụ `gpt-5.6`.
4. Deploy lại project.

Không đặt khóa API trong `index.html` hoặc mã frontend.

## Chạy thử bằng Vercel CLI

```bash
npm install -g vercel
vercel dev
```

Tạo file `.env.local`:

```env
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-5.6
```
