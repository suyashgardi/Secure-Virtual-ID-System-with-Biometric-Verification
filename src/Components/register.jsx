import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import LivenessScanner from "./LivenessScanner";
import RegisterForm from "./FormComponents/RegisterForm";
import { useAuth } from "../CustomHooks/userAuth";
import API from '../../../api.js';

function Register() {
  const { user, isLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFaceVerified, setIsFaceVerified] = useState(false);
  const [stateNames, setStateNames] = useState([]);
  const [distNames, setDistNames] = useState([]);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    f_name: "", m_name: "", l_name: "", dob: "", gender: "",
    address: "", district: "", state: "", phone: "", email: "",
    photo: null, facedata: null,
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const stateRes = await axios.get(`${API}/api/states`);
        setStateNames(stateRes.data);
        const distRes = await axios.get(`${API}/api/district`);
        setDistNames(distRes.data);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (formData.district) {
      const fetchState = async () => {
        try {
          const response = await axios.get(`${API}/api/state/${formData.district}`);
          const fetchedState = response.data[0]?.statename;
          if (fetchedState && formData.state !== fetchedState) {
            setFormData((prev) => ({ ...prev, state: fetchedState }));
          }
        } catch (error) {
          console.error("Error fetching state for district:", error);
        }
      };
      fetchState();
    }
  }, [formData.district]);

  useEffect(() => {
    const fetchDistricts = async () => {
      if (formData.state) {
        try {
          const response = await axios.get(`${API}/api/districts/${formData.state}`);
          setDistNames(response.data);
        } catch (error) {
          console.error("Error filtering districts:", error);
        }
      } else {
        try {
          const distRes = await axios.get(`${API}/api/district`);
          setDistNames(distRes.data);
        } catch (error) {
          console.error("Error resetting districts:", error);
        }
      }
    };
    fetchDistricts();
  }, [formData.state]);

  const handleVerificationFailed = () => {
    setFormData((prevData) => ({ ...prevData, photo: null }));
    setIsFaceVerified(false);
  };

  const handleChange = async (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUploadFile = async (e) => {
    setFormData({ ...formData, photo: e.target.files[0] });
    setIsFaceVerified(false);
  };

  const handleVerificationSuccess = (descriptorArray) => {
    setIsFaceVerified(true);
    setFormData((prevData) => ({ ...prevData, facedata: descriptorArray }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFaceVerified) { alert("Please Complete Face Verification"); return; }
    if (!formData.photo) { alert("Please Upload a profile photo!"); return; }

    setIsSubmitting(true);
    if (isSubmitting) return;

    try {
      const cloudinaryData = new FormData();
      cloudinaryData.append("file", formData.photo);
      cloudinaryData.append("upload_preset", "Personal_ID_Uploads");
      cloudinaryData.append("cloud_name", "dgdo0bswi");

      const cloudinaryRes = await axios.post(
        "https://api.cloudinary.com/v1_1/dgdo0bswi/image/upload",
        cloudinaryData,
        { withCredentials: false }
      );

      const photoUrl = cloudinaryRes.data.secure_url;
      const finalUserData = { ...formData, photo: photoUrl };

      await axios.post(`${API}/api/person`, finalUserData, { withCredentials: true });

      alert("User registered Successfully!");
      setFormData({
        f_name: "", m_name: "", l_name: "", dob: "", gender: "",
        address: "", district: "", state: "", phone: "", email: "",
        photo: null, facedata: null,
      });
      setIsFaceVerified(false);
      navigate("/dashboard");
    } catch (error) {
      console.error("Registration Error: ", error);
      alert("Registration Unsuccessful..! \ntry again");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div>Loading.... </div>;
  if (!user) return null;

  return (
    <div className="form-container">
      {isSubmitting && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Securely uploading your ID... Please wait.</p>
        </div>
      )}
      <RegisterForm
        isSubmitting={isSubmitting}
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        handleUploadFile={handleUploadFile}
        isFaceVerified={isFaceVerified}
        stateNames={stateNames}
        distNames={distNames}
      />
      {formData.photo && !isFaceVerified && (
        <LivenessScanner
          uploadedIdFile={formData.photo}
          onVerificationSuccess={handleVerificationSuccess}
          onVerificationFailed={handleVerificationFailed}
        />
      )}
    </div>
  );
}

export default Register;
