// import AddProject from "@/components/custom/AddProject"
import ProjectPage from "@/pages/ProjectPage/ProjectPage"
import ErrorPage from "@/pages/ErrorPage/ErrorPage"
import Dashboard from "@/pages/Dashboard/Dashboard";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from "./pages/LoginPage/LoginPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/project/:projectId" element={<ProjectPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </Router>
  )
}

export default App
