/** @format */
(() => {
  const PRODUCTS_KEY = "cachedProducts";
  const FAVORITES_KEY = "favoriteProducts";

  let currentIndex = 0;

  const init = async () => {
    if (location.pathname !== "/" && location.pathname !== "/index.html") {
      console.log("wrong page");
      return;
    }

    let products = await fetchProducts();

    if (products.length === 0) {
      console.error("No products found");
      return;
    }

    const favorites = fetchFavorites();

    if (favorites.length > 0) {
      products = products.map((product) => ({
        ...product,
        isFavorite: favorites.includes(product.id),
      }));
    }

    buildHTML(products);
    buildCSS();
    setEvents(products);
  };

  const fetchProducts = async () => {
    const cached = localStorage.getItem(PRODUCTS_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) return parsed;
        else localStorage.removeItem(PRODUCTS_KEY);
      } catch {
        localStorage.removeItem(PRODUCTS_KEY);
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
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(data));
      return data;
    } catch (err) {
      console.error("Failed to fetch product data:", err);
      return [];
    }
  };

  const fetchFavorites = () => {
    const favorites = localStorage.getItem(FAVORITES_KEY);

    if (!favorites) {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify([]));
      return [];
    }

    try {
      const parsed = JSON.parse(favorites);
      if (Array.isArray(parsed)) {
        return parsed;
      }

      localStorage.removeItem(LOCAL_KEY);
    } catch (error) {
      console.error("Failed to parse favorites:", error);
      localStorage.removeItem(LOCAL_KEY);
    }

    return [];
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
              <a href="${
                product.url
              }" target="_blank" class="product-item-anchor">
                <figure class="product-item-image">
                  <img src="${product.img}" alt="${product.name}">
                </figure>
                <div class="product-item-content">
                  <a href="${
                    product.url
                  }" target="_blank" class="product-item-anchor">
                    <h2 class="product-item__brand ng-star-inserted"><b> ${
                      product.brand
                    } - </b><span> ${product.name} </span></h2>
                  </a>
                  <div class="product-item__price">
                    <span class="product-item__new-price">${
                      product.price
                    } TL</span>
                  </div>
                </div>
              </a>
              <div class="product-item-content">
                <div class="product-item__price">
                  <button class="btn close-btn">Sepete Ekle</button>
                </div>
                <div class="heart" data-product-id="${product.id}">
                <img src="assets/svg/${
                  product.isFavorite ? "added-favorite" : "default-favorite"
                }.svg" alt="heart" class="heart-icon">
                <img src="assets/svg/${
                  product.isFavorite
                    ? "added-favorite-hover"
                    : "default-hover-favorite"
                }.svg" alt="heart" class="heart-icon hovered">
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

  const setEvents = (products) => {
    const productCarousel = document.querySelector(".product-carousel");
    const leftBtn = productCarousel.querySelector(".swiper-prev");
    const rightBtn = productCarousel.querySelector(".swiper-next");
    const carousel = document.querySelector(".carousel");
    const totalProducts = products.length;

    const calculateVisibleCards = () => {
      const width = window.innerWidth;
      if (width >= 1480) return 5;
      if (width >= 1280) return 4;
      if (width >= 992) return 3;
      return 2;
    };

    let visibleCards = calculateVisibleCards();

    const updateCardWidths = () => {
      visibleCards = calculateVisibleCards();
      const cardWidth =
        (carousel.clientWidth - (visibleCards - 1) * 12) / visibleCards;
      carousel.querySelectorAll(".carousel-item").forEach((item) => {
        item.style.width = `${cardWidth}px`;
      });
    };

    const updateCarouselView = () => {
      updateCardWidths();
      const items = carousel.querySelectorAll(".carousel-item");
      items.forEach((item, index) => {
        item.style.display =
          index >= currentIndex && index < currentIndex + visibleCards
            ? "block"
            : "none";
      });
    };

    updateCarouselView();

    rightBtn.addEventListener("click", () => {
      if (currentIndex + visibleCards < totalProducts) {
        currentIndex++;
        updateCarouselView();
      }
    });

    leftBtn.addEventListener("click", () => {
      if (currentIndex > 0) {
        currentIndex--;
        updateCarouselView();
      }
    });

    window.addEventListener("resize", () => {
      const newVisible = calculateVisibleCards();
      if (newVisible !== visibleCards) {
        currentIndex = 0;
      }
      updateCarouselView();
    });
    const hearts = productCarousel.querySelectorAll(".heart");

    hearts.forEach((heart) => {
      heart.addEventListener("click", () => {
        const favorites = fetchFavorites();

        const productId = Number(heart.dataset.productId);
        const isFavorite = favorites.includes(productId);

        if (isFavorite) {
          heart.dataset.isFavorite = "false";
          heart.querySelector(".heart-icon").src =
            "assets/svg/default-favorite.svg";
          heart.querySelector(".hovered").src =
            "assets/svg/default-hover-favorite.svg";

          const updatedFavorites = favorites.filter((id) => id !== productId);
          localStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
        } else {
          heart.dataset.isFavorite = "true";
          heart.querySelector(".heart-icon").src =
            "assets/svg/added-favorite.svg";
          heart.querySelector(".hovered").src =
            "assets/svg/added-favorite-hover.svg";

          localStorage.setItem(
            FAVORITES_KEY,
            JSON.stringify([...favorites, productId])
          );
        }
      });
    });
  };

  init();
})();
