import { useState, useEffect } from 'react';
import { timelineService } from '../services/timelineService';

const Timeline = () => {
  const [timelines, setTimelines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTimelines();
  }, []);

  const fetchTimelines = async () => {
    try {
      setLoading(true);
      const response = await timelineService.getTimelines();
      setTimelines(response.timelines || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        Error loading timeline: {error}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Our Timeline</h1>
        <p className="text-gray-600">The journey of our friendship through the years</p>
      </div>

      {timelines.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No timeline entries yet. Start creating memories!</p>
        </div>
      ) : (
        <div className="space-y-8">
          {timelines.map((timeline) => (
            <div key={timeline._id} className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 top-12 bottom-0 w-0.5 bg-gray-200"></div>
              
              {/* Timeline item */}
              <div className="flex items-start space-x-6">
                {/* Year badge */}
                <div className="flex-shrink-0 w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {timeline.year}
                </div>
                
                {/* Content */}
                <div className="flex-1 bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {timeline.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{timeline.description}</p>
                  
                  {timeline.media && timeline.media.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                      {timeline.media.slice(0, 3).map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          alt=""
                          className="w-full h-24 object-cover rounded"
                        />
                      ))}
                    </div>
                  )}
                  
                  <div className="text-sm text-gray-500">
                    By {timeline.owner.name} • {new Date(timeline.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Timeline;