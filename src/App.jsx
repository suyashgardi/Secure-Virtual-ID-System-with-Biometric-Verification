import { Routes, Route } from 'react-router-dom';

import Main from './views/main';
import Login from './views/login';
import Signup from './views/signup';
import Register from './Components/register';
import Recover from './views/recover';
import Dashboard from './views/dashboard';
import PutSlides from './Components/PutSlides'



function App() {
  return (
    <Routes>
      <Route path="/" element={<Main />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/register" element={<Register />} />
      <Route path="/recover" element={<Recover/>}/>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/putslides" element={<PutSlides/>}></Route>

     
    </Routes>
  );
}

export default App;