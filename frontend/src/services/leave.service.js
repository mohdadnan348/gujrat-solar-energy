import api from "@/services/api";

const BASE_URL = "/leaves";

export const getLeaves = async (params = {}) => {
  const response = await api.get(BASE_URL, { params });
  return response.data;
};

export const getMyLeaves = async (params = {}) => {
  const response = await api.get(
    `${BASE_URL}/my`,
    { params }
  );

  return response.data;
};

export const getLeaveById = async (leaveId) => {
  if (!leaveId) {
    throw new Error("Leave request ID is required.");
  }

  const response = await api.get(
    `${BASE_URL}/${leaveId}`
  );

  return response.data;
};

export const getMyLeaveBalance = async () => {
  const response = await api.get(
    `${BASE_URL}/my/balance`
  );

  return response.data;
};

export const getEmployeeLeaveBalance = async (
  employeeId
) => {
  if (!employeeId) {
    throw new Error("Employee ID is required.");
  }

  const response = await api.get(
    `${BASE_URL}/employee/${employeeId}/balance`
  );

  return response.data;
};

export const createLeaveRequest = async (leaveData) => {
  if (!leaveData || typeof leaveData !== "object") {
    throw new Error("Leave request data is required.");
  }

  const response = await api.post(
    BASE_URL,
    leaveData
  );

  return response.data;
};

export const updateLeaveRequest = async (
  leaveId,
  leaveData
) => {
  if (!leaveId) {
    throw new Error("Leave request ID is required.");
  }

  if (!leaveData || typeof leaveData !== "object") {
    throw new Error("Leave request data is required.");
  }

  const response = await api.put(
    `${BASE_URL}/${leaveId}`,
    leaveData
  );

  return response.data;
};

export const approveLeave = async (leaveId) => {
  if (!leaveId) {
    throw new Error("Leave request ID is required.");
  }

  const response = await api.patch(
    `${BASE_URL}/${leaveId}/approve`
  );

  return response.data;
};

export const rejectLeave = async (
  leaveId,
  rejectionReason
) => {
  if (!leaveId) {
    throw new Error("Leave request ID is required.");
  }

  const response = await api.patch(
    `${BASE_URL}/${leaveId}/reject`,
    {
      rejectionReason,
    }
  );

  return response.data;
};

export const cancelLeave = async (
  leaveId,
  cancellationReason
) => {
  if (!leaveId) {
    throw new Error("Leave request ID is required.");
  }

  const response = await api.patch(
    `${BASE_URL}/${leaveId}/cancel`,
    {
      cancellationReason,
    }
  );

  return response.data;
};

export const getLeavesByStatus = async (
  status,
  params = {}
) => {
  if (!status) {
    throw new Error("Leave status is required.");
  }

  const response = await api.get(BASE_URL, {
    params: {
      ...params,
      status,
    },
  });

  return response.data;
};

export const searchLeaves = async (
  search,
  params = {}
) => {
  const response = await api.get(BASE_URL, {
    params: {
      ...params,
      search,
    },
  });

  return response.data;
};

const leaveService = {
  getLeaves,
  getMyLeaves,
  getLeaveById,
  getMyLeaveBalance,
  getEmployeeLeaveBalance,
  createLeaveRequest,
  updateLeaveRequest,
  approveLeave,
  rejectLeave,
  cancelLeave,
  getLeavesByStatus,
  searchLeaves,
};

export default leaveService;