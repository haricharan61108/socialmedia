
import {BrowserRouter as Router,Route,Routes} from "react-router-dom";
import Signup from './components/Signup';
import Login from './components/Login';
import Hello from './components/Hello';
function App() {
  return (
    <>
    <Router>
      <Routes>
        <Route path='/signup' element={<Signup />} />
        <Route path='/login' element={<Login />} />
        <Route path='/hello' element={<Hello />} />
      </Routes>
    </Router>
    </>
  );
}

export default App;
