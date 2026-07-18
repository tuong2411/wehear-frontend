# WeHear Frontend

Frontend của WeHear là ứng dụng web hỗ trợ học, tra cứu và dịch Ngôn ngữ ký hiệu Việt Nam. Phần giao diện được xây dựng bằng Next.js App Router, kết nối với backend Spring Boot và các API AI phục vụ nhận diện/dịch ký hiệu.

## Chức năng chính

- Trang chủ giới thiệu nền tảng WeHear.
- Tra cứu từ điển Ngôn ngữ ký hiệu Việt Nam.
- Xem video minh họa từng từ vựng ký hiệu.
- Học theo chủ đề/cấp độ thông qua bài học.
- Làm quiz sau mỗi bài học.
- Dịch ký hiệu bằng camera realtime hoặc video tải lên.
- Dịch chuỗi từ VSL sang câu tiếng Việt tự nhiên.
- Cộng đồng hỏi đáp, chia sẻ bài viết, media và bình luận.
- Đăng ký, đăng nhập, quên mật khẩu và đặt lại mật khẩu.
- Quản lý hồ sơ cá nhân.
- Trang quản trị người dùng, bài học, quiz, từ điển, tin tức, cộng đồng và đóng góp.

## Công nghệ

- Next.js 15 App Router
- React 19
- TypeScript
- Tailwind CSS
- Axios
- MediaPipe Tasks Vision
- Cloudinary cho hiển thị/upload media

## Minh chứng giao diện

Các ảnh dưới đây được lấy từ phần minh chứng kiểm thử trong báo cáo thesis tại `../BaoCao/Thesis/minh_chung/chapter5`.

### Xác thực

![Đăng ký tài khoản mới hợp lệ](../BaoCao/Thesis/minh_chung/chapter5/MC-AU-01-01.png)

![Đăng nhập thành công](../BaoCao/Thesis/minh_chung/chapter5/MC-AU-03.png)

![Từ chối đăng nhập sai mật khẩu](../BaoCao/Thesis/minh_chung/chapter5/MC-AU-04.png)

### Từ điển và video minh họa

![Danh sách từ điển ký hiệu](../BaoCao/Thesis/minh_chung/chapter5/DI-01.png)

![Tìm kiếm từ khóa trong từ điển](../BaoCao/Thesis/minh_chung/chapter5/MC-DI-02-01.png)

![Lọc từ điển theo khu vực](../BaoCao/Thesis/minh_chung/chapter5/MC-DI-03-01.png)

![Chi tiết ký hiệu và video minh họa](../BaoCao/Thesis/minh_chung/chapter5/MC-DI-04-01.png)

### Bài học và quiz

![Danh sách bài học](../BaoCao/Thesis/minh_chung/chapter5/LE-01.png)

![Chi tiết bài học và quiz](../BaoCao/Thesis/minh_chung/chapter5/LE-02.png)

![Tạo bài học trong trang quản trị](../BaoCao/Thesis/minh_chung/chapter5/LE-03.png)

### Dịch ký hiệu

![Trang dịch với các chế độ thao tác](../BaoCao/Thesis/minh_chung/chapter5/TR-01.png)

![Dịch chuỗi VSL sang tiếng Việt](../BaoCao/Thesis/minh_chung/chapter5/TR-03.png)

![Nhận diện ký hiệu từ video tải lên](../BaoCao/Thesis/minh_chung/chapter5/TR-04.png)

![Dịch realtime bằng camera](../BaoCao/Thesis/minh_chung/chapter5/TR-05.png)

### Cộng đồng

![Người dùng đăng bài mới](../BaoCao/Thesis/minh_chung/chapter5/CM-01.png)

![Upload media cho bài viết cộng đồng](../BaoCao/Thesis/minh_chung/chapter5/CM-02.png)

![Bình luận và trả lời bình luận](../BaoCao/Thesis/minh_chung/chapter5/CM-03.png)

### Đóng góp từ điển

![Người dùng gửi đóng góp hợp lệ](../BaoCao/Thesis/minh_chung/chapter5/CO-01.png)

![Kiểm tra dữ liệu đóng góp không hợp lệ](../BaoCao/Thesis/minh_chung/chapter5/CO-02.png)

![Quản trị viên xử lý đóng góp](../BaoCao/Thesis/minh_chung/chapter5/CO-03.png)

### Tin tức

![Danh sách tin tức](../BaoCao/Thesis/minh_chung/chapter5/NE-01.png)

![Chi tiết tin tức](../BaoCao/Thesis/minh_chung/chapter5/NE-02.png)

![Quản trị viên cập nhật tin tức](../BaoCao/Thesis/minh_chung/chapter5/NE-03.png)

### Quản trị

![Dashboard quản trị](../BaoCao/Thesis/minh_chung/chapter5/AD-01.png)

![Khu vực quản lý dữ liệu](../BaoCao/Thesis/minh_chung/chapter5/AD-02.png)

![Chặn truy cập quản trị khi chưa xác thực](../BaoCao/Thesis/minh_chung/chapter5/AD-03.png)

## Chạy frontend

```bash
npm install
npm run dev
```

Mặc định frontend chạy tại:

```text
http://localhost:3001
```

## Ghi chú minh chứng

- Báo cáo hiện có ảnh minh chứng cho các nhóm: xác thực, từ điển, bài học/quiz, dịch, cộng đồng, đóng góp, tin tức và quản trị.
- Trong thư mục minh chứng hiện tại chưa có ảnh riêng cho trang chủ, quên mật khẩu và hồ sơ cá nhân, nên README chỉ nhúng các ảnh đã tồn tại.
