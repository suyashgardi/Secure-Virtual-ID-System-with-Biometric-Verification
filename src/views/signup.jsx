import { useNavigate, Link, Navigate } from "react-router-dom";
import { useState } from "react";
import SignupForm from "../Components/FormComponents/SignupForm";
import axios from "axios";
import API from '../../api.js';

function Signup() {
  const [formData, setFormData] = useState({
    f_name: "",
    l_name: "",
    phone: "",
    email: "",
    password: "",
    confirm_password: "",
    otp: "",
    action: "",
    caller:"",
  });
  const [isValidated, setIsValidated] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSendOTP = async (e) => {
    console.log("triggered SendOTP")
    e.preventDefault();

    const actiondata = {
      ...formData,
      email: formData.email.trim(),
      action: "Send OTP",
      caller:"signupform"
    };
    setFormData(actiondata);
    try {
      const response = await axios.post(`${API}/api/validation`, actiondata);
      if (response.data.isSent) {
        setIsSent(true);
        alert(response.data.message);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message;
      alert(errorMessage);
    }
  };

  const handleVerification = async (e) => {
    e.preventDefault();
    
    const actiondata = {
      ...formData,
      action: "verify OTP",
    };
    setFormData(actiondata);
    try {
      const response = await axios.post(`${API}/api/validation`, actiondata);
      if (response.data.isVerified) {
        setIsValidated(true);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message;
      alert(errorMessage);
    }
  };
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidated) {
      alert("please verify your email");
      return null;
    }

    try {
      const response = await axios.post(`${API}/api/users`, formData);
      alert("SignUP Successful \nproceed to Log-In");
      navigate("/login");
    } catch (error) {
      console.error("error: ", error);
      // Let's read the exact error your Express backend sends!
      alert(
        error.response?.data?.error ||
          error.response?.data ||
          "SignUp Failed \n Try Again!",
      );

      navigate("/signup");
    }
  };

  return (
    <SignupForm
      handleChange={handleChange}
      handleSubmit={handleSubmit}
      formData={formData}
      isValidated={isValidated}
      handleVerification={handleVerification}
      handleSendOTP={handleSendOTP}
      isSent={isSent}
    />
  );
}
export default Signup;
