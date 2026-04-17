import { Toaster } from "react-hot-toast";

const toastOptions = {
  style: {
    borderRadius: "8px",
    border: "1px solid #d7dde1",
    boxShadow: "0 18px 45px rgba(20, 24, 31, 0.14)",
  },
};

export function AppShell({ children }) {
  return (
    <div className="app-shell">
      <Toaster position="top-right" toastOptions={toastOptions} />
      <main className="page">{children}</main>
    </div>
  );
}
