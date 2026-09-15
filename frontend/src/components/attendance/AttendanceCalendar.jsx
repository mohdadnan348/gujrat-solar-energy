"use client";

import { useMemo, useState } from "react";
import "./AttendanceCalendar.css";

const STATUS_CONFIG = {
  present: {
    label: "Present",
    className: "attendance-calendar__status--present",
  },
  absent: {
    label: "Absent",
    className: "attendance-calendar__status--absent",
  },
  late: {
    label: "Late",
    className: "attendance-calendar__status--late",
  },
  "half-day": {
    label: "Half Day",
    className: "attendance-calendar__status--half-day",
  },
  leave: {
    label: "Leave",
    className: "attendance-calendar__status--leave",
  },
  holiday: {
    label: "Holiday",
    className: "attendance-calendar__status--holiday",
  },
  weekend: {
    label: "Weekend",
    className: "attendance-calendar__status--weekend",
  },
  pending: {
    label: "Pending",
    className: "attendance-calendar__status--pending",
  },
};

const LEGEND_ITEMS = [
  { key: "present", label: "Present" },
  { key: "absent", label: "Absent" },
  { key: "late", label: "Late" },
  { key: "leave", label: "Leave" },
  { key: "holiday", label: "Holiday" },
];

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function normalizeDate(value) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function getDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatMonthYear(date) {
  return new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatTime(value) {
  if (!value) return "";

  const date = normalizeDate(value);

  if (!date) return "";

  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getAttendanceStatus(record) {
  if (!record) return null;

  const status =
    record.status ||
    record.attendanceStatus ||
    record.type ||
    "pending";

  return String(status).toLowerCase().replace(/\s+/g, "-");
}

function getAttendanceTime(record) {
  if (!record) return "";

  if (record.checkIn && record.checkOut) {
    return `${formatTime(record.checkIn)} - ${formatTime(
      record.checkOut
    )}`;
  }

  if (record.checkIn) {
    return `In: ${formatTime(record.checkIn)}`;
  }

  if (record.checkOut) {
    return `Out: ${formatTime(record.checkOut)}`;
  }

  return "";
}

export default function AttendanceCalendar({
  attendance = [],
  records,
  data,
  currentDate,
  onDateChange,
  onDayClick,
  title = "Attendance Calendar",
  subtitle = "View attendance records by date.",
  showLegend = true,
}) {
  const attendanceRecords = records || data || attendance;

  const initialDate = normalizeDate(currentDate) || new Date();

  const [visibleDate, setVisibleDate] = useState(
    new Date(
      initialDate.getFullYear(),
      initialDate.getMonth(),
      1
    )
  );

  const recordsByDate = useMemo(() => {
    const map = new Map();

    if (!Array.isArray(attendanceRecords)) {
      return map;
    }

    attendanceRecords.forEach((record) => {
      const rawDate =
        record?.date ||
        record?.attendanceDate ||
        record?.createdAt ||
        record?.checkIn;

      const date = normalizeDate(rawDate);

      if (!date) return;

      map.set(getDateKey(date), record);
    });

    return map;
  }, [attendanceRecords]);

  const calendarDays = useMemo(() => {
    const year = visibleDate.getFullYear();
    const month = visibleDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days = [];

    for (let index = 0; index < firstDay.getDay(); index += 1) {
      days.push(null);
    }

    for (let day = 1; day <= lastDay.getDate(); day += 1) {
      days.push(new Date(year, month, day));
    }

    return days;
  }, [visibleDate]);

  const goToPreviousMonth = () => {
    const nextDate = new Date(
      visibleDate.getFullYear(),
      visibleDate.getMonth() - 1,
      1
    );

    setVisibleDate(nextDate);
    onDateChange?.(nextDate);
  };

  const goToNextMonth = () => {
    const nextDate = new Date(
      visibleDate.getFullYear(),
      visibleDate.getMonth() + 1,
      1
    );

    setVisibleDate(nextDate);
    onDateChange?.(nextDate);
  };

  const goToToday = () => {
    const today = new Date();

    const nextDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );

    setVisibleDate(nextDate);
    onDateChange?.(nextDate);
  };

  const handleDayClick = (date, record) => {
    if (!date) return;

    onDayClick?.({
      date,
      record: record || null,
    });
  };

  const isToday = (date) => {
    if (!date) return false;

    const today = new Date();

    return getDateKey(today) === getDateKey(date);
  };

  const getStatusConfig = (record, date) => {
    if (!record) {
      const day = date.getDay();

      if (day === 0 || day === 6) {
        return STATUS_CONFIG.weekend;
      }

      return null;
    }

    const status = getAttendanceStatus(record);

    return (
      STATUS_CONFIG[status] || {
        label:
          record.status ||
          record.attendanceStatus ||
          "Pending",
        className:
          STATUS_CONFIG.pending.className,
      }
    );
  };

  return (
    <div className="attendance-calendar">
      <div className="attendance-calendar__header">
        <div>
          <h2 className="attendance-calendar__title">
            {title}
          </h2>

          <p className="attendance-calendar__subtitle">
            {subtitle}
          </p>
        </div>

        <div className="attendance-calendar__controls">
          <button
            type="button"
            className="attendance-calendar__button"
            onClick={goToPreviousMonth}
            aria-label="Previous month"
            title="Previous month"
          >
            ←
          </button>

          <div className="attendance-calendar__month">
            {formatMonthYear(visibleDate)}
          </div>

          <button
            type="button"
            className="attendance-calendar__button"
            onClick={goToNextMonth}
            aria-label="Next month"
            title="Next month"
          >
            →
          </button>

          <button
            type="button"
            className="attendance-calendar__button"
            onClick={goToToday}
            aria-label="Go to today"
            title="Go to today"
          >
            •
          </button>
        </div>
      </div>

      <div className="attendance-calendar__body">
        <div className="attendance-calendar__grid">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="attendance-calendar__weekday"
            >
              {day.slice(0, 3)}
            </div>
          ))}

          {calendarDays.map((date, index) => {
            if (!date) {
              return (
                <div
                  key={`empty-${index}`}
                  className="attendance-calendar__day attendance-calendar__day--empty"
                />
              );
            }

            const dateKey = getDateKey(date);
            const record = recordsByDate.get(dateKey);
            const statusConfig = getStatusConfig(
              record,
              date
            );

            return (
              <button
                key={dateKey}
                type="button"
                className={`attendance-calendar__day ${
                  isToday(date)
                    ? "attendance-calendar__day--today"
                    : ""
                }`}
                onClick={() =>
                  handleDayClick(date, record)
                }
              >
                <div className="attendance-calendar__date">
                  <span className="attendance-calendar__date-number">
                    {date.getDate()}
                  </span>

                  {isToday(date) && (
                    <span className="attendance-calendar__today-badge">
                      Today
                    </span>
                  )}
                </div>

                {statusConfig && (
                  <span
                    className={`attendance-calendar__status ${statusConfig.className}`}
                  >
                    {statusConfig.label}
                  </span>
                )}

                {record && getAttendanceTime(record) && (
                  <div className="attendance-calendar__time">
                    {getAttendanceTime(record)}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {calendarDays.length === 0 && (
          <div className="attendance-calendar__empty">
            No attendance records available.
          </div>
        )}

        {showLegend && (
          <div className="attendance-calendar__legend">
            {LEGEND_ITEMS.map((item) => (
              <div
                key={item.key}
                className="attendance-calendar__legend-item"
              >
                <span
                  className={`attendance-calendar__legend-dot attendance-calendar__legend-dot--${item.key}`}
                />

                <span>{item.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}