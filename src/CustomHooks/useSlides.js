import { useState, useEffect } from "react";
import axios from "axios";

export function useSlides() {
  const [slides, setSlides] = useState([]);

  useEffect(() => {
    const fetchSlides = async () => {
      try {

        const response = await axios.get("/api/slides");
        setSlides(response.data);
      } catch (error) {
        console.error("Failed to fetch slides:", error);
      }
    };

    fetchSlides();
  }, []); 

  return slides; 
}