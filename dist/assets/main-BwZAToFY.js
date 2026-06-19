var e=[],t=[],n=`all`,r=``,i=`featured`,a=null,o=document.getElementById(`products-grid`),s=document.querySelectorAll(`.nav-link, .footer-cat-link`),ee=document.getElementById(`search-input`),c=document.getElementById(`sort-select`),te=document.getElementById(`theme-toggle`),l=document.getElementById(`cart-btn`),u=document.getElementById(`close-cart`),d=document.getElementById(`cart-drawer`),f=document.getElementById(`cart-drawer-overlay`),p=document.getElementById(`cart-items-container`),m=document.getElementById(`cart-badge`),ne=document.getElementById(`cart-count`),re=document.getElementById(`cart-subtotal`),ie=document.getElementById(`cart-total`),h=document.getElementById(`cart-footer`),ae=document.getElementById(`checkout-btn`),g=document.getElementById(`product-modal`),_=document.getElementById(`close-modal`),v=document.getElementById(`modal-product-detail`),y=document.getElementById(`checkout-modal`),oe=document.getElementById(`close-checkout`),b=document.getElementById(`checkout-form`),se=document.getElementById(`checkout-items-list`),ce=document.getElementById(`checkout-subtotal`),le=document.getElementById(`checkout-total`),x=document.getElementById(`place-order-btn`),S=document.getElementById(`success-modal`),ue=document.getElementById(`success-done-btn`),de=document.getElementById(`confirmed-order-id`),C=document.getElementById(`account-btn`),w=document.getElementById(`account-dropdown`),fe=document.getElementById(`dropdown-name`),pe=document.getElementById(`dropdown-email`),me=document.getElementById(`logout-btn`),he=document.getElementById(`view-orders-btn`),T=document.getElementById(`auth-modal`),ge=document.getElementById(`close-auth-modal`),E=document.getElementById(`login-form`),D=document.getElementById(`register-form`),O=document.getElementById(`login-error`),k=document.getElementById(`register-error`),A=document.getElementById(`login-submit-btn`),j=document.getElementById(`register-submit-btn`),M=document.getElementById(`orders-modal`),N=document.getElementById(`close-orders-modal`),P=document.getElementById(`orders-list`);document.addEventListener(`DOMContentLoaded`,()=>{F(),L(),_e(),we(),Ce()});function F(){let e=localStorage.getItem(`theme`),t=window.matchMedia(`(prefers-color-scheme: dark)`).matches;if(e)document.documentElement.setAttribute(`data-theme`,e);else{let e=t?`dark`:`light`;document.documentElement.setAttribute(`data-theme`,e),localStorage.setItem(`theme`,e)}lucide.createIcons()}function I(){let e=document.documentElement.getAttribute(`data-theme`)===`dark`?`light`:`dark`;document.documentElement.setAttribute(`data-theme`,e),localStorage.setItem(`theme`,e);let t=document.getElementById(`theme-toggle`);t.style.transform=`scale(0.85)`,setTimeout(()=>{t.style.transform=`none`},150)}async function L(){try{let t=await fetch(`/api/products`);if(!t.ok)throw Error(`Network response was not ok`);e=await t.json(),R();let n=document.getElementById(`hero-quick-view`);n&&n.addEventListener(`click`,e=>{K(parseInt(e.target.getAttribute(`data-product-id`)))})}catch(e){console.error(`Error fetching products catalog:`,e),o.innerHTML=`
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-secondary);">
                <p>Failed to load the product ecosystem. Please check back later.</p>
            </div>
        `}}function R(){let t=e.filter(e=>{let t=n===`all`||e.category===n,i=e.name.toLowerCase().includes(r.toLowerCase())||e.description.toLowerCase().includes(r.toLowerCase());return t&&i});if(i===`price-low`?t.sort((e,t)=>e.price-t.price):i===`price-high`?t.sort((e,t)=>t.price-e.price):i===`rating`&&t.sort((e,t)=>t.rating-e.rating),t.length===0){o.innerHTML=`
            <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem; color: var(--text-secondary);">
                <i data-lucide="info" size="32" style="margin-bottom: 1rem; opacity: 0.5;"></i>
                <p>No gear matches your search criteria.</p>
            </div>
        `,lucide.createIcons();return}o.innerHTML=t.map(e=>`
        <article class="product-card" data-id="${e.id}">
            <div class="product-card-image-wrapper">
                <span class="product-card-badge">${e.category}</span>
                <img src="${e.image}" alt="${e.name}" class="product-card-image" loading="lazy">
            </div>
            <div class="product-card-rating">
                <i data-lucide="star"></i>
                <span>${e.rating.toFixed(1)}</span>
            </div>
            <h3 class="product-card-title">${e.name}</h3>
            <p class="product-card-desc">${e.description}</p>
            <div class="product-card-footer">
                <span class="product-card-price">$${e.price.toFixed(2)}</span>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-secondary btn-icon quick-view-btn" data-id="${e.id}" title="Quick View" aria-label="Quick View">
                        <i data-lucide="eye" style="width: 18px; height: 18px;"></i>
                    </button>
                    <button class="btn btn-primary add-to-cart-btn" data-id="${e.id}">
                        Add to Bag
                    </button>
                </div>
            </div>
        </article>
    `).join(``),lucide.createIcons(),document.querySelectorAll(`.quick-view-btn`).forEach(e=>{e.addEventListener(`click`,e=>{K(parseInt(e.currentTarget.getAttribute(`data-id`)))})}),document.querySelectorAll(`.add-to-cart-btn`).forEach(e=>{e.addEventListener(`click`,e=>{B(parseInt(e.currentTarget.getAttribute(`data-id`))),G()})})}function _e(){let e=localStorage.getItem(`aetherio_cart`);e&&(t=JSON.parse(e)),H()}function z(){localStorage.setItem(`aetherio_cart`,JSON.stringify(t))}function B(n){let r=e.find(e=>e.id===n);if(!r)return;let i=t.find(e=>e.product.id===n);i?i.quantity+=1:t.push({product:r,quantity:1}),z(),H(),U()}function V(e,n){let r=t.find(t=>t.product.id===e);r&&(r.quantity+=n,r.quantity<=0&&(t=t.filter(t=>t.product.id!==e)),z(),H())}function ve(e){t=t.filter(t=>t.product.id!==e),z(),H()}function H(){let e=t.reduce((e,t)=>e+t.quantity,0);if(m.textContent=e,ne.textContent=e,e===0){m.style.display=`none`,p.innerHTML=`
            <div class="empty-cart-message">
                <i data-lucide="shopping-bag" style="width: 40px; height: 40px; stroke-width: 1.5; color: var(--text-muted);"></i>
                <p>Your bag is empty.</p>
                <a href="#catalog" class="btn btn-secondary close-cart-link">Browse Products</a>
            </div>
        `,h.style.display=`none`;let e=p.querySelector(`.close-cart-link`);e&&e.addEventListener(`click`,W)}else{m.style.display=`flex`,h.style.display=`block`;let e=0;p.innerHTML=t.map(t=>{let n=t.product.price*t.quantity;return e+=n,`
                <div class="cart-item">
                    <div class="cart-item-image-wrapper">
                        <img src="${t.product.image}" alt="${t.product.name}" class="cart-item-image">
                    </div>
                    <div class="cart-item-details">
                        <h4 class="cart-item-title">${t.product.name}</h4>
                        <div class="cart-item-price">$${t.product.price.toFixed(2)}</div>
                    </div>
                    <div class="cart-item-actions">
                        <div class="quantity-selector">
                            <button class="qty-btn dec-qty" data-id="${t.product.id}">-</button>
                            <span class="qty-val">${t.quantity}</span>
                            <button class="qty-btn inc-qty" data-id="${t.product.id}">+</button>
                        </div>
                        <button class="remove-item-btn" data-id="${t.product.id}">
                            <i data-lucide="trash-2"></i> Remove
                        </button>
                    </div>
                </div>
            `}).join(``),re.textContent=`$${e.toFixed(2)}`,ie.textContent=`$${e.toFixed(2)}`,p.querySelectorAll(`.dec-qty`).forEach(e=>{e.addEventListener(`click`,e=>{V(parseInt(e.target.getAttribute(`data-id`)),-1)})}),p.querySelectorAll(`.inc-qty`).forEach(e=>{e.addEventListener(`click`,e=>{V(parseInt(e.target.getAttribute(`data-id`)),1)})}),p.querySelectorAll(`.remove-item-btn`).forEach(e=>{e.addEventListener(`click`,e=>{ve(parseInt(e.currentTarget.getAttribute(`data-id`)))})})}lucide.createIcons()}function U(){d.classList.add(`active`),f.classList.add(`active`),document.body.style.overflow=`hidden`}function W(){d.classList.remove(`active`),f.classList.remove(`active`),document.body.style.overflow=``}function G(){l.style.transform=`scale(1.2) rotate(-10deg)`,l.style.borderColor=`var(--accent-color)`,setTimeout(()=>{l.style.transform=`none`,l.style.borderColor=``},300)}function K(t){let n=e.find(e=>e.id===t);n&&(v.innerHTML=`
        <div class="product-detail-layout">
            <div class="modal-gallery-side">
                <img src="${n.image}" alt="${n.name}">
            </div>
            <div class="modal-info-side">
                <div class="product-card-rating">
                    <i data-lucide="star"></i>
                    <span>${n.rating.toFixed(1)} Rating</span>
                </div>
                <h2 class="modal-title">${n.name}</h2>
                <div class="modal-price">$${n.price.toFixed(2)}</div>
                
                <p class="modal-description">${n.description}</p>
                
                <h4 class="modal-section-title">Technical Specifications</h4>
                <div class="specs-list">
                    ${n.specs.map(e=>`<div class="spec-item">${e}</div>`).join(``)}
                </div>
                
                <div class="modal-actions">
                    <button class="btn btn-primary add-to-cart-modal-btn" data-id="${n.id}">Add to Bag</button>
                </div>
            </div>
        </div>
    `,lucide.createIcons(),g.classList.add(`active`),document.body.style.overflow=`hidden`,v.querySelector(`.add-to-cart-modal-btn`).addEventListener(`click`,e=>{B(parseInt(e.target.getAttribute(`data-id`))),q(),G()}))}function q(){g.classList.remove(`active`),d.classList.contains(`active`)||(document.body.style.overflow=``)}function ye(){W();let e=0;se.innerHTML=t.map(t=>{let n=t.product.price*t.quantity;return e+=n,`
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; font-size: 0.9rem;">
                <div style="max-width: 180px;">
                    <strong style="display: block; font-weight: 600; color: var(--text-primary); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${t.product.name}</strong>
                    <span style="color: var(--text-secondary); font-size: 0.8rem;">Qty: ${t.quantity}</span>
                </div>
                <span style="font-family: 'Outfit'; font-weight: 600;">$${n.toFixed(2)}</span>
            </div>
        `}).join(``),ce.textContent=`$${e.toFixed(2)}`,le.textContent=`$${e.toFixed(2)}`,x.textContent=`Place Order ($${e.toFixed(2)})`,y.classList.add(`active`),document.body.style.overflow=`hidden`}function J(){y.classList.remove(`active`),document.body.style.overflow=``}function be(e){e.preventDefault(),x.disabled=!0,x.innerHTML=`<span class="pulse-dot" style="background-color:#fff;"></span> Processing...`;let n={name:document.getElementById(`checkout-name`).value,email:document.getElementById(`checkout-email`).value,address:document.getElementById(`checkout-address`).value,city:document.getElementById(`checkout-city`).value,zip:document.getElementById(`checkout-zip`).value,cart:t.map(e=>({productId:e.product.id,quantity:e.quantity}))};fetch(`/api/checkout`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify(n)}).then(e=>e.ok?e.json():e.json().then(e=>{throw Error(e.error||`Server error occurred during checkout`)})).then(e=>{if(e.success&&e.order_id)J(),t=[],z(),H(),de.textContent=e.order_id,b.reset(),x.disabled=!1,S.classList.add(`active`),document.body.style.overflow=`hidden`;else throw Error(e.error||`Unexpected response format`)}).catch(e=>{console.error(`Checkout error:`,e),alert(`Checkout Failed: `+e.message),x.disabled=!1,x.textContent=`Place Order ($${t.reduce((e,t)=>e+t.product.price*t.quantity,0).toFixed(2)})`})}function xe(e){let t=e.target.value.replace(/\s+/g,``).replace(/[^0-9]/gi,``),n=``;for(let e=0;e<t.length;e++)e>0&&e%4==0&&(n+=` `),n+=t[e];e.target.value=n}function Se(e){let t=e.target.value.replace(/\D/g,``);t.length>=2?e.target.value=t.slice(0,2)+`/`+t.slice(2,4):e.target.value=t}function Ce(){te.addEventListener(`click`,I),l.addEventListener(`click`,U),u.addEventListener(`click`,W),f.addEventListener(`click`,W),ae.addEventListener(`click`,ye),_.addEventListener(`click`,q),g.addEventListener(`click`,e=>{e.target===g&&q()}),oe.addEventListener(`click`,J),y.addEventListener(`click`,e=>{e.target===y&&J()}),b.addEventListener(`submit`,be);let e=document.getElementById(`checkout-card`),t=document.getElementById(`checkout-expiry`);e.addEventListener(`input`,xe),t.addEventListener(`input`,Se),ue.addEventListener(`click`,()=>{S.classList.remove(`active`),document.body.style.overflow=``}),s.forEach(e=>{e.addEventListener(`click`,e=>{e.preventDefault();let t=e.currentTarget.getAttribute(`data-category`);s.forEach(e=>e.classList.remove(`active`)),document.querySelectorAll(`.nav-link[data-category="${t}"]`).forEach(e=>e.classList.add(`active`)),n=t,R();let r=document.getElementById(`catalog`);r&&r.scrollIntoView({behavior:`smooth`})})}),ee.addEventListener(`input`,e=>{r=e.target.value,R()}),c.addEventListener(`change`,e=>{i=e.target.value,R()}),C.addEventListener(`click`,e=>{e.stopPropagation(),a?w.classList.toggle(`active`):X(`login`)}),document.addEventListener(`click`,()=>{w.classList.remove(`active`)}),w.addEventListener(`click`,e=>e.stopPropagation()),ge.addEventListener(`click`,Z),T.addEventListener(`click`,e=>{e.target===T&&Z()}),document.querySelectorAll(`.auth-tab`).forEach(e=>{e.addEventListener(`click`,()=>{Q(e.getAttribute(`data-tab`))})}),E.addEventListener(`submit`,Te),D.addEventListener(`submit`,Ee),me.addEventListener(`click`,De),he.addEventListener(`click`,()=>{w.classList.remove(`active`),Oe()}),N.addEventListener(`click`,$),M.addEventListener(`click`,e=>{e.target===M&&$()})}function we(){fetch(`/api/me`).then(e=>e.json()).then(e=>{e.logged_in?(a=e.user,Y()):(a=null,Y())}).catch(()=>{a=null})}function Y(){let e=document.getElementById(`admin-panel-link`);if(a)if(fe.textContent=a.full_name,pe.textContent=a.email,C.style.borderColor=`var(--accent-color)`,C.style.color=`var(--accent-color)`,a.is_admin){if(!e){e=document.createElement(`a`),e.href=`/admin`,e.className=`dropdown-item`,e.id=`admin-panel-link`,e.innerHTML=`<i data-lucide="shield-alert"></i> Admin Panel`;let t=document.getElementById(`logout-btn`);t?t.parentNode.insertBefore(e,t):w.appendChild(e),lucide.createIcons()}}else e&&e.remove();else C.style.borderColor=``,C.style.color=``,e&&e.remove()}function X(e=`login`){Q(e),O.textContent=``,k.textContent=``,T.classList.add(`active`),document.body.style.overflow=`hidden`}function Z(){T.classList.remove(`active`),document.body.style.overflow=``}function Q(e){document.querySelectorAll(`.auth-tab`).forEach(t=>{t.classList.toggle(`active`,t.getAttribute(`data-tab`)===e)}),document.getElementById(`panel-login`).classList.toggle(`hidden`,e!==`login`),document.getElementById(`panel-register`).classList.toggle(`hidden`,e!==`register`)}function Te(e){e.preventDefault(),O.textContent=``,A.disabled=!0,A.textContent=`Signing in...`;let t=document.getElementById(`login-email`).value,n=document.getElementById(`login-password`).value;fetch(`/api/login`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({email:t,password:n})}).then(e=>e.json()).then(e=>{e.success?(a=e.user,Y(),Z(),E.reset()):O.textContent=e.error||`Login failed.`}).catch(()=>{O.textContent=`Network error. Please try again.`}).finally(()=>{A.disabled=!1,A.textContent=`Sign In`})}function Ee(e){e.preventDefault(),k.textContent=``,j.disabled=!0,j.textContent=`Creating account...`;let t=document.getElementById(`reg-name`).value,n=document.getElementById(`reg-email`).value,r=document.getElementById(`reg-password`).value;fetch(`/api/register`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({full_name:t,email:n,password:r})}).then(e=>e.json()).then(e=>{e.success?(a=e.user,Y(),Z(),D.reset()):k.textContent=e.error||`Registration failed.`}).catch(()=>{k.textContent=`Network error. Please try again.`}).finally(()=>{j.disabled=!1,j.textContent=`Create Account`})}function De(){w.classList.remove(`active`),fetch(`/api/logout`,{method:`POST`}).then(()=>{a=null,Y()})}function Oe(){M.classList.add(`active`),document.body.style.overflow=`hidden`,P.innerHTML=`<div style="text-align:center; padding: 2rem; color: var(--text-muted);">Loading orders...</div>`,fetch(`/api/orders`).then(e=>{if(e.status===401)throw Error(`not_authenticated`);return e.json()}).then(e=>ke(e)).catch(e=>{e.message===`not_authenticated`?($(),X(`login`)):(P.innerHTML=`<div class="orders-empty"><i data-lucide="alert-circle"></i><p>Could not load orders.</p></div>`,lucide.createIcons())})}function $(){M.classList.remove(`active`),document.body.style.overflow=``}function ke(e){if(!e||e.length===0){P.innerHTML=`
            <div class="orders-empty">
                <i data-lucide="package"></i>
                <p>No orders yet. Start shopping to see your order history here!</p>
                <button class="btn btn-primary" onclick="closeOrdersModal(); document.getElementById('catalog').scrollIntoView({behavior:'smooth'});">Browse Products</button>
            </div>`,lucide.createIcons();return}P.innerHTML=e.map(e=>`
        <div class="order-card">
            <div class="order-card-header">
                <div>
                    <div class="order-card-id">${e.order_id}</div>
                    <div class="order-card-date">${e.created_at}</div>
                </div>
                <div class="order-card-total">$${e.total.toFixed(2)}</div>
            </div>
            <div class="order-card-items">
                ${e.items.map(e=>`
                    <div class="order-item-row">
                        <img src="${e.product_image}" alt="${e.product_name}" class="order-item-img">
                        <div class="order-item-info">
                            <div class="order-item-name">${e.product_name}</div>
                            <div class="order-item-qty">Qty: ${e.quantity}</div>
                        </div>
                        <div class="order-item-price">$${e.line_total.toFixed(2)}</div>
                    </div>
                `).join(``)}
            </div>
        </div>
    `).join(``),lucide.createIcons()}