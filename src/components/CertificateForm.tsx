'use client';
import { useState } from 'react';
import { CertificateImpl, Chain } from '@/blockchain/blockchain';
import * as crypto from 'crypto';
import * as CryptoJS from 'crypto-js';

interface CertificateFormProps {
  onUpdate: () => void;
}

export default function CertificateForm({ onUpdate }: CertificateFormProps) {
  const [issuerId, setIssuerId] = useState('');
  const [recipientId, setRecipientId] = useState('');
  const [certificateType, setCertificateType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [hash, setHash] = useState('');
  const [documentContent, setDocumentContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const documentHash = crypto.createHash('sha256').update(documentContent).digest('hex');

      const newCert = new CertificateImpl(
        documentHash,
        documentHash,
        issuerId,
        recipientId,
        certificateType,
        new Date().toISOString(),
        documentHash,
        documentContent
      );

      Chain.instance.addCertificate(newCert);
      
      // Clear form
      setIssuerId('');
      setRecipientId('');
      setCertificateType('');
      setHash('');
      setDocumentContent('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      onUpdate();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer);
      const hash = CryptoJS.SHA256(wordArray).toString();
      setHash(hash);

      const reader = new FileReader();
      reader.onload = () => {
        setDocumentContent(reader.result as string);
      };
      reader.readAsText(file);
    } catch (err) {
      console.error('Error hashing file:', err);
    }
  };

  return (
    <div className="mb-12 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4">Issue New Certificate</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-1">Issuer ID</label>
            <input
              type="text"
              value={issuerId}
              onChange={(e) => setIssuerId(e.target.value)}
              placeholder="Enter issuer ID"
              aria-label="Issuer ID"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Recipient ID</label>
            <input
              type="text"
              value={recipientId}
              onChange={(e) => setRecipientId(e.target.value)}
              placeholder="Enter recipient ID"
              aria-label="Recipient ID"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Certificate Type</label>
          <select
            value={certificateType}
            onChange={(e) => setCertificateType(e.target.value)}
            aria-label="Certificate type"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select a type</option>
            <option value="Bachelor of Science">Bachelor of Science</option>
            <option value="Master of Arts">Master of Arts</option>
            <option value="Professional Certificate">Professional Certificate</option>
          </select>
        </div>

        <div>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="mt-4 p-2 border rounded"
            required
            aria-label="Upload PDF certificate"
          />
          {hash && (
            <div className="mt-2 text-sm text-gray-600">
              Document Hash: {hash.slice(0, 12)}...
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Issuing...' : 'Issue Certificate'}
        </button>
        {success && (
          <p className="text-green-600 text-sm mt-4">
            Certificate issued successfully!
          </p>
        )}
      </form>
    </div>
  );
}
