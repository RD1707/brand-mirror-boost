import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, MailCheck, Inbox, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
  const [confirmationSent, setConfirmationSent] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [showUnconfirmedNotice, setShowUnconfirmedNotice] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  if (user) {
    navigate("/minha-conta");
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setShowUnconfirmedNotice(false);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("confirm") || msg.includes("not confirmed") || msg.includes("email not")) {
        setShowUnconfirmedNotice(true);
        toast({
          title: "E-mail ainda não confirmado",
          description: "Confirme o e-mail enviado para a sua caixa de entrada antes de entrar.",
          variant: "destructive",
        });
        return;
      }
      toast({ title: "Erro ao entrar", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Login realizado!", description: "Bem-vindo(a) de volta." });
    navigate("/minha-conta");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
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
    // Se identities está vazio, significa que o e-mail já existe
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      toast({
        title: "E-mail já cadastrado",
        description: "Este e-mail já possui uma conta. Tente entrar ou recuperar a senha.",
        variant: "destructive",
      });
      return;
    }
    setConfirmationSent(email);
    toast({
      title: "Confirme seu e-mail",
      description: "Enviamos um link de confirmação para o seu e-mail.",
    });
  };

  const handleResend = async () => {
    const target = confirmationSent ?? email;
    if (!target) {
      toast({ title: "Informe seu e-mail", description: "Digite o e-mail para reenviarmos a confirmação.", variant: "destructive" });
      return;
    }
    setResending(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: target,
      options: { emailRedirectTo: `${window.location.origin}/` },
    });
    setResending(false);
    if (error) {
      toast({ title: "Não foi possível reenviar", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "E-mail reenviado!", description: "Verifique sua caixa de entrada e a pasta de spam." });
  };

  return (
    <Layout>
      <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img src={logoSvg} alt="O Boticário" className="h-10 mx-auto mb-4" />
            <p className="text-muted-foreground text-sm">Acesse sua conta ou crie uma nova</p>
          </div>

          {confirmationSent && (
            <Alert className="mb-6 border-primary/30 bg-primary/5">
              <MailCheck className="h-5 w-5 text-primary" />
              <AlertTitle className="text-primary">Confirme seu e-mail para ativar a conta</AlertTitle>
              <AlertDescription className="space-y-3 mt-2">
                <p className="text-sm">
                  Enviamos um link de confirmação para <strong className="break-all">{confirmationSent}</strong>.
                  Clique no link para ativar sua conta antes de entrar.
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 list-none">
                  <li className="flex gap-2"><Inbox className="h-3.5 w-3.5 mt-0.5 shrink-0" /> Verifique sua caixa de entrada</li>
                  <li className="flex gap-2"><ShieldAlert className="h-3.5 w-3.5 mt-0.5 shrink-0" /> Olhe também a pasta de <strong>spam</strong> ou lixo eletrônico</li>
                  <li className="flex gap-2"><MailCheck className="h-3.5 w-3.5 mt-0.5 shrink-0" /> Após confirmar, volte e faça login normalmente</li>
                </ul>
                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <Button type="button" variant="outline" size="sm" onClick={handleResend} disabled={resending} className="flex-1">
                    {resending ? "Reenviando..." : "Reenviar e-mail"}
                  </Button>
                  <Button type="button" size="sm" onClick={() => { setConfirmationSent(null); setTab("login"); }} className="flex-1">
                    Já confirmei, entrar
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {showUnconfirmedNotice && tab === "login" && (
            <Alert variant="destructive" className="mb-6">
              <ShieldAlert className="h-5 w-5" />
              <AlertTitle>E-mail ainda não confirmado</AlertTitle>
              <AlertDescription className="space-y-2 mt-2">
                <p className="text-sm">
                  Sua conta existe, mas o e-mail ainda não foi verificado. Confirme pelo link enviado para entrar.
                </p>
                <Button type="button" variant="outline" size="sm" onClick={handleResend} disabled={resending}>
                  {resending ? "Reenviando..." : "Reenviar e-mail de confirmação"}
                </Button>
              </AlertDescription>
            </Alert>
          )}

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
              <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1.5">
                <MailCheck className="h-3.5 w-3.5" />
                Você receberá um e-mail para confirmar sua conta.
              </p>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Login;
