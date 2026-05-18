const fs = require('fs');
const files = ['products.html', 'detail.html', 'cart.html', 'checkout.html', 'login.html'];
for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/<i class="fa-solid fa-book-open"><\/i> BookHaven/g, '<img src="assets/images/logo/logo.png" alt="BookHaven Logo" style="height: 50px;">');
    fs.writeFileSync(file, content, 'utf8');
}
console.log('Done fixing logo safely!');
