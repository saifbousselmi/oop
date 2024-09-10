document.addEventListener('DOMContentLoaded', () => {
    // Select HTML elements
    const listProductHTML = document.querySelector('.listProduct');
    const listCartHTML = document.querySelector('.listCart');
    const iconCart = document.querySelector('.icon-cart');
    const iconCartSpan = document.querySelector('.icon-cart span');
    const body = document.querySelector('body');
    const closeCart = document.querySelector('.close');
    const totalPriceElement = document.querySelector('#total'); // Selector for total price
    let products = [];
    let cart = [];

    // Toggle cart visibility
    iconCart.addEventListener('click', () => {
        body.classList.add('showCart');
    });

    closeCart.addEventListener('click', () => {
        body.classList.remove('showCart');
    });

    // Add products to the HTML
    const addDataToHTML = () => {
        listProductHTML.innerHTML = '';

        if (products.length > 0) {
            products.forEach(product => {
                let newProduct = document.createElement('div');
                newProduct.dataset.id = product.id;
                newProduct.classList.add('item');
                newProduct.innerHTML = `
                    <img src="${product.image}" alt="${product.name}">
                    <h2>${product.name}</h2>
                    <div class="price">$${product.price.toFixed(2)}</div>
                    <button class="addCart">Add To Cart</button>
                `;
                listProductHTML.appendChild(newProduct);
            });
        }
    };

    // Handle click events on products
    listProductHTML.addEventListener('click', (event) => {
        let positionClick = event.target;
        if (positionClick.classList.contains('addCart')) {
            let id_product = positionClick.parentElement.dataset.id;
            addToCart(id_product);
        }
    });

    // Add product to cart
    const addToCart = (product_id) => {
        let positionThisProductInCart = cart.findIndex((value) => value.product_id == product_id);
        if (positionThisProductInCart < 0) {
            cart.push({
                product_id: product_id,
                quantity: 1,
            });
        } else {
            cart[positionThisProductInCart].quantity += 1;
        }
        updateCartUI();
        updateTotalPrice(); // Update total price after updating cart UI
        saveCartToMemory();
    };

    // Save cart to local storage
    const saveCartToMemory = () => {
        localStorage.setItem('cart', JSON.stringify(cart));
    };

    // Update cart UI
    const updateCartUI = () => {
        listCartHTML.innerHTML = '';
        let totalQuantity = 0;

        if (cart.length > 0) {
            cart.forEach(item => {
                totalQuantity += item.quantity;
                let product = products.find(p => p.id == item.product_id);
                if (product) {
                    let newItem = document.createElement('div');
                    newItem.classList.add('item');
                    newItem.dataset.id = item.product_id;
                    newItem.innerHTML = `
                        <div class="icons">
                            <span class="heart-icon" data-favorited="false">♡</span>
                            <div class="image">
                                <img src="${product.image}" alt="${product.name}">
                            </div>
                            <span class="trash-icon">🗑️</span>
                        </div>
                        <div class="name">${product.name}</div>
                        <div class="unit-price">$${product.price.toFixed(2)}</div>
                        <div class="quantity">
                            <span class="minus">-</span>
                            <span class="quantity-value">${item.quantity}</span>
                            <span class="plus">+</span>
                        </div>
                    `;
                    listCartHTML.appendChild(newItem);
                }
            });
        }

        // Ensure iconCartSpan exists before setting its innerText
        if (iconCartSpan) {
            iconCartSpan.innerText = totalQuantity;
        } else {
            console.error('iconCartSpan element not found');
        }
    };

    // Handle click events in the cart
    listCartHTML.addEventListener('click', (event) => {
        let positionClick = event.target;

        if (positionClick.classList.contains('minus') || positionClick.classList.contains('plus')) {
            let product_id = positionClick.closest('.item').dataset.id;
            let type = positionClick.classList.contains('plus') ? 'plus' : 'minus';
            changeQuantityInCart(product_id, type);
        }

        if (positionClick.classList.contains('trash-icon')) {
            let product_id = positionClick.closest('.item').dataset.id;
            removeFromCart(product_id);
        }

        if (positionClick.classList.contains('heart-icon')) {
            toggleHeartIcon(positionClick);
        }
    });

    // Toggle heart icon color
    const toggleHeartIcon = (icon) => {
        const isFavorited = icon.getAttribute('data-favorited') === 'true';
        if (isFavorited) {
            icon.style.color = 'white';
            icon.setAttribute('data-favorited', 'false');
        } else {
            icon.style.color = 'red';
            icon.setAttribute('data-favorited', 'true');
        }
    };

    // Change product quantity in cart
    const changeQuantityInCart = (product_id, type) => {
        let positionItemInCart = cart.findIndex((value) => value.product_id == product_id);
        if (positionItemInCart >= 0) {
            switch (type) {
                case 'plus':
                    cart[positionItemInCart].quantity += 1;
                    break;

                case 'minus':
                    let changeQuantity = cart[positionItemInCart].quantity - 1;
                    if (changeQuantity > 0) {
                        cart[positionItemInCart].quantity = changeQuantity;
                    } else {
                        cart.splice(positionItemInCart, 1);
                    }
                    break;
            }
        }
        updateCartUI();
        updateTotalPrice(); // Update total price after changing quantity
        saveCartToMemory();
    };

    // Remove product from cart
    const removeFromCart = (product_id) => {
        cart = cart.filter(item => item.product_id != product_id);
        updateCartUI();
        updateTotalPrice(); // Update total price after removing item
        saveCartToMemory();
    };

    // Update total price
    const updateTotalPrice = () => {
        let totalPrice = 0;

        if (cart.length > 0) {
            cart.forEach(item => {
                let product = products.find(p => p.id == item.product_id);
                if (product) {
                    totalPrice += product.price * item.quantity;
                }
            });
        }

        if (totalPriceElement) {
            totalPriceElement.innerHTML = `$${totalPrice.toFixed(2)}`; // Update total price element
        } else {
            console.error('totalPriceElement not found');
        }
    };

    // Initialize the app
    const initApp = () => {
        fetch('products.json')
            .then(response => response.json())
            .then(data => {
                products = data;
                addDataToHTML();

                if (localStorage.getItem('cart')) {
                    cart = JSON.parse(localStorage.getItem('cart'));
                    updateCartUI();
                    updateTotalPrice(); // Ensure total price is correct on init
                }
            })
            .catch(error => console.error('Error fetching products:', error));
    };

    // Start the app
    initApp();
});
