import { useState } from "react";

function RequestedID({ idCards, setIsMatched, setUserdata }) {
  const [requestedID, setRequestedID] = useState("");
  const handleChange = (e) => {
    setRequestedID(e.target.value);
  };
  const handleSubmit = (e) => {
    e.preventDefault();

    const foundUser = idCards.filter((user) => user.id_number === requestedID);

    if (foundUser.length > 0) {
      setUserdata(foundUser[0]);
      setIsMatched(true);
    } else {
      alert("ID Number not found. Please check and try again.");
      setUserdata(null);
      setIsMatched(false);
    }
  };
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="idnum"
          placeholder="Enter ID Number "
          value={requestedID.idnum}
          onChange={handleChange}
          required
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default RequestedID;
