document.addEventListener('DOMContentLoaded', () => {
    // --- Toast Notification System ---
    const toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);

    window.showToast = function(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
        toast.innerHTML = `<i class="fas ${icon}"></i> <span>${message}</span>`;
        
        toastContainer.appendChild(toast);
        
        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    };

    // --- Navbar Scroll Effect ---
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // --- Theme Toggle ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = themeToggleBtn.querySelector('i');
    const darkThemeMq = window.matchMedia('(prefers-color-scheme: dark)');

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        if (theme === 'dark') {
            themeIcon.className = 'fas fa-moon';
        } else {
            themeIcon.className = 'fas fa-sun';
        }
    }

    function initTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            applyTheme(savedTheme);
        } else {
            const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
            applyTheme(prefersLight ? 'light' : 'dark');
        }
    }

    initTheme();

    // Listen to system changes
    darkThemeMq.addEventListener('change', e => {
        if (!localStorage.getItem('theme')) {
            applyTheme(e.matches ? 'dark' : 'light');
        }
    });

    themeToggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    });

    // --- Modals & Overlays Logic ---
    const loginIcon = document.getElementById('login-icon');
    const loginModal = document.getElementById('login-modal');
    const closeLoginBtn = document.getElementById('close-login');

    const searchIcon = document.getElementById('search-icon');
    const searchModal = document.getElementById('search-modal');
    const closeSearchBtn = document.getElementById('close-search');

    function openModal(modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }

    function closeModal(modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    function updateAuthUI() {
        if (!loginIcon) return;
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            loginIcon.innerHTML = `<i class="fas fa-user-check"></i> <span style="font-size: 0.8rem; margin-left: 0.3rem;" class="nav-username">${user.name}</span>`;
        } else {
            loginIcon.innerHTML = `<i class="far fa-user"></i>`;
        }
    }
    
    // Initial UI update
    updateAuthUI();

    if (loginIcon) {
        loginIcon.addEventListener('click', (e) => { 
            e.preventDefault(); 
            const user = JSON.parse(localStorage.getItem('user'));
            if (user) {
                if (confirm(`Hola ${user.name}, ¿quieres cerrar sesión?`)) {
                    localStorage.removeItem('user');
                    updateAuthUI();
                    showToast('Sesión cerrada correctamente.', 'success');
                }
            } else {
                openModal(loginModal); 
            }
        });
    }
    
    if (closeLoginBtn) closeLoginBtn.addEventListener('click', () => closeModal(loginModal));
    
    if (searchIcon) searchIcon.addEventListener('click', (e) => { e.preventDefault(); openModal(searchModal); });
    if (closeSearchBtn) closeSearchBtn.addEventListener('click', () => closeModal(searchModal));

    // Close modals when clicking outside content
    window.addEventListener('click', (e) => {
        if (e.target === loginModal) closeModal(loginModal);
        if (e.target === searchModal) closeModal(searchModal);
    });

    // --- Shopping Cart Logic ---
    const allProducts = [
        { id: '1', name: 'Café en Grano Orgánico', price: 19.90, image: 'bolsa_cafe_engrano.png' },
        { id: '2', name: 'Café Molido Orgánico', price: 19.90, image: "bolsa_cafe'_mollido.png" },
        { id: '3', name: 'Set Tazas Leon Coffee', price: 25.00, image: 'tazas_leon.png' },
        { id: '4', name: 'Moka Leon Coffee', price: 35.00, image: 'moka_leon.png' }
    ];

    const cartIcon = document.getElementById('cart-icon');
    const cartSidebar = document.getElementById('cart-sidebar');
    const closeCartBtn = document.getElementById('close-cart');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartCountBadge = document.querySelector('.cart-count');
    const cartTotalPrice = document.getElementById('cart-total-price');
    const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Purge cart items that no longer exist in our product catalog
    cart = cart.filter(cartItem => allProducts.some(p => p.id === cartItem.id));
    localStorage.setItem('cart', JSON.stringify(cart)); // Update storage immediately

    function openCart() {
        cartSidebar.classList.add('active');
        cartOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        const tc = document.querySelector('.toast-container');
        if (tc) tc.classList.add('left-side');
    }

    function closeCart() {
        cartSidebar.classList.remove('active');
        cartOverlay.classList.remove('active');
        document.body.style.overflow = '';
        const tc = document.querySelector('.toast-container');
        if (tc) tc.classList.remove('left-side');
    }

    if (cartIcon) cartIcon.addEventListener('click', (e) => { e.preventDefault(); openCart(); });
    if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

    function updateCartUI() {
        // Update badge
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (cartCountBadge) cartCountBadge.textContent = totalItems;

        // Render items
        if (!cartItemsContainer || !cartTotalPrice) return;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<div class="empty-cart-msg">Tu carrito está vacío</div>';
            cartTotalPrice.textContent = '€0.00';
        } else {
            let cartHTML = '';
            let total = 0;

            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                total += itemTotal;
                cartHTML += `
                    <div class="cart-item">
                        <img src="${item.image}" alt="${item.name}">
                        <div class="item-details">
                            <h4>${item.name}</h4>
                            <div class="item-price">€${item.price.toFixed(2)}</div>
                            <div class="item-controls">
                                <button class="qty-btn minus" data-id="${item.id}">-</button>
                                <span>${item.quantity}</span>
                                <button class="qty-btn plus" data-id="${item.id}">+</button>
                            </div>
                        </div>
                        <button class="remove-item" data-id="${item.id}"><i class="fas fa-trash"></i></button>
                    </div>
                `;
            });

            cartItemsContainer.innerHTML = cartHTML;
            cartTotalPrice.textContent = `€${total.toFixed(2)}`;

            // Attach event listeners to newly rendered cart buttons
            document.querySelectorAll('.qty-btn.plus').forEach(btn => {
                btn.addEventListener('click', () => changeQuantity(btn.dataset.id, 1));
            });
            document.querySelectorAll('.qty-btn.minus').forEach(btn => {
                btn.addEventListener('click', () => changeQuantity(btn.dataset.id, -1));
            });
            document.querySelectorAll('.remove-item').forEach(btn => {
                btn.addEventListener('click', () => removeFromCart(btn.dataset.id));
            });
        }

        // Save to local storage
        localStorage.setItem('cart', JSON.stringify(cart));
        
        renderSuggestions();
    }

    function renderSuggestions() {
        const suggestionsContainer = document.getElementById('cart-suggestions');
        if (!suggestionsContainer) return;

        const suggestedProducts = allProducts.filter(p => !cart.some(item => item.id === p.id));
        const topSuggestions = suggestedProducts.slice(0, 3);

        if (topSuggestions.length === 0) {
            suggestionsContainer.innerHTML = '';
            return;
        }

        let html = '<h4 class="suggestions-title">Quizás te interese...</h4><div class="suggestion-list">';
        topSuggestions.forEach(p => {
            html += `
                <div class="suggestion-item">
                    <img src="${p.image}" alt="${p.name}">
                    <div class="suggestion-details">
                        <h5>${p.name}</h5>
                        <span>€${p.price.toFixed(2)}</span>
                    </div>
                    <button class="btn btn-primary btn-sm suggestion-add" data-id="${p.id}" aria-label="Añadir sugerencia al carrito">
                        <i class="fas fa-plus"></i></button>
                </div>
            `;
        });
        html += '</div>';
        
        suggestionsContainer.innerHTML = html;

        suggestionsContainer.querySelectorAll('.suggestion-add').forEach(btn => {
            btn.addEventListener('click', () => {
                const prod = allProducts.find(p => p.id === btn.dataset.id);
                if (prod) addToCart(prod);
            });
        });
    }

    function addToCart(product, silent = false) {
        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        updateCartUI();
        
        if (!silent) {
            showToast(`"${product.name}" añadido al carrito`, 'success');
        }
    }

    function changeQuantity(id, amount) {
        const item = cart.find(i => i.id === id);
        if (item) {
            item.quantity += amount;
            if (item.quantity <= 0) {
                removeFromCart(id);
            } else {
                updateCartUI();
            }
        }
    }

    function removeFromCart(id) {
        cart = cart.filter(item => item.id !== id);
        updateCartUI();
    }

    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const card = e.target.closest('.product-card');
            const product = {
                id: card.dataset.id,
                name: card.querySelector('.product-title').textContent,
                price: parseFloat(card.querySelector('.product-price').textContent.replace('€', '')),
                image: card.querySelector('.product-img').src
            };
            addToCart(product, true); // silent true so we don't show toast + open cart
            openCart();
        });
    });

    // Initial render
    updateCartUI();

    // --- Newsletter Form ---
    const newsletterForm = document.getElementById('newsletter-form');
    const newsletterMessage = document.getElementById('newsletter-message');

    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('newsletter-email').value;
            if (email) {
                // Simulate API call
                newsletterForm.style.display = 'none';
                newsletterMessage.classList.remove('hidden');
                setTimeout(() => {
                    newsletterForm.reset();
                    newsletterForm.style.display = 'flex';
                    newsletterMessage.classList.add('hidden');
                }, 3000);
            }
        });
    }

    // --- Search Logic ---
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const resultsContainer = document.getElementById('search-results');
    
    // We need product links to route correctly based on what page we are on
    const isHomePage = window.location.pathname.endsWith('home.html') || window.location.pathname.endsWith('/') || !window.location.pathname.includes('.html');
    
    function renderSearchResults(query) {
        if (!query.trim()) {
            resultsContainer.innerHTML = '';
            return;
        }
        
        const lowerQuery = query.toLowerCase();
        
        // Find matching products
        const matches = allProducts.filter(p => {
            return p.name.toLowerCase().includes(lowerQuery) || 
                   // also search by ID or basic buzzwords to make it feel smart
                   p.id.includes(lowerQuery) || 
                   (p.name.toLowerCase().includes('cafe') && lowerQuery.includes('cafe'));
        });
        
        if (matches.length === 0) {
            resultsContainer.innerHTML = `<p style="padding-top: 1rem; color: var(--color-gray); text-align: center;">No se encontraron resultados para "${query}".</p>`;
            return;
        }
        
        let html = '<div class="suggestion-list" style="margin-top: 1rem;">';
        matches.forEach(p => {
            const productHref = `producto${p.id}.html`;
            
            html += `
                <div class="suggestion-item" style="cursor: pointer;" onclick="window.location.href='${productHref}'">
                    <img src="${p.image}" alt="${p.name}">
                    <div class="suggestion-details">
                        <h5>${p.name}</h5>
                        <span>€${p.price.toFixed(2)}</span>
                    </div>
                    <button class="btn btn-primary btn-sm suggestion-add" data-id="${p.id}" onclick="event.stopPropagation();" aria-label="Añadir al carrito">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            `;
        });
        html += '</div>';
        
        resultsContainer.innerHTML = html;
        
        // Add event listeners for the "plus" button inside search results
        resultsContainer.querySelectorAll('.suggestion-add').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // prevent clicking from redirecting to product page
                const prod = allProducts.find(p => p.id === btn.dataset.id);
                if (prod) addToCart(prod);
                
                // Show brief visual feedback and close modal
                const icon = btn.querySelector('i');
                icon.className = 'fas fa-check';
                setTimeout(() => { 
                    icon.className = 'fas fa-plus'; 
                    // Close the search modal
                    const searchModal = document.getElementById('search-modal');
                    if (searchModal && searchModal.classList.contains('active')) {
                        searchModal.classList.remove('active');
                        document.body.style.overflow = '';
                        searchInput.value = ''; // clear search form
                        resultsContainer.innerHTML = ''; // clear results
                    }
                }, 500);
            });
        });
    }

    if (searchInput) {
        // Real-time search as user types
        searchInput.addEventListener('input', (e) => {
            renderSearchResults(e.target.value);
        });
    }

    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            renderSearchResults(searchInput.value);
        });
    }

    // --- Login Form Logic ---
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = document.getElementById('login-email').value;
            const btn = loginForm.querySelector('button[type="submit"]');
            
            const originalText = btn.textContent;
            btn.textContent = 'Iniciando sesión...';
            btn.disabled = true;
            
            setTimeout(() => {
                // Simulate successful login
                const mockUser = {
                    email: emailInput,
                    name: emailInput.split('@')[0] // use part of email as name for demo
                };
                
                localStorage.setItem('user', JSON.stringify(mockUser));
                updateAuthUI();
                
                closeModal(loginModal);
                btn.textContent = originalText;
                btn.disabled = false;
                loginForm.reset();
            }, 1000);
        });
    }

    // --- Checkout Button Logic ---
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (cart.length > 0) {
                window.location.href = 'checkout.html';
            } else {
                showToast('Tu carrito está vacío. Añade algunos productos primero.', 'error');
            }
        });
    }

    // --- Interactive Filters Logic ---
    const filterBtns = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card[data-category]');

    if (filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update active button state
                filterBtns.forEach(b => b.classList.remove('btn-primary', 'active'));
                filterBtns.forEach(b => b.classList.add('btn-outline'));
                
                btn.classList.remove('btn-outline');
                btn.classList.add('btn-primary', 'active');

                const filterValue = btn.getAttribute('data-filter');

                productCards.forEach(card => {
                    if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                        card.classList.remove('hide-filter');
                    } else {
                        card.classList.add('hide-filter');
                    }
                });
            });
        });
    }

    // --- Sticky Add-to-Cart Logic ---
    const stickyCart = document.getElementById('sticky-cart');
    const mainAddToCartBtn = document.querySelector('.main-product-card .add-to-cart-btn');

    if (stickyCart && mainAddToCartBtn) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                // If the main add-to-cart button is NOT visible in the viewport, show the sticky bar
                const waBtn = document.querySelector('.whatsapp-float');
                if (!entry.isIntersecting) {
                    stickyCart.classList.add('visible');
                    if (waBtn) waBtn.classList.add('shifted');
                } else {
                    stickyCart.classList.remove('visible');
                    if (waBtn) waBtn.classList.remove('shifted');
                }
            });
        }, {
            threshold: 0, 
            rootMargin: "-100px 0px 0px 0px" // give it a little margin before it kicks in
        });

        observer.observe(mainAddToCartBtn);
    }

    // --- FAQ Accordion Logic ---
    // Use event delegation so dynamic or late-rendered elements still work
    const faqContainer = document.querySelector('.faq-container');
    if (faqContainer) {
        faqContainer.addEventListener('click', (e) => {
            const header = e.target.closest('.accordion-header');
            if (!header) return;
            
            const item = header.parentElement;
            const body = item.querySelector('.accordion-body');
            
            // Toggle active state
            item.classList.toggle('active');
            
            // Animate height
            if (item.classList.contains('active')) {
                body.style.maxHeight = body.scrollHeight + 'px';
            } else {
                body.style.maxHeight = '0';
            }
        });
    }

    // --- Contact Page Form Logic ---
    const contactForm = document.getElementById('contact-page-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button[type="submit"]');
            const originalText = btn.textContent;
            
            const nameEl = document.getElementById('name');
            const subjectEl = document.getElementById('subject');
            const messageEl = document.getElementById('message');

            if (subjectEl && subjectEl.value === 'feedback') {
                const reviews = JSON.parse(localStorage.getItem('testimonios')) || [];
                reviews.push({
                    name: nameEl ? nameEl.value : 'Usuario',
                    text: messageEl ? messageEl.value : '',
                    approved: false // To be reviewed by developer later
                });
                localStorage.setItem('testimonios', JSON.stringify(reviews));
            }
            
            btn.textContent = 'Enviando mensaje...';
            btn.disabled = true;

            setTimeout(() => {
                showToast('Mensaje enviado correctamente. Te responderemos pronto.', 'success');
                contactForm.reset();
                btn.textContent = originalText;
                btn.disabled = false;
            }, 1200);
        });
    }

    // --- Render Testimonios (Home page) ---
    const reviewGrid = document.querySelector('.review-grid');
    if (reviewGrid) {
        const testimonios = JSON.parse(localStorage.getItem('testimonios')) || [];
        // Optionally, we could filter by approved. For now, since developer approval is "para despues", 
        // we'll render them to show the functionality works.
        testimonios.forEach(t => {
            const initial = t.name ? t.name.charAt(0).toUpperCase() : 'U';
            const reviewHtml = `
            <div class="review-card">
                <div class="stars">
                    <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>
                </div>
                <p class="review-text">"${t.text}"</p>
                <div class="reviewer">
                    <div class="reviewer-avatar">${initial}</div>
                    <div class="reviewer-info">
                        <h5>${t.name}</h5>
                        <span>Cliente (Pendiente)</span>
                    </div>
                </div>
            </div>`;
            reviewGrid.insertAdjacentHTML('beforeend', reviewHtml);
        });
    }

    // --- Hero Background Rotation ---
    const heroSection = document.querySelector('.hero');
    const heroSliderDotsContainer = document.getElementById('hero-slider-dots');
    
    if (heroSection) {
        // You can add more image filenames to this array
        const backgrounds = [
            'fondo1_leon.jpg',
            'fondo2_leon.jpg'
        ];
        
        let currentBgIndex = 0;
        let slideInterval;
        
        // Function to update the background and active dot
        const updateBackground = (index) => {
            currentBgIndex = index;
            const newBg = backgrounds[currentBgIndex];
            
            // We use the same background settings as in CSS to keep the gradient overlay
            heroSection.style.background = `
                linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)),
                url("${newBg}") center/cover no-repeat
            `;
            heroSection.style.backgroundAttachment = 'fixed';
            
            // Update dots
            if (heroSliderDotsContainer) {
                const dots = heroSliderDotsContainer.querySelectorAll('.hero-dot');
                dots.forEach((dot, i) => {
                    dot.classList.toggle('active', i === currentBgIndex);
                });
            }
        };

        // Function to start or restart the automatic slider
        const startSlider = () => {
            clearInterval(slideInterval);
            slideInterval = setInterval(() => {
                const nextIndex = (currentBgIndex + 1) % backgrounds.length;
                updateBackground(nextIndex);
            }, 8000);
        };
        
        // Render dots based on backgrounds array
        if (heroSliderDotsContainer && backgrounds.length > 1) {
            backgrounds.forEach((_, i) => {
                const dot = document.createElement('div');
                dot.classList.add('hero-dot');
                if (i === 0) dot.classList.add('active');
                
                // Manual navigation click
                dot.addEventListener('click', () => {
                    updateBackground(i);
                    startSlider(); // reset timer so it doesn't change immediately after manual click
                });
                
                heroSliderDotsContainer.appendChild(dot);
            });
        }
        
        // Start initial cycle
        startSlider();
    }
});
