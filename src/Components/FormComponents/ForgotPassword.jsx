function ForgotPassword({
  formData,
  handleChange,
  handleSubmit,
  isEmail,
  isVerified,
  handleVerification,
  handleRequest,
  returnLogin
}) {
  return (
    <div className="Password-recovery-container">
      <form onSubmit={handleRequest}>
        <input
          type="email"
          name="email"
          placeholder="Enter your E-mail"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <button type="submit">Get OTP</button>
      </form>

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

          {isVerified && (
            <div>
             
              <form onSubmit={handleSubmit}>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter New Password "
                  value={formData.password }
                  onChange={handleChange}
                  required
                />
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password "
                  value={formData.confirmPassword }
                  onChange={handleChange}
                  required
                />
                <button type="submit">Reset Password</button>
                
                <button type="button" onClick={returnLogin}>Cancel</button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ForgotPassword;