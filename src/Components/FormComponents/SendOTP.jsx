function SendOTP({
  formData,
  handleChange,
  isEmail,
  handleVerification,
  handleRequest,
}) {
  return (
    <div className="Password-recovery-container">
        <p>To proceed you must verify YOur Email : Would you like to send otp to {String(formData.email).substring(3)}*******.com</p>
      <button type="submit" onClick={handleRequest}>
        Get OTP
      </button>

      {isEmail && (
        <div className="otp-verification">
          <form onSubmit={handleVerification}>
            <input
              type="number"
              name="otp"
              placeholder="Enter OTP "
              value={formData.otp}
              onChange={handleChange}
              required
            />
            <button type="submit">verify OTP</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default SendOTP;
