interface VerificationSuccessTemplateProps {
  studentName: string
  coordinatorName?: string
  organization: string
  hours: number
  date: string
  action: "approved" | "denied"
  reason?: string
}

export function VerificationSuccessTemplate({
  studentName,
  coordinatorName,
  organization,
  hours,
  date,
  action,
  reason,
}: VerificationSuccessTemplateProps) {
  const isApproved = action === "approved"

  return (
    <div style={{ fontFamily: "Arial, sans-serif", maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      {/* Header */}
      <div
        style={{
          backgroundColor: isApproved ? "#22c55e" : "#ef4444",
          color: "white",
          padding: "20px",
          textAlign: "center",
          borderRadius: "8px 8px 0 0",
        }}
      >
        <h1 style={{ margin: "0", fontSize: "24px" }}>volunteer</h1>
        <p style={{ margin: "5px 0 0 0", fontSize: "14px", opacity: "0.9" }}>
          Verification {isApproved ? "Confirmed" : "Denied"}
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
          Thank you for your response regarding {studentName}'s volunteer hours. Your verification has been recorded and
          the student has been notified of the decision.
        </p>

        {/* Verification Summary */}
        <div
          style={{
            backgroundColor: isApproved ? "#f0fdf4" : "#fef2f2",
            border: `1px solid ${isApproved ? "#bbf7d0" : "#fecaca"}`,
            borderRadius: "6px",
            padding: "20px",
            marginBottom: "20px",
          }}
        >
          <h3
            style={{
              margin: "0 0 15px 0",
              color: isApproved ? "#166534" : "#dc2626",
              fontSize: "18px",
              display: "flex",
              alignItems: "center",
            }}
          >
            {isApproved ? "✓ Hours Verified" : "✗ Hours Denied"}
          </h3>
          <table style={{ width: "100%", fontSize: "14px" }}>
            <tr>
              <td style={{ padding: "5px 0", color: "#666", width: "120px" }}>Student:</td>
              <td style={{ padding: "5px 0", fontWeight: "bold", color: "#333" }}>{studentName}</td>
            </tr>
            <tr>
              <td style={{ padding: "5px 0", color: "#666" }}>Organization:</td>
              <td style={{ padding: "5px 0", fontWeight: "bold", color: "#333" }}>{organization}</td>
            </tr>
            <tr>
              <td style={{ padding: "5px 0", color: "#666" }}>Date:</td>
              <td style={{ padding: "5px 0", fontWeight: "bold", color: "#333" }}>
                {new Date(date).toLocaleDateString()}
              </td>
            </tr>
            <tr>
              <td style={{ padding: "5px 0", color: "#666" }}>Hours:</td>
              <td style={{ padding: "5px 0", fontWeight: "bold", color: isApproved ? "#166534" : "#dc2626" }}>
                {hours}
              </td>
            </tr>
          </table>
          {!isApproved && reason && (
            <div style={{ marginTop: "15px" }}>
              <p style={{ margin: "0 0 5px 0", color: "#666", fontSize: "14px", fontWeight: "bold" }}>
                Reason for Denial:
              </p>
              <p
                style={{
                  margin: "0",
                  padding: "10px",
                  backgroundColor: "#ffffff",
                  border: "1px solid #fecaca",
                  borderRadius: "4px",
                  fontSize: "14px",
                  color: "#dc2626",
                  lineHeight: "1.5",
                }}
              >
                {reason}
              </p>
            </div>
          )}
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
            Your verification decision has been recorded in our system and the student has been automatically notified.
            {isApproved
              ? " The verified hours will be added to the student's volunteer record."
              : " The student can resubmit their hours with additional documentation if needed."}
          </p>
          <p style={{ margin: "0 0 10px 0" }}>
            If you have any questions about the volunteer program, please contact us at{" "}
            <a href="mailto:support@catavolunteer.org" style={{ color: "#9b1b30" }}>
              support@catavolunteer.org
            </a>{" "}
            or (559) 327-3000.
          </p>
          <p style={{ margin: "0", fontSize: "11px", color: "#999" }}>
            This email was sent by the volunteer system. Please do not reply to this email.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", padding: "20px 0", fontSize: "12px", color: "#999" }}>
        <p style={{ margin: "0" }}>© 2024 CATA Central High School. All rights reserved.</p>
        <p style={{ margin: "5px 0 0 0" }}>volunteer - Empowering students to make a difference</p>
      </div>
    </div>
  )
}

export default VerificationSuccessTemplate
