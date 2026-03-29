
const enterrows = (user,index) => (

  <tr key={user.id_number}>
    <td>{index+1}</td>
    <td>{`${user.f_name} ${user.m_name} ${user.l_name}`}</td>
    <td>{user.id_number}</td>
    <td>{user.email}</td>
  </tr>
);
function RegisteredUsers({ users }) {

  if (!users || users.length === 0) {
    return <p>No registered users found.</p>;
  }

  return (
    <div className="Table">

      <table>
        <thead>
          <tr>
            <th>Sr.no</th>
            <th>Name</th>
            <th>ID number</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>{users.map(enterrows)}</tbody>
      </table>
    </div>
  );
}

export default RegisteredUsers;
