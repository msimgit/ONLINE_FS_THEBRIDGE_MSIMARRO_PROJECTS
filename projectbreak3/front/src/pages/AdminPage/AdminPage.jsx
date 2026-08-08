import { Outlet } from "react-router-dom";
import AdminSidebar from "../../components/AdminSidebar/AdminSidebar";

// Layout del panel admin: el sidebar es fijo y persiste en todas las
// subpáginas (/admin, /admin/products, /admin/products/new...), así que
// "Admin Dashboard" siempre está a mano sin importar dónde estemos.
function AdminPage() {
  return (
    <div className="admin-layout">
      <div className="admin-shell">
        <AdminSidebar />
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminPage;
