import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Layout from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import logoSvg from "@/assets/logo.svg";

const Login = () => {
  const [tab, setTab] = useState<"login" | "cadastro">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  if (user) {
    navigate("/minha-conta");
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: "Erro ao entrar", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Login realizado!", description: "Bem-vindo(a) de volta." });
    navigate("/minha-conta");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { full_name: fullName, phone },
      },
    });
    setLoading(false);
    if (error) {
      toast({ title: "Erro ao cadastrar", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Conta criada!", description: "Você já pode entrar." });
    setTab("login");
  };

  return (
    <Layout>
      <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img src={logoSvg} alt="O Boticário" className="h-10 mx-auto mb-4" />
            <p className="text-muted-foreground text-sm">Acesse sua conta ou crie uma nova</p>
          </div>

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
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" required />
              </div>
              <div className="relative">
                <label className="text-sm text-muted-foreground block mb-1">Senha</label>
                <Input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Sua senha" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-8 text-muted-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Button type="submit" disabled={loading} className="w-full rounded-lg" size="lg">
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground block mb-1">Nome completo</label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Seu nome" required />
              </div>
              <div>
                <label className="text-sm text-muted-foreground block mb-1">E-mail</label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" required />
              </div>
              <div>
                <label className="text-sm text-muted-foreground block mb-1">Telefone</label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(00) 00000-0000" />
              </div>
              <div className="relative">
                <label className="text-sm text-muted-foreground block mb-1">Senha</label>
                <Input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" minLength={6} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-8 text-muted-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Button type="submit" disabled={loading} className="w-full rounded-lg" size="lg">
                {loading ? "Criando..." : "Criar conta"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Login;
