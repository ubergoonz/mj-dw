export default function Footer() {
  return (
    <footer className="app-footer">
      <span>Made with ❤️ by a MJ lover to MJ Community</span>
      <a
        className="footer-github"
        href="https://github.com/ubergoonz/mj-dw"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="View project on GitHub"
        title="View on GitHub"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path
            d="M12 1.5a10.5 10.5 0 0 0-3.32 20.46c.53.1.72-.22.72-.5v-1.77c-2.95.64-3.58-1.26-3.58-1.26-.49-1.23-1.18-1.56-1.18-1.56-.97-.65.07-.64.07-.64 1.07.08 1.64 1.09 1.64 1.09.95 1.63 2.5 1.15 3.11.88.1-.7.37-1.16.67-1.43-2.35-.26-4.82-1.17-4.82-5.2 0-1.15.41-2.1 1.08-2.84-.11-.27-.47-1.35.1-2.8 0 0 .88-.28 2.88 1.08a9.97 9.97 0 0 1 5.25 0c2-1.36 2.88-1.08 2.88-1.08.57 1.45.21 2.53.1 2.8.67.74 1.08 1.69 1.08 2.84 0 4.04-2.48 4.94-4.84 5.2.38.33.72.98.72 1.98v2.94c0 .28.19.6.72.5A10.5 10.5 0 0 0 12 1.5Z"
          />
        </svg>
        <span>
          View on
          <br />
          GitHub
        </span>
      </a>
      <a href="https://ko-fi.com/lesliewang" target="_blank" rel="noopener noreferrer">
        <img
          src="https://storage.ko-fi.com/cdn/kofi3.png?v=3"
          alt="Buy Me a Coffee at ko-fi.com"
          style={{ border: 0, height: "36px" }}
        />
      </a>
    </footer>
  );
}
