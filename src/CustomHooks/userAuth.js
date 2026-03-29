import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export function useAuth() {
  const [user, setUser] = useState(null);
 
  const [isLoading, setIsLoading] = useState(true); 
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await axios.get("/api/me");
        if (response.data.loggedIn) {
          setUser(response.data.user);
        } else {
          navigate("/login");
        }
      } catch (err) {
        navigate("/login");
      } finally {

        setIsLoading(false); 
      }
    };
    
    checkSession();
  }, [navigate]);

  return { user, isLoading };
}