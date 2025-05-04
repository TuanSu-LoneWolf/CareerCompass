// Import functions and objects from auth.js
import {
    auth,          // Firebase auth instance
    database,      // Firebase database instance
    GoogleAuthProvider, // Provider for Google Sign-In
    signInWithPopup,    // Function for Google Sign-In popup
    ref,           // Function to create database reference
    set            // Function to write data to database
} from '../auth.js';

// Import createUserWithEmailAndPassword directly from Firebase SDK
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

// --- DOM Elements ---
const signupForm = document.getElementById('signup-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirm-password');
const googleSignupButton = document.getElementById('google-signup-btn');
const errorMessageDiv = document.getElementById('error-message');

// --- Helper Function to Display Errors ---
function displayError(message) {
    errorMessageDiv.textContent = message;
}

// --- Event Listener for Standard Email/Password Signup ---
if (signupForm) {
    signupForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent default form submission
        displayError(''); // Clear previous errors

        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        // Basic Validation (keep this as is)
        if (!email || !password || !confirmPassword) {
            displayError('Vui lòng điền đầy đủ thông tin.');
            return;
        }
        if (password.length < 6) {
            displayError('Mật khẩu phải có ít nhất 6 ký tự.');
            return;
        }
        if (password !== confirmPassword) {
            displayError('Mật khẩu và xác nhận mật khẩu không khớp.');
            return;
        }

        // --- Firebase Email/Password Signup ---
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                console.log('Đăng ký thành công với Email:', user.uid, user.email);

                const userRef = ref(database, 'users/' + user.uid);
                set(userRef, {
                    email: user.email,
                    provider: 'email/password',
                    createdAt: new Date().toISOString()
                })
                .then(() => {
                    console.log('Thông tin người dùng đã lưu vào Database.');
                    // *** CHANGE HERE ***
                    alert('Đăng ký thành công!');
                    window.location.href = './si.html'; // Redirect to login page
                })
                .catch((dbError) => {
                    console.error("Lỗi lưu vào Database:", dbError);
                    // *** CHANGE HERE (Optional but recommended) ***
                    // Still inform user of success, but maybe mention DB issue?
                    alert('Đăng ký thành công nhưng có lỗi lưu thông tin. Bạn sẽ được chuyển đến trang đăng nhập.');
                    window.location.href = './si.html'; // Still redirect to login page
                });
            })
            .catch((error) => {
                // Handle signup errors (keep this as is)
                console.error('Lỗi Đăng ký Email/Password:', error.code, error.message);
                if (error.code === 'auth/email-already-in-use') {
                    displayError('Địa chỉ email này đã được sử dụng.');
                } else if (error.code === 'auth/weak-password') {
                    displayError('Mật khẩu quá yếu. Vui lòng sử dụng ít nhất 6 ký tự.');
                } else if (error.code === 'auth/invalid-email') {
                    displayError('Địa chỉ email không hợp lệ.');
                }
                 else {
                    displayError('Đã xảy ra lỗi: ' + error.message);
                }
            });
    });
} else {
    console.error("Signup form not found!");
}

// --- Event Listener for Google Signup ---
if (googleSignupButton) {
    googleSignupButton.addEventListener('click', () => {
        displayError(''); // Clear previous errors
        const provider = new GoogleAuthProvider();

        signInWithPopup(auth, provider)
            .then((result) => {
                const user = result.user;
                console.log('Đăng nhập thành công với Google:', user.uid, user.displayName, user.email);

                const userRef = ref(database, 'users/' + user.uid);
                set(userRef, {
                    email: user.email,
                    displayName: user.displayName || 'N/A',
                    photoURL: user.photoURL || '',
                    provider: 'google.com',
                    lastLogin: new Date().toISOString(), // Maybe add createdAt if not exists?
                }, { merge: true }) // Use merge to avoid overwriting createdAt if exists
                .then(() => {
                    console.log('Thông tin người dùng Google đã lưu/cập nhật vào Database.');
                    // *** CHANGE HERE ***
                    alert('Đăng nhập với Google thành công!');
                    window.location.href = '../index.html'; // Redirect to login page
                })
                .catch((dbError) => {
                    console.error("Lỗi lưu thông tin Google vào Database:", dbError);
                    // *** CHANGE HERE (Optional but recommended) ***
                    alert('Đăng nhập Google thành công nhưng có lỗi lưu thông tin. Bạn sẽ được chuyển đến trang đăng nhập.');
                    window.location.href = '../index.html'; // Still redirect to login page
                });

            }).catch((error) => {
                // Handle Google Sign-In errors (keep this as is)
                console.error('Lỗi Đăng nhập Google:', error.code, error.message);
                if (error.code === 'auth/popup-closed-by-user') {
                    displayError('Cửa sổ đăng nhập Google đã bị đóng.');
                } else if (error.code === 'auth/account-exists-with-different-credential') {
                    displayError('Tài khoản đã tồn tại với phương thức đăng nhập khác.');
                } else {
                    displayError('Lỗi khi đăng nhập với Google: ' + error.message);
                }
            });
    });
} else {
     console.error("Google signup button not found!");
}