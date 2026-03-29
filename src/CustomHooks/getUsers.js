import axios from "axios";
import { useState, useEffect } from "react";

export function GetUsers() {
  const [idCards, setIdCards] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("/api/userids");
        if (response && response.data) {
          setIdCards(response.data);
        }
      } catch (error) {
        console.error("Error fetching user IDs:", error);
      }
    };

    fetchUsers();
  }, []); 
  return [idCards, setIdCards]; 
}