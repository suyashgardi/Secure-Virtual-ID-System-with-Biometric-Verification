import { useState } from "react";
import axios from "axios";
// import UserCard from "../Components/userCard";
import Register from "./register";
import Slideshow from "./slideShow";
import RegistredUsers from "./RgisteredUsers";
import DownloadId from "./DownloadId";
import UpdateUser from "../Components/updateUser";
import {GetUsers} from "../CustomHooks/getUsers"

function People() {
  const [idCards ,setIdCards]=GetUsers()
  const [showCards, setShowCards] = useState(false);
  const [regiForm, setRegiForm] = useState(false);
  const [showSlides, setShowSlides] = useState(true);
  const [downloadId, setDownloadId] = useState(false);
  const [updateID, setUpdateID] = useState(false);

  const handleRegister = (e) => {
    e.preventDefault();
    setRegiForm(true);
    setShowCards(false);
    setShowSlides(false);
    setDownloadId(false);
    setUpdateID(false);
  };

  const handleGetdata = async () => {
    try {

      setShowCards(true);
      setRegiForm(false);
      setShowSlides(false);
      setDownloadId(false);
      setUpdateID(false);
    } catch (error) {
      console.error("Failed to fetch ID cards:", error);
    }
  };

  const handleDownload = async () => {
    try {
      setShowCards(false);
      setRegiForm(false);
      setShowSlides(false);
      setDownloadId(true);
      setUpdateID(false);
    } catch {}
  };
  const handleUpdate = async () => {
    try {
      setShowCards(false);
      setRegiForm(false);
      setShowSlides(false);
      setDownloadId(false);
      setUpdateID(true);
    } catch (err) {
      console.log(err);
    }
  };

  const selectStyle = (type) => {
    if (type === "register" && regiForm) {
      return { backgroundColor: "#17a2b8", color: "white" };
    }
    if (type === "cards" && showCards) {
      return { backgroundColor: "#17a2b8", color: "white" };
    }
    if (type === "download" && downloadId) {
      return { backgroundColor: "#17a2b8", color: "white" };
    }
    if (type === "Update" && updateID) {
      return { backgroundColor: "#17a2b8", color: "white" };
    }

    return { backgroundColor: "white", color: "black" };
  };

  return (
    <div className="Register-Container">
      <div className="Register-sub">
        <div className="greetings">
          <h1>Welcome to Personal ID Registration System</h1>
          <p>
            Ready to secure your digital identity? By clicking the button below,
            you agree to our standard User Agreement.{" "}
          </p>
        </div>
        <div className="actions">
          <div onClick={handleRegister} style={selectStyle("register")}>
            Register New ID
          </div>
          <div onClick={handleGetdata} style={selectStyle("cards")}>
            My Registrations
          </div>
          <div onClick={handleDownload} style={selectStyle("download")}>
            Download ID Card
          </div>
          <div onClick={handleUpdate} style={selectStyle("Update")}>
            Update ID
          </div>
        </div>
      </div>
      <div className="ShowRegistered">
        {showSlides && <Slideshow />}
        {!showSlides && !downloadId && (
          <div className="outlineWin">
            {regiForm && <Register />}
            {showCards && <RegistredUsers users={idCards} />}
            {updateID && <UpdateUser idCards={idCards} />}
          </div>
        )}
        {downloadId && <DownloadId idCards={idCards} />}
      </div>
    </div>
  );
}

export default People;
