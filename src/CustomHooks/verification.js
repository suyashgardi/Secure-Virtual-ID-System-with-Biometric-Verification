import { useState } from "react";
import axios from "axios";

export function useVerification(formData, setFormData) {
  const [isVerified, setIsVerified] = useState(false);
  const [isEmail, setIsEmail] = useState(false);
  const [resetToken, setResetToken] = useState("");

  const handleRequest = async (e) => {
    e.preventDefault();
    const actiondata = {
      ...formData,
      email: formData.email.trim(),
      action: "Send OTP",
      
    };
    
    setFormData(actiondata);
    
    try {
      const response = await axios.post("/api/validation", actiondata);
      if (response.data.isSent) {
        setIsEmail(true);
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

    try {
      const response = await axios.post("/api/validation", actiondata);
      if (response.data.isVerified) {
        setIsVerified(true);
        setResetToken(response.data.resetToken)
      }
    } catch (error) {
      const errormessage=error.response?.data?.message
      console.log(errormessage);
      alert(errormessage);
    }
  };


  return {
    isEmail,
    isVerified,
    resetToken,
    handleRequest,
    handleVerification,
  };
}