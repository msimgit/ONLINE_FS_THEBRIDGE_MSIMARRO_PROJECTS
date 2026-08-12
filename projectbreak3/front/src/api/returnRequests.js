import api from "./axios";

export const getReturnRequestsRequest = async (status) => {
  const response = await api.get("/admin/returns", {
    params: status ? { status } : {},
  });
  return response.data.data.requests;
};

export const approveReturnRequestRequest = async (id) => {
  const response = await api.put(`/admin/returns/${id}/approve`);
  return response.data.data.request;
};

export const rejectReturnRequestRequest = async (id) => {
  const response = await api.put(`/admin/returns/${id}/reject`);
  return response.data.data.request;
};