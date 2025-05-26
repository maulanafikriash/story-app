export function renderFooter() {
    const footerEl = document.getElementById('footer');
    if (!footerEl) {
        console.error("Element dengan id 'footer' tidak ditemukan.");
        return;
    }

    footerEl.innerHTML = `
        <div class="footer-content">
            <p>Copyright &copy; 2025 @maulanafikriash</p>
        </div>
    `;
}
