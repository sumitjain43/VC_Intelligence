import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, BookmarkIcon, List, Settings, Menu, X } from 'lucide-react';
import CompaniesPage from './pages/CompaniesPage';
import CompanyProfile from './pages/CompanyProfile';
import ListsPage from './pages/ListsPage';
import SavedSearchesPage from './pages/SavedSearchesPage';

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [globalSearch, setGlobalSearch] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname.startsWith('/companies')) {
      const params = new URLSearchParams(location.search);
      setGlobalSearch(params.get('search') || '');
    }
  }, [location.pathname, location.search]);

  const handleGlobalSearch = (event) => {
    event.preventDefault();
    const term = globalSearch.trim();
    const params = new URLSearchParams();
    if (term) params.set('search', term);
    navigate(`/companies${params.toString() ? `?${params.toString()}` : ''}`);
  };

  return (
    <div className="flex h-screen bg-gray-950">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gray-900 border-r border-gray-800 transition-all duration-300 flex flex-col`}
      >
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <h1 className="text-xl font-bold text-blue-400">VC Scout</h1>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 hover:bg-gray-800 rounded transition"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-2">
          <Link
            to="/companies"
            className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition text-gray-300 hover:text-white"
          >
            <Search size={20} />
            {sidebarOpen && <span>Companies</span>}
          </Link>
          <Link
            to="/lists"
            className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition text-gray-300 hover:text-white"
          >
            <List size={20} />
            {sidebarOpen && <span>Lists</span>}
          </Link>
          <Link
            to="/saved"
            className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition text-gray-300 hover:text-white"
          >
            <BookmarkIcon size={20} />
            {sidebarOpen && <span>Saved Searches</span>}
          </Link>
        </nav>

        <div className="p-3 border-t border-gray-800">
          <button className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition text-gray-300 hover:text-white w-full">
            <Settings size={20} />
            {sidebarOpen && <span>Settings</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-gray-900 border-b border-gray-800 p-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 text-gray-500" size={18} />
              <input
                type="text"
                placeholder="Global search across companies, founders, and tags"
                value={globalSearch}
                onChange={(event) => setGlobalSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    handleGlobalSearch(event);
                  }
                }}
                className="w-full pl-9 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              />
            </div>
            <button
              type="button"
              onClick={handleGlobalSearch}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition text-white font-medium"
            >
              Search
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/companies" element={<CompaniesPage />} />
            <Route path="/companies/:id" element={<CompanyProfile />} />
            <Route path="/lists" element={<ListsPage />} />
            <Route path="/saved" element={<SavedSearchesPage />} />
            <Route path="/saved-searches" element={<SavedSearchesPage />} />
            <Route path="/" element={<CompaniesPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}
