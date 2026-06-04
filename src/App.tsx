import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { NewsProvider } from './context/NewsContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import SavedArticles from './pages/SavedArticles';
import './styles/index.css';

function AppLayout() {
  return (
    <div className="app-shell">
      <Navbar />
      <div className="app-body">
        <Sidebar />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/saved" element={<SavedArticles />} />
          </Routes>
        </div>
      </div>
      <footer>
        <p>
          <strong>NewsDaily</strong> — Global Intelligence, Curated Daily
        </p>
        <p>
          Sources: Wall Street Journal · New York Times · BBC · The Economist ·
          Bloomberg · Financial Times · Reuters · The Guardian
        </p>
        <p style={{ marginTop: '6px', opacity: 0.6, fontSize: '0.72rem' }}>
          All articles are property of their respective publishers. This app aggregates
          publicly available RSS feeds for informational purposes only.
        </p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <NewsProvider>
          <AppLayout />
        </NewsProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
