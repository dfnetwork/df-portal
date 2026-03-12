import React from 'react';
import { useProjects } from '../api/projects';

const Dashboard: React.FC = () => {
  const { data: projects } = useProjects();
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects?.map((p: any) => (
          <div key={p.id} className="rounded-xl bg-slate-800 p-4 border border-slate-700">
            <div className="font-medium">{p.name}</div>
            <div className="text-sm text-slate-400">{p.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
