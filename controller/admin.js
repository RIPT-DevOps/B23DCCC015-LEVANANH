function showTab(tabId) {
    // Remove active class from all tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });

    // Remove active class from all tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    // Add active class to the selected tab content
    document.getElementById(tabId).classList.add('active');

    // Add active class to the selected tab
    document.querySelector(`[onclick="showTab('${tabId}')"]`).classList.add('active');
}

// Function to show update form
function showUpdateForm(productId) {
    const form = document.getElementById(`updateProductForm-${productId}`);
    form.style.display = 'block';
}

// Event listener to show add product form
document.getElementById('showAddProductFormButton').addEventListener('click', function() {
    document.getElementById('addProductFormContainer').style.display = 'block';
});
