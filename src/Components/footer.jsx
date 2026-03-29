import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

function Footer() {
  const date = new Date().getFullYear();
  return (
    <div className="Footer">
      <div className="Title">
        <p>GET YOUR ID</p>
        <div className="otherText">
          <p>Copyright © {date}</p>
          <p>email :developers@pids.com</p>
        </div>
      </div>
    </div>
  );
}

export default Footer;
