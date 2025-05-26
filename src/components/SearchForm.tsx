"use client";
import { useState } from "react";
import { Certificate, Block } from "@/blockchain/blockchain";

interface SearchFormProps {
  chain: Block[];
}

export default function SearchForm({ chain }: SearchFormProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Certificate[]>([]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const results = chain
      .flatMap((block) => block.certificate)
      .filter(
        (cert) =>
          cert.certificateHash.includes(searchQuery) ||
          cert.recipientId.includes(searchQuery) ||
          cert.documentHash.includes(searchQuery)
      );
    setSearchResults(results);
  };

  return (
    <div className="mb-12 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4">Verify Certificate</h2>
      <form onSubmit={handleSearch} className="flex gap-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Enter certificate hash or recipient ID"
          className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500"
          aria-label="Certificate search"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Search
        </button>
      </form>

      {searchResults.length > 0 && (
        <div className="mt-6 space-y-4">
          {searchResults.map((cert, index) => (
            <div key={index} className="p-4 border rounded bg-gray-50">
              <h3 className="font-semibold text-blue-600">
                {cert.certificateType}
              </h3>
              <p className="mt-2 text-sm">
                <span className="font-medium">Issued to:</span>{" "}
                {cert.recipientId}
                <br />
                <span className="font-medium">Hash:</span>{" "}
                {cert.certificateHash}
                <br />
                <span className="font-medium">Issued on:</span>{" "}
                {new Date(cert.issueDate).toLocaleDateString()}
              </p>
              <p className="mt-2 text-xs text-green-600">
                ✓ Valid blockchain record verified
              </p>
            </div>
          ))}
        </div>
      )}

      {searchResults.length === 0 && searchQuery && (
        <p className="mt-4 text-gray-500 text-sm">
          No certificates found matching your query
        </p>
      )}
    </div>
  );
}
