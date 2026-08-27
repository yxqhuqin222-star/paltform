import { Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import HomePage from "@/pages/HomePage/HomePage";
import ToolDetailPage from "@/pages/ToolDetailPage/ToolDetailPage";
import ManagePage from "@/pages/ManagePage/ManagePage";
import NotFoundPage from "@/pages/NotFoundPage/NotFoundPage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="tool/:id" element={<ToolDetailPage />} />
        <Route path="manage" element={<ManagePage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
