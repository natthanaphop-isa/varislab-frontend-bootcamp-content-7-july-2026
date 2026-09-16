const showBtn = document.getElementById("showBtn");
const ProductList = document.getElementById("Product List");
const products = [
    { name: "Wireless Keyboard", price: "1,590 บาท", category: "อุปกรณ์ไอที" },
    { name: "Ergonomic Mouse", price: "890 บาท", category: "อุปกรณ์ไอที" },
    { name: "Gaming Headset", price: "2,490 บาท", category: "เครื่องเสียง" },
    { name: "Mechanical Numpad", price: "790 บาท", category: "อุปกรณ์ไอที" },
];

let isShow = false;

showBtn.addEventListener("click", function () {
    if (isShow === false) {
        products.forEach(function (product) {
            const productCard = document.createElement("article");
            productCard.classList.add("product-card");

            productCard.innerHTML = `
                <h3>${product.name}</h3>
                <p><strong>ราคา:</strong> ${product.price}</p>
                <p><strong>หมวดหมู่:</strong> ${product.category}</p>
            `;

            ProductList.appendChild(productCard);
        });

        // เปลี่ยนข้อความปุ่ม และเปลี่ยนสถานะ
        showBtn.textContent = "ซ่อนสินค้า";
        isShow = true;
    } else {
        // ล้างการ์ดออกไปเมื่อกดอีกครั้ง
        ProductList.innerHTML = "";
        showBtn.textContent = "ดูสินค้า";
        isShow = false;
    }
});