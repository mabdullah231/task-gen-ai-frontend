import React, { useEffect, useState } from "react";
import axios from "axios";
import Helpers from "../../../Config/Helpers";
import Loader from "../../../Components/Common/Loader";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const authUser  = Helpers.getAuthUser();
  // Fetch admin stats
  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${Helpers.apiUrl}admin/stats`, Helpers.getAuthHeaders());
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminStats();
  }, []);

  return (
    <div className="p-6 ">
      <h1 className="text-3xl font-bold text-center text-orange-700 mb-6">      {authUser.user_type == "0" ? "Admin" : "Sub Admin"} Dashboard</h1>

      {loading ? (
        <Loader />
      ) : (
        stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 justify-center">

          </div>
        )
      )}
    </div>
  );
};

export default AdminDashboard;