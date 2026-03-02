import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Constructor from './pages/Constructor';
import TipPage from './pages/TipPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Constructor />} />
        <Route path="/tip" element={<TipPage />} />
      </Routes>
    </BrowserRouter>
  );
}
