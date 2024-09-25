var total = 0;
var cart = [];

// Hàm kiểm tra xem người dùng đã đăng nhập hay chưa
function isLoggedIn() {
    console.log("isLoggedIn function called"); 
    var cookies = document.cookie.split(';');
    console.log("All cookies:", cookies); 
    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i].trim();
        if (cookie.startsWith("userInfo=")) {
            console.log("Cookies:", document.cookie);
            return true;
        }
    }
    console.log("lỗi");
    return false;
}

// Hàm lấy thông tin người dùng từ cookie
function getUserInfo() {
    var cookie = document.cookie.split(';').find(cookie => cookie.trim().startsWith("userInfo="));
    if (cookie) {
        var userInfoString = decodeURIComponent(cookie.substring("userInfo=".length));
        return JSON.parse(userInfoString);
    } else {
        return null;
    }
}


// Hàm hiển thị sản phẩm trong giỏ hàng
async function displayCartItems() {
    if (isLoggedIn()) {
        const userInfo = getUserInfo();
        console.log(" có được gọi ");
        console.log("đã đăng nhập")
        showModal()
    } else {
        console.error("User is not logged in. Cannot display cart items.");
    }
}

async function addToCart(product) {
    if (isLoggedIn()) {
        const userInfo = getUserInfo();
        if (userInfo) {
            try {
                console.log("Sending request to /addToCart with:", { userId: userInfo.ID, product });
                const response = await fetch('/addToCart', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: userInfo.ID, product })
                });
                if (!response.ok) throw new Error('Lỗi khi thêm sản phẩm vào giỏ hàng.');
                
                const responseData = await response.json();
                console.log("Response from /addToCart:", responseData);
                console.log("UserInfo:", userInfo);
                
                console.log(responseData.message);
                displayCartItems();
            } catch (error) {
                console.error('Đã xảy ra lỗi:', error);
            }
        } else {
            console.error("UserInfo is not available.");
        }
    } else {
        console.log("User is not logged in. Cannot add product to cart.");
        // Hiển thị thông báo yêu cầu đăng nhập
        alert("Bạn cần đăng nhập trước khi thêm sản phẩm vào giỏ hàng.");
        // Hoặc chuyển hướng người dùng đến trang đăng nhập
        window.location.href = '/dangnhap'; // Thay đổi URL tới trang đăng nhập của bạn
    }
}
function showModal() {
    var modal = document.getElementById("myModal");
    var modalContent = document.querySelector(".modal-content p");

    if (modal && modalContent) {
        modal.style.display = "block";
    } else {
        console.error("Modal or modal content not found.");
    }
}
function closeModal() {
    var modal = document.getElementById("myModal");
    if (modal) {
        modal.style.display = "none";
    } else {
        console.error("Modal not found.");
    }
}

function setupCartXButton() {
    const cartX = document.querySelector(".fa-x");
    if (cartX) {
        cartX.addEventListener('click', hideCart);
    } else {
        console.error("Element with class 'fa-x' not found.");
    }
}
