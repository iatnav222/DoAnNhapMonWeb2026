// Mảng chứa dữ liệu các sản phẩm sách giả lập (Mock Data)
const products = [
    {
        id: 1,
        title: "Đắc Nhân Tâm",
        author: "Dale Carnegie",
        price: 85000,
        originalPrice: 100000,
        category: "Kỹ năng sống",
        image: "https://placehold.co/300x400/eeeeee/31343c?text=Dac+Nhan+Tam",
        rating: 5,
        isFeatured: true
    },
    {
        id: 2,
        title: "Sapiens: Lược Sử Loài Người",
        author: "Yuval Noah Harari",
        price: 150000,
        originalPrice: 180000,
        category: "Lịch sử",
        image: "https://placehold.co/300x400/eeeeee/31343c?text=Sapiens",
        rating: 4.5,
        isFeatured: true
    },
    {
        id: 3,
        title: "Code Dạo Ký Sự",
        author: "Phạm Huy Hoàng",
        price: 95000,
        originalPrice: 110000,
        category: "CNTT",
        image: "https://placehold.co/300x400/eeeeee/31343c?text=Code+Dao",
        rating: 4,
        isFeatured: true
    },
    {
        id: 4,
        title: "Tôi Thấy Hoa Vàng Trên Cỏ Xanh",
        author: "Nguyễn Nhật Ánh",
        price: 75000,
        originalPrice: 90000,
        category: "Văn học",
        image: "https://placehold.co/300x400/eeeeee/31343c?text=Hoa+Vang",
        rating: 5,
        isFeatured: true
    }
];

// Hàm format tiền tệ VNĐ
function formatVND(amount) {
    return amount.toLocaleString('vi-VN') + ' đ';
}
