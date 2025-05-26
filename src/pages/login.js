import { loginUser } from "../services/api.js";
import Swal from "sweetalert2";

export function renderLogin(container) {
  container.innerHTML = `
    <div class="login-container">
      <h2>Login</h2>
      <form id="login-form" class="login-form">
        <div class="input-group">
          <label for="email">Email</label>
          <input type="email" id="email" placeholder="Enter your email" required>
        </div>
        <div class="input-group">
          <label for="password">Password</label>
          <input type="password" id="password" placeholder="Enter your password" required>
        </div>
        <button type="submit" class="login-btn">Login</button>
        <div id="loading-spinner" style="display: none; text-align: center; margin-top: 10px;">
          <img src="https://i.gifer.com/ZKZg.gif" width="40" alt="Loading...">
        </div>
      </form>
      <p class="register-link">Don't have an account? <a href="#register">Register</a></p>
    </div>
  `;

  document.querySelector(".skip-link")?.addEventListener("click", (e) => {
    e.preventDefault();
    setTimeout(() => {
      document.getElementById("email")?.focus();
    }, 0);
  });

  const form = document.getElementById("login-form");
  const loginButton = form.querySelector(".login-btn");
  const loadingSpinner = document.getElementById("loading-spinner");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    loginButton.style.display = "none";
    loadingSpinner.style.display = "block";

    const email = e.target.email.value;
    const password = e.target.password.value;
    const result = await loginUser(email, password);

    loadingSpinner.style.display = "none";
    loginButton.style.display = "block";

    if (!result.error) {
      Swal.fire({
        icon: "success",
        title: "Login Berhasil!",
        text: "Selamat datang kembali!",
        timer: 2000,
        showConfirmButton: false,
      }).then(() => {
        window.location.hash = "#home";
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Login Gagal!",
        text: result.message || "Email atau password salah.",
      });
    }
  });
}
