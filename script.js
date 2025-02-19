var index = 0;
changeImage = function changeImage() {
  var imgs = [
    "../Vocationalguidancewebsite/image/nganhcongnghethongtin.jpg",
    "../Vocationalguidancewebsite/image/cokhidientu.jpg",
    "../Vocationalguidancewebsite/image/congnghethucpham.jpg",
    "../Vocationalguidancewebsite/image/xaydung.jpg",
    "../Vocationalguidancewebsite/image/marketing.jpg",
    "../Vocationalguidancewebsite/image/nganhkientruc.jpg",
    "../Vocationalguidancewebsite/image/teacher.jpg",
    "../Vocationalguidancewebsite/image/doctor.jpg",
    "../Vocationalguidancewebsite/image/logistics.jpg",
    "../Vocationalguidancewebsite/image/accounting.jpeg",
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
