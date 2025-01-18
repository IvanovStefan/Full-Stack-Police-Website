import React, { useState } from 'react';
import axios from 'axios';
import Header from './header';
import './NewPersoane.css';

interface FormData {
  IDPersoana?: number;
  Nume: string;
  Prenume: string;
  CNP: string;
  DataNasterii: string;
  Sex: string;
  Telefon: string;
  Email: string;
  CNPPartener: string;
}

function NewPersoane() {
  const [formData, setFormData] = useState<FormData>({
    Nume: '',
    Prenume: '',
    CNP: '',
    DataNasterii: '',
    Sex: '',
    Telefon: '',
    Email: '',
    CNPPartener: '',
  });

  const [message, setMessage] = useState<string | null>(null);
  const [searchCNP, setSearchCNP] = useState<string>('');
  const [foundPerson, setFoundPerson] = useState<FormData | null>(null);
  const [searchMessage, setSearchMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchCNP(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    try {
      const response = await axios.post('http://localhost:8080/api/adauga-persoana', formData);
      setMessage(response.data.message);
      setFormData({
        Nume: '',
        Prenume: '',
        CNP: '',
        DataNasterii: '',
        Sex: '',
        Telefon: '',
        Email: '',
        CNPPartener: '',
      });
    } catch (error: any) {
      console.error('Error adding person:', error);
      setMessage(error.response?.data?.error || 'Eroare la adăugarea persoanei.');
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchMessage(null);
    setFoundPerson(null);

    if (!searchCNP.trim()) {
      setSearchMessage('Te rog să introduci un CNP pentru căutare.');
      return;
    }

    try {
      const response = await axios.get('http://localhost:8080/api/Persoane', {
        params: { cnp: searchCNP.trim() },
      });

      if (response.data.length > 0) {
        const person = response.data[0];
        setFoundPerson({
          IDPersoana: person.IDPersoana,
          Nume: person.Nume,
          Prenume: person.Prenume,
          CNP: person.CNP,
          DataNasterii: person.DataNasterii.split('T')[0], // Asigură formatul corect
          Sex: person.Sex,
          Telefon: person.Telefon || '',
          Email: person.Email || '',
          CNPPartener: person.CNPPartener || '',
        });
      } else {
        setSearchMessage('Nu a fost găsită nicio persoană cu acest CNP.');
      }
    } catch (error: any) {
      console.error('Error searching person:', error);
      setSearchMessage(error.response?.data?.error || 'Eroare la căutarea persoanei.');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foundPerson?.IDPersoana) {
      setSearchMessage('ID-ul persoanei nu este disponibil pentru actualizare.');
      return;
    }

    try {
      const response = await axios.put(`http://localhost:8080/api/actualizeaza-persoana/${foundPerson.IDPersoana}`, foundPerson);
      setSearchMessage(response.data.message);
      setFoundPerson(null);
    } catch (error: any) {
      console.error('Error updating person:', error);
      setSearchMessage(error.response?.data?.error || 'Eroare la actualizarea persoanei.');
    }
  };

  const handleDelete = async () => {
    if (!foundPerson?.IDPersoana) {
      setSearchMessage('ID-ul persoanei nu este disponibil pentru ștergere.');
      return;
    }

    if (!window.confirm('Ești sigur că vrei să ștergi această persoană?')) {
      return;
    }

    try {
      const response = await axios.delete(`http://localhost:8080/api/sterge-persoana/${foundPerson.IDPersoana}`);
      setSearchMessage(response.data.message);
      setFoundPerson(null);
    } catch (error: any) {
      console.error('Error deleting person:', error);
      setSearchMessage(error.response?.data?.error || 'Eroare la ștergerea persoanei.');
    }
  };


  return (
    <div>
      <Header />
      <div className="new-persoane-container">
        <h1>Adaugă Persoană Nouă</h1>
        {message && <p className="message">{message}</p>}
        <form onSubmit={handleSubmit}>
          <div>
            <label>Nume:</label>
            <input type="text" name="Nume" value={formData.Nume} onChange={handleChange} required />
          </div>
          <div>
            <label>Prenume:</label>
            <input type="text" name="Prenume" value={formData.Prenume} onChange={handleChange} required />
          </div>
          <div>
            <label>CNP:</label>
            <input type="text" name="CNP" value={formData.CNP} onChange={handleChange} maxLength={13} required />
          </div>
          <div>
            <label>Data Nașterii:</label>
            <input type="date" name="DataNasterii" value={formData.DataNasterii} onChange={handleChange} required />
          </div>
          <div>
            <label>Sex:</label>
            <select name="Sex" value={formData.Sex} onChange={handleChange} required>
              <option value="">Selectează</option>
              <option value="M">Masculin</option>
              <option value="F">Feminin</option>
            </select>
          </div>
          <div>
            <label>Telefon:</label>
            <input type="text" name="Telefon" value={formData.Telefon} onChange={handleChange} />
          </div>
          <div>
            <label>Email:</label>
            <input type="email" name="Email" value={formData.Email} onChange={handleChange} />
          </div>
          <div>
            <label>CNP Partener:</label>
            <input type="text" name="CNPPartener" value={formData.CNPPartener} onChange={handleChange} />
          </div>
          <button type="submit">Adaugă Persoană</button>
        </form>
      </div>

      <div className="search-persoane-container">
        <h2>Caută Persoană după CNP</h2>
        <form onSubmit={handleSearch}>
          <div>
            <label>CNP:</label>
            <input type="text" value={searchCNP} onChange={handleSearchChange} maxLength={13} required />
          </div>
          <button type="submit">Caută</button>
        </form>
        {searchMessage && <p className="message">{searchMessage}</p>}

        {foundPerson && (
          <div className="edit-persoane-container">
            <h3>Editează Persoană</h3>
            <form onSubmit={handleUpdate}>
              <div>
                <label>Nume:</label>
                <input
                  type="text"
                  name="Nume"
                  value={foundPerson.Nume}
                  onChange={(e) => setFoundPerson({ ...foundPerson, Nume: e.target.value })}
                  required
                />
              </div>
              <div>
                <label>Prenume:</label>
                <input
                  type="text"
                  name="Prenume"
                  value={foundPerson.Prenume}
                  onChange={(e) => setFoundPerson({ ...foundPerson, Prenume: e.target.value })}
                  required
                />
              </div>
              <div>
                <label>CNP:</label>
                <input
                  type="text"
                  name="CNP"
                  value={foundPerson.CNP}
                  onChange={(e) => setFoundPerson({ ...foundPerson, CNP: e.target.value })}
                  required
                />
              </div>
              <div>
                <label>Data Nașterii:</label>
                <input
                  type="date"
                  name="DataNasterii"
                  value={foundPerson.DataNasterii}
                  onChange={(e) => setFoundPerson({ ...foundPerson, DataNasterii: e.target.value })}
                  required
                />
              </div>
              <div>
                <label>Sex:</label>
                <select
                  name="Sex"
                  value={foundPerson.Sex}
                  onChange={(e) => setFoundPerson({ ...foundPerson, Sex: e.target.value })}
                  required
                >
                  <option value="">Selectează</option>
                  <option value="M">Masculin</option>
                  <option value="F">Feminin</option>
                </select>
              </div>
              <div>
                <label>Telefon:</label>
                <input
                  type="text"
                  name="Telefon"
                  value={foundPerson.Telefon}
                  onChange={(e) => setFoundPerson({ ...foundPerson, Telefon: e.target.value })}
                />
              </div>
              <div>
                <label>Email:</label>
                <input
                  type="email"
                  name="Email"
                  value={foundPerson.Email}
                  onChange={(e) => setFoundPerson({ ...foundPerson, Email: e.target.value })}
                />
              </div>
              <div>
                <label>CNP Partener:</label>
                <input
                  type="text"
                  name="CNPPartener"
                  value={foundPerson.CNPPartener}
                  onChange={(e) => setFoundPerson({ ...foundPerson, CNPPartener: e.target.value })}
                />
              </div>
              <div className="edit-buttons">
                <button type="submit">Actualizează</button>
                <button type="button" onClick={handleDelete} className="delete-button">
                  Șterge
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default NewPersoane;
