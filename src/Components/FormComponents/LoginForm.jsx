

function LoginForm({ formData, handleChange, handleSubmit,forgotPassword }) {
  return (
    <div className="Login-container">
      <h1>Login Your ID</h1>
      <form onSubmit={handleSubmit}>
        <div className="info">
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
            placeholder="Enter Your Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <p onClick={forgotPassword}> forgot Password ? </p>
          <button type="submit">LOGIN </button>
        </div>
      </form>
    </div>
  );
}

export default LoginForm;
