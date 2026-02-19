import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';

export default function CompaniesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [newCompany, setNewCompany] = useState({
    name: '',
    industry: '',
    stage: '',
    founded: '',
    founders: '',
    description: '',
    website: '',
    location: '',
    tags: ''
  });

  const limit = 10;

  useEffect(() => {
    const paramSearch = searchParams.get('search') || '';
    const paramIndustry = searchParams.get('industry') || '';
    const paramStage = searchParams.get('stage') || '';
    const paramSort = searchParams.get('sort') || 'name';
    const paramPage = parseInt(searchParams.get('page') || '1', 10);

    setSearchTerm(paramSearch);
    setIndustryFilter(paramIndustry);
    setStageFilter(paramStage);
    setSortBy(paramSort);
    setPage(Number.isNaN(paramPage) ? 1 : paramPage);
  }, [searchParams.toString()]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (industryFilter) params.set('industry', industryFilter);
    if (stageFilter) params.set('stage', stageFilter);
    if (sortBy && sortBy !== 'name') params.set('sort', sortBy);
    if (page > 1) params.set('page', String(page));

    const next = params.toString();
    const current = searchParams.toString();
    if (next !== current) {
      setSearchParams(params, { replace: true });
    }
  }, [searchTerm, industryFilter, stageFilter, sortBy, page, searchParams, setSearchParams]);

  useEffect(() => {
    fetchCompanies();
  }, [searchTerm, industryFilter, stageFilter, sortBy, page]);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/companies', {
        params: {
          search: searchTerm,
          industry: industryFilter,
          stage: stageFilter,
          sortBy,
          page,
          limit
        }
      });
      setCompanies(response.data.companies);
      setTotalPages(response.data.pages);
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSearch = () => {
    const saves = JSON.parse(localStorage.getItem('savedSearches') || '[]');
    const searchName = prompt('Name this search:');
    if (searchName) {
      saves.push({
        id: Date.now(),
        name: searchName,
        search: searchTerm,
        industry: industryFilter,
        stage: stageFilter,
        sort: sortBy,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('savedSearches', JSON.stringify(saves));
      alert('Search saved!');
    }
  };

  const handleCreateCompany = async (event) => {
    event.preventDefault();
    setCreating(true);
    setCreateError('');
    try {
      await axios.post('/api/companies', {
        ...newCompany,
        founders: newCompany.founders,
        tags: newCompany.tags
      });
      setShowAddCompany(false);
      setNewCompany({
        name: '',
        industry: '',
        stage: '',
        founded: '',
        founders: '',
        description: '',
        website: '',
        location: '',
        tags: ''
      });
      setPage(1);
      fetchCompanies();
    } catch (error) {
      const message = error.response?.data?.error || error.message;
      setCreateError(message);
    } finally {
      setCreating(false);
    }
  };

  const industries = [
    'AI/ML',
    'Fintech',
    'Design Tools',
    'Productivity',
    'Design',
    'Developer Tools',
    'Scheduling',
    'Security',
    'Data Infrastructure',
    'Climate',
    'HealthTech'
  ];
  const stages = ['Seed', 'Series A', 'Series B', 'Growth'];

  return (
    <div className="h-full flex flex-col bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 p-6">
        <h1 className="text-3xl font-bold mb-6 text-white">Company Discovery</h1>

        {/* Search Bar */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Search companies, keywords, founders..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition flex items-center gap-2 text-white"
          >
            <Filter size={20} />
            Filters
          </button>
          <button
            onClick={handleSaveSearch}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition text-white font-medium"
          >
            Save Search
          </button>
          <button
            onClick={() => setShowAddCompany(true)}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition text-white font-medium"
          >
            Add Company
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Industry</label>
              <select
                value={industryFilter}
                onChange={(e) => {
                  setIndustryFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              >
                <option value="">All Industries</option>
                {industries.map(ind => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Stage</label>
              <select
                value={stageFilter}
                onChange={(e) => {
                  setStageFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              >
                <option value="">All Stages</option>
                {stages.map(stage => (
                  <option key={stage} value={stage}>{stage}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              >
                <option value="name">Name (A-Z)</option>
                <option value="founded">Recently Founded</option>
                <option value="stage">Stage</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-400">Loading companies...</div>
          </div>
        ) : companies.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-400">No companies match these filters.</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="px-6 py-3 font-semibold text-gray-300">Company</th>
                  <th className="px-6 py-3 font-semibold text-gray-300">Industry</th>
                  <th className="px-6 py-3 font-semibold text-gray-300">Stage</th>
                  <th className="px-6 py-3 font-semibold text-gray-300">Founded</th>
                  <th className="px-6 py-3 font-semibold text-gray-300">Location</th>
                </tr>
              </thead>
              <tbody>
                {companies.map(company => (
                  <tr
                    key={company.id}
                    onClick={() => navigate(`/companies/${company.id}`)}
                    className="border-b border-gray-800 hover:bg-gray-800 transition cursor-pointer"
                  >
                    <td className="px-6 py-3">
                      <div className="font-medium text-white">{company.name}</div>
                      <div className="text-sm text-gray-400 truncate">{company.description}</div>
                    </td>
                    <td className="px-6 py-3">{company.industry}</td>
                    <td className="px-6 py-3">
                      <span className="px-3 py-1 bg-blue-900 text-blue-200 rounded-full text-sm">
                        {company.stage}
                      </span>
                    </td>
                    <td className="px-6 py-3">{company.founded}</td>
                    <td className="px-6 py-3 text-gray-400">{company.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="bg-gray-900 border-t border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="text-sm text-gray-400">
          Page {page} of {Math.max(1, totalPages)}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition flex items-center gap-2 text-white"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => setPage(Math.min(Math.max(1, totalPages), page + 1))}
            disabled={page === Math.max(1, totalPages)}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition flex items-center gap-2 text-white"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {showAddCompany && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-6">
          <div className="bg-gray-900 border border-gray-800 rounded-lg w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Add Company</h2>
              <button
                type="button"
                onClick={() => setShowAddCompany(false)}
                className="text-gray-400 hover:text-white"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleCreateCompany} className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm text-gray-400 mb-1">Company Name *</label>
                <input
                  type="text"
                  value={newCompany.name}
                  onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Industry *</label>
                <input
                  type="text"
                  value={newCompany.industry}
                  onChange={(e) => setNewCompany({ ...newCompany, industry: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  placeholder="AI/ML"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Stage *</label>
                <input
                  type="text"
                  value={newCompany.stage}
                  onChange={(e) => setNewCompany({ ...newCompany, stage: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  placeholder="Seed, Series A..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Founded</label>
                <input
                  type="number"
                  value={newCompany.founded}
                  onChange={(e) => setNewCompany({ ...newCompany, founded: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Location</label>
                <input
                  type="text"
                  value={newCompany.location}
                  onChange={(e) => setNewCompany({ ...newCompany, location: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm text-gray-400 mb-1">Website</label>
                <input
                  type="text"
                  value={newCompany.website}
                  onChange={(e) => setNewCompany({ ...newCompany, website: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  placeholder="https://company.com"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm text-gray-400 mb-1">Description</label>
                <textarea
                  value={newCompany.description}
                  onChange={(e) => setNewCompany({ ...newCompany, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Founders (comma separated)</label>
                <input
                  type="text"
                  value={newCompany.founders}
                  onChange={(e) => setNewCompany({ ...newCompany, founders: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={newCompany.tags}
                  onChange={(e) => setNewCompany({ ...newCompany, tags: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
              </div>

              {createError && (
                <div className="col-span-2 text-sm text-red-400">
                  {createError}
                </div>
              )}

              <div className="col-span-2 flex justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCompany(false)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white disabled:opacity-50"
                >
                  {creating ? 'Saving...' : 'Create Company'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
