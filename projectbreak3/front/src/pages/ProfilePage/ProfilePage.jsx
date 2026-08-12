import { useSelector } from "react-redux";
import { useOrders } from "../../hooks/useOrders";
import { formatDate } from "../../utils/formatDate";
import OrderCard from "../../components/OrderCard/OrderCard";

function ProfilePage() {
  const { user } = useSelector((state) => state.auth);
  const { data: orders, loading, error, requestReturn } = useOrders();

  return (
    <section className="profile-page">
      <div className="profile-info-card">
        <h1>Mi perfil</h1>
        <p className="profile-email">{user?.email}</p>
        {user?.createdAt && (
          <p className="profile-member-since">
            Cliente desde {formatDate(user.createdAt)}
          </p>
        )}
      </div>

      <h2>Historial de pedidos</h2>

      {loading && <p className="status-message">Cargando pedidos...</p>}
      {error && <p className="status-message error">{error}</p>}

      {orders && orders.length === 0 && (
        <p className="status-message">Aún no has realizado ningún pedido.</p>
      )}

      {orders && orders.length > 0 && (
        <div className="order-history-list">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} onRequestReturn={requestReturn} />
          ))}
        </div>
      )}
    </section>
  );
}

export default ProfilePage;
