import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import People from "../Components/RegistersWindow";
import NavigationBar from "../Components/NavBar";
import { useAuth } from "../CustomHooks/userAuth";
import Footer from "../Components/footer"




axios.defaults.withCredentials = true;


function Dashboard() {
  const {user, isLoading} = useAuth();
  
  if (isLoading) return <div>Loading.... </div>;
  if (!user) return null;

  return (
    <div className="dashboard-container">
      <NavigationBar user={user} />
      <People user={user} />
      <Footer/>

    </div>
  );
}

export default Dashboard;
