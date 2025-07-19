/** @format */
(() => {
  const LOCAL_KEY = "cachedProducts";

  const init = async () => {
    if (location.pathname !== "/" && location.pathname !== "/index.html") {
      console.log("wrong page");
      return;
    }

    let products = await fetchProducts();
    console.log("Fetched products:", products);
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
        console.error("Fetched data is not an array", data);
        return [];
      }
      localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
      return data;
    } catch (err) {
      console.error("Failed to fetch product data", err);
      return [];
    }
  };

  init();
})();
