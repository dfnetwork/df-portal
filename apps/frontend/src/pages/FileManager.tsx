import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { useCreateFolder, useFolder, useUpload } from '../api/files';

const FileManager: React.FC = () => {
  const { id } = useParams();
  const [currentFolder, setCurrentFolder] = useState<string | undefined>(undefined);
  const { data, isLoading } = useFolder(id!, currentFolder);
  const upload = useUpload(id!, currentFolder || (data?.folder?.id ?? ''));
  const createFolder = useCreateFolder(id!, currentFolder);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (accepted) => accepted.forEach((f) => upload.mutate(f)),
  });

  if (!id) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Files</h1>
        <button
          onClick={() => {
            const name = prompt('Folder name');
            if (name) createFolder.mutate(name);
          }}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg"
        >
          New Folder
        </button>
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-6 bg-slate-900 border-slate-700 ${
          isDragActive ? 'border-indigo-400' : ''
        }`}
      >
        <input {...getInputProps()} />
        <p className="text-center text-slate-400">
          Drag files here or click to upload
        </p>
      </div>

      {isLoading && <div>Loading...</div>}
      {data && (
        <>
          <div className="text-sm text-slate-400">
            Path: {data.folder?.name} {currentFolder && ' / ' + currentFolder}
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            {data.folders.map((f: any) => (
              <button
                key={f.id}
                onClick={() => setCurrentFolder(f.id)}
                className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-left"
              >
                📁 {f.name}
              </button>
            ))}
            {data.files.map((file: any) => (
              <div
                key={file.id}
                className="bg-slate-800 border border-slate-700 rounded-lg p-3"
              >
                📄 {file.name}
                <div className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default FileManager;
