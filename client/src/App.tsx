import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import Dashboard from "@/pages/Dashboard";
import Productos from "@/pages/Productos";
import MateriasPrimas from "@/pages/MateriasPrimas";
import Pedidos from "@/pages/Pedidos";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route
          path="/admin"
          element={
            <AdminLayout>
              <Dashboard />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/productos"
          element={
            <AdminLayout>
              <Productos />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/inventario"
          element={<Navigate to="/admin/productos" replace />}
        />
        <Route
          path="/admin/materias-primas"
          element={
            <AdminLayout>
              <MateriasPrimas />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/pedidos"
          element={
            <AdminLayout>
              <Pedidos />
            </AdminLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
