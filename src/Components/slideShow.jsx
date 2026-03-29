import { useState, useEffect } from "react";
import axios from "axios";

function Slideshow() {
  const [slides, setSlides] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const response = await axios.get("/api/getslides");

        setSlides(response.data); 
      } catch (error) {
        console.error("Failed to fetch slides:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSlides();
  }, []); 

  useEffect(() => {
    if (slides.length <= 1) return; 

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 4000); 

    return () => clearInterval(timer);
  }, [slides.length]); 


  const nextSlide = () => {
    if (slides.length > 0) {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }
  };

  const prevSlide = () => {
    if (slides.length > 0) {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
    }
  };

  const goToSlide = (slideIndex) => {
    setCurrentIndex(slideIndex);
  };

  if (isLoading) {
    return (
      <div className="slideshow-wrapper">
        <div>
          <h2>Loading Dashboard Slides...</h2>
        </div>
      </div>
    );
  }


  if (!slides || slides.length === 0) {
    return (
      <div className="slideshow-wrapper">
        <div >
          <h2>No images available</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="slideshow-wrapper" style={{width: "100%"}}>
      
      <div className="slideshow-container">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`slide ${index === currentIndex ? "active" : ""}`}
            style={{ display: index === currentIndex ? "block" : "none", height: "100%" }} 
          >

            <img 
              src={slide.slide_url} 
              alt={`Dashboard slide ${index + 1}`} 
              style={{ width: "100%", height: "100%", objectFit: "cover" }} 
            />
          </div>
        ))}
      </div>

  
      {slides.length > 1 && (
        <div className="slideshow-controls" style={
          {width:"100%", display:"flex"}
        }>
          <button onClick={prevSlide} className="nav-btn">❮ Prev</button>
          
          <div className="dots-container">
            {slides.map((_, index) => (
              <span
                key={index}
                className={`dot ${index === currentIndex ? "active-dot" : ""}`}
                onClick={() => goToSlide(index)}
                style={{ cursor: "pointer", margin: "0 5px" }}
              >
                ●
              </span>
            ))}
          </div>

          <button onClick={nextSlide} className="nav-btn">Next ❯</button>
        </div>
      )}

    </div>
  );
}

export default Slideshow;