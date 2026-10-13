# LingoUp — Frontend

Ứng dụng Vue học tiếng Anh theo chủ đề và bài học, kết nối FastAPI trong `../backend_AI_English/backend`.

## Chạy cục bộ

```powershell
npm install
npm run dev
```

Backend mặc định: `http://127.0.0.1:8000`. Có thể cấu hình `VITE_SERVER_URL` và `VITE_API_URL` trong `.env.local`.

Khởi tạo bảng tiến độ ở backend trước khi sử dụng chức năng đồng bộ:

```powershell
cd ../backend_AI_English/backend
python migrate_learning_state.py
python run.py
```

Script migration chỉ tạo bảng `user_learning_states` nếu chưa có, không sửa dữ liệu cũ.

## Luồng học

1. Đăng nhập, chọn mục tiêu và thời gian dự định học mỗi ngày.
2. Home → chủ đề → chọn bài nói hoặc viết.
3. Xem mục tiêu, câu mẫu/đề bài; bắt đầu luyện tập.
4. Nói: luyện từng câu; viết: xem phản hồi, sửa rồi nộp lại.
5. Làm quiz của bài/chủ đề nếu có; ôn bộ từ của bài nếu có.
6. Tổng kết → ghi nhận hoàn thành → bài tiếp theo.

Home có **Tiếp tục học** và **Ôn tập hôm nay**. Các tab vẫn hỗ trợ luyện tự do. Từ lưu từ Speaking/Writing/Chat vào bộ thẻ cá nhân; thẻ quên có thể ôn lại cuối phiên và tiếp tục lịch ôn ngày sau. Chat có mục tiêu tình huống và tổng kết số lượt/từ đã thực hành.

## Trang cá nhân

Nhấn biểu tượng tài khoản ở đầu ứng dụng hoặc ảnh đại diện trên Home để mở **Trang cá nhân**. Người dùng có thể đổi tên hiển thị, trình độ muốn học (Beginner/Intermediate/Advanced), mục tiêu và thời gian dự định học mỗi ngày. Email hiển thị để nhận biết tài khoản. Nút **Lưu thay đổi** lưu các cài đặt qua `PUT /api/v1/auth/preferences` và cập nhật gợi ý trên Home; nút **Hủy** khôi phục giá trị đã lưu. Lỗi kết nối giữ lại các chỉnh sửa để thử lại. API lưu hồ sơ và tùy chọn học trong cùng transaction, giữ nguyên tiến độ và bản nháp.

Tiến độ và bản nháp được cache theo tài khoản trên thiết bị, đồng bộ qua `/api/v1/learning/me`. Lỗi đồng bộ được thông báo; nội dung đang làm được giữ để thử lại. Hoàn thành bài ghi nhận hoạt động, không chứng nhận trình độ. Điểm AI là phản hồi tham khảo. Đề xuất bài hiện dùng trình độ/mục tiêu tự chọn và thứ tự bài, chưa phải mô hình thích ứng được kiểm định.

## Kiểm tra

```powershell
npm test
npm run build
```

Tests kiểm tra logic, đồng bộ và render Vue với API cô lập. Ghi âm, quyền microphone và hoạt động với AI thật cần kiểm tra thêm trong trình duyệt. Tránh sửa đồng thời cùng một bản nháp ở nhiều thiết bị; đồng bộ hiện lưu trạng thái workspace theo tài khoản, chưa có giao diện giải quyết xung đột.
