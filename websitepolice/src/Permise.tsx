import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Permise.css";
import Header from "./header";

interface PermiseData {
  Categorie: string;
  Permise: number;
}

interface PermisePersoaneData {
    CNP: string;
    Nume: string;
    Prenume: string;
    DataExpirare: string;
  }

  interface Permis {
    Nume: string;
    Prenume: string;
    CNP: string;
    DataExpirare: string;
    A: string | null;
    A1: string | null;
    A2: string | null;
    B: string | null;
    B1: string | null;
    B2: string | null;
    C: string | null;
    C1: string | null;
    CE: string | null;
    D: string | null;
    D1: string | null;
    DE: string | null;
    Tr: string | null;
    Tb: string | null;
    Tv: string | null;
  }

function Permise() {
  const [data, setData] = useState<PermiseData[]>([]);
  const [persoaneData, setPersoaneData] = useState<PermisePersoaneData[]>([]);
  const [filteredData, setFilteredData] = useState<PermisePersoaneData[]>([]);
  const [viewExpired, setViewExpired] = useState(false);
  const [error, setError] = useState("");

  const fetchPermise = async () => {
    setError(""); // Resetăm erorile anterioare
    try {
      const response = await axios.get("http://localhost:8080/api/nrpermise");
      setData(response.data);
    } catch (error) {
      setError("A apărut o eroare la preluarea datelor.");
    }
  };

  const fetchPersoanePermise = async () => {
    setError(""); // Resetăm erorile anterioare
    try {
      const response = await axios.get("http://localhost:8080/api/persoane-permise");
      setPersoaneData(response.data);
      setFilteredData(response.data);
    } catch (error) {
      setError("A apărut o eroare la preluarea datelor persoanelor.");
    }
  };

  const [permise, setPermise] = useState<Permis[]>([]);

  const fetchPermiseExtended = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/extended-permise');
      setPermise(response.data);
    } catch (error) {
      setError("A apărut o eroare la preluarea datelor.");
    }
  };

  useEffect(() => {
    fetchPermise();
    fetchPersoanePermise();
    fetchPermiseExtended();
  }, []);

  const toggleView = (expired: boolean) => {
    setViewExpired(expired);
    if (expired) {
      const today = new Date();
      setFilteredData(
        persoaneData.filter((item) => new Date(item.DataExpirare) < today)
      );
    } else {
      setFilteredData(persoaneData); // Revine la datele complete
    }
  };

  const transformDataToRows = (data: PermiseData[]) => {
    const row1 = data.map((item) => item.Categorie); // Prima linie - doar categoriile
    const row2 = data.map((item) => item.Permise.toString()); // A doua linie - numărul de permise
    return [row1, row2];
  };

  const [row1, row2] = transformDataToRows(data);

  const formatDate = (date: string | null) => {
    if (!date) return '-'; // If there's no date, return a placeholder

    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('en-GB');
  };

  return (
    <div>
      <Header />


      <div className="header-container">
        <h2>Lista permiselor emise pe categorii</h2>
        <button onClick={fetchPermise}>Actualizează datele</button>
      </div>
      {error && <p className="error">{error}</p>}
      <table className="data-table">
        <thead>
          <tr>
            {row1.map((categorie, index) => (
              <th key={index}>
                {categorie}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {row2.map((permise, index) => (
              <td key={index}>
                {permise}
              </td>
            ))}
          </tr>
        </tbody>
        </table>
        

        <div className="header2-container">
            <h2>Lista permiselor de conducere</h2>
            <button
                className={viewExpired ? "" : "active"}
                onClick={() => toggleView(false)}
            >
            Complet
            </button>
            <button
                className={viewExpired ? "active" : ""}
                onClick={() => toggleView(true)}
            >
            Expirate
            </button>
        </div>
        <table className="data-table">
        <thead>
          <tr>
            <th>CNP</th>
            <th>Nume</th>
            <th>Prenume</th>
            <th>Data Expirare</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((permisePersoana, index) => (
            <tr key={index}>
              <td>{permisePersoana.CNP}</td>
              <td>{permisePersoana.Nume}</td>
              <td>{permisePersoana.Prenume}</td>
              <td>{new Date(permisePersoana.DataExpirare).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
        </table>


        <div>
          <div className="header3-container">
            <h2>Lista extinsă cu permise</h2>
          </div>
          <table className="table-extended">
            <thead>
              <tr>
                <th>Nume</th>
                <th>Prenume</th>
                <th>CNP</th>
                <th>Data Expirare</th>
                <th>A</th>
                <th>A1</th>
                <th>A2</th>
                <th>B</th>
                <th>B1</th>
                <th>B2</th>
                <th>C</th>
                <th>C1</th>
                <th>CE</th>
                <th>D</th>
                <th>D1</th>
                <th>DE</th>
                <th>Tr</th>
                <th>Tb</th>
                <th>Tv</th>
              </tr>
            </thead>
            <tbody>
              {permise.map((permis, index) => (
                <tr key={index}>
                  <td>{permis.Nume.trim()}</td>
                  <td>{permis.Prenume.trim()}</td>
                  <td>{permis.CNP}</td>
                  <td>{new Date(permis.DataExpirare).toLocaleDateString()}</td>
                  <td>{formatDate(permis.A)}</td>
                  <td>{formatDate(permis.A1)}</td>
                  <td>{formatDate(permis.A2)}</td>
                  <td>{formatDate(permis.B)}</td>
                  <td>{formatDate(permis.B1)}</td>
                  <td>{formatDate(permis.B2)}</td>
                  <td>{formatDate(permis.C)}</td>
                  <td>{formatDate(permis.C1)}</td>
                  <td>{formatDate(permis.CE)}</td>
                  <td>{formatDate(permis.D)}</td>
                  <td>{formatDate(permis.D1)}</td>
                  <td>{formatDate(permis.DE)}</td>
                  <td>{formatDate(permis.Tb)}</td>
                  <td>{formatDate(permis.Tr)}</td>
                  <td>{formatDate(permis.Tv)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
    </div>
  );
}

export default Permise;


