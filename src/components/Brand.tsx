/**
 * App brand mark, used in the topbar of every utility page. Deliberately a plain
 * anchor (not a router Link) so clicking it always performs a full page reload.
 */
export default function Brand() {
  return (
    <div className="brand">
      <span className="brand-mark">雀</span>
      <a href={import.meta.env.BASE_URL} aria-label="重新加载页面">
        雀起
      </a>
    </div>
  );
}
