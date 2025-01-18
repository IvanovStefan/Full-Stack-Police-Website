import React from 'react';
import './Header.css';
import { useNavigate } from 'react-router-dom';

function Header() {

  const navigate = useNavigate();

  const handleTitleClick = () => {
    navigate('/meniu');
  };

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="clickable-title" onClick={handleTitleClick}>
          Baza De Date Politie
        </h1>
      </div>
      <div className="header-right">
        <button className="nav-button" onClick={() => navigate('/new-persoane')}>Adăugare Persoane</button>
        <button className="nav-button" onClick={() => navigate('/new-cazier')}>Adăugare Cazier</button>
        <button className="nav-button" onClick={() => navigate('/new-permis')}>Adăugare Permis</button>
      </div>
    </header>
  );
}

export default Header;