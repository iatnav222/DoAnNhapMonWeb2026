const fs = require('fs');

const navHtml = `            <nav class="nav-menu">
                <ul class="nav-links">
                    <li><a href="index.html">Trang chủ</a></li>
                    <li><a href="products.html">Cửa hàng</a></li>
                    <li><a href="labs.html" class="lab-btn">Báo cáo Lab</a></li>
                </ul>
                
                <div class="nav-actions">
                    <a href="login.html" class="action-icon" title="Tài khoản"><i class="fa-regular fa-user"></i></a>
                    <a href="cart.html" class="action-icon cart-icon" title="Giỏ hàng">
                        <i class="fa-solid fa-cart-shopping"></i>
                        <span class="cart-count">0</span>
                    </a>
                </div>
            </nav>`;

const footerHtml = `    <footer class="footer">
        <div class="container footer-container">
            <div class="footer-col">
                <a href="index.html" class="logo"><img src="assets/images/logo/logo.png" alt="BookHaven Logo" style="height: 50px;"></a>
                <p>Nền tảng mua sắm sách trực tuyến uy tín, đa dạng thể loại và giao hàng nhanh chóng.</p>
            </div>
            <div class="footer-col">
                <h3>Về chúng tôi</h3>
                <ul>
                    <li><a href="#">Giới thiệu</a></li>
                    <li><a href="#">Chính sách bảo mật</a></li>
                    <li><a href="#">Điều khoản sử dụng</a></li>
                </ul>
            </div>
            <div class="footer-col">
                <h3>Hỗ trợ khách hàng</h3>
                <ul>
                    <li><a href="#">Hướng dẫn mua hàng</a></li>
                    <li><a href="#">Chính sách đổi trả</a></li>
                    <li><a href="#">Liên hệ</a></li>
                </ul>
            </div>
            <div class="footer-col">
                <h3>Kết nối</h3>
                <div class="social-links">
                    <a href="#"><i class="fa-brands fa-facebook"></i></a>
                    <a href="#"><i class="fa-brands fa-instagram"></i></a>
                    <a href="#"><i class="fa-brands fa-twitter"></i></a>
                </div>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; 2026 BookHaven. Thiết kế cho Đồ án Môn học.</p>
        </div>
    </footer>`;

const files = ['index.html', 'products.html', 'detail.html', 'cart.html', 'checkout.html', 'login.html'];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace Nav
    content = content.replace(/<nav class="nav-menu">[\s\S]*?<\/nav>/, navHtml);
    
    // Replace Footer
    content = content.replace(/<footer class="footer">[\s\S]*?<\/footer>/, footerHtml);
    
    fs.writeFileSync(file, content, 'utf8');
});

console.log('Layout updated across all files!');
