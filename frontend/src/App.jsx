// import AddProject from "@/components/custom/AddProject"
import ProjectPage from "@/pages/ProjectPage/ProjectPage"
import ErrorPage from "@/pages/ErrorPage/ErrorPage"
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/:id" element={<ProjectPage />} />
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </Router>
  )
}

export default App
