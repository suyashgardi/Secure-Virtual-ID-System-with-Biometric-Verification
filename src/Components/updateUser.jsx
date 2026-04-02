import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../CustomHooks/userAuth";
import axios from "axios";
import SendOTP from "./FormComponents/SendOTP";
import RequestedID from "./FormComponents/requestedID";
import { useVerification } from "../CustomHooks/verification";
import RegisterForm from "./FormComponents/RegisterForm";
import LivenessScanner from "./LivenessScanner";
import { GetUsers } from "../CustomHooks/getUsers";
import API from '../../../api.js';

function UpdateUser() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [idCards, setIdCards] = GetUsers();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFaceVerified, setIsFaceVerified] = useState(false);
  const [stateNames, setStateNames] = useState([]);
  const [distNames, setDistNames] = useState([]);
  const [isMatched, setIsMatched] = useState(false);
  const [userdata, setUserdata] = useState(null);
  const [isAuth, setIsAuth] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState("");

  const [formData, setFormData] = useState({
    f_name: "", m_name: "", l_name: "", dob: "", gender: "",
    address: "", district: "", state: "", id_number: "",
    phone: "", email: "", photo: "", facedata: "",
    caller: "Updater", action: "", otp: ""
  });

  useEffect(() => {
    if (userdata) {
      setFormData((prevData) => ({
        ...prevData,
        f_name: userdata.f_name, m_name: userdata.m_name, l_name: userdata.l_name,
        dob: userdata.dob, gender: userdata.gender, address: userdata.address,
        district: userdata.district, state: userdata.state, id_number: userdata.id_number,
        phone: userdata.phone, email: userdata.email, photo: userdata.photo,
        facedata: userdata.facedata,
      }));
    }
  }, [userdata]);

  const { isEmail, isVerified, resetToken, handleRequest, handleVerification } =
    useVerification(formData, setFormData);

  useEffect(() => {
    if (isVerified) setIsAuth(true);
  }, [isVerified]);

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
      const finalUserData = { ...formData, photo: photoUrl, resetToken: resetToken };

      await axios.patch(`${API}/api/person`, finalUserData, { withCredentials: true });

      alert("User updated Successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Updation Error: ", error);
      alert("Updation Unsuccessful..! \ntry again");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmail = (e) => { e.preventDefault(); setVerificationMethod("email"); };
  const handleFace = (e) => { e.preventDefault(); setVerificationMethod("face"); };

  if (isLoading) return <div>Loading.... </div>;
  if (!user) return null;

  return (
    <div>
      {!isMatched && (
        <RequestedID
          idCards={idCards}
          isMatched={isMatched}
          setIsMatched={setIsMatched}
          setUserdata={setUserdata}
        />
      )}
      {isMatched && !isAuth && (
        <div>
          <p>Select method to verify your identity</p>
          <button onClick={handleFace}>Verify Face</button>
          <button onClick={handleEmail}>Verify Email</button>
        </div>
      )}
      {verificationMethod === "email" && !isAuth && (
        <SendOTP
          handleRequest={handleRequest}
          handleVerification={handleVerification}
          handleChange={handleChange}
          isEmail={isEmail}
          formData={formData}
        />
      )}
      {isAuth && (
        <RegisterForm
          formData={formData}
          isSubmitting={isSubmitting}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          handleUploadFile={handleUploadFile}
          isFaceVerified={isFaceVerified}
          stateNames={stateNames}
          distNames={distNames}
        />
      )}
      {isAuth && formData.photo && !isFaceVerified && (
        <LivenessScanner
          isUpdating={true}
          uploadedIdFile={formData.photo}
          onVerificationSuccess={handleVerificationSuccess}
          onVerificationFailed={handleVerificationFailed}
        />
      )}
      {isSubmitting && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Securely updating your ID... Please wait.</p>
        </div>
      )}
    </div>
  );
}

export default UpdateUser;
