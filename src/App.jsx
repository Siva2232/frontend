import AppRoutes from "./routes";
import { ToastProvider } from "./components/Toast";

export default function App() {
  return (
    <ToastProvider>
      <AppRoutes />
    </ToastProvider>
  );
}
