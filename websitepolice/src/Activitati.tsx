import React, { useState } from "react";
import axios from "axios";
// import "./Activitati.css";
import Header from "./header";

interface ActivityData {
  CNP: string;
  Nume: string;
  Prenume: string;
  Institutia: string;
  Post: string;
  DataIncepere: string;
  Durata: string;
}

interface InstitutieData {
    Institutia: string;
    Strada: string;
    Numar: string;
    Bloc: string;
    Scara: string;
    Etaj: string;
    Apartament: string;
    Oras: string;
    Judet: string;
    CodPostal: string;
  }

function Activitati() {
  const [data, setData] = useState<ActivityData[] | null>(null);
  const [error, setError] = useState("");
  const [cnp, setCnp] = useState("");
  const [institutiiData, setInstitutiiData] = useState<InstitutieData[] | null>(null);
  const [errorInstitutii, setErrorInstitutii] = useState("");
  const [institutieFilter, setInstitutieFilter] = useState("");

  const fetchActivitati = async () => {
    setError("");
    setData(null);
    const cnpRegex = /^\d{13}$/;
    if (!cnpRegex.test(cnp)) {
      setError("CNP-ul furnizat nu este valid. Trebuie să conțină 13 cifre.");
      return;
    }

    try {
      const response = await axios.get(`http://localhost:8080/api/activitati-persoane?cnp=${cnp}`);
      setData(response.data);
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        setError("Nu au fost găsite activități pentru acest CNP.");
      } else {
        setError("A apărut o eroare la încărcarea datelor. Încercați din nou mai târziu.");
      }
    }
  };

  const fetchInstitutii = async () => {
    setErrorInstitutii("");
    setInstitutiiData(null);
  
    try {
      const response = await axios.get(`http://localhost:8080/api/institutii?institutia=${encodeURIComponent(institutieFilter.trim())}`);
      setInstitutiiData(response.data);
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        setErrorInstitutii("Nu au fost găsite instituții în baza de date.");
      } else {
        setErrorInstitutii("A apărut o eroare la încărcarea datelor. Încercați din nou mai târziu.");
      }
    }
  };

  return (
    <div>
      <Header />
      <h1>Caută activitățile unei persoane după CNP</h1>
      <div>
        <input
          type="text"
          placeholder="Introdu CNP"
          value={cnp}
          onChange={(e) => setCnp(e.target.value)} // Actualizăm CNP-ul pe măsură ce utilizatorul scrie
          maxLength={13}
        />
        <button onClick={fetchActivitati}>Încarcă datele</button>
      </div>
      {error && <p className="error">{error}</p>}
      {data && (
        <table className="data-table">
          <thead>
            <tr>
              <th>CNP</th>
              <th>Nume</th>
              <th>Prenume</th>
              <th>Instituția</th>
              <th>Post</th>
              <th>Data Începere</th>
              <th>Durată</th>
            </tr>
          </thead>
          <tbody>
            {data.map((activitate, index) => (
              <tr key={index}>
                <td>{activitate.CNP}</td>
                <td>{activitate.Nume}</td>
                <td>{activitate.Prenume}</td>
                <td>{activitate.Institutia}</td>
                <td>{activitate.Post}</td>
                <td>{new Date(activitate.DataIncepere).toLocaleDateString()}</td>
                <td>{activitate.Durata} ani</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

    <h2>Lista Instituțiilor și Adresele Acestora</h2>
    <input
        type="text"
        placeholder="Filtrează după numele Instituției"
        value={institutieFilter}
        onChange={(e) => setInstitutieFilter(e.target.value)}
      />
    <button onClick={fetchInstitutii}>Încarcă Instituțiile</button>
    {errorInstitutii && <p className="error">{errorInstitutii}</p>}
    {institutiiData && (
      <table className="data-table">
        <thead>
          <tr>
            <th>Instituția</th>
            <th>Strada</th>
            <th>Număr</th>
            <th>Bloc</th>
            <th>Scara</th>
            <th>Etaj</th>
            <th>Apartament</th>
            <th>Oraș</th>
            <th>Județ</th>
            <th>Cod Poștal</th>
          </tr>
        </thead>
        <tbody>
          {institutiiData.map((institutie, index) => (
            <tr key={index}>
              <td>{institutie.Institutia}</td>
              <td>{institutie.Strada}</td>
              <td>{institutie.Numar || '-'}</td>
              <td>{institutie.Bloc || '-'}</td>
              <td>{institutie.Scara || '-'}</td>
              <td>{institutie.Etaj || '-'}</td>
              <td>{institutie.Apartament || '-'}</td>
              <td>{institutie.Oras}</td>
              <td>{institutie.Judet}</td>
              <td>{institutie.CodPostal}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
    </div>
  );
}

export default Activitati;
