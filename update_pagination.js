const fs = require('fs');

// 1. Cập nhật products.html
let html = fs.readFileSync('products.html', 'utf8');
if (!html.includes('id="pagination"')) {
    html = html.replace(/<div id="noProductsMsg"[\s\S]*?<\/div>/, match => {
        return match + '\n                <div id="pagination" class="pagination" style="display: flex; justify-content: center; gap: 10px; margin-top: 30px; flex-wrap: wrap;"></div>';
    });
    fs.writeFileSync('products.html', html, 'utf8');
}

// 2. Cập nhật main.js
let js = fs.readFileSync('assets/js/main.js', 'utf8');

// Replace renderShopProducts and initShopFilters
const jsTarget = /function renderShopProducts\([\s\S]*?if \(priceLinks\.length > 0\) \{[\s\S]*?\}\n\}/;

const newJs = `let currentPage = 1;
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
    
    // Pagination logic
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

    // Render Pagination Buttons
    if (paginationContainer) {
        let pagHtml = '';
        if (totalPages > 1) {
            for (let i = 1; i <= totalPages; i++) {
                if (i === currentPage) {
                    pagHtml += \`<button class="btn btn-primary" style="padding: 5px 12px; min-width: 40px;">\${i}</button>\`;
                } else {
                    pagHtml += \`<button class="btn" style="padding: 5px 12px; min-width: 40px; background-color: var(--bg-alt); border: 1px solid var(--border-color); color: var(--text-main);" onclick="changePage(\${i})">\${i}</button>\`;
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

        currentFilteredProducts = filtered;
        renderShopProducts(filtered, 1);
    }

    // Initialize state
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
}`;

js = js.replace(jsTarget, newJs);
fs.writeFileSync('assets/js/main.js', js, 'utf8');
console.log('Pagination implemented!');
