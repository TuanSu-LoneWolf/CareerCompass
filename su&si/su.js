document.querySelector('form').addEventListener('submit', function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const terms = document.getElementById('terms').checked;

    if (username === '') {
        alert('Vui lòng nhập tên đăng nhập.');
        return;
    }

    if (password === '') {
        alert('Vui lòng nhập mật khẩu.');
        return;
    }

    if (!terms) {
        alert('Vui lòng đồng ý với các điều khoản và điều kiện.');
        return;
    }
    alert('Đăng ký thành công!');
});