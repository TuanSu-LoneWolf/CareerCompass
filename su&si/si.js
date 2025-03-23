// Google
function signinWithGoogle() {
    const auth2 = gapi.auth2.getAuthInstance();
    auth2.signIn().then(googleUser => {
        const profile = googleUser.getBasicProfile();
        console.log('ID: ' + profile.getId());
        console.log('Name: ' + profile.getName());
        console.log('Email: ' + profile.getEmail());
    }).catch(error => {
        console.error('Google Sign-In Error:', error);
    });
}

// Facebook
window.fbAsyncInit = function() {
    FB.init({
        appId: 'YOUR_FACEBOOK_APP_ID',
        cookie: true,
        xfbml: true,
        version: 'v12.0'
    });

    FB.AppEvents.logPageView();
};

function signinWithFacebook() {
    FB.login(response => {
        if (response.authResponse) {
            FB.api('/me', { fields: 'name,email' }, function(response) {
                console.log('Good to see you, ' + response.name + '.');
                console.log('Email: ' + response.email);
            });
        } else {
            console.log('User cancelled login or did not fully authorize.');
        }
    }, { scope: 'public_profile,email' });
}

// Github
function signinWithGithub() {
    const clientId = 'YOUR_GITHUB_CLIENT_ID';
    const redirectUri = encodeURIComponent('http://yourwebsite.com/callback');
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user`;
}

// Email/Phone
function signinWithEmail() {
    const email = prompt("Vui lòng nhập email hoặc số điện thoại của bạn:");
    if (email) {
        console.log('Email/Phone:', email);
    }
}