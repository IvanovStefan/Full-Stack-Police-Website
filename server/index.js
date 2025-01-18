const express = require('express');
const { connectToDb, sql } = require('./db');

const app = express();

const bcrypt = require('bcryptjs');
const cors = require("cors");
const corsOptions = {
  origin: ["http://localhost:5173"],
}

// Middleware to parse JSON
app.use(express.json());
app.use(cors(corsOptions));

PORT=8080;

connectToDb().then(pool => {

  //Register
  app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      await pool.request()
        .input('username', sql.NVarChar, username)
        .input('passwordHash', sql.NVarChar, hashedPassword)
        .query(`
          INSERT INTO Users (Username, PasswordHash)
          VALUES (@username, @passwordHash)
        `);

      res.json({ message: 'User registered successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Database error or username already exists' });
    }
  });

  //Login
  app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
      const result = await pool.request()
        .input('username', sql.NVarChar, username)
        .query(`
          SELECT * FROM Users WHERE Username = @username
        `);

      const user = result.recordset[0];

      if (!user) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.PasswordHash);

      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      res.json({ message: 'Login successful' });
    } catch (err) {
      res.status(500).json({ error: 'Database error' });
    }
  });


  // Example route to get users from the database
  app.get('/api/Persoane', async (req, res) => {
    try {
      const NumeSearchTerm = req.query.name || '';
      const PrenumeSearchTerm = req.query.surname || '';
      const CNPSearchTerm = req.query.cnp || '';

      const result = await pool.request()
      .input('NumeSearchTerm', sql.NVarChar, `%${NumeSearchTerm.trim()}%`)
      .input('PrenumeSearchTerm', sql.NVarChar, `%${PrenumeSearchTerm.trim()}%`)
      .input('CNPSearchTerm', sql.NVarChar, `%${CNPSearchTerm.trim()}%`)
      .query(`
        SELECT 
          p.IDPersoana,
          p.Nume,
          p.Prenume,
          p.CNP,
          p.DataNasterii,
          p.Sex,
          p.Telefon,
          p.Email,
          ISNULL(partener.Nume, '-') AS Nume_Partener,
          ISNULL(partener.Prenume, '-') AS Prenume_Partener
        FROM Persoane p
        LEFT JOIN Persoane partener 
          ON p.IDPartener = partener.IDPersoana
        WHERE RTRIM(p.Nume) LIKE @NumeSearchTerm
          AND RTRIM(p.Prenume) LIKE @PrenumeSearchTerm
          AND RTRIM(p.CNP) LIKE @CNPSearchTerm
      `);

      res.json(result.recordset); // Sends the result as JSON to the client
    } catch (err) {
      res.status(500).json({ error: 'Database error' });
    }
  });


  app.get('/api/adrese', async (req, res) => {

    const cnp = req.query.cnp || '';
    
    try {
      const result = await pool.request()
        .input('CNP', sql.NVarChar, cnp)
        .query(`
          SELECT 
              p.CNP,
              p.Nume,
              p.Prenume,
              pa.DataObtinere,
              pa.Domiciliu,
              a.Strada,
              a.Numar,
              a.Bloc,
              a.Scara,
              a.Etaj,
              a.Apartament,
              a.Oras,
              a.Judet,
              a.CodPostal,
              (SELECT COUNT(*)
                FROM PersoaneAdrese AS pa2
                WHERE pa2.IDAdresa = a.IDAdresa
              ) AS NrPersoane
          FROM 
              Persoane p
          JOIN 
              PersoaneAdrese pa ON p.IDPersoana = pa.IDPersoana
          JOIN 
              Adrese a ON pa.IDAdresa = a.IDAdresa
          WHERE p.CNP = @CNP
        `);
      // Verificăm dacă am găsit date
      if (result.recordset.length === 0) {
        return res.status(404).json({ message: 'Nu au fost gasite persoane cu acest CNP' });
      }
  
      // Returnează rezultatele interogării
      res.json(result.recordset);
    } catch (err) {
      console.error(err); // Logare erori pentru depanare
      res.status(500).json({ error: 'Database error', details: err.message });
    }
  });

  app.get('/api/activitati-persoane', async (req, res) => {
    try {
      const cnp = req.query.cnp || '';

      const result = await pool.request()
        .input('CNP', sql.NVarChar, cnp)
        .query(`
        SELECT 
            p.CNP,
            p.Nume,
            p.Prenume,
            a.Institutia,
            pa.Post,
            pa.DataIncepere,
            pa.Durata
        FROM 
            Persoane p
        INNER JOIN 
            PersoaneActivitati pa ON p.IDPersoana = pa.IDPersoana
        INNER JOIN 
            Activitati a ON pa.IDActivitate = a.IDActivitate
        WHERE 
            p.CNP = @CNP
      `)
  
      // Verifică dacă au fost găsite rezultate
      if (result.recordset.length === 0) {
        return res.status(404).json({ message: 'Nu au fost găsite persoane sau activități în baza de date' });
      }
  
      // Returnează rezultatele
      res.json(result.recordset);
    } catch (err) {
      console.error('Eroare la interogarea bazei de date:', err);
      res.status(500).json({ error: 'Eroare la baza de date', details: err.message });
    }
  });

  app.get('/api/institutii', async (req, res) => {
    try {
      const institutieFilter = req.query.institutia || '';

      const result = await pool.request()
        .input('Institutia', sql.NVarChar, institutieFilter)
        .query(`
          SELECT
            a.Institutia,
            ad.Strada,
            ad.Numar,
            ad.Bloc,
            ad.Scara,
            ad.Etaj,
            ad.Apartament,
            ad.Oras,
            ad.Judet,
            ad.CodPostal
          FROM 
            Activitati a
          INNER JOIN 
            Adrese ad ON a.IDAdresa = ad.IDAdresa
          WHERE a.Institutia LIKE '%' + @Institutia + '%'
        `);
  
      if (result.recordset.length === 0) {
        return res.status(404).json({ message: 'Nu au fost găsite instituții în baza de date' });
      }
  
      res.json(result.recordset);
    } catch (err) {
      console.error('Eroare la interogarea bazei de date:', err);
      res.status(500).json({ error: 'Eroare la baza de date', details: err.message });
    }
  });


  app.get('/api/nrpermise', async (req, res) => {
    try {
        // Execută interogarea SQL
        const result = await pool.request().query(`
            SELECT 
                c.Denumire AS Categorie,
                COUNT(p.IDPermis) AS Permise
            FROM 
                CategoriiPermis c
            LEFT JOIN 
                PermiseCategoriiPermis p ON c.IDCategorie = p.IDCategorie
            GROUP BY 
                c.Denumire
            ORDER BY 
                c.Denumire ASC;
        `);

        // Trimite rezultatele ca JSON
        res.json(result.recordset);
    } catch (err) {
      console.error(err); // Logare erori pentru depanare
      res.status(500).json({ error: 'Database error', details: err.message });
    }
  });

  app.get('/api/persoane-permise', async (req, res) => {
    try {
        // Execută interogarea SQL
        const result = await pool.request().query(`
            SELECT 
              p.CNP,
              p.Nume,
              p.Prenume,
              pr.DataExpirare
            FROM 
              Persoane p
            INNER JOIN 
              Permise pr ON p.IDPersoana = pr.IDPersoana;
        `);

        // Trimite rezultatele ca JSON
        res.json(result.recordset);
    } catch (err) {
      console.error(err); // Logare erori pentru depanare
      res.status(500).json({ error: 'Database error', details: err.message });
    }
});


  app.get('/api/extended-permise', async (req, res) => {
    try {
      // Execută interogarea SQL
      const result = await pool.request().query(`
          SELECT 
            P.Nume,
            P.Prenume,
            P.CNP,
            PR.DataExpirare,
          (SELECT PCP.DataDobandire
            FROM PermiseCategoriiPermis PCP
            JOIN CategoriiPermis CP ON PCP.IDCategorie = CP.IDCategorie
            WHERE CP.Denumire = 'A' AND PCP.IDPermis = PR.IDPermis) AS A,
          (SELECT PCP.DataDobandire
            FROM PermiseCategoriiPermis PCP
            JOIN CategoriiPermis CP ON PCP.IDCategorie = CP.IDCategorie
            WHERE CP.Denumire = 'A1' AND PCP.IDPermis = PR.IDPermis) AS A1,
          (SELECT PCP.DataDobandire
            FROM PermiseCategoriiPermis PCP
            JOIN CategoriiPermis CP ON PCP.IDCategorie = CP.IDCategorie
            WHERE CP.Denumire = 'A2' AND PCP.IDPermis = PR.IDPermis) AS A2,
          (SELECT PCP.DataDobandire
            FROM PermiseCategoriiPermis PCP
            JOIN CategoriiPermis CP ON PCP.IDCategorie = CP.IDCategorie
            WHERE CP.Denumire = 'B' AND PCP.IDPermis = PR.IDPermis) AS B,
          (SELECT PCP.DataDobandire
            FROM PermiseCategoriiPermis PCP
            JOIN CategoriiPermis CP ON PCP.IDCategorie = CP.IDCategorie
            WHERE CP.Denumire = 'B1' AND PCP.IDPermis = PR.IDPermis) AS B1,
          (SELECT PCP.DataDobandire
            FROM PermiseCategoriiPermis PCP
            JOIN CategoriiPermis CP ON PCP.IDCategorie = CP.IDCategorie
            WHERE CP.Denumire = 'B2' AND PCP.IDPermis = PR.IDPermis) AS B2,
          (SELECT PCP.DataDobandire
            FROM PermiseCategoriiPermis PCP
            JOIN CategoriiPermis CP ON PCP.IDCategorie = CP.IDCategorie
            WHERE CP.Denumire = 'C' AND PCP.IDPermis = PR.IDPermis) AS C,
          (SELECT PCP.DataDobandire
            FROM PermiseCategoriiPermis PCP
            JOIN CategoriiPermis CP ON PCP.IDCategorie = CP.IDCategorie
            WHERE CP.Denumire = 'C1' AND PCP.IDPermis = PR.IDPermis) AS C1,
          (SELECT PCP.DataDobandire
            FROM PermiseCategoriiPermis PCP
            JOIN CategoriiPermis CP ON PCP.IDCategorie = CP.IDCategorie
            WHERE CP.Denumire = 'CE' AND PCP.IDPermis = PR.IDPermis) AS CE,
          (SELECT PCP.DataDobandire
            FROM PermiseCategoriiPermis PCP
            JOIN CategoriiPermis CP ON PCP.IDCategorie = CP.IDCategorie
            WHERE CP.Denumire = 'D' AND PCP.IDPermis = PR.IDPermis) AS D,
          (SELECT PCP.DataDobandire
            FROM PermiseCategoriiPermis PCP
            JOIN CategoriiPermis CP ON PCP.IDCategorie = CP.IDCategorie
            WHERE CP.Denumire = 'D1' AND PCP.IDPermis = PR.IDPermis) AS D1,
          (SELECT PCP.DataDobandire
            FROM PermiseCategoriiPermis PCP
            JOIN CategoriiPermis CP ON PCP.IDCategorie = CP.IDCategorie
            WHERE CP.Denumire = 'DE' AND PCP.IDPermis = PR.IDPermis) AS DE,
          (SELECT PCP.DataDobandire
            FROM PermiseCategoriiPermis PCP
            JOIN CategoriiPermis CP ON PCP.IDCategorie = CP.IDCategorie
            WHERE CP.Denumire = 'Tr' AND PCP.IDPermis = PR.IDPermis) AS Tr,
          (SELECT PCP.DataDobandire
            FROM PermiseCategoriiPermis PCP
            JOIN CategoriiPermis CP ON PCP.IDCategorie = CP.IDCategorie
            WHERE CP.Denumire = 'Tb' AND PCP.IDPermis = PR.IDPermis) AS Tb,
          (SELECT PCP.DataDobandire
            FROM PermiseCategoriiPermis PCP
            JOIN CategoriiPermis CP ON PCP.IDCategorie = CP.IDCategorie
            WHERE CP.Denumire = 'Tv' AND PCP.IDPermis = PR.IDPermis) AS Tv
        FROM 
            Persoane P
        INNER JOIN 
            Permise PR ON P.IDPersoana = PR.IDPersoana;
      `);

      // Trimite rezultatele ca JSON
      res.json(result.recordset);
    } catch (err) {
    console.error(err); // Logare erori pentru depanare
    res.status(500).json({ error: 'Database error', details: err.message });
    }
  });

  app.get('/api/statistica-cazier', async (req, res) => {
    try {
    const result = await pool.request()
      .query(`
        SELECT
          (SELECT COUNT(*) 
           FROM Persoane p
           WHERE p.IDPersoana IN (
               SELECT c.IDPersoana 
               FROM Cazier c
           )
          ) AS NumarPersoaneCuCazier,
          
          (SELECT COUNT(*) 
           FROM Persoane p
           WHERE p.IDPersoana NOT IN (
               SELECT c.IDPersoana 
               FROM Cazier c
           )
          ) AS NumarPersoaneFaraCazier
      `);

    res.json(result.recordset);
    } catch (err) {
    res.status(500).json({ error: 'Database error' });
    }
  });

  app.get('/api/cazier', async (req, res) => {
    try {
    const result = await pool.request().query(`
      SELECT DISTINCT p.IDPersoana,
        p.Nume,
        p.Prenume,
        p.CNP,
        p.DataNasterii,
        p.Sex
      FROM Persoane AS p
      INNER JOIN Cazier AS c ON p.IDPersoana = c.IDPersoana
    `);

    // Trimite recordset-ul ca răspuns JSON
    res.json(result.recordset);
    } catch (error) {
    res.status(500).json({ error: 'Database error' });
    }
  });

  app.get('/api/cazier-activ', async (req, res) => {
    try {
    const result = await pool.request().query(`
      SELECT p.IDPersoana,
        p.Nume,
        p.Prenume,
	      p.CNP,
	      p.DataNasterii,
	      p.Sex
      FROM Persoane AS p
      WHERE p.IDPersoana IN (
        SELECT c.IDPersoana
        FROM Cazier AS c
        WHERE c.DataComitere >= DATEADD(YEAR, -c.Durata, GETDATE())
      );
    `);

    // Trimite recordset-ul ca răspuns JSON
    res.json(result.recordset);
    } catch (error) {
    res.status(500).json({ error: 'Database error' });
    }
  });


  app.get('/api/cazier-persoana', async (req, res) => {
    try {
    const NumeSearchTerm = req.query.name || '';
    const PrenumeSearchTerm = req.query.surname || '';
    const CNPSearchTerm = req.query.cnp || '';

    // Execută interogarea SQL cu filtrare
    const result = await pool.request()
    .input('CNPSearchTerm', sql.NVarChar, `%${CNPSearchTerm.trim()}%`)
    .query(`
      SELECT 
        p.Nume,
        p.Prenume,
        p.CNP,
        p.DataNasterii,
        p.Sex,
        i.Denumire AS DenumireInfractiune,
        c.Descriere,
        c.DataComitere,
        c.Sentinta,
        c.Durata,
        c.Amenda
      FROM Persoane AS p
      LEFT JOIN Cazier AS c ON p.IDPersoana = c.IDPersoana
      LEFT JOIN Infractiuni AS i ON c.IDInfractiune = i.IDInfractiune
      WHERE 
        RTRIM(p.CNP) LIKE @CNPSearchTerm
    `);

    
    res.json(result.recordset);
    } catch (error) {
    console.error('Eroare la obținerea detaliilor cazier:', error);
    res.status(500).json({ error: 'Eroare la obținerea detaliilor cazier.' });
    }
  });

  app.get('/api/infractiuni', async (req, res) => {
    try {
      const result = await pool.request()
        .query(`
          SELECT IDInfractiune, Denumire
          FROM Infractiuni
        `);
  
      res.json(result.recordset);
    } catch (error) {
      console.error('Eroare la preluarea infracțiunilor:', error);
      res.status(500).json({ error: 'Eroare la preluarea infracțiunilor.' });
    }
  });

  app.get('/api/CategoriiPermis', async (req, res) => {
    try {
      const result = await pool.request()
        .query(`
          SELECT IDCategorie, Denumire
          FROM CategoriiPermis
        `);
  
      res.json(result.recordset);
    } catch (error) {
      console.error('Eroare la preluarea categoriilor de permis:', error);
      res.status(500).json({ error: 'Eroare la preluarea categoriilor de permis.' });
    }
  });


///////////////////////////////////////insert/////////////////////////////////////////////////////////


  app.post('/api/adauga-persoana', async (req, res) => {
    try {
    const {
      Nume,
      Prenume,
      CNP,
      DataNasterii,
      Sex,
      Telefon,
      Email,
      CNPPartener, // CNP-ul partenerului
    } = req.body;

    // Validare pentru datele obligatorii
    if (!Nume || !Prenume || !CNP) {
      return res.status(400).json({ error: 'Nume, Prenume și CNP sunt obligatorii.' });
    }

    let IDPartener = null;

    // Dacă este specificat un CNP pentru partener, preia ID-ul acestuia
    if (CNPPartener) {
      const partenerResult = await pool.request()
        .input('CNPPartener', sql.NVarChar, CNPPartener.trim())
        .query(`
          SELECT IDPersoana
          FROM Persoane
          WHERE RTRIM(CNP) = @CNPPartener
        `);

      if (partenerResult.recordset.length > 0) {
        IDPartener = partenerResult.recordset[0].IDPersoana;
      } else {
        return res.status(400).json({ error: 'CNP-ul partenerului nu a fost găsit în baza de date.' });
      }
    }

    // Inserează datele în tabelul Persoane
    const insertResult = await pool.request()
      .input('Nume', sql.NVarChar, Nume.trim())
      .input('Prenume', sql.NVarChar, Prenume.trim())
      .input('CNP', sql.NVarChar, CNP.trim())
      .input('DataNasterii', sql.Date, DataNasterii)
      .input('Sex', sql.NVarChar, Sex)
      .input('Telefon', sql.NVarChar, Telefon)
      .input('Email', sql.NVarChar, Email)
      .input('IDPartener', sql.Int, IDPartener)
      .query(`
        INSERT INTO Persoane (Nume, Prenume, CNP, DataNasterii, Sex, Telefon, Email, IDPartener)
        VALUES (@Nume, @Prenume, @CNP, @DataNasterii, @Sex, @Telefon, @Email, @IDPartener)
      `);

    res.status(201).json({ message: 'Persoana adăugată cu succes.' });
    } catch (error) {
    console.error('Eroare la adăugarea persoanei:', error);
    res.status(500).json({ error: 'Eroare la adăugarea persoanei.' });
    }
  });


  app.post('/api/adauga-cazier', async (req, res) => {
    const {
      CNP,
      IDInfractiune,
      Descriere,
      DataComitere,
      Sentinta,
      Durata,
      Amenda,
    } = req.body;
  
    try {
      // Validare pentru datele obligatorii
      if (!CNP || !IDInfractiune || !Descriere || !DataComitere || !Sentinta || !Durata || !Amenda) {
        return res.status(400).json({ error: 'Toate câmpurile sunt obligatorii.' });
      }

      // Verifică dacă infracțiunea există în tabela Infractiuni
    const infractiuneResult = await pool.request()
    .input('IDInfractiune', sql.Int, IDInfractiune)
    .query(`
      SELECT IDInfractiune
      FROM Infractiuni
      WHERE IDInfractiune = @IDInfractiune
    `);

  if (infractiuneResult.recordset.length === 0) {
    return res.status(400).json({ error: 'IDInfractiune specificat nu există în tabela Infractiuni.' });
  }
  
      // Verifică dacă persoana cu CNP-ul dat există
      const personResult = await pool.request()
        .input('CNP', sql.NVarChar, CNP.trim())
        .query(`
          SELECT IDPersoana
          FROM Persoane
          WHERE RTRIM(CNP) = @CNP
        `);
  
      if (personResult.recordset.length === 0) {
        return res.status(400).json({ error: 'CNP-ul specificat nu corespunde niciunei persoane existente.' });
      }
  
      const IDPersoana = personResult.recordset[0].IDPersoana;
  
      // Inserează datele în tabelul Cazier
      await pool.request()
        .input('IDPersoana', sql.Int, IDPersoana)
        .input('IDInfractiune', sql.Int, IDInfractiune)
        .input('Descriere', sql.NVarChar, Descriere.trim())
        .input('DataComitere', sql.Date, DataComitere)
        .input('Sentinta', sql.NVarChar, Sentinta.trim())
        .input('Durata', sql.Int, Durata)
        .input('Amenda', sql.Decimal(8, 2), Amenda)
        .query(`
          INSERT INTO Cazier (IDPersoana, IDInfractiune, Descriere, DataComitere, Sentinta, Durata, Amenda)
          VALUES (@IDPersoana, @IDInfractiune, @Descriere, @DataComitere, @Sentinta, @Durata, @Amenda)
        `);
  
      res.status(201).json({ message: 'Cazierul a fost adăugat cu succes.' });
    } catch (error) {
      console.error('Eroare la adăugarea cazierului:', error);
      res.status(500).json({ error: 'Eroare la adăugarea cazierului.' });
    }
  });

  app.post('/api/adauga-permis', async (req, res) => {
    const { CNP, DataExpirare } = req.body;
  
    try {
      // Validare pentru datele obligatorii
      if (!CNP || !DataExpirare) {
        return res.status(400).json({ error: 'CNP și Data Expirare sunt obligatorii.' });
      }
  
      // Verifică dacă persoana cu CNP-ul dat există
      const personResult = await pool.request()
        .input('CNP', sql.NVarChar, CNP.trim())
        .query(`
          SELECT IDPersoana
          FROM Persoane
          WHERE RTRIM(CNP) = @CNP
        `);
  
      if (personResult.recordset.length === 0) {
        return res.status(400).json({ error: 'CNP-ul specificat nu corespunde niciunei persoane existente.' });
      }
  
      const IDPersoana = personResult.recordset[0].IDPersoana;
  
      // Verifică dacă persoana deja deține un permis
      const permisResult = await pool.request()
        .input('IDPersoana', sql.Int, IDPersoana)
        .query(`
          SELECT IDPermis
          FROM Permise
          WHERE IDPersoana = @IDPersoana
        `);
  
      if (permisResult.recordset.length > 0) {
        return res.status(400).json({ error: 'Persoana deja deține un permis de conducere.' });
      }
  
      // Inserează permisul în tabela Permise
      const insertResult = await pool.request()
        .input('IDPersoana', sql.Int, IDPersoana)
        .input('DataExpirare', sql.Date, DataExpirare)
        .query(`
          INSERT INTO Permise (IDPersoana, DataExpirare)
          VALUES (@IDPersoana, @DataExpirare);
          SELECT SCOPE_IDENTITY() AS IDPermis;
        `);
  
      const IDPermis = insertResult.recordset[0].IDPermis;
  
      res.status(201).json({ message: 'Permisul a fost adăugat cu succes.', IDPermis });
    } catch (error) {
      console.error('Eroare la adăugarea permisului:', error);
      res.status(500).json({ error: 'Eroare la adăugarea permisului.' });
    }
  });


  app.post('/api/adauga-permis-categorie', async (req, res) => {
    const { CNP, Denumire, DataDobandire } = req.body;
  
    try {
      // Validare pentru datele obligatorii
      if (!CNP || !Denumire || !DataDobandire) {
        return res.status(400).json({ error: 'CNP, Denumire și Data Dobândirii sunt obligatorii.' });
      }
  
      // Verifică dacă persoana cu CNP-ul dat există
      const personResult = await pool.request()
        .input('CNP', sql.NVarChar, CNP.trim())
        .query(`
          SELECT IDPersoana
          FROM Persoane
          WHERE RTRIM(CNP) = @CNP
        `);
  
      if (personResult.recordset.length === 0) {
        return res.status(400).json({ error: 'CNP-ul specificat nu corespunde niciunei persoane existente.' });
      }
  
      const IDPersoana = personResult.recordset[0].IDPersoana;
  
      // Verifică dacă persoana deține un permis
      const permisResult = await pool.request()
        .input('IDPersoana', sql.Int, IDPersoana)
        .query(`
          SELECT IDPermis
          FROM Permise
          WHERE IDPersoana = @IDPersoana
        `);
  
      if (permisResult.recordset.length === 0) {
        return res.status(400).json({ error: 'Persoana nu deține niciun permis de conducere.' });
      }
  
      const IDPermis = permisResult.recordset[0].IDPermis;
  
      // Obține IDCategorie din Denumire
      const categorieResult = await pool.request()
        .input('Denumire', sql.NVarChar, Denumire.trim())
        .query(`
          SELECT IDCategorie
          FROM CategoriiPermis
          WHERE Denumire = @Denumire
        `);
  
      if (categorieResult.recordset.length === 0) {
        return res.status(400).json({ error: 'Denumirea categoriei de permis selectate nu este validă.' });
      }
  
      const IDCategorie = categorieResult.recordset[0].IDCategorie;
  
      // Verifică dacă deja există o asociere similară (opțional)
      const existingAssociation = await pool.request()
        .input('IDPermis', sql.Int, IDPermis)
        .input('IDCategorie', sql.Int, IDCategorie)
        .query(`
          SELECT *
          FROM PermiseCategoriiPermis
          WHERE IDPermis = @IDPermis AND IDCategorie = @IDCategorie
        `);
  
      if (existingAssociation.recordset.length > 0) {
        return res.status(400).json({ error: 'Această categorie de permis este deja asociată cu permisul de conducere.' });
      }
  
      // Inserează în PermiseCategoriiPermis
      await pool.request()
        .input('IDPermis', sql.Int, IDPermis)
        .input('IDCategorie', sql.Int, IDCategorie)
        .input('DataDobandire', sql.Date, DataDobandire)
        .query(`
          INSERT INTO PermiseCategoriiPermis (IDPermis, IDCategorie, DataDobandire)
          VALUES (@IDPermis, @IDCategorie, @DataDobandire)
        `);
  
      res.status(201).json({ message: 'Categoria de permis a fost asociată cu succes.' });
    } catch (error) {
      console.error('Eroare la asocierea permisului cu categoria:', error);
      res.status(500).json({ error: 'Eroare la asocierea permisului cu categoria.' });
    }
  });

  app.get('/api/permise/:CNP', async (req, res) => {
    const { CNP } = req.params;
  
    try {
      // Verifică dacă persoana cu CNP-ul dat există
      const personResult = await pool.request()
        .input('CNP', sql.NVarChar, CNP.trim())
        .query(`
          SELECT IDPersoana
          FROM Persoane
          WHERE RTRIM(CNP) = @CNP
        `);
  
      if (personResult.recordset.length === 0) {
        return res.status(404).json({ error: 'CNP-ul specificat nu corespunde niciunei persoane existente.' });
      }
  
      const IDPersoana = personResult.recordset[0].IDPersoana;
  
      // Obține permisul asociat persoanei
      const permisResult = await pool.request()
        .input('IDPersoana', sql.Int, IDPersoana)
        .query(`
          SELECT IDPermis, DataExpirare
          FROM Permise
          WHERE IDPersoana = @IDPersoana
        `);
  
      if (permisResult.recordset.length === 0) {
        return res.status(404).json({ error: 'Persoana nu deține niciun permis de conducere.' });
      }
  
      const permis = permisResult.recordset[0];
      const IDPermis = permis.IDPermis;
  
      // Obține categoriile asociate permisului
      const categoriiResult = await pool.request()
        .input('IDPermis', sql.Int, IDPermis)
        .query(`
          SELECT cp.IDPermis, cp.IDCategorie, cp.DataDobandire, c.Denumire
          FROM PermiseCategoriiPermis cp
          JOIN CategoriiPermis c ON cp.IDCategorie = c.IDCategorie
          WHERE cp.IDPermis = @IDPermis
        `);
  
      res.json({
        IDPermis: permis.IDPermis,
        DataExpirare: permis.DataExpirare,
        categorii: categoriiResult.recordset.map(categorie => ({
          IDPermis: categorie.IDPermis,
          IDCategorie: categorie.IDCategorie,
          Denumire: categorie.Denumire,
          DataDobandire: categorie.DataDobandire,
        })),
      });
    } catch (error) {
      console.error('Eroare la obținerea permisului și categoriilor:', error);
      res.status(500).json({ error: 'Eroare la obținerea permisului și categoriilor.' });
    }
  });


  ///////////////////////////////////////////////update//////////////////////////////////////////////////

  app.put('/api/actualizeaza-persoana/:id', async (req, res) => {
    const { id } = req.params;
    const {
      Nume,
      Prenume,
      CNP,
      DataNasterii,
      Sex,
      Telefon,
      Email,
      CNPPartener,
    } = req.body;
  
    try {
      // Validare pentru datele obligatorii
      if (!Nume || !Prenume || !CNP || !DataNasterii || !Sex) {
        return res.status(400).json({ error: 'Nu ati completat date obligatorii sunt obligatorii.' });
      }
  
      let IDPartener = null;
  
      if (CNPPartener) {
        const partenerResult = await pool.request()
          .input('CNPPartener', sql.NVarChar, CNPPartener.trim())
          .query(`
            SELECT IDPersoana
            FROM Persoane
            WHERE RTRIM(CNP) = @CNPPartener
          `);
  
        if (partenerResult.recordset.length > 0) {
          IDPartener = partenerResult.recordset[0].IDPersoana;
        } else {
          return res.status(400).json({ error: 'CNP-ul partenerului nu a fost găsit în baza de date.' });
        }
      }
  
      // Actualizează datele în tabelul Persoane
      await pool.request()
        .input('Nume', sql.NVarChar, Nume.trim())
        .input('Prenume', sql.NVarChar, Prenume.trim())
        .input('CNP', sql.NVarChar, CNP.trim())
        .input('DataNasterii', sql.Date, DataNasterii)
        .input('Sex', sql.NVarChar, Sex)
        .input('Telefon', sql.NVarChar, Telefon)
        .input('Email', sql.NVarChar, Email)
        .input('IDPartener', sql.Int, IDPartener)
        .input('IDPersoana', sql.Int, id)
        .query(`
          UPDATE Persoane
          SET Nume = @Nume,
              Prenume = @Prenume,
              CNP = @CNP,
              DataNasterii = @DataNasterii,
              Sex = @Sex,
              Telefon = @Telefon,
              Email = @Email,
              IDPartener = @IDPartener
          WHERE IDPersoana = @IDPersoana
        `);
  
      res.status(200).json({ message: 'Persoana a fost actualizată cu succes.' });
    } catch (error) {
      console.error('Eroare la actualizarea persoanei:', error);
      res.status(500).json({ error: 'Eroare la actualizarea persoanei.' });
    }
  });

  app.put('/api/update-permis-categorie', async (req, res) => {
    const { CNP, IDCategorie, DataDobandire } = req.body;
  
    try {
      // Validare pentru datele obligatorii
      if (!CNP || !IDCategorie || !DataDobandire) {
        return res.status(400).json({ error: 'CNP, IDCategorie și Data Dobândirii sunt obligatorii.' });
      }
  
      // Verifică dacă persoana cu CNP-ul dat există
      const personResult = await pool.request()
        .input('CNP', sql.NVarChar, CNP.trim())
        .query(`
          SELECT IDPersoana
          FROM Persoane
          WHERE RTRIM(CNP) = @CNP
        `);
  
      if (personResult.recordset.length === 0) {
        return res.status(400).json({ error: 'CNP-ul specificat nu corespunde niciunei persoane existente.' });
      }
  
      const IDPersoana = personResult.recordset[0].IDPersoana;
  
      // Obține permisul asociat persoanei
      const permisResult = await pool.request()
        .input('IDPersoana', sql.Int, IDPersoana)
        .query(`
          SELECT IDPermis
          FROM Permise
          WHERE IDPersoana = @IDPersoana
        `);
  
      if (permisResult.recordset.length === 0) {
        return res.status(400).json({ error: 'Persoana nu deține niciun permis de conducere.' });
      }
  
      const IDPermis = permisResult.recordset[0].IDPermis;
  
      // Verifică dacă asocierea permis-categorie există
      const asociereResult = await pool.request()
        .input('IDPermis', sql.Int, IDPermis)
        .input('IDCategorie', sql.Int, IDCategorie)
        .query(`
          SELECT *
          FROM PermiseCategoriiPermis
          WHERE IDPermis = @IDPermis AND IDCategorie = @IDCategorie
        `);
  
      if (asociereResult.recordset.length === 0) {
        return res.status(404).json({ error: 'Asocierea permis-categorie nu a fost găsită.' });
      }
  
      // Actualizează DataDobandire
      await pool.request()
        .input('IDPermis', sql.Int, IDPermis)
        .input('IDCategorie', sql.Int, IDCategorie)
        .input('DataDobandire', sql.Date, DataDobandire)
        .query(`
          UPDATE PermiseCategoriiPermis
          SET DataDobandire = @DataDobandire
          WHERE IDPermis = @IDPermis AND IDCategorie = @IDCategorie
        `);

      // Calculează DataExpirare = DataDobandire + 5 ani
      const updatedDataDobandire = new Date(DataDobandire);
      const updatedDataExpirare = new Date(updatedDataDobandire);
      updatedDataExpirare.setFullYear(updatedDataExpirare.getFullYear() + 5);
      const DataExpirareNew = updatedDataExpirare.toISOString().split('T')[0]; // Format YYYY-MM-DD

      // Actualizează DataExpirare în Permise
      await pool.request()
        .input('IDPermis', sql.Int, IDPermis)
        .input('DataExpirareNew', sql.Date, DataExpirareNew)
        .query(`
          UPDATE Permise
          SET DataExpirare = @DataExpirareNew
          WHERE IDPermis = @IDPermis
        `);
  
      res.status(200).json({ message: 'Data Dobândirii a fost actualizată cu succes.' });
    } catch (error) {
      console.error('Eroare la actualizarea DataDobandire:', error);
      res.status(500).json({ error: 'Eroare la actualizarea Data Dobândirii.' });
    }
  });
  

  ///////////////////////////////////////////////delete//////////////////////////////////////////////////

  app.delete('/api/sterge-persoana/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      const deleteResult = await pool.request()
        .input('IDPersoana', sql.Int, id)
        .query(`
          DELETE FROM Persoane
          WHERE IDPersoana = @IDPersoana
        `);
  
      if (deleteResult.rowsAffected[0] > 0) {
        res.status(200).json({ message: 'Persoana a fost ștearsă cu succes.' });
      } else {
        res.status(404).json({ error: 'Persoana nu a fost găsită.' });
      }
    } catch (error) {
      console.error('Eroare la ștergerea persoanei:', error);
      res.status(500).json({ error: 'Eroare la ștergerea persoanei.' });
    }
  });

  app.delete('/api/delete-permis-categorie', async (req, res) => {
    const { CNP, IDCategorie } = req.body;
  
    try {
      // Validare pentru datele obligatorii
      if (!CNP || !IDCategorie) {
        return res.status(400).json({ error: 'CNP și IDCategorie sunt obligatorii.' });
      }
  
      // Verifică dacă persoana cu CNP-ul dat există
      const personResult = await pool.request()
        .input('CNP', sql.NVarChar, CNP.trim())
        .query(`
          SELECT IDPersoana
          FROM Persoane
          WHERE RTRIM(CNP) = @CNP
        `);
  
      if (personResult.recordset.length === 0) {
        return res.status(400).json({ error: 'CNP-ul specificat nu corespunde niciunei persoane existente.' });
      }
  
      const IDPersoana = personResult.recordset[0].IDPersoana;
  
      // Obține permisul asociat persoanei
      const permisResult = await pool.request()
        .input('IDPersoana', sql.Int, IDPersoana)
        .query(`
          SELECT IDPermis
          FROM Permise
          WHERE IDPersoana = @IDPersoana
        `);
  
      if (permisResult.recordset.length === 0) {
        return res.status(400).json({ error: 'Persoana nu deține niciun permis de conducere.' });
      }
  
      const IDPermis = permisResult.recordset[0].IDPermis;
  
      // Verifică dacă asocierea permis-categorie există
      const asociereResult = await pool.request()
        .input('IDPermis', sql.Int, IDPermis)
        .input('IDCategorie', sql.Int, IDCategorie)
        .query(`
          SELECT *
          FROM PermiseCategoriiPermis
          WHERE IDPermis = @IDPermis AND IDCategorie = @IDCategorie
        `);
  
      if (asociereResult.recordset.length === 0) {
        return res.status(404).json({ error: 'Asocierea permis-categorie nu a fost găsită.' });
      }
  
      // Șterge asocierea
      await pool.request()
        .input('IDPermis', sql.Int, IDPermis)
        .input('IDCategorie', sql.Int, IDCategorie)
        .query(`
          DELETE FROM PermiseCategoriiPermis
          WHERE IDPermis = @IDPermis AND IDCategorie = @IDCategorie
        `);
  
      res.status(200).json({ message: 'Asocierea permis-categorie a fost ștearsă cu succes.' });
    } catch (error) {
      console.error('Eroare la ștergerea asociatiei permis-categorie:', error);
      res.status(500).json({ error: 'Eroare la ștergerea asociatiei permis-categorie.' });
    }
  });

  /////////////////////////////////////////listen/////////////////////////////////////

  app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  }).catch(err => {
    console.error('Failed to connect to the database:', err);
  });