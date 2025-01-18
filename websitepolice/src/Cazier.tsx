import React, { useState } from 'react';
import axios from 'axios';
import Header from './header';
import './Cazier.css'; 

interface CazierData {
  Nume: string;
  Prenume: string;
  CNP: string;
  DataNasterii: string | null;
  Sex: string;
  DenumireInfractiune: string | null;
  Descriere: string | null;
  DataComitere: string | null;
  Sentinta: string | null;
  Durata: number | null;
  Amenda: number | null;
}

function Cazier() {
  const [cnp, setCNP] = useState<string>('');
  const [cazierData, setCazierData] = useState<CazierData[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCazierData([]);

    const trimmedCNP = cnp.trim();

    if (!trimmedCNP) {
      setError('Vă rugăm să introduceți un CNP.');
      return;
    }

    // Validarea CNP-ului (13 cifre)
    if (!/^\d{13}$/.test(trimmedCNP)) {
      setError('CNP-ul trebuie să conțină exact 13 cifre.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.get<CazierData[]>('http://localhost:8080/api/cazier-persoana', {
        params: { cnp: trimmedCNP },
      });

      if (response.data.length === 0) {
        // În mod ideal, ar trebui să existe cel puțin o înregistrare cu informații personale
        setError('Nu s-au găsit informații pentru CNP-ul introdus.');
        setLoading(false);
        return;
      }

      setCazierData(response.data);
    } catch (err: any) {
      console.error('Error fetching cazier details:', err);
      if (err.response && err.response.status === 404) {
        setError('Endpoint-ul nu a fost găsit (404). Verifică URL-ul.');
      } else if (err.response && err.response.status === 400) {
        setError(err.response.data.error || 'Cerere invalidă.');
      } else {
        setError('Eroare la încărcarea detaliilor cazierului. Încercați din nou mai târziu.');
      }
    }

    setLoading(false);
  };

  // Extrage informațiile personale din prima înregistrare, dacă există
  const personalInfo = cazierData.length > 0 ? {
    Nume: cazierData[0].Nume,
    Prenume: cazierData[0].Prenume,
    CNP: cazierData[0].CNP,
    DataNasterii: cazierData[0].DataNasterii,
    Sex: cazierData[0].Sex,
  } : null;

  // Verifică dacă există înregistrări în cazier
  const hasCazierEntries = cazierData.some(entry => entry.DenumireInfractiune !== null);

  return (
    <div>
      <Header />
      <div className="cazier-container">
        <h1>Căutare Cazier</h1>
        <form onSubmit={handleSearch} className="cazier-form">
          <input
            type="text"
            placeholder="Introdu CNP-ul"
            value={cnp}
            onChange={(e) => setCNP(e.target.value)}
            className="cazier-input"
            maxLength={13}
          />
          <button type="submit" className="cazier-button">Caută</button>
        </form>
        {error && <p className="error-text">{error}</p>}
        {loading && <p>Se încarcă...</p>}

        {personalInfo && (
          <div className="personal-info">
            <h2>Informații Personale</h2>
            <p><strong>Nume:</strong> {personalInfo.Nume}</p>
            <p><strong>Prenume:</strong> {personalInfo.Prenume}</p>
            <p><strong>CNP:</strong> {personalInfo.CNP}</p>
            <p><strong>Data Nașterii:</strong> {personalInfo.DataNasterii ? new Date(personalInfo.DataNasterii).toLocaleDateString() : 'Data necunoscută'}</p>
            <p><strong>Sex:</strong> {personalInfo.Sex}</p>
          </div>
        )}

        {personalInfo && (
          <div className="cazier-details">
            <h2>Detalii Cazier</h2>
            {hasCazierEntries ? (
              cazierData.map((c, index) => (
                c.DenumireInfractiune && (
                  <div key={`${c.CNP}-${c.DataComitere}-${index}`} className="cazier-entry">
                    <p><strong>Denumire Infracțiune:</strong> {c.DenumireInfractiune}</p>
                    <p><strong>Descriere:</strong> {c.Descriere}</p>
                    <p><strong>Data Comiterii:</strong> {c.DataComitere ? new Date(c.DataComitere).toLocaleDateString() : 'Data necunoscută'}</p>
                    <p><strong>Sentință:</strong> {c.Sentinta}</p>
                    <p><strong>Durata:</strong> {c.Durata !== null ? `${c.Durata} ani` : 'Durata necunoscută'}</p>
                    <p><strong>Amenda:</strong> {c.Amenda !== null ? `${c.Amenda} RON` : 'Amenda necunoscută'}</p>
                  </div>
                )
              ))
            ) : (
              <p className="cazier-curat">Cazier Curat</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Cazier;
