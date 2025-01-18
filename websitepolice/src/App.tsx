import React, { useState , useEffect } from 'react'
import axios from 'axios'
import Header from './header';

interface Persoana {
  IDPersoana: number;
  Nume: string;
  Prenume: string;
  CNP: string;
  DataNasterii: string;
  Sex: string;
  Telefon: string;
  Email: string;
  Nume_Partener: string;
  Prenume_Partener: string;
}

function App() {
  const [persoane, setPersoane] = useState<Persoana[]>([]);
  const [searchTermName, setSearchTermName] = useState<string>('');
  const [searchTermPrenume, setSearchTermPrenume] = useState<string>('');
  const [searchTermCNP, setSearchTermCNP] = useState<string>('');


  const fetchFilteredData = async () => {
    try{
      const response = await axios.get(`http://localhost:8080/api/Persoane?name=${searchTermName}&surname=${searchTermPrenume}&cnp=${searchTermCNP}`);
      setPersoane(response.data);
      console.log(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
  };

  useEffect(() => {
      fetchFilteredData();
  }, [])

  return (
    <div>
      <Header />
      <h1>Lista cu persoane înregistrate</h1>
      <div>
        <input 
          type="text" 
          placeholder="Căutare după nume" 
          value={searchTermName} 
          onChange={(e) => setSearchTermName(e.target.value)} 
        />
        <input
          type="text"
          placeholder="Căutare după prenume"
          value={searchTermPrenume}
          onChange={(e) => setSearchTermPrenume(e.target.value)}
        />
        <input
          type="text"
          placeholder="Căutare după CNP"
          value={searchTermCNP}
          onChange={(e) => setSearchTermCNP(e.target.value)}
          maxLength={13}
        />
        <button onClick={fetchFilteredData}>Căutare</button>
      </div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nume</th>
            <th>Prenume</th>
            <th>CNP</th>
            <th>Data Nașterii</th>
            <th>Sex</th>
            <th>Telefon</th>
            <th>Email</th>
            <th>Nume Partener</th>
            <th>Prenume Partener</th>
          </tr>
        </thead>
        <tbody>
          {persoane.map((persoana) => (
            <tr key={persoana.IDPersoana}>
              <td>{persoana.IDPersoana}</td>
              <td>{persoana.Nume.trim()}</td>
              <td>{persoana.Prenume.trim()}</td>
              <td>{persoana.CNP}</td>
              <td>{new Date(persoana.DataNasterii).toLocaleDateString()}</td>
              <td>{persoana.Sex}</td>
              <td>{persoana.Telefon}</td>
              <td>{persoana.Email.trim()}</td>
              <td>{persoana.Nume_Partener ?? '-'}</td>
              <td>{persoana.Prenume_Partener ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;