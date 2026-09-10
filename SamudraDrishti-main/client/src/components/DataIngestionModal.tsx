import React, { useState } from 'react';
import { 
  X, 
  UploadCloud, 
  FileText, 
  CheckCircle, 
  ExternalLink, 
  Database, 
  AlertCircle 
} from 'lucide-react';
import { uploadDatasetFile } from '../services/api';

interface DataIngestionModalProps {
  onSuccessUpload: () => void;
  onClose: () => void;
}

export const DataIngestionModal: React.FC<DataIngestionModalProps> = ({
  onSuccessUpload,
  onClose
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setResultMessage(null);
      setErrorMessage(null);
      setParsedData(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setErrorMessage(null);
    setResultMessage(null);

    try {
      const res = await uploadDatasetFile(selectedFile);
      setResultMessage(res.message || 'File parsed successfully');
      setParsedData(res.data || res.metadata);
      onSuccessUpload();
    } catch (err: any) {
      setErrorMessage(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 text-slate-700">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-wide font-sans">
                Multi-Format Ocean Data Ingestion Engine
              </h2>
              <p className="text-xs text-slate-600">
                Automated ingestion of NetCDF-4/CF files and raw In-Situ ASCII/CSV observational feeds
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-600 hover:text-slate-900 transition shadow-2xs"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex-1 overflow-y-auto flex flex-col gap-5">
          {/* Upload Drag & Drop Area */}
          <div className="border-2 border-dashed border-slate-300 hover:border-[#005a9c] rounded-xl p-6 flex flex-col items-center justify-center bg-slate-50 transition-all text-center">
            <UploadCloud className="w-8 h-8 text-slate-500 mb-2" />
            <div className="text-sm font-bold text-slate-800">
              Drop NetCDF (.nc, .nc4) or In-Situ ASCII (.txt, .csv) files here
            </div>
            <p className="text-xs text-slate-500 mt-1 mb-3">
              Automated schema parser detects CF dimensions: (time, depth, lat, lon) and WMO columns
            </p>
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".nc,.nc4,.txt,.csv,.dat"
              onChange={handleFileChange}
            />
            <label
              htmlFor="file-upload"
              className="px-4 py-2 rounded-lg bg-[#005a9c] hover:bg-[#00477d] text-white text-xs font-semibold cursor-pointer transition shadow-xs"
            >
              Browse Local Files
            </label>
            {selectedFile && (
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-800 font-mono bg-white px-3 py-1.5 rounded-lg border border-slate-300 shadow-2xs">
                <FileText className="w-4 h-4 text-[#005a9c]" />
                <span>{selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
              </div>
            )}
          </div>

          {selectedFile && (
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full py-2.5 rounded-lg bg-[#005a9c] hover:bg-[#00477d] text-white font-semibold text-xs transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Parsing NetCDF / In-Situ Data via Backend...</span>
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 text-white" />
                  <span>Execute Automated Ingestion &amp; Load into 3D Environment</span>
                </>
              )}
            </button>
          )}

          {resultMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2 font-medium">
              <CheckCircle className="w-4 h-4 flex-shrink-0 text-emerald-600" />
              <span>{resultMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Official Remote Data Portal Repositories */}
          <div className="rounded-xl p-4 bg-slate-50 border border-slate-200">
            <h3 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-slate-600" />
              Integrated National &amp; Global Ocean Data Portals
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <a
                href="https://las.incois.gov.in/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition group shadow-2xs"
              >
                <div>
                  <div className="font-bold text-slate-900 group-hover:text-[#005a9c]">INCOIS Live Access Server (LAS)</div>
                  <div className="text-[10px] text-slate-500">Numerical Ocean Model Outputs</div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#005a9c]" />
              </a>

              <a
                href="https://data.marine.copernicus.eu/product/GLOBAL_MULTIYEAR_PHY_001_030/description"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition group shadow-2xs"
              >
                <div>
                  <div className="font-bold text-slate-900 group-hover:text-[#005a9c]">Copernicus Marine Service</div>
                  <div className="text-[10px] text-slate-500">GLOBAL_MULTIYEAR_PHY_001_030</div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#005a9c]" />
              </a>

              <a
                href="ftp://ftp.ifremer.fr/ifremer/argo"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition group shadow-2xs"
              >
                <div>
                  <div className="font-bold text-slate-900 group-hover:text-[#005a9c]">Argo Global Data Repository</div>
                  <div className="text-[10px] text-slate-500">IFREMER GDAC FTP Server</div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#005a9c]" />
              </a>

              <a
                href="ftp://ftp.ifremer.fr/ifremer/glider/v2/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition group shadow-2xs"
              >
                <div>
                  <div className="font-bold text-slate-900 group-hover:text-[#005a9c]">Ocean Glider Global Data (v2)</div>
                  <div className="text-[10px] text-slate-500">Autonomous Underwater Glider DAC</div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#005a9c]" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold text-xs transition shadow-2xs cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
