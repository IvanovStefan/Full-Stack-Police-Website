import React from 'react';
import Header from './header'
import Register from './Register';
import Login from './Login';
import App from './App';
import Adrese from './Adrese'
import Permise from './Permise'
import Activitati from './Activitati';
import Infractiuni from './Infractiuni';
import Cazier from './Cazier';
import NewPersoane from './NewPersoane';
import NewCazier from './NewCazier';
import NewPermis from './NewPermis';
import Meniu from './Meniu';
import { Routes, Route, Navigate } from 'react-router-dom';

const Page = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/app" element={<App />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/adrese" element={<Adrese />} />
        <Route path="/permise" element={<Permise />} />
        <Route path="/activitati" element={<Activitati />} />
        <Route path="/infractiuni" element={<Infractiuni />} />
        <Route path="/cazier" element={<Cazier />} />
        <Route path="/new-persoane" element={<NewPersoane />} />
        <Route path="/new-cazier" element={<NewCazier />} />
        <Route path="/new-permis" element={<NewPermis />} />
        <Route path="/meniu" element={<Meniu />} />
      </Routes>

    </div>
  );
};

export default Page;