var index = 0;
changeImage = function changeImage() {
  var imgs = [
    "../image/nganhcongnghethongtin.jpg",
    "../image/cokhidientu.jpg",
    "../image/congnghethucpham.jpg",
    "../image/xaydung.jpg",
    "../image/marketing.jpg",
    "../image/nganhkientruc.jpg",
    "../image/teacher.jpg",
    "../image/doctor.jpg",
    "../image/logistics.jpg",
    "../image/accounting.jpeg",
  ];
  var imgElement = document.getElementById("img1");

  // Tạo hiệu ứng mờ dần bằng cách giảm opacity về 0
  imgElement.style.opacity = 0;

  // Sau khi ảnh mờ dần, thay đổi ảnh
  setTimeout(function () {
    imgElement.src = imgs[index]; // Cập nhật ảnh mới
    imgElement.style.opacity = 1; // Đặt lại độ mờ (opacity) của ảnh mới
  }, 2000); // Đợi 2 giây để ảnh mờ dần

  // Cập nhật chỉ số ảnh
  index++;
  if (index == imgs.length) {
    index = 0; // Nếu hết ảnh thì quay lại ảnh đầu tiên
  }
};

// Chạy hàm thay đổi ảnh mỗi 4 giây (2 giây mờ dần + 2 giây cho ảnh mới hiện)
setInterval(changeImage, 4000);

/*Lưu đăng ký, đăng nhập*/
import { auth } from './auth.js';
            import { signOut } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js'; // Import hàm signOut
        
            document.addEventListener('DOMContentLoaded', () => {
                const signupLink = document.getElementById('signupLink');
                const loginLink = document.getElementById('loginLink');
                const userLogoContainer = document.getElementById('userLogoContainer');
                const userLogo = document.getElementById('userLogo');
                const logoutBtn = document.getElementById('logoutBtn'); // Lấy tham chiếu nút đăng xuất
        
                console.log('auth instance trên trang chủ:', auth);
                console.log('onAuthStateChanged trên trang chủ đang chạy!');
        
                auth.onAuthStateChanged((user) => {
                    console.log('Trạng thái đăng nhập trên trang chủ:', user);
                    if (user) {
                        signupLink.style.display = 'none';
                        loginLink.style.display = 'none';
                        userLogo.src = user.photoURL || './Logo.svg';
                        userLogoContainer.style.display = 'block';
                    } else {
                        signupLink.style.display = 'block';
                        loginLink.style.display = 'block';
                        userLogoContainer.style.display = 'none';
                    }
                });
        
                // Thêm event listener cho nút đăng xuất
                if (logoutBtn) {
                    logoutBtn.addEventListener('click', () => {
                        signOut(auth).then(() => {
                            // Đăng xuất thành công.  onAuthStateChanged sẽ được kích hoạt và cập nhật giao diện.
                            console.log('Đăng xuất thành công.');
                            // Không cần chuyển hướng thủ công ở đây vì onAuthStateChanged sẽ xử lý việc hiển thị nút đăng nhập.
                        }).catch((error) => {
                            // Xảy ra lỗi trong quá trình đăng xuất.
                            console.error('Lỗi đăng xuất:', error);
                            alert('Đã xảy ra lỗi khi đăng xuất.');
                        });
                    });
                }
            });
