import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './admin/Dashboard';
import FacilityEditor from './admin/FacilityEditor';
import HitEditor from './admin/HitEditor';
import Map from './components/Map';
import FacilityDetail from './components/FacilityDetail';
import HitDetail from './components/HitDetail';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Map />} />
        <Route path="/facility/:id" element={<FacilityDetail />} />
        <Route path="/hit/:id" element={<HitDetail />} />
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/admin/facility/:id" element={<FacilityEditor />} />
        <Route path="/admin/hit/:id" element={<HitEditor />} />
      </Routes>
    </Router>
  );
};

export default App;