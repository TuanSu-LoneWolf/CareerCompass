// Import các hàm và biến cần thiết từ auth.js
import { auth, database, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, ref, update, set } from './auth.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const googleLoginBtn = document.getElementById('google-login-btn');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const errorMessageDiv = document.getElementById('error-message'); // Lấy thẻ div báo lỗi

    // Hàm hiển thị lỗi
    function displayError(message) {
        if (errorMessageDiv) {
            errorMessageDiv.textContent = message;
        } else {
            alert(message); // Fallback nếu không tìm thấy div lỗi
        }
        console.error("Login Error:", message); // Log lỗi ra console
    }

    // Hàm xóa lỗi
    function clearError() {
         if (errorMessageDiv) {
            errorMessageDiv.textContent = '';
        }
    }

    // Hàm xử lý sau khi đăng nhập thành công
    function handleLoginSuccess(user) {
        console.log('Đăng nhập thành công:', user.uid);
        clearError(); // Xóa thông báo lỗi nếu có

        // Lưu UID vào localStorage (tùy chọn)
        localStorage.setItem('loggedInUserId', user.uid);

        // Cập nhật thời gian đăng nhập cuối cùng (tùy chọn)
        const userRef = ref(database, 'users/' + user.uid);
        const dt = new Date().toISOString(); // Sử dụng ISO string cho chuẩn hóa
        update(userRef, {
            last_login: dt,
            // Nếu đăng nhập bằng Google và muốn lưu thêm thông tin
            email: user.email, // Đảm bảo email được cập nhật
            displayName: user.displayName, // Lưu tên hiển thị
            photoURL: user.photoURL // Lưu ảnh đại diện
        }).catch(dbError => {
            console.warn("Không thể cập nhật last_login:", dbError); // Dùng warn vì đăng nhập vẫn thành công
        });

        // Chuyển hướng đến trang chính sau khi đăng nhập
        window.location.href = '../index.html'; // Chuyển đến trang chủ
    }

    // 1. Xử lý đăng nhập bằng Email/Password
    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Ngăn form gửi đi theo cách mặc định
            clearError(); // Xóa lỗi cũ trước khi thử đăng nhập

            const email = emailInput.value.trim(); // .trim() để xóa khoảng trắng thừa
            const password = passwordInput.value;

            if (!email || !password) {
                displayError('Vui lòng nhập đầy đủ email và mật khẩu!');
                return;
            }

            signInWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    // Đăng nhập thành công
                    handleLoginSuccess(userCredential.user);
                })
                .catch((error) => {
                    // Xử lý lỗi đăng nhập
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    console.error("Email/Pass Login Error Code:", errorCode);
                    if (errorCode === 'auth/user-not-found' || errorCode === 'auth/wrong-password' || errorCode === 'auth/invalid-credential') {
                         displayError('Email hoặc mật khẩu không chính xác.');
                    } else if (errorCode === 'auth/invalid-email') {
                         displayError('Địa chỉ email không hợp lệ.');
                    } else {
                         displayError(`Lỗi đăng nhập: ${errorMessage}`);
                    }
                });
        });
    }

    // 2. Xử lý đăng nhập bằng Google
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', () => {
            clearError(); // Xóa lỗi cũ
            const provider = new GoogleAuthProvider();

            // Optional: Yêu cầu thêm quyền (ví dụ: email, profile mặc định được yêu cầu)
            // provider.addScope('https://www.googleapis.com/auth/contacts.readonly');

            signInWithPopup(auth, provider)
                .then((result) => {
                    // Đăng nhập/Đăng ký bằng Google thành công
                    const credential = GoogleAuthProvider.credentialFromResult(result);
                    // const token = credential.accessToken; // Token truy cập Google API (nếu cần)
                    const user = result.user;

                    // Kiểm tra xem người dùng có mới không và ghi thông tin cơ bản vào DB nếu cần
                    const userRef = ref(database, 'users/' + user.uid);
                     set(userRef, { // Dùng set để tạo mới hoặc ghi đè nếu đã có từ email/pass
                        email: user.email,
                        displayName: user.displayName || 'Người dùng Google', // Tên hiển thị
                        photoURL: user.photoURL || '', // Ảnh đại diện
                        provider: 'google.com', // Đánh dấu là đăng nhập từ Google
                        createdAt: new Date().toISOString() // Chỉ ghi lần đầu nếu dùng logic kiểm tra tồn tại
                    }, { merge: true }) // Dùng merge: true để không xóa các trường khác nếu user đã tồn tại
                    .then(() => {
                         handleLoginSuccess(user); // Gọi hàm xử lý chung sau khi đảm bảo dữ liệu DB được cập nhật
                    })
                    .catch(dbError => {
                        console.error("Lỗi khi ghi/cập nhật dữ liệu người dùng Google:", dbError);
                        // Vẫn cho đăng nhập thành công nhưng báo lỗi lưu DB
                        displayError("Đăng nhập Google thành công nhưng có lỗi khi lưu thông tin người dùng.");
                        // Hoặc gọi handleLoginSuccess nếu lỗi lưu DB không quá nghiêm trọng
                        // handleLoginSuccess(user);
                    });

                })
                .catch((error) => {
                    // Xử lý lỗi khi đăng nhập Google
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    // const email = error.customData.email; // Email người dùng cố gắng đăng nhập (nếu có)
                    // const credential = GoogleAuthProvider.credentialFromError(error); // Thông tin credential (nếu có)

                    console.error("Google Login Error Code:", errorCode, errorMessage);

                    if (errorCode === 'auth/popup-closed-by-user') {
                        displayError('Cửa sổ đăng nhập Google đã bị đóng.');
                    } else if (errorCode === 'auth/account-exists-with-different-credential') {
                         displayError('Tài khoản đã tồn tại với phương thức đăng nhập khác (ví dụ: email/password).');
                         // Có thể hướng dẫn người dùng liên kết tài khoản nếu cần
                    } else {
                        displayError(`Lỗi đăng nhập Google: ${errorMessage}`);
                    }
                });
        });
    }
});
