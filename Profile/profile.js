import { auth, database, ref, set, get, onAuthStateChanged } from '../auth.js';

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
    // const profileAvatarImg = document.getElementById('profile-avatar-img');

    // Form elements (now directly in the page)
    const updateProfileLink = document.getElementById('update-profile-link');
    const updateFormContainer = document.getElementById('update-form-container');
    const profileForm = document.getElementById('profile-form'); // The actual form element

    // Modal elements are removed
    // const modal = document.getElementById('update-profile-modal');
    // const modalFormContent = document.getElementById('modal-form-content');
    // const closeButton = document.querySelector('.modal .close-button');

    let currentUserId = null;
    let currentUserProfileData = {}; // Store current profile data to pre-fill form

    // --- Authentication Check ---
    onAuthStateChanged(auth, (user) => {
        if (user) {
            currentUserId = user.uid;
            console.log("User logged in:", currentUserId);
            loadUserProfile(currentUserId);
        } else {
            console.log("User not logged in. Redirecting...");
            // Redirect to login page if not authenticated
            window.location.href = '../su&si/si.html'; // Adjust path as needed
        }
    });

    // --- Function to Load User Profile Data ---
    function loadUserProfile(userId) {
        const userProfileRef = ref(database, `users/${userId}/profile`);

        get(userProfileRef).then((snapshot) => {
            if (snapshot.exists()) {
                currentUserProfileData = snapshot.val(); // Store data
                console.log("Profile data fetched:", currentUserProfileData);
                displayProfileData(currentUserProfileData);
                 // Pre-fill form once data is loaded, even if form is initially hidden
                 prefillProfileForm(currentUserProfileData);
            } else {
                currentUserProfileData = {}; // Reset if no data
                console.log("No profile data available for user:", userId);
                displayProfileData({}); // Display default values
                prefillProfileForm({}); // Pre-fill form with empty values
            }
        }).catch((error) => {
            console.error("Error loading profile data:", error);
            alert("Lỗi tải thông tin hồ sơ!");
            displayProfileData(null); // Indicate error
        });
    }

    // --- Function to Update Display Elements ---
    function displayProfileData(data) {
        const defaultText = 'Chưa cập nhật';
        if (data === null) {
             displayName.textContent = 'Lỗi tải dữ liệu';
             displayDob.textContent = ''; displayGender.textContent = ''; displayFavCareer.textContent = '';
             displayCareerOrientation.textContent = ''; displayStrengths.textContent = '';
             displayWeaknesses.textContent = ''; displayMbti.textContent = '';
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

    // --- Toggle Update Form Visibility ---
    if (updateProfileLink && updateFormContainer) {
        updateProfileLink.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent link from navigating anywhere
            // Toggle the 'show' class to control visibility via CSS
            updateFormContainer.classList.toggle('show');

            // Optional: If shown, pre-fill just in case data loaded *after* initial prefill
            if (updateFormContainer.classList.contains('show')) {
                 prefillProfileForm(currentUserProfileData);
                 // Optional: scroll to the form if it's opened
                 updateFormContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });
    } else {
         console.error("Could not find update link or form container");
    }


    // --- Pre-fill the Profile Form ---
    // Renamed from prefillInjectedForm for clarity
    function prefillProfileForm(data) {
         // Use document.getElementById as IDs should be unique on the page
        const nameInput = document.getElementById('fullname');
        const dobInput = document.getElementById('dob');
        const genderInput = document.getElementById('gender');
        const careerInput = document.getElementById('career');
        const strengthsInput = document.getElementById('strengths');
        const weaknessesInput = document.getElementById('weaknesses');
        const orientationInput = document.getElementById('orientation');
        const mbtiInput = document.getElementById('mbti');

        if (nameInput) nameInput.value = data?.name || '';
        if (dobInput) dobInput.value = data?.dob || ''; // Assumes YYYY-MM-DD
        if (genderInput) genderInput.value = data?.gender || '';
        if (careerInput) careerInput.value = data?.fav_career || '';
        if (orientationInput) orientationInput.value = data?.career_orientation || '';
        if (strengthsInput) strengthsInput.value = data?.strengths || '';
        if (weaknessesInput) weaknessesInput.value = data?.weaknesses || '';
        if (mbtiInput) mbtiInput.value = data?.mbti || '';
    }

    // --- Handle Profile Form Submission ---
    function handleProfileUpdateSubmit(event) {
        event.preventDefault(); // Prevent default form submission
        if (!currentUserId) {
            alert("Lỗi: Không xác định được người dùng. Vui lòng đăng nhập lại.");
            return;
        }
        if (!profileForm) {
             alert("Lỗi: Không tìm thấy biểu mẫu.");
             return;
        }

        // Gather data directly using element IDs
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

        // Save data to Firebase
        const userProfileRef = ref(database, `users/${currentUserId}/profile`);
        set(userProfileRef, updatedData)
            .then(() => {
                console.log("Profile updated successfully in Firebase.");
                alert('Hồ sơ đã được cập nhật thành công!');
                currentUserProfileData = updatedData; // Update local cache
                displayProfileData(currentUserProfileData); // Update the main page display

                // Hide the form section after successful update
                if (updateFormContainer) {
                    updateFormContainer.classList.remove('show');
                }
            })
            .catch((error) => {
                console.error("Error updating profile:", error);
                alert(`Đã xảy ra lỗi khi cập nhật hồ sơ: ${error.message}`);
            });
    }

    // --- Attach Submit Listener to the Form ---
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpdateSubmit);
    } else {
        console.error("Profile form (#profile-form) not found in the DOM.");
    }


    // --- Modal Close Logic Removed ---
    // if (closeButton) { ... }
    // window.onclick = (event) => { ... };

    // --- Helper Function to Format Date ---
    function formatDate(dateString) {
       // ... (Keep this function as is) ...
       if (!dateString) return '';
        try {
            const parts = dateString.split('-'); // Input YYYY-MM-DD
            if (parts.length === 3) {
                return `${parts[2]}/${parts[1]}/${parts[0]}`; // Output DD/MM/YYYY
            }
            return dateString;
        } catch (e) {
            console.error("Error formatting date:", e);
            return dateString;
        }
    }

});