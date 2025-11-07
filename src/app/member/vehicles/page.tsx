"use client";

import { useState, useEffect } from "react";
import { bookingService } from "@/services/bookingService";
import { Vehicle } from "@/entities/vehicle.types";

export default function MemberVehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const data = await bookingService.getVehicle();
        setVehicles(data);
      } catch (error) {
        console.error("Failed to fetch vehicles:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading vehicles...</div>
      </div>
    );
  }

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

        {vehicles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No vehicles found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {vehicles.map((vehicle) => (
              <div
                key={vehicle.vehicleId}
                className="bg-white rounded-lg shadow p-4 flex justify-between items-center"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">License Plate:</span>
                    <span>{vehicle.licensePlate}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Year:</span>
                    <span>{vehicle.year}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Color:</span>
                    <span>{vehicle.color}</span>
                  </div>
                </div>
                <div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      vehicle.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {vehicle.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
