// Load nghề từ file JSON (giả sử bạn đặt nó trong public/data)
fetch('/data/processed/data.json')
  .then(response => response.json())
  .then(json => {
    console.log("Dữ liệu JSON nhận được:", json);  // Thêm dòng này để kiểm tra

    const careers = json.data.careers;
    const select = document.getElementById("career");
    careers.forEach(career => {
      const option = document.createElement("option");
      option.value = career.name;
      option.textContent = career.name;
      select.appendChild(option);
    });
  });

  console.log("infoPage.js đã được tải ✅");
  

// document.getElementById("infoForm").addEventListener("submit", function (e) {
//   e.preventDefault();

//   const name = document.getElementById("name").value;
//   const age = document.getElementById("age").value;
//   const career = document.getElementById("career").value;

//   const params = new URLSearchParams({ name, age, career });
//   window.location.href = `index.html?${params.toString()}`;
// });

//Switch screen
function switchScreen(screenId) {
  document.getElementById('info-screen').style.display = 'none';
  document.getElementById('mode-screen').style.display = 'none';

  document.getElementById(screenId).style.display = 'block';
}

//Back screen
document.getElementById('backButton').addEventListener('click', function () {
  switchScreen('info-screen');
});

document.getElementById("infoForm").addEventListener("submit", function (e) {
  e.preventDefault(); // Ngừng hành động mặc định của form

  // Lấy giá trị của các trường nhập liệu
  const nameInput = document.getElementById('fullName');
  const ageInput = document.getElementById('age');
  const careerInput = document.getElementById('career');

  // Làm sạch viền của các trường nhập liệu trước khi kiểm tra lại
  nameInput.style.borderColor = '';
  ageInput.style.borderColor = '';
  careerInput.style.borderColor = '';

  // Kiểm tra tính hợp lệ của các trường
  let isValid = true;

  // Kiểm tra tên
  if (!nameInput.value.trim()) {
    nameInput.style.borderColor = '#e74c3c'; // Đánh dấu tên nếu trống
    isValid = false;
  }

  // Kiểm tra tuổi
  if (!ageInput.value || ageInput.value < 15 || ageInput.value > 60) {
    ageInput.style.borderColor = '#e74c3c'; // Đánh dấu tuổi nếu không hợp lệ
    isValid = false;
  }

  // Kiểm tra nghề nghiệp
  if (!careerInput.value) {
    careerInput.style.borderColor = '#e74c3c'; // Đánh dấu nghề nghiệp nếu chưa chọn
    isValid = false;
  }

  // Nếu thông tin hợp lệ, lưu thông tin người dùng và chuyển màn hình
  let userInfo = {}; // Đặt ở đầu script

  if (isValid) {
    userInfo = {
      name: nameInput.value.trim(),
      age: ageInput.value,
      career: careerInput.value,
    };

    // Cập nhật tên người dùng trên màn hình chọn chế độ
    document.getElementById('user-name-display').textContent = userInfo.name;

    // Tiếp tục chuyển đến màn hình chế độ (giả sử bạn sẽ gọi hàm chuyển màn hình ở đây)
    switchScreen('mode-screen');
  } else {
    alert('Vui lòng điền đầy đủ thông tin trước khi tiếp tục');
  }
});
