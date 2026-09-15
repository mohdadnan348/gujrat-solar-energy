const {
  calculateTotalHours,
} = require("../src/services/attendance.service");

describe("Attendance Service", () => {
  describe("calculateTotalHours", () => {
    test("should calculate total hours correctly", () => {
      const checkIn = new Date("2026-09-15T09:00:00");
      const checkOut = new Date("2026-09-15T18:00:00");

      const result = calculateTotalHours(checkIn, checkOut);

      expect(result).toBe(9);
    });

    test("should calculate decimal hours correctly", () => {
      const checkIn = new Date("2026-09-15T09:00:00");
      const checkOut = new Date("2026-09-15T17:30:00");

      const result = calculateTotalHours(checkIn, checkOut);

      expect(result).toBe(8.5);
    });

    test("should return zero when check-in is missing", () => {
      const checkOut = new Date("2026-09-15T18:00:00");

      const result = calculateTotalHours(null, checkOut);

      expect(result).toBe(0);
    });

    test("should return zero when check-out is missing", () => {
      const checkIn = new Date("2026-09-15T09:00:00");

      const result = calculateTotalHours(checkIn, null);

      expect(result).toBe(0);
    });

    test("should return zero when check-out is before check-in", () => {
      const checkIn = new Date("2026-09-15T18:00:00");
      const checkOut = new Date("2026-09-15T09:00:00");

      const result = calculateTotalHours(checkIn, checkOut);

      expect(result).toBe(0);
    });
  });
});