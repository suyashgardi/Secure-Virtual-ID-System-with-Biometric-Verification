import { useState } from "react";

import { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

function calculateAge(dateOfBirth) {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}

function UserCard(props) {
  const cardRef = useRef(null);
  const [isPrinting, setIsPrinting] = useState(false);

  const handleclick = () => {
    setIsPrinting(true);

    setTimeout(async () => {
      try {
        const element = cardRef.current;
        if (!element) return;

        const canvas = await html2canvas(element, {
          scale: 3,
          useCORS: true,
        });

        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = 100;
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 10, 10, pdfWidth, pdfHeight);
        pdf.save(`${props.f_name}_Virtual_ID.pdf`);
      } catch (err) {
        console.error("Print failed:", err);
      } finally {
        setIsPrinting(false);
      }
    }, 100);
  };

  return (
    <div class="card-modern" ref={cardRef}>
      <div class="card-header">
        <span class="header-title">Personal ID</span>
        <button class="download-button" title="Download" onClick={handleclick} disabled={isPrinting}>
          <i class="fas fa-download"></i>{" "}
        </button>
      </div>

      <div class="card-body">
        <div class="photo-container">
          <img
            class="profile-photo"
            src={props.photo_path}
            alt="Profile Photo"
          />
        </div>

        <div class="details-container">
          <p>
            <strong class="label">Name:</strong>
            <span class="value">
              {props.f_name} {props.m_name} {props.l_name}
            </span>
          </p>
          <p>
            <strong class="label">Date of Birth:</strong>
            <span class="value">
              {new Date(props.dob).toLocaleDateString()}
            </span>
          </p>
          <p>
            <strong class="label">Age:</strong>
            <span class="value">{calculateAge(props.dob)}</span>
          </p>
          <p>
            <strong class="label">Gender:</strong>
            <span class="value">{props.gender}</span>
          </p>
          <p class="address-paragraph">
            <strong class="label">Address:</strong>
            <span class="value address-text">
              {props.address} dist-{props.dist}, state-{props.state}
            </span>
          </p>
        </div>
      </div>

      <div class="card-footer">
        <span class="id-number">{props.id_number}</span>
      </div>
    </div>
  );
}
export default UserCard;
