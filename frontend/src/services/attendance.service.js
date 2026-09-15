import api from "@/services/api";

const BASE_URL = "/attendance";

export const checkIn = async (data = {}) => {
  const response = await api.post(
    `${BASE_URL}/check-in`,
    data
  );

  return response.data;
};

export const checkOut = async (data = {}) => {
  const response = await api.post(
    `${BASE_URL}/check-out`,
    data
  );

  return response.data;
};

export const getMyAttendance = async (params = {}) => {
  const response = await api.get(
    `${BASE_URL}/my`,
    { params }
  );

  return response.data;
};

export const getAttendanceSummary = async (params = {}) => {
  const response = await api.get(
    `${BASE_URL}/summary`,
    { params }
  );

  return response.data;
};

export const getAttendance = async (params = {}) => {
  const response = await api.get(BASE_URL, {
    params,
  });

  return response.data;
};

export const getAttendanceById = async (attendanceId) => {
  if (!attendanceId) {
    throw new Error("Attendance ID is required.");
  }

  const response = await api.get(
    `${BASE_URL}/${attendanceId}`
  );

  return response.data;
};

export const createAttendance = async (attendanceData) => {
  if (
    !attendanceData ||
    typeof attendanceData !== "object"
  ) {
    throw new Error("Attendance data is required.");
  }

  const response = await api.post(
    BASE_URL,
    attendanceData
  );

  return response.data;
};

export const updateAttendance = async (
  attendanceId,
  attendanceData
) => {
  if (!attendanceId) {
    throw new Error("Attendance ID is required.");
  }

  if (
    !attendanceData ||
    typeof attendanceData !== "object"
  ) {
    throw new Error("Attendance data is required.");
  }

  const response = await api.put(
    `${BASE_URL}/${attendanceId}`,
    attendanceData
  );

  return response.data;
};

export const getEmployeeAttendance = async (
  employeeId,
  params = {}
) => {
  if (!employeeId) {
    throw new Error("Employee ID is required.");
  }

  const response = await api.get(BASE_URL, {
    params: {
      ...params,
      employeeId,
    },
  });

  return response.data;
};

export const getMonthlyAttendance = async (
  employeeId,
  month,
  year
) => {
  if (!employeeId) {
    throw new Error("Employee ID is required.");
  }

  const params = {
    employeeId,
    ...(month !== undefined && { month }),
    ...(year !== undefined && { year }),
  };

  const response = await api.get(
    `${BASE_URL}/summary`,
    { params }
  );

  return response.data;
};

const attendanceService = {
  checkIn,
  checkOut,
  getMyAttendance,
  getAttendanceSummary,
  getAttendance,
  getAttendanceById,
  createAttendance,
  updateAttendance,
  getEmployeeAttendance,
  getMonthlyAttendance,
};

export default attendanceService;