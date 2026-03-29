import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import ForgotPassword from "../Components/FormComponents/ForgotPassword";


import { useVerification } from "../CustomHooks/verification"; 

function Recover() {
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    password: "",
    confirmPassword: "",
    action: "",
  });

  const navigate = useNavigate();


  const { 
    isEmail, 
    isVerified, 
    resetToken,
    handleRequest, 
    handleVerification 
  } = useVerification(formData, setFormData);

  const handleChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {

      const token = {
        ...formData,
        resetToken: resetToken 
      };
      const response = await axios.patch('/api/newpassword', token);
      if (response) {
        alert(response.data.message);
        navigate("/login");
      }
    } catch (error) {
      console.error("Backend Error:", error);
    }
  };

  const handleReturn = () => {
    navigate("/login");
  };

  return (
    <div>
      {/* Notice how nothing changes down here! */}
      <ForgotPassword
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        handleVerification={handleVerification}
        handleRequest={handleRequest}
        isEmail={isEmail}
        isVerified={isVerified}
        returnLogin={handleReturn}
      />
    </div>
  );
}

export default Recover;