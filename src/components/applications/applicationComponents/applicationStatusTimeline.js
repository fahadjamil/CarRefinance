import React from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import moment from "moment";

const ApplicationStatusTimeline = ({ log, user }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <i className="bi bi-check-circle-fill text-success fs-5"></i>;
      case "in_progress":
        return <i className="bi bi-clock-fill text-warning fs-5"></i>;
      case "pending":
        return <i className="bi bi-clock text-secondary fs-5"></i>;
      case "failed":
        return (
          <i className="bi bi-exclamation-circle-fill text-danger fs-5"></i>
        );
      default:
        return <i className="bi bi-clock text-secondary fs-5"></i>;
    }
  };

  return (
    <div className="d-flex flex-column gap-4">
      {log?.map((item, index) => {
        const isLastItem = index === log.length - 1;
        const statusLabel = isLastItem ? "In Progress" : "Completed";
        const statusColor = isLastItem ? "text-warning" : "text-success";

        const formattedDateTime = item.createdAt
          ? moment(item.createdAt).format("DD/MM/YYYY hh:mm A")
          : "-";

        return (
          <div key={index} className="d-flex gap-3">
            <div className="d-flex flex-column align-items-center">
              <div
                className="rounded-circle border bg-light d-flex align-items-center justify-content-center"
                style={{ width: "32px", height: "32px" }}
              >
                {getStatusIcon(item.application_status.key)}
              </div>
              {!isLastItem && (
                <div
                  style={{
                    height: "100%",
                    width: "2px",
                    backgroundColor: "#dee2e6",
                  }}
                ></div>
              )}
            </div>

            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <strong>{item.application_status.label}</strong>
                <span className={`badge bg-opacity-25 ${statusColor} border`}>
                  {statusLabel}
                </span>
              </div>
              <p className="mb-1 text-muted small">{item.notes}</p>
              <div className="text-muted small">
                {formattedDateTime} • {user?.firstName || "System"}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
export default ApplicationStatusTimeline;
