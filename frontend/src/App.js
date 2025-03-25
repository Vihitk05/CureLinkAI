import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DiseasePrediction from "./pages/disease_pred";
import './App.css';
import Home from "./pages/home";
import Login from "./pages/login";
import Register from "./pages/register";
import MedicineCompare from "./pages/medicine_compare";
import Landing from "./pages/landing";
import HospitalLogin from "./pages/hospital_login";
import HospitalRegister from "./pages/hospital_register";
function App() {
  return (
    <ChakraProvider>
      <BrowserRouter>
        <Routes>
          <Route path="disease" element={<DiseasePrediction />} />
          <Route path="login" element={<Login />} />
          <Route path="hospital_login" element={<HospitalLogin />} />
          <Route path="register" element={<Register />} />
          <Route path="hospital_register" element={<HospitalRegister />} />
          <Route path="medicine" element={<MedicineCompare />} />
          <Route path="home" element={<Home />} />
          <Route path="" element={<Landing />} />
        </Routes>
      </BrowserRouter>
    </ChakraProvider>
  );
}

export default App;
