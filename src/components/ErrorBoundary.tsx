import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Last line of defence: a render error in one tool shows a recovery card
 * instead of a blank white screen. Saved data in localStorage is untouched.
 */
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("mj-dw render error", error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <main className="app-shell error-shell" role="alert">
        <section className="intro">
          <p className="eyebrow">SOMETHING WENT WRONG</p>
          <h1>糟糕，出錯了</h1>
          <p>這個工具暫時無法顯示。你的紀錄仍保存在此裝置上，重新載入即可繼續。</p>
          <p className="error-detail">{this.state.error.message}</p>
        </section>
        <div className="error-actions">
          <button className="utility-action" type="button" onClick={() => window.location.reload()}>
            重新載入 · Reload
          </button>
          <a className="utility-action utility-action-secondary" href={`${import.meta.env.BASE_URL}#/`}>
            回主頁 · Home
          </a>
        </div>
      </main>
    );
  }
}
