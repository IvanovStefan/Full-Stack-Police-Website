// Meniu.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Meniu.css';

function Meniu() {
  return (
    <div className="meniu-container">
      <div className="meniu-content">
        <h1>Pagina principală a bazei de date a Poliției</h1>
        
        {/* Grid Principal */}
        <div className="meniu-grid">
          <Link to="/app" className="meniu-card">
            <h3>Persoane</h3>
            <p>Lista cu persoanele înregistrate</p>
          </Link>
          <Link to="/adrese" className="meniu-card">
            <h3>Adrese</h3>
            <p>Căutarea adresei unei persoane</p>
          </Link>
          <Link to="/permise" className="meniu-card">
            <h3>Permise de conducere</h3>
            <p>Lista permiselor de conducere</p>
          </Link>
          <Link to="/activitati" className="meniu-card">
            <h3>Activități</h3>
            <p>Căutarea activităților unei persoane și adresele acestora</p>
          </Link>
        </div>

        {/* Grid Secundar */}
        <div className="meniu-grid-secondary">
          <Link to="/infractiuni" className="meniu-card">
            <h3>Infracțiuni</h3>
            <p>Lista cazierelor înregistrate</p>
          </Link>
          <Link to="/cazier" className="meniu-card">
            <h3>Cazier</h3>
            <p>Interogarea cazierului unei persoane</p>
          </Link>
        </div>

        {/* Grid Terțiar */}
        <div className="meniu-grid-tertiary">
          <Link to="/new-persoane" className="meniu-card">
            <h3>Adăugare Persoane</h3>
            <p>Adăugarea în evidență a noilor persoane</p>
          </Link>
          <Link to="/new-cazier" className="meniu-card">
            <h3>Adăugare Cazier</h3>
            <p>Adăugarea în evidență a noilor cazier</p>
          </Link>
          <Link to="/new-permis" className="meniu-card">
            <h3>Adăugare Permise de Conducere</h3>
            <p>Adăugarea în evidență a permiselor de conducere</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Meniu;
