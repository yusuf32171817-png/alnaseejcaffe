function checkPass() {
  let pass = sessionStorage.getItem("adminPass");
  if (!pass) {
    pass = prompt("أدخل كلمة المرور لدخول لوحة الإدارة:");
    if (pass === "1212") {
      sessionStorage.setItem("adminPass", "1212");
    } else {
      alert("كلمة مرور خاطئة!");
      window.location.href = "/";
    }
  }
}
checkPass();

async function api(url, opts = {}) {
  const headers = opts.headers || {};
  const pass = sessionStorage.getItem("adminPass");
  if (pass) headers["x-admin-pass"] = pass;
  if (opts.body && !headers["Content-Type"]) headers["Content-Type"] = "application/json";
  return fetch(url, { ...opts, headers });
}

const IMGBB_API_KEY = "37c388a5525cc1f9038fbceb73ce1d54"; // تم وضع مفتاحك الخاص بنجاح ✅

async function uploadImage(file) {
  const formData = new FormData();
  formData.append("image", file);
  
  try {
    const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: "POST",
      body: formData
    });
    const data = await res.json();
    if (data.success) {
      return data.data.url;
    } else {
      console.error("ImgBB Error:", data);
      throw new Error(data.error.message || "Unknown error");
    }
  } catch (e) {
    console.error("Upload error detail:", e);
    toast("فشل رفع الصورة: " + e.message);
    return null;
  }
}

const ordersListEl = document.getElementById("ordersList");
const btnRefresh = document.getElementById("btnRefresh");
const searchEl = document.getElementById("search");
const statusFilter = document.getElementById("statusFilter");
const toastEl = document.getElementById("toast");

const money = (n) => Number(n || 0).toFixed(3) + " د.ب";

function toast(msg) {
  if (!toastEl) return;
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  setTimeout(() => toastEl.classList.remove("show"), 2000);
}

function fmtTime(iso) {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mo} ${hh}:${mm}`;
}

function badge(status) {
  const map = {
    new: ["جديد", "bNew"],
    preparing: ["تحضير", "bPrep"],
    ready: ["جاهز", "bReady"],
    done: ["مكتمل", "bDone"]
  };
  const x = map[status] || ["غير معروف", ""];
  return `<span class="badge ${x[1]}">${x[0]}</span>`;
}

async function fetchOrders() {
  const q = (searchEl?.value || "").trim();
  const st = statusFilter?.value || "all";
  const url = new URL("/api/orders", window.location.origin);
  url.searchParams.set("q", q);
  url.searchParams.set("status", st);
  const res = await fetch(url);
  const data = await res.json();
  return data.orders || [];
}

async function render() {
  const orders = await fetchOrders();
  if (!ordersListEl) return;

  if (orders.length === 0) {
    ordersListEl.innerHTML = `<div class="hint" style="text-align:center; padding:40px;">لا توجد طلبات حالياً…</div>`;
    return;
  }

  ordersListEl.innerHTML = orders.map(o => {
    const itemsHtml = (o.items || []).map(it => `
      <div style="display:flex; justify-content:space-between; padding:4px 0; border-bottom:1px solid rgba(255,255,255,0.05); font-size:0.95rem;">
        <span><b>${it.qty}x</b> ${it.item_name}</span>
        <span>${money(it.line_total)}</span>
      </div>
    `).join("");

    return `
      <div class="card orderCard">
        <div class="orderCardTop">
          <div class="orderTitle">
            <span class="orderTime" style="margin-right:0; font-weight:1000; font-size:1.1rem; color:var(--teal)">${fmtTime(o.created_at)}</span>
          </div>
          <button class="btn btnDel" data-del="${o.id}">حذف</button>
        </div>
        
        <div class="orderGrid">
          <div class="orderInfo">
            <div class="infoRow"><span>الاسم:</span> <b style="color:var(--teal)">${o.customer_name || "—"}</b></div>
            <div class="infoRow"><span>الهاتف:</span> <b>${o.customer_phone}</b></div>
            <div class="infoRow"><span>السيارة:</span> <b>${o.car_no || "—"}</b></div>
            <div class="infoRow"><span>الاستلام:</span> <b>${o.pickup_time}</b></div>
            ${o.note ? `<div class="infoRow" style="color:var(--teal)"><span>ملاحظة:</span> <b>${o.note}</b></div>` : ""}
            <div class="infoRow" style="margin-top:10px; font-size:1.1rem; border-top:1px dashed var(--stroke); padding-top:10px;">
              <span>المجموع:</span> <b style="color:var(--teal)">${money(o.total)}</b>
            </div>
          </div>
          
          <div class="orderItems">
            <div style="font-weight:900; margin-bottom:8px; display:flex; justify-content:space-between; color:var(--muted)">
              <span>الأصناف:</span>
              <span>${badge(o.status)}</span>
            </div>
            ${itemsHtml || `<div class="hint">لا توجد أصناف</div>`}
          </div>
        </div>
        
        <div style="margin-top:15px; text-align:left;">
          <a class="rowBtn" href="/invoice.html?orderId=${o.id}" target="_blank">📄 فـاتـورة</a>
        </div>
      </div>
    `;
  }).join("");

  ordersListEl.querySelectorAll("[data-del]").forEach(b => {
    b.addEventListener("click", () => {
      const id = b.dataset.del;
      if (confirm("هل أنت متأكد من حذف الطلب نهائياً؟")) delOrder(id);
    });
  });
}

async function delOrder(id) {
  try {
    const res = await api(`/api/orders/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!data.ok) { toast("فشل المسح"); return; }
    toast("تم حذف الطلب");
    render();
  } catch (e) { toast("خطأ في الاتصال"); }
}

btnRefresh?.addEventListener("click", render);
searchEl?.addEventListener("input", render);
statusFilter?.addEventListener("change", render);

render();

// ===== Cafe toggle + Menu management =====
const btnCafeToggle = document.getElementById("btnCafeToggle");
const cafeStateHint = document.getElementById("cafeStateHint");

const mCat = document.getElementById("mCat");
const mName = document.getElementById("mName");
const mPrice = document.getElementById("mPrice");
const btnAddItem = document.getElementById("btnAddItem");
const menuAdminHint = document.getElementById("menuAdminHint");
const menuAdminList = document.getElementById("menuAdminList");
const catList = document.getElementById("catList");

let cafeOpen = true;

async function loadCafeState() {
  try {
    const res = await fetch("/api/settings", { cache: "no-store" });
    const data = await res.json();
    cafeOpen = !!data.cafe_open;
    if (btnCafeToggle) {
      btnCafeToggle.textContent = cafeOpen ? "الكافيه مفتوح (اضغط للإغلاق)" : "الكافيه مغلق (اضغط للفتح)";
    }
  } catch (e) { }
}

async function toggleCafe() {
  if (!cafeStateHint) return;
  cafeStateHint.textContent = "";
  try {
    const res = await api("/api/admin/settings", {
      method: "PUT",
      body: JSON.stringify({ cafe_open: !cafeOpen })
    });
    const data = await res.json();
    if (!data.ok) {
      cafeStateHint.textContent = "فشل تغيير الحالة";
      return;
    }
    await loadCafeState();
    cafeStateHint.textContent = "تم ✅";
    setTimeout(() => cafeStateHint.textContent = "", 1500);
  } catch (e) {
    cafeStateHint.textContent = "خطأ في الاتصال";
  }
}

async function loadCategories() {
  if (!catList) return;
  try {
    const res = await api("/api/admin/menu/categories");
    const data = await res.json();
    if (data.ok && data.categories) {
      catList.innerHTML = data.categories.map(c => `<option value="${c}">`).join("");
    }
  } catch (e) { }
}

async function loadMenuAdmin() {
  if (!menuAdminList) return;
  menuAdminList.innerHTML = "جاري التحميل...";
  try {
    const res = await api("/api/admin/menu/items");
    const data = await res.json();
    if (!data.ok) {
      menuAdminList.innerHTML = `<div class="hint">فشل تحميل المنيو</div>`;
      return;
    }
    const items = data.items || [];
    menuAdminList.innerHTML = `
      <div style="display:grid; gap:10px;">
        ${items.map(it => `
          <div class="menuItemCard" style="border:1px solid rgba(255,255,255,.10); border-radius:16px; padding:10px; background: rgba(10,12,15,.35);">
            <div style="display:flex; justify-content:space-between; gap:10px; flex-wrap:wrap; align-items:center;">
              <div style="display:flex; align-items:center; gap:12px;">
                <img src="${it.image_url || 'https://placehold.co/100x100/222/FFF?text=No+Img'}" 
                     style="width:50px; height:50px; border-radius:8px; object-fit:cover; border:1px solid rgba(255,255,255,0.1)"
                     onerror="this.src='https://placehold.co/100x100/222/FFF?text=Error'">
                <div style="font-weight:900;">
                  <span style="color:var(--teal)">${it.tag}</span> / ${it.category}
                </div>
              </div>
              <div style="display:flex; gap:10px; flex-wrap:wrap; align-items:center;">
                <input class="input" style="width:200px; font-weight:bold;" data-name="${it.id}" value="${it.name}" placeholder="اسم المنتج">
                <label style="display:flex; gap:8px; align-items:center;">
                  <input type="checkbox" data-av="${it.id}" ${Number(it.is_active) === 1 ? "checked" : ""}>
                  متوفر
                </label>
                <input class="input" style="width:140px;" data-price="${it.id}" value="${Number(it.price || 0).toFixed(3)}" placeholder="السعر">
                <div style="display:flex; gap:4px; align-items:center;">
                  <input type="hidden" data-img="${it.id}" value="${it.image_url || ""}">
                  <input type="file" id="file-${it.id}" style="display:none;" accept="image/*" data-upload-id="${it.id}">
                  <button class="btn" onclick="document.getElementById('file-${it.id}').click()" style="padding:0 12px; background:rgba(255,255,255,0.05); border-color:var(--stroke); font-size:0.8rem;">📷 تغيير الصورة</button>
                </div>
                <button class="btn btnPrimary" data-save="${it.id}">حفظ</button>
                <button class="btn" style="background:rgba(255,107,107,0.1); border-color:rgba(255,107,107,0.2); color:#ff6b6b;" data-delete="${it.id}">حذف</button>
                <span id="status-${it.id}" style="font-size:0.8rem; color:var(--teal)"></span>
              </div>
            </div>
          </div>
        `).join("")}
      </div>
    `;

    menuAdminList.querySelectorAll("[data-save]").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-save");
        const nameInput = menuAdminList.querySelector(`[data-name="${id}"]`);
        const priceInput = menuAdminList.querySelector(`[data-price="${id}"]`);
        const avInput = menuAdminList.querySelector(`[data-av="${id}"]`);
        const imgInput = menuAdminList.querySelector(`[data-img="${id}"]`);

        const name = nameInput.value.trim();
        const price = Number(priceInput.value);
        const is_active = !!avInput.checked;
        const image_url = imgInput.value.trim() || null;

        const res2 = await api(`/api/admin/menu/items/${id}`, {
          method: "PUT",
          body: JSON.stringify({ name, price, is_active, image_url })
        });
        if (res2.ok) {
          const statusEl = document.getElementById(`status-${id}`);
          if (statusEl) {
            statusEl.textContent = "تم الحفظ ✅";
            setTimeout(() => statusEl.textContent = "", 2000);
          }
        }
      });
    });

    menuAdminList.querySelectorAll("[data-upload-id]").forEach(input => {
      input.addEventListener("change", async (e) => {
        const id = input.getAttribute("data-upload-id");
        const file = e.target.files[0];
        if (!file) return;

        const statusEl = document.getElementById(`status-${id}`);
        if (statusEl) statusEl.textContent = "جاري الرفع... ⏳";

        const url = await uploadImage(file);
        if (url) {
          const imgInput = menuAdminList.querySelector(`[data-img="${id}"]`);
          if (imgInput) imgInput.value = url;
          
          // تحديث الصورة المصغرة فوراً
          const card = input.closest('.menuItemCard'); // البحث عن الحاوية الصحيحة
          const thumb = card.querySelector('img');
          if (thumb) thumb.src = url;

          // حفظ تلقائي في قاعدة البيانات
          const res = await api(`/api/admin/menu/items/${id}`, {
            method: "PUT",
            body: JSON.stringify({ image_url: url })
          });
          
          if (res.ok) {
            if (statusEl) {
              statusEl.textContent = "تم الرفع والحفظ تلقائياً ✅";
              setTimeout(() => statusEl.textContent = "", 3000);
            }
          } else {
            if (statusEl) statusEl.textContent = "تم الرفع ولكن فشل الحفظ في السيرفر ❌";
          }
        } else {
          if (statusEl) statusEl.textContent = "فشل الرفع ❌";
        }
      });
    });

    menuAdminList.querySelectorAll("[data-delete]").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-delete");
        if (!confirm("هل أنت متأكد من حذف هذا الصنف نهائياً؟")) return;
        const res2 = await api(`/api/admin/menu/items/${id}`, { method: "DELETE" });
        if (res2.ok) {
          menuAdminHint.textContent = "تم الحذف بنجاح ✅";
          setTimeout(() => menuAdminHint.textContent = "", 1500);
          loadMenuAdmin();
          loadCategories();
        }
      });
    });
  } catch (e) {
    menuAdminList.innerHTML = `<div class="hint">تعذر الاتصال بالسيرفر.</div>`;
  }
}

async function addMenuItem() {
  menuAdminHint.textContent = "";
  const category = (mCat?.value || "").trim();
  const name = (mName?.value || "").trim();
  const price = Number(mPrice?.value);

  if (!category || !name) {
    menuAdminHint.textContent = "أدخل التصنيف + اسم المنتج";
    return;
  }
  if (!(price > 0)) {
    menuAdminHint.textContent = "أدخل سعر صحيح";
    return;
  }

  const drinksCategories = ["مشروبات", "Drinks", "عصائر", "قهوة", "شاي", "بارد", "حار"];
  const tag = drinksCategories.some(c => category.includes(c)) ? "المشروبات" : "الحلويات";
  const image_url = (document.getElementById("mImg")?.value || "").trim();

  try {
    const res = await api("/api/admin/menu/items", {
      method: "POST",
      body: JSON.stringify({ tag, category, name, price, sort_order: 0, image_url: image_url || null })
    });
    const data = await res.json();
    if (!data.ok) {
      menuAdminHint.textContent = "فشل إضافة المنتج";
      return;
    }

    mName.value = "";
    mPrice.value = "";
    mCat.value = "";
    const mImgInput = document.getElementById("mImg");
    if (mImgInput) mImgInput.value = "";

    menuAdminHint.textContent = "تمت الإضافة ✅";
    setTimeout(() => menuAdminHint.textContent = "", 1500);

    await loadMenuAdmin();
    await loadCategories();
  } catch (e) {
    menuAdminHint.textContent = "خطأ في الاتصال";
  }
}

btnCafeToggle?.addEventListener("click", toggleCafe);
btnAddItem?.addEventListener("click", addMenuItem);

const fileNewItem = document.getElementById("fileNewItem");
if (fileNewItem) {
  fileNewItem.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    menuAdminHint.textContent = "جاري رفع الصورة... ⏳";
    const url = await uploadImage(file);
    if (url) {
      const mImgInput = document.getElementById("mImg");
      if (mImgInput) mImgInput.value = url;
      menuAdminHint.textContent = "تم الرفع ✅ يمكنك الإضافة الآن";
    } else {
      menuAdminHint.textContent = "فشل رفع الصورة ❌";
    }
  });
}

// === إدارة النكهات (مبسطة لنكهتين) ===
const flavor1Input = document.getElementById("flavor1");
const flavor2Input = document.getElementById("flavor2");
const btnSaveFlavors = document.getElementById("btnSaveFlavors");
const flavorStatus = document.getElementById("flavorStatus");

async function loadFlavorsAdmin() {
  const res = await api("/api/admin/flavors");
  const data = await res.json();
  const flavors = data.flavors || [];
  if (flavor1Input) flavor1Input.value = flavors[0] ? flavors[0].name : "";
  if (flavor2Input) flavor2Input.value = flavors[1] ? flavors[1].name : "";
}

btnSaveFlavors?.addEventListener("click", async () => {
  const f1 = flavor1Input.value.trim();
  const f2 = flavor2Input.value.trim();
  
  flavorStatus.textContent = "جاري الحفظ... ⏳";
  
  try {
    const res = await api("/api/admin/flavors/set", {
      method: "POST",
      body: JSON.stringify({ flavors: [f1, f2] })
    });
    
    if (res.ok) {
      flavorStatus.textContent = "تم حفظ النكهات ✅";
      setTimeout(() => flavorStatus.textContent = "", 2000);
      loadFlavorsAdmin();
    } else {
      const data = await res.json().catch(() => ({}));
      flavorStatus.textContent = "فشل الحفظ: " + (data.error || res.statusText || "خطأ غير معروف") + " ❌";
    }
  } catch (e) {
    console.error("Save flavors error:", e);
    flavorStatus.textContent = "خطأ في الاتصال ❌";
  }
});

if (btnCafeToggle && menuAdminList) {
  loadCafeState();
  loadMenuAdmin();
  loadCategories();
  loadFlavorsAdmin();
}

// ===== Real-time Updates (Socket.io) =====
const socket = typeof io !== 'undefined' ? io() : null;
const orderSound = document.getElementById("orderSound");
const btnTestSound = document.getElementById("btnTestSound");
const orderPopup = document.getElementById("orderPopup");
const btnStopSound = document.getElementById("btnStopSound");

let soundTimer = null;

function playOrderSound() {
  if (orderSound) {
    // محاكاة "الضغطة" الأولى برمجياً عند وصول الطلب
    // نحاول تشغيل الصوت مرتين: مرة سريعة جداً لفك القفل، والثانية هي الصوت الفعلي
    orderSound.volume = 0.1;
    orderSound.play().then(() => {
      // إذا نجح التشغيل (يعني المتصفح سمح)، نرفع الصوت ونبدأ من البداية
      orderSound.pause();
      orderSound.currentTime = 0;
      orderSound.volume = 1.0;

      // التشغيل الفعلي
      setTimeout(() => {
        orderSound.play().catch(err => console.error("Final play failed:", err));
      }, 50);

      if (soundTimer) clearTimeout(soundTimer);
      soundTimer = setTimeout(() => {
        stopOrderSound();
      }, 20000);
    }).catch(e => {
      // إذا كان المتصفح لا يزال يعترض (نادراً بعد الضغط على الدخول)
      console.warn("Autoplay still blocked, attempting silent prime...");
      toast("وصل طلب جديد! يرجى التفاعل مع الصفحة لسماع التنبيه 🔔");
    });
  }
}

const btnStartDashboard = document.getElementById("btnStartDashboard");
const audioOverlay = document.getElementById("audioOverlay");

if (btnStartDashboard) {
  btnStartDashboard.addEventListener("click", () => {
    if (orderSound) {
      // تشغيل الصوت لأجزاء من الثانية لفك القفل
      orderSound.volume = 0.5;
      orderSound.play().then(() => {
        // إيقاف فوري بعد 100 ملي ثانية
        setTimeout(() => {
          orderSound.pause();
          orderSound.currentTime = 0;
          console.log("Audio unlocked via Start Button ✅");
          if (audioOverlay) audioOverlay.style.display = "none";
          toast("تم تفعيل جرس التنبيهات بنجاح 🔔");
        }, 150);
      }).catch(e => {
        console.error("Start Audio Error:", e);
        if (audioOverlay) audioOverlay.style.display = "none";
      });
    } else {
      if (audioOverlay) audioOverlay.style.display = "none";
    }
  });
}

// حل إضافي احتياطي لأي ضغطة في الصفحة
function primeAudio() {
  if (orderSound) {
    orderSound.play().then(() => {
      orderSound.pause();
      orderSound.currentTime = 0;
      document.removeEventListener("click", primeAudio);
      document.removeEventListener("touchstart", primeAudio);
    }).catch(() => { });
  }
}
document.addEventListener("click", primeAudio);
document.addEventListener("touchstart", primeAudio);

function stopOrderSound() {
  if (orderSound) {
    orderSound.pause();
    orderSound.currentTime = 0;
  }
  if (soundTimer) clearTimeout(soundTimer);
  orderPopup?.classList.remove("show");
}

if (btnStopSound) btnStopSound.addEventListener("click", stopOrderSound);
if (btnTestSound) {
  btnTestSound.addEventListener("click", () => {
    toast("جاري تجربة الجرس... 🔔");
    playOrderSound();
    orderPopup?.classList.add("show");
  });
}

if (socket) {
  socket.on("new_order", () => {
    render();
    playOrderSound();
    orderPopup?.classList.add("show");
    toast("وصل طلب جديد! 🔔");
  });
  socket.on("order_arrived", (data) => {
    playOrderSound();
    toast(`الزبون ${data.order.customer_name || ''} وصل للمحل! 🚗🔔`);
    
    // إظهار بوب أب مخصص
    const p = document.getElementById("arrivedPopup");
    const detailsDiv = document.getElementById("arrivedDetails");
    if (p && detailsDiv) {
      let itemsHtml = data.items.map(it => `<div>- ${it.qty}x <b>${it.item_name}</b> (${money(it.unit_price)})</div>`).join("");
      
      detailsDiv.innerHTML = `
        <div style="font-size: 1.1rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom:8px; margin-bottom:8px;">
          <b>رقم الطلب:</b> <span style="color:var(--teal)">#${data.order.order_no}</span>
        </div>
        <div><b>اسم الزبون:</b> ${data.order.customer_name}</div>
        <div><b>رقم الهاتف:</b> ${data.order.customer_phone}</div>
        ${data.order.car_no ? `<div><b>رقم السيارة:</b> ${data.order.car_no}</div>` : ''}
        ${data.order.note ? `<div><b>ملاحظة:</b> <span style="color:#ffb86c">${data.order.note}</span></div>` : ''}
        <div style="margin-top:10px; border-top: 1px dashed rgba(255,255,255,0.1); padding-top:8px;">
          <b>الأصناف المطلوبة:</b>
          <div style="margin-top:5px; padding-right:10px;">${itemsHtml}</div>
        </div>
        <div style="margin-top:10px; font-size:1.1rem; text-align:left; font-weight:bold; color:var(--teal)">
          المجموع الكلي: ${money(data.order.total)}
        </div>
      `;
      p.classList.add("show");
    }
  });
}

function stopOrderSound() {
  if (orderSound) {
    orderSound.pause();
    orderSound.currentTime = 0;
  }
  if (soundTimer) clearTimeout(soundTimer);
  orderPopup?.classList.remove("show");
  document.getElementById("arrivedPopup")?.classList.remove("show");
}

if (btnStopSound) btnStopSound.addEventListener("click", stopOrderSound);
const btnStopArrivedSound = document.getElementById("btnStopArrivedSound");
if (btnStopArrivedSound) btnStopArrivedSound.addEventListener("click", stopOrderSound);

// ===== SPA Tabs Logic =====
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
    
    tab.classList.add('active');
    const target = document.getElementById(tab.getAttribute('data-target'));
    if (target) {
      target.style.display = 'block';
    }
    
    if (tab.getAttribute('data-target') === 'tab-accounting') {
      if (typeof loadAccountingData === 'function') loadAccountingData('all');
    }
  });
});

let accountingChart = null;

// Initial values for filters
const todayDate = new Date();
const currentMonth = String(todayDate.getMonth() + 1).padStart(2, '0');
const currentYear = todayDate.getFullYear();

// Ledger Filter Initial Value
const ledgerFilterMonthSelect = document.getElementById("ledgerFilterMonthSelect");
if (ledgerFilterMonthSelect) ledgerFilterMonthSelect.value = currentMonth;
const ledgerFilterYearInput = document.getElementById("ledgerFilterYearInput");
if (ledgerFilterYearInput) ledgerFilterYearInput.value = currentYear;

// Chart Filter Initial Value
const chartFilterMonthSelect = document.getElementById("chartFilterMonthSelect");
if (chartFilterMonthSelect) chartFilterMonthSelect.value = currentMonth;
const chartFilterYearInput = document.getElementById("chartFilterYearInput");
if (chartFilterYearInput) chartFilterYearInput.value = currentYear;

// Toggle selector visibility for Chart
document.getElementById("chartFilterMode")?.addEventListener("change", (e) => {
  const mode = e.target.value;
  const monthGroup = document.getElementById("chartMonthGroup");
  if (mode === "monthly") {
    if (monthGroup) monthGroup.style.display = "flex";
  } else {
    if (monthGroup) monthGroup.style.display = "none";
  }
});

// Event Listeners for Apply Buttons
document.getElementById("btnApplyLedgerFilter")?.addEventListener("click", () => { loadAccountingData('ledger'); });
document.getElementById("btnApplyChartFilter")?.addEventListener("click", () => { loadAccountingData('chart'); });

// ===== Accounting Logic =====
async function loadAccountingData(type = 'all') {
  try {
    if (type === 'all' || type === 'ledger') {
      const month = document.getElementById("ledgerFilterMonthSelect")?.value || "01";
      const year = document.getElementById("ledgerFilterYearInput")?.value || "2026";
      const target = `${year}-${month}`;
      const res = await api(`/api/admin/accounting?view=monthly&target=${target}`);
      const data = await res.json();
      if (data.ok) {
        // Render period KPIs based on ledger
        document.getElementById("rangeOrderIncome").textContent = money(data.rangeStats.order_income);
        document.getElementById("rangeExternalIncome").textContent = money(data.rangeStats.external_income);
        document.getElementById("rangeExpense").textContent = money(data.rangeStats.expense);
        document.getElementById("rangeNet").textContent = money(data.rangeStats.net);
        
        // Render Ledger Table
        const tbody = document.getElementById("ledgerTableBody");
        if (tbody && data.ledger) {
          tbody.innerHTML = data.ledger.map(row => {
            const color = row.net >= 0 ? 'var(--teal)' : '#ff6b6b';
            return `
              <tr style="border-bottom:1px solid rgba(255,255,255,0.05); font-weight: 500;">
                <td style="padding:12px 10px;">${row.dayName}</td>
                <td style="padding:12px 10px;">${row.date}</td>
                <td style="padding:12px 10px; text-align:center;"><b>${row.order_count}</b></td>
                <td style="padding:12px 10px; color:var(--teal)">${money(row.order_income)}</td>
                <td style="padding:12px 10px; color:#ffb86c">${money(row.external_income)}</td>
                <td style="padding:12px 10px; color:#ff6b6b">${money(row.expense)}</td>
                <td style="padding:12px 10px; font-weight:bold; color:${color};" dir="ltr">${money(row.net)}</td>
              </tr>
            `;
          }).join("");
        }
      }
    }
    
    if (type === 'all' || type === 'chart') {
      const view = document.getElementById("chartFilterMode")?.value || "monthly";
      const month = document.getElementById("chartFilterMonthSelect")?.value || "01";
      const year = document.getElementById("chartFilterYearInput")?.value || "2026";
      const target = view === "monthly" ? `${year}-${month}` : year;
      
      const res = await api(`/api/admin/accounting?view=${view}&target=${target}`);
      const data = await res.json();
      if (data.ok) {
        // Render Chart
        renderChart(data.chartData);
      }
    }
  } catch (e) {
    console.error(e);
  }
}

// Ensure old calls to loadAccounting work by pointing to the new function
window.loadAccounting = () => loadAccountingData('all');

function renderChart(chartData) {
  const ctx = document.getElementById("accountingChart")?.getContext("2d");
  if (!ctx) return;

  if (accountingChart) {
    accountingChart.destroy();
  }

  const labels = chartData.map(row => {
    // Return just day number or month name
    const parts = row.date.split("-");
    return parts.length === 3 ? parts[2] : row.dayName;
  });
  
  const dataNet = chartData.map(row => row.net);
  const dataIncome = chartData.map(row => row.order_income + row.external_income);
  const dataExpense = chartData.map(row => row.expense);

  accountingChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "صافي الأرباح",
          data: dataNet,
          borderColor: "#2DB39F",
          backgroundColor: "rgba(45, 179, 159, 0.1)",
          fill: true,
          tension: 0.3,
          borderWidth: 3
        },
        {
          label: "إجمالي الإيرادات",
          data: dataIncome,
          borderColor: "#eef2f6",
          borderDash: [5, 5],
          tension: 0.3,
          borderWidth: 1.5
        },
        {
          label: "المصروفات",
          data: dataExpense,
          borderColor: "#ff6b6b",
          borderDash: [3, 3],
          tension: 0.3,
          borderWidth: 1.5
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          grid: { color: "rgba(255,255,255,0.05)" },
          ticks: { color: "#a6b0bb" }
        },
        x: {
          grid: { color: "rgba(255,255,255,0.05)" },
          ticks: { color: "#a6b0bb" }
        }
      },
      plugins: {
        legend: {
          labels: { color: "#eef2f6", font: { weight: "bold" } }
        }
      }
    }
  });
}

// ===== Save adjustment helper =====
async function saveAdjustment(date, amount, note, hintEl, amountInput, noteInput) {
  if (!date || !amount) {
    hintEl.textContent = "الرجاء تحديد التاريخ والمبلغ";
    return;
  }
  
  hintEl.textContent = "جاري الحفظ...";
  try {
    const res = await api("/api/admin/accounting/adjust", {
      method: "POST",
      body: JSON.stringify({ date, amount: Number(amount), note })
    });
    const data = await res.json();
    if (data.ok) {
      hintEl.textContent = "تم الحفظ بنجاح ✅";
      amountInput.value = "";
      if (noteInput) noteInput.value = "";
      setTimeout(() => hintEl.textContent = "", 2000);
      loadAccounting();
    } else {
      hintEl.textContent = "فشل الحفظ ❌";
    }
  } catch (e) {
    hintEl.textContent = "خطأ في الاتصال";
  }
}

document.getElementById("btnSaveIncome")?.addEventListener("click", () => {
  const date = document.getElementById("incDate").value;
  const amount = document.getElementById("incAmount").value;
  const note = document.getElementById("incNote").value;
  const hint = document.getElementById("incHint");
  
  saveAdjustment(date, Number(amount), note, hint, document.getElementById("incAmount"), document.getElementById("incNote"));
});

document.getElementById("btnSaveExpense")?.addEventListener("click", () => {
  const date = document.getElementById("expDate").value;
  const amount = document.getElementById("expAmount").value;
  const note = document.getElementById("expNote").value;
  const hint = document.getElementById("expHint");
  
  // Expenses are saved as negative values in DB
  saveAdjustment(date, -Number(amount), note, hint, document.getElementById("expAmount"), document.getElementById("expNote"));
});

// ===== Manual Order Logic =====
const manualOrderModal = document.getElementById("manualOrderModal");
const btnOpenManualOrder = document.getElementById("btnOpenManualOrder");
const moCloseBtn = document.getElementById("moCloseBtn");
const moItemSelect = document.getElementById("moItemSelect");
const moQty = document.getElementById("moQty");
const moAddItemBtn = document.getElementById("moAddItemBtn");
const moItemsList = document.getElementById("moItemsList");
const moTotal = document.getElementById("moTotal");
const moSubmitBtn = document.getElementById("moSubmitBtn");
const moCustomerName = document.getElementById("moCustomerName");

let manualOrderItems = [];
let availableMenu = [];

async function loadMenuForManualOrder() {
  try {
    const res = await api("/api/menu");
    const data = await res.json();
    if (data.ok && data.menu) {
      availableMenu = [];
      moItemSelect.innerHTML = "<option value=''>اختر الصنف...</option>";
      data.menu.forEach(cat => {
        const optgroup = document.createElement("optgroup");
        optgroup.label = cat.name;
        cat.items.forEach(it => {
          availableMenu.push(it);
          const opt = document.createElement("option");
          opt.value = it.id;
          opt.textContent = `${it.name} - ${money(it.price)}`;
          optgroup.appendChild(opt);
        });
        moItemSelect.appendChild(optgroup);
      });
    }
  } catch(e) {}
}

function renderManualOrderItems() {
  moItemsList.innerHTML = "";
  let t = 0;
  manualOrderItems.forEach((it, idx) => {
    const lineTotal = it.price * it.qty;
    t += lineTotal;
    moItemsList.innerHTML += `
      <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.05); padding:8px 12px; border-radius:8px;">
        <div><b>${it.qty}x</b> ${it.name}</div>
        <div style="display:flex; gap:10px; align-items:center;">
          <span style="color:var(--teal)">${money(lineTotal)}</span>
          <button class="btn" style="padding:4px 8px; font-size:0.8rem; background:rgba(255,80,80,0.1); color:#ff6b6b; border:none;" onclick="removeManualItem(${idx})">حذف</button>
        </div>
      </div>
    `;
  });
  moTotal.textContent = Number(t).toFixed(3);
}

window.removeManualItem = function(idx) {
  manualOrderItems.splice(idx, 1);
  renderManualOrderItems();
};

btnOpenManualOrder?.addEventListener("click", () => {
  manualOrderModal.classList.add("show");
  manualOrderItems = [];
  moCustomerName.value = "";
  renderManualOrderItems();
  loadMenuForManualOrder();
});

moCloseBtn?.addEventListener("click", () => {
  manualOrderModal.classList.remove("show");
});

moAddItemBtn?.addEventListener("click", () => {
  const id = moItemSelect.value;
  const qty = parseInt(moQty.value) || 1;
  if (!id || qty < 1) return;
  
  const menuItem = availableMenu.find(x => x.id == id);
  if (!menuItem) return;
  
  // check if exists
  const existing = manualOrderItems.find(x => x.id == id);
  if (existing) {
    existing.qty += qty;
  } else {
    manualOrderItems.push({ id: menuItem.id, name: menuItem.name, price: menuItem.price, qty });
  }
  moQty.value = 1;
  moItemSelect.value = "";
  renderManualOrderItems();
});

moSubmitBtn?.addEventListener("click", async () => {
  if (manualOrderItems.length === 0) {
    toast("لم يتم إضافة أي أصناف");
    return;
  }
  
  const payload = {
    customer_name: moCustomerName.value.trim(),
    items: manualOrderItems.map(it => ({
      item_name: it.name,
      unit_price: it.price,
      qty: it.qty
    }))
  };
  
  moSubmitBtn.disabled = true;
  moSubmitBtn.textContent = "جاري الحفظ...";
  
  try {
    const res = await api("/api/admin/orders", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.ok) {
      toast("تم حفظ الطلب بنجاح ✅");
      manualOrderModal.classList.remove("show");
      render(); // refresh orders list
      loadAccounting(); // if we are on accounting page
    } else {
      toast("فشل حفظ الطلب ❌");
    }
  } catch (e) {
    toast("خطأ في الاتصال");
  } finally {
    moSubmitBtn.disabled = false;
    moSubmitBtn.textContent = "إتمام وحفظ الطلب ✅";
  }
});
