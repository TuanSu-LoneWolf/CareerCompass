// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getDatabase, set, ref, update, get } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    signOut
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-storage.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyD8L_WuO4BeE2_MzsMgIV3ooWKmCaqOyE0",
    authDomain: "career-compass-318e7.firebaseapp.com",
    projectId: "career-compass-318e7",
    storageBucket: "career-compass-318e7.firebasestorage.app",
    messagingSenderId: "745724931177",
    appId: "1:745724931177:web:6a85fc478c7c2989ac46f8",
    measurementId: "G-5PW2LJZ4BW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);
const storage = getStorage(app);

// --- Sign Up Logic ---
document.addEventListener('DOMContentLoaded', function() {
    const signUpButton = document.getElementById('signUp');

    if (signUpButton) {
        signUpButton.addEventListener('click', (event) => {
            event.preventDefault();

            const emailInput = document.getElementById('rEmail');
            const passwordInput = document.getElementById('rpassword');
            const confirmPasswordInput = document.getElementById('cpassword');

            if (!emailInput || !passwordInput || !confirmPasswordInput) {
                console.error("Sign up form elements not found!");
                alert("Lỗi: Không tìm thấy các ô nhập liệu đăng ký.");
                return;
            }

            const email = emailInput.value;
            const password = passwordInput.value;
            const cpassword = confirmPasswordInput.value;

            if (!email || !password || !cpassword) {
                alert("Vui lòng nhập đầy đủ thông tin đăng ký.");
                return;
            }

            if (password !== cpassword) {
                alert("Mật khẩu và xác nhận mật khẩu không khớp.");
                return;
            }

            createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                console.log('Sign up successful for user:', user.uid);

                const userRef = ref(database, 'users/' + user.uid);
                return set(userRef, {
                    email: user.email,
                    createdAt: new Date().toISOString(),
                    profile: {
                        name: '',
                        dob: '',
                        gender: '',
                        fav_career: '',
                        career_orientation: '',
                        strengths: '',
                        weaknesses: '',
                        mbti: ''
                    }
                });
            })
            .then(() => {
                console.log('User data initialised in database.');
                alert('Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.');
                window.location.href = 'si.html';
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.error("Sign up error:", errorCode, errorMessage);

                if (errorCode === 'auth/email-already-in-use') {
                    alert('Địa chỉ email này đã được sử dụng. Vui lòng sử dụng email khác hoặc đăng nhập.');
                } else if (errorCode === 'auth/weak-password') {
                    alert('Mật khẩu quá yếu. Vui lòng chọn mật khẩu mạnh hơn (ít nhất 6 ký tự).');
                } else if (errorCode === 'auth/invalid-email') {
                     alert('Địa chỉ email không hợp lệ. Vui lòng kiểm tra lại.');
                } else {
                    alert('Đã xảy ra lỗi khi đăng ký: ' + errorMessage);
                }
            });
        });
    }
});

// --- General Auth State Listener ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        const uid = user.uid;
        console.log("Auth State Changed: User is signed in -", uid);
    } else {
        console.log("Auth State Changed: User is signed out.");
    }
});

// --- Exports ---
export {
    auth,
    database,
    storage,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    ref,
    update,
    set,
    get,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    storageRef,
    uploadBytes,
    getDownloadURL,
    signOut
};