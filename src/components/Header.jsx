// src/components/Header.jsx

import logo from '../assets/logo.png';

function Header() {
  return (
    <header>
      <img src={logo} alt="Leonardo Company Logo" className="logo" />
      <h1>Leonardo Baggage Handling System Summit</h1>
      <p>Dallas, TX | Attendee Registration</p>
    </header>
  );
}

export default Header;