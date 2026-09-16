# สัญญาของ dummyjson (contract)

โฟลเดอร์นี้คือ **response จริง** ของ <https://dummyjson.com> ที่ยิงเก็บไว้เมื่อ **13 กันยายน 2026**
ไฟล์ `.json` / `.txt` ข้าง ๆ คือหลักฐานดิบ (ไม่จัดรูปแบบใหม่ ไม่แก้ด้วยมือ) และเอกสารนี้คือสรุปที่อ่านจบได้เร็ว

API ที่เราสร้างในคอร์สนี้ต้องตอบให้ **เหมือนไฟล์เหล่านี้** ทั้งชื่อ field, ชนิดข้อมูล, status code
และพฤติกรรมกรณีขอบ เพราะ React app ฝั่ง client จะเปลี่ยนแค่ `VITE_API_BASE_URL` บรรทัดเดียว
แล้วเรียกใช้ API ของเราโดยไม่รู้ตัวว่าเปลี่ยน server

> เวลาเขียน prompt ให้ Cursor ให้ `@`-mention ไฟล์ในโฟลเดอร์นี้เสมอ — แหล่งความจริงเรื่องรูปทรง response
> คือ **ไฟล์ในโปรเจกต์** ไม่ใช่ความรู้ของโมเดล

---

## endpoint ที่ต้องทำให้เหมือน

| Method | Path | Status | หลักฐาน | บทที่สร้าง |
| --- | --- | --- | --- | --- |
| GET | `/products/categories` | 200 | `categories.json` | 10 |
| GET | `/products/:id` | 200 / 404 | `product-1.json`, `product-not-found.txt` | 12 |
| GET | `/products?limit=&skip=` | 200 | `products-page.json` | 13 |
| GET | `/products/category/:slug?limit=&skip=` | 200 | `products-by-category.json`, `products-by-category-unknown.json` | 14 |
| POST | `/carts/add` | 201 | `cart-add.txt` | 19 |

---

## รูปทรงของ Product (22 key ระดับบนสุด)

```ts
interface Product {
  id: number;                       // 1–194 เรียงต่อเนื่อง
  title: string;
  description: string;
  category: string;                 // slug ของหมวด เช่น "beauty" — เป็น string ไม่ใช่ object
  price: number;                    // 0.79–36999.99
  discountPercentage: number;       // 0.04–19.61
  rating: number;                   // 2.51–4.99
  stock: number;                    // 0–100
  tags: string[];                   // 1–3 รายการ
  brand?: string;                   // ⚠️ 92 จาก 194 ชิ้น "ไม่มี key นี้เลย" (ไม่ใช่ null)
  sku: string;                      // เช่น "BEA-ESS-ESS-001"
  weight: number;                   // จำนวนเต็ม 1–10
  dimensions: { width: number; height: number; depth: number };
  warrantyInformation: string;      // ข้อความอิสระ ดูตารางค่าที่พบด้านล่าง
  shippingInformation: string;
  availabilityStatus: string;       // "In Stock" | "Low Stock" | "Out of Stock"
  reviews: Review[];                // 3 รายการต่อสินค้าหนึ่งชิ้น ทุกชิ้น
  returnPolicy: string;
  minimumOrderQuantity: number;     // 1–50
  meta: {
    createdAt: string;              // ISO string ไม่ใช่ Date object
    updatedAt: string;
    barcode: string;                // ตัวเลข 13 หลักในรูป string
    qrCode: string;                 // URL รูป
  };
  images: string[];                 // 1–6 URL
  thumbnail: string;
}

interface Review {
  rating: number;                   // จำนวนเต็ม 1–5
  comment: string;
  date: string;                     // ISO string
  reviewerName: string;
  reviewerEmail: string;
}
```

**ลำดับ key ใน JSON** เป็นไปตามลิสต์ข้างบน (`id` → `thumbnail`) โดย `reviews` อยู่ก่อน `returnPolicy`
ลำดับนี้ไม่มีผลต่อ React app แต่ทำให้ `diff` เทียบกับไฟล์ contract อ่านง่ายขึ้น

**หมายเหตุสำคัญเรื่อง `brand`** — 92 ชิ้นไม่มี key `brand` เลย ไม่ใช่มี key แล้วเป็น `null`
ฝั่งฐานข้อมูลของเราคอลัมน์นี้จึงต้อง nullable และ mapper ต้อง **ตัด key ออก** เมื่อค่าเป็น `null`
(ใช้ spread แบบมีเงื่อนไข ไม่ใช่กำหนดค่าเป็น `undefined`)

---

## ซองของรายการสินค้า (list envelope)

`GET /products` และ `GET /products/category/:slug` ใช้ซองเดียวกัน

```ts
interface ProductListResponse {
  products: Product[];
  total: number;   // จำนวนสินค้าทั้งหมดที่ตรงเงื่อนไข ไม่ใช่จำนวนในหน้านี้
  skip: number;    // echo ค่าที่รับมา (ไม่ส่ง = 0)
  limit: number;   // ⚠️ จำนวนแถวที่ส่งกลับมาจริง ไม่ใช่ค่าที่ client ขอ
}
```

กฎของ pagination ที่พิสูจน์แล้ว

| ที่ส่งไป | ที่ได้กลับมา |
| --- | --- |
| ไม่ส่ง query | 30 แถว, `{ total: 194, skip: 0, limit: 30 }` |
| `?limit=2&skip=0` | 2 แถว, `limit: 2` |
| `?limit=0` | **194 แถว** (`limit=0` แปลว่า "เอาทั้งหมด" ไม่ใช่ "เอา 0 ชิ้น"), `limit: 194` |
| `?limit=10&skip=190` | **4 แถว**, `limit: 4` ← ไม่ใช่ 10 |
| หมวดที่ไม่มีจริง `?limit=2` | 0 แถว, `limit: 0` ← ไม่ใช่ 2 |

สรุปเป็นประโยคเดียว: **`limit` ที่ตอบกลับคือ `products.length` เสมอ** ห้าม echo ค่าที่รับมา

---

## Category

`GET /products/categories` ตอบเป็น **array ตรง ๆ ไม่มีซองห่อ** จำนวน 24 รายการ

```ts
type CategoryListResponse = Array<{
  slug: string;   // "beauty"
  name: string;   // "Beauty"
  url: string;    // "https://dummyjson.com/products/category/beauty"
}>;
```

`url` ของ dummyjson ชี้กลับไปที่ host ของตัวเอง ของเราจึงต้องประกอบจาก `APP_URL` ของเราเอง
(`${APP_URL}/products/category/${slug}`) — นี่เป็น field เดียวที่ค่าจะ **ไม่** ตรงกับไฟล์ contract โดยเจตนา

---

## POST /carts/add

**Request** (รูปแบบเดียวกับที่ React app ส่งจริงจากหน้า checkout)

```json
{
  "userId": 1,
  "products": [{ "id": 1, "quantity": 2 }],
  "address": { "address": "1 Sukhumvit Rd", "email": "a@b.com", "phone": "0812345678" }
}
```

**Response — status `201`** (ไม่ใช่ 200)

```json
{
  "id": 209,
  "products": [
    {
      "id": 1,
      "title": "Essence Mascara Lash Princess",
      "price": 9.99,
      "quantity": 2,
      "total": 19.98,
      "discountPercentage": 10.48,
      "discountedPrice": 18,
      "thumbnail": "https://cdn.dummyjson.com/product-images/beauty/essence-mascara-lash-princess/thumbnail.webp"
    }
  ],
  "total": 19.98,
  "discountedTotal": 18,
  "userId": 1,
  "totalProducts": 1,
  "totalQuantity": 2
}
```

สูตรที่อ่านออกจากตัวเลขชุดนี้

| field | สูตร | ตัวอย่าง |
| --- | --- | --- |
| `products[].total` | `price × quantity` | 9.99 × 2 = 19.98 |
| `products[].discountedPrice` | `Math.round(total × (1 − discountPercentage / 100))` | round(19.98 × 0.8952) = round(17.886) = **18** |
| `total` | ผลรวม `products[].total` | 19.98 |
| `discountedTotal` | ผลรวม `products[].discountedPrice` | 18 |
| `totalProducts` | จำนวน **รายการ** ใน `products` | 1 |
| `totalQuantity` | ผลรวม **จำนวนชิ้น** ทุกรายการ | 2 |

จุดที่พลาดบ่อย: `discountedPrice` ปัดเป็น **จำนวนเต็ม** ด้วย `Math.round` (ไม่ใช่ทศนิยม 2 ตำแหน่ง)
และ `totalProducts` กับ `totalQuantity` มักถูกสลับกัน

สิ่งที่ response **ไม่มี**: `address` ที่เราส่งไปไม่ถูก echo กลับ และ `id` เป็นเลขที่ server แจก
(dummyjson ให้ 209 — ของเราจะเริ่มจาก 1 เพราะเก็บคำสั่งซื้อในฐานข้อมูลของเราเอง ข้อนี้ไม่ต้องทำให้ตรงกัน)

---

## กรณีขอบที่เดาไม่ได้ (จำให้ครบทั้งสี่ข้อ)

1. **id ที่ไม่มีจริง → 404 พร้อมข้อความเฉพาะ** ต้องลอกให้ตรงทุกตัวอักษร รวม single quote ครอบตัวเลข
   เพราะ React แสดงข้อความนี้ให้ผู้ใช้เห็นตรง ๆ
   ```json
   { "message": "Product with id '9999' not found" }
   ```
2. **หมวดที่ไม่มีจริง → 200 ไม่ใช่ 404** ตอบซองเปล่า ไม่ throw error
   ```json
   { "products": [], "total": 0, "skip": 0, "limit": 0 }
   ```
3. **`limit` ที่ตอบกลับคือจำนวนแถวจริง** ไม่ใช่ค่าที่ client ขอ (ดูตาราง pagination ด้านบน)
4. **`brand` หายไปทั้ง key ใน 92 ชิ้น** ไม่ใช่เป็น `null`

---

## ตัวเลขของชุดข้อมูล

| สิ่งที่วัด | ค่า |
| --- | --- |
| จำนวนสินค้าทั้งหมด | 194 |
| จำนวนหมวด | 24 (ทุกหมวดมีสินค้าอย่างน้อย 1 ชิ้น) |
| สินค้าในหมวด `beauty` | 5 |
| review ต่อสินค้า | 3 ทุกชิ้น (รวม 582 รายการ) |
| สินค้าที่ไม่มี key `brand` | 92 |
| ช่วง `id` | 1–194 ไม่มีช่องว่าง |

ค่าของ field ที่เป็นข้อความซ้ำ ๆ — ทั้งหมดเป็น **string อิสระ** ไม่ใช่ enum ในฐานข้อมูลของเรา
(เก็บเป็น `String` ธรรมดา เพราะ dummyjson อาจเพิ่มค่าใหม่ได้ทุกเมื่อ)

| field | ค่าที่พบใน 194 ชิ้น |
| --- | --- |
| `availabilityStatus` | `In Stock` (176), `Low Stock` (14), `Out of Stock` (4) |
| `returnPolicy` | `No return policy`, `7 days`, `30 days`, `60 days`, `90 days return policy` |
| `warrantyInformation` | `No warranty`, `1 week`, `1 month`, `3 months`, `6 months`, `1 year`, `2 year`, `3 year`, `5 year`, `Lifetime warranty` |
| `shippingInformation` | `Ships overnight`, `Ships in 1-2 business days`, `Ships in 3-5 business days`, `Ships in 1 week`, `Ships in 2 weeks`, `Ships in 1 month` |

---

## ไฟล์ในโฟลเดอร์นี้

| ไฟล์ | Request ที่ใช้จับ |
| --- | --- |
| `categories.json` | `curl -s https://dummyjson.com/products/categories` |
| `products-page.json` | `curl -s "https://dummyjson.com/products?limit=2&skip=0"` |
| `product-1.json` | `curl -s https://dummyjson.com/products/1` |
| `product-not-found.txt` | `curl -s -i https://dummyjson.com/products/9999` |
| `products-by-category.json` | `curl -s "https://dummyjson.com/products/category/beauty?limit=2&skip=0"` |
| `products-by-category-unknown.json` | `curl -s "https://dummyjson.com/products/category/nope?limit=2&skip=0"` |
| `cart-add.txt` | `curl -s -i -X POST https://dummyjson.com/carts/add -H 'Content-Type: application/json' -d '…'` |

สองไฟล์ที่เป็น `.txt` ใช้ `-i` เพื่อเก็บ header ไว้ด้วย เพราะสิ่งที่ต้องพิสูจน์ในสองกรณีนั้นคือ
**status code** ไม่ใช่แค่ body — บรรทัดแรกคือ `HTTP/2 404` และ `HTTP/2 201` ตามลำดับ
ส่วน header อื่น (`date`, `cf-ray`, ตัวนับ rate limit) เป็นของรอบที่จับ ไม่มีความหมายกับสัญญา

## ตรวจว่าไฟล์ยังตรงกับของจริง (ไม่บังคับ)

dummyjson เป็น API สาธารณะที่อาจเปลี่ยนข้อมูลได้ ถ้าอยากพิสูจน์ว่าไฟล์ในโฟลเดอร์นี้
ยังเหมือนของจริงวันนี้ ยิงเทียบได้ด้วยคำสั่งเดียว (ต้องได้ `IDENTICAL`)

```bash
curl -s https://dummyjson.com/products/1 | diff - docs/contract/product-1.json && echo IDENTICAL
```

ถ้าได้ diff ออกมา แปลว่า dummyjson เปลี่ยนข้อมูลหลังจากวันที่จับไฟล์ — ให้ยึด **ไฟล์ในโฟลเดอร์นี้**
เป็นเป้าของคอร์สต่อไป (ทุกบทและทุกเกณฑ์ตรวจอ้างอิงตัวเลขชุดนี้) แล้วค่อยจับใหม่เมื่อจบคอร์ส
