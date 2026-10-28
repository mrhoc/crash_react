# Crash Game Trend Analysis & Prediction

Ứng dụng React để phân tích xu hướng và dự đoán kết quả của game Crash dựa trên mã hash.

## Tính năng chính

### 1. Phân tích xu hướng hiện tại
- Nhập mã hash vào input để xem đồ thị xu hướng
- Hiển thị đồ thị cho các mức bet: 100, 300, 500, 1000, 1500, 2500, 5000, 10000, 30000
- Tính toán điểm số tích lũy (xanh = thắng, đỏ = thua)
- Phân tích xu hướng với các chỉ số:
  - **Trend**: Xu hướng (Upward/Downward/Sideways)
  - **Change**: Thay đổi điểm số
  - **Volatility**: Độ biến động
  - **Confidence**: Độ tin cậy dự đoán

### 2. Dự đoán xu hướng tương lai
- Dự đoán xu hướng cho 1000 bet tiếp theo (có thể thay đổi)
- Hiển thị đồ thị dự đoán riêng biệt
- Sử dụng thuật toán game để tính toán kết quả

### 3. Giao diện người dùng
- Thiết kế responsive và hiện đại
- Hỗ trợ zoom và pan trên biểu đồ
- Màu sắc trực quan (xanh = tăng, đỏ = giảm)
- Animation và hiệu ứng mượt mà

## Cách sử dụng

### Bước 1: Nhập mã hash
- Nhập mã hash vào ô input "Enter Hash"
- Mã hash sẽ được sử dụng làm điểm bắt đầu cho thuật toán

### Bước 2: Chọn số lượng bet
- Sử dụng các nút để chọn số lượng bet muốn xem
- Mặc định là 500 bet
- Có thể chọn từ 100 đến 30000 bet

### Bước 3: Xem phân tích xu hướng
- Đồ thị hiện tại sẽ hiển thị xu hướng của các bet đã chọn
- Phần "Trend Analysis" sẽ hiển thị các chỉ số phân tích

### Bước 4: Xem dự đoán
- Nhập số lượng bet muốn dự đoán
- Nhấn "Show Prediction" để hiển thị đồ thị dự đoán
- Đồ thị dự đoán sẽ hiển thị xu hướng cho các bet tiếp theo

## Thuật toán

Ứng dụng sử dụng thuật toán tương tự như game Crash:

1. **HMAC-SHA256**: Sử dụng salt cố định để tạo seed
2. **Random Generation**: Chuyển đổi seed thành số ngẫu nhiên
3. **Game Logic**: Tính toán kết quả crash (>=2 = thắng, <2 = thua)
4. **Hash Chain**: Mỗi bet sử dụng hash của bet trước đó

## Cài đặt và chạy

```bash
# Cài đặt dependencies
npm install

# Chạy ứng dụng
npm start

# Build cho production
npm run build
```

## Dependencies

- **React**: Framework UI
- **Chart.js**: Thư viện vẽ biểu đồ
- **react-chartjs-2**: Wrapper React cho Chart.js
- **crypto-js**: Thư viện mã hóa
- **axios**: HTTP client

## Lưu ý

- Dự đoán chỉ mang tính chất tham khảo
- Kết quả thực tế có thể khác với dự đoán
- Sử dụng thông tin này một cách có trách nhiệm
- Không đảm bảo lợi nhuận từ việc sử dụng ứng dụng

## Cải tiến tương lai

- Thêm nhiều thuật toán dự đoán
- Lưu trữ lịch sử dự đoán
- Thêm thông báo khi có xu hướng đặc biệt
- Tích hợp với API game thực tế
- Thêm biểu đồ thống kê chi tiết
