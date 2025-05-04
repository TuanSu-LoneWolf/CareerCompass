// Import các hàm và biến cần thiết từ auth.js
import { auth, database, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, ref, update, set } from '../auth.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const googleLoginBtn = document.getElementById('google-login-btn');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const errorMessageDiv = document.getElementById('error-message');

    // Hàm hiển thị lỗi (keep as is)
    function displayError(message) {
        if (errorMessageDiv) {
            errorMessageDiv.textContent = message;
        } else {
            alert(message);
        }
        console.error("Login Error:", message);
    }

    // Hàm xóa lỗi (keep as is)
    function clearError() {
         if (errorMessageDiv) {
            errorMessageDiv.textContent = '';
        }
    }

    // Hàm xử lý sau khi đăng nhập thành công
    function handleLoginSuccess(user) {
        console.log('Đăng nhập thành công:', user.uid);
        clearError(); // Xóa thông báo lỗi nếu có

        // *** ADD ALERT HERE ***
        alert('Đăng nhập thành công!'); // Show success message

        // Lưu UID vào localStorage (tùy chọn)
        localStorage.setItem('loggedInUserId', user.uid);

        // Cập nhật thời gian đăng nhập cuối cùng (tùy chọn)
        const userRef = ref(database, 'users/' + user.uid);
        const dt = new Date().toISOString();
        update(userRef, {
            last_login: dt,
            // Cập nhật lại thông tin nếu có thể (đặc biệt sau Google login)
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL
        }).catch(dbError => {
            // Chỉ cảnh báo, không chặn chuyển hướng
            console.warn("Không thể cập nhật last_login hoặc thông tin user:", dbError);
        }).finally(() => {
            // *** MOVE REDIRECT HERE (inside finally) ***
            // Chuyển hướng đến trang chính sau khi đã alert và cố gắng cập nhật DB
            window.location.href = '../index.html'; // Chuyển đến trang chủ
        });
        // *** REMOVE REDIRECT FROM HERE ***
        // window.location.href = '../index.html'; // Moved to finally block
    }

    // 1. Xử lý đăng nhập bằng Email/Password
    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();
            clearError();

            const email = emailInput.value.trim();
            const password = passwordInput.value;

            if (!email || !password) {
                displayError('Vui lòng nhập đầy đủ email và mật khẩu!');
                return;
            }

            signInWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    // Đăng nhập thành công -> gọi hàm xử lý chung
                    handleLoginSuccess(userCredential.user);
                })
                .catch((error) => {
                    // Xử lý lỗi đăng nhập (keep as is)
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
            clearError();
            const provider = new GoogleAuthProvider();

            signInWithPopup(auth, provider)
                .then((result) => {
                    const user = result.user;

                    // Kiểm tra và ghi/cập nhật thông tin cơ bản vào DB nếu cần
                    const userRef = ref(database, 'users/' + user.uid);
                     set(userRef, { // Dùng set với merge để đảm bảo thông tin Google là mới nhất
                        email: user.email,
                        displayName: user.displayName || 'Người dùng Google',
                        photoURL: user.photoURL || '',
                        provider: 'google.com',
                        // createdAt: new Date().toISOString() // Chỉ ghi lần đầu nếu dùng logic khác
                    }, { merge: true }) // merge: true quan trọng để không xóa các trường khác
                    .then(() => {
                         // Sau khi DB được cập nhật (hoặc tạo), gọi hàm xử lý đăng nhập thành công
                         handleLoginSuccess(user);
                    })
                    .catch(dbError => {
                        console.error("Lỗi khi ghi/cập nhật dữ liệu người dùng Google:", dbError);
                        // Vẫn cho đăng nhập thành công nhưng báo lỗi lưu DB
                        displayError("Đăng nhập Google thành công nhưng có lỗi khi lưu thông tin.");
                        // Quyết định: Vẫn gọi handleLoginSuccess để alert và chuyển hướng
                        handleLoginSuccess(user);
                    });
                })
                .catch((error) => {
                    // Xử lý lỗi khi đăng nhập Google (keep as is)
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    console.error("Google Login Error Code:", errorCode, errorMessage);

                    if (errorCode === 'auth/popup-closed-by-user') {
                        displayError('Cửa sổ đăng nhập Google đã bị đóng.');
                    } else if (errorCode === 'auth/account-exists-with-different-credential') {
                         displayError('Tài khoản đã tồn tại với phương thức đăng nhập khác (ví dụ: email/password).');
                    } else {
                        displayError(`Lỗi đăng nhập Google: ${errorMessage}`);
                    }
                });
        });
    }
});
