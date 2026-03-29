function RegisterForm({
  formData,
  handleChange,
  handleSubmit,
  isSubmitting,
  handleUploadFile,
  isFaceVerified,
  stateNames,
  distNames
}) {
  return (
    <div className="RegisterForm">
      <h1>Register Your ID</h1>
      <form onSubmit={handleSubmit}>
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
            id="middle-name"
            name="m_name"
            placeholder="Middle Name"
            value={formData.m_name}
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
        <div className="personal-info">
          <input
            type="date"
            id="dob"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            required
          />
          <select
            name="gender"
            id="gender"
            value={formData.gender}
            onChange={handleChange}
            required
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <input
          type="text"
          name="address"
          id="address"
          placeholder="Address"
          value={formData.address}
          onChange={handleChange}
          required
        />

        <div className="addr">

          <div>
            <select
              name="district"
              value={formData.district}
              onChange={handleChange}
              required
            >
              <option value="">-- Select District --</option>
              {distNames &&
                distNames.map((d, index) => (
                  <option key={index} value={d.distname}>
                    {d.distname}
                  </option>
                ))}
            </select>
          </div>

          <div>

            <select
              name="state"
              value={formData.state}
              onChange={handleChange}
              required
            >
              <option value="">-- Select State --</option>
              {stateNames &&
                stateNames.map((s, index) => (
                  <option key={index} value={s.statename}>
                    {s.statename}
                  </option>
                ))}
            </select>
          </div>

          
        </div>
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
          type="email"
          id="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="file"
          name="photo"
          id="photo"
          accept="image/*"
          onChange={handleUploadFile}
          required
        />
        <button type="submit" disabled={isSubmitting || !isFaceVerified}>
          Register
        </button>
      </form>
    </div>
  );
}

export default RegisterForm;
