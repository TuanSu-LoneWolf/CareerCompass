// Import functions and objects from auth.js
// Note: We assume auth.js correctly initializes and exports these
import {
    auth,          // Firebase auth instance
    database,      // Firebase database instance
    GoogleAuthProvider, // Provider for Google Sign-In
    signInWithPopup,    // Function for Google Sign-In popup
    ref,           // Function to create database reference
    set            // Function to write data to database
} from './auth.js';

// Import createUserWithEmailAndPassword directly from Firebase SDK
// because it wasn't explicitly exported in the provided auth.js snippet
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

        // Basic Validation
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
                // Signup successful
                const user = userCredential.user;
                console.log('Đăng ký thành công với Email:', user.uid, user.email);

                // Save user info to Realtime Database (optional, but good practice)
                // IMPORTANT: Never save the password!
                const userRef = ref(database, 'users/' + user.uid);
                set(userRef, {
                    email: user.email,
                    provider: 'email/password', // Track signup method
                    createdAt: new Date().toISOString()
                })
                .then(() => {
                    console.log('Thông tin người dùng đã lưu vào Database.');
                    // Redirect to a success page or the main app page
                    alert('Đăng ký thành công! Bạn sẽ được chuyển đến trang chính.');
                    window.location.href = '../index.html';
                })
                .catch((dbError) => {
                    console.error("Lỗi lưu vào Database:", dbError);
                    displayError('Đăng ký thành công nhưng lỗi lưu thông tin.');
                    // Still might want to redirect or inform user
                    // alert('Đăng ký thành công!');
                    // window.location.href = '../index.html';
                });
            })
            .catch((error) => {
                // Handle signup errors
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

        // --- Firebase Google Signup ---
        signInWithPopup(auth, provider)
            .then((result) => {
                // Google Sign-In successful.
                const credential = GoogleAuthProvider.credentialFromResult(result);
                const token = credential.accessToken; // You might not need this directly
                const user = result.user;

                console.log('Đăng nhập/Đăng ký thành công với Google:', user.uid, user.displayName, user.email);

                // Save or update user info in Realtime Database
                // Using set() here will overwrite existing data if the user previously
                // signed up with email. Consider using update() or checking existence
                // for more complex scenarios.
                const userRef = ref(database, 'users/' + user.uid);
                set(userRef, {
                    email: user.email,
                    displayName: user.displayName || 'N/A', // Use display name from Google
                    photoURL: user.photoURL || '', // Use photo URL from Google
                    provider: 'google.com', // Track signup method
                    lastLogin: new Date().toISOString(),
                    // Optionally merge with existing data instead of overwriting if user exists
                })
                .then(() => {
                    console.log('Thông tin người dùng Google đã lưu/cập nhật vào Database.');
                    // Redirect to the main app page
                    alert('Đăng nhập/Đăng ký với Google thành công!');
                    window.location.href = '../index.html';
                })
                .catch((dbError) => {
                    console.error("Lỗi lưu thông tin Google vào Database:", dbError);
                    displayError('Đăng nhập Google thành công nhưng lỗi lưu thông tin.');
                    // Might still redirect user
                     alert('Đăng nhập/Đăng ký với Google thành công!');
                     window.location.href = '../index.html';
                });

            }).catch((error) => {
                // Handle Google Sign-In errors
                console.error('Lỗi Đăng nhập/Đăng ký Google:', error.code, error.message);
                // Handle specific errors
                if (error.code === 'auth/popup-closed-by-user') {
                    displayError('Cửa sổ đăng nhập Google đã bị đóng.');
                } else if (error.code === 'auth/account-exists-with-different-credential') {
                    displayError('Tài khoản đã tồn tại với phương thức đăng nhập khác.');
                    // You might want to guide the user on how to link accounts here
                } else {
                    displayError('Lỗi khi đăng nhập với Google: ' + error.message);
                }
                // const email = error.customData.email; // Email user tried if available
                // const credential = GoogleAuthProvider.credentialFromError(error); // Credential info
            });
    });
} else {
     console.error("Google signup button not found!");
}