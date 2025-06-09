import React from "react";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-zinc-900 to-zinc-800">
      {/* Left Side - AI Application Description */}
      <div className="w-full md:w-1/2 bg-orange-900 flex items-center justify-center p-8">
        <div className="text-orange-50 max-w-md">
          <h1 className="text-4xl font-bold mb-4 text-orange-300">
            TaskAI Planner
          </h1>
          <p className="text-lg mb-6 text-orange-100">
            Transform complexity into clarity with intelligent task
            orchestration. Our AI seamlessly converts your project vision into
            precise, actionable workflows with unprecedented accuracy.
          </p>
          <ul className="space-y-2">
            <li className="flex items-center text-orange-100">
              <span className="mr-3 text-xl">🔥</span>
              <span>Adaptive AI Task Generation</span>
            </li>
            <li className="flex items-center text-orange-100">
              <span className="mr-3 text-xl">⚙️</span>
              <span>Intelligent Workflow Optimization</span>
            </li>
            <li className="flex items-center text-orange-100">
              <span className="mr-3 text-xl">📊</span>
              <span>Predictive Timeline Mapping</span>
            </li>
            <li className="flex items-center text-orange-100">
              <span className="mr-3 text-xl">🚀</span>
              <span>Advanced Reporting Capabilities</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Right Side - Authentication and Input Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-zinc-800/50">
        <Outlet />{" "}
        {/* This will render the Login, Register, or Input Form component */}
      </div>
    </div>
  );
};

export default Layout;
