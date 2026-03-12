import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProject } from '../api/projects';

const ProjectDetail: React.FC = () => {
  const { id } = useParams();
  const { data } = useProject(id);
  if (!id) return null;
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-1">{data?.name}</h1>
          <p className="text-slate-400">{data?.description}</p>
        </div>
        <Link
          to={`/projects/${id}/files`}
          className="px-4 py-2 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600"
        >
          Open Files
        </Link>
      </div>
      <div className="mt-6">
        <h2 className="text-lg font-medium mb-2">Members</h2>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-2">
          {data?.members?.map((m: any) => (
            <div key={m.id} className="flex justify-between text-sm">
              <span>{m.userId}</span>
              <span className="text-slate-400">{m.role}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
