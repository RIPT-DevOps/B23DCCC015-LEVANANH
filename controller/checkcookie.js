window.addEventListener('DOMContentLoaded', function checkcookie() {
    const userInfoString = getCookie('userInfo') ;
   
    const userInfoExists = userInfoString !== undefined && userInfoString !== '';

   
    if (userInfoExists) {
        document.getElementById('loginBtn').style.display = 'none';
        document.getElementById('userIcon').style.display = 'block';
        document.getElementById('cartIcon').style.display = 'block';
        document.getElementById('logoutIcon').style.display='block'
    } else {
        document.getElementById('loginBtn').style.display = 'block';
        document.getElementById('userIcon').style.display = 'none';
        document.getElementById('cartIcon').style.display = 'none';
        document.getElementById('logoutIcon').style.display='none'
    }
});
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}