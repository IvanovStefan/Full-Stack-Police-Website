import React, { useState } from "react";
import axios from "axios";
//import "./Adrese.css";
import Header from "./header"

interface AddressData {
  CNP: string;
  Nume: string;
  Prenume: string;
  DataObtinere: string;
  Domiciliu: boolean;
  Strada: string;
  Numar: number;
  Bloc: number;
  Scara: string;
  Etaj: number;
  Apartament: number;
  Oras: string;
  Judet: string;
  CodPostal: string;
  NrPersoane: number;
}

function Adrese() {
  const [data, setData] = useState<AddressData[] | null>(null);
  const [error, setError] = useState("");
  const [cnp, setCnp] = useState("");

  const fetchAdrese = async () => {
    setError(""); // Resetăm erorile anterioare
    try {
      const response = await axios.get(`http://localhost:8080/api/adrese?cnp=${cnp}`);
      setData(response.data);
    } catch (error) {
      setError("Introduceti un CNP valid!");
    }
  };

  return (
    <div>
      <Header />
      <h1>Cauta adresele unei persoane dupa CNP</h1>
      <div>
      <input
          type="text"
          placeholder="Introdu CNP"
          value={cnp}
          onChange={(e) => setCnp(e.target.value)} // Actualizăm CNP-ul pe măsură ce utilizatorul scrie
          maxLength={13}
        />
        <button onClick={fetchAdrese}>Încarcă datele</button>
      </div>
      {error && <p className="error">{error}</p>}
      {data && (
        <table className="data-table">
          <thead>
            <tr>
              <th>CNP</th>
              <th>Nume</th>
              <th>Prenume</th>
              <th>Data Obținere</th>
              <th>Domiciliu</th>
              <th>Stradă</th>
              <th>Număr</th>
              <th>Bloc</th>
              <th>Scară</th>
              <th>Etaj</th>
              <th>Apartament</th>
              <th>Oraș</th>
              <th>Județ</th>
              <th>Cod Poștal</th>
              <th>Nr Persoane</th>
            </tr>
          </thead>
          <tbody>
            {data.map((adresa, index) => (
              <tr key={index}>
                <td>{adresa.CNP}</td>
                <td>{adresa.Nume}</td>
                <td>{adresa.Prenume}</td>
                <td>{new Date(adresa.DataObtinere).toLocaleDateString()}</td>
                <td>{adresa.Domiciliu ? "Da" : "Nu"}</td>
                <td>{adresa.Strada}</td>
                <td>{adresa.Numar ?? '-'}</td>
                <td>{adresa.Bloc ?? '-'}</td>
                <td>{adresa.Scara ?? '-'}</td>
                <td>{adresa.Etaj ?? '-'}</td>
                <td>{adresa.Apartament ?? '-'}</td>
                <td>{adresa.Oras}</td>
                <td>{adresa.Judet}</td>
                <td>{adresa.CodPostal}</td>
                <td>{adresa.NrPersoane ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Adrese;