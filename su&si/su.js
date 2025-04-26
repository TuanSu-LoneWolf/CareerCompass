// Import các hàm và biến cần thiết từ auth.js
import {
    auth,
    database,
    createUserWithEmailAndPassword, // Hàm đăng ký bằng email/pass
    GoogleAuthProvider,           // Provider cho Google
    signInWithPopup,              // Hàm đăng nhập/đăng ký bằng popup (cho Google)
    ref,                          // Hàm tạo tham chiếu đến vị trí DB
    set                           // Hàm ghi dữ liệu vào DB (tạo mới hoặc ghi đè)
} from './auth.js';

document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');
    const googleSignupBtn = document.getElementById('google-signup-btn');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const errorMessageDiv = document.getElementById('error-message');

    // --- Hàm tiện ích ---
    function displayError(message) {
        if (errorMessageDiv) {
            errorMessageDiv.textContent = message;
        } else {
            alert(message); // Fallback
        }
        console.error("Signup Error:", message);
    }

    function clearError() {
        if (errorMessageDiv) {
            errorMessageDiv.textContent = '';
        }
    }

    // --- Hàm xử lý sau khi đăng ký/đăng nhập thành công ---
    function handleAuthSuccess(user) {
        console.log('Đăng ký/Đăng nhập thành công:', user.uid);
        clearError();

        // Lưu thông tin cơ bản vào Realtime Database
        // Quan trọng: KHÔNG lưu mật khẩu vào database
        const userRef = ref(database, 'users/' + user.uid);
        const userData = {
            email: user.email,
            uid: user.uid,
            createdAt: new Date().toISOString(), // Thời gian tạo tài khoản
            provider: user.providerData?.[0]?.providerId || 'password', // Lưu phương thức đăng ký/đăng nhập
        };
         // Thêm displayName và photoURL nếu có (thường từ Google)
        if (user.displayName) {
            userData.displayName = user.displayName;
        }
        if (user.photoURL) {
             userData.photoURL = user.photoURL;
        }


        set(userRef, userData, { merge: true }) // Dùng set với merge để tạo mới hoặc cập nhật nếu login Google vào tk đã có
            .then(() => {
                console.log('Thông tin người dùng đã được lưu/cập nhật vào DB.');
                 // Chuyển hướng đến trang chính hoặc trang chào mừng
                window.location.href = 'index.html'; // Hoặc trang khác tùy ý
            })
            .catch((dbError) => {
                console.error("Lỗi lưu dữ liệu vào Database:", dbError);
                // Vẫn có thể chuyển hướng nhưng báo lỗi lưu DB
                displayError('Đăng ký/Đăng nhập thành công nhưng có lỗi khi lưu thông tin.');
                 // Có thể vẫn chuyển hướng nếu lỗi không quá nghiêm trọng
                 // window.location.href = 'index.html';
            });
    }

    // --- 1. Xử lý đăng ký bằng Email/Password ---
    if (signupForm) {
        signupForm.addEventListener('submit', (event) => {
            event.preventDefault();
            clearError();

            const email = emailInput.value.trim();
            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;

            // --- Validation cơ bản ---
            if (!email || !password || !confirmPassword) {
                displayError('Vui lòng nhập đầy đủ thông tin.');
                return;
            }
            if (password !== confirmPassword) {
                displayError('Mật khẩu và xác nhận mật khẩu không khớp.');
                return;
            }
            // Firebase tự kiểm tra độ dài tối thiểu (thường là 6)
            // Bạn có thể thêm các validation phức tạp hơn nếu muốn

            // --- Gọi Firebase Auth ---
            createUserWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    // Đăng ký thành công
                    handleAuthSuccess(userCredential.user);
                })
                .catch((error) => {
                    // Xử lý lỗi đăng ký
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    console.error("Email/Pass Signup Error Code:", errorCode);

                    if (errorCode === 'auth/email-already-in-use') {
                        displayError('Địa chỉ email này đã được sử dụng. Vui lòng thử đăng nhập hoặc dùng email khác.');
                    } else if (errorCode === 'auth/weak-password') {
                        displayError('Mật khẩu quá yếu. Vui lòng chọn mật khẩu mạnh hơn (ít nhất 6 ký tự).');
                    } else if (errorCode === 'auth/invalid-email') {
                        displayError('Địa chỉ email không hợp lệ.');
                    } else {
                        displayError(`Lỗi đăng ký: ${errorMessage}`);
                    }
                });
        });
    }

    // --- 2. Xử lý đăng ký/đăng nhập bằng Google ---
    if (googleSignupBtn) {
        googleSignupBtn.addEventListener('click', () => {
            clearError();
            const provider = new GoogleAuthProvider();

            signInWithPopup(auth, provider)
                .then((result) => {
                    // Đăng nhập/Đăng ký bằng Google thành công
                    handleAuthSuccess(result.user);
                })
                .catch((error) => {
                    // Xử lý lỗi
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    console.error("Google Signup/Login Error Code:", errorCode, errorMessage);

                    if (errorCode === 'auth/popup-closed-by-user') {
                        displayError('Cửa sổ đăng nhập Google đã bị đóng.');
                    } else if (errorCode === 'auth/account-exists-with-different-credential') {
                         // Lỗi này ít xảy ra với signInWithPopup nếu cấu hình đúng,
                         // nhưng có thể hiển thị nếu cần.
                         displayError('Tài khoản đã tồn tại với phương thức đăng nhập khác.');
                    } else {
                        displayError(`Lỗi khi tiếp tục với Google: ${errorMessage}`);
                    }
                });
        });
    }

});
