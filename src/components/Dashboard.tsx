import { Block } from "@/blockchain/blockchain";
import { format } from "date-fns";

interface DashboardProps {
  chain: Block[];
}

export default function Dashboard({ chain }: DashboardProps) {
  return (
    <div className="dashboard-container">
      <h1 className="text-3xl font-bold mb-8">Blockchain Records</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {chain.map((block) => (
          <div key={block.hash} className="block-record">
            <h3 className="text-xl font-semibold">Block #{block.index}</h3>
            <p className="text-gray-600">
              Hash: {block.hash.substring(0, 10)}...
            </p>
            <p className="text-gray-600">
              Timestamp: {format(block.timestamp, "MMM d, yyyy HH:mm")}
            </p>
            <div className="certificate-details mt-2">
              <h4 className="font-medium">Certificate Details:</h4>
              <p>Issuer: {block.certificate.issuerId}</p>
              <p>Recipient: {block.certificate.recipientId}</p>
              <p>Type: {block.certificate.certificateType}</p>
              {block.certificate.document ? (
                <div className="preview-container">
                  <p className="text-sm font-mono break-all">
                    Document Hash: {block.certificate.hash.substring(0, 10)}...
                  </p>
                </div>
              ) : (
                <div className="text-gray-500">No document attached</div>
              )}
              <div className="hash-display mt-4">
                <span className="font-medium">Certificate Hash:</span>
                <code className="ml-2 text-sm text-blue-600">
                  {block.certificate.hash.substring(0, 10)}...
                </code>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
