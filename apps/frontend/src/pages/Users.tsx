import React from 'react';
import { useUsers } from '../api/users';

const Users: React.FC = () => {
  const { data } = useUsers();
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Users</h1>
      <div className="bg-slate-800 border border-slate-700 rounded-xl">
        <table className="w-full text-left">
          <thead>
            <tr className="text-slate-400">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((u: any) => (
              <tr key={u.id} className="border-t border-slate-700">
                <td className="px-4 py-3">{u.name}</td>
                <td className="px-4 py-3 text-slate-300">{u.email}</td>
                <td className="px-4 py-3">{u.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
