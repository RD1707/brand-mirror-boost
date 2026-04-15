import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Layout from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import logoSvg from "@/assets/logo.svg";

const Login = () => {
  const [tab, setTab] = useState<"login" | "cadastro">("login");
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Login realizado!", description: "Bem-vindo(a) de volta ao Boticário." });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Conta criada!", description: "Sua conta foi criada com sucesso." });
  };

  return (
    <Layout>
      <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <img src={logoSvg} alt="O Boticário" className="h-10 mx-auto mb-4" />
            <p className="text-muted-foreground text-sm">Acesse sua conta ou crie uma nova</p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border mb-6">
            <button
              onClick={() => setTab("login")}
              className={`flex-1 pb-3 text-sm font-medium transition-colors ${tab === "login" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"}`}
            >
              Entrar
            </button>
            <button
              onClick={() => setTab("cadastro")}
              className={`flex-1 pb-3 text-sm font-medium transition-colors ${tab === "cadastro" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"}`}
            >
              Criar conta
            </button>
          </div>

          {tab === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground block mb-1">E-mail</label>
                <Input type="email" placeholder="seu@email.com" required />
              </div>
              <div className="relative">
                <label className="text-sm text-muted-foreground block mb-1">Senha</label>
                <Input type={showPassword ? "text" : "password"} placeholder="Sua senha" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-8 text-muted-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="text-right">
                <a href="#" className="text-xs text-primary hover:underline">Esqueci minha senha</a>
              </div>
              <Button type="submit" className="w-full rounded-lg" size="lg">Entrar</Button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground block mb-1">Nome completo</label>
                <Input placeholder="Seu nome" required />
              </div>
              <div>
                <label className="text-sm text-muted-foreground block mb-1">E-mail</label>
                <Input type="email" placeholder="seu@email.com" required />
              </div>
              <div>
                <label className="text-sm text-muted-foreground block mb-1">CPF</label>
                <Input placeholder="000.000.000-00" required />
              </div>
              <div>
                <label className="text-sm text-muted-foreground block mb-1">Telefone</label>
                <Input placeholder="(00) 00000-0000" />
              </div>
              <div className="relative">
                <label className="text-sm text-muted-foreground block mb-1">Senha</label>
                <Input type={showPassword ? "text" : "password"} placeholder="Crie uma senha" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-8 text-muted-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Button type="submit" className="w-full rounded-lg" size="lg">Criar conta</Button>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Login;
