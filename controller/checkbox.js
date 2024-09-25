
function filterProducts() {
            const selectedBrands = Array.from(document.querySelectorAll('.brand-checkbox:checked')).map(checkbox => checkbox.value);
            const selectedPrices = Array.from(document.querySelectorAll('.price-checkbox:checked')).map(checkbox => checkbox.value);
            if (selectedBrands.length > 0 || selectedPrices.length>0) {
                const cacheKey = JSON.stringify({ brands: selectedBrands, prices: selectedPrices });
                fetch(`/filter?brands=${selectedBrands.join(',')}&prices=${selectedPrices.join(',')}&cacheKey=${cacheKey}`)
                    .then(response => response.json())
                    .then(data => {
                        renderProducts(data);
                    })
                    .catch(error => {
                        console.error('Lỗi khi lọc sản phẩm', error);
                    });
            } else {
                
                fetch('/products')
                    .then(response => response.json())
                    .then(data => {
                        renderProducts(data);
                    })
                    .catch(error => {
                        console.error('Lỗi khi lấy sản phẩm:', error);
                    });
            }
        }
function renderProducts(products) {
            const productContainer = document.querySelector('.trangchu');
            productContainer.innerHTML = '';
    
            products.forEach(product => {
                const productElement = `
                    <a href="/product/${product._id}" class="sanpham" >
                            <img src="${product.image}" alt="${product.name}" class="hinhanh">
                            <h2 class="tenvot">${product.name}</h2>
                            <h3 class="much">Giá: ${product.price} VNĐ</h3>      
                    </a>`;
                productContainer.insertAdjacentHTML('beforeend', productElement);
            });
}
