import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import KycReviewForm from "./applicationComponents/kycReviewForm";

import CarVerificationForm from "./applicationComponents/carVerificationForm";
import CreditScoreForm from "./applicationComponents/creditScoreForm";
import InspectionReportForm from "./applicationComponents/InspectionReportForm";
import ContractReviewForm from "./applicationComponents/contractReviewForm";
import CollectionCard from "./applicationComponents/collectionCard";
import LienMarkingForm from "./applicationComponents/lienMarkingForm";
import ApplicationStatusTimeline from "./applicationComponents/applicationStatusTimeline";
import ApplicationAuditLog from "./applicationComponents/applicationAuditLog";
import LoadingSpinner from "../shared/LoadingSpinner";
import moment from "moment";

function ApplicationPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const formType = localStorage.getItem("formType");

  const [application, setApplication] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [comments, setComments] = useState();
  const [loading, setLoading] = useState(true);
  const [isStatusLoading, setIsLoading] = useState(false);
  const activeTabRef = useRef("overview");

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const response = await axios.get(
          `https://credit-port-backend.vercel.app/v1/admin/form/get-by-id?id=${id}&formType=${formType}`
        );

        if (response.data.success) {
          const appData = response.data.data;
          sanitizePhoneFields(appData);
          setApplication(appData);
        }
      } catch (error) {
        console.error("Failed to fetch application:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [id, formType]);

  const handleStatuesSubmission = async () => {
    if (!comments.trim()) return; // Prevent empty submissions

    setIsLoading(true);

    try {
      const endpoint =
        application?.formType === "Salaried"
          ? "https://credit-port-backend.vercel.app/v1/salaried/individual/update/status"
          : "https://credit-port-backend.vercel.app/v1/business/individual/update/status";

      const payload = {
        id: application?.id,
        notes: comments,
        statusKey: "nadra_verisys",
      };

      const response = await axios.put(endpoint, payload);

      // Optionally show success toast here
      // toast.success("Comment saved successfully");

      activeTabRef.current = "kyc";
      setActiveTab("kyc");
    } catch (error) {
      console.error("Status update failed:", error);

      // Optionally show error toast here
      // toast.error("Failed to save comment");
    } finally {
      setIsLoading(false);
    }
  };

  const sanitizePhoneFields = (data) => {
    const fixJson = (str) => {
      try {
        return JSON.parse(str.replace(/'/g, '"'));
      } catch {
        return null;
      }
    };

    if (typeof data.phone === "string" && data.phone.includes("{")) {
      const fixed = fixJson(data.phone);
      if (fixed) data.phone = fixed;
    }

    if (
      typeof data.referencePhoneNumber === "string" &&
      data.referencePhoneNumber.includes("{")
    ) {
      const fixed = fixJson(data.referencePhoneNumber);
      if (fixed) data.referencePhoneNumber = fixed;
    }
  };

  const getStatusBadge = (label) => {
    const badgeStyles = {
      "Document Pending": "bg-warning text-dark",
      "Application Under Review": "bg-primary text-white",
      "NADRA Verisys": "bg-info text-dark",
      "Car Verification": "bg-secondary text-white",
      "Car Verification Pending": "bg-warning text-dark",
      "Credit Score": "bg-success text-white",
      Inspection: "bg-info text-white",
      "Inspection Listed By Customer": "bg-light text-dark",
      Evaluation: "bg-primary text-white",
      Contract: "bg-success text-white",
      "Inspection listing required": "bg-danger text-white",
      Rejected: "bg-danger text-white",
    };

    const badgeClass = badgeStyles[label] || "bg-secondary text-white";
    return <span className={`badge ms-2 ${badgeClass}`}>{label}</span>;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center mt-5">
        <LoadingSpinner small />
      </div>
    );
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      <header className="sticky-top border-bottom bg-white py-3">
        <div className="container-fluid d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2">
            <button
              className="btn btn-outline-secondary"
              onClick={() => navigate("/dashboard")}
            >
              Back
            </button>
            <h4 className="mb-0 ms-2">Application {application?.formNumber}</h4>
            {getStatusBadge(application?.currentStatus?.label ?? "")}
          </div>
          <button
            className="btn btn-outline-primary"
            onClick={() => navigate(`/application/${application?.id}/edit`)}
          >
            Edit
          </button>
        </div>
      </header>

      <div className="container-fluid py-4 flex-grow-1">
        <ul className="nav nav-tabs mb-3">
          {[
            "overview",
            "kyc",
            "car",
            "inspection",
            "credit",
            "contract",
            "collection",
            "lien Marking",
            "audit",
          ].map((tab) => (
            <li className="nav-item" key={tab}>
              <button
                className={`nav-link ${activeTab === tab ? "active" : ""}`}
                style={{ color: activeTab === tab ? undefined : "black" }}
                onClick={() => setActiveTab(tab)}
              >
                {tab === "kyc"
                  ? "Application"
                  : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            </li>
          ))}
        </ul>

        {activeTab === "overview" && (
          <div className="container-fluid">
            <div className="row">
              <div className="col-md-9 row">
                {/* Applicant Information */}
                <div className="col-md-6">
                  <div className="card">
                    <div className="card-header d-flex align-items-center gap-2">
                      <i className="bi bi-person-circle text-primary"></i>
                      <h5 className="mb-0">Applicant Information</h5>
                    </div>
                    <div className="card-body">
                      <div className="row g-3">
                        <div className="col-6">
                          <small className="text-muted">Name</small>
                          <p>{application?.name || "N/A"}</p>
                        </div>
                        <div className="col-6">
                          <small className="text-muted">CNIC</small>
                          <p>{application?.user?.cnic_number || "N/A"}</p>
                        </div>
                        <div className="col-6">
                          <small className="text-muted">Phone</small>
                          <p>
                            {application?.phone?.countryCode?? "-"}
                            {application?.phone?.phone ?? "-"}
                          </p>
                        </div>
                        <div className="col-6">
                          <small className="text-muted">Email</small>
                          <p>{application?.user?.email || "N/A"}</p>
                        </div>
                        <div className="col-12">
                          <small className="text-muted">Address</small>
                          <p>{application?.currentAddress || "N/A"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vehicle Information */}
                <div className="col-md-6">
                  <div className="card">
                    <div className="card-header d-flex align-items-center gap-2">
                      <i className="bi bi-truck-front-fill text-success"></i>
                      <h5 className="mb-0">Vehicle Information</h5>
                    </div>
                    <div className="card-body">
                      <div className="row g-3">
                        {[
                          {
                            label: "Make",
                            value: application?.Asset?.make?.name,
                          },
                          {
                            label: "Model",
                            value: application?.Asset?.model?.name,
                          },
                          {
                            label: "Year",
                            value: application?.Asset?.year?.year,
                          },
                          {
                            label: "Registration No.",
                            value: application?.Asset?.registrationNumber,
                          },
                          {
                            label: "Engine No.",
                            value: application?.Asset?.engineNumber,
                          },
                          {
                            label: "Chassis No.",
                            value: application?.Asset?.chassisNumber,
                          },
                        ].map((item, idx) => (
                          <div className="col-6" key={idx}>
                            <small className="text-muted">{item.label}</small>
                            <p>
                              {typeof item.value === "object"
                                ? JSON.stringify(item.value)
                                : item.value || "N/A"}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Loan Information */}
                <div className="col-md-6 mt-4">
                  <div className="card">
                    <div className="card-header d-flex align-items-center gap-2">
                      <i className="bi bi-credit-card-fill text-warning"></i>
                      <h5 className="mb-0">Loan Information (Pending)</h5>
                    </div>
                    <div className="card-body">
                      <div className="row g-3">
                        <div className="col-6">
                          <small className="text-muted">Loan Amount</small>
                          <p>PKR</p>
                        </div>
                        <div className="col-6">
                          <small className="text-muted">Loan Term</small>
                          <p>-</p>
                        </div>
                        <div className="col-6">
                          <small className="text-muted">Monthly Payment</small>
                          <p>PKR</p>
                        </div>
                        <div className="col-6">
                          <small className="text-muted">Submission Date</small>
                          <p>
                            {application?.application_status_logs?.[0]
                              ?.createdAt
                              ? moment(
                                  application.application_status_logs[0]
                                    .createdAt
                                ).format("DD/MM/YYYY hh:mm A")
                              : "-"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="col-md-3">
                <div className="card">
                  <div className="card-header">
                    <h5 className="mb-0">Application Timeline</h5>
                    <small className="text-muted">
                      Track the progress of this application
                    </small>
                  </div>
                  <div className="card-body">
                    <ApplicationStatusTimeline
                      log={application?.application_status_logs}
                      user={application?.user}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "kyc" && (
          <div className="tab-pane fade show active">
            <KycReviewForm
              application={application}
              setActiveTab={setActiveTab}
              setApplication={(status) => {
                setApplication({
                  ...application,
                  nadraVerificationStatus: status,
                });
              }}
            />
          </div>
        )}

        {activeTab === "car" && (
          <CarVerificationForm
            application={application}
            setActiveTab={setActiveTab}
            setApplication={(media) => {
              if (media?.url) {
                setApplication({
                  ...application,
                  carVerificationPhoto: [
                    ...(application?.carVerificationPhoto || []),
                    media,
                  ],
                  carVerificationStatus: "verified",
                });
              }
            }}
          />
        )}
        {activeTab === "inspection" && (
          <InspectionReportForm
            application={application}
            setActiveTab={setActiveTab}
            setApplication={(status) => {
              setApplication({
                ...application,
                inspectionStatus: status,
              });
            }}
          />
        )}
        {activeTab === "credit" && (
          <CreditScoreForm
            application={application}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === "contract" && (
          <ContractReviewForm
            application={application}
            setActiveTab={setActiveTab}
            setApplication={(status) => {
              setApplication({
                ...application,
                contractStatus: status,
              });
            }}
          />
        )}

        {activeTab === "collection" && (
          <CollectionCard
            application={application}
            setActiveTab={setActiveTab}
            setApplication={(status) => {
              setApplication({
                ...application,
                contractStatus: status,
              });
            }}
          />
        )}
        {activeTab === "lien Marking" && (
          <LienMarkingForm
            applicationId={application.id}
            setActiveTab={setActiveTab}
            setApplication={(status) => {
              setApplication({
                ...application,
                contractStatus: status,
              });
            }}
          />
        )}
        {activeTab === "audit" && (
          <div className="my-4">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">Audit Log</h5>
                <p className="text-muted small">
                  Track all actions taken on this application
                </p>
              </div>
              <div className="card-body">
                <ApplicationAuditLog applicationId={application?.id} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ApplicationPage;
