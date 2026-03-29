import UserCard from "./userCard";
import { useState } from "react";
import RequestedID from "./FormComponents/requestedID";

function DownloadId({ idCards }) {
  const [isMatched, setIsMatched] = useState(false);
  const [userdata, setUserdata] = useState(idCards);

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

      {isMatched && (
        <UserCard
          key={userdata.registration_id}
          f_name={userdata.f_name}
          m_name={userdata.m_name}
          l_name={userdata.l_name}
          dob={userdata.dob}
          gender={userdata.gender}
          address={userdata.address}
          state={userdata.state}
          dist={userdata.dist}
          photo_path={userdata.photo_path}
          id_number={userdata.id_number}
        />
      )}
    </div>
  );
}

export default DownloadId;
