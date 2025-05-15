import { 
    auth, 
    database, 
    signInWithEmailAndPassword, 
    GoogleAuthProvider, 
    signInWithPopup, 
    createUserWithEmailAndPassword,
    ref, 
    set, 
    update,
    onAuthStateChanged,
    signOut
} from '../auth.js';

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const loginModal = document.getElementById('loginModal');
    const signupModal = document.getElementById('signupModal');
    const showLoginModal = document.getElementById('showLoginModal');
    const showSignupModal = document.getElementById('showSignupModal');
    const switchToLogin = document.getElementById('switchToLogin');
    const switchToSignup = document.getElementById('switchToSignup');
    const closeButtons = document.querySelectorAll('.close-modal');
    
    // Login form elements
    const loginForm = document.getElementById('login-form');
    const loginEmail = document.getElementById('login-email');
    const loginPassword = document.getElementById('login-password');
    const loginError = document.getElementById('login-error-message');
    const googleLoginBtn = document.getElementById('google-login-btn');
    
    // Signup form elements
    const signupForm = document.getElementById('signup-form');
    const signupEmail = document.getElementById('signup-email');
    const signupPassword = document.getElementById('signup-password');
    const confirmPassword = document.getElementById('confirm-password');
    const signupError = document.getElementById('signup-error-message');
    const googleSignupBtn = document.getElementById('google-signup-btn');
    
    // Navigation elements
    const signupLink = document.getElementById('signupLink');
    const loginLink = document.getElementById('loginLink');
    const userLogoContainer = document.getElementById('userLogoContainer');
    const userLogo = document.getElementById('userLogo');
    const userMenu = document.getElementById('userMenu');
    const logoutBtn = document.getElementById('logoutBtn');

    // Modal functions
    function openModal(modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    function closeModal(modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        clearError(modal === loginModal ? loginError : signupError);
    }

    function clearError(errorElement) {
        if (errorElement) errorElement.textContent = '';
    }

    // Event listeners for modal controls
    showLoginModal?.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(loginModal);
    });

    showSignupModal?.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(signupModal);
    });

    switchToLogin?.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal(signupModal);
        openModal(loginModal);
    });

    switchToSignup?.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal(loginModal);
        openModal(signupModal);
    });

    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.auth-modal');
            closeModal(modal);
        });
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === loginModal) closeModal(loginModal);
        if (e.target === signupModal) closeModal(signupModal);
    });

    // User menu toggle
    if (userLogo && userMenu) {
        userLogo.addEventListener('click', (e) => {
            e.stopPropagation();
            userMenu.style.display = userMenu.style.display === 'block' ? 'none' : 'block';
        });

        document.addEventListener('click', () => {
            userMenu.style.display = 'none';
        });

        userMenu.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    // Handle login success
    function handleLoginSuccess(user) {
        console.log('Đăng nhập thành công:', user.uid);
        
        // Lưu UID vào localStorage
        localStorage.setItem('loggedInUserId', user.uid);

        // Cập nhật thông tin người dùng trong database
        const userRef = ref(database, 'users/' + user.uid);
        const dt = new Date().toISOString();
        
        update(userRef, {
            last_login: dt,
            email: user.email,
            displayName: user.displayName || 'Người dùng',
            photoURL: user.photoURL || ''
        }).catch(dbError => {
            console.warn("Không thể cập nhật last_login:", dbError);
        });

        // Cập nhật giao diện
        if (signupLink && loginLink && userLogoContainer && userLogo) {
            signupLink.style.display = 'none';
            loginLink.style.display = 'none';
            userLogo.src = user.photoURL || './Logo.svg';
            userLogoContainer.style.display = 'block';
        }

        // Đóng modal
        closeModal(loginModal);
        closeModal(signupModal);
    }

    // 1. Xử lý đăng nhập bằng Email/Password
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            clearError(loginError);

            const email = loginEmail.value.trim();
            const password = loginPassword.value;

            if (!email || !password) {
                loginError.textContent = 'Vui lòng nhập đầy đủ email và mật khẩu!';
                return;
            }

            signInWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    handleLoginSuccess(userCredential.user);
                })
                .catch((error) => {
                    const errorCode = error.code;
                    if (errorCode === 'auth/user-not-found' || errorCode === 'auth/wrong-password' || errorCode === 'auth/invalid-credential') {
                        loginError.textContent = 'Email hoặc mật khẩu không chính xác.';
                    } else if (errorCode === 'auth/invalid-email') {
                        loginError.textContent = 'Địa chỉ email không hợp lệ.';
                    } else {
                        loginError.textContent = `Lỗi đăng nhập: ${error.message}`;
                    }
                });
        });
    }

    // 2. Xử lý đăng nhập bằng Google
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', () => {
            clearError(loginError);
            const provider = new GoogleAuthProvider();

            signInWithPopup(auth, provider)
                .then((result) => {
                    const user = result.user;
                    const userRef = ref(database, 'users/' + user.uid);
                    
                    update(userRef, {
                        email: user.email,
                        displayName: user.displayName || 'Người dùng Google',
                        photoURL: user.photoURL || '',
                        provider: 'google.com',
                        lastLogin: new Date().toISOString()
                    }).finally(() => {
                        handleLoginSuccess(user);
                    });
                })
                .catch((error) => {
                    const errorCode = error.code;
                    if (errorCode === 'auth/popup-closed-by-user' || errorCode === 'auth/cancelled-popup-request') {
                        loginError.textContent = 'Đăng nhập với Google bị hủy. Vui lòng cho phép popup hoặc thử lại.';
                    } else if (errorCode === 'auth/account-exists-with-different-credential') {
                        loginError.textContent = 'Tài khoản đã tồn tại với phương thức đăng nhập khác.';
                    } else {
                        loginError.textContent = `Lỗi đăng nhập Google: ${error.message}`;
                    }
                });
        });
    }

    // 3. Xử lý đăng ký bằng Email/Password
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            clearError(signupError);

            const email = signupEmail.value.trim();
            const password = signupPassword.value;
            const confirmPass = confirmPassword.value;

            // Validate
            if (!email || !password || !confirmPass) {
                signupError.textContent = 'Vui lòng điền đầy đủ thông tin.';
                return;
            }
            if (password.length < 6) {
                signupError.textContent = 'Mật khẩu phải có ít nhất 6 ký tự.';
                return;
            }
            if (password !== confirmPass) {
                signupError.textContent = 'Mật khẩu và xác nhận mật khẩu không khớp.';
                return;
            }

            createUserWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    const user = userCredential.user;
                    const userRef = ref(database, 'users/' + user.uid);
                    
                    set(userRef, {
                        email: user.email,
                        provider: 'email/password',
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
                    }).then(() => {
                        handleLoginSuccess(user);
                    }).catch(dbError => {
                        console.error("Lỗi khi tạo người dùng:", dbError);
                        signupError.textContent = 'Đăng ký thành công nhưng có lỗi khi lưu thông tin.';
                    });
                })
                .catch((error) => {
                    const errorCode = error.code;
                    if (errorCode === 'auth/email-already-in-use') {
                        signupError.textContent = 'Địa chỉ email này đã được sử dụng.';
                    } else if (errorCode === 'auth/weak-password') {
                        signupError.textContent = 'Mật khẩu quá yếu. Vui lòng sử dụng ít nhất 6 ký tự.';
                    } else if (errorCode === 'auth/invalid-email') {
                        signupError.textContent = 'Địa chỉ email không hợp lệ.';
                    } else {
                        signupError.textContent = `Đã xảy ra lỗi: ${error.message}`;
                    }
                });
        });
    }

    // 4. Xử lý đăng ký bằng Google
    if (googleSignupBtn) {
        googleSignupBtn.addEventListener('click', () => {
            clearError(signupError);
            const provider = new GoogleAuthProvider();

            signInWithPopup(auth, provider)
                .then((result) => {
                    const user = result.user;
                    const userRef = ref(database, 'users/' + user.uid);
                    
                    set(userRef, {
                        email: user.email,
                        displayName: user.displayName || 'Người dùng Google',
                        photoURL: user.photoURL || '',
                        provider: 'google.com',
                        lastLogin: new Date().toISOString(),
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
                    }).then(() => {
                        handleLoginSuccess(user);
                    }).catch(dbError => {
                        console.error("Lỗi khi tạo người dùng Google:", dbError);
                        signupError.textContent = 'Đăng nhập thành công nhưng có lỗi khi lưu thông tin.';
                    });
                })
                .catch((error) => {
                    const errorCode = error.code;
                    if (errorCode === 'auth/popup-closed-by-user' || errorCode === 'auth/cancelled-popup-request') {
                        signupError.textContent = 'Đăng nhập với Google bị hủy. Vui lòng cho phép popup hoặc thử lại.';
                    } else if (errorCode === 'auth/account-exists-with-different-credential') {
                        signupError.textContent = 'Tài khoản đã tồn tại với phương thức đăng nhập khác.';
                    } else {
                        signupError.textContent = `Lỗi khi đăng nhập với Google: ${error.message}`;
                    }
                });
        });
    }

    // 5. Xử lý đăng xuất
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            signOut(auth).then(() => {
                console.log('Đăng xuất thành công.');
                localStorage.removeItem('loggedInUserId'); // Xóa UID khỏi localStorage
                if (signupLink && loginLink && userLogoContainer) {
                    signupLink.style.display = 'block';
                    loginLink.style.display = 'block';
                    userLogoContainer.style.display = 'none';
                }
            }).catch((error) => {
                console.error('Lỗi đăng xuất:', error);
            });
        });
    }

    // 6. Kiểm tra trạng thái đăng nhập
    onAuthStateChanged(auth, (user) => {
        if (user) {
            if (signupLink && loginLink && userLogoContainer && userLogo) {
                signupLink.style.display = 'none';
                loginLink.style.display = 'none';
                userLogo.src = user.photoURL || './Logo.svg';
                userLogoContainer.style.display = 'block';
            }
        } else {
            if (signupLink && loginLink && userLogoContainer) {
                signupLink.style.display = 'block';
                loginLink.style.display = 'block';
                userLogoContainer.style.display = 'none';
            }
        }
    });
});