const fs = require('fs');

const txt = fs.readFileSync('book_info.txt', 'utf8');
// Tách file thành các khối bằng regex tìm "1. Tên sách: "
const blocks = txt.split(/\r?\n\d+\.\s+Tên sách:\s+/);
// Phần tử đầu tiên là header "--- THÔNG TIN ---" nên bỏ qua
const validBlocks = blocks.slice(1);

let jsArray = 'const products = [\n';

validBlocks.forEach((block, index) => {
    const lines = block.split(/\r?\n/);
    const title = lines[0].trim();
    let author = '', category = '', price = 0, file = '', descStart = -1;
    
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (line.startsWith('- Tác giả:')) author = line.replace('- Tác giả:', '').trim();
        else if (line.startsWith('- Thể loại:')) category = line.replace('- Thể loại:', '').trim();
        else if (line.startsWith('- Giá:')) price = parseInt(line.replace('- Giá:', '').trim());
        else if (line.startsWith('- File ảnh:')) file = line.replace('- File ảnh:', '').trim();
        else if (line.startsWith('- Mô tả:')) {
            descStart = i + 1;
            break;
        }
    }
    
    let desc = lines.slice(descStart).join('\n').trim();
    // Tạo cấu trúc <p> cho từng đoạn
    desc = desc.split(/\n\s*\n/).map(p => `<p>${p.trim().replace(/\n/g, ' ')}</p>`).join('');
    
    const id = index + 1;
    const isFeatured = id <= 8 ? 'true' : 'false';
    const rating = (Math.random() * (5 - 4.5) + 4.5).toFixed(1); // Random rating 4.5 -> 5.0
    const originalPrice = price + 20000 + Math.floor(Math.random()*3)*10000;
    
    jsArray += `    {
        id: ${id},
        title: ${JSON.stringify(title)},
        author: ${JSON.stringify(author)},
        price: ${price},
        originalPrice: ${originalPrice},
        category: ${JSON.stringify(category)},
        image: "assets/images/books/${file}",
        rating: ${rating},
        isFeatured: ${isFeatured},
        description: ${JSON.stringify(desc)}
    },
`;
});

jsArray += `];

function formatVND(amount) {
    return amount.toLocaleString('vi-VN') + ' đ';
}
`;

fs.writeFileSync('assets/js/products.js', jsArray, 'utf8');
console.log('Đã tạo thành công assets/js/products.js');
