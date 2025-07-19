/** @format */
(() => {
  const init = async () => {
    if (
      location.pathname !== "/" &&
      location.pathname !== "home" &&
      location.pathname !== "/index.html"
    ) {
      console.log("wrong page");
      return;
    }
  };

  init();
})();
