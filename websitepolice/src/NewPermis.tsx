import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './header';
import './NewPermis.css';

interface CategoriiPermis {
  IDCategorie: number;
  Denumire: string;
}

interface PermisData {
  CNP: string;
  DataExpirare: string;
}

interface PermisCategorieData {
  CNP: string;
  Denumire: string;
  DataDobandire: string;
}

interface PermisInfo {
  IDPermis: number;
  DataExpirare: string;
  categorii: Array<{
    IDCategorie: number;
    Denumire: string;
    DataDobandire: string;
  }>;
}

function NewPermis() {
  // State pentru adăugarea permisului
  const [permisData, setPermisData] = useState<PermisData>({
    CNP: '',
    DataExpirare: '',
  });

  const [permisMessage, setPermisMessage] = useState<string | null>(null);
  const [permisError, setPermisError] = useState<string | null>(null);

  // State pentru asocierea permisului cu categorii
  const [permisCategorieData, setPermisCategorieData] = useState<PermisCategorieData>({
    CNP: '',
    Denumire: '',
    DataDobandire: '',
  });

  const [categorii, setCategorii] = useState<CategoriiPermis[]>([]);
  const [permisCategorieMessage, setPermisCategorieMessage] = useState<string | null>(null);
  const [permisCategorieError, setPermisCategorieError] = useState<string | null>(null);

  const [loadingPermis, setLoadingPermis] = useState<boolean>(false);
  const [loadingPermisCategorie, setLoadingPermisCategorie] = useState<boolean>(false);

  // State pentru update/delete
  const [searchCNP, setSearchCNP] = useState<string>('');
  const [permisInfo, setPermisInfo] = useState<PermisInfo | null>(null);
  const [searchMessage, setSearchMessage] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [loadingSearch, setLoadingSearch] = useState<boolean>(false);

  // State pentru update/delete form
  const [selectedCategorieID, setSelectedCategorieID] = useState<number | null>(null);
  const [newDataDobandire, setNewDataDobandire] = useState<string>('');
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [loadingUpdate, setLoadingUpdate] = useState<boolean>(false);
  const [loadingDelete, setLoadingDelete] = useState<boolean>(false);

  // Fetch categorii permis la montare
  useEffect(() => {
    const fetchCategorii = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/CategoriiPermis');
        setCategorii(response.data);
      } catch (error: any) {
        console.error('Error fetching categorii permis:', error);
        setPermisCategorieError('Eroare la preluarea categoriilor de permis.');
      }
    };

    fetchCategorii();
  }, []);

  // Handler pentru schimbarea input-urilor permisului
  const handlePermisChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPermisData({
      ...permisData,
      [name]: value,
    });
  };

  // Handler pentru submit-ul permisului
  const handlePermisSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPermisMessage(null);
    setPermisError(null);
    setLoadingPermis(true);

    try {
      const response = await axios.post('http://localhost:8080/api/adauga-permis', permisData);
      setPermisMessage(response.data.message);
      setPermisData({
        CNP: '',
        DataExpirare: '',
      });
    } catch (error: any) {
      console.error('Error adding permis:', error);
      setPermisError(error.response?.data?.error || 'Eroare la adăugarea permisului.');
    } finally {
      setLoadingPermis(false);
    }
  };

  // Handler pentru schimbarea input-urilor pentru asocierea cu categorii
  const handlePermisCategorieChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPermisCategorieData({
      ...permisCategorieData,
      [name]: value,
    });
  };

  // Handler pentru submit-ul asocierei cu categorii
  const handlePermisCategorieSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPermisCategorieMessage(null);
    setPermisCategorieError(null);
    setLoadingPermisCategorie(true);

    try {
      const response = await axios.post('http://localhost:8080/api/adauga-permis-categorie', permisCategorieData);
      setPermisCategorieMessage(response.data.message);
      setPermisCategorieData({
        CNP: '',
        Denumire: '',
        DataDobandire: '',
      });
    } catch (error: any) {
      console.error('Error associating permis with categorie:', error);
      setPermisCategorieError(error.response?.data?.error || 'Eroare la asocierea permisului cu categoria.');
    } finally {
      setLoadingPermisCategorie(false);
    }
  };

  // Handler pentru schimbarea CNP în containerul de update/delete
  const handleSearchCNPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchCNP(e.target.value);
  };

  // Handler pentru căutare permis
  const handleSearchPermis = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchMessage(null);
    setSearchError(null);
    setPermisInfo(null);
    setLoadingSearch(true);

    try {
      const response = await axios.get(`http://localhost:8080/api/permise/${searchCNP.trim()}`);
      setPermisInfo(response.data);
    } catch (error: any) {
      console.error('Error searching permis:', error);
      if (error.response?.status === 404) {
        setSearchMessage(error.response.data.error);
      } else {
        setSearchError('Eroare la căutarea permisului.');
      }
    } finally {
      setLoadingSearch(false);
    }
  };

  // Handler pentru schimbarea categoriei selectate pentru actualizare
  const handleSelectCategorie = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedCategorieID(value ? parseInt(value) : null);
  };

  // Handler pentru schimbarea DataDobandire
  const handleDataDobandireChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewDataDobandire(e.target.value);
  };

  // Handler pentru actualizarea DataDobandire
  const handleUpdateDobandire = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCategorieID === null) {
      setUpdateError('Te rog să selectezi o categorie.');
      return;
    }
    if (!newDataDobandire) {
      setUpdateError('Te rog să introduci o dată validă.');
      return;
    }

    setUpdateMessage(null);
    setUpdateError(null);
    setLoadingUpdate(true);

    try {
      await axios.put('http://localhost:8080/api/update-permis-categorie', {
        CNP: searchCNP.trim(),
        IDCategorie: selectedCategorieID,
        DataDobandire: newDataDobandire,
      });
      setUpdateMessage('Data Dobândirii a fost actualizată cu succes.');

      // Actualizează local permisInfo
      if (permisInfo) {
        const updatedCategorii = permisInfo.categorii.map(categorie => {
          if (categorie.IDCategorie === selectedCategorieID) {
            return { ...categorie, DataDobandire: newDataDobandire };
          }
          return categorie;
        });
        setPermisInfo({ ...permisInfo, categorii: updatedCategorii });
      }
      setSelectedCategorieID(null);
      setNewDataDobandire('');
    } catch (error: any) {
      console.error('Error updating DataDobandire:', error);
      setUpdateError(error.response?.data?.error || 'Eroare la actualizarea Data Dobândirii.');
    } finally {
      setLoadingUpdate(false);
    }
  };

  // Handler pentru ștergerea unei asocieri
  const handleDeleteAssociation = async (IDCategorie: number) => {
    if (!window.confirm('Ești sigur că vrei să ștergi această asociere?')) {
      return;
    }

    setDeleteMessage(null);
    setDeleteError(null);
    setLoadingDelete(true);

    try {
      await axios.delete('http://localhost:8080/api/delete-permis-categorie', {
        data: {
          CNP: searchCNP.trim(),
          IDCategorie: IDCategorie,
        },
      });
      setDeleteMessage('Asocierea permis-categorie a fost ștearsă cu succes.');

      // Actualizează local permisInfo
      if (permisInfo) {
        const updatedCategorii = permisInfo.categorii.filter(categorie => categorie.IDCategorie !== IDCategorie);
        setPermisInfo({ ...permisInfo, categorii: updatedCategorii });
      }
    } catch (error: any) {
      console.error('Error deleting association:', error);
      setDeleteError(error.response?.data?.error || 'Eroare la ștergerea asociatiei.');
    } finally {
      setLoadingDelete(false);
    }
  };

  return (
    <div>
      <Header />
      <div className="new-permis-container">

        {/* Container pentru Adăugarea Permisului */}
        <div className="insert-permis-container">
          <h2>Creare Permis Nou</h2>
          {permisMessage && <p className="message success">{permisMessage}</p>}
          {permisError && <p className="message error">{permisError}</p>}
          <form onSubmit={handlePermisSubmit}>
            <div className="form-group">
              <label>CNP:</label>
              <input
                type="text"
                name="CNP"
                value={permisData.CNP}
                onChange={handlePermisChange}
                maxLength={13}
                required
              />
            </div>
            <div className="form-group">
              <label>Data Expirare:</label>
              <input
                type="date"
                name="DataExpirare"
                value={permisData.DataExpirare}
                onChange={handlePermisChange}
                required
              />
            </div>
            <button type="submit" disabled={loadingPermis}>
              {loadingPermis ? 'Adăugare...' : 'Adaugă Permis'}
            </button>
          </form>
        </div>

        {/* Container pentru Asocierea Permisului cu Categorii */}
        <div className="associate-permis-container">
          <h2>Asociere Permis cu Categorii</h2>
          {permisCategorieMessage && <p className="message success">{permisCategorieMessage}</p>}
          {permisCategorieError && <p className="message error">{permisCategorieError}</p>}
          <form onSubmit={handlePermisCategorieSubmit}>
            <div className="form-group">
              <label>CNP:</label>
              <input
                type="text"
                name="CNP"
                value={permisCategorieData.CNP}
                onChange={handlePermisCategorieChange}
                maxLength={13}
                required
              />
            </div>
            <div className="form-group">
              <label>Denumire:</label>
              <select
                name="Denumire"
                value={permisCategorieData.Denumire}
                onChange={handlePermisCategorieChange}
                required
              >
                <option value="">Selectează Categoria</option>
                {categorii.map((categorie) => (
                  <option key={categorie.IDCategorie} value={categorie.Denumire}>
                    {categorie.Denumire}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Data Dobândirii:</label>
              <input
                type="date"
                name="DataDobandire"
                value={permisCategorieData.DataDobandire}
                onChange={handlePermisCategorieChange}
                required
              />
            </div>
            <button type="submit" disabled={loadingPermisCategorie}>
              {loadingPermisCategorie ? 'Asociere...' : 'Asociază Categoria'}
            </button>
          </form>
        </div>

        {/* Container pentru Actualizare și Ștergere */}
        <div className="update-delete-permis-container">
          <h2>Actualizare / Ștergere Asociere Permis-Categorie</h2>
          <form onSubmit={handleSearchPermis}>
            <div className="form-group">
              <label>CNP:</label>
              <input
                type="text"
                value={searchCNP}
                onChange={handleSearchCNPChange}
                maxLength={13}
                required
              />
            </div>
            <button type="submit" disabled={loadingSearch}>
              {loadingSearch ? 'Căutare...' : 'Caută'}
            </button>
          </form>
          {searchMessage && <p className="message">{searchMessage}</p>}
          {searchError && <p className="message error">{searchError}</p>}

          {permisInfo && (
            <div className="update-delete-section">
              <h3>Detalii Permis</h3>
              <p><strong>ID Permis:</strong> {permisInfo.IDPermis}</p>
              <p><strong>Data Expirare:</strong> {new Date(permisInfo.DataExpirare).toLocaleDateString()}</p>

              {permisInfo.categorii.length === 0 ? (
                <p>Nu există categorii asociate.</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Categorie</th>
                      <th>Data Dobândirii</th>
                      <th>Acțiuni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {permisInfo.categorii.map((categorie) => (
                      <tr key={categorie.IDCategorie}>
                        <td>{categorie.Denumire}</td>
                        <td>{new Date(categorie.DataDobandire).toLocaleDateString()}</td>
                        <td>
                          {/* Buton pentru selectarea categoriei pentru actualizare */}
                          <button
                            onClick={() => {
                              setSelectedCategorieID(categorie.IDCategorie);
                              setNewDataDobandire(categorie.DataDobandire);
                              setUpdateMessage(null);
                              setUpdateError(null);
                              setDeleteMessage(null);
                              setDeleteError(null);
                            }}
                            className="update-button"
                          >
                            Actualizează
                          </button>
                          {/* Buton pentru ștergere */}
                          <button
                            onClick={() => handleDeleteAssociation(categorie.IDCategorie)}
                            className="delete-button"
                          >
                            Șterge
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Formular pentru actualizarea DataDobandire */}
              {selectedCategorieID !== null && (
                <div className="update-form">
                  <h4>Actualizează Data Dobândirii</h4>
                  {updateMessage && <p className="message success">{updateMessage}</p>}
                  {updateError && <p className="message error">{updateError}</p>}
                  <form onSubmit={handleUpdateDobandire}>
                    <div className="form-group">
                      <label>Denumire:</label>
                      <select
                        value={selectedCategorieID}
                        onChange={handleSelectCategorie}
                        disabled
                      >
                        <option value="">Selectează Categoria</option>
                        {permisInfo.categorii
                          .filter(categorie => categorie.IDCategorie === selectedCategorieID)
                          .map(categorie => (
                            <option key={categorie.IDCategorie} value={categorie.IDCategorie}>
                              {categorie.Denumire}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Data Redobândirii:</label>
                      <input
                        type="date"
                        value={newDataDobandire}
                        onChange={handleDataDobandireChange}
                        required
                      />
                    </div>
                    <button type="submit" disabled={loadingUpdate}>
                      {loadingUpdate ? 'Actualizare...' : 'Actualizează'}
                    </button>
                  </form>
                </div>
              )}

              {/* Mesaje pentru ștergere */}
              {deleteMessage && <p className="message success">{deleteMessage}</p>}
              {deleteError && <p className="message error">{deleteError}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NewPermis;