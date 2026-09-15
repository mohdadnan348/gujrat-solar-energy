import api from "@/services/api";

const BASE_URL = "/employees";

export const getEmployees = async (params = {}) => {
  const response = await api.get(BASE_URL, { params });
  return response.data;
};

export const getEmployeeById = async (employeeId) => {
  if (!employeeId) {
    throw new Error("Employee ID is required.");
  }

  const response = await api.get(
    `${BASE_URL}/${employeeId}`
  );

  return response.data;
};

export const createEmployee = async (employeeData) => {
  if (!employeeData || typeof employeeData !== "object") {
    throw new Error("Employee data is required.");
  }

  const response = await api.post(
    BASE_URL,
    employeeData
  );

  return response.data;
};

export const updateEmployee = async (
  employeeId,
  employeeData
) => {
  if (!employeeId) {
    throw new Error("Employee ID is required.");
  }

  if (!employeeData || typeof employeeData !== "object") {
    throw new Error("Employee data is required.");
  }

  const response = await api.put(
    `${BASE_URL}/${employeeId}`,
    employeeData
  );

  return response.data;
};

export const updateEmployeeStatus = async (
  employeeId,
  status
) => {
  if (!employeeId) {
    throw new Error("Employee ID is required.");
  }

  if (!status) {
    throw new Error("Employee status is required.");
  }

  const response = await api.patch(
    `${BASE_URL}/${employeeId}/status`,
    { status }
  );

  return response.data;
};

export const deactivateEmployee = async (employeeId) => {
  if (!employeeId) {
    throw new Error("Employee ID is required.");
  }

  const response = await api.delete(
    `${BASE_URL}/${employeeId}`
  );

  return response.data;
};

export const getEmployeesByRole = async (
  role,
  params = {}
) => {
  if (!role) {
    throw new Error("Employee role is required.");
  }

  const response = await api.get(BASE_URL, {
    params: {
      ...params,
      role,
    },
  });

  return response.data;
};

export const getEmployeesByDepartment = async (
  department,
  params = {}
) => {
  if (!department) {
    throw new Error("Department is required.");
  }

  const response = await api.get(BASE_URL, {
    params: {
      ...params,
      department,
    },
  });

  return response.data;
};

export const searchEmployees = async (
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

const employeeService = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  updateEmployeeStatus,
  deactivateEmployee,
  getEmployeesByRole,
  getEmployeesByDepartment,
  searchEmployees,
};

export default employeeService;