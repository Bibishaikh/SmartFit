// Global Functions & Variables

// Cart Badge Count Update
function updateCartCount() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let countElement = document.getElementById('cart-count');
    if (countElement) {
        countElement.innerText = cart.length;
    }
}

// Variable to store selected size
let selectedSize = 'M';

// 1. Size Select Function
function selectSize(element) {
    const allButtons = document.querySelectorAll('.size-btn');
    allButtons.forEach(btn => btn.classList.remove('selected'));

    element.classList.add('selected');
    selectedSize = element.innerText;
}

// 2. Buy Now Function
function buyNow() {
    let product = JSON.parse(localStorage.getItem('selectedProduct'));
    if (!product) {
        alert('Koi product select nahi hai!');
        return;
    }

    product.selectedSize = typeof selectedSize !== 'undefined' ? selectedSize : 'M';
    localStorage.setItem('checkoutCart', JSON.stringify([product]));
    window.location.href = 'checkout.html';
}

// Screen par bahar click karne se Search Box Band
window.addEventListener('click', (e) => {
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    if (searchInput && searchBtn) {
        if (!searchInput.contains(e.target) && e.target !== searchBtn) {
            searchInput.style.display = 'none';
        }
    }
});

// Main DOM Loaded Event
document.addEventListener('DOMContentLoaded', () => {

    // A. Cart Badge Count Update Call
    updateCartCount();

    // B. Details Page Dynamic Data Load
    let product = JSON.parse(localStorage.getItem('selectedProduct'));
    if (product) {
        const imgElement = document.getElementById('product-img') || document.getElementById('main-product-img');
        const titleElement = document.getElementById('product-title');
        const priceElement = document.getElementById('product-price');
        const thumbContainer = document.getElementById('thumbnail-container');

        if (imgElement) imgElement.src = product.mainImg || product.image;
        if (titleElement) titleElement.innerText = product.name;
        if (priceElement) priceElement.innerText = typeof product.price === 'number' ? `₹${product.price}` : product.price;

        // Side Thumbnails rendering logic
        if (thumbContainer) {
            thumbContainer.innerHTML = '';

            let imagesArray = [];
            if (Array.isArray(product.images)) {
                imagesArray = product.images;
            } else if (typeof product.images === 'string') {
                imagesArray = product.images.split(',');
            } else if (product.mainImg || product.image) {
                imagesArray = [product.mainImg || product.image];
            }

            imagesArray.forEach((imgSrc, index) => {
                const thumb = document.createElement('img');
                thumb.src = imgSrc.trim();
                thumb.style.width = '60px';
                thumb.style.height = '80px';
                thumb.style.objectFit = 'cover';
                thumb.style.cursor = 'pointer';
                thumb.style.borderRadius = '4px';
                thumb.style.border = '1px solid #ccc';
                if (index === 0) thumb.style.borderColor = '#111';

                thumb.onclick = () => {
                    if (imgElement) imgElement.src = imgSrc.trim();
                    document.querySelectorAll('#thumbnail-container img').forEach(t => t.style.borderColor = '#ccc');
                    thumb.style.borderColor = '#111';
                };

                thumbContainer.appendChild(thumb);
            });
        }
    }

    // C. Search Box Functionality (Live Search)
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        searchInput.addEventListener('keyup', (e) => {
            const filterValue = e.target.value.toLowerCase().trim();
            const productCards = document.querySelectorAll('.categories-container div[onclick]');

            productCards.forEach(card => {
                const titleElement = card.querySelector('h3');
                if (titleElement) {
                    const titleText = titleElement.textContent.toLowerCase();
                    if (titleText.includes(filterValue)) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                }
            });
        });
    }

    // D. Checkout Page Dynamic Order Summary Load
    const checkoutItemsContainer = document.getElementById('checkout-items');
    const checkoutTotalElement = document.getElementById('checkout-total');

    if (checkoutItemsContainer && checkoutTotalElement) {
        let items = JSON.parse(localStorage.getItem('checkoutCart')) || [];

        if (items.length === 0) {
            let singleProduct = JSON.parse(localStorage.getItem('selectedProduct'));
            if (singleProduct) items = [singleProduct];
        }

        let subtotal = 0;
        checkoutItemsContainer.innerHTML = '';

        items.forEach(item => {
            let numericPrice = typeof item.price === 'string'
                ? parseInt(item.price.replace(/[^0-9]/g, ''), 10)
                : item.price;

            let qty = item.quantity || 1;
            subtotal += numericPrice * qty;

            const itemRow = document.createElement('div');
            itemRow.style.display = 'flex';
            itemRow.style.justifyContent = 'space-between';
            itemRow.style.marginBottom = '12px';

            itemRow.innerHTML = `
                <span>${item.name} (${item.selectedSize || 'M'}) x ${qty}</span>
                <span>₹${numericPrice * qty}</span>
            `;
            checkoutItemsContainer.appendChild(itemRow);
        });

        checkoutTotalElement.innerText = `₹${subtotal}`;
    }
});
// Product Click Function (Page Redirect)
function viewProductDetails(id, name, price, image, imagesList) {
    let imagesArray = [];
    if (typeof imagesList === 'string') {
        imagesArray = imagesList.split(',');
    } else if (Array.isArray(imagesList)) {
        imagesArray = imagesList;
    } else {
        imagesArray = [image];
    }

    const product = {
        id: id,
        name: name,
        price: price,
        image: image,
        mainImg: image,
        images: imagesArray
    };

    localStorage.setItem('selectedProduct', JSON.stringify(product));
    window.location.href = 'details.html';
}
// Cart Page Load hone par items show karne ke liye
document.addEventListener('DOMContentLoaded', () => {
    renderCartItems();
});

function renderCartItems() {
    const container = document.querySelector('.cart-items');
    const countSpan = document.querySelector('.cart-title span');
    const totalPriceEl = document.querySelector('.total-price');

    if (!container) return; // Agar hum cart.html par nahi hain toh ye code nahi chalega

    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Agar cart khali hai lekin selectedProduct pada hai, toh usko default le lein
    if (cart.length === 0) {
        let singleProduct = JSON.parse(localStorage.getItem('selectedProduct'));
        if (singleProduct) {
            singleProduct.quantity = singleProduct.quantity || 1;
            singleProduct.selectedSize = singleProduct.selectedSize || 'M';
            cart = [singleProduct];
            localStorage.setItem('cart', JSON.stringify(cart));
        }
    }

    if (cart.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#777; padding: 20px;">Aapka cart khali hai!</p>';
        if (countSpan) countSpan.innerText = '(0 Items)';
        if (totalPriceEl) totalPriceEl.innerText = '₹0';
        return;
    }

    if (countSpan) countSpan.innerText = (`${cart.length} Items`);
    container.innerHTML = '';
    let total = 0;

    cart.forEach((item, index) => {
        let numericPrice = typeof item.price === 'string' 
            ? parseInt(item.price.replace(/[^0-9]/g, ''), 10) 
            : item.price;

        let qty = item.quantity || 1;
        total += numericPrice * qty;

        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';
        itemDiv.innerHTML = `
            <div class="item-img">
                <img src="${item.mainImg || item.image}" alt="${item.name}">
            </div>
            <div class="item-details">
                <h4>${item.name}</h4>
                <div class="item-specs">Size: ${item.selectedSize || 'M'}</div>
                <div class="item-price">₹${numericPrice}</div>
            </div>
            <div class="item-actions">
                <div class="quantity-counter">
                    <button class="qty-btn" onclick="updateQuantity(${index}, -1)">-</button>
                    <span class="qty-val">${qty}</span>
                    <button class="qty-btn" onclick="updateQuantity(${index}, 1)">+</button>
                </div>
                <button class="delete-btn" onclick="deleteCartItem(${index})">🗑️</button>
            </div>
        `;
        container.appendChild(itemDiv);
    });

    if (totalPriceEl) totalPriceEl.innerText = `₹${total}`;
}

// 1. Quantity Badhane ya Ghataane ka function (+ / -) - Yeh code ke aakhir mein paste karein
function updateQuantity(index, change) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart[index]) {
        cart[index].quantity = (cart[index].quantity || 1) + change;
        if (cart[index].quantity < 1) {
            cart[index].quantity = 1; 
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCartItems(); 
        updateCartCount();
    }
}

// 2. Item Delete karne ka function
function deleteCartItem(index) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.splice(index, 1); 
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCartItems(); 
    updateCartCount();
}

// 3. Universal Fly-to-Cart Function (Animation + Cart Save)
function addToCartUniversal(event, imgElementId) {
    event.preventDefault(); 
    
    let productImg = document.getElementById(imgElementId);
    let cartIcon = document.querySelector('.cart-icon') || document.querySelector('a[href*="cart.html"]');
    
    let product = JSON.parse(localStorage.getItem('selectedProduct')) || {};
    product.selectedSize = typeof selectedSize !== 'undefined' ? selectedSize : 'M';
    product.quantity = 1;

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push(product);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();

    if (!productImg || !cartIcon) {
        window.location.href = 'cart.html';
        return;
    }

    let imgRect = productImg.getBoundingClientRect();
    let cartRect = cartIcon.getBoundingClientRect();

    let flyingImage = document.createElement('img');
    flyingImage.src = productImg.src;
    flyingImage.className = 'flying-img';
    
    flyingImage.style.top = imgRect.top + 'px';
    flyingImage.style.left = imgRect.left + 'px';
    document.body.appendChild(flyingImage);

    setTimeout(() => {
        flyingImage.style.top = cartRect.top + 'px';
        flyingImage.style.left = cartRect.left + 'px';
        flyingImage.style.width = '20px';
        flyingImage.style.height = '20px';
        flyingImage.style.opacity = '0.4';
    }, 50);

    setTimeout(() => {
        flyingImage.remove();
        window.location.href = 'cart.html';
    }, 800);
}
// Search Bar Toggle (Search button click karne par open/close hone ke liye)
const searchBtn = document.getElementById('search-btn');
const searchInput = document.getElementById('search-input');

if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (searchInput.style.display === 'none' || searchInput.style.display === '') {
            searchInput.style.display = 'block';
            searchInput.focus();
        } else {
            searchInput.style.display = 'none';
        }
    });
}
// Checkout page par cart items load karne ka function
// Checkout page par cart items ko buttons aur total ke sath render karne ka code
// Checkout Page Load hone par dono boxes ko render karne ke liye
document.addEventListener('DOMContentLoaded', () => {
    renderCheckoutPage();
});

function renderCheckoutPage() {
    const cartContainer = document.getElementById('checkout-cart-items');
    const summaryContainer = document.getElementById('checkout-items'); // Order summary items box
    const totalElement = document.getElementById('checkout-total');
    const shippingElement = document.getElementById('checkout-shipping');

    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Agar cart khali hai
    if (cart.length === 0) {
        if (cartContainer) cartContainer.innerHTML = '<p style="color:#777; text-align:center; padding: 20px;">Aapka cart khali hai!</p>';
        if (summaryContainer) summaryContainer.innerHTML = '<p style="color:#777;">Koi item nahi hai.</p>';
        if (totalElement) totalElement.innerText = '₹0';
        return;
    }

    if (cartContainer) cartContainer.innerHTML = '';
    if (summaryContainer) summaryContainer.innerHTML = '';

    let subtotal = 0;
    let shippingFee = 50; // Aap apne hisab se shipping charge set kar sakte hain

    cart.forEach((item, index) => {
        let numericPrice = typeof item.price === 'string' 
            ? parseInt(item.price.replace(/[^0-9]/g, ''), 10) 
            : item.price;

        let qty = item.quantity || 1;
        let itemTotal = numericPrice * qty;
        subtotal += itemTotal;

        // 1. Box 1: Your Cart Items (Badi Image aur Quantity Controls ke sath)
        if (cartContainer) {
            const itemDiv = document.createElement('div');
            itemDiv.style.display = 'flex';
            itemDiv.style.alignItems = 'center';
            itemDiv.style.justifyContent = 'space-between';
            itemDiv.style.marginBottom = '15px';
            itemDiv.style.borderBottom = '1px solid #eee';
            itemDiv.style.paddingBottom = '12px';

            itemDiv.innerHTML = `
                <div style="display: flex; align-items: center; gap: 15px;">
                    <img src="${item.mainImg || item.image}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;">
                    <div>
                        <h4 style="margin: 0 0 5px 0; font-size: 15px; font-weight: 600;">${item.name}</h4>
                        <span style="font-size: 13px; color: #666;">Size: ${item.selectedSize || 'M'}</span>
                        <div style="font-weight: bold; font-size: 14px; color: #111; margin-top: 5px;">₹${itemTotal}</div>
                    </div>
                </div>
                <div style="display: flex; align-items: flex-end; flex-direction: column; gap: 8px;">
                    <div style="display: flex; align-items: center; border: 1px solid #ccc; border-radius: 4px; overflow: hidden;">
                        <button onclick="updateCheckoutQty(${index}, -1)" style="padding: 4px 10px; background: #f5f5f5; border: none; cursor: pointer; font-weight: bold;">-</button>
                        <span style="padding: 0 10px; font-size: 14px; font-weight: 500;">${qty}</span>
                        <button onclick="updateCheckoutQty(${index}, 1)" style="padding: 4px 10px; background: #f5f5f5; border: none; cursor: pointer; font-weight: bold;">+</button>
                    </div>
                    <button onclick="deleteCheckoutItem(${index})" style="background: none; border: none; color: #e74c3c; cursor: pointer; font-size: 13px;">Remove 🗑️</button>
                </div>
            `;
            cartContainer.appendChild(itemDiv);
        }

        // 2. Box 3: Order Summary Live Update (Naam, Qty aur Price ke sath)
        if (summaryContainer) {
            const summaryRow = document.createElement('div');
            summaryRow.style.display = 'flex';
            summaryRow.style.justifyContent = 'space-between';
            summaryRow.style.marginBottom = '8px';
            summaryRow.style.fontSize = '14px';
            summaryRow.innerHTML = `
                <span>${item.name} (${item.selectedSize || 'M'}) x ${qty}</span>
                <span>₹${itemTotal}</span>
            `;
            summaryContainer.appendChild(summaryRow);
        }
    });

    // Total Calculation Update
    if (shippingElement) shippingElement.innerText = `₹${shippingFee}`;
    if (totalElement) totalElement.innerText = `₹${subtotal + shippingFee}`;
}

// Quantity Change Function (+ / -)
function updateCheckoutQty(index, change) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart[index]) {
        cart[index].quantity = (cart[index].quantity || 1) + change;
        if (cart[index].quantity < 1) {
            cart[index].quantity = 1;
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCheckoutPage(); // Page ko bina reload kiye live update karega
    }
}

// Item Delete Function
function deleteCheckoutItem(index) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCheckoutPage(); // Live update karega
}
// 'Buy Now' button click handler (Isko script.js ke sabse aakhir mein dalein)
// Multiple products ko cart mein add karne ka updated code
// Multiple products add karne ka final & secure code
// Final & Perfect Multiple Product Cart System
document.addEventListener('click', function(e) {
    let buyBtn = e.target.closest('button, a');
    
    // Check karein ki click "Buy Now" par hua hai
    if (buyBtn && (buyBtn.innerText.trim().toLowerCase().includes('buy now') || buyBtn.id === 'buy-now')) {
        e.preventDefault();
        
        // Product page se exact naam, price aur image nikalne ke selectors
        let nameEl = document.querySelector('.product-name, h1, h2, h3, .title');
        let priceEl = document.querySelector('.product-price, .price, .amount');
        let imgEl = document.querySelector('.product-img, .main-img, .gallery img, img');

        let productName = nameEl ? nameEl.innerText.trim() : "Stylish Shirt";
        let productPrice = priceEl ? priceEl.innerText.replace(/[^0-9]/g, '') : "2599"; // Sirf numbers rakhega
        let productImage = imgEl ? imgEl.src : "";
        
        // Agar size select karne ka option hai toh wo uthayein, nahi toh 'M'
        let sizeEl = document.querySelector('input[name="size"]:checked, .size-btn.active, .selected-size');
        let selectedSize = sizeEl ? sizeEl.innerText.trim() : 'M';

        let newProduct = {
            name: productName,
            price: productPrice,
            image: productImage,
            quantity: 1,
            selectedSize: selectedSize
        };

        // Purana cart localStorage se nikalein
        let cart = JSON.parse(localStorage.getItem('cart')) || [];

        // Check karein ki exact wahi product aur size pehle se cart mein hai ya nahi
        let existingIndex = cart.findIndex(item => item.name === newProduct.name && item.selectedSize === newProduct.selectedSize);

        if (existingIndex > -1) {
            // Agar bilkul same product hai, tabhi quantity badhegi
            cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1;
        } else {
            // Agar doosra naya product hai, toh cart mein ek naya item jud jayega
            cart.push(newProduct);
        }

        // Save karke checkout par bhejein
        localStorage.setItem('cart', JSON.stringify(cart));
        window.location.href = 'checkout.html';
    }
});
// 1. Sabhi Products ki Details Data (Dynamic)
const productsData = {
  1: {
    title: "Elegant Evening Gown",
    price: "₹3,499",
    specs: {
      "Material": "Silk Blend",
      "Pattern": "Solid / Pleated",
      "Occasion": "Party / Festive",
      "Fit": "A-Line",
      "Neckline": "Round Neck",
      "Closure": "Pull On",
      "Sleeve Style": "Three Fourth Sleeves",
      "Care Instructions": "Dry Clean Only",
      "Pack Contains": "1 Gown"
    }
  },
  2: {
    title: "Printed Kurta Set",
    price: "₹1,207",
    specs: {
      "Material": "Cotton Blend",
      "Pattern": "Floral",
      "Occasion": "Casual",
      "Fit": "Regular Fit",
      "Neckline": "Mandarin Neck",
      "Closure": "Pull On",
      "Sleeve Style": "Three Fourth Sleeves",
      "Care Instructions": "Hand Wash",
      "Pack Contains": "1 Kurta, 1 Palazzo"
    }
  }
};

// 2. URL se Product ID read karke details dikhana
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id') || '1'; // Default ID 1

const currentProduct = productsData[productId];

if (currentProduct) {
  // Information Grid mein Data Dynamically Render karna
  const infoGrid = document.getElementById('info-grid');
  if (infoGrid && currentProduct.specs) {
    infoGrid.innerHTML = '';
    for (const [key, value] of Object.entries(currentProduct.specs)) {
      const item = document.createElement('div');
      item.className = 'info-item';
      item.innerHTML = `
        <span class="info-key">${key}</span>
        <span class="info-val">${value}</span>
      `;
      infoGrid.appendChild(item);
    }
  }
}
function changeImage(element) {
    // Main image ka src change hoga
    document.getElementById('product-main-img').src = element.src;
    
    // Active class border switch karne ke liye
    document.querySelectorAll('.thumb-img').forEach(img => img.classList.remove('active'));
    element.classList.add('active');
} 
// Thumbnail photo click karne par main image change karne ke liye
function changeImage(element) {
    document.getElementById('product-main-img').src = element.src;
    
    document.querySelectorAll('.thumb-img').forEach(img => {
        img.classList.remove('active');
    });
    element.classList.add('active');
}

// Size (S, M, L, XL, XXL) select karne ke liye
function selectSize(element) {
    document.querySelectorAll('.size-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    element.classList.add('selected');
}
// Apne Shop/Product list wale function me aisa logic add karein:
function viewProductDetails(imageSrc, title, price) {
    // Current clicked product data save karein
    localStorage.setItem('selectedImage', imageSrc);
    localStorage.setItem('selectedTitle', title);
    localStorage.setItem('selectedPrice', price);

    // details page par bhejein
    window.location.href = 'details.html';
}
// details.html open hone par saved image aur title dikhane ke liye
window.addEventListener('DOMContentLoaded', () => {
    const savedImage = localStorage.getItem('selectedImage');
    const savedTitle = localStorage.getItem('selectedTitle');
    const savedPrice = localStorage.getItem('selectedPrice');

    if (savedImage) {
        const mainImg = document.getElementById('product-main-img');
        if (mainImg) mainImg.src = savedImage;

        const thumb1 = document.getElementById('thumb1');
        if (thumb1) thumb1.src = savedImage;
    }

    if (savedTitle && document.getElementById('product-title')) {
        document.getElementById('product-title').innerText = savedTitle;
    }

    if (savedPrice && document.getElementById('product-price')) {
        document.getElementById('product-price').innerText = savedPrice;
    }
});
// 1. Jab kisi product par click ho (Parameters sequence matches your HTML)
function viewProductDetails(id, title, price, imageSrc) {
    // Agar imageSrc pass hua hai toh use karein, warna ID ko imageSrc ki tarah use karein
    let finalImg = imageSrc ? imageSrc : id;
    
    // Check karein agar extension (.jpeg / .png) missing hai
    if (!finalImg.includes('.')) {
        finalImg = finalImg + '.jpeg';
    }

    // LocalStorage mein actual selected product details save karein
    localStorage.setItem('selectedImage', finalImg);
    localStorage.setItem('selectedTitle', title);
    localStorage.setItem('selectedPrice', typeof price === 'number' ? '₹' + price : price);

    // Details page par navigate karein
    window.location.href = 'details.html';
}

// 2. Also ensure openProductDetails also works if used anywhere
function openProductDetails(imageSrc, title, price) {
    viewProductDetails(imageSrc, title, price, imageSrc);
}

// 3. Page load hone par details.html mein dynamic values inject karna
// 3. Page load hone par details.html mein dynamic values inject karna
window.addEventListener('DOMContentLoaded', () => {
    const savedImage = localStorage.getItem('selectedImage');
    const savedTitle = localStorage.getItem('selectedTitle');
    const savedPrice = localStorage.getItem('selectedPrice');

    if (savedImage) {
        // Main Product Image update karein
        const mainImg = document.getElementById('product-main-img');
        if (mainImg) mainImg.src = savedImage;

        // Teeno thumbnails ko selected photo se sync update karein
        const thumb1 = document.getElementById('thumb1');
        const thumb2 = document.getElementById('thumb2');
        const thumb3 = document.getElementById('thumb3');

        if (thumb1) thumb1.src = savedImage;
        if (thumb2) thumb2.src = savedImage;
        if (thumb3) thumb3.src = savedImage;
    }

    if (savedTitle && document.getElementById('product-title')) {
        document.getElementById('product-title').innerText = savedTitle;
    }

    if (savedPrice && document.getElementById('product-price')) {
        document.getElementById('product-price').innerText = savedPrice;
    }
});
function viewProductDetails(id, title, price, imageSrc, thumb2Src, thumb3Src) {
    let finalImg = imageSrc ? imageSrc : id;
    if (!finalImg.includes('.')) finalImg += '.jpeg';

    localStorage.setItem('selectedImage', finalImg);
    localStorage.setItem('selectedTitle', title);
    localStorage.setItem('selectedPrice', typeof price === 'number' ? '₹' + price : price);
    
    // Extra thumbnails
    localStorage.setItem('selectedThumb2', thumb2Src || finalImg);
    localStorage.setItem('selectedThumb3', thumb3Src || finalImg);

    window.location.href = 'details.html';
}
let selectedProductSize = '';

// Size Selection Function
function selectSize(buttonElement) {

    document.querySelectorAll('.size-btn').forEach(btn => {
        btn.classList.remove('selected');
        btn.style.backgroundColor = '';
        btn.style.color = '';
    });

    buttonElement.classList.add('selected');

    buttonElement.style.backgroundColor = '#000';
    buttonElement.style.color = '#fff';

    selectedProductSize = buttonElement.innerText.trim();
}
/// Add to Cart Function
function addToCart(buttonElement) {
    if (!selectedProductSize) {
        alert('Kripya pehle size select karein (S, M, L, XL, XXL)!');
        return;
    }

    // Us product card ya container ko target karein jis par click hua hai
    const productCard = buttonElement.closest('.product-card') || buttonElement.parentElement;

    // Direct usi card se title, price aur image ki sahi value uthayein
    const title = productCard.querySelector('h3, .product-title, h4')?.innerText || 'Product';
    const price = productCard.querySelector('.price, span')?.innerText || '₹0';
    const image = productCard.querySelector('img')?.src || '';

    const cartItem = {
        title: title,
        price: price,
        image: image,
        size: selectedProductSize
    };

    // Pehle localStorage se purana cart array nikalein
    let cart = JSON.parse(localStorage.getItem('userCart')) || [];

    // Naya product isme add karein
    cart.push(cartItem);

    // Phir wapas localStorage mein save karein
    localStorage.setItem('userCart', JSON.stringify(cart));
    
    updateCartCounter();
    console.log("Added Item:", cartItem);
    alert(`${title} (${selectedProductSize}) Cart mein add ho gaya hai!`);
}


// Cart Counter Update Function
function updateCartCounter() {
    let cart = JSON.parse(localStorage.getItem('userCart')) || [];
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        cartCountElement.innerText = cart.length;
    }
}

window.addEventListener('DOMContentLoaded', () => {
    updateCartCounter();
});

// Exact button ID ke sath multiple product cart system
// Add to Buy - Save Cart Item in MongoDB
document.addEventListener('click', async function(e) {

    const buyBtn = e.target.closest('#add-to-buy-btn');

    if (!buyBtn) return;

    e.preventDefault();

    // Check login
    const token = localStorage.getItem('token');

    if (!token) {
        alert('Please login first!');
        window.location.href = 'login.html';
        return;
    }

    // Get product details
    const productName =
        document.getElementById('product-title')?.innerText || 'Product';

    const priceText =
        document.getElementById('product-price')?.innerText || '0';

    const price =
        parseInt(priceText.replace(/[^0-9]/g, ''), 10);

    const image =
        document.getElementById('product-main-img')?.src || '';

    // Get selected size
    const selectedButton =
        document.querySelector('.size-btn.selected');

    if (!selectedButton) {
        alert('Please select a size first!');
        return;
    }

    const size = selectedButton.innerText.trim();

    try {

        const response = await fetch(
            'http://localhost:5000/api/cart/add',
            {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },

                body: JSON.stringify({
                    productName: productName,
                    price: price,
                    size: size,
                    quantity: 1
                })
            }
        );

        const data = await response.json();

        if (response.ok) {

            alert('Product added to cart successfully!');

            window.location.href = 'cart.html';

        } else {

            alert(data.message || 'Could not add product to cart.');

        }

    } catch (error) {

        console.error('Cart Error:', error);

        alert('Server se connect nahi ho pa raha hai!');

    }

});

// Checkout form submit hone par database mein order save karna
document.addEventListener('submit', async function(e) {
    if (e.target && e.target.id === 'checkout-form') {
        e.preventDefault();

        const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
        
        if (cartItems.length === 0) {
            alert('Aapka cart khali hai!');
            return;
        }

        const orderData = {
            fullName: document.querySelector('#fullName')?.value || "Bibi Shaikh",
            phone: document.querySelector('#phone')?.value || "9876543210",
            address: document.querySelector('#address')?.value || "Mumbai",
            city: document.querySelector('#city')?.value || "Mumbai",
            items: cartItems
        };

        try {
            const response = await fetch('http://localhost:3000/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            const result = await response.json();
            if (result.success) {
                alert('🎉 Order Successfully Placed & Saved in Database!');
                localStorage.removeItem('cart');
                window.location.href = 'conformation.html';
            } else {
                alert('❌ Order save karne mein error aayi.');
            }
        } catch (err) {
            console.error('Connection Error:', err);
            alert('Server se connect nahi ho pa raha hai!');
        }
    }
});

const registerForm = document.getElementById('registerForm');

if (registerForm) {

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const fullname = document.getElementById('fullname').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullname, email, password })
        });

        const data = await response.json();
        console.log(data);
    });

}

// ===== FINAL PRODUCT DATA FIX =====
function saveCorrectProduct(product) {
    localStorage.setItem('selectedProduct', JSON.stringify(product));

    // Old keys bhi same product ke saath sync rahenge
    localStorage.setItem('selectedImage', product.image);
    localStorage.setItem('selectedTitle', product.name);
    localStorage.setItem('selectedPrice', '₹' + product.price);
}


// Flexible Product Details Function
function viewProductDetails(a, b, c, d, e, f) {
    let name = '';
    let price = '';
    let image = '';
    let id = '';

    const isImage = (value) => {
        if (!value || typeof value !== 'string') return false;
        return /\.(jpg|jpeg|png|webp|avif|gif)(\?.*)?$/i.test(value)
            || value.includes('/')
            || value.startsWith('http');
    }; // <--- Yeh closing brace yahan aayega (isImage ke liye)

    const isPrice = (value) => {
        if (typeof value === 'number') return true;
        if (typeof value === 'string') {
            return /₹|\d/.test(value);
        }
        return false;
    };

    // Format: viewProductDetails(id, name, price, image)
    if (d && isImage(d)) {
        id = a;
        name = b;
        price = c;
        image = d;
    }
    // Format: viewProductDetails(image, name, price)
    else if (isImage(a) && !isPrice(b)) {
        image = a;
        name = b;
        price = c;
    }
    // Format: viewProductDetails(name, price, image)
    else if (!isPrice(a) && isPrice(b) && isImage(c)) {
        name = a;
        price = b;
        image = c;
    }
    // Fallback
    else {
        id = a;
        name = b;
        price = c;
        image = d || a;
    }

    // Price clean
    let numericPrice = parseInt(
        String(price).replace(/[^0-9]/g, ''),
        10
    );

    if (isNaN(numericPrice)) {
        numericPrice = 0;
    }

    const product = {
        id: id,
        name: String(name || 'Product'),
        price: numericPrice,
        image: image,
        mainImg: image,
        images: [image]
    };

    saveCorrectProduct(product);

    window.location.href = 'details.html';
} // <--- Yeh closing brace yahan aayega (viewProductDetails function ke liye)
function loadAdminProducts(products) {
    const tableBody = document.getElementById('product-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = ''; // Purana data clear karein

    products.forEach(product => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td><img src="${product.image || product.img || 'default.jpg'}" alt="" width="40" style="border-radius: 4px;"></td>
            <td>${product.name || product.title}</td>
            <td>${product.category || 'General'}</td>
            <td>₹${product.price}</td>
            <td>${product.stock || 'In Stock'}</td>
            <td>
                <button onclick="deleteProduct('${product._id || product.id}')" class="btn-delete">Delete</button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}
// Page load hone par admin products ko table mein render karne ke liye
function loadDashboardProducts() {
    const tableBody = document.getElementById('product-table-body');
    if (!tableBody) return;

    // Order place hone wale function ke andar yeh code add karein:
let products = JSON.parse(localStorage.getItem('adminProducts')) || [];
products.push({
    image: orderedProduct.image,
    name: orderedProduct.name,
    category: orderedProduct.category || 'General',
    price: orderedProduct.price,
    stock: '10'
});
localStorage.setItem('adminProducts', JSON.stringify(products));

    tableBody.innerHTML = ''; // Table ko pehle khali karein

    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><img src="${product.image || 'cot.jpeg'}" class="thumb-img" alt=""></td>
            <td><strong>${product.name}</strong></td>
            <td>${product.category || 'General'}</td>
            <td>₹${product.price}</td>
            <td>${product.stock || '10'}</td>
            <td class="action-btns">
                <i class="fa-regular fa-pen-to-square"></i>
                <i class="fa-regular fa-trash-can"></i>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Page load hote hi function chal jayega
window.addEventListener('DOMContentLoaded', loadDashboardProducts);
function loadDashboardUsers() {
    const userTableBody = document.getElementById('user-table-body');
    if (!userTableBody) return;

    // LocalStorage ya default users list
    // Register hone wale function ke andar yeh code add karein:
let users = JSON.parse(localStorage.getItem('adminUsers')) || [];
users.push({
    name: userName, // yahan aapke variable ka naam aayega jo user ka naam leta hai
    email: userEmail,
    phone: userPhone || 'N/A',
    joined: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
});
localStorage.setItem('adminUsers', JSON.stringify(users));

    userTableBody.innerHTML = ''; // Table ko khali karein

    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.phone}</td>
            <td>${user.joined}</td>
        `;
        userTableBody.appendChild(row);
    });
}

// Page load hone par users load ho jayenge
window.addEventListener('DOMContentLoaded', () => {
    loadDashboardProducts();
    loadDashboardUsers();
});
const navLinks = document.querySelectorAll('.user-sidebar .user-nav:not(#logoutBtn)');
const sections = document.querySelectorAll('.profile-tab-content');

navLinks.forEach((link, index) => {
    link.addEventListener('click', (e) => {
        e.preventDefault();

        // Sabhi links se active class hatayein aur clicked par lagayein
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        // Sabhi sections ko hide karein aur sirf selected wala show karein
        sections.forEach(sec => sec.style.display = 'none');
        if (sections[index]) {
            sections[index].style.display = 'block';
        }
    });
});
document.querySelectorAll('.user-sidebar .user-nav').forEach(link => {
    // Agar link par logoutBtn ki ID hai, toh isse tab switching me shamil mat karo
    if (link.id === 'logoutBtn') return;

    link.addEventListener('click', function(e) {
        e.preventDefault();

        // 1. Sidebar active class manage karein (logout ko chhod kar)
        document.querySelectorAll('.user-sidebar .user-nav').forEach(nav => {
            if (nav.id !== 'logoutBtn') nav.classList.remove('active');
        });
        this.classList.add('active');

        // 2. Sabhi profile sections ko hide karein
        document.querySelectorAll('.profile-tab-content').forEach(section => {
            section.style.display = 'none';
        });

        // 3. Sirf selected target section ko show karein
        const targetId = this.getAttribute('data-target');
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            targetSection.style.display = 'block';
        }
    });
});
async function loadUserOrders() {
    const token = localStorage.getItem('token');
    const ordersContainer = document.getElementById('orders-container');
    if (!ordersContainer) return;

    try {
        // Backend API se orders fetch karne ki koshish karein
        const response = await fetch('http://localhost:5000/api/orders', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });

        if (response.ok) {
            const data = await response.json();
            renderOrders(data.orders || data);
        } else {
            // Agar API na ho, toh localStorage se load karein (Fallback)
            const localOrders = JSON.parse(localStorage.getItem('userOrders')) || [
                { orderId: 'SF12567', date: '25 May 2025', total: '2,798', status: 'Confirmed' },
                { orderId: 'SF12500', date: '12 May 2025', total: '1,599', status: 'Delivered' }
            ];
            renderOrders(localOrders);
        }
    } catch (error) {
        console.log('Error fetching orders:', error);
        // Fallback data agar server connect na ho
        const localOrders = JSON.parse(localStorage.getItem('userOrders')) || [
            { orderId: 'SF12567', date: '25 May 2025', total: '2,798', status: 'Confirmed' }
        ];
        renderOrders(localOrders);
    }
}

function renderOrders(orders) {
    const ordersContainer = document.getElementById('orders-container');
    if (!ordersContainer) return;

    if (orders.length === 0) {
        ordersContainer.innerHTML = '<p>No orders found.</p>';
        return;
    }

    ordersContainer.innerHTML = '';
    orders.forEach(order => {
        const statusClass = (order.status || 'Confirmed').toLowerCase();
        const card = document.createElement('div');
        card.className = 'order-card';
        card.innerHTML = `
            <div class="order-details-info">
                <p><strong>Order ID: #${order.orderId || order._id || 'SF12500'}</strong></p>
                <p class="order-sub">Date: ${order.date || '25 May 2025'} &nbsp;|&nbsp; Total: ₹${order.total || '0'}</p>
                <p class="order-sub">Status: <span class="badge ${statusClass}">${order.status || 'Confirmed'}</span></p>
            </div>
            <button class="btn-outline">View Details</button>
        `;
        ordersContainer.appendChild(card);
    });
}

// Page load hone par orders bhi load ho jayenge
loadUserOrders();
// Checkout page par order place hone par order ko localStorage me save karna
const placeOrderBtn = document.querySelector('.checkout-container form a[href*="canformation"], .checkout-container form a[href*="confirmation"], .btn-primary-full');

if (placeOrderBtn) {
    placeOrderBtn.addEventListener('click', function(e) {
        // Total amount nikal lete hain checkout page se
        const totalElement = document.getElementById('checkout-total');
        const totalAmount = totalElement ? totalElement.textContent.replace('₹', '').trim() : '2,798';
        
        // Ek naya order object banate hain
        const newOrder = {
            orderId: 'SF' + Math.floor(10000 + Math.random() * 90000), // Random Order ID jaise #SF84920
            date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
            total: totalAmount,
            status: 'Confirmed'
        };

        // Purane orders fetch karke naya order usme add karte hain
        let existingOrders = JSON.parse(localStorage.getItem('userOrders')) || [
            { orderId: 'SF12567', date: '25 May 2025', total: '2,798', status: 'Confirmed' },
            { orderId: 'SF12500', date: '12 May 2025', total: '1,599', status: 'Delivered' }
        ];

        existingOrders.unshift(newOrder); // Sabse upar naya order jud jayega
        localStorage.setItem('userOrders', JSON.stringify(existingOrders));
    });
}
// Addresses Load aur Save karne ka function
document.addEventListener('DOMContentLoaded', function() {
    loadAddresses();

    const addressForm = document.getElementById('addressForm');
    if (addressForm) {
        addressForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const street = document.getElementById('streetAddress').value.trim();
            const city = document.getElementById('city').value.trim();
            const pincode = document.getElementById('pincode').value.trim();

            const newAddress = {
                id: Date.now(),
                street: street,
                city: city,
                pincode: pincode
            };

            let savedAddresses = JSON.parse(localStorage.getItem('userAddresses')) || [];
            savedAddresses.push(newAddress);
            localStorage.setItem('userAddresses', JSON.stringify(savedAddresses));

            // Form clear karein aur list update karein
            addressForm.reset();
            loadAddresses();
        });
    }
});

function loadAddresses() {
    const container = document.getElementById('addresses-container');
    if (!container) return;

    let savedAddresses = JSON.parse(localStorage.getItem('userAddresses')) || [];

    if (savedAddresses.length === 0) {
        container.innerHTML = '<p style="color: #666; font-size: 14px;">No saved addresses found.</p>';
        return;
    }

    container.innerHTML = '<h4>Saved Addresses</h4>';
    savedAddresses.forEach((addr, index) => {
        const card = document.createElement('div');
        card.style.cssText = "background: #fff; border: 1px solid #eee; padding: 12px; border-radius: 6px; margin-top: 10px; display: flex; justify-content: space-between; align-items: center;";
        card.innerHTML = `
            <div>
                <p style="margin: 0; font-weight: 500;">${addr.street}</p>
                <p style="margin: 3px 0 0 0; font-size: 13px; color: #666;">${addr.city} - ${addr.pincode}</p>
            </div>
            <button onclick="deleteAddress(${addr.id})" style="background: #ff4d4d; color: #fff; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 12px;">Delete</button>
        `;
        container.appendChild(card);
    });
}

function deleteAddress(id) {
    let savedAddresses = JSON.parse(localStorage.getItem('userAddresses')) || [];
    savedAddresses = savedAddresses.filter(addr => addr.id !== id);
    localStorage.setItem('userAddresses', JSON.stringify(savedAddresses));
    loadAddresses();
}
