import { auth, database, storage, ref, set, get, onAuthStateChanged, storageRef, uploadBytes, getDownloadURL } from '../auth.js';
import { updateProfile } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- Get DOM Elements ---
    // Display elements
    const displayName = document.getElementById('display-name');
    const displayDob = document.getElementById('display-dob');
    const displayGender = document.getElementById('display-gender');
    const displayFavCareer = document.getElementById('display-fav-career');
    const displayCareerOrientation = document.getElementById('display-career-orientation');
    const displayStrengths = document.getElementById('display-strengths');
    const displayWeaknesses = document.getElementById('display-weaknesses');
    const displayMbti = document.getElementById('display-mbti');

    // Modal and form elements
    const updateProfileLink = document.getElementById('update-profile-link');
    const modal = document.getElementById('update-profile-modal');
    const closeButton = document.querySelector('.modal .close-button');
    const profileForm = document.getElementById('profile-form');
    const changeAvatarLink = document.getElementById('change-avatar-link');

    let currentUserId = null;
    let currentUserProfileData = {};

    // --- Authentication Check ---
    onAuthStateChanged(auth, (user) => {
        if (user) {
            currentUserId = user.uid;
            console.log("User logged in:", currentUserId);
            loadUserProfile(currentUserId);
        } else {
            console.log("User not logged in. Redirecting...");
            window.location.href = '../index.html';
        }
    });

    // --- Function to Load User Profile Data ---
    function loadUserProfile(userId) {
        const userProfileRef = ref(database, `users/${userId}/profile`);

        get(userProfileRef).then((snapshot) => {
            if (snapshot.exists()) {
                currentUserProfileData = snapshot.val();
                console.log("Profile data fetched:", currentUserProfileData);
                displayProfileData(currentUserProfileData);
                prefillProfileForm(currentUserProfileData);
            } else {
                currentUserProfileData = {};
                console.log("No profile data available for user:", userId);
                displayProfileData({});
                prefillProfileForm({});
            }
            // Cập nhật ảnh đại diện từ Firebase Authentication
            const user = auth.currentUser;
            const profileAvatarImg = document.getElementById('profile-avatar-img');
            if (user && profileAvatarImg) {
                profileAvatarImg.src = user.photoURL || '../Logo.svg'; // Đồng bộ với fallback của navigation
            }
        }).catch((error) => {
            console.error("Error loading profile data:", error);
            alert("Lỗi tải thông tin hồ sơ!");
            displayProfileData(null);
        });
    }

    // --- Function to Update Display Elements ---
    function displayProfileData(data) {
        const defaultText = 'Chưa cập nhật';
        if (data === null) {
            displayName.textContent = 'Lỗi tải dữ liệu';
            displayDob.textContent = ''; 
            displayGender.textContent = ''; 
            displayFavCareer.textContent = '';
            displayCareerOrientation.textContent = ''; 
            displayStrengths.textContent = '';
            displayWeaknesses.textContent = ''; 
            displayMbti.textContent = '';
            return;
        }
        displayName.textContent = data.name || defaultText;
        displayDob.textContent = data.dob ? formatDate(data.dob) : defaultText;
        displayGender.textContent = data.gender || defaultText;
        displayFavCareer.textContent = data.fav_career || defaultText;
        displayCareerOrientation.textContent = data.career_orientation || defaultText;
        displayStrengths.textContent = data.strengths || defaultText;
        displayWeaknesses.textContent = data.weaknesses || defaultText;
        displayMbti.textContent = data.mbti || defaultText;
    }

    // --- Open Modal ---
    if (updateProfileLink && modal) {
        updateProfileLink.addEventListener('click', (e) => {
            e.preventDefault();
            modal.style.display = 'block';
            prefillProfileForm(currentUserProfileData);
        });
    }

    // --- Close Modal ---
    if (closeButton && modal) {
        closeButton.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    // Close modal when clicking outside of it
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // --- Pre-fill the Profile Form ---
    function prefillProfileForm(data) {
        const nameInput = document.getElementById('fullname');
        const dobInput = document.getElementById('dob');
        const genderInput = document.getElementById('gender');
        const careerInput = document.getElementById('career');
        const strengthsInput = document.getElementById('strengths');
        const weaknessesInput = document.getElementById('weaknesses');
        const orientationInput = document.getElementById('orientation');
        const mbtiInput = document.getElementById('mbti');

        if (nameInput) nameInput.value = data?.name || '';
        if (dobInput) dobInput.value = data?.dob || '';
        if (genderInput) genderInput.value = data?.gender || '';
        if (careerInput) careerInput.value = data?.fav_career || '';
        if (orientationInput) orientationInput.value = data?.career_orientation || '';
        if (strengthsInput) strengthsInput.value = data?.strengths || '';
        if (weaknessesInput) weaknessesInput.value = data?.weaknesses || '';
        if (mbtiInput) mbtiInput.value = data?.mbti || '';
    }

    // --- Handle Profile Form Submission ---
    function handleProfileUpdateSubmit(event) {
        event.preventDefault();
        if (!currentUserId) {
            alert("Lỗi: Không xác định được người dùng. Vui lòng đăng nhập lại.");
            return;
        }
        if (!profileForm) {
            alert("Lỗi: Không tìm thấy biểu mẫu.");
            return;
        }

        const updatedData = {
            name: document.getElementById('fullname')?.value.trim() || '',
            dob: document.getElementById('dob')?.value || '',
            gender: document.getElementById('gender')?.value || '',
            fav_career: document.getElementById('career')?.value.trim() || '',
            career_orientation: document.getElementById('orientation')?.value.trim() || '',
            strengths: document.getElementById('strengths')?.value.trim() || '',
            weaknesses: document.getElementById('weaknesses')?.value.trim() || '',
            mbti: document.getElementById('mbti')?.value.trim().toUpperCase() || '',
        };

        console.log("Submitting updated data:", updatedData);

        const userProfileRef = ref(database, `users/${currentUserId}/profile`);
        set(userProfileRef, updatedData)
            .then(() => {
                console.log("Profile updated successfully in Firebase.");
                currentUserProfileData = updatedData;
                displayProfileData(currentUserProfileData);
                modal.style.display = 'none';
            })
            .catch((error) => {
                console.error("Error updating profile:", error);
                alert(`Đã xảy ra lỗi khi cập nhật hồ sơ: ${error.message}`);
            });
    }

    // --- Handle Change Avatar ---
    if (changeAvatarLink) {
        changeAvatarLink.addEventListener('click', (e) => {
            e.preventDefault();
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = async (event) => {
                const file = event.target.files[0];
                if (!file) return;

                if (!currentUserId) {
                    alert("Lỗi: Không xác định được người dùng. Vui lòng đăng nhập lại.");
                    return;
                }

                try {
                    // Tạo tham chiếu tới Firebase Storage
                    const avatarRef = storageRef(storage, `avatars/${currentUserId}/${file.name}`);
                    // Tải ảnh lên
                    await uploadBytes(avatarRef, file);
                    // Lấy URL tải xuống
                    const photoURL = await getDownloadURL(avatarRef);

                    // Cập nhật photoURL trong Firebase Authentication
                    await updateProfile(auth.currentUser, { photoURL });

                    // Cập nhật ảnh đại diện trên giao diện
                    const profileAvatarImg = document.getElementById('profile-avatar-img');
                    const userLogo = document.getElementById('userLogo');
                    if (profileAvatarImg) profileAvatarImg.src = photoURL;
                    if (userLogo) userLogo.src = photoURL;

                    console.log("Ảnh đại diện đã được cập nhật:", photoURL);
                } catch (error) {
                    console.error("Lỗi khi cập nhật ảnh đại diện:", error);
                    alert("Đã xảy ra lỗi khi cập nhật ảnh đại diện.");
                }
            };
            input.click();
        });
    }

    // --- Attach Submit Listener to the Form ---
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpdateSubmit);
    } else {
        console.error("Profile form (#profile-form) not found in the DOM.");
    }

    // --- Helper Function to Format Date ---
    function formatDate(dateString) {
        if (!dateString) return '';
        try {
            const parts = dateString.split('-');
            if (parts.length === 3) {
                return `${parts[2]}/${parts[1]}/${parts[0]}`;
            }
            return dateString;
        } catch (e) {
            console.error("Error formatting date:", e);
            return dateString;
        }
    }
});