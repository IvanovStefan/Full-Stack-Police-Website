import React, { useState, useEffect} from 'react';
import axios from 'axios';
import Header from './header';
import './NewCazier.css';

interface CazierData {
  CNP: string;
  IDInfractiune: number;
  Descriere: string;
  DataComitere: string;
  Sentinta: string;
  Durata: number;
  Amenda: number;
}

interface Infractiune {
    IDInfractiune: number;
    Denumire: string;
  }

function NewCazier() {
  const [cazierData, setCazierData] = useState<CazierData>({
    CNP: '',
    IDInfractiune: 0,
    Descriere: '',
    DataComitere: '',
    Sentinta: '',
    Durata: 0,
    Amenda: 0,
  });

  const [message, setMessage] = useState<string | null>(null);
  const [infractiuni, setInfractiuni] = useState<Infractiune[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    // Fetch lista de infractiuni pentru dropdown
    const fetchInfractiuni = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/Infractiuni');
        setInfractiuni(response.data);
      } catch (error: any) {
        console.error('Error fetching infractiuni:', error);
        setMessage('Eroare la preluarea infracțiunilor.');
      }
    };

    fetchInfractiuni();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setCazierData({
      ...cazierData,
      [name]: name === 'IDInfractiune' || name === 'Durata' || name === 'Amenda' ? Number(value) : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    try {
      const response = await axios.post('http://localhost:8080/api/adauga-cazier', cazierData);
      setMessage(response.data.message);
      setCazierData({
        CNP: '',
        IDInfractiune: 0,
        Descriere: '',
        DataComitere: '',
        Sentinta: '',
        Durata: 0,
        Amenda: 0,
      });
    } catch (error: any) {
      console.error('Error adding cazier:', error);
      setMessage(error.response?.data?.error || 'Eroare la adăugarea cazierului.');
    }
  };

  return (
    <div>
      <Header />
      <div className="new-cazier-container">
        <h1>Adaugă Cazier Nou</h1>
        {message && <p className="message">{message}</p>}
        <form onSubmit={handleSubmit}>
          <div>
            <label>CNP:</label>
            <input
              type="text"
              name="CNP"
              value={cazierData.CNP}
              onChange={handleChange}
              maxLength={13}
              required
            />
          </div>
          <div>
          <label>ID Infracțiune:</label>
            <select
              name="IDInfractiune"
              value={cazierData.IDInfractiune}
              onChange={handleChange}
              required
            >
              <option value="">Selectează Infracțiunea</option>
              {infractiuni.map((infractiune) => (
                <option key={infractiune.IDInfractiune} value={infractiune.IDInfractiune}>
                  {infractiune.IDInfractiune} - {infractiune.Denumire}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Descriere:</label>
            <input
              type="text"
              name="Descriere"
              value={cazierData.Descriere}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Data Comiterii:</label>
            <input
              type="date"
              name="DataComitere"
              value={cazierData.DataComitere}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Sentință:</label>
            <input
              type="text"
              name="Sentinta"
              value={cazierData.Sentinta}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Durata (luni):</label>
            <input
              type="number"
              name="Durata"
              value={cazierData.Durata}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Amendă (RON):</label>
            <input
              type="number"
              name="Amenda"
              value={cazierData.Amenda}
              onChange={handleChange}
              step="0.01"
              required
            />
          </div>
          <button type="submit">Adaugă Cazier</button>
        </form>
      </div>
    </div>
  );
}

export default NewCazier;