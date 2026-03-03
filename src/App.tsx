import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Constructor from './pages/Constructor';
import TipPage from './pages/TipPage';

export default function App() {
  const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';

  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/" element={<Constructor />} />
        <Route path="/tip" element={<TipPage />} />
      </Routes>
    </BrowserRouter>
  );
}
