import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Play, Clock } from 'lucide-react';

export default function SavedSearchesPage() {
  const navigate = useNavigate();
  const [searches, setSearches] = useState([]);

  useEffect(() => {
    loadSearches();
  }, []);

  const loadSearches = () => {
    const saved = JSON.parse(localStorage.getItem('savedSearches') || '[]');
    setSearches(saved.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
  };

  const deleteSearch = (searchId) => {
    const updated = searches.filter(s => s.id !== searchId);
    setSearches(updated);
    localStorage.setItem('savedSearches', JSON.stringify(updated));
  };

  const runSearch = (search) => {
    // Navigate back to companies page with query params
    const params = new URLSearchParams();
    if (search.search) params.append('search', search.search);
    if (search.industry) params.append('industry', search.industry);
    if (search.stage) params.append('stage', search.stage);
    if (search.sort) params.append('sort', search.sort);

    navigate(`/companies?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Saved Searches</h1>

      {searches.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center text-gray-400">
          <p>No saved searches yet. Create a search in Companies and save it!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {searches.map(search => (
            <div
              key={search.id}
              className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">{search.name}</h3>
                  <div className="space-y-1 text-sm text-gray-400">
                    {search.search && (
                      <p>
                        <span className="text-gray-500">Search:</span> {search.search}
                      </p>
                    )}
                    {search.industry && (
                      <p>
                        <span className="text-gray-500">Industry:</span> {search.industry}
                      </p>
                    )}
                    {search.stage && (
                      <p>
                        <span className="text-gray-500">Stage:</span> {search.stage}
                      </p>
                    )}
                    {search.sort && (
                      <p>
                        <span className="text-gray-500">Sort:</span> {search.sort}
                      </p>
                    )}
                    <p className="flex items-center gap-1 mt-3">
                      <Clock size={14} />
                      {new Date(search.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 ml-4">
                  <button
                    onClick={() => runSearch(search)}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition flex items-center gap-2 font-medium"
                  >
                    <Play size={18} />
                    Run Search
                  </button>
                  <button
                    onClick={() => deleteSearch(search.id)}
                    className="px-4 py-2 bg-red-900 hover:bg-red-800 rounded-lg transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
