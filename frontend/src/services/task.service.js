import api from "@/services/api";

const BASE_URL = "/tasks";

export const getTasks = async (params = {}) => {
  const response = await api.get(BASE_URL, { params });
  return response.data;
};

export const getMyTasks = async (params = {}) => {
  const response = await api.get(`${BASE_URL}/my`, { params });
  return response.data;
};

export const getTaskById = async (taskId) => {
  if (!taskId) {
    throw new Error("Task ID is required.");
  }

  const response = await api.get(`${BASE_URL}/${taskId}`);
  return response.data;
};

export const createTask = async (taskData) => {
  if (!taskData || typeof taskData !== "object") {
    throw new Error("Task data is required.");
  }

  const response = await api.post(BASE_URL, taskData);
  return response.data;
};

export const updateTask = async (taskId, taskData) => {
  if (!taskId) {
    throw new Error("Task ID is required.");
  }

  if (!taskData || typeof taskData !== "object") {
    throw new Error("Task data is required.");
  }

  const response = await api.put(
    `${BASE_URL}/${taskId}`,
    taskData
  );

  return response.data;
};

export const updateTaskStatus = async (taskId, status) => {
  if (!taskId) {
    throw new Error("Task ID is required.");
  }

  if (!status) {
    throw new Error("Task status is required.");
  }

  const response = await api.patch(
    `${BASE_URL}/${taskId}/status`,
    { status }
  );

  return response.data;
};

export const completeTask = async (
  taskId,
  completionNotes = ""
) => {
  if (!taskId) {
    throw new Error("Task ID is required.");
  }

  const response = await api.patch(
    `${BASE_URL}/${taskId}/complete`,
    { completionNotes }
  );

  return response.data;
};

export const cancelTask = async (
  taskId,
  cancellationReason
) => {
  if (!taskId) {
    throw new Error("Task ID is required.");
  }

  if (!cancellationReason) {
    throw new Error("Cancellation reason is required.");
  }

  const response = await api.patch(
    `${BASE_URL}/${taskId}/cancel`,
    { cancellationReason }
  );

  return response.data;
};

export const getOverdueTasks = async () => {
  const response = await api.get(
    `${BASE_URL}/overdue`
  );

  return response.data;
};

export const deleteTask = async (taskId) => {
  if (!taskId) {
    throw new Error("Task ID is required.");
  }

  const response = await api.delete(
    `${BASE_URL}/${taskId}`
  );

  return response.data;
};

export const getTasksByEmployee = async (
  employeeId,
  params = {}
) => {
  if (!employeeId) {
    throw new Error("Employee ID is required.");
  }

  return getTasks({
    ...params,
    assignedTo: employeeId,
  });
};

export const getTasksByStatus = async (
  status,
  params = {}
) => {
  if (!status) {
    throw new Error("Task status is required.");
  }

  return getTasks({
    ...params,
    status,
  });
};

export const getTasksByPriority = async (
  priority,
  params = {}
) => {
  if (!priority) {
    throw new Error("Task priority is required.");
  }

  return getTasks({
    ...params,
    priority,
  });
};

export const searchTasks = async (
  search,
  params = {}
) => {
  return getTasks({
    ...params,
    search,
  });
};

const taskService = {
  getTasks,
  getMyTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  completeTask,
  cancelTask,
  getOverdueTasks,
  deleteTask,
  getTasksByEmployee,
  getTasksByStatus,
  getTasksByPriority,
  searchTasks,
};

export default taskService;