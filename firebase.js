// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getDatabase, set, ref } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";
import { getAuth, createUserWithEmailAndPassword, signInwithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCXdKJffJV4EQ6PMyZ7JIkyzKqSHubjvLM",
    authDomain: "vocational-guidance-21bf4.firebaseapp.com",
    projectId: "vocational-guidance-21bf4",
    storageBucket: "vocational-guidance-21bf4.firebasestorage.app",
    messagingSenderId: "855555433035",
    appId: "1:855555433035:web:84da5f78056a3f064f23ce",
    measurementId: "G-62NXQ045SD"
};

// Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);
  const auth = getAuth(app);

  document.addEventListener('DOMContentLoaded', function(){
    const signUpButton = document.getElementById(signUp);

    signUpButton.addEventListener('click', event => {
        event.preventDefault();
        const email = document.getElementById('rEmail').value;
        const password = document.getElementById('rpasword').value;
        const cpassword = document.getElementById('cpassword').value;

        createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Đã đăng ký
            set(ref(database, 'users/' + userCredential.uid), {
                email: email,
                password: password,
                cpassword: cpassword,
            })
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;

            alert(errorMessage, 'signUpMessage');
        })
    })
})

const signInButton = document.getElementById('signIn');
if (signInButton){
    signInButton.addEventListener('click', (event) => {
        event.preventDefault();
        const email = document.getElementById('email_field').value;
        const password = document.getElementById('password_field').value;

        signInwithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Đã đăng nhập
            const user = userCredential.user;
            localStorage.setItem('loggedInUserId', user.uid);
            window.location.href = "index.html";
            const dt = new Date();
            update(ref(database, 'users/' + user.uid), {
                last_login: dt,
            })
        })
        .catch((error) => {
            const errorMessage = error.message;
            alert(errorMessage);
        })
    })
}

const user = auth.currentUser;
onAuthStateChanged(auth, (user) => {
    if (user) {
        const user = user.uid;
    }
    else {
        // Người dùng đã đăng xuất
    }
})

