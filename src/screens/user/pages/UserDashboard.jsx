import React, { useEffect, useState } from "react";
import axios from "axios";
import Helpers from "../../../Config/Helpers";
import Loader from "../../../Components/Common/Loader";

const UserDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user stats
  const fetchUserStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${Helpers.apiUrl}user/stats`, Helpers.getAuthHeaders());
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching user stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserStats();
  }, []);

  return (
    <div className="p-6 min-h-screen">
      <h1 className="text-3xl font-bold text-center text-orange-700 mb-6"> User Dashboard</h1>

      {loading ? (
        <Loader />
      ) : (
        stats && (
          <div className="max-w-4xl mx-auto">

          </div>
        )
      )}
    </div>
  );
};

export default UserDashboard;
