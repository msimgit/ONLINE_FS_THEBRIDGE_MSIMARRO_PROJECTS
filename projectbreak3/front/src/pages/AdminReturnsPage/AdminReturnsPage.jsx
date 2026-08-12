import { useEffect, useState } from "react";
import {
  getReturnRequestsRequest,
  approveReturnRequestRequest,
  rejectReturnRequestRequest,
} from "../../api/returnRequests";
import { formatDate } from "../../utils/formatDate";

function ReturnRequestCard({ request, onApprove, onReject, processing }) {
  return (
    <div className="order-card">
      <div className="order-card-header">
        <div>
          <p className="order-card-id">Pedido #{request.orderId}</p>
          <p className="order-card-date">{formatDate(request.createdAt)}</p>
          {request.order?.user?.email && (
            <p className="order-card-date">{request.order.user.email}</p>
          )}
          <p className="admin-issue-card-meta">Referencia: {request.id}</p>
        </div>
        <span className={`order-status order-status-${request.status.toLowerCase()}`}>
          {request.status === "PENDING" && "Pendiente"}
          {request.status === "APPROVED" && "Aprobada"}
          {request.status === "REJECTED" && "Rechazada"}
        </span>
      </div>

      <div className="cart-items">
  {request.items.map((ri) => (
    <article key={ri.id} className="cart-item">
      <img src={ri.orderItem.product.imageUrl} alt={ri.orderItem.product.name} />
      <div className="cart-item-info">
        <h3>{ri.orderItem.product.name}</h3>
        <p>Cantidad a devolver: {ri.quantity}</p>
        {ri.reason && <p className="return-item-note">Motivo: {ri.reason}</p>}
      </div>
    </article>
  ))}
</div>

      {request.status === "PENDING" && (
        <div className="admin-issue-actions">
          <button
            className="btn btn-primary"
            onClick={() => onApprove(request.id)}
            disabled={processing}
          >
            Aprobar
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => onReject(request.id)}
            disabled={processing}
          >
            Rechazar
          </button>
        </div>
      )}
    </div>
  );
}

function AdminReturnsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    setLoading(true);
    const data = await getReturnRequestsRequest();
    setRequests(data);
    setLoading(false);
  }

  async function handleApprove(id) {
    setProcessingId(id);
    try {
      await approveReturnRequestRequest(id);
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.error || "No se pudo aprobar la devolución.");
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReject(id) {
    setProcessingId(id);
    try {
      await rejectReturnRequestRequest(id);
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.error || "No se pudo rechazar la devolución.");
    } finally {
      setProcessingId(null);
    }
  }

  if (loading) return <p className="status-message">Cargando solicitudes...</p>;

  const pending = requests.filter((r) => r.status === "PENDING");
  const approved = requests.filter((r) => r.status === "APPROVED");
  const rejected = requests.filter((r) => r.status === "REJECTED");

  return (
    <div>
      <h1>Devoluciones</h1>

      <h2 className="admin-section-title">Pendientes</h2>
      {pending.length === 0 ? (
        <p className="status-message">No hay solicitudes pendientes.</p>
      ) : (
        pending.map((request) => (
          <ReturnRequestCard
            key={request.id}
            request={request}
            onApprove={handleApprove}
            onReject={handleReject}
            processing={processingId === request.id}
          />
        ))
      )}

      <h2 className="admin-section-title">Aprobadas</h2>
      {approved.length === 0 ? (
        <p className="status-message">Todavía no hay devoluciones aprobadas.</p>
      ) : (
        approved.map((request) => (
          <ReturnRequestCard key={request.id} request={request} />
        ))
      )}

      <h2 className="admin-section-title">Rechazadas</h2>
      {rejected.length === 0 ? (
        <p className="status-message">No hay solicitudes rechazadas.</p>
      ) : (
        rejected.map((request) => (
          <ReturnRequestCard key={request.id} request={request} />
        ))
      )}
    </div>
  );
}

export default AdminReturnsPage;