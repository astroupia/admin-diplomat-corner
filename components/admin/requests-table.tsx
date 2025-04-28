"use client";

import { useState, useEffect } from "react";

interface Request {
  _id: string;
  fromUserId: string;
  toUserId: string;
  productId: string;
  itemType: "house" | "car";
  message: string;
  status: string;
  createdAt: string;
}

export default function RequestsTable() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userId } = useAuth();

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      setError(null);

      try {
        if (!userId) {
          console.error("User ID not found");
          setError("User ID not found. Please log in.");
          setLoading(false);
          return;
        }

        const response = await fetch(`/api/requests?adminUserId=${userId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch requests: ${response.status}`);
        }

        const data = await response.json();
        setRequests(data);
      } catch (error: any) {
        console.error("Failed to fetch requests:", error);
        setError("Failed to fetch requests. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [userId]);

  if (loading) {
    return <div>Loading requests...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
              ID
            </th>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
              From User
            </th>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
              To User
            </th>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
              Product
            </th>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
              Message
            </th>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
              Created At
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {requests.map((request) => (
            <tr key={request._id}>
              <td className="px-6 py-4 whitespace-no-wrap">{request._id}</td>
              <td className="px-6 py-4 whitespace-no-wrap">
                {request.fromUserId}
              </td>
              <td className="px-6 py-4 whitespace-no-wrap">
                {request.toUserId}
              </td>
              <td className="px-6 py-4 whitespace-no-wrap">
                {request.productId}
              </td>
              <td className="px-6 py-4 whitespace-no-wrap">
                {request.itemType}
              </td>
              <td className="px-6 py-4 whitespace-no-wrap">
                {request.message}
              </td>
              <td className="px-6 py-4 whitespace-no-wrap">{request.status}</td>
              <td className="px-6 py-4 whitespace-no-wrap">
                {request.createdAt}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function useAuth(): { userId: any } {
  throw new Error("Function not implemented.");
}
