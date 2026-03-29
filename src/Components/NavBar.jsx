import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

function NavigationBar(props) {
  const navigate = useNavigate();
  const handleLogout = () => {
    (localStorage.clear(), { withCredentials: true });
    navigate("/");
  };

  const goHome = () => {
    navigate("/dashboard");
  };
  return (
    <div className="NavigationBar">
      <span className="Dashboard" onClick={goHome}>
        Dashboard
      </span>
      <div className="leftside">
        <div className="User_greeting">Welcome {props.user.f_name}</div>
        <button className="Logout_btn" onClick={handleLogout}>
          {" "}
          Logout{" "}
        </button>
      </div>
    </div>
  );
}

export default NavigationBar;
