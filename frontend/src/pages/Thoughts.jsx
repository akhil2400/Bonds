import { useState, useEffect } from 'react';
import { thoughtService } from '../services/thoughtService';

const Thoughts = () => {
  const [thoughts, setThoughts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newThought, setNewThought] = useState({ title: '', content: '', isPrivate: true });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchThoughts();
  }, []);

  const fetchThoughts = async () => {
    try {
      setLoading(true);
      const response = await thoughtService.getThoughts();
      setThoughts(response.thoughts || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateThought = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);
      await thoughtService.createThought(newThought);
      setNewThought({ title: '', content: '', isPrivate: true });
      setShowCreateForm(false);
      fetchThoughts();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Thoughts</h1>
          <p className="text-gray-600">Personal reflections and musings</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          {showCreateForm ? 'Cancel' : 'New Thought'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-8">
          <form onSubmit={handleCreateThought}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                required
                value={newThought.title}
                onChange={(e) => setNewThought({ ...newThought, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="What's on your mind?"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <textarea
                required
                rows={4}
                value={newThought.content}
                onChange={(e) => setNewThought({ ...newThought, content: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Share your thoughts..."
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newThought.isPrivate}
                  onChange={(e) => setNewThought({ ...newThought, isPrivate: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-600">Keep private</span>
              </label>
              <button
                type="submit"
                disabled={creating}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create Thought'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Thoughts List */}
      {thoughts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No thoughts yet. Share what's on your mind!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {thoughts.map((thought) => (
            <div key={thought._id} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-semibold text-gray-900">{thought.title}</h3>
                {thought.isPrivate && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    Private
                  </span>
                )}
              </div>
              <p className="text-gray-600 mb-4 whitespace-pre-wrap">{thought.content}</p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>By {thought.owner.name}</span>
                <span>{new Date(thought.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Thoughts;