let userInfo = {}; // Đặt ở đầu script

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

let selectedMode = null; // Biến lưu chế độ được chọn

// Xử lý khi chọn 1 mode-card
document.querySelectorAll('.mode-card:not(.disabled)').forEach(card => {
  card.addEventListener('click', function () {
    // Bỏ lớp selected khỏi tất cả các card
    document.querySelectorAll('.mode-card').forEach(c => c.classList.remove('selected'));

    // Thêm lớp selected cho card được chọn
    this.classList.add('selected');

    // Lưu chế độ được chọn từ data-mode
    selectedMode = this.getAttribute('data-mode');
  });
});

// Xử lý khi nhấn nút Tiếp tục
document.getElementById('continueButton').addEventListener('click', function () {
  if (!selectedMode) {
    alert("Vui lòng chọn chế độ phỏng vấn trước khi tiếp tục.");
    return;
  }

  // Ví dụ: bạn có thể lưu selectedMode vào biến toàn cục hay localStorage nếu cần dùng tiếp
  console.log("Chế độ đã chọn:", selectedMode);

  // Chuyển đến màn hình interview (bạn phải có element với id='interview-screen')
  switchScreen('interview-screen');

  // Gán nội dung nghề nghiệp sau khi chuyển màn hình
  document.getElementById('user-career-display').textContent = `Phỏng vấn bằng Chat: ${userInfo.career}`;
  document.getElementById('user-name-display-interview').textContent = `Ứng viên: ${userInfo.name}`;
  document.getElementById('user-age-display-interview').textContent = `Tuổi: ${userInfo.age}`;
});

//Chat container

// Thêm phần tử <h2> vào trong chat-header
chatHeader.appendChild(h2Element);
