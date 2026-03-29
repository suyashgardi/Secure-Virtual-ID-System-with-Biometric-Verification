import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
function Main() {
  return (
    <div className="main-container">
      <h1>Welcome to Personal ID System </h1>
      <p>Please click the button below to Signup/login </p>

      <Link to="/login">
        <button>LOGIN NOW</button>
      </Link>

      <Link to="/signup">
        <button>SIGNUP NOW</button>
      </Link>
      
    </div>
  );
}

export default Main;
