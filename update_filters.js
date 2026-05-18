const fs = require('fs');

// 1. Cập nhật products.html
let html = fs.readFileSync('products.html', 'utf8');
const htmlTarget = `<aside class="shop-sidebar">
                <div class="filter-group">
                    <h3>Tìm kiếm</h3>
                    <input type="text" id="shopSearch" placeholder="Tên sách, tác giả..." class="form-control">
                </div>
                <div class="filter-group">
                    <h3>Danh mục</h3>
                    <ul class="category-list" id="categoryList">
                        <li><a href="#" class="active" data-cat="all">Tất cả sách</a></li>
                        <li><a href="#" data-cat="Văn học">Văn học</a></li>
                        <li><a href="#" data-cat="Kỹ năng sống">Kỹ năng sống</a></li>
                        <li><a href="#" data-cat="Lịch sử">Lịch sử</a></li>
                        <li><a href="#" data-cat="CNTT">CNTT</a></li>
                    </ul>
                </div>
            </aside>`;

// Thay thế linh hoạt bằng regex để không bị lỗi dòng trống hay CRLF
html = html.replace(/<aside class="shop-sidebar">[\s\S]*?<\/aside>/, `<aside class="shop-sidebar">
                <div class="filter-group">
                    <h3>Tìm kiếm</h3>
                    <input type="text" id="shopSearch" placeholder="Tên sách, tác giả..." class="form-control">
                </div>
                <div class="filter-group" style="margin-bottom: 25px;">
                    <h3>Sắp xếp</h3>
                    <select id="shopSort" class="form-control" style="width: 100%; padding: 10px; border-radius: var(--radius-md); border: 1px solid var(--border-color); background-color: var(--bg-alt); color: var(--text-main); font-family: inherit;">
                        <option value="default">Mặc định</option>
                        <option value="price-asc">Giá: Thấp đến Cao</option>
                        <option value="price-desc">Giá: Cao đến Thấp</option>
                        <option value="name-asc">Tên: A - Z</option>
                        <option value="name-desc">Tên: Z - A</option>
                    </select>
                </div>
                <div class="filter-group">
                    <h3>Khoảng giá</h3>
                    <ul class="category-list" id="priceList">
                        <li><a href="#" class="active" data-price="all">Tất cả giá</a></li>
                        <li><a href="#" data-price="under-70">Dưới 70.000đ</a></li>
                        <li><a href="#" data-price="70-120">70.000đ - 120.000đ</a></li>
                        <li><a href="#" data-price="over-120">Trên 120.000đ</a></li>
                    </ul>
                </div>
                <div class="filter-group">
                    <h3>Danh mục</h3>
                    <ul class="category-list" id="categoryList">
                        <li><a href="#" class="active" data-cat="all">Tất cả sách</a></li>
                        <!-- JS Render -->
                    </ul>
                </div>
            </aside>`);
fs.writeFileSync('products.html', html, 'utf8');

// 2. Cập nhật main.js
let js = fs.readFileSync('assets/js/main.js', 'utf8');
const jsTarget = /function initShopFilters\(\) \{[\s\S]*?\n\}/;

const newJs = `function initShopFilters() {
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
}`;

js = js.replace(jsTarget, newJs);
fs.writeFileSync('assets/js/main.js', js, 'utf8');

console.log('Filters updated!');
