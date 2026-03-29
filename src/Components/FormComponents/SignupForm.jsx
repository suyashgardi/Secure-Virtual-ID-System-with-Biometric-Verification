function SignupForm({
  formData,
  handleChange,
  handleSubmit,
  isValidated,
  handleVerification,
  handleSendOTP,
  isSent,
}
) {
  return (
    <div className="signup-container">
      <h1>Sign Up Your ID</h1>
      <form onSubmit={handleSubmit}>
        <div className="info">
          <div className="name">
            <input
              type="text"
              id="first-name"
              name="f_name"
              placeholder="First Name"
              value={formData.f_name}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              id="last-name"
              name="l_name"
              placeholder="Last Name"
              value={formData.l_name}
              onChange={handleChange}
              required
            />
          </div>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Enter email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <button type="button" onClick={handleSendOTP}>
            Send OTP
          </button>
          <input
            type="number"
            id="phone-number"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            id="password"
            name="password"
            placeholder="Create a New Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            id="confirm-password"
            name="confirm_password"
            placeholder="Confirm Password"
            value={formData.confirm_password}
            onChange={handleChange}
            required
          />

          {isSent && (
            <div>
              <input
                type="number"
                id="otp"
                name="otp"
                placeholder="Enter Verification Code Sent to your Email-ID"
                value={formData.otp}
                onChange={handleChange}
              />
              <button onClick={handleVerification}> Verify-Email</button>
            </div>
          )}
        </div>

        <button type="submit" disabled={!isValidated}>
          SIGN UP{" "}
        </button>

      </form>
    </div>
  );
}

export default SignupForm;
