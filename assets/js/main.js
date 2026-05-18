// ==========================================
// RENDER SẢN PHẨM (SÁCH)
// ==========================================

// Hàm tạo HTML cho 1 thẻ sản phẩm
function createProductCard(product) {
    // Tính phần trăm giảm giá (nếu có)
    let discountBadge = '';
    if (product.originalPrice > product.price) {
        const discountPercent = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
        discountBadge = `<span class="discount-badge">-${discountPercent}%</span>`;
    }

    // Tạo HTML cho số sao đánh giá (Rating)
    let starsHtml = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= Math.floor(product.rating)) {
            starsHtml += '<i class="fa-solid fa-star"></i>';
        } else if (i === Math.ceil(product.rating) && !Number.isInteger(product.rating)) {
            starsHtml += '<i class="fa-solid fa-star-half-stroke"></i>';
        } else {
            starsHtml += '<i class="fa-regular fa-star"></i>';
        }
    }

    // Trả về chuỗi HTML của Card
    return `
        <div class="product-card">
            <div class="product-img">
                <a href="detail.html?id=${product.id}">
                    <img src="${product.image}" alt="${product.title}">
                </a>
                ${discountBadge}
                <div class="product-actions">
                    <button class="action-btn cart-btn" title="Thêm vào giỏ hàng" onclick="addToCart(${product.id})">
                        <i class="fa-solid fa-cart-plus"></i>
                    </button>
                    <a href="detail.html?id=${product.id}" class="action-btn view-btn" title="Xem chi tiết">
                        <i class="fa-regular fa-eye"></i>
                    </a>
                </div>
            </div>
            <div class="product-info">
                <span class="product-category">${product.category}</span>
                <a href="detail.html?id=${product.id}" class="product-title">${product.title}</a>
                <div class="product-author">${product.author}</div>
                <div class="product-rating">${starsHtml}</div>
                <div class="product-price">
                    <span class="current-price">${formatVND(product.price)}</span>
                    ${product.originalPrice > product.price ? `<span class="original-price">${formatVND(product.originalPrice)}</span>` : ''}
                </div>
            </div>
        </div>
    `;
}

// Hàm render danh sách sách nổi bật ở Trang Chủ
function renderFeaturedProducts() {
    const container = document.getElementById('featuredProducts');
    if (!container) return; // Bỏ qua nếu đang ở trang khác không có thẻ này

    // Lọc ra các sản phẩm có isFeatured = true từ file products.js
    const featured = products.filter(p => p.isFeatured).slice(0, 6); // Lấy tối đa 6 sản phẩm
    
    let html = '';
    featured.forEach(product => {
        html += createProductCard(product);
    });
    
    container.innerHTML = html;
}

// ==========================================
// CHỨC NĂNG GIỎ HÀNG (LocalStorage & Cart Page)
// ==========================================

// Lấy giỏ hàng từ LocalStorage, nếu chưa có thì mảng rỗng
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// 1. Cập nhật số lượng trên icon giỏ hàng ở Header
function updateCartBadge() {
    const badge = document.querySelector('.cart-count');
    if (badge) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        badge.textContent = totalItems;
    }
}

// 2. Thêm vào giỏ hàng (Gọi từ nút Thêm vào giỏ ở Trang chủ/Cửa hàng)
function addToCart(productId) {
    const existingItem = cart.find(item => item.productId === productId);
    
    if (existingItem) {
        existingItem.quantity += 1; // Nếu đã có, tăng số lượng
    } else {
        cart.push({ productId: productId, quantity: 1 }); // Nếu chưa, thêm mới
    }
    
    localStorage.setItem('cart', JSON.stringify(cart)); // Lưu lại vào bộ nhớ trình duyệt
    updateCartBadge();
    
    alert('Đã thêm sản phẩm vào giỏ hàng thành công!');
}

// 3. Render giao diện trang Giỏ hàng (cart.html)
function renderCartPage() {
    const container = document.getElementById('cartItemsContainer');
    const subtotalEl = document.getElementById('cartSubtotal');
    const totalEl = document.getElementById('cartTotal');
    
    if (!container) return; // Nếu không phải trang Giỏ hàng thì thoát

    if (cart.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding: 40px;">
                <i class="fa-solid fa-cart-arrow-down" style="font-size: 3rem; color: #ccc; margin-bottom: 20px;"></i>
                <p style="margin-bottom: 20px;">Giỏ hàng của bạn đang trống.</p>
                <a href="products.html" class="btn btn-primary">Mua sắm ngay</a>
            </div>
        `;
        subtotalEl.textContent = '0 đ';
        totalEl.textContent = '0 đ';
        return;
    }

    let html = '';
    let totalPrice = 0;

    cart.forEach(cartItem => {
        // Tìm thông tin đầy đủ của sách từ mảng products
        const product = products.find(p => p.id === cartItem.productId);
        if (product) {
            const itemTotal = product.price * cartItem.quantity;
            totalPrice += itemTotal;

            html += `
                <div class="cart-item-row">
                    <div class="cart-col-product">
                        <img src="${product.image}" alt="${product.title}">
                        <a href="detail.html?id=${product.id}" class="cart-product-title">${product.title}</a>
                    </div>
                    <div class="cart-col-price">${formatVND(product.price)}</div>
                    <div class="cart-col-qty">
                        <div class="qty-control">
                            <button onclick="updateQuantity(${product.id}, -1)">-</button>
                            <input type="text" value="${cartItem.quantity}" readonly>
                            <button onclick="updateQuantity(${product.id}, 1)">+</button>
                        </div>
                    </div>
                    <div class="cart-col-total font-bold">${formatVND(itemTotal)}</div>
                    <div class="cart-col-action">
                        <button class="remove-btn" onclick="removeFromCart(${product.id})" title="Xóa"><i class="fa-solid fa-trash-can"></i></button>
                    </div>
                </div>
            `;
        }
    });

    container.innerHTML = html;
    subtotalEl.textContent = formatVND(totalPrice);
    totalEl.textContent = formatVND(totalPrice);
}

// 4. Thay đổi số lượng (Cộng/Trừ)
function updateQuantity(productId, change) {
    const item = cart.find(i => i.productId === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId); // Nếu giảm về 0 thì xóa luôn
        } else {
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartBadge();
            renderCartPage(); // Cập nhật lại HTML
        }
    }
}

// 5. Xóa sản phẩm khỏi giỏ
function removeFromCart(productId) {
    if(confirm('Bạn có chắc chắn muốn xóa sách này khỏi giỏ hàng?')) {
        cart = cart.filter(item => item.productId !== productId);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartBadge();
        renderCartPage();
    }
}

// ==========================================
// TRANG CỬA HÀNG (PRODUCTS.HTML)
// ==========================================
function renderShopProducts(productsToRender = products) {
    const container = document.getElementById('shopProducts');
    const noMsg = document.getElementById('noProductsMsg');
    if (!container) return;

    if (productsToRender.length === 0) {
        container.innerHTML = '';
        noMsg.style.display = 'block';
        return;
    }

    noMsg.style.display = 'none';
    let html = '';
    productsToRender.forEach(product => {
        html += createProductCard(product);
    });
    container.innerHTML = html;
}

function initShopFilters() {
    const searchInput = document.getElementById('shopSearch');
    const categoryList = document.getElementById('categoryList');
    const priceList = document.getElementById('priceList');
    const sortSelect = document.getElementById('shopSort');
    if (!searchInput || !categoryList) return;

    // Render danh mục động từ products
    const uniqueCategories = [...new Set(products.map(p => p.category))];
    let catHtml = '<li><a href="#" class="active" data-cat="all">Tất cả sách</a></li>';
    uniqueCategories.forEach(cat => {
        catHtml += '<li><a href="#" data-cat="' + cat + '">' + cat + '</a></li>';
    });
    categoryList.innerHTML = catHtml;

    const catLinks = categoryList.querySelectorAll('a');
    const priceLinks = priceList ? priceList.querySelectorAll('a') : [];

    let currentCat = 'all';
    let currentPrice = 'all';

    function filterProducts() {
        const keyword = searchInput.value.toLowerCase();
        
        // Filter
        let filtered = products.filter(p => {
            const matchSearch = p.title.toLowerCase().includes(keyword) || p.author.toLowerCase().includes(keyword);
            const matchCat = currentCat === 'all' || p.category === currentCat;
            
            let matchPrice = true;
            if (currentPrice === 'under-70') matchPrice = p.price < 70000;
            else if (currentPrice === '70-120') matchPrice = p.price >= 70000 && p.price <= 120000;
            else if (currentPrice === 'over-120') matchPrice = p.price > 120000;

            return matchSearch && matchCat && matchPrice;
        });

        // Sort
        if (sortSelect) {
            const sortVal = sortSelect.value;
            if (sortVal === 'price-asc') filtered.sort((a, b) => a.price - b.price);
            else if (sortVal === 'price-desc') filtered.sort((a, b) => b.price - a.price);
            else if (sortVal === 'name-asc') filtered.sort((a, b) => a.title.localeCompare(b.title));
            else if (sortVal === 'name-desc') filtered.sort((a, b) => b.title.localeCompare(a.title));
        }

        renderShopProducts(filtered);
    }

    searchInput.addEventListener('input', filterProducts);
    if (sortSelect) sortSelect.addEventListener('change', filterProducts);

    catLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            catLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            currentCat = link.getAttribute('data-cat');
            filterProducts();
        });
    });

    if (priceLinks.length > 0) {
        priceLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                priceLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                currentPrice = link.getAttribute('data-price');
                filterProducts();
            });
        });
    }
}

// ==========================================
// TRANG CHI TIẾT SẢN PHẨM (DETAIL.HTML)
// ==========================================
function renderProductDetail() {
    const container = document.getElementById('productDetailContainer');
    if (!container) return;

    // Lấy tham số id từ URL (vd: detail.html?id=1)
    const urlParams = new URLSearchParams(window.location.search);
    const id = parseInt(urlParams.get('id'));
    const product = products.find(p => p.id === id);

    if (!product) {
        container.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding: 50px;"><h2>Không tìm thấy sách!</h2><a href="products.html" class="btn btn-primary mt-3">Quay lại cửa hàng</a></div>';
        return;
    }

    let starsHtml = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= Math.floor(product.rating)) starsHtml += '<i class="fa-solid fa-star"></i>';
        else if (i === Math.ceil(product.rating) && !Number.isInteger(product.rating)) starsHtml += '<i class="fa-solid fa-star-half-stroke"></i>';
        else starsHtml += '<i class="fa-regular fa-star"></i>';
    }

    container.innerHTML = `
        <div class="detail-image">
            <img src="${product.image}" alt="${product.title}">
        </div>
        <div class="detail-info">
            <span class="product-category">${product.category}</span>
            <h1>${product.title}</h1>
            <div class="detail-author">Tác giả: <strong>${product.author}</strong></div>
            <div class="product-rating" style="font-size: 1.2rem; margin-bottom: 20px;">${starsHtml} (${product.rating}/5)</div>
            <div class="detail-price">${formatVND(product.price)}</div>
            <div class="detail-desc">
                ${product.description}
            </div>
            <div style="display: flex; gap: 20px; align-items: center; margin-top: 30px;">
                <button class="btn btn-primary" style="font-size: 1.1rem; padding: 12px 30px;" onclick="addToCart(${product.id})">
                    <i class="fa-solid fa-cart-plus"></i> Thêm vào giỏ hàng
                </button>
            </div>
        </div>
    `;
}

// ==========================================
// TRANG THANH TOÁN (CHECKOUT.HTML)
// ==========================================
function renderCheckoutSummary() {
    const listContainer = document.getElementById('checkoutItemsList');
    const totalEl = document.getElementById('checkoutTotal');
    if (!listContainer) return;

    if (cart.length === 0) {
        listContainer.innerHTML = '<p>Giỏ hàng trống.</p>';
        return;
    }

    let html = '';
    let totalPrice = 0;
    cart.forEach(cartItem => {
        const product = products.find(p => p.id === cartItem.productId);
        if (product) {
            const itemTotal = product.price * cartItem.quantity;
            totalPrice += itemTotal;
            html += `
                <div class="cart-item-row" style="padding: 10px 0; border-bottom: 1px solid #eee;">
                    <div><strong>${cartItem.quantity}x</strong> ${product.title}</div>
                    <div style="text-align: right;">${formatVND(itemTotal)}</div>
                </div>
            `;
        }
    });

    listContainer.innerHTML = html;
    if(totalEl) totalEl.textContent = formatVND(totalPrice);
}

function initCheckoutForm() {
    const form = document.getElementById('checkoutForm');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault(); // Ngăn load lại trang
        
        if (cart.length === 0) {
            alert('Giỏ hàng của bạn đang trống! Vui lòng chọn mua sách trước.');
            window.location.href = 'products.html';
            return;
        }

        const phone = document.getElementById('chkPhone').value;
        const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
        
        if (!phoneRegex.test(phone)) {
            alert('Số điện thoại không hợp lệ! Vui lòng nhập SĐT Việt Nam.');
            return;
        }

        // Thành công
        alert('Chúc mừng! Đơn hàng của bạn đã được đặt thành công.');
        localStorage.removeItem('cart'); // Xóa giỏ hàng
        window.location.href = 'index.html'; // Về trang chủ
    });
}

// ==========================================
// TRANG ĐĂNG NHẬP (LOGIN.HTML)
// ==========================================
function initLoginForm() {
    const form = document.getElementById('loginForm');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Đăng nhập giả lập thành công!');
        window.location.href = 'index.html';
    });
}

// ==========================================
// KHỞI CHẠY KHI TẢI TRANG XONG
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // Header & chung
    updateCartBadge();
    
    // Trang chủ
    renderFeaturedProducts();
    
    // Trang Giỏ hàng
    renderCartPage();

    // Trang Cửa hàng
    renderShopProducts();
    initShopFilters();

    // Trang Chi tiết
    renderProductDetail();

    // Trang Thanh toán
    renderCheckoutSummary();
    initCheckoutForm();

    // Trang Đăng nhập
    initLoginForm();
});
