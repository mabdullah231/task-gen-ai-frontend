import React, { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Helpers from "../../../Config/Helpers";
import Loader from "../../../Components/Common/Loader";

const UserPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null); // To store the selected plan for viewing
  const [isModalOpen, setIsModalOpen] = useState(false); // To handle modal open/close
  const [tasks, setTasks] = useState([]); // To store tasks of the selected plan

  useEffect(() => {
    fetchPlans();
  }, []);

  // Fetch all the plans initially
  const fetchPlans = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${Helpers.apiUrl}user/plans/all`,
        {},
        Helpers.getAuthHeaders()
      );
      setPlans(response.data.data || []);
      setError(null);
    } catch (error) {
      console.error("Error fetching plans:", error);
      setError("Failed to load plans. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTasksForPlan = async (planId) => {
    try {
      const response = await axios.post(
        `${Helpers.apiUrl}user/plans/single/id`,
        { plan_id: planId },
        Helpers.getAuthHeaders()
      );
      console.log("Plan Tasks", response.data.data.tasks);
      setTasks(response.data.data.tasks || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setError("Failed to load tasks. Please try again later.");
    }
  };

  // Exporting the plan to PDF
  // const exportPlanToPDF = (plan) => {
  //   const doc = new jsPDF();
  //   doc.setFontSize(18);
  //   doc.text(plan.title, 20, 20);

  //   // Loop over tasks and add them to the PDF
  //   tasks.reverse().forEach((task, index) => {
  //     const startY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 30;

  //     doc.setFontSize(14);
  //     doc.setTextColor(255, 87, 34);
  //     doc.text(`${index + 1}. ${task.task}`, 14, startY);

  //     doc.setFontSize(11);
  //     doc.setTextColor(100);
  //     doc.text(
  //       `Priority: ${task.priority} | Duration: ${task.days} day(s)`,
  //       14,
  //       startY + 7
  //     );

  //     const subtaskData = task.sub_tasks.map((subtask, i) => [
  //       `${i + 1}`,
  //       subtask,
  //     ]);

  //     autoTable(doc, {
  //       startY: startY + 12,
  //       head: [["#", "Subtask"]],
  //       body: subtaskData,
  //       theme: "grid",
  //       styles: {
  //         fontSize: 10,
  //       },
  //       headStyles: {
  //         fillColor: [255, 87, 34],
  //         textColor: [255, 255, 255],
  //       },
  //       margin: { left: 14, right: 14 },
  //     });
  //   });

  //   doc.save(`${plan.title.replace(/\s+/g, "_")}_plan.pdf`);
  // };

  const exportPlanToPDF = (plan) => {
    if (!tasks || tasks.length === 0) {
      alert(
        "Please view the plan details first to load tasks before exporting."
      );
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(18);
    const Title = plan.title || "Final Task_Plan";
    doc.text(Title, 20, 20);

    const tasksToExport = [...tasks].map((task) => ({
      title: task.task, 
      priority: task.priority,
      days: task.days,
      subtasks: task.sub_tasks || [], 
    }));

    tasksToExport.reverse().forEach((task, index) => {
      const startY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 30;

      doc.setFontSize(14);
      doc.setTextColor(255, 87, 34);
      doc.text(`${index + 1}. ${task.title}`, 14, startY);

      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(
        `Priority: ${task.priority} | Duration: ${task.days} day(s)`,
        14,
        startY + 7
      );

      const subtaskData = task.subtasks.map((subtask, i) => [
        `${i + 1}`,
        subtask,
      ]);

      autoTable(doc, {
        startY: startY + 12,
        head: [["#", "Subtask"]],
        body: subtaskData,
        theme: "grid",
        styles: {
          fontSize: 10,
        },
        headStyles: {
          fillColor: [255, 87, 34],
          textColor: [255, 255, 255],
        },
        margin: { left: 14, right: 14 },
      });
    });

    const cleanSpaces = (str) => {
      return str.trim().replace(/\s+/g, " ");
    };

    const cleanedTitle = cleanSpaces(plan.title) || "Task_Plan";
    doc.save(`${cleanedTitle}.pdf`);
  };

  const viewPlanDetails = (plan) => {
    setSelectedPlan(plan);
    fetchTasksForPlan(plan.plan_id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPlan(null);
    setTasks([]);
  };

  // Function to truncate text if too long
  const truncateText = (text, length) => {
    if (text && text.length > length) {
      return text.substring(0, length) + "...";
    }
    return text;
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-medium mb-4">Your Task Plans</h2>

      <div className="overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">
                Plan Title
              </th>
              <th scope="col" className="px-6 py-3">
                Plan Description
              </th>
              <th scope="col" className="px-6 py-3">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {plans.map((plan) => (
              <tr
                key={plan.plan_id}
                className="bg-white border-b hover:bg-gray-50"
              >
                <td className="px-6 py-4 font-medium text-gray-900">
                  {plan.title}
                </td>
                <td className="px-6 py-4">
                  {truncateText(plan.description, 80)}
                </td>{" "}
                {/* Truncated */}
                <td className="px-6 py-4">
                  <button
                    onClick={() => viewPlanDetails(plan)}
                    className="text-blue-600 hover:underline mr-2"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-3/4 max-w-4xl h-3/4 overflow-auto">
            <h3 className="text-2xl font-semibold mb-4">
              {selectedPlan.title}
            </h3>
            <p className="mb-4">{selectedPlan.description}</p> {/* Truncated */}
            <h4 className="text-xl font-semibold mb-4">Tasks</h4>
            <ul>
              {tasks.length === 0 ? (
                <li className="text-gray-500">No tasks available.</li>
              ) : (
                tasks.map((task, index) => (
                  <li key={index} className="mb-4">
                    <p className="font-medium">{truncateText(task.task, 40)}</p>{" "}
                    {/* Truncated */}
                    <p className="text-sm text-zinc-500">
                      Priority: {task.priority} | Duration: {task.days} day(s)
                    </p>
                    <ul className="ml-4">
                      {task.sub_tasks.map((subtask, subIndex) => (
                        <li key={subIndex} className="text-gray-400 text-sm">
                          {subIndex + 1}. {subtask}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))
              )}
            </ul>
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={closeModal}
                className="bg-gray-200 px-4 py-2 cursor-pointer transition duration-75 hover:bg-gray-300 rounded-md text-gray-800"
              >
                Close
              </button>
              <button
                onClick={() => exportPlanToPDF(selectedPlan)}
                className="bg-orange-500 hover:bg-orange-600 transition duration-75 cursor-pointer text-white px-4 py-2 rounded-md"
              >
                Export PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default UserPlans;
