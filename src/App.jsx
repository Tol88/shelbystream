import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Watch from "./pages/Watch";
import Upload from "./pages/Upload";
import Trending from "./pages/Trending";
import Categories from "./pages/Categories";
import Profile from "./pages/Profile";
import EditVideo from "./pages/EditVideo";
import { PurchaseProvider } from "./context/PurchaseContext";
import "./App.css";

export default function App() {
  return (
    <PurchaseProvider>
      <div className="page">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/watch/*" element={<Watch />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/trending" element={<Trending />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/edit/*" element={<EditVideo />} />
        </Routes>
        <Footer />
      </div>
    </PurchaseProvider>
  );
}