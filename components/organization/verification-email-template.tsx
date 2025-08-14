interface VerificationEmailTemplateProps {
  studentName: string
  studentId: string
  organization: string
  hours: number
  date: string
  description: string
  verificationLink: string
  coordinatorName?: string
  isOverride?: boolean
  overrideReason?: string
}

export function VerificationEmailTemplate({
  studentName,
  studentId,
  organization,
  hours,
  date,
  description,
  verificationLink,
  coordinatorName,
  isOverride = false,
  overrideReason,
}: VerificationEmailTemplateProps) {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      {/* Header */}
      <div
        style={{
          backgroundColor: "#9b1b30",
          color: "white",
          padding: "20px",
          textAlign: "center",
          borderRadius: "8px 8px 0 0",
        }}
      >
        <h1 style={{ margin: "0", fontSize: "24px" }}>CATA Volunteer Central</h1>
        <p style={{ margin: "5px 0 0 0", fontSize: "14px", opacity: "0.9" }}>
          {isOverride ? "Override Verification Request" : "Volunteer Hour Verification Request"}
        </p>
      </div>

      {/* Content */}
      <div
        style={{
          backgroundColor: "#ffffff",
          padding: "30px",
          border: "1px solid #e5e5e5",
          borderTop: "none",
          borderRadius: "0 0 8px 8px",
        }}
      >
        <p style={{ fontSize: "16px", marginBottom: "20px", color: "#333" }}>
          {coordinatorName ? `Dear ${coordinatorName}` : "Dear Coordinator"},
        </p>

        <p style={{ fontSize: "14px", lineHeight: "1.6", color: "#666", marginBottom: "20px" }}>
          {isOverride
            ? "A CATA student has requested verification for volunteer hours through our override system. Please review the details below and verify if the student completed the volunteer work as described."
            : "A CATA student has submitted volunteer hours that require your verification. Please review the details below and confirm if the student completed the volunteer work as described."}
        </p>

        {isOverride && overrideReason && (
          <div
            style={{
              backgroundColor: "#fff3cd",
              border: "1px solid #ffeaa7",
              borderRadius: "6px",
              padding: "15px",
              marginBottom: "20px",
            }}
          >
            <h3 style={{ margin: "0 0 10px 0", color: "#856404", fontSize: "16px" }}>Override Reason:</h3>
            <p style={{ margin: "0", color: "#856404", fontSize: "14px" }}>{overrideReason}</p>
          </div>
        )}

        {/* Student Information */}
        <div style={{ backgroundColor: "#f8f9fa", padding: "20px", borderRadius: "6px", marginBottom: "20px" }}>
          <h3 style={{ margin: "0 0 15px 0", color: "#1d3f72", fontSize: "18px" }}>Student Information</h3>
          <table style={{ width: "100%", fontSize: "14px" }}>
            <tr>
              <td style={{ padding: "5px 0", color: "#666", width: "120px" }}>Student Name:</td>
              <td style={{ padding: "5px 0", fontWeight: "bold", color: "#333" }}>{studentName}</td>
            </tr>
            <tr>
              <td style={{ padding: "5px 0", color: "#666" }}>Student ID:</td>
              <td style={{ padding: "5px 0", fontWeight: "bold", color: "#333" }}>{studentId}</td>
            </tr>
            <tr>
              <td style={{ padding: "5px 0", color: "#666" }}>Organization:</td>
              <td style={{ padding: "5px 0", fontWeight: "bold", color: "#333" }}>{organization}</td>
            </tr>
          </table>
        </div>

        {/* Volunteer Details */}
        <div style={{ backgroundColor: "#f8f9fa", padding: "20px", borderRadius: "6px", marginBottom: "25px" }}>
          <h3 style={{ margin: "0 0 15px 0", color: "#1d3f72", fontSize: "18px" }}>Volunteer Activity Details</h3>
          <table style={{ width: "100%", fontSize: "14px", marginBottom: "15px" }}>
            <tr>
              <td style={{ padding: "5px 0", color: "#666", width: "120px" }}>Date:</td>
              <td style={{ padding: "5px 0", fontWeight: "bold", color: "#333" }}>
                {new Date(date).toLocaleDateString()}
              </td>
            </tr>
            <tr>
              <td style={{ padding: "5px 0", color: "#666" }}>Hours:</td>
              <td style={{ padding: "5px 0", fontWeight: "bold", color: "#9b1b30", fontSize: "16px" }}>{hours}</td>
            </tr>
          </table>
          <div>
            <p style={{ margin: "0 0 5px 0", color: "#666", fontSize: "14px" }}>Activity Description:</p>
            <p
              style={{
                margin: "0",
                padding: "10px",
                backgroundColor: "#ffffff",
                border: "1px solid #e5e5e5",
                borderRadius: "4px",
                fontSize: "14px",
                color: "#333",
                lineHeight: "1.5",
              }}
            >
              {description}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ textAlign: "center", marginBottom: "25px" }}>
          <a
            href={verificationLink}
            style={{
              display: "inline-block",
              backgroundColor: "#9b1b30",
              color: "white",
              padding: "12px 30px",
              textDecoration: "none",
              borderRadius: "6px",
              fontSize: "16px",
              fontWeight: "bold",
              margin: "0 10px",
            }}
          >
            Verify Hours
          </a>
        </div>

        <div
          style={{
            borderTop: "1px solid #e5e5e5",
            paddingTop: "20px",
            fontSize: "12px",
            color: "#666",
            lineHeight: "1.5",
          }}
        >
          <p style={{ margin: "0 0 10px 0" }}>
            <strong>Important:</strong> This verification link is secure and can only be used once. Please only verify
            hours if you can confirm the student's participation in the volunteer activity.
          </p>
          <p style={{ margin: "0 0 10px 0" }}>
            If you have any questions or concerns, please contact the CATA Volunteer program administrator at{" "}
            <a href="mailto:support@catavolunteer.org" style={{ color: "#9b1b30" }}>
              support@catavolunteer.org
            </a>{" "}
            or (559) 327-3000.
          </p>
          <p style={{ margin: "0", fontSize: "11px", color: "#999" }}>
            This email was sent by the CATA Volunteer Central system. Please do not reply to this email.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", padding: "20px 0", fontSize: "12px", color: "#999" }}>
        <p style={{ margin: "0" }}>© 2024 CATA Central High School. All rights reserved.</p>
        <p style={{ margin: "5px 0 0 0" }}>CATA Volunteer Central - Empowering students to make a difference</p>
      </div>
    </div>
  )
}

export default VerificationEmailTemplate
