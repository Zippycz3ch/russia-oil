import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './admin/Dashboard';
import Map from './components/Map';
import FacilityDetail from './components/FacilityDetail';

const App: React.FC = () => {
  return (
    <Router basename="/russia-oil">
      <Routes>
        <Route path="/" element={<Map />} />
        <Route path="/facility/:id" element={<FacilityDetail />} />
        <Route path="/admin" element={<Dashboard />} />
      </Routes>
    </Router>
  );
};

export default App;