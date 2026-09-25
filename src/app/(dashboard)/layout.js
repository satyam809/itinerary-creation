import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";

export default function DashboardLayout({ children }) {
  return (
    <div className="d-flex min-vh-100">
      <Sidebar />
      <div className="d-flex flex-column flex-grow-1">
        <Header />
        <div className="flex-grow-1 overflow-auto">{children}</div>
      </div>
    </div>
  );
}
