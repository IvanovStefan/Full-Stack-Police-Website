import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "./header";
import "./Infractiuni.css"

interface InfractiuniData {
  NumarPersoaneCuCazier: number;
  NumarPersoaneFaraCazier: number;
}

interface Persoana {
  IDPersoana: number;
  Nume: string;
  Prenume: string;
  CNP: number;
  DataNasterii: string;
  Sex: string;
  }

function Infractiuni() {
  const [data, setData] = useState<InfractiuniData[] | null>(null);
  const [persoaneCazierActiv, setPersoaneCazierActiv] = useState<Persoana[]>([]);
  const [persoaneCazier, setPersoaneCazier] = useState<Persoana[]>([]);
  const [error, setError] = useState("");

  // Funcția care apelează API-ul
  const fetchInfractiuni = async () => {
    setError(""); // Resetăm erorile anterioare
    try {
      const response = await axios.get("http://localhost:8080/api/statistica-cazier");
      setData(response.data);
    } catch (error) {
      setError("Eroare la încărcarea datelor. Încercați din nou mai târziu.");
    }
  };

  const fetchPersoaneCazierActiv = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/cazier-activ");
      setPersoaneCazierActiv(response.data);
    } catch (err) {
      setError("Eroare la încărcarea persoanelor cu cazier activ.");
    }
  };

  const fetchPersoaneCazier = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/cazier");
      setPersoaneCazier(response.data);
    } catch (err) {
      setError("Eroare la încărcarea persoanelor cu cazier.");
    }
  };

  useEffect(() => {
    fetchInfractiuni();
    fetchPersoaneCazierActiv();
    fetchPersoaneCazier();
  }, []);

  return (
    <div>
      <Header />
      <div className="infractiuni-header">
        <h1 className="infractiuni-title">Statistica infracțiuni</h1>

        {data && data.length > 0 && (
          <div className="infractiuni-stats">
            <p>Număr persoane cu cazier: {data[0].NumarPersoaneCuCazier}</p>
            <p>Număr persoane fără cazier: {data[0].NumarPersoaneFaraCazier}</p>
          </div>
        )}
      </div>

      {error && <p className="error-text">{error}</p>}
      
      <h2>Persoane cu cazier</h2>
      {persoaneCazier.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>IDPersoana</th>
              <th>Nume</th>
              <th>Prenume</th>
              <th>CNP</th>
              <th>Data Nașterii</th>
              <th>Sex</th>
            </tr>
          </thead>
          <tbody>
            {persoaneCazier.map((p) => (
              <tr key={p.IDPersoana}>
                <td>{p.IDPersoana}</td>
                <td>{p.Nume}</td>
                <td>{p.Prenume}</td>
                <td>{p.CNP}</td>
                <td>{new Date(p.DataNasterii).toLocaleDateString()}</td>
                <td>{p.Sex}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Nu s-au găsit persoane cu cazier.</p>
      )}

      <h2>Persoane cu cazier activ</h2>
      {persoaneCazierActiv.length > 0 ? (
        <table>
          <thead>
            <tr>
                <th>IDPersoana</th>
                <th>Nume</th>
                <th>Prenume</th>
                <th>CNP</th>
                <th>Data Nașterii</th>
                <th>Sex</th>
            </tr>
          </thead>
          <tbody>
            {persoaneCazierActiv.map((p, idx) => (
              <tr key={idx}>
                <td>{p.IDPersoana}</td>
                <td>{p.Nume}</td>
                <td>{p.Prenume}</td>
                <td>{p.CNP}</td>
                <td>{new Date(p.DataNasterii).toLocaleDateString()}</td>
                <td>{p.Sex}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Nu s-au găsit persoane cu cazier activ.</p>
      )}


    </div>
  );
}

export default Infractiuni;
