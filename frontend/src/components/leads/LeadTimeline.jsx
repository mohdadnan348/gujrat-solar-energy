"use client";

import React, { useMemo } from "react";
import Badge from "@/components/common/Badge";
import Avatar from "@/components/common/Avatar";
import Loader from "@/components/common/Loader";
import {
  formatName,
  formatDate,
  formatRelativeDate,
} from "@/utils/formatters";

const LeadTimeline = ({
  activities = [],
  loading = false,
  lead = null,
  emptyMessage = "No activities have been recorded for this lead yet.",
}) => {
  const normalizedActivities = useMemo(() => {
    if (!Array.isArray(activities)) {
      return [];
    }

    return [...activities]
      .filter(Boolean)
      .sort((a, b) => {
        const dateA = new Date(
          a?.createdAt ||
            a?.date ||
            a?.activityDate ||
            0
        ).getTime();

        const dateB = new Date(
          b?.createdAt ||
            b?.date ||
            b?.activityDate ||
            0
        ).getTime();

        return dateB - dateA;
      });
  }, [activities]);

  const getActivityId = (activity, index) =>
    activity?._id ||
    activity?.id ||
    `activity-${index}`;

  const getActivityType = (activity) => {
    return String(
      activity?.type ||
        activity?.activityType ||
        activity?.action ||
        activity?.category ||
        "NOTE"
    ).toUpperCase();
  };

  const getActivityTitle = (activity) => {
    return (
      activity?.title ||
      activity?.subject ||
      activity?.activityTitle ||
      getActivityType(activity)
        .replaceAll("_", " ")
        .replace(/\b\w/g, (char) =>
          char.toUpperCase()
        )
    );
  };

  const getActivityDescription = (activity) => {
    return (
      activity?.description ||
      activity?.notes ||
      activity?.comment ||
      activity?.remarks ||
      activity?.message ||
      ""
    );
  };

  const getActivityDate = (activity) => {
    return (
      activity?.createdAt ||
      activity?.date ||
      activity?.activityDate ||
      activity?.updatedAt ||
      null
    );
  };

  const getActivityUser = (activity) => {
    return (
      activity?.createdBy ||
      activity?.performedBy ||
      activity?.user ||
      activity?.employee ||
      activity?.updatedBy ||
      null
    );
  };

  const getUserName = (activity) => {
    const user = getActivityUser(activity);

    if (!user) {
      return (
        activity?.createdByName ||
        activity?.performedByName ||
        "System"
      );
    }

    if (typeof user === "string") {
      return user;
    }

    return (
      user?.name ||
      user?.fullName ||
      `${user?.firstName || ""} ${
        user?.lastName || ""
      }`.trim() ||
      user?.email ||
      "System"
    );
  };

  const getActivityTypeVariant = (type) => {
    const variants = {
      CALL: "info",
      EMAIL: "info",
      MEETING: "success",
      SITE_VISIT: "success",
      FOLLOW_UP: "warning",
      NOTE: "default",
      STATUS_CHANGE: "warning",
      ASSIGNMENT: "info",
      CREATED: "success",
      UPDATED: "info",
      QUOTATION: "info",
      CONVERTED: "success",
      SUCCESS: "success",
      LOST: "danger",
      NOT_INTERESTED: "danger",
    };

    return variants[type] || "default";
  };

  const getActivityIcon = (type) => {
    const icons = {
      CALL: "☎",
      EMAIL: "✉",
      MEETING: "◉",
      SITE_VISIT: "⌖",
      FOLLOW_UP: "↻",
      NOTE: "✎",
      STATUS_CHANGE: "↕",
      ASSIGNMENT: "⇄",
      CREATED: "+",
      UPDATED: "✓",
      QUOTATION: "▤",
      CONVERTED: "✓",
      SUCCESS: "✓",
      LOST: "×",
      NOT_INTERESTED: "×",
    };

    return icons[type] || "•";
  };

  if (loading) {
    return (
      <div className="lead-timeline-state">
        <Loader />
        <p>Loading activity timeline...</p>
      </div>
    );
  }

  if (normalizedActivities.length === 0) {
    return (
      <div className="lead-timeline-empty">
        <div className="lead-timeline-empty-icon">
          •
        </div>

        <h3>No Activity Yet</h3>

        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="lead-timeline">
      <div className="lead-timeline-line" />

      {normalizedActivities.map(
        (activity, index) => {
          const type =
            getActivityType(activity);

          const title =
            getActivityTitle(activity);

          const description =
            getActivityDescription(activity);

          const activityDate =
            getActivityDate(activity);

          const userName =
            getUserName(activity);

          return (
            <article
              className="lead-timeline-item"
              key={getActivityId(
                activity,
                index
              )}
            >
              <div className="lead-timeline-marker">
                <span>
                  {getActivityIcon(type)}
                </span>
              </div>

              <div className="lead-timeline-content">
                <div className="lead-timeline-top">
                  <div className="lead-timeline-heading">
                    <h3>{title}</h3>

                    <Badge
                      variant={getActivityTypeVariant(
                        type
                      )}
                    >
                      {type
                        .replaceAll(
                          "_",
                          " "
                        )
                        .replace(
                          /\b\w/g,
                          (char) =>
                            char.toUpperCase()
                        )}
                    </Badge>
                  </div>

                  {activityDate && (
                    <time
                      dateTime={String(
                        activityDate
                      )}
                      className="lead-timeline-date"
                    >
                      {formatRelativeDate(
                        activityDate
                      )}
                    </time>
                  )}
                </div>

                {description && (
                  <p className="lead-timeline-description">
                    {description}
                  </p>
                )}

                <div className="lead-timeline-meta">
                  <Avatar
                    name={userName}
                    size="xs"
                  />

                  <span>
                    {formatName(userName)}
                  </span>

                  {activityDate && (
                    <>
                      <span className="lead-timeline-meta-separator">
                        •
                      </span>

                      <span>
                        {formatDate(
                          activityDate
                        )}
                      </span>
                    </>
                  )}
                </div>

                {activity?.oldStatus &&
                  activity?.newStatus && (
                    <div className="lead-timeline-change">
                      <span>
                        {String(
                          activity.oldStatus
                        )
                          .replaceAll(
                            "_",
                            " "
                          )
                          .replace(
                            /\b\w/g,
                            (char) =>
                              char.toUpperCase()
                          )}
                      </span>

                      <span>→</span>

                      <strong>
                        {String(
                          activity.newStatus
                        )
                          .replaceAll(
                            "_",
                            " "
                          )
                          .replace(
                            /\b\w/g,
                            (char) =>
                              char.toUpperCase()
                          )}
                      </strong>
                    </div>
                  )}

                {activity?.oldAssignedTo ||
                  activity?.newAssignedTo ? (
                  <div className="lead-timeline-change">
                    <span>
                      {activity.oldAssignedTo ||
                        "Unassigned"}
                    </span>

                    <span>→</span>

                    <strong>
                      {activity.newAssignedTo ||
                        "Unassigned"}
                    </strong>
                  </div>
                ) : null}
              </div>
            </article>
          );
        }
      )}
    </div>
  );
};

export default LeadTimeline;