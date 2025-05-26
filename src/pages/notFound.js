export function renderNotFound(container) {
    container.innerHTML = `
      <section class="not-found">
        <h2>404 - Not Found</h2>
        <p>Ups! Halaman yang kamu cari tidak tersedia.</p>
        <a href="#home">Kembali ke Home</a>
      </section>
    `;
  }
  