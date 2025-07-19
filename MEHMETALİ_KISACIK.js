/** @format */
(() => {
  const LOCAL_KEY = "cachedProducts";

  let currentIndex = 0;

  const init = async () => {
    if (location.pathname !== "/" && location.pathname !== "/index.html") {
      console.log("wrong page");
      return;
    }

    const products = await fetchProducts();

    if (products.length === 0) {
      console.error("No products found.");
      return;
    }

    buildHTML(products);
    buildCSS();
  };

  const fetchProducts = async () => {
    const cached = localStorage.getItem(LOCAL_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) return parsed;
        else localStorage.removeItem(LOCAL_KEY);
      } catch {
        localStorage.removeItem(LOCAL_KEY);
      }
    }

    try {
      const res = await fetch(
        "https://gist.githubusercontent.com/sevindi/8bcbde9f02c1d4abe112809c974e1f49/raw/9bf93b58df623a9b16f1db721cd0a7a539296cf0/products.json"
      );
      const data = await res.json();
      if (!Array.isArray(data)) {
        console.error("Fetched data is not an array:", data);
        return [];
      }
      localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
      return data;
    } catch (err) {
      console.error("Failed to fetch product data:", err);
      return [];
    }
  };

  const buildHTML = (products) => {
    const storiesDiv = document.querySelector(
      ".ins-preview-wrapper.ins-preview-wrapper-27158"
    );

    if (!storiesDiv) {
      console.error("Stories div  doesn't exist");
      return;
    }

    const productCardsHTML = products
      .map(
        (product) => `
          <div class="carousel-item">
            <div class="product-item">
              <a href="${product.url}" target="_blank" class="product-item-anchor">
                <figure class="product-item-image">
                  <img src="${product.img}" alt="${product.name}">
                </figure>
                <div class="product-item-content">
                  <a href="${product.url}" target="_blank" class="product-item-anchor">
                    <h2 class="product-item__brand ng-star-inserted"><b> ${product.brand} - </b><span> ${product.name} </span></h2>
                  </a>
                  <div class="product-item__price">
                    <span class="product-item__new-price">${product.price} TL</span>
                  </div>
                </div>
              </a>
              <div class="product-item-content">
                <div class="product-item__price">
                  <button class="btn close-btn">Sepete Ekle</button>
                </div>
              </div>
            </div>
          </div>
        `
      )
      .join("");

    const htmlString = `
      <div class="banner product-carousel">
        <div class="container">
          <div class="banner__titles">
            <h2 class="title-primary">Beğenebileceğinizi düşündüklerimiz</h2>
          </div>
          <div class="banner__wrapper">
            <div class="product-list__best-products">
              <div class="carousel">
                <div class="carousel-wrapper">
                  ${productCardsHTML}
                </div>
              </div>
            </div>
            <button aria-label="back" class="swiper-prev"></button>
            <button aria-label="next" class="swiper-next"></button>
          </div>
        </div>
      </div>`;

    storiesDiv.insertAdjacentHTML("afterend", htmlString);
  };

  const buildCSS = () => {
    const css = `
    .carousel-wrapper {
      position: relative;
      left: 0;
      top: 0;
      display: flex;
      overflow: hidden;
      gap: 12px;
    }

    .carousel-item {
      flex: 0 0 auto;
    }
  `;
    const styleTag = document.createElement("style");
    styleTag.textContent = css;
    document.head.appendChild(styleTag);
  };

  init();
})();
