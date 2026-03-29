import { useState } from "react";
import axios from "axios";


function PutSlides() {
  const [formData, setFormData] = useState({
    slideImg: null,
  });
  const handleChange = (e) => {

    setFormData({
      ...formData,
      slideImg: e.target.files[0],
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.slideImg) {
      alert("Please Upload a Slide");
      return;
    }
    try {
      const cloudinaryData = new FormData();
      cloudinaryData.append("file", formData.slideImg);

      cloudinaryData.append("upload_preset", "Personal_ID_Uploads");
      cloudinaryData.append("cloud_name", "dgdo0bswi");

      const cloudinaryRes = await axios.post(
        "https://api.cloudinary.com/v1_1/dgdo0bswi/image/upload",
        cloudinaryData,{
        withCredentials: false,
      }
      );

      const slideUrl = cloudinaryRes.data.secure_url;
      console.log("2. Success! Cloudinary URL:", slideUrl);

      const finalUserData = {
    
        photo: slideUrl,
      };
      const response = await axios.post("/api/putslide", finalUserData,{
        withCredentials: true,
      });
        alert("slides uploaded");
    
    } catch (err) {
      console.log("",err);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleChange} required />
        <button type="Submit" name="slideImg">
          {" "}
          Submit{" "}
        </button>
      </form>
    </div>
  );
}

export default PutSlides;