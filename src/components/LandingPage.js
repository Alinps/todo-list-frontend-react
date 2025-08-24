import React from "react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-lg text-center space-y-6">
        <h1 className="text-3xl font-bold">Welcome to To-Do</h1>
        <p className="text-gray-600">Choose how you want to log in</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => navigate("/login")}
            className="border rounded-lg py-3 px-4 hover:bg-gray-50"
          >
            Login as User
          </button>
          <button
            onClick={() => navigate("/admin/login")}
            className="border rounded-lg py-3 px-4 hover:bg-gray-50"
          >
            Login as Admin
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
