import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WelcomePage from './components/WelcomePage/WelcomePage';
import LogIn from './components/LogIn/LogIn';
import MainPage from './components/MainPage/MainPage';
import SignUp from './components/SignUp/SignUp';

import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LogIn />} />
        <Route path="/drive/*" element={<MainPage />} /> {/* I use the * /drive* to match all subroutes */}
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </Router>
  );
}

export default App;