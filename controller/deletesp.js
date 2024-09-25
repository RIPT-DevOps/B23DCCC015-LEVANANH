function deleteItem(itemId) {
    fetch('/delete', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemId: itemId }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const rowElement = document.querySelector(`tr[data-item-id="${itemId}"]`);
            if (rowElement) {
                rowElement.remove();
                window.location.reload();
            }
        } else {
            alert('Đã xảy ra lỗi khi xóa sản phẩm: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Lỗi:', error);
    });
}

