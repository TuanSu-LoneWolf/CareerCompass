/*
// Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
  import { getDatabase, set, ref } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";
  import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyBrMIQRcwplYg8GFPB7pqpgT1gHbaDbxQw",
    authDomain: "career-compass-8987a.firebaseapp.com",
    projectId: "career-compass-8987a",
    storageBucket: "career-compass-8987a.firebasestorage.app",
    messagingSenderId: "751217295596",
    appId: "1:751217295596:web:75bc3abd7579885fe225c9"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);
    const auth = getAuth(app);

    document.addEventListener('DOMContentLoaded', function() {
        const signUpButton = document.getElementById('signUp');

        signUpButton.addEventListener('click', (event) => {
            const email = document.getElementById('rEmail').value;
            const password = document.getElementById('rpassword').value;
            const cpassword = document.getElementById('cpassword').value;

            createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Đã đăng ký
                const user = userCredential.user;
                set(ref(database, 'users/' + user.uid), {
                    email: email,
                    password: password,
                    cpassword: cpassword,
                })
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;

                alert(errorMessage, 'signUpMessage');
            });
        });
    });


// Tính năng đăng nhập
const signInButton = document.getElementById('signIn');
if (signInButton) {
    signInButton.addEventListener('click', (event) => {
        event.preventDefault();
        const email = document.getElementById('email_field').value;
        const password = document.getElementById('password_field').value;

        signInWithEmailAndPassword(auth, email, password);
        then((userCredential) => {
            // Đã đăng nhập
            const user = userCredential.user;
            localStorage.setItem('loggedInUserId', user.uid);
            window.location.href = 'index.html'; // Chuyển hướng đến trang chính
            const dt = new Date();
            update(ref(database, 'users/' + user.uid), {
                last_login: dt,
            });
        })
        .catch((error) => {
            const errorMessage = error.message;
            alert(errorMessage);
        });
    });
}


// Hàm này tạo ra để theo dõi trạng thái đăng nhập của người dùng
const user = auth.currentUser;
onAuthStateChanged(auth, (user) => {
    if (user) {
        const uid = user.uid;
    }
    else {
        // Người dùng đã đăng xuất
    }
})
*/

// --- START OF FILE auth.js ---

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getDatabase, set, ref, update } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js"; // Thêm update
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    GoogleAuthProvider, // Thêm GoogleAuthProvider
    signInWithPopup      // Thêm signInWithPopup
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBrMIQRcwplYg8GFPB7pqpgT1gHbaDbxQw", // Lưu ý: Nên bảo mật key này hơn trong ứng dụng thực tế
    authDomain: "career-compass-8987a.firebaseapp.com",
    projectId: "career-compass-8987a",
    databaseURL: "https://career-compass-8987a-default-rtdb.asia-southeast1.firebasedatabase.app", // Quan trọng: Thêm databaseURL nếu dùng RTDB
    storageBucket: "career-compass-8987a.firebasestorage.app",
    messagingSenderId: "751217295596",
    appId: "1:751217295596:web:75bc3abd7579885fe225c9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

// --- Phần xử lý đăng ký (giữ nguyên nếu trang đăng ký cần) ---

document.addEventListener('DOMContentLoaded', function() {
    const signUpButton = document.getElementById('signUp'); // Đảm bảo ID này tồn tại trên trang đăng ký

    if (signUpButton) { // Chỉ chạy nếu nút đăng ký tồn tại
        signUpButton.addEventListener('click', (event) => {
            event.preventDefault(); // Ngăn chặn submit form mặc định nếu là nút trong form
            const email = document.getElementById('rEmail')?.value; // Sử dụng optional chaining (?) để tránh lỗi nếu không tìm thấy element
            const password = document.getElementById('rpassword')?.value;
            const cpassword = document.getElementById('cpassword')?.value;

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
                // Đã đăng ký thành công
                const user = userCredential.user;
                // Chỉ lưu email hoặc thông tin công khai, không lưu password vào database
                set(ref(database, 'users/' + user.uid), {
                    email: email,
                    createdAt: new Date().toISOString() // Ví dụ: lưu thời gian tạo
                })
                .then(() => {
                    alert('Đăng ký thành công! Bạn có thể đăng nhập.');
                    // Có thể chuyển hướng đến trang đăng nhập ở đây
                    // window.location.href = 'si.html';
                })
                .catch((dbError) => {
                     console.error("Lỗi lưu dữ liệu vào Database:", dbError);
                     alert('Đăng ký thành công nhưng có lỗi khi lưu thông tin.');
                });
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.error("Lỗi Đăng ký:", errorCode, errorMessage);
                // Cung cấp thông báo lỗi thân thiện hơn
                if (errorCode === 'auth/email-already-in-use') {
                    alert('Địa chỉ email này đã được sử dụng. Vui lòng sử dụng email khác.');
                } else if (errorCode === 'auth/weak-password') {
                    alert('Mật khẩu quá yếu. Vui lòng chọn mật khẩu mạnh hơn (ít nhất 6 ký tự).');
                } else {
                    alert('Đã xảy ra lỗi khi đăng ký: ' + errorMessage);
                }
            });
        });
    }
});

// --- Kết thúc phần xử lý đăng ký ---


// Hàm này tạo ra để theo dõi trạng thái đăng nhập của người dùng (có thể giữ lại nếu cần)

onAuthStateChanged(auth, (user) => {
    if (user) {
        // Người dùng đã đăng nhập
        const uid = user.uid;
        console.log("Người dùng đã đăng nhập:", uid);
        // Có thể thực hiện hành động gì đó ở đây, ví dụ chuyển hướng nếu đang ở trang login/signup
        // if (window.location.pathname.includes('si.html') || window.location.pathname.includes('su.html')) {
        //    window.location.href = 'index.html'; // Chuyển đến trang chính nếu đã đăng nhập
        // }
    } else {
        // Người dùng đã đăng xuất hoặc chưa đăng nhập
        console.log("Người dùng chưa đăng nhập.");
    }
});


// Xuất các biến và hàm cần thiết
export { auth, database, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, ref, update, set };
// --- END OF FILE auth.js ---