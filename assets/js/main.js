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

    // Trả về chuỗi HTML của Card với nút wishlist tim đỏ
    return `
        <div class="product-card">
            <div class="product-img">
                <a href="detail.html?id=${product.id}">
                    <img src="${product.image}" alt="${product.title}">
                </a>
                ${discountBadge}
                <div class="product-actions">
                    <button class="action-btn wishlist-btn" title="Yêu thích" onclick="toggleWishlist(event, ${product.id})" id="wishBtn-${product.id}" style="color: ${isInWishlist(product.id) ? '#e24c4c' : 'inherit'};">
                        <i class="${isInWishlist(product.id) ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
                    </button>
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
    if (!container) return; 

    const featured = products.filter(p => p.isFeatured).slice(0, 8); 
    
    let html = '';
    featured.forEach(product => {
        html += createProductCard(product);
    });
    
    container.innerHTML = html;
}

// ==========================================
// CHỨC NĂNG GIỎ HÀNG (LocalStorage & Cart Page)
// ==========================================

let cart = JSON.parse(localStorage.getItem('cart')) || [];

function updateCartBadge() {
    const badge = document.querySelector('.cart-count');
    if (badge) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        badge.textContent = totalItems;
    }
}

function addToCart(productId) {
    const existingItem = cart.find(item => item.productId === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ productId: productId, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
    
    alert('Đã thêm sản phẩm vào giỏ hàng thành công!');
}

function renderCartPage() {
    const container = document.getElementById('cartItemsContainer');
    const subtotalEl = document.getElementById('cartSubtotal');
    const totalEl = document.getElementById('cartTotal');
    
    if (!container) return; 

    if (cart.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding: 40px;">
                <i class="fa-solid fa-cart-arrow-down" style="font-size: 3rem; color: #ccc; margin-bottom: 20px;"></i>
                <p style="margin-bottom: 20px;">Giỏ hàng của bạn đang trống.</p>
                <a href="products.html" class="btn btn-primary">Mua sắm ngay</a>
            </div>
        `;
        subtotalEl.textContent = '0 đ';
        if (totalEl) totalEl.textContent = '0 đ';
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
    
    // TÍNH MÃ GIẢM GIÁ
    let discount = 0;
    if (activePromo && PROMO_CODES[activePromo]) {
        const promo = PROMO_CODES[activePromo];
        if (promo.type === 'percent') {
            discount = Math.round(totalPrice * (promo.value / 100));
        } else if (promo.type === 'fixed') {
            discount = promo.value;
        }
    }
    
    const finalTotal = Math.max(0, totalPrice - discount);
    
    // Lưu lại giá trị
    localStorage.setItem('cartSubtotalVal', totalPrice);
    localStorage.setItem('cartDiscountVal', discount);
    localStorage.setItem('cartTotalVal', finalTotal);
    
    // Cập nhật dòng hiển thị giảm giá
    const discountRow = document.getElementById('discountRow');
    const discountEl = document.getElementById('cartDiscount');
    if (discountRow && discountEl) {
        if (discount > 0) {
            discountEl.textContent = `-${formatVND(discount)}`;
            discountRow.style.display = 'flex';
        } else {
            discountRow.style.display = 'none';
        }
    }

    subtotalEl.textContent = formatVND(totalPrice);
    if (totalEl) totalEl.textContent = formatVND(finalTotal);
}

function updateQuantity(productId, change) {
    const item = cart.find(i => i.productId === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartBadge();
            renderCartPage();
        }
    }
}

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
let currentPage = 1;
const itemsPerPage = 6;
let currentFilteredProducts = [];

function renderShopProducts(productsToRender = products, page = 1) {
    const container = document.getElementById('shopProducts');
    const noMsg = document.getElementById('noProductsMsg');
    const paginationContainer = document.getElementById('pagination');
    if (!container) return;

    if (productsToRender.length === 0) {
        container.innerHTML = '';
        if (paginationContainer) paginationContainer.innerHTML = '';
        noMsg.style.display = 'block';
        return;
    }

    noMsg.style.display = 'none';
    
    const totalPages = Math.ceil(productsToRender.length / itemsPerPage);
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    currentPage = page;

    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedProducts = productsToRender.slice(startIndex, endIndex);

    let html = '';
    paginatedProducts.forEach(product => {
        html += createProductCard(product);
    });
    container.innerHTML = html;

    if (paginationContainer) {
        let pagHtml = '';
        if (totalPages > 1) {
            for (let i = 1; i <= totalPages; i++) {
                if (i === currentPage) {
                    pagHtml += `<button class="btn btn-primary" style="padding: 5px 12px; min-width: 40px;">${i}</button>`;
                } else {
                    pagHtml += `<button class="btn" style="padding: 5px 12px; min-width: 40px; background-color: var(--bg-alt); border: 1px solid var(--border-color); color: var(--text-main);" onclick="changePage(${i})">${i}</button>`;
                }
            }
        }
        paginationContainer.innerHTML = pagHtml;
    }
}

function changePage(page) {
    renderShopProducts(currentFilteredProducts, page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function initShopFilters() {
    const searchInput = document.getElementById('shopSearch');
    const categoryList = document.getElementById('categoryList');
    const priceList = document.getElementById('priceList');
    const sortSelect = document.getElementById('shopSort');
    if (!searchInput || !categoryList) return;

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

    // Parse URL parameter category
    const urlParams = new URLSearchParams(window.location.search);
    const urlCat = urlParams.get('category');
    if (urlCat && uniqueCategories.includes(urlCat)) {
        currentCat = urlCat;
        catLinks.forEach(l => {
            if (l.getAttribute('data-cat') === urlCat) {
                l.classList.add('active');
            } else {
                l.classList.remove('active');
            }
        });
    }

    function filterProducts() {
        const keyword = searchInput.value.toLowerCase();
        
        let filtered = products.filter(p => {
            const matchSearch = p.title.toLowerCase().includes(keyword) || p.author.toLowerCase().includes(keyword);
            const matchCat = currentCat === 'all' || p.category === currentCat;
            
            let matchPrice = true;
            if (currentPrice === 'under-70') matchPrice = p.price < 70000;
            else if (currentPrice === '70-120') matchPrice = p.price >= 70000 && p.price <= 120000;
            else if (currentPrice === 'over-120') matchPrice = p.price > 120000;

            return matchSearch && matchCat && matchPrice;
        });

        if (sortSelect) {
            const sortVal = sortSelect.value;
            if (sortVal === 'price-asc') filtered.sort((a, b) => a.price - b.price);
            else if (sortVal === 'price-desc') filtered.sort((a, b) => b.price - a.price);
            else if (sortVal === 'name-asc') filtered.sort((a, b) => a.title.localeCompare(b.title));
            else if (sortVal === 'name-desc') filtered.sort((a, b) => b.title.localeCompare(a.title));
        }

        currentFilteredProducts = filtered;
        renderShopProducts(filtered, 1);
    }

    currentFilteredProducts = products;

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
            <h1 style="font-family: var(--font-heading); color: var(--primary-color);">${product.title}</h1>
            <div class="detail-author">Tác giả: <strong>${product.author}</strong></div>
            <div class="product-rating" style="font-size: 1.2rem; margin-bottom: 20px;">${starsHtml} (${product.rating}/5)</div>
            <div class="detail-price">${formatVND(product.price)}</div>
            <div class="detail-desc">
                ${product.description}
            </div>
            <div style="display: flex; gap: 20px; align-items: center; margin-top: 30px; flex-wrap: wrap;">
                <button class="btn btn-primary" style="font-size: 1.1rem; padding: 12px 30px;" onclick="addToCart(${product.id})">
                    <i class="fa-solid fa-cart-plus"></i> Thêm vào giỏ hàng
                </button>
                <button class="btn" style="font-size: 1.1rem; padding: 12px 20px; background: var(--bg-alt); border: 1px solid var(--border-color); color: var(--primary-color);" onclick="toggleWishlist(event, ${product.id})" id="wishBtn-${product.id}">
                    <i class="${isInWishlist(product.id) ? 'fa-solid' : 'fa-regular'} fa-heart" style="color: ${isInWishlist(product.id) ? '#e24c4c' : 'inherit'};"></i> Yêu thích
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
    const discountRow = document.getElementById('checkoutDiscountRow');
    const discountEl = document.getElementById('checkoutDiscount');
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
                <div class="cart-item-row" style="padding: 10px 0; border-bottom: 1px solid #eee; display: flex; justify-content: space-between;">
                    <div><strong>${cartItem.quantity}x</strong> ${product.title}</div>
                    <div style="text-align: right;">${formatVND(itemTotal)}</div>
                </div>
            `;
        }
    });

    listContainer.innerHTML = html;
    
    // Lấy giảm giá của Coupon đang áp dụng
    let discount = 0;
    if (activePromo && PROMO_CODES[activePromo]) {
        const promo = PROMO_CODES[activePromo];
        if (promo.type === 'percent') {
            discount = Math.round(totalPrice * (promo.value / 100));
        } else if (promo.type === 'fixed') {
            discount = promo.value;
        }
    }
    
    const finalTotal = Math.max(0, totalPrice - discount);
    
    // Lưu lại giá trị cho đơn hàng
    localStorage.setItem('cartSubtotalVal', totalPrice);
    localStorage.setItem('cartDiscountVal', discount);
    localStorage.setItem('cartTotalVal', finalTotal);
    
    if (discountRow && discountEl) {
        if (discount > 0) {
            discountEl.textContent = `-${formatVND(discount)}`;
            discountRow.style.display = 'flex';
        } else {
            discountRow.style.display = 'none';
        }
    }
    
    if(totalEl) totalEl.textContent = formatVND(finalTotal);
}

function initCheckoutForm() {
    const form = document.getElementById('checkoutForm');
    if (!form) return;

    renderCheckoutSummary();

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
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

        // LƯU LỊCH SỬ ĐƠN HÀNG
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        const newOrder = {
            id: 'DH' + Date.now().toString().slice(-6),
            date: new Date().toLocaleDateString('vi-VN'),
            name: document.getElementById('chkName').value,
            phone: phone,
            address: document.getElementById('chkAddress').value,
            items: cart.map(item => {
                const p = products.find(prod => prod.id === item.productId);
                return {
                    title: p ? p.title : 'Sách',
                    image: p ? p.image : '',
                    price: p ? p.price : 0,
                    quantity: item.quantity
                };
            }),
            subtotal: parseFloat(localStorage.getItem('cartSubtotalVal')) || 0,
            discount: parseFloat(localStorage.getItem('cartDiscountVal')) || 0,
            total: parseFloat(localStorage.getItem('cartTotalVal')) || 0
        };
        orders.unshift(newOrder);
        localStorage.setItem('orders', JSON.stringify(orders));

        alert('Chúc mừng! Đơn hàng ' + newOrder.id + ' của bạn đã được đặt thành công.');
        
        // Reset giỏ hàng
        localStorage.removeItem('cart');
        localStorage.removeItem('activePromo');
        localStorage.removeItem('cartSubtotalVal');
        localStorage.removeItem('cartDiscountVal');
        localStorage.removeItem('cartTotalVal');
        cart = [];
        updateCartBadge();
        
        window.location.href = 'orders.html'; // Chuyển đến trang lịch sử mua hàng!
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
        const usernameInput = form.querySelector('input[type="text"]');
        const username = usernameInput ? usernameInput.value.trim() : 'Khách hàng';
        
        // Lưu lại tài khoản đăng nhập
        localStorage.setItem('currentUser', username);
        
        alert('Đăng nhập thành công! Chào mừng ' + username + ' quay trở lại.');
        window.location.href = 'index.html';
    });
}

// ==========================================
// CHỨC NĂNG WISH LIST (SÁCH YÊU THÍCH)
// ==========================================
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

function updateWishlistBadge() {
    const badges = document.querySelectorAll('.wishlist-count');
    badges.forEach(badge => {
        badge.textContent = wishlist.length;
        badge.style.display = wishlist.length > 0 ? 'flex' : 'none';
    });
}

function isInWishlist(productId) {
    return wishlist.includes(productId);
}

function toggleWishlist(event, productId) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    const index = wishlist.indexOf(productId);
    if (index > -1) {
        wishlist.splice(index, 1);
        alert('Đã xóa sách khỏi danh sách yêu thích!');
    } else {
        wishlist.push(productId);
        alert('Đã thêm sách vào danh sách yêu thích!');
    }
    
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    updateWishlistBadge();
    
    // Cập nhật biểu tượng tim trên trang
    const btn = document.getElementById(`wishBtn-${productId}`);
    if (btn) {
        const icon = btn.querySelector('i');
        if (icon) {
            if (isInWishlist(productId)) {
                icon.className = 'fa-solid fa-heart';
                btn.style.color = '#e24c4c';
            } else {
                icon.className = 'fa-regular fa-heart';
                btn.style.color = 'inherit';
            }
        }
    }
    
    if (window.location.pathname.includes('wishlist.html')) {
        renderWishlistPage();
    }
}

function renderWishlistPage() {
    const container = document.getElementById('wishlistProducts');
    const emptyMsg = document.getElementById('emptyWishlistMsg');
    if (!container) return;
    
    if (wishlist.length === 0) {
        container.innerHTML = '';
        if (emptyMsg) emptyMsg.style.display = 'block';
        return;
    }
    
    if (emptyMsg) emptyMsg.style.display = 'none';
    
    let html = '';
    wishlist.forEach(id => {
        const product = products.find(p => p.id === id);
        if (product) {
            html += createProductCard(product);
        }
    });
    container.innerHTML = html;
}

// ==========================================
// CHỨC NĂNG MÃ GIẢM GIÁ (PROMO CODES)
// ==========================================
const PROMO_CODES = {
    'BOOKHAVEN10': { type: 'percent', value: 10, label: 'Giảm 10% tổng đơn hàng' },
    'CHAOHE50': { type: 'fixed', value: 50000, label: 'Giảm 50.000 đ' },
    'MUAHE20': { type: 'percent', value: 20, label: 'Giảm 20% tổng đơn hàng' }
};

let activePromo = localStorage.getItem('activePromo') || '';

function initPromoCodes() {
    const promoInput = document.getElementById('promoInput');
    const applyBtn = document.getElementById('applyPromoBtn');
    const promoMsg = document.getElementById('promoMsg');
    
    if (!promoInput || !applyBtn) return;
    
    if (activePromo) {
        promoInput.value = activePromo;
        applyPromoCode(activePromo, false);
    }
    
    applyBtn.addEventListener('click', () => {
        const code = promoInput.value.trim().toUpperCase();
        if (!code) {
            removePromoCode();
            return;
        }
        applyPromoCode(code, true);
    });
}

function applyPromoCode(code, showNotification = true) {
    const promoMsg = document.getElementById('promoMsg');
    const promo = PROMO_CODES[code];
    
    if (!promo) {
        if (promoMsg) {
            promoMsg.style.color = '#e24c4c';
            promoMsg.textContent = 'Mã giảm giá không hợp lệ!';
            promoMsg.style.display = 'block';
        }
        if (showNotification) alert('Mã giảm giá không hợp lệ!');
        removePromoCode();
        return;
    }
    
    activePromo = code;
    localStorage.setItem('activePromo', code);
    
    if (promoMsg) {
        promoMsg.style.color = '#2F5A46';
        promoMsg.textContent = `Áp dụng thành công: ${promo.label}`;
        promoMsg.style.display = 'block';
    }
    
    if (showNotification) alert(`Áp dụng mã giảm giá ${code} thành công!`);
    
    if (window.location.pathname.includes('cart.html')) {
        renderCartPage();
    } else if (window.location.pathname.includes('checkout.html')) {
        renderCheckoutSummary();
    }
}

function removePromoCode() {
    activePromo = '';
    localStorage.removeItem('activePromo');
    localStorage.removeItem('cartDiscountVal');
    const promoMsg = document.getElementById('promoMsg');
    if (promoMsg) promoMsg.style.display = 'none';
    
    if (window.location.pathname.includes('cart.html')) {
        renderCartPage();
    } else if (window.location.pathname.includes('checkout.html')) {
        renderCheckoutSummary();
    }
}

// ==========================================
// CHỨC NĂNG REVIEW & ĐÁNH GIÁ (RATING)
// ==========================================
function initProductReviews() {
    const reviewForm = document.getElementById('reviewForm');
    const starsInput = document.getElementById('starRatingInput');
    const reviewsList = document.getElementById('reviewsList');
    if (!reviewForm || !starsInput) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));
    if (!productId) return;
    
    renderReviews(productId);
    
    const stars = starsInput.querySelectorAll('i');
    stars.forEach(star => {
        star.addEventListener('click', () => {
            const rating = parseInt(star.getAttribute('data-rating'));
            document.getElementById('reviewRatingVal').value = rating;
            
            stars.forEach(s => {
                const r = parseInt(s.getAttribute('data-rating'));
                if (r <= rating) {
                    s.className = 'fa-solid fa-star';
                } else {
                    s.className = 'fa-regular fa-star';
                }
            });
        });
    });
    
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        document.getElementById('reviewAuthor').value = currentUser;
    }
    
    reviewForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const author = document.getElementById('reviewAuthor').value.trim();
        const text = document.getElementById('reviewText').value.trim();
        const rating = parseInt(document.getElementById('reviewRatingVal').value);
        
        const reviews = JSON.parse(localStorage.getItem(`reviews_${productId}`)) || [];
        const newReview = {
            author: author,
            text: text,
            rating: rating,
            date: new Date().toLocaleDateString('vi-VN')
        };
        
        reviews.unshift(newReview);
        localStorage.setItem(`reviews_${productId}`, JSON.stringify(reviews));
        
        alert('Cảm ơn bạn đã gửi nhận xét đánh giá!');
        reviewForm.reset();
        
        stars.forEach(s => s.className = 'fa-solid fa-star');
        document.getElementById('reviewRatingVal').value = 5;
        if (currentUser) {
            document.getElementById('reviewAuthor').value = currentUser;
        }
        
        renderReviews(productId);
    });
}

function renderReviews(productId) {
    const list = document.getElementById('reviewsList');
    if (!list) return;
    
    let reviews = JSON.parse(localStorage.getItem(`reviews_${productId}`));
    if (!reviews) {
        reviews = [
            { author: 'Nguyễn Văn A', text: 'Sách đóng gói rất đẹp, giao hàng nhanh. Nội dung rất hay và ý nghĩa!', rating: 5, date: '12/05/2026' },
            { author: 'Trần Thị B', text: 'Bìa sách thiết kế rất đẹp, giấy xịn, đáng tiền mua.', rating: 4, date: '10/05/2026' }
        ];
        localStorage.setItem(`reviews_${productId}`, JSON.stringify(reviews));
    }
    
    let html = '';
    reviews.forEach(r => {
        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
            starsHtml += i <= r.rating ? '<i class="fa-solid fa-star" style="color: #ffb300;"></i>' : '<i class="fa-regular fa-star" style="color: #ccc;"></i>';
        }
        
        html += `
            <div class="review-item" style="padding: 20px 0; border-bottom: 1px solid var(--border-color);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <strong>${r.author}</strong>
                    <span style="font-size: 0.85rem; color: var(--text-muted);">${r.date}</span>
                </div>
                <div style="margin-bottom: 8px;">${starsHtml}</div>
                <p style="color: var(--text-main); font-size: 0.95rem; line-height: 1.6;">${r.text}</p>
            </div>
        `;
    });
    
    list.innerHTML = html;
}

// ==========================================
// CHỨC NĂNG LỊCH SỬ ĐƠN HÀNG (ORDERS.HTML)
// ==========================================
function renderOrdersPage() {
    const container = document.getElementById('ordersList');
    const emptyMsg = document.getElementById('emptyOrdersMsg');
    if (!container) return;
    
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    
    if (orders.length === 0) {
        container.innerHTML = '';
        if (emptyMsg) emptyMsg.style.display = 'block';
        return;
    }
    
    if (emptyMsg) emptyMsg.style.display = 'none';
    
    let html = '';
    orders.forEach(order => {
        let itemsHtml = '';
        order.items.forEach(item => {
            itemsHtml += `
                <div style="display: flex; gap: 15px; align-items: center; padding: 10px 0; border-bottom: 1px dotted var(--border-color);">
                    <img src="${item.image}" alt="${item.title}" style="width: 50px; height: 70px; object-fit: cover; border-radius: 4px;">
                    <div style="flex: 1;">
                        <h4 style="margin: 0; font-size: 0.95rem; color: var(--primary-color);">${item.title}</h4>
                        <div style="font-size: 0.85rem; color: var(--text-muted);">${formatVND(item.price)} x ${item.quantity}</div>
                    </div>
                    <div style="font-weight: 600; color: var(--primary-color);">${formatVND(item.price * item.quantity)}</div>
                </div>
            `;
        });
        
        let discountHtml = '';
        if (order.discount > 0) {
            discountHtml = `
                <div style="display: flex; justify-content: space-between; font-size: 0.9rem; color: #e24c4c; margin-bottom: 5px;">
                    <span>Giảm giá:</span>
                    <span>-${formatVND(order.discount)}</span>
                </div>
            `;
        }
        
        html += `
            <div class="order-card box-shadow-panel" style="padding: 25px; background: var(--bg-alt); border: 1px solid var(--border-color); border-radius: var(--radius-md); margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; border-bottom: 2px solid var(--primary-color); padding-bottom: 15px; margin-bottom: 15px; flex-wrap: wrap; gap: 10px;">
                    <div>
                        <span style="font-weight: 700; color: var(--primary-color);">MÃ ĐƠN HÀNG: ${order.id}</span>
                        <span style="margin-left: 15px; font-size: 0.9rem; color: var(--text-muted);">Ngày đặt: ${order.date}</span>
                    </div>
                    <div style="background-color: var(--secondary-color); color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: 600;">Đang xử lý</div>
                </div>
                
                <div style="margin-bottom: 20px;">
                    ${itemsHtml}
                </div>
                
                <div style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 20px; align-items: flex-end;">
                    <div style="font-size: 0.9rem; color: var(--text-muted); line-height: 1.6;">
                        <strong>Người nhận:</strong> ${order.name}<br>
                        <strong>Điện thoại:</strong> ${order.phone}<br>
                        <strong>Địa chỉ:</strong> ${order.address}
                    </div>
                    
                    <div style="min-width: 220px; text-align: right;">
                        <div style="display: flex; justify-content: space-between; font-size: 0.9rem; color: var(--text-muted); margin-bottom: 5px;">
                            <span>Tạm tính:</span>
                            <span>${formatVND(order.subtotal)}</span>
                        </div>
                        ${discountHtml}
                        <div style="display: flex; justify-content: space-between; font-size: 0.9rem; color: var(--text-muted); margin-bottom: 10px;">
                            <span>Phí vận chuyển:</span>
                            <span style="color: #2F5A46; font-weight: 500;">Miễn phí</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 1.15rem; font-weight: 700; color: var(--primary-color); border-top: 1px solid var(--border-color); padding-top: 8px;">
                            <span>Tổng thanh toán:</span>
                            <span>${formatVND(order.total)}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// ==========================================
// KHỞI CHẠY KHI TẢI TRANG XONG
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // Dynamic Layout, Auth & Wishlist Injection
    const navActions = document.querySelector('.nav-actions');
    const headerContainer = document.querySelector('.header-container');
    const navMenu = document.querySelector('.nav-menu');
    const searchBar = document.querySelector('.search-bar');
    
    // Inject Wishlist Icon next to Cart Icon
    if (navActions && !navActions.querySelector('.wishlist-icon')) {
        const wishlistLink = document.createElement('a');
        wishlistLink.href = 'wishlist.html';
        wishlistLink.className = 'action-icon wishlist-icon';
        wishlistLink.title = 'Sách yêu thích';
        wishlistLink.innerHTML = `
            <i class="fa-regular fa-heart"></i>
            <span class="wishlist-count" style="position: absolute; top: -8px; right: -10px; background-color: var(--secondary-color); color: white; font-size: 0.75rem; font-weight: 700; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; border-radius: 50%; display: none;">0</span>
        `;
        
        const accountLink = navActions.querySelector('a[href="login.html"]') || navActions.querySelector('.user-dropdown');
        if (accountLink) {
            navActions.insertBefore(wishlistLink, accountLink);
        } else {
            navActions.appendChild(wishlistLink);
        }
    }
    
    // Update Auth UI based on currentUser
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser && navActions) {
        const accountLink = navActions.querySelector('a[href="login.html"]');
        if (accountLink) {
            const dropdown = document.createElement('div');
            dropdown.className = 'user-dropdown dropdown';
            dropdown.innerHTML = `
                <a href="#" class="action-icon" title="Tài khoản" style="font-size: 0.95rem; font-weight: 600; display: flex; align-items: center; gap: 6px; color: var(--bg-main);">
                    <i class="fa-solid fa-user-check" style="font-size: 1.15rem;"></i>
                    <span class="username-display">${currentUser}</span>
                </a>
                <ul class="dropdown-content" style="min-width: 170px; right: 0; left: auto; padding: 10px 0; border: 1px solid var(--border-color); border-radius: var(--radius-md); background: var(--primary-color);">
                    <li><a href="orders.html" style="font-size: 0.9rem; padding: 8px 16px; color: var(--bg-main);"><i class="fa-solid fa-box" style="margin-right: 8px; font-size: 0.8rem;"></i>Đơn hàng</a></li>
                    <li><a href="wishlist.html" style="font-size: 0.9rem; padding: 8px 16px; color: var(--bg-main);"><i class="fa-solid fa-heart" style="margin-right: 8px; font-size: 0.8rem;"></i>Yêu thích</a></li>
                    <li><a href="#" id="logoutBtn" style="font-size: 0.9rem; padding: 8px 16px; color: var(--bg-main); border-top: 1px solid rgba(255,255,255,0.1);"><i class="fa-solid fa-right-from-bracket" style="margin-right: 8px; font-size: 0.8rem;"></i>Đăng xuất</a></li>
                </ul>
            `;
            accountLink.parentNode.replaceChild(dropdown, accountLink);
            
            const logoutBtn = dropdown.querySelector('#logoutBtn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (confirm('Bạn có chắc chắn muốn đăng xuất tài khoản?')) {
                        localStorage.removeItem('currentUser');
                        alert('Đăng xuất tài khoản thành công!');
                        window.location.href = 'index.html';
                    }
                });
            }
        }
    }
    
    // Inject mobile hamburger controls
    if (headerContainer && navMenu && !headerContainer.querySelector('.mobile-controls')) {
        const mobileControls = document.createElement('div');
        mobileControls.className = 'mobile-controls';
        mobileControls.innerHTML = `
            <button class="mobile-search-toggle" title="Tìm kiếm"><i class="fa-solid fa-magnifying-glass"></i></button>
            <button class="mobile-menu-toggle" aria-label="Menu" title="Menu">
                <span class="bar"></span>
                <span class="bar"></span>
                <span class="bar"></span>
            </button>
        `;
        headerContainer.appendChild(mobileControls);
        
        const menuToggle = mobileControls.querySelector('.mobile-menu-toggle');
        const searchToggle = mobileControls.querySelector('.mobile-search-toggle');
        
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            if (searchBar) searchBar.classList.remove('active');
        });
        
        if (searchBar) {
            searchToggle.addEventListener('click', () => {
                searchBar.classList.toggle('active');
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        }
    }

    // Dynamic Footer Links Updater
    const footerCols = document.querySelectorAll('.footer-col');
    footerCols.forEach(col => {
        const header = col.querySelector('h3');
        if (header) {
            const title = header.textContent.trim();
            const links = col.querySelectorAll('ul li a');
            if (title === 'Về chúng tôi') {
                if (links[0]) links[0].href = 'about.html';
                if (links[1]) links[1].href = 'privacy.html';
                if (links[2]) links[2].href = 'terms.html';
            } else if (title === 'Hỗ trợ khách hàng') {
                if (links[0]) links[0].href = 'guide.html';
                if (links[1]) links[1].href = 'returns.html';
                if (links[2]) links[2].href = 'contact.html';
            }
        }
    });

    // Dynamic Header Lab Link Text Normalization
    const labLinks = document.querySelectorAll('a[href="labs.html"]');
    labLinks.forEach(link => {
        link.textContent = 'Lab Thực Hành';
    });

    // Header & chung
    updateCartBadge();
    updateWishlistBadge();
    
    // Trang chủ
    renderFeaturedProducts();
    
    // Trang Giỏ hàng
    renderCartPage();
    initPromoCodes();

    // Trang Cửa hàng
    renderShopProducts();
    initShopFilters();

    // Trang Chi tiết
    renderProductDetail();
    initProductReviews();

    // Trang Thanh toán
    renderCheckoutSummary();
    initCheckoutForm();

    // Trang Đăng nhập
    initLoginForm();
    
    // Trang sách yêu thích
    renderWishlistPage();
    
    // Trang lịch sử đơn hàng
    renderOrdersPage();
});
