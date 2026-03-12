import React from 'react';
import { Link } from 'react-router-dom';
import { useProjects } from '../api/projects';

const Projects: React.FC = () => {
  const { data } = useProjects();
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Projects</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.map((p: any) => (
          <Link
            key={p.id}
            to={`/projects/${p.id}`}
            className="bg-slate-800 border border-slate-700 rounded-xl p-4 hover:border-indigo-400"
          >
            <div className="font-semibold text-white">{p.name}</div>
            <div className="text-slate-400 text-sm">{p.description}</div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Projects;
