"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type TechnicianRow = {
  userId: string;
  userName: string;
  email?: string | null;
  phoneNumber?: string | null;
};

async function fetchTechnicians(): Promise<TechnicianRow[]> {
  const res = await api.get("/api/UserWorkSchedule/technicians-schedules");
  const data = res.data;

  if (!data) return [];

  // API may return array of { userId, userName, email, phoneNumber, schedules }
  if (Array.isArray(data)) {
    return data.map((d) => {
      const dd = d as Record<string, unknown>;
      const userId = String(dd["userId"] ?? dd["id"] ?? "");
      const userName = String(dd["userName"] ?? dd["name"] ?? "");
      const email = dd["email"] ? String(dd["email"]) : null;
      const phoneNumber = dd["phoneNumber"] ? String(dd["phoneNumber"]) : null;
      return { userId, userName, email, phoneNumber } as TechnicianRow;
    });
  }

  return [];
}

export default function TechniciansPage() {
  const [selectedUser, setSelectedUser] = useState<TechnicianRow | null>(null);
  const [showCertificates, setShowCertificates] = useState(false);

  const {
    data: technicians = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<TechnicianRow[]>({
    queryKey: ["technicians-list"],
    queryFn: fetchTechnicians,
    staleTime: 30_000,
  });

  // Certificates query will be performed when modal opens
  type Certificate = Record<string, unknown>;

  const {
    data: certificates = [],
    refetch: refetchCertificates,
    isFetching: certLoading,
  } = useQuery<Certificate[]>({
    queryKey: ["user-certificates", selectedUser?.userId],
    queryFn: async () => {
      if (!selectedUser) return [] as Certificate[];
      const r = await api.get(
        `/api/UserCertificate/user/${selectedUser.userId}`
      );
      return (r.data as Certificate[]) ?? [];
    },
    enabled: !!selectedUser && showCertificates,
    retry: 0,
  });

  const openCertificates = (user: TechnicianRow) => {
    setSelectedUser(user);
    setShowCertificates(true);
    // react-query will run the certificates query because enabled becomes true
  };

  const closeCertificates = () => {
    setShowCertificates(false);
    setSelectedUser(null);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/staff/dashboard">
            <Button variant="ghost">Quay về Dashboard</Button>
          </Link>
          <h1 className="text-2xl font-semibold">Technicians</h1>
        </div>
        <div>
          <Button onClick={() => refetch()} variant="outline">
            Refresh
          </Button>
        </div>
      </div>

      <div className="bg-white border rounded-md shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-sm font-medium">Name</th>
              <th className="px-4 py-2 text-sm font-medium">Email</th>
              <th className="px-4 py-2 text-sm font-medium">Phone</th>
              <th className="px-4 py-2 text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-6 text-center text-sm text-gray-500"
                >
                  Loading technicians...
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-6 text-center text-sm text-red-500"
                >
                  Error loading technicians
                </td>
              </tr>
            ) : technicians.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-6 text-center text-sm text-gray-500"
                >
                  No technicians found
                </td>
              </tr>
            ) : (
              technicians.map((t) => (
                <tr key={t.userId} className="border-t">
                  <td className="px-4 py-3">{t.userName}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {t.email ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {t.phoneNumber ?? "-"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Button size="sm" onClick={() => openCertificates(t)}>
                        Quản lý certificate
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Certificates Modal */}
      {showCertificates && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={closeCertificates}
          />
          <div className="relative bg-white rounded-md shadow-xl w-[90%] max-w-2xl p-6 z-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                Certificates for {selectedUser.userName}
              </h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    refetchCertificates();
                  }}
                >
                  Refresh
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={closeCertificates}
                >
                  Close
                </Button>
              </div>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {certLoading ? (
                <div className="text-sm text-gray-500">
                  Loading certificates...
                </div>
              ) : !certificates || certificates.length === 0 ? (
                <div className="text-sm text-gray-500">
                  No certificates found
                </div>
              ) : (
                <ul className="space-y-2">
                  {certificates.map((c) => (
                    <li
                      key={c["id"] ? String(c["id"]) : JSON.stringify(c)}
                      className="border rounded p-3"
                    >
                      <div className="font-medium">
                        {(c["title"] ?? c["name"] ?? "Certificate") as string}
                      </div>
                      <div className="text-sm text-gray-600">
                        Issued:{" "}
                        {
                          (c["issuedAt"] ??
                            c["issueDate"] ??
                            c["createdAt"] ??
                            "-") as string
                        }
                      </div>
                      <div className="text-sm text-gray-600">
                        Notes:{" "}
                        {(c["notes"] ?? c["description"] ?? "-") as string}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
