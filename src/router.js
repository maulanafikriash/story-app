import { renderRegister } from "./pages/register.js";
import { renderLogin } from "./pages/login.js";
import { renderHome } from "./pages/home.js";
import { renderAddStory } from "./pages/addStory.js";
import { renderFavorite } from "./pages/favorite.js";
import { renderDetailStory } from "./pages/detailStory.js";
import { renderHeader } from "./components/header.js";
import { renderNotFound } from "./pages/notFound.js";

export function initRouter() {
  window.addEventListener("hashchange", handleRoute);
  handleRoute();
}

function handleRoute() {
  const mainEl = document.getElementById("main");
  if (!mainEl) {
    console.error("Element dengan id 'main' tidak ditemukan.");
    return;
  }

  const token = localStorage.getItem("token");
  let hash = window.location.hash.slice(1) || "login";

  const protectedRoutes = ["home", "addStory"];

  const authRoutes = ["login", "register"];

  if (!token && protectedRoutes.includes(hash)) {
    window.location.hash = "login";
    return;
  }

  if (token && authRoutes.includes(hash)) {
    window.location.hash = "home";
    return;
  }

  if (document.startViewTransition) {
    document.startViewTransition(() => renderPage(hash, mainEl));
  } else {
    renderPage(hash, mainEl);
  }
}

function renderPage(hash, mainEl) {
  mainEl.innerHTML = "";

  if (hash === "register") {
    renderRegister(mainEl);
  } else if (hash === "login") {
    renderLogin(mainEl);
  } else if (hash.startsWith("detail")) {
    const params = new URLSearchParams(hash.split("?")[1]);
    const id = params.get("id");
    renderDetailStory(mainEl, id);
  } else if (hash === "addStory") {
    renderAddStory(mainEl);
  } else if (hash === "home") {
    renderHome(mainEl);
  } else if (hash === "favorite") { 
    renderFavorite(mainEl);
  } else {
    renderNotFound(mainEl);
  }

  renderHeader();
}
