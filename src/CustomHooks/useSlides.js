import { useState, useEffect } from "react";
import axios from "axios";
import API from '../../api.js';

export function useSlides() {
  const [slides, setSlides] = useState([]);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const response = await axios.get(`${API}/api/getslides`);
        setSlides(response.data);
      } catch (error) {
        console.error("Failed to fetch slides:", error);
      }
    };
    fetchSlides();
  }, []);

  return slides;
}
