import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import LoginForm from "../Components/FormComponents/LoginForm";
import API from '../../api.js';

axios.defaults.withCredentials = true;

function Login() {
  const [formData, setFormData] = useState({ phone: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API}/api/sessions`, formData, { withCredentials: true });
      localStorage.setItem("user", JSON.stringify(response.data.user));
      navigate('/dashboard');
    } catch (error) {
      alert(error.response?.data?.error || "Login Failed! Please try again.");
    }
  };

  const handleForgotPassword = () => navigate('/recover');

  return (
    <div>
      <LoginForm formData={formData} handleChange={handleChange} handleSubmit={handleSubmit} forgotPassword={handleForgotPassword} />
    </div>
  );
}

export default Login;
