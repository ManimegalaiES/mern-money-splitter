import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import GroupPage from "./pages/GroupPage";
import CreateGroup from "./pages/CreateGroup";

export default function App(){
  return(
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login/>}/>
        <Route path="/register" element={<Register/>} />
        <Route path="/dashboard" element={<Dashboard/>}/>
        <Route path="/create-group" element={<CreateGroup />} />
         <Route path="/group/:id" element={<GroupPage />} />
      </Routes>
    </BrowserRouter>
  );
}
