import React, { useState, useEffect } from "react";
import axios from "axios";
import { ChevronDown, ChevronRight } from "lucide-react";
import Helpers from "../../../Config/Helpers";
import Loader from "../../../Components/Common/Loader";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const UserTaskBot = () => {
  const [step, setStep] = useState(1);
  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("");
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [suggestionsFetched, setsuggestionsFetched] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [expandedTaskIndex, setExpandedTaskIndex] = useState(null);
  const [tasks, setTasks] = useState([
    { id: 1, title: "Setup React Frontend", priority: "High", days: 2 },
    { id: 2, title: "Initialize Laravel Backend", priority: "High", days: 2 },
    { id: 3, title: "Create Auth APIs", priority: "Medium", days: 3 },
    {
      id: 4,
      title: "Implement Job Posting Module",
      priority: "Medium",
      days: 4,
    },
  ]);


  const cleanSpaces= (str) => {
    return str.trim().replace(/\s+/g, ' ');
  }

  const exportTasksToPDF = (tasks) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    const Title = title || "Final Task_Plan";
    doc.text(Title, 20 ,20);
  
    tasks.reverse().forEach((task, index) => {
      const startY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 30;
  
      doc.setFontSize(14);
      doc.setTextColor(255, 87, 34); 
      doc.text(`${index + 1}. ${task.title}`, 14, startY);
  
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Priority: ${task.priority} | Duration: ${task.days} day(s)`, 14, startY + 7);
  
      const subtaskData = task.subtasks.map((subtask, i) => [`${i + 1}`, subtask]);
  
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
    const cleanedTitle = cleanSpaces(title) || "Task_Plan";

    // Now use the cleaned title for saving the document
    doc.save(`${cleanedTitle}.pdf`);
    // doc.save(title ?  :"Task_Plan.pdf");
  };

  const fetchSuggestions = async () => {
    try {
      setLoadingSuggestions(true);
      setsuggestionsFetched(false);
      setShowBubble(true);
      const res = await axios.post(
        `${Helpers.apiUrl}user/taskbot/generate-suggestions`,
        {
          description,
        },
        Helpers.getAuthHeaders()
      );
      console.log(res);

      if (res.data?.data) {
        const allSuggestions = res.data.data.tasks;
        const title = res.data.data.title;
        const topSuggestions = res.data.data.tasks
          .slice(0, 4)
          .map((item) => item.task);
        setSuggestions(topSuggestions);
        const formattedTasks = allSuggestions.map((s, idx) => ({
          id: idx + 1,
          title: s.task,
          priority: s.priority,
          days: s.days,
          subtasks: Array.isArray(s.sub_tasks) ? s.sub_tasks : [],
        }));
        setTasks(formattedTasks);
        setTitle(title)
        console.log("Formatted Tasks:", formattedTasks);
        setsuggestionsFetched(true);
        console.log("All Suggestions: ", allSuggestions);
        console.log("Suggestions: ", topSuggestions);
      }
    } catch (err) {
      setsuggestionsFetched(false);
      console.error("Error fetching suggestions:", err);
    } finally {
      setLoadingSuggestions(false);
      setShowBubble(false);
    }
  };
  useEffect(() => {
    if (!description) return;

    if (typingTimeout) clearTimeout(typingTimeout);

    const timeout = setTimeout(() => {
      fetchSuggestions();
    }, 2000);

    setTypingTimeout(timeout);

    return () => clearTimeout(timeout); // Clean up on unmount/change
  }, [description]);
  const handleDragStart = (e, index) => {
    e.dataTransfer.setData("dragIndex", index);
  };

  const toggleSubtasks = (index) => {
    setExpandedTaskIndex(expandedTaskIndex === index ? null : index);
  };

  const cancelBubbleClick = () => {
    setShowBubble(false);
    setLoadingSuggestions(false);
  };

  const handleDrop = (e, dropIndex) => {
    const dragIndex = e.dataTransfer.getData("dragIndex");
    const updatedTasks = [...tasks];
    const draggedTask = updatedTasks.splice(dragIndex, 1)[0];
    updatedTasks.splice(dropIndex, 0, draggedTask);
    setTasks(updatedTasks);
  };

  return (
    <div className="min-h-screen bg-orange-50 text-zinc-800 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-orange-700">
          ✨ TaskBot – AI Project Planner
        </h1>
        <p className="mb-6 text-zinc-600">
          Plan smarter. Generate tasks, assign priorities, and export timelines
          seamlessly.
        </p>

        {/* Step Indicators */}
        <div className="flex justify-between gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 text-center py-2 rounded ${
                step === s
                  ? "bg-orange-600 text-white"
                  : "bg-orange-200 text-orange-800"
              }`}
            >
              Step {s}
            </div>
          ))}
        </div>

        {step === 1 && (
          <>
            <div className="flex justify-between">
              <label className="block font-medium mb-2">Project Overview</label>
              <button
                onClick={fetchSuggestions}
                disabled={loadingSuggestions || !description}
                className="text-sm text-orange-500 underline"
              >
                {loadingSuggestions ? "Loading..." : "🔄 Regenerate"}
              </button>
            </div>

            <div className="relative w-[100%] flex justify-center">
              {showBubble && (
                <div
                  style={{ borderRadius: "100%" }}
                  className="absolute flex flex-col m-auto h-[100px] w-[100px]shadow-lg p-4 my-2 z-50"
                >
                  <p className="text-sm text-center text-zinc-800">
                    <Loader h="10" />
                  </p>
                  <button
                    onClick={() => {
                      cancelBubbleClick();
                    }}
                    className="mt-2 text-orange-600 cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
            <div className="relative">
              <textarea
                rows={4}
                className="w-full p-4 border border-orange-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Describe your project..."
                value={description}
                disabled={loadingSuggestions}
                onChange={(e) => setDescription(e.target.value)}
              />
              {loadingSuggestions && (
                <div className="absolute inset-0 bg-gray-800/50 rounded cursor-not-allowed"></div>
              )}
            </div>

            {suggestionsFetched && (
              <div className="mt-6 mb-4 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-orange-700">
                  Suggestions based on input:
                </h2>
              </div>
            )}

            <ul className="grid md:grid-cols-2 gap-4">
              {suggestionsFetched
                ? suggestions.map((s, i) => (
                    <li
                      key={i}
                      className="bg-white border border-orange-200 rounded p-3 shadow-sm text-sm"
                    >
                      {s}
                    </li>
                  ))
                : ""}
            </ul>
            {suggestionsFetched && (
              <button
                onClick={() => setStep(2)}
                className="mt-6 bg-orange-600 text-white px-6 py-2 rounded hover:bg-orange-700"
              >
                Next: Edit Tasks
              </button>
            )}
          </>
        )}

        {/* Step 2: Task Editor */}
        {step === 2 && (
          <>
            <h2 className="text-xl font-semibold mb-4 text-orange-700">
              📝 Editable Task List
            </h2>
            <p className="text-sm text-zinc-500 mb-4">
              Drag and drop to reorder. Edit priority or days.
            </p>

            <ul>
              <li className="bg-white border border-orange-200 mb-3 rounded p-4 shadow-sm flex flex-col">
                <div className="flex justify-between items-center w-[100%]">
                  <input
                    className="font-medium w-1/15"
                    placeholder="Action"
                    disabled={true}
                  />
                  <input
                    className="font-medium w-1/2"
                    placeholder="Task Title"
                    disabled={true}
                  />
                  <input
                    className="font-medium text-center"
                    placeholder="Task Priority"
                    disabled={true}
                  />
                  <input
                    className="font-medium w-1/14"
                    placeholder="Days"
                    disabled={true}
                  />
                </div>
              </li>
              {tasks.map((task, index) => (
                <li
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, index)}
                  className="flex flex-col gap-2 bg-white border border-orange-200 mb-3 rounded p-4 shadow-sm transition-all duration-300"
                >
                  <div className=" flex justify-between items-center">
                    {expandedTaskIndex === index ? (
                      <ChevronDown
                        className="cursor-pointer"
                        onClick={() => toggleSubtasks(index)}
                      />
                    ) : (
                      <ChevronRight
                        className="cursor-pointer"
                        onClick={() => toggleSubtasks(index)}
                      />
                    )}
                    <input
                      className="font-medium w-1/2"
                      value={task.title}
                      onChange={(e) => {
                        const newTasks = [...tasks];
                        newTasks[index].title = e.target.value;
                        setTasks(newTasks);
                      }}
                    />
                    <select
                      className="ml-4 border rounded px-2 py-1"
                      value={task.priority}
                      onChange={(e) => {
                        const newTasks = [...tasks];
                        newTasks[index].priority = e.target.value;
                        setTasks(newTasks);
                      }}
                    >
                      <option>Critical</option>
                      <option>High</option>
                      <option>Medium</option>
                      <option>Low</option>
                    </select>
                    <input
                      type="number"
                      min="1"
                      className="ml-4 w-16 border rounded px-2 py-1"
                      value={task.days}
                      onChange={(e) => {
                        const newTasks = [...tasks];
                        newTasks[index].days = parseInt(e.target.value) || 1;
                        setTasks(newTasks);
                      }}
                    />
                  </div>

                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      expandedTaskIndex === index ? "max-h-96 mt-2" : "max-h-0"
                    }`}
                  >
                    {task.subtasks.map((subtask, subindex) => (
                      <input
                        key={subindex}
                        className="block w-full mb-1 border border-orange-100 px-2 py-1 rounded"
                        value={subtask}
                        onChange={(e) => {
                          const newTasks = [...tasks];
                          newTasks[index].subtasks[subindex] = e.target.value;
                          setTasks(newTasks);
                        }}
                      />
                    ))}
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex justify-between mt-6">
              <button
                onClick={() => setStep(1)}
                className="text-orange-600 border border-orange-400 px-6 py-2 rounded hover:bg-orange-100"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="bg-orange-600 text-white px-6 py-2 rounded hover:bg-orange-700"
              >
                Next: Preview & Export
              </button>
            </div>
          </>
        )}

        {/* Step 3: Final Output */}
        {step === 3 && (
          <>
            <h2 className="text-xl font-semibold mb-4 text-orange-700">
              📋 {title ? title : "Final Task Plan"}
            </h2>
            <ul className="mb-6">
              {tasks.map((task, index) => (
                <li
                  key={index}
                  className="bg-white border-l-4 border-orange-500 p-3 mb-3 shadow-sm"
                >
                  <p className="font-semibold">{task.title}</p>
                  <p className="text-sm text-zinc-500">
                    Priority: {task.priority} | Duration: {task.days} day(s)
                  </p>
                  <ul className="ml-4">
                    {task.subtasks.map((subtask, index) => (
                      <li key={index}>
                        <p className="text-gray-400 text-sm">
                          {index + 1} : {subtask}
                        </p>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="text-orange-600 border border-orange-400 px-6 py-2 rounded hover:bg-orange-100"
                >
                ← Back
              </button>
              <button
                onClick={() => exportTasksToPDF(tasks)}
                className="bg-orange-600 text-white px-6 py-2 rounded hover:bg-orange-700"
              >
                📥 Export as PDF / Excel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserTaskBot;
