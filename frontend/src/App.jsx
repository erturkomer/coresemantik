import React from "react";
import { Routes, Route } from "react-router-dom";
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from "./contexts/AuthContext.jsx";
import Home from "./components/Home";
import LessonDetail from "./components/LessonDetail";
import CodePlayground from "./components/CodePlayground";
import Register from "./components/Auth/Register.jsx";
import Login from "./components/Auth/Login.jsx";

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/codeplayground" element={<CodePlayground />} />
          <Route path="/lesson/:id" element={<LessonDetail />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/auth/login" element={<Login />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
