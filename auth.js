// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
// Use specific paths for database functions
import { getDatabase, set, ref, update, get } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";
// Use specific paths for auth functions
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBrMIQRcwplYg8GFPB7pqpgT1gHbaDbxQw", // NOTE: For production, consider securing this key (e.g., environment variables)
    authDomain: "career-compass-8987a.firebaseapp.com",
    projectId: "career-compass-8987a",
    databaseURL: "https://career-compass-8987a-default-rtdb.firebaseio.com", // Important: Added databaseURL for RTDB
    storageBucket: "career-compass-8987a.firebasestorage.app",
    messagingSenderId: "751217295596",
    appId: "1:751217295596:web:75bc3abd7579885fe225c9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

// --- Sign Up Logic (Keep if used on sign-up page) ---
document.addEventListener('DOMContentLoaded', function() {
    const signUpButton = document.getElementById('signUp'); // Make sure this ID exists on your sign-up page (e.g., su.html)

    if (signUpButton) { // Only run if the sign-up button exists on the current page
        signUpButton.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent default form submission if it's inside a form

            const emailInput = document.getElementById('rEmail');
            const passwordInput = document.getElementById('rpassword');
            const confirmPasswordInput = document.getElementById('cpassword');

            // Basic validation
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

            // Firebase sign up
            createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                console.log('Sign up successful for user:', user.uid);

                // Save basic user info (like email) to the database under their UID
                // **Do NOT save the password here!**
                const userRef = ref(database, 'users/' + user.uid);
                return set(userRef, {
                    email: user.email, // Save the email associated with the account
                    createdAt: new Date().toISOString(), // Optional: timestamp
                    // Initialize profile node if desired
                    profile: {
                        name: '', // Initialize empty profile fields
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
                // Optional: Redirect to the sign-in page after successful registration
                window.location.href = 'si.html'; // Adjust path if needed
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.error("Sign up error:", errorCode, errorMessage);

                // Provide user-friendly error messages
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
// --- End Sign Up Logic ---


// --- General Auth State Listener (Optional but useful) ---
// This listener runs whenever the user's sign-in state changes.
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in
        const uid = user.uid;
        console.log("Auth State Changed: User is signed in -", uid);
        // You could add logic here that needs to happen on *any* page when the user is logged in,
        // but usually, page-specific logic is handled within that page's JS (like in profile.js).
    } else {
        // User is signed out
        console.log("Auth State Changed: User is signed out.");
        // You could potentially redirect to the login page if the user is on a protected page and becomes signed out.
        // Example (needs refinement based on your site structure):
        // const protectedPages = ['/Profile/profile.html'];
        // if (protectedPages.some(page => window.location.pathname.includes(page))) {
        //    console.log('Redirecting to login from protected page...');
        //    window.location.href = '/su&si/si.html'; // Adjust path
        // }
    }
});
// --- End Auth State Listener ---


// --- CORRECTED EXPORTS ---
// Export all necessary functions and variables in a SINGLE statement
export {
    auth,
    database,
    signInWithEmailAndPassword, // For sign-in page
    GoogleAuthProvider,         // For Google sign-in
    signInWithPopup,            // For Google sign-in
    ref,                        // For database references
    update,                     // For database updates (if needed elsewhere)
    set,                        // For setting/overwriting database data (used in profile & signup)
    get,                        // For reading database data (used in profile)
    onAuthStateChanged,         // For checking auth state (used in profile & globally here)
    createUserWithEmailAndPassword // For sign-up page (if needed, though logic is above)
};