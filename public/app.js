// public/app.js
// AlNaseej Ordering - Frontend (Real Backend + SQLite)

const money = (n) => Number(n || 0).toFixed(3) + " د.ب";

const toastEl = document.getElementById("toast");
const hintEl = document.getElementById("hint");

const menuList = document.getElementById("menuList");
const cartCount = document.getElementById("cartCount");
const cartDrawer = document.getElementById("cartDrawer");
const btnOpenCart = document.getElementById("btnOpenCart");
const btnCloseCart = document.getElementById("btnCloseCart");
const cartItemsEl = document.getElementById("cartItems");
const cartSubtotalLine = document.getElementById("cartSubtotalLine");
const btnClearCart = document.getElementById("btnClearCart");
const btnCheckout = document.getElementById("btnCheckout");
const btnGoToCheckout = document.getElementById("btnGoToCheckout");
const checkoutModal = document.getElementById("checkoutModal");
const btnCloseCheckout = document.getElementById("btnCloseCheckout");

// Floating Button Elements
const floatingOrderBtn = document.getElementById("floatingOrderBtn");
const btnFloatingCheckout = document.getElementById("btnFloatingCheckout");
const floatingCartCount = document.getElementById("floatingCartCount");

const nameInput = document.getElementById("nameInput");
const phoneInput = document.getElementById("phoneInput");
const carInput = document.getElementById("carInput");
const noteInput = document.getElementById("noteInput");

const searchInput = document.getElementById("searchInput");
const categoryTabs = document.getElementById("categoryTabs");
const currentCategoryTitle = document.getElementById("currentCategoryTitle");

// State
let cart = [];
let MENU = [];
let FLAVORS = [];
let SLUSH_FLAVORS = [];
let CAFE_OPEN = true;
let currentTab = "all";
let currentLang = localStorage.getItem('lang') || 'ar';

// ===== Translations =====
const T = {
  ar: {
    siteTitle: 'النسيج كافيه',
    orderFood: 'طلب طعام',
    knowUs: 'تعرف علينا',
    cart: 'السلة',
    yourCart: 'سلتك',
    total: 'المجموع',
    emptyCart: 'السلة فاضية.',
    clear: 'تفريغ',
    orderNow: 'اطلب الآن',
    orderDetails: 'بيانات الطلب',
    name: 'الاسم (مطلوب)',
    namePlaceholder: 'اكتب اسمك هنا',
    phone: 'رقم الهاتف (مطلوب)',
    phonePlaceholder: 'مثال: 3xxxxxxx',
    car: 'رقم السيارة (اختياري)',
    carPlaceholder: 'مثال: 12345',
    notes: 'ملاحظات (اختياري)',
    notesPlaceholder: 'بدون سكر… زيادة صوص…',
    confirm: 'تأكيد وإرسال الطلب',
    addToCart: 'تمت الإضافة ✅',
    addFirst: 'أضف أصناف للسلة أولاً 🛒',
    cafeClosedMsg: 'الكافيه مغلق حالياً.',
    searchPlaceholder: 'ابحث عن صنف…',
    menu: 'المنيو',
    prices: 'الأسعار بالدينار البحريني (BHD)',
    chooseSize: 'اختر الحجم:',
    chooseType: 'اختر النوع:',
    choosePack: 'اختر التعبئة:',
    chooseFlavor: 'اختر النكهة:',
    chooseSlushFlavor: 'اختر نكهة السلاش:',
    mix: 'مكس ✨',
    cup: 'كوب',
    biscuit: 'بسكوت',
    choose: 'اختر',
    pleaseChoose: 'يرجى الاختيار',
    addBtn: '+ إضافة',
    items: 'صنف',
    all: 'الكل',
    clearCart: 'تم تفريغ السلة',
    workHours: 'أوقات العمل ⏰',
    workTime: 'من 3 عصراً إلى 11 ليلاً',
  },
  en: {
    siteTitle: 'Al Naseej Cafe',
    orderFood: 'Food Ordering',
    knowUs: 'About Us',
    cart: 'Cart',
    yourCart: 'Your Cart',
    total: 'Total',
    emptyCart: 'Cart is empty.',
    clear: 'Clear',
    orderNow: 'Order Now',
    orderDetails: 'Order Details',
    name: 'Name (required)',
    namePlaceholder: 'Enter your name',
    phone: 'Phone (required)',
    phonePlaceholder: 'e.g. 3xxxxxxx',
    car: 'Car number (optional)',
    carPlaceholder: 'e.g. 12345',
    notes: 'Notes (optional)',
    notesPlaceholder: 'No sugar... extra sauce...',
    confirm: 'Confirm & Place Order',
    addToCart: 'Added ✅',
    addFirst: 'Add items to cart first 🛒',
    cafeClosedMsg: 'Cafe is currently closed.',
    searchPlaceholder: 'Search for an item…',
    menu: 'Menu',
    prices: 'Prices in Bahraini Dinar (BHD)',
    chooseSize: 'Choose size:',
    chooseType: 'Choose type:',
    choosePack: 'Choose packaging:',
    chooseFlavor: 'Choose flavor:',
    chooseSlushFlavor: 'Choose Slush flavor:',
    mix: 'Mix ✨',
    cup: 'Cup',
    biscuit: 'Biscuit',
    choose: 'Choose',
    pleaseChoose: 'Please choose',
    addBtn: '+ Add',
    items: 'items',
    all: 'All',
    clearCart: 'Cart cleared',
    workHours: 'Working Hours ⏰',
    workTime: '3 PM to 11 PM',
  }
};

function t(key) { return T[currentLang]?.[key] || T.ar[key] || key; }

function applyLang() {
  const isAr = currentLang === 'ar';
  document.documentElement.lang = currentLang;
  document.documentElement.dir = isAr ? 'rtl' : 'ltr';
  // Update static elements
  const el = (id) => document.getElementById(id);
  const setTxt = (id, key) => { const e = el(id); if(e) e.textContent = t(key); };
  setTxt('btnKnowUs', 'knowUs');
  setTxt('cartSubtotalLine', 'total');
  const brandSub = document.querySelector('.brandSub'); if(brandSub) brandSub.textContent = t('orderFood');
  const brandName = document.querySelector('.brandName'); if(brandName) brandName.textContent = t('siteTitle');
  const openCartBtn = el('btnOpenCart'); if(openCartBtn) openCartBtn.innerHTML = t('cart') + ` <span id="cartCount" class="badge">${openCartBtn.querySelector('#cartCount')?.textContent || 0}</span>`;
  const drawerTitleEl = document.querySelector('.drawerTitle'); if(drawerTitleEl) drawerTitleEl.textContent = t('yourCart');
  const clearBtn = el('btnClearCart'); if(clearBtn) clearBtn.textContent = t('clear');
  const goCheckoutBtn = el('btnGoToCheckout'); if(goCheckoutBtn) goCheckoutBtn.textContent = t('orderNow');
  const checkoutTitle = document.querySelector('.cardTitle'); if(checkoutTitle) checkoutTitle.textContent = t('orderDetails');
  const nameLabel = document.querySelector('label[for="nameInput"]') || document.querySelectorAll('.label')[0]; if(nameLabel) nameLabel.textContent = t('name');
  const nameInputEl = el('nameInput'); if(nameInputEl) nameInputEl.placeholder = t('namePlaceholder');
  const phoneLabel = document.querySelectorAll('.label')[1]; if(phoneLabel) phoneLabel.textContent = t('phone');
  const phoneInputEl = el('phoneInput'); if(phoneInputEl) phoneInputEl.placeholder = t('phonePlaceholder');
  const carLabel = document.querySelectorAll('.label')[2]; if(carLabel) carLabel.textContent = t('car');
  const carInputEl = el('carInput'); if(carInputEl) carInputEl.placeholder = t('carPlaceholder');
  const noteLabel = document.querySelectorAll('.label')[3]; if(noteLabel) noteLabel.textContent = t('notes');
  const noteInputEl = el('noteInput'); if(noteInputEl) noteInputEl.placeholder = t('notesPlaceholder');
  const checkoutBtn = el('btnCheckout'); if(checkoutBtn) checkoutBtn.textContent = t('confirm');
  const searchEl = el('searchInput'); if(searchEl) searchEl.placeholder = t('searchPlaceholder');
  const menuTitle = el('currentCategoryTitle'); if(menuTitle && menuTitle.textContent === t('menu') || menuTitle?.textContent === 'المنيو' || menuTitle?.textContent === 'Menu') menuTitle.textContent = t('menu');
  const catPrices = document.querySelector('.muted'); if(catPrices) catPrices.textContent = t('prices');
  const floatBtn = el('btnFloatingCheckout'); if(floatBtn) { const badge = floatBtn.querySelector('.badge'); floatBtn.innerHTML = `<span>${t('orderNow')}</span><span id="floatingCartCount" class="badge">${badge?.textContent || 0}</span>`; }
  const langBtn = el('btnLang'); if(langBtn) langBtn.textContent = isAr ? 'EN' : 'ع';
  // Re-render menu with new language
  renderTabs();
  renderMenu();
  renderCartDrawer();
}

// ================= Helpers =================

function toast(msg) {
  if (!toastEl) return;
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  setTimeout(() => toastEl.classList.remove("show"), 2000);
}

function phoneOk(str) {
  return /^[0-9+\s-]{8,}$/.test(String(str || "").trim());
}

function cartSubtotal() {
  return cart.reduce((a, b) => a + b.unit_price * b.qty, 0);
}

function renderCartBadge() {
  const count = cart.reduce((a, b) => a + b.qty, 0);

  // Update Top Bar Cart
  if (cartCount) cartCount.textContent = count;
  if (cartSubtotalLine) cartSubtotalLine.textContent = `${t('total')}: ${money(cartSubtotal())}`;


  // Update Floating Button
  if (floatingCartCount) floatingCartCount.textContent = count;
  if (floatingOrderBtn) {
    if (count > 0) floatingOrderBtn.classList.add("show");
    else floatingOrderBtn.classList.remove("show");
  }
}

function renderCartDrawer() {
  if (!cartItemsEl) return;

  if (cart.length === 0) {
    cartItemsEl.innerHTML = `<div class="hint">${t('emptyCart')}</div>`;

    renderCartBadge();
    return;
  }

  cartItemsEl.innerHTML = cart
    .map((row, idx) => {
      const line = row.unit_price * row.qty;
      return `
      <div class="cartRow">
        <div>
          <div class="cartRowTitle">${row.item_name}</div>
          <div class="cartRowMeta">${row.qty} × ${money(row.unit_price)} = <b>${money(line)}</b></div>
        </div>
        <div class="qty">
          <button data-dec="${idx}">−</button>
          <span>${row.qty}</span>
          <button data-inc="${idx}">+</button>
        </div>
      </div>
    `;
    })
    .join("");

  cartItemsEl.querySelectorAll("[data-inc]").forEach((b) => {
    b.addEventListener("click", () => {
      const idx = Number(b.dataset.inc);
      cart[idx].qty += 1;
      renderCartDrawer();
    });
  });

  cartItemsEl.querySelectorAll("[data-dec]").forEach((b) => {
    b.addEventListener("click", () => {
      const idx = Number(b.dataset.dec);
      cart[idx].qty -= 1;
      cart = cart.filter((x) => x.qty > 0);
      renderCartDrawer();
    });
  });

  renderCartBadge();
}

function openCart() {
  cartDrawer?.classList.add("show");
  cartDrawer?.setAttribute("aria-hidden", "false");
  renderCartDrawer();
}

function closeCart() {
  cartDrawer?.classList.remove("show");
  cartDrawer?.setAttribute("aria-hidden", "true");
}

function openCheckout() {
  if (cart.length === 0) {
    toast("أضف أصناف للسلة أولاً 🛒");
    return;
  }
  closeCart();
  checkoutModal?.classList.add("show");
}

function closeCheckout() {
  checkoutModal?.classList.remove("show");
}

// ============== Cart ops ==============

function addToCart(item_name, unit_price, note = null) {
  const name = note ? `${item_name} — ${note}` : item_name;
  const price = Number(unit_price);

  const row = cart.find((x) => x.item_name === name && x.unit_price === price);
  if (row) row.qty += 1;
  else cart.push({ item_name: name, unit_price: price, qty: 1 });

  renderCartBadge();
  toast("تمت الإضافة ✅");
}

// ============== Menu render ==============

function renderTabs() {
  if (!categoryTabs) return;

  // الأقسام بالترتيب الذي طلبه المستخدم
  const tabs = [
    { id: "all", label: t('all') },
    { id: "الكيك", label: "الكيك" },
    { id: "سينامون", label: "سينامون" },
    { id: "كرواسون", label: "كرواسون" },
    { id: "المفن", label: "المفن" },
    { id: "المشروبات الحارة", label: "المشروبات الحارة" },
    { id: "المشروبات الباردة", label: "المشروبات الباردة" },
    { id: "اخرى", label: "اخرى" }
  ];

  categoryTabs.innerHTML = tabs.map(tab => {
    return `<div class="tab ${currentTab === tab.id ? 'active' : ''}" data-tag="${tab.id}">${tab.label}</div>`;
  }).join("");

  categoryTabs.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", () => {
      currentTab = tab.dataset.tag;
      renderTabs();
      renderMenu();
    });
  });
}

function renderMenu() {
  const q = (searchInput?.value || "").trim().toLowerCase();

  if (currentCategoryTitle) {
    const activeTabObj = Array.from(categoryTabs.querySelectorAll('.tab')).find(t => t.dataset.tag === currentTab);
    currentCategoryTitle.textContent = activeTabObj ? activeTabObj.textContent : "المنيو";
  }

  // --- Cinnamon Special Notice ---
  const cinCat = MENU.find(c => c.name === "السينامون" || c.tag === "السينامون");
  const hasCinnamon = cinCat && cinCat.items && cinCat.items.length > 0;

  if (currentTab === "السينامون" && !hasCinnamon) {
    menuList.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 50px 24px; background: rgba(255,255,255,0.03); border: 2px dashed var(--teal); border-radius: 28px; margin: 20px 0;">
        <div style="font-size: 4rem; margin-bottom: 20px;">🥮</div>
        <h2 style="color: var(--teal); font-weight: 1000; margin-bottom: 12px; font-size: 1.8rem;">السينامون يتوفر بالطلب فقط</h2>
        <p style="color: var(--text); line-height: 1.8; font-size: 1.2rem; margin-bottom: 30px; opacity: 0.8; max-width: 500px; margin-left: auto; margin-right: auto;">
          الرجاء الطلب قبل يوم واحد على الأقل لضمان توفير طلبكم طازجاً، وذلك عبر مراسلتنا مباشرة على الواتساب.
        </p>
        <a href="https://wa.me/97339402050" target="_blank" class="btn btnPrimary" style="display: inline-flex; align-items: center; gap: 12px; padding: 16px 32px; font-size: 1.2rem; border-radius: 18px; text-decoration: none;">
          <span>اطلب الآن عبر الواتساب</span>
          <svg style="width:28px; height:28px" viewBox="0 0 24 24" fill="currentColor"><path d="M12.012 2c-5.508 0-9.987 4.479-9.987 9.987 0 1.763.463 3.421 1.267 4.87L2 22l5.303-1.391c1.401.761 2.992 1.191 4.686 1.191 5.508 0 9.987-4.479 9.987-9.987 0-5.508-4.479-9.987-9.987-9.987zm4.39 12.87c-.183-.092-1.085-.536-1.252-.598-.168-.061-.29-.092-.412.092-.122.183-.473.598-.579.718-.107.121-.213.136-.396.046-.183-.092-.772-.284-1.47-1.02-.544-.572-.912-1.278-1.018-1.462-.107-.183-.011-.282.08-.372.081-.081.183-.214.275-.321.092-.107.122-.183.183-.305.061-.122.031-.229-.015-.321-.046-.092-.412-1-0.564-1.373-.148-.363-.298-.313-.412-.319-.104-.005-.221-.006-.337-.006-.117 0-.306.044-.467.221-.161.176-.613.598-.613 1.458 0 .861.626 1.693.714 1.815.088.121 1.233 1.883 2.986 2.641.417.181.741.289.995.369.419.133.801.114 1.102.07.336-.05 1.085-.444 1.237-.872.153-.428.153-.795.107-.872-.046-.076-.168-.121-.351-.214z"/></svg>
        </a>
      </div>
    `;
    return;
  }

  menuList.innerHTML = MENU.map((cat, catIndex) => {
    // تصفية حسب القسم المختار
    if (currentTab !== "all") {
      if (currentTab === "المشروبات الحارة") {
        if (!["المشروبات الحارة", "القهوة الحارة"].includes(cat.name)) return "";
      } else if (currentTab === "المشروبات الباردة") {
        if (!["المشروبات الباردة", "القهوة الباردة"].includes(cat.name)) return "";
      } else {
        if (cat.name !== currentTab) return "";
      }
    }

    const filtered = cat.items
      .map((it, originalIndex) => ({ ...it, originalIndex }))
      .filter((it) => {
        if (!q) return true;
        const hay = `${it.name} ${it.note || ""} ${cat.name} ${cat.tag}`.toLowerCase();
        return hay.includes(q);
      });

    if (filtered.length === 0) return "";

    const grouped = [];
    const nameMap = new Map();

    filtered.forEach(it => {
      const match = it.name.match(/^(.+?)\s*\((.+?)\)$/);
      if (match) {
        const baseName = match[1].trim();
        const variantName = match[2].trim();
        if (!nameMap.has(baseName)) {
          const prod = { ...it, displayName: baseName, variants: [], isGroup: true };
          nameMap.set(baseName, prod);
          grouped.push(prod);
        } else {
          // إذا كان هذا الصنف يحتوي على صورة والمنتج المجموع حالياً لا يحتوي، نحدث الصورة لتظهر
          const existing = nameMap.get(baseName);
          if (!existing.image_url && it.image_url) {
            existing.image_url = it.image_url;
          }
        }
        nameMap.get(baseName).variants.push({ ...it, variantLabel: variantName });
      } else {
        grouped.push({ ...it, displayName: it.name, variants: [{ ...it, variantLabel: "" }], isGroup: false });
      }
    });

    return `
      <div class="cat">
        <div class="catTop">
          <div>
            <div class="catName">${cat.name}</div>
            <div class="itemSub">${cat.tag}</div>
          </div>
          <div class="catTag">${filtered.length} ${t('items')}</div>

        </div>
        <div class="items">
          ${grouped.map((prod, pIdx) => {
      const isIceCream = prod.displayName.includes("ايسكريم") || prod.displayName.includes("أسكريم");
      const isSlush = prod.displayName.includes("سلاش");
      const activeVariant = prod.variants[0];
      const hasVariants = prod.variants.length > 1;

      return `
                <div class="item" id="prod-${catIndex}-${pIdx}" data-main-img="${prod.image_url || ''}">
                  <img class="itemImg" 
                    src="${prod.image_url || `https://placehold.co/600x400/222/FFF?text=${encodeURIComponent(prod.displayName)}`}" 
                    alt="${prod.displayName}"
                    onerror="this.onerror=null; this.src='https://placehold.co/600x400/222/FFF?text=${encodeURIComponent(prod.displayName)}';">
                  <div class="itemInfo">
                    <div class="itemTitle">${prod.displayName}</div>
                    <div class="itemSub">${prod.note ? prod.note : ""}</div>
                    
                    ${hasVariants ? `
                      <div class="variants" style="gap:4px;">
                        <div style="width:100%; font-size:0.7rem; color:var(--muted); margin-bottom:2px;">${isIceCream ? t('chooseSize') : t('chooseType')}</div>

                        ${prod.variants.map((v, vIdx) => `
                          <button class="varBtn ${(vIdx === 0 && !isIceCream) ? 'active' : ''}" 
                            data-type="size"
                            data-vimg="${v.image_url || ''}"
                            onclick="selectVariant(${catIndex}, ${pIdx}, ${vIdx}, ${v.price}, '${v.id}')">
                            ${v.variantLabel}
                          </button>
                        `).join("")}
                      </div>
                    ` : ""}

                    ${isIceCream ? `
                      <div class="variants" style="gap:4px; margin-top:10px;">
                        <div style="width:100%; font-size:0.7rem; color:var(--muted); margin-bottom:2px;">${t('choosePack')}</div>
                        <button class="varBtn" data-type="pack" onclick="selectIcePack(${catIndex}, ${pIdx}, '${t('cup')}')">${t('cup')}</button>
                        <button class="varBtn" data-type="pack" onclick="selectIcePack(${catIndex}, ${pIdx}, '${t('biscuit')}')">${t('biscuit')}</button>
                      </div>

                      <div class="variants" style="gap:4px; margin-top:10px;">
                        <div style="width:100%; font-size:0.7rem; color:var(--muted); margin-bottom:2px;">${t('chooseFlavor')}</div>
                        ${FLAVORS.map(f => `
                          <button class="varBtn" data-type="flavor" data-flavor="${f.name}" onclick="selectFlavor(${catIndex}, ${pIdx}, '${f.name}')">${f.name}</button>
                        `).join("")}
                        <button class="varBtn" data-type="flavor" data-flavor="${t('mix')}" onclick="selectFlavor(${catIndex}, ${pIdx}, '${t('mix')}')">${t('mix')}</button>
                      </div>
                    ` : ""}

                    ${isSlush && SLUSH_FLAVORS.length > 0 ? `
                      <div class="variants" style="gap:4px; margin-top:10px;">
                        <div style="width:100%; font-size:0.7rem; color:var(--muted); margin-bottom:2px;">${t('chooseSlushFlavor')}</div>
                        ${SLUSH_FLAVORS.map(f => `
                          <button class="varBtn" data-type="slush-flavor" data-flavor="${f.name}" onclick="selectSlushFlavor(${catIndex}, ${pIdx}, '${f.name}')">${f.name}</button>
                        `).join("")}
                        <button class="varBtn" data-type="slush-flavor" data-flavor="${t('mix')}" onclick="selectSlushFlavor(${catIndex}, ${pIdx}, '${t('mix')}')">${t('mix')}</button>
                      </div>
                    ` : ""}
                  </div>
                  <div class="itemRight">
                    <div class="price" id="price-${catIndex}-${pIdx}">${(isIceCream || isSlush) ? t('choose') : money(activeVariant.price)}</div>
                    <button class="addBtn" id="add-${catIndex}-${pIdx}" 
                      ${(isIceCream || isSlush) ? 'disabled style="opacity:0.5"' : ''}
                      onclick="addFromGroup('${prod.displayName}', ${activeVariant.price}, '${prod.variants[0].variantLabel}')">
                      ${(isIceCream || isSlush) ? t('pleaseChoose') : t('addBtn')}
                    </button>
                  </div>
                </div>
              `;
    }).join("")}
        </div>
      </div>
    `;
  }).join("");
}

window.selectVariant = (catIdx, pIdx, vIdx, price, itemId) => {
  const card = document.getElementById(`prod-${catIdx}-${pIdx}`);
  if (!card) return;

  // تحديث الأزرار (الحجم)
  const sizeBtns = card.querySelectorAll('.varBtn[data-type="size"]');
  sizeBtns.forEach((btn, i) => {
    btn.classList.toggle('active', i === vIdx);
  });

  // تحديث الصورة إذا كانت متوفرة للصنف المختار
  const selectedBtn = sizeBtns[vIdx];
  if (selectedBtn) {
    const vImg = selectedBtn.getAttribute("data-vimg");
    const mainImg = card.getAttribute("data-main-img");
    const imgEl = card.querySelector(".itemImg");
    if (imgEl) {
      const finalImg = vImg || mainImg;
      if (finalImg) imgEl.src = finalImg;
    }
  }

  // إذا لم يكن هناك أزرار محددة النوع (للمنتجات القديمة)
  if (card.querySelectorAll('.varBtn[data-type="size"]').length === 0) {
    card.querySelectorAll('.varBtn').forEach((btn, i) => {
      btn.classList.toggle('active', i === vIdx);
    });
  }

  // تحديث السعر
  const priceEl = document.getElementById(`price-${catIdx}-${pIdx}`);
  if (priceEl) priceEl.innerText = Number(price).toFixed(3) + " د.ب";

  updateIceBtn(catIdx, pIdx);
};

window.selectIcePack = (catIdx, pIdx, pack) => {
  const card = document.getElementById(`prod-${catIdx}-${pIdx}`);
  if (!card) return;

  card.querySelectorAll('.varBtn[data-type="pack"]').forEach(btn => {
    btn.classList.toggle('active', btn.innerText.trim() === pack);
  });

  updateIceBtn(catIdx, pIdx);
};

window.selectFlavor = (catIdx, pIdx, flavor) => {
  const card = document.getElementById(`prod-${catIdx}-${pIdx}`);
  if (!card) return;

  card.querySelectorAll('.varBtn[data-type="flavor"]').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-flavor') === flavor);
  });

  updateIceBtn(catIdx, pIdx);
};

function updateIceBtn(catIdx, pIdx) {
  const card = document.getElementById(`prod-${catIdx}-${pIdx}`);
  if (!card) return;

  const title = card.querySelector('.itemTitle').innerText;
  const isIceCream = title.includes("ايسكريم") || title.includes("أسكريم");
  const isSlush = title.includes("سلاش");
  const addBtn = document.getElementById(`add-${catIdx}-${pIdx}`);

  const sizeBtn = card.querySelector('.varBtn[data-type="size"].active');
  const packBtn = card.querySelector('.varBtn[data-type="pack"].active');
  const flavorBtn = card.querySelector('.varBtn[data-type="flavor"].active');
  const slushFlavorBtn = card.querySelector('.varBtn[data-type="slush-flavor"].active');

  if (isSlush) {
    if (sizeBtn && slushFlavorBtn) {
      const price = parseFloat(document.getElementById(`price-${catIdx}-${pIdx}`).innerText) || 0;
      const label = `${sizeBtn.innerText.trim()} - ${slushFlavorBtn.innerText.trim()}`;
      addBtn.disabled = false;
      addBtn.style.opacity = "1";
      addBtn.innerText = t('addBtn');
      addBtn.onclick = () => addFromGroup(title, price, label);
    } else {
      addBtn.disabled = true;
      addBtn.style.opacity = "0.5";
      addBtn.innerText = t('pleaseChoose');
    }
  } else if (isIceCream) {
    if (sizeBtn && packBtn && flavorBtn) {
      const price = parseFloat(document.getElementById(`price-${catIdx}-${pIdx}`).innerText);
      const label = `${sizeBtn.innerText.trim()} - ${packBtn.innerText.trim()} - ${flavorBtn.innerText.trim()}`;
      addBtn.disabled = false;
      addBtn.style.opacity = "1";
      addBtn.innerText = t('addBtn');
      addBtn.onclick = () => addFromGroup(title, price, label);
    } else {
      addBtn.disabled = true;
      addBtn.style.opacity = "0.5";
      addBtn.innerText = t('pleaseChoose');
    }
  } else {
    const activeSize = card.querySelector('.varBtn.active');
    if (activeSize) {
      const price = parseFloat(document.getElementById(`price-${catIdx}-${pIdx}`).innerText);
      const label = activeSize.innerText.trim();
      addBtn.onclick = () => addFromGroup(title, price, label);
    }
  }
}

window.selectSlushFlavor = (catIdx, pIdx, flavor) => {
  const card = document.getElementById(`prod-${catIdx}-${pIdx}`);
  if (!card) return;
  card.querySelectorAll('.varBtn[data-type="slush-flavor"]').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-flavor') === flavor);
  });
  // If no size variant, set price from the product's first variant
  const priceEl = document.getElementById(`price-${catIdx}-${pIdx}`);
  if (priceEl && priceEl.innerText === t('choose')) {
    // find first available price from the card context
    const sizeBtn = card.querySelector('.varBtn[data-type="size"]');
    if (!sizeBtn) {
      // no size - price is from first variant, look up in MENU
      // It's already set during render, just enable button
    }
  }
  updateIceBtn(catIdx, pIdx);
};

window.addFromGroup = (baseName, price, variantLabel) => {
  const fullName = variantLabel ? `${baseName} (${variantLabel})` : baseName;
  addToCart(fullName, price);
};


// ============== Checkout ==============

async function checkout() {
  if (!CAFE_OPEN) {
    if (hintEl) hintEl.textContent = "الكافيه مغلق حالياً.";
    return;
  }

  if (hintEl) hintEl.textContent = "";

  if (cart.length === 0) {
    if (hintEl) hintEl.textContent = "أضف أصناف أولاً.";
    return;
  }
  if (!nameInput?.value.trim()) {
    if (hintEl) hintEl.textContent = "يرجى كتابة اسمك.";
    nameInput?.focus();
    return;
  }
  if (!phoneOk(phoneInput?.value)) {
    if (hintEl) hintEl.textContent = "يرجى كتابة رقم هاتف صحيح (8 أرقام على الأقل).";
    phoneInput?.focus();
    return;
  }

  const payload = {
    customer_name: nameInput.value.trim(),
    customer_phone: phoneInput.value.trim(),
    car_no: carInput?.value.trim() ? carInput.value.trim() : null,
    note: noteInput?.value.trim() ? noteInput.value.trim() : null,
    vat_rate: 0,
    items: cart.map((x) => ({
      item_name: x.item_name,
      unit_price: x.unit_price,
      qty: x.qty,
    })),
  };

  btnCheckout.disabled = true;
  btnCheckout.textContent = "جاري الإرسال...";

  try {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!data.ok) {
      if (hintEl) hintEl.textContent = (data.errors && data.errors[0]) ? data.errors[0] : "فشل تسجيل الطلب.";
      btnCheckout.disabled = false;
      btnCheckout.textContent = "تأكيد وإرسال الطلب";
      return;
    }

    cart = [];
    renderCartBadge();
    renderCartDrawer();
    closeCheckout();
    toast("تم تسجيل الطلب بنجاح ✅");

    window.location.href = `/success.html?orderId=${data.order_id}`;
  } catch (e) {
    if (hintEl) hintEl.textContent = "تعذر الاتصال بالسيرفر.";
    btnCheckout.disabled = false;
    btnCheckout.textContent = "تأكيد وإرسال الطلب";
  }
}

// ============== Init ==============

async function loadSettings() {
  try {
    const res = await fetch("/api/settings", { cache: "no-store" });
    const data = await res.json();
    CAFE_OPEN = !!data.cafe_open;
  } catch {
    CAFE_OPEN = true;
  }
}

async function loadMenu() {
  try {
    const res = await fetch("/api/menu", { cache: "no-store" });
    const data = await res.json();
    MENU = (data.ok && Array.isArray(data.menu)) ? data.menu : [];
  } catch {
    MENU = [];
  }
}

async function loadFlavors() {
  try {
    const res = await fetch("/api/flavors", { cache: "no-store" });
    const data = await res.json();
    FLAVORS = data.flavors || [];
  } catch {
    FLAVORS = [];
  }
}

async function loadSlushFlavors() {
  try {
    const res = await fetch("/api/slush-flavors", { cache: "no-store" });
    const data = await res.json();
    SLUSH_FLAVORS = data.flavors || [];
  } catch {
    SLUSH_FLAVORS = [];
  }
}

// ============== Real-time Sync (Socket.io) ==============
const socket = typeof io !== 'undefined' ? io() : null;

async function sync() {
  await loadSettings();
  await loadMenu();
  await loadFlavors();
  await loadSlushFlavors();


  const closedEl = document.getElementById("closedMessage");
  const mainContentEl = document.getElementById("mainContent");

  if (!CAFE_OPEN) {
    if (closedEl) closedEl.style.display = "block";
    if (mainContentEl) mainContentEl.style.display = "none";
    if (floatingOrderBtn) floatingOrderBtn.style.display = "none";
  } else {
    if (closedEl) closedEl.style.display = "none";
    if (mainContentEl) mainContentEl.style.display = "block";
    if (floatingOrderBtn) floatingOrderBtn.style.display = "flex";
    renderTabs();
    renderMenu();
  }
  renderCartBadge();
}

if (socket) {
  socket.on("settings_updated", (data) => {
    console.log("Settings updated real-time:", data);
    sync();
  });
  socket.on("menu_updated", () => {
    console.log("Menu updated real-time.");
    sync();
  });
}

async function init() {
  // Language toggle
  const btnLang = document.getElementById('btnLang');
  btnLang?.addEventListener('click', () => {
    currentLang = currentLang === 'ar' ? 'en' : 'ar';
    localStorage.setItem('lang', currentLang);
    applyLang();
  });

  btnOpenCart?.addEventListener("click", openCart);
  btnCloseCart?.addEventListener("click", closeCart);
  btnGoToCheckout?.addEventListener("click", openCheckout);
  btnFloatingCheckout?.addEventListener("click", openCheckout);
  btnCloseCheckout?.addEventListener("click", closeCheckout);

  cartDrawer?.addEventListener("click", (e) => {
    if (e.target === cartDrawer) closeCart();
  });
  checkoutModal?.addEventListener("click", (e) => {
    if (e.target === checkoutModal) closeCheckout();
  });

  btnClearCart?.addEventListener("click", () => {
    cart = [];
    renderCartDrawer();
    renderCartBadge();
    toast("تم تفريغ السلة");
  });

  btnCheckout?.addEventListener("click", checkout);

  // Know Us listeners
  const btnKnowUs = document.getElementById("btnKnowUs");
  const btnCloseInfo = document.getElementById("btnCloseInfo");
  const infoModal = document.getElementById("infoModal");

  btnKnowUs?.addEventListener("click", () => {
    infoModal?.classList.add("show");
  });
  btnCloseInfo?.addEventListener("click", () => {
    infoModal?.classList.remove("show");
  });
  infoModal?.addEventListener("click", (e) => {
    if (e.target === infoModal) infoModal.classList.remove("show");
  });

  if (searchInput) {
    searchInput.addEventListener("input", renderMenu);
  }

  // ===== Real-time Updates (Socket.io) =====
  const socket = typeof io !== 'undefined' ? io() : null;
  if (socket) {
    socket.on("menu_updated", () => {
      console.log("Menu updated from server... syncing.");
      sync();
    });
  }

  // التحميل الأول
  await sync();
}

init();
