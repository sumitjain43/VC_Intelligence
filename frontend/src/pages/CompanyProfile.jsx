import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Loader, Download, Plus } from 'lucide-react';
import axios from 'axios';

export default function CompanyProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [enrichment, setEnrichment] = useState(null);
  const [enrichmentMeta, setEnrichmentMeta] = useState({ cached: false, isFresh: null });
  const [loading, setLoading] = useState(true);
  const [enriching, setEnriching] = useState(false);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [lists, setLists] = useState([]);

  useEffect(() => {
    fetchCompanyData();
    fetchNotes();
    loadLists();
  }, [id]);

  const fetchCompanyData = async () => {
    try {
      const response = await axios.get(`/api/companies/${id}`);
      setCompany(response.data);

      // Try to load cached enrichment
      try {
        const enrichResponse = await axios.get(`/api/enrichment/${id}`);
        setEnrichment(enrichResponse.data.enrichment);
        setEnrichmentMeta({
          cached: true,
          isFresh: enrichResponse.data.isFresh
        });
      } catch (err) {
        // No enrichment yet
      }
    } catch (error) {
      console.error('Error fetching company:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotes = async () => {
    try {
      const response = await axios.get(`/api/notes/${id}`);
      setNotes(response.data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const loadLists = () => {
    const savedLists = JSON.parse(localStorage.getItem('lists') || '[]');
    setLists(savedLists);
  };

  const handleEnrich = async (forceRefresh = false) => {
    if (!company) return;
    setEnriching(true);
    try {
      const response = await axios.post('/api/enrich', {
        companyId: id,
        website: company.website,
        force: forceRefresh
      });
      setEnrichment(response.data.enrichment);
      setEnrichmentMeta({
        cached: response.data.cached,
        isFresh: true
      });
    } catch (error) {
      const message = error.response?.data?.error || error.message;
      alert('Error enriching company: ' + message);
    } finally {
      setEnriching(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    try {
      const response = await axios.post('/api/notes', {
        companyId: id,
        content: newNote
      });
      setNotes([response.data, ...notes]);
      setNewNote('');
    } catch (error) {
      alert('Error adding note: ' + error.message);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await axios.delete(`/api/notes/${noteId}`);
      setNotes(notes.filter(n => n.id !== noteId));
    } catch (error) {
      alert('Error deleting note: ' + error.message);
    }
  };

  const handleSaveToList = (listId) => {
    const updatedLists = lists.map(list => {
      if (list.id === listId) {
        if (!list.companies.includes(id)) {
          return { ...list, companies: [...list.companies, id] };
        }
      }
      return list;
    });
    setLists(updatedLists);
    localStorage.setItem('lists', JSON.stringify(updatedLists));
    alert('Added to list!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-400">Loading company...</div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-400">Company not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 p-6">
        <button
          onClick={() => navigate('/companies')}
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-4 transition"
        >
          <ArrowLeft size={20} />
          Back to Companies
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">{company.name}</h1>
            <p className="text-gray-400 max-w-2xl">{company.description}</p>
          </div>
          <div className="text-right">
            <span className="px-3 py-1 bg-blue-900 text-blue-200 rounded-full text-sm mr-2">
              {company.stage}
            </span>
            <span className="px-3 py-1 bg-gray-800 text-gray-200 rounded-full text-sm">
              {company.industry}
            </span>
          </div>
        </div>
      </div>

      <div className="p-6 grid grid-cols-3 gap-6">
        {/* Left Column - Company Info */}
        <div className="col-span-2 space-y-6">
          {/* Overview */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Company Overview</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-400">Founded</div>
                <div className="text-lg font-medium">{company.founded}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Location</div>
                <div className="text-lg font-medium">{company.location}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Website</div>
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300"
                >
                  {company.website}
                </a>
              </div>
              <div>
                <div className="text-sm text-gray-400">Tags</div>
                <div className="flex flex-wrap gap-2">
                  {company.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-gray-800 rounded text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Live Enrichment */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold">Intelligence & Signals</h2>
                {enrichment?.cachedAt && (
                  <div className="text-xs text-gray-500 mt-1">
                    Last enriched {new Date(enrichment.cachedAt).toLocaleString()}
                    {enrichmentMeta.cached && <span className="ml-2 text-blue-400">Cached</span>}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {enrichment && (
                  <button
                    onClick={() => handleEnrich(true)}
                    disabled={enriching}
                    className="px-3 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition text-sm text-white"
                  >
                    Re-enrich
                  </button>
                )}
                <button
                  onClick={() => handleEnrich(false)}
                  disabled={enriching}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition font-medium"
                >
                  {enriching ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      Enriching...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      Enrich Company
                    </>
                  )}
                </button>
              </div>
            </div>

            {enrichment ? (
              <div className="space-y-4">
                {/* Summary */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-300 mb-2">Summary</h3>
                  <p className="text-gray-300">{enrichment.summary}</p>
                </div>

                {/* What They Do */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-300 mb-2">What They Do</h3>
                  <ul className="space-y-2">
                    {enrichment.whatTheyDo.map((item, idx) => (
                      <li key={idx} className="text-gray-400 flex items-start gap-2">
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-blue-400"></span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Keywords */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-300 mb-2">Keywords</h3>
                  <div className="flex flex-wrap gap-2">
                    {enrichment.keywords.map(keyword => (
                      <span key={keyword} className="px-3 py-1 bg-blue-900 text-blue-200 rounded-full text-sm">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Signals */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-300 mb-2">Derived Signals</h3>
                  <div className="space-y-1">
                    {enrichment.signals.map((signal, idx) => (
                      <div key={idx} className="flex items-center text-gray-400">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                        {signal}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sources */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-300 mb-2">Sources</h3>
                  <div className="bg-gray-800 rounded p-3 space-y-2">
                    {enrichment.sources.map((source, idx) => (
                      <div key={idx} className="text-sm">
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 break-all"
                        >
                          {source.url}
                        </a>
                        <div className="text-xs text-gray-500">
                          {new Date(source.timestamp).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p>Click "Enrich Company" to pull intelligence from public sources</p>
              </div>
            )}
          </div>

          {/* Signals Timeline */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Signals Timeline</h2>
            {company.signals && company.signals.length > 0 ? (
              <div className="space-y-4">
                {[...company.signals]
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map((signal, idx) => (
                  <div key={`${signal.title}-${idx}`} className="flex gap-4">
                    <div className="text-xs text-gray-500 w-28">
                      {new Date(signal.date).toLocaleDateString()}
                    </div>
                    <div className="flex-1">
                      <div className="text-gray-200 font-medium">{signal.title}</div>
                      <div className="text-xs uppercase tracking-wide text-gray-500">
                        {signal.type}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No signals captured yet.</p>
            )}
          </div>

          {/* Notes */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Notes & Research</h2>
            <div className="mb-4">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note..."
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                rows="3"
              />
              <button
                onClick={handleAddNote}
                className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition font-medium"
              >
                Add Note
              </button>
            </div>

            <div className="space-y-3">
              {notes.map(note => (
                <div key={note.id} className="bg-gray-800 rounded p-3">
                  <p className="text-gray-200">{note.content}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-xs text-gray-500">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </div>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Save to List */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Plus size={20} />
              Save to List
            </h3>
            {lists.length > 0 ? (
              <div className="space-y-2">
                {lists.map(list => (
                  <button
                    key={list.id}
                    onClick={() => handleSaveToList(list.id)}
                    className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition text-left text-white"
                  >
                    {list.name}
                    <div className="text-xs text-gray-400">
                      {list.companies.length} companies
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No lists yet. Create one in Lists section.</p>
            )}
          </div>

          {/* Founders */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-bold mb-4">Founders</h3>
            <div className="space-y-2">
              {company.founders.map((founder, idx) => (
                <div key={idx} className="text-gray-300 text-sm">{founder}</div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-bold mb-4">Actions</h3>
            <button className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition flex items-center justify-center gap-2 mb-2">
              <Download size={18} />
              Export Profile
            </button>
            <button className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition">
              Follow Company
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
