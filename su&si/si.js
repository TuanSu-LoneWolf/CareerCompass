function login(){
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    if (username === "" || password === ""){
        alert ("Vui lòng nhập đầy đủ thông tin!");
    }
    else{
        alert ("Đăng nhập thành công!");
    }
}

function loginWithGoogle(){
    alert("Đăng nhập bằng Google thành công!");
}

function loginWithFacebook(){
    alert("Đăng nhập bằng Facebook thành công!");
}

function loginWithGithub(){
    alert("Đăng nhập bằng Github thành công!");
}

