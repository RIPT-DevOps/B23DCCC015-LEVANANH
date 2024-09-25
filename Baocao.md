# 1.Tìm hiểu về Dockerfile
## Giới thiệu
Docker là một nền tảng cho phép phát triển, vận chuyển và chạy các ứng dụng trong môi trường chứa (container). Dockerfile là một tệp văn bản chứa các chỉ thị để tự động hóa quá trình xây dựng hình ảnh Docker (Docker image). Tệp này mô tả cách tạo một Docker image từ đầu, bao gồm các bước cài đặt phần mềm, sao chép tệp và thiết lập các thông số cần thiết cho ứng dụng.

## Cấu trúc của Dockerfile

Dockerfile bao gồm nhiều chỉ thị khác nhau. Dưới đây là một số chỉ thị phổ biến:

- **FROM**: Xác định hình ảnh cơ sở mà Docker sẽ sử dụng để xây dựng hình ảnh mới.
- **RUN**: Thực thi các lệnh trong container, thường được sử dụng để cài đặt phần mềm.
- **COPY**: Sao chép các tệp từ máy chủ vào trong container.
- **ADD**: Giống như COPY, nhưng có thêm khả năng giải nén tệp tar.
- **CMD**: Chỉ định lệnh mặc định sẽ được thực thi khi container khởi động.
- **ENTRYPOINT**: Thiết lập lệnh chính sẽ được thực thi khi container khởi động, có thể kết hợp với CMD để thêm tham số.
- **EXPOSE**: Cho phép một cổng được mở cho các kết nối từ bên ngoài.
- **ENV**: Thiết lập biến môi trường.
## Ví dụ về Dockerfile

Dưới đây là một ví dụ cơ bản về Dockerfile cho một ứng dụng Node.js:

```dockerfile
# Sử dụng hình ảnh Node.js làm hình ảnh cơ sở
FROM node:14

# Thiết lập thư mục làm việc
WORKDIR /app

# Sao chép package.json và cài đặt các phụ thuộc
COPY package*.json ./
RUN npm install

# Sao chép toàn bộ mã nguồn vào container
COPY . .

# Mở cổng 3000
EXPOSE 3000
# Chạy ứng dụng
CMD ["npm", "start"]

```

# Xây dựng và chạy Docker container
Để xây dựng Image từ Dockerfile, sử dụng lệnh:
```bash
docker build -t my-node-app .
```

Để chạy container từ Image vừa xây dựng, sử dụng lệnh:
```bash
docker run -p 3000:3000 my-node-app
```
# 2. Tìm hiểu về Docker Compose

## Giới thiệu
Docker Compose là một công cụ mạnh mẽ cho phép người dùng định nghĩa và quản lý nhiều container Docker trong một ứng dụng. Với Docker Compose, người dùng có thể cấu hình các dịch vụ, mạng, và volumes cần thiết cho ứng dụng của họ thông qua một tệp YAML duy nhất.
## Tính năng chính
- **Định nghĩa dịch vụ**: Người dùng có thể dễ dàng định nghĩa và cấu hình các dịch vụ cần thiết cho ứng dụng.
- **Quản lý mạng**: Docker Compose tự động tạo ra mạng giữa các container để chúng có thể giao tiếp với nhau.
- **Quản lý volumes**: Cho phép lưu trữ dữ liệu bền vững cho các container.
- **Dễ dàng triển khai**: Chỉ cần một lệnh đơn giản (`docker-compose up`) để khởi động toàn bộ ứng dụng.

## Cấu trúc tệp docker-compose.yml
Tệp `docker-compose.yml` là nơi chứa cấu hình cho ứng dụng Docker Compose. Dưới đây là một ví dụ đơn giản về cấu trúc của tệp này:
```yaml
version: '3.8'

services:
  web:
    image: nginx:latest
    ports:
      - "8080:80"
  
  app:
    build:
      context: .
      dockerfile: Dockerfile
    volumes:
      - .:/app
```

## Giải thích
- **version**: Phiên bản của Docker Compose.
- **services**: Định nghĩa các dịch vụ của ứng dụng.
- **image**: Hình ảnh Docker được sử dụng cho dịch vụ.
- **ports**: Cổng mà dịch vụ sẽ lắng nghe.
- **build**: Cấu hình để build một image từ Dockerfile.
- **volumes**: Thư mục được mount vào container.
- **Cùng nhiều dịch vụ khác như :**
  - **networks**: Định nghĩa mạng cho các dịch vụ.
  - **depends_on**: Định nghĩa thứ tự khởi động các dịch vụ.
  - ...
## Cách sử dụng Docker Compose

- **Cài đặt Docker Compose:**
  - Cài đặt Docker Compose trên máy tính của bạn (thường là Docker Desktop).
- **Tạo tệp docker-compose.yml:**
  - Tạo một tệp văn bản mới và đặt tên là `docker-compose.yml`.
  - Định nghĩa cấu hình cho các dịch vụ trong tệp này.
- **Khởi động ứng dụng:**
  - Sử dụng lệnh `docker-compose up` để khởi động toàn bộ ứng dụng.
  - Sử dụng lệnh `docker-compose up -d` để khởi động ứng dụng ở chế độ background.
- **Quản lý ứng dụng:**
  - Sử dụng lệnh `docker-compose down` để dừng và xóa các container được quản lý bởi Docker Compose.

