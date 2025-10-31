"use client";

import VEHICLES from "../../../mockData/vehicles.json";
import Image from "next/image";

export default function MemberVehiclesPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            My Vehicles
          </h1>
          <p className="mt-1 text-gray-600">
            List of all your registered vehicles.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(VEHICLES as any[]).map((v) => (
            <div
              key={v.id}
              className="bg-white rounded-lg shadow p-4 flex flex-col"
            >
              <div className="relative h-44 rounded overflow-hidden mb-4">
                <Image
                  src={v.image}
                  alt={v.name}
                  layout="fill"
                  objectFit="cover"
                />
              </div>
              <h3 className="font-semibold text-lg">{v.name}</h3>
              <p className="text-sm text-gray-500">{v.licensePlate}</p>
              <div className="mt-4">
                <button className="px-3 py-2 bg-indigo-600 text-white rounded">
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
