
function showPaymentModal(event) {
        event.preventDefault()
        var paymentModal = document.getElementById('paymentModal');
        paymentModal.style.display = 'flex'; // Hiển thị modal
}
window.onclick = function (event) {
        if (event.target == paymentModal) {
            paymentModal.style.display = 'none'; // Ẩn modal nếu click ra ngoài
        }
};
// Bắt sự kiện khi submit form
// Bắt sự kiện khi thay đổi lựa chọn của nút radio
