import Swal from "sweetalert2";
import {
  handlePushSubscription,
  handlePushUnsubscription,
  checkSubscriptionStatus,
} from "../utils/pushManager.js";

export function renderHeader() {
  const headerEl = document.getElementById("header");
  if (!headerEl) {
    console.error("Element dengan id 'header' tidak ditemukan.");
    return;
  }

  const token = localStorage.getItem("token");
  let navLinks = "";

  if (token) {
    navLinks = `
      <a href="#home" class="nav-link" id="nav-home"><i class="fas fa-house"></i></a>
      <a href="#addStory" class="nav-link" id="nav-addStory"><i class="fas fa-pencil-alt fa-lg"></i></a>
       <a href="#favorite" class="nav-link" id="nav-favorites" title="Favorite Stories">
      <i class="fas fa-heart fa-lg" style="color: #ff5e5e;"></i>
    </a>
      <button id="notif-btn" title="Notifications" class="nav-icon-btn">
        <i id="notif-icon" class="fas fa-bell"></i>
      </button>
      <a href="#" id="logout" title="Logout" onmouseover="this.children[0].style.color='#a83232'" onmouseout="this.children[0].style.color='#cc4444'">
      <i class="fas fa-sign-out-alt fa-lg" style="color: #cc4444;"></i>
      </a>

    `;
  } else {
    navLinks = `
      <a href="#login" class="nav-link" id="nav-login"><i class="fas fa-sign-in-alt"></i></a>
      <a href="#register" class="nav-link" id="nav-register"><i class="fas fa-user-plus"></i></a>
    `;
  }

  headerEl.innerHTML = `
    <div class="header-container">
      <div class="app-name">
      <img src="icons/logo-text-white.png" alt="Story App Logo" class="app-logo" />
    </div>
      <div class="nav-toggle" id="nav-toggle">
        <span class="hamburger"></span>
        <span class="hamburger"></span>
        <span class="hamburger"></span>
      </div>
      <nav class="nav-menu" id="nav-menu">
        ${navLinks}
      </nav>
    </div>
  `;

  const navToggle = document.getElementById("nav-toggle");
  const navMenu = document.getElementById("nav-menu");
  navToggle.addEventListener("click", () => {
    navMenu.classList.toggle("active");
    navToggle.classList.toggle("active");
  });

  const logoutEl = document.getElementById("logout");
  if (logoutEl) {
    logoutEl.addEventListener("click", (event) => {
      event.preventDefault();
      Swal.fire({
        title: "Are you sure?",
        text: "You will be logged out of your account.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, logout!",
      }).then((result) => {
        if (result.isConfirmed) {
          localStorage.removeItem("token");
          localStorage.removeItem("isSubscribedToPush");
          renderHeader();
          window.location.hash = "#login";
          Swal.fire("Logged Out", "You have been logged out.", "success");
        }
      });
    });
  }

  function updateActiveNav() {
    const currentHash = window.location.hash || "#home";
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.classList.remove("active");
    });

    const activeLink = document.querySelector(
      `.nav-link[href="${currentHash}"]`
    );
    if (activeLink) {
      activeLink.classList.add("active");
    }
  }
  updateActiveNav();
  window.addEventListener("hashchange", updateActiveNav);

  // Notifikasi tombol
  const notifBtn = document.getElementById("notif-btn");
  const notifIcon = document.getElementById("notif-icon");

  if (notifBtn && "serviceWorker" in navigator) {
    navigator.serviceWorker.ready.then(async (swReg) => {
      await checkSubscriptionStatus(swReg);

      if (localStorage.getItem("isSubscribedToPush") === "true") {
        notifIcon.classList.add("active");
      } else {
        notifIcon.classList.remove("active");
      }

      notifBtn.addEventListener("click", async () => {
        const isSubscribed =
          localStorage.getItem("isSubscribedToPush") === "true";

        if (!isSubscribed) {
          await handlePushSubscription(swReg);
          if (localStorage.getItem("isSubscribedToPush") === "true") {
            notifIcon.classList.add("active");
          }
        } else {
          await handlePushUnsubscription(swReg);
          if (localStorage.getItem("isSubscribedToPush") !== "true") {
            notifIcon.classList.remove("active");
          }
        }
      });
    });
  }
}
