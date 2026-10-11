const products = [
  { id: "pace-short", name: "Short Pace", sport: "Corrida", gender: "Feminino", price: 159, oldPrice: 189, label: "MAIS VENDIDO", description: "Leveza para ganhar quilometragem. Tecido respirável com bolso lateral e cós firme para manter tudo no lugar.", colors: ["#263e31", "#d96b50", "#1e2727"], image: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=900&q=82", stock: { P: 4, M: 8, G: 0, GG: 2 } },
  { id: "flow-set", name: "Conjunto Flow", sport: "Yoga", gender: "Feminino", price: 289, oldPrice: null, label: "NOVO", description: "Sustentação confortável e toque macio. Um conjunto versátil que acompanha alongamentos, treinos leves e o dia inteiro.", colors: ["#d88c74", "#303e35", "#918b99"], image: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&w=900&q=82", stock: { P: 3, M: 4, G: 1, GG: 0 } },
  { id: "pulse-top", name: "Top Pulse", sport: "Treino", gender: "Feminino", price: 139, oldPrice: null, label: "SUPORTE MÉDIO", description: "Modelagem anatômica, alças estáveis e tecido de secagem rápida. Suporte médio para treinos cheios de energia.", colors: ["#1d2a27", "#c7745f", "#d5caac"], image: "https://images.unsplash.com/photo-1546483875-ad9014c88eba?auto=format&fit=crop&w=900&q=82", stock: { P: 2, M: 5, G: 3, GG: 1 } },
  { id: "terra-legging", name: "Legging Terra", sport: "Treino", gender: "Feminino", price: 229, oldPrice: 259, label: "TECIDO FLEX", description: "Elasticidade em quatro direções e cintura alta para movimentos sem distração. Cobertura confortável do aquecimento ao relaxamento.", colors: ["#596552", "#202c29", "#a66f5f"], image: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=900&q=82", stock: { P: 1, M: 6, G: 2, GG: 0 } },
  { id: "aero-tee", name: "Camiseta Aero", sport: "Corrida", gender: "Masculino", price: 119, oldPrice: null, label: "LEVEZA", description: "Malha leve com ventilação estratégica. Corte pensado para correr com liberdade, na cidade ou na trilha.", colors: ["#d2dfd3", "#273832", "#cf7155"], image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=82", stock: { P: 3, M: 7, G: 5, GG: 2 } },
  { id: "street-jacket", name: "Jaqueta Street", sport: "Lifestyle", gender: "Unissex", price: 319, oldPrice: null, label: "EDIÇÃO LIMITADA", description: "Camada leve para antes e depois do treino. Bolsos funcionais, acabamento resistente e silhueta urbana.", colors: ["#293a32", "#c5bba5"], image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=82", stock: { P: 0, M: 2, G: 1, GG: 1 } },
  { id: "stride-tight", name: "Calça Stride", sport: "Corrida", gender: "Masculino", price: 199, oldPrice: null, label: "BOLSO SEGURO", description: "Ajuste firme e bolso traseiro com zíper para seus itens essenciais. Conforto para a corrida e para a recuperação.", colors: ["#242c29", "#5b6a5b"], image: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=900&q=82", stock: { P: 1, M: 4, G: 3, GG: 0 } },
  { id: "core-tank", name: "Regata Core", sport: "Treino", gender: "Masculino", price: 99, oldPrice: null, label: "ESSENCIAL", description: "Uma peça essencial com caimento solto e tecido de toque fresco. Feita para treinos de alta intensidade.", colors: ["#e1d9c5", "#293b31", "#c96b51"], image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=900&q=82", stock: { P: 5, M: 6, G: 4, GG: 3 } }
];

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const productGrid = document.querySelector("#productGrid");
const searchInput = document.querySelector("#searchInput");
const sortSelect = document.querySelector("#sortSelect");
const cart = JSON.parse(localStorage.getItem("vectra-cart") || "[]");
const defaultInventory = Object.fromEntries(products.map((product) => [product.id, { ...product.stock }]));
const inventory = JSON.parse(localStorage.getItem("vectra-inventory") || "null") || defaultInventory;
let activeSport = "Todos";
let appliedCoupon = false;
let toastTimeout;
let postalCodeLookupController;

function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => toast.classList.remove("show"), 2500);
}

function renderProducts() {
  const search = searchInput.value.trim().toLocaleLowerCase("pt-BR");
  let visibleProducts = products.filter((product) => {
    const matchesSport = activeSport === "Todos" || product.sport === activeSport;
    const matchesSearch = `${product.name} ${product.sport} ${product.gender} ${product.description}`.toLocaleLowerCase("pt-BR").includes(search);
    return matchesSport && matchesSearch;
  });
  if (sortSelect.value === "price-asc") visibleProducts = [...visibleProducts].sort((left, right) => left.price - right.price);
  if (sortSelect.value === "price-desc") visibleProducts = [...visibleProducts].sort((left, right) => right.price - left.price);

  productGrid.innerHTML = visibleProducts.map((product, index) => `
    <article class="product-card" style="animation-delay:${Math.min(index * 55, 220)}ms">
      <div class="product-photo">
        <img src="${product.image}" alt="${product.name} Vectra Sport" loading="lazy" />
        <span class="product-label">${product.label}</span>
        <button class="product-quick" data-product="${product.id}">Ver tamanhos e detalhes</button>
      </div>
      <div class="product-meta"><span>${product.name}</span><span aria-label="Avaliação 4,8 de 5">★ 4,8</span></div>
      <p class="product-category">${product.sport} / ${product.gender}</p>
      <p class="product-price">${currency.format(product.price)}${product.oldPrice ? `<del>${currency.format(product.oldPrice)}</del>` : ""}</p>
      <div class="swatches" aria-label="Cores disponíveis">${product.colors.map((color) => `<span class="swatch" style="background:${color}" title="Cor disponível"></span>`).join("")}</div>
    </article>`).join("");
  document.querySelector("#resultCount").textContent = `${visibleProducts.length} ${visibleProducts.length === 1 ? "peça" : "peças"}`;
  document.querySelector("#emptyState").hidden = visibleProducts.length > 0;
}

function setSport(sport) {
  activeSport = sport;
  document.querySelectorAll("[data-filter]").forEach((button) => button.classList.toggle("active", button.dataset.filter === sport));
  renderProducts();
}

function openProduct(productId) {
  const product = products.find((item) => item.id === productId);
  const detail = document.querySelector("#productDetail");
  const sizes = Object.keys(product.stock);
  detail.innerHTML = `
    <img src="${product.image}" alt="${product.name}" />
    <div class="product-detail-copy">
      <p class="eyebrow">${product.label}</p><h2>${product.name}</h2><p class="detail-category">${product.sport} / ${product.gender}</p>
      <p class="detail-price">${currency.format(product.price)}</p><p class="description">${product.description}</p>
      <p class="size-label">ESCOLHA SEU TAMANHO</p><div class="size-options">${sizes.map((size) => `<button class="size-option" data-size="${size}" ${inventory[product.id][size] < 1 ? "disabled aria-label=\"Tamanho " + size + " esgotado\"" : ""}>${size}</button>`).join("")}</div>
      <p class="stock-note" aria-live="polite">Selecione uma variação para consultar disponibilidade.</p>
      <button class="button button-dark detail-add" data-add-product="${product.id}" disabled>Adicionar à sacola <span>→</span></button>
    </div>`;
  detail.dataset.product = productId;
  detail.dataset.size = "";
  document.querySelector("#productDialog").showModal();
}

function persistCart() {
  localStorage.setItem("vectra-cart", JSON.stringify(cart));
  renderCart();
}

function addToCart(productId, size) {
  const product = products.find((item) => item.id === productId);
  const existing = cart.find((item) => item.productId === productId && item.size === size);
  const quantity = existing ? existing.quantity : 0;
  if (quantity >= inventory[productId][size]) {
    showToast("Quantidade máxima disponível no protótipo.");
    return;
  }
  if (existing) existing.quantity += 1;
  else cart.push({ productId, size, quantity: 1 });
  persistCart();
  showToast(`${product.name} (${size}) adicionado à sacola.`);
  document.querySelector("#productDialog").close();
}

function renderCart() {
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelector("#cartCount").textContent = itemCount;
  document.querySelector("#drawerCount").textContent = `(${itemCount})`;
  const cartItems = document.querySelector("#cartItems");
  if (!cart.length) {
    cartItems.innerHTML = '<p class="cart-empty">Sua sacola ainda está vazia.</p>';
  } else {
    cartItems.innerHTML = cart.map((item, index) => {
      const product = products.find((entry) => entry.id === item.productId);
      return `<article class="cart-line"><img src="${product.image}" alt="" /><div><h3>${product.name}</h3><p>Tamanho ${item.size}</p><div class="quantity-control"><button data-cart-index="${index}" data-delta="-1" aria-label="Diminuir quantidade">−</button><span>${item.quantity}</span><button data-cart-index="${index}" data-delta="1" aria-label="Aumentar quantidade">+</button></div><button class="remove-line" data-remove-index="${index}">Remover</button></div><strong>${currency.format(product.price * item.quantity)}</strong></article>`;
    }).join("");
  }
  const subtotal = cart.reduce((sum, item) => sum + products.find((product) => product.id === item.productId).price * item.quantity, 0);
  const total = appliedCoupon ? subtotal * .9 : subtotal;
  document.querySelector("#cartSubtotal").textContent = currency.format(total);
  document.querySelector("#checkoutButton").disabled = itemCount === 0;
}

function toggleCart(open) {
  document.querySelector("#cartDrawer").classList.toggle("open", open);
  document.querySelector("#scrim").classList.toggle("open", open);
  document.querySelector("#cartDrawer").setAttribute("aria-hidden", String(!open));
  document.body.style.overflow = open ? "hidden" : "";
}

function renderInventory() {
  const rows = document.querySelector("#inventoryRows");
  let critical = 0;
  rows.innerHTML = products.map((product) => {
    const stock = inventory[product.id];
    const available = Object.values(stock).reduce((sum, count) => sum + count, 0);
    const low = available < 5;
    if (low) critical += 1;
    const variation = Object.entries(stock).map(([size, count]) => `${size}: ${count}`).join(" / ");
    return `<tr><td>${product.name}</td><td>${product.sport}</td><td>${variation}</td><td>${available} un.</td><td><span class="stock-level"><i class="stock-dot ${low ? "low" : ""}"></i>${low ? "Repor" : "Disponível"}</span></td></tr>`;
  }).join("");
  document.querySelector("#criticalCount").textContent = critical;
}

function openCheckout() {
  const total = document.querySelector("#cartSubtotal").textContent;
  document.querySelector("#checkoutContent").innerHTML = `
    <p class="eyebrow">ENTREGA / PAGAMENTO SEGURO</p><h2>Quase lá.</h2><p class="checkout-intro">Informe a entrega. Pix, cartão ou boleto serão escolhidos no ambiente seguro do Mercado Pago.</p>
    <div class="checkout-summary"><span>${cart.reduce((sum, item) => sum + item.quantity, 0)} item(ns) / produtos</span><strong>${total}</strong></div>
    <form class="checkout-form" id="checkoutForm">
      <label>Nome<input name="firstName" autocomplete="given-name" maxlength="80" required /></label><label>Sobrenome<input name="lastName" autocomplete="family-name" maxlength="80" required /></label>
      <label class="span-2">E-mail<input name="email" type="email" autocomplete="email" required /></label>
      <label>CEP<input name="postalCode" inputmode="numeric" autocomplete="postal-code" pattern="[0-9]{5}-?[0-9]{3}" maxlength="9" placeholder="00000-000" required /></label><label>Estado (UF)<input name="state" autocomplete="address-level1" pattern="[A-Za-z]{2}" maxlength="2" required /></label>
      <p class="address-lookup-status span-2" id="addressLookupStatus" role="status" aria-live="polite">Ao sair do campo CEP, consultaremos a API ViaCEP para preencher rua, cidade e UF.</p>
      <label class="span-2">Rua / avenida<input name="street" autocomplete="address-line1" maxlength="120" required /></label>
      <label>Número<input name="number" inputmode="numeric" autocomplete="address-line2" pattern="[0-9]{1,8}" required /></label><label>Cidade<input name="city" autocomplete="address-level2" maxlength="80" required /></label>
      <p class="prototype-note span-2">O frete configurado será apresentado no checkout antes do pagamento. A confirmação do pedido depende da verificação do pagamento no servidor.</p>
      <p class="payment-error span-2" id="paymentError" role="alert" hidden></p>
      <button class="button button-dark" type="submit">Ir para pagamento seguro <span>→</span></button>
    </form>`;
  toggleCart(false);
  document.querySelector("#checkoutDialog").showModal();
}

productGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-product]");
  if (button) openProduct(button.dataset.product);
});
document.querySelectorAll("[data-filter]").forEach((button) => button.addEventListener("click", () => {
  setSport(button.dataset.filter);
  document.querySelector("#colecao").scrollIntoView({ behavior: "smooth" });
}));
searchInput.addEventListener("input", renderProducts);
sortSelect.addEventListener("change", renderProducts);
document.querySelector("#cartButton").addEventListener("click", () => toggleCart(true));
document.querySelector("#closeCart").addEventListener("click", () => toggleCart(false));
document.querySelector("#scrim").addEventListener("click", () => toggleCart(false));
document.querySelector("#cartItems").addEventListener("click", (event) => {
  const quantityButton = event.target.closest("[data-cart-index]");
  const removeButton = event.target.closest("[data-remove-index]");
  if (removeButton) cart.splice(Number(removeButton.dataset.removeIndex), 1);
  if (quantityButton) {
    const item = cart[Number(quantityButton.dataset.cartIndex)];
    const nextQuantity = item.quantity + Number(quantityButton.dataset.delta);
    if (nextQuantity < 1) cart.splice(Number(quantityButton.dataset.cartIndex), 1);
    else if (nextQuantity <= inventory[item.productId][item.size]) item.quantity = nextQuantity;
    else showToast("Estoque demonstrativo insuficiente para essa quantidade.");
  }
  persistCart();
});
document.querySelector("#productDetail").addEventListener("click", (event) => {
  const sizeButton = event.target.closest("[data-size]");
  const addButton = event.target.closest("[data-add-product]");
  const detail = document.querySelector("#productDetail");
  if (sizeButton && !sizeButton.disabled) {
    detail.querySelectorAll("[data-size]").forEach((button) => button.classList.toggle("selected", button === sizeButton));
    detail.dataset.size = sizeButton.dataset.size;
    const available = inventory[detail.dataset.product][detail.dataset.size];
    detail.querySelector(".stock-note").textContent = available < 3 ? `Restam ${available} unidade(s) neste tamanho.` : "Tamanho disponível para envio.";
    detail.querySelector("[data-add-product]").disabled = false;
  }
  if (addButton && detail.dataset.size) addToCart(addButton.dataset.addProduct, detail.dataset.size);
});
document.querySelector("#applyCoupon").addEventListener("click", () => {
  const code = document.querySelector("#couponInput").value.trim().toUpperCase();
  appliedCoupon = code === "VECTRA10";
  document.querySelector("#couponMessage").textContent = appliedCoupon ? "Cupom aplicado: 10% de desconto." : "Cupom não reconhecido no protótipo.";
  renderCart();
});
document.querySelector("#checkoutButton").addEventListener("click", openCheckout);
document.querySelector("#checkoutContent").addEventListener("input", (event) => {
  if (event.target.name !== "postalCode") return;
  const form = event.target.form;
  const postalCode = event.target.value.replace(/\D/g, "");
  if (form.dataset.lookupPostalCode && form.dataset.lookupPostalCode !== postalCode) {
    form.elements.street.value = "";
    form.elements.city.value = "";
    form.elements.state.value = "";
    form.dataset.lookupPostalCode = "";
  }
  postalCodeLookupController?.abort();
  document.querySelector("#addressLookupStatus").classList.remove("error");
  document.querySelector("#addressLookupStatus").textContent = "Ao sair do campo CEP, consultaremos a API ViaCEP para preencher rua, cidade e UF.";
});
document.querySelector("#checkoutContent").addEventListener("focusout", async (event) => {
  if (event.target.name !== "postalCode") return;
  const postalCodeInput = event.target;
  const postalCode = postalCodeInput.value.replace(/\D/g, "");
  const status = document.querySelector("#addressLookupStatus");
  if (!postalCode) return;
  if (!/^\d{5}-?\d{3}$/.test(postalCodeInput.value.trim())) {
    postalCodeInput.form.dataset.lookupPostalCode = "";
    status.classList.add("error");
    status.textContent = "Informe um CEP com 8 números ou preencha o endereço manualmente.";
    return;
  }
  if (postalCodeInput.form.dataset.lookupPostalCode === postalCode) return;

  postalCodeLookupController?.abort();
  postalCodeLookupController = new AbortController();
  const controller = postalCodeLookupController;
  status.classList.remove("error");
  status.textContent = "Consultando o CEP na API ViaCEP...";
  try {
    const response = await fetch(`https://viacep.com.br/ws/${postalCode}/json/`, { signal: controller.signal });
    if (!response.ok) throw new Error("Não foi possível consultar o CEP agora.");
    const address = await response.json();
    if (controller.signal.aborted || postalCodeInput.value.replace(/\D/g, "") !== postalCode) return;
    if (address.erro) {
      status.classList.add("error");
      status.textContent = "CEP não encontrado. Confira o número ou preencha o endereço manualmente.";
      postalCodeInput.form.dataset.lookupPostalCode = postalCode;
      return;
    }
    const form = postalCodeInput.form;
    if (typeof address.logradouro === "string" && address.logradouro) form.elements.street.value = address.logradouro;
    if (typeof address.localidade === "string" && address.localidade) form.elements.city.value = address.localidade;
    if (typeof address.uf === "string" && /^[A-Z]{2}$/.test(address.uf)) form.elements.state.value = address.uf;
    form.dataset.lookupPostalCode = postalCode;
    status.textContent = "CEP localizado. Confira o endereço e informe o número.";
  } catch (error) {
    if (error.name === "AbortError") return;
    status.classList.add("error");
    status.textContent = "Não foi possível consultar o ViaCEP. Você pode preencher o endereço manualmente.";
  }
});
document.querySelector("#checkoutContent").addEventListener("submit", async (event) => {
  if (event.target.id !== "checkoutForm") return;
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  const submitButton = form.querySelector('button[type="submit"]');
  const errorMessage = document.querySelector("#paymentError");
  const address = {
    postalCode: formData.get("postalCode").toString().trim(),
    street: formData.get("street").toString().trim(),
    number: formData.get("number").toString().trim(),
    city: formData.get("city").toString().trim(),
    state: formData.get("state").toString().trim().toUpperCase()
  };
  submitButton.disabled = true;
  submitButton.textContent = "Conectando ao Mercado Pago...";
  errorMessage.hidden = true;

  try {
    if (!/^https?:$/.test(window.location.protocol)) {
      throw new Error("Para pagar, abra a loja pelo servidor local: configure o .env e execute npm start.");
    }
    const response = await fetch("/api/payments/preference", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        items: cart,
        coupon: appliedCoupon ? "VECTRA10" : null,
        email: formData.get("email").toString().trim(),
        firstName: formData.get("firstName").toString().trim(),
        lastName: formData.get("lastName").toString().trim(),
        address
      })
    });
    const contentType = response.headers.get("content-type") || "";
    const result = contentType.includes("application/json")
      ? await response.json()
      : { error: "Servidor de pagamento indisponível. Inicie o backend e configure as credenciais no arquivo .env." };
    if (!response.ok) throw new Error(result.error || "Não foi possível iniciar o pagamento.");
    const checkoutUrl = new URL(result.initPoint);
    if (checkoutUrl.protocol !== "https:" || !/(^|\.)mercadopago\.com(\.br)?$/.test(checkoutUrl.hostname)) {
      throw new Error("O servidor retornou um endereço de checkout inválido.");
    }
    window.location.assign(checkoutUrl.href);
  } catch (error) {
    errorMessage.textContent = error.message.includes("Failed to fetch")
      ? "Servidor de pagamento indisponível. Inicie o backend e configure as credenciais no arquivo .env."
      : error.message;
    errorMessage.hidden = false;
    submitButton.disabled = false;
    submitButton.innerHTML = "Ir para pagamento seguro <span>→</span>";
  }
});
document.querySelector("#sizeGuideButton").addEventListener("click", () => document.querySelector("#sizeDialog").showModal());
document.querySelectorAll("[data-close-dialog]").forEach((button) => button.addEventListener("click", () => button.closest("dialog").close()));
document.querySelector("#adminButton").addEventListener("click", () => {
  document.querySelector("#storeView").hidden = true;
  document.querySelector("#adminView").hidden = false;
  renderInventory();
  window.scrollTo(0, 0);
});
document.querySelector("#backToStore").addEventListener("click", () => {
  document.querySelector("#adminView").hidden = true;
  document.querySelector("#storeView").hidden = false;
  window.scrollTo(0, 0);
});
document.querySelector("#restockButton").addEventListener("click", () => {
  const lowProduct = products.find((product) => Object.values(inventory[product.id]).reduce((sum, count) => sum + count, 0) < 5);
  if (!lowProduct) return showToast("Não há itens críticos na demonstração.");
  const sizeToRestock = Object.keys(inventory[lowProduct.id]).sort((left, right) => inventory[lowProduct.id][left] - inventory[lowProduct.id][right])[0];
  inventory[lowProduct.id][sizeToRestock] += 5;
  localStorage.setItem("vectra-inventory", JSON.stringify(inventory));
  renderInventory();
  showToast(`Reposição demonstrativa: ${lowProduct.name}, tamanho ${sizeToRestock}.`);
});

renderProducts();
renderCart();
