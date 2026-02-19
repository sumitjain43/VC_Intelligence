import { useState, useEffect } from 'react';
import { Plus, Trash2, Download } from 'lucide-react';
import axios from 'axios';

export default function ListsPage() {
  const [lists, setLists] = useState([]);
  const [newListName, setNewListName] = useState('');
  const [expandedList, setExpandedList] = useState(null);
  const [companiesData, setCompaniesData] = useState({});

  useEffect(() => {
    loadLists();
  }, []);

  const loadLists = async () => {
    const savedLists = JSON.parse(localStorage.getItem('lists') || '[]');
    setLists(savedLists);

    // Fetch company data for all lists
    for (const list of savedLists) {
      for (const companyId of list.companies) {
        if (!companiesData[companyId]) {
          try {
            const response = await axios.get(`/api/companies/${companyId}`);
            setCompaniesData(prev => ({ ...prev, [companyId]: response.data }));
          } catch (error) {
            console.error('Error fetching company:', error);
          }
        }
      }
    }
  };

  const createList = () => {
    if (!newListName.trim()) return;

    const newList = {
      id: Date.now(),
      name: newListName,
      companies: [],
      createdAt: new Date().toISOString()
    };

    const updatedLists = [...lists, newList];
    setLists(updatedLists);
    localStorage.setItem('lists', JSON.stringify(updatedLists));
    setNewListName('');
  };

  const deleteList = (listId) => {
    if (window.confirm('Delete this list?')) {
      const updatedLists = lists.filter(l => l.id !== listId);
      setLists(updatedLists);
      localStorage.setItem('lists', JSON.stringify(updatedLists));
    }
  };

  const removeFromList = (listId, companyId) => {
    const updatedLists = lists.map(list => {
      if (list.id === listId) {
        return { ...list, companies: list.companies.filter(c => c !== companyId) };
      }
      return list;
    });
    setLists(updatedLists);
    localStorage.setItem('lists', JSON.stringify(updatedLists));
  };

  const exportList = (list) => {
    const companies = list.companies.map(id => companiesData[id]).filter(Boolean);
    const csv = [
      ['Name', 'Industry', 'Stage', 'Location', 'Website'],
      ...companies.map(c => [c.name, c.industry, c.stage, c.location, c.website])
    ]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${list.name}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const exportListJson = (list) => {
    const companies = list.companies.map(id => companiesData[id]).filter(Boolean);
    const payload = {
      list: {
        id: list.id,
        name: list.name,
        createdAt: list.createdAt
      },
      companies
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${list.name}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">My Lists</h1>

      {/* Create List */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Plus size={24} />
          Create New List
        </h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            placeholder="List name (e.g., AI Companies, Series A)"
            className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            onKeyPress={(e) => e.key === 'Enter' && createList()}
          />
          <button
            onClick={createList}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition font-medium"
          >
            Create
          </button>
        </div>
      </div>

      {/* Lists Grid */}
      <div className="grid grid-cols-1 gap-6">
        {lists.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>No lists yet. Create one to start organizing companies!</p>
          </div>
        ) : (
          lists.map(list => (
            <div key={list.id} className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
              {/* List Header */}
              <div
                onClick={() => setExpandedList(expandedList === list.id ? null : list.id)}
                className="p-6 cursor-pointer hover:bg-gray-800 transition flex items-center justify-between"
              >
                <div>
                  <h3 className="text-xl font-bold">{list.name}</h3>
                  <p className="text-sm text-gray-400">
                    {list.companies.length} {list.companies.length === 1 ? 'company' : 'companies'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      exportList(list);
                    }}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition flex items-center gap-2"
                  >
                    <Download size={18} />
                    Export CSV
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      exportListJson(list);
                    }}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition flex items-center gap-2"
                  >
                    <Download size={18} />
                    Export JSON
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteList(list.id);
                    }}
                    className="px-4 py-2 bg-red-900 hover:bg-red-800 rounded-lg transition flex items-center gap-2"
                  >
                    <Trash2 size={18} />
                    Delete
                  </button>
                </div>
              </div>

              {/* Expanded Companies List */}
              {expandedList === list.id && (
                <div className="bg-gray-800 border-t border-gray-700 p-6">
                  {list.companies.length === 0 ? (
                    <p className="text-gray-400">No companies in this list yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {list.companies.map(companyId => {
                        const company = companiesData[companyId];
                        return company ? (
                          <div
                            key={companyId}
                            className="flex items-center justify-between bg-gray-700 rounded p-4"
                          >
                            <div>
                              <div className="font-medium">{company.name}</div>
                              <div className="text-sm text-gray-400">{company.industry} - {company.stage}</div>
                            </div>
                            <button
                              onClick={() => removeFromList(list.id, companyId)}
                              className="text-red-400 hover:text-red-300 transition"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
