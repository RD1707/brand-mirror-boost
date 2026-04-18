import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useParams } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index.tsx";
import ProductDetail from "./pages/ProductDetail.tsx";
import Cart from "./pages/Cart.tsx";
import Checkout from "./pages/Checkout.tsx";
import CheckoutSuccess from "./pages/CheckoutSuccess.tsx";
import CheckoutCancel from "./pages/CheckoutCancel.tsx";
import Login from "./pages/Login.tsx";
import MyAccount from "./pages/MyAccount.tsx";
import NotFound from "./pages/NotFound.tsx";
import AdminLayout from "./components/admin/AdminLayout.tsx";
import AdminDashboard from "./pages/admin/AdminDashboard.tsx";
import AdminProducts from "./pages/admin/AdminProducts.tsx";
import AdminOrders from "./pages/admin/AdminOrders.tsx";
import AdminCategories from "./pages/admin/AdminCategories.tsx";
import Category from "./pages/Category.tsx";
import Favoritos from "./pages/Favoritos.tsx";
import InfoPage from "./components/InfoPage.tsx";

const queryClient = new QueryClient();

const InfoRoute = () => {
  const { topic } = useParams<{ topic: string }>();
  return <InfoPage slug={topic} />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/produto/:slug" element={<ProductDetail />} />
              <Route path="/categoria/:slug" element={<Category />} />
              <Route path="/carrinho" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/checkout/success" element={<CheckoutSuccess />} />
              <Route path="/checkout/cancel" element={<CheckoutCancel />} />
              <Route path="/login" element={<Login />} />
              <Route path="/minha-conta" element={<MyAccount />} />
              <Route path="/favoritos" element={<Favoritos />} />
              <Route path="/acessibilidade" element={<InfoPage slug="acessibilidade" />} />
              <Route path="/grupo-boticario" element={<InfoPage slug="grupo-boticario" />} />
              <Route path="/ajuda" element={<InfoPage slug="ajuda" />} />
              <Route path="/revendedor" element={<InfoPage slug="revendedor" />} />
              <Route path="/quero-revender" element={<InfoPage slug="quero-revender" />} />
              <Route path="/info/:topic" element={<InfoRoute />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="produtos" element={<AdminProducts />} />
                <Route path="pedidos" element={<AdminOrders />} />
                <Route path="categorias" element={<AdminCategories />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
