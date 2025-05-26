import { registerUser } from "../services/api.js";
import Swal from "sweetalert2";

export function renderRegister(container) {
  container.innerHTML = `
    <div class="register-container">
      <h2>Register</h2>
      <form id="register-form" class="register-form">
        <div class="input-group">
          <label for="name">Name</label>
          <input type="text" id="name" placeholder="Enter your name" required>
        </div>
        <div class="input-group">
          <label for="email">Email</label>
          <input type="email" id="email" placeholder="Enter your email" required>
        </div>
        <div class="input-group">
          <label for="password">Password</label>
          <input type="password" id="password" placeholder="Enter your password" required>
        </div>
        <button type="submit" class="register-btn">Register</button>
        <div id="loading-spinner" style="display: none; text-align: center; margin-top: 10px;">
          <img src="https://i.gifer.com/ZKZg.gif" width="40" alt="Loading...">
        </div>
      </form>
      <p class="login-link">Already have an account? <a href="#login">Login</a></p>
    </div>
  `;

  setTimeout(() => {
    document.getElementById("name")?.focus();
  }, 0);

  const form = document.getElementById("register-form");
  const registerButton = form.querySelector(".register-btn");
  const loadingSpinner = document.getElementById("loading-spinner");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    registerButton.style.display = "none";
    loadingSpinner.style.display = "block";

    const name = e.target.name.value;
    const email = e.target.email.value;
    const password = e.target.password.value;
    const result = await registerUser(name, email, password);

    loadingSpinner.style.display = "none";
    registerButton.style.display = "block";

    if (!result.error) {
      Swal.fire({
        icon: "success",
        title: "Registrasi Berhasil!",
        text: "Silakan login dengan akun Anda.",
        timer: 2000,
        showConfirmButton: false,
      }).then(() => {
        window.location.hash = "#login";
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Registrasi Gagal!",
        text: result.message || "Terjadi kesalahan saat registrasi.",
      });
    }
  });
}
