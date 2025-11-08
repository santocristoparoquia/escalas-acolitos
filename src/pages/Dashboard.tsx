import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Users, BarChart3, LogOut, ClipboardList, Sparkles } from "lucide-react";
import { toast } from "sonner";
import logoParoquia from "@/assets/logo-paroquia.webp";
import PessoasTab from "@/components/dashboard/PessoasTab";
import EscalasTab from "@/components/dashboard/EscalasTab";
import ConsultarEscalasTab from "@/components/dashboard/ConsultarEscalasTab";
import RelatoriosTab from "@/components/dashboard/RelatoriosTab";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/");
      return;
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    setProfile(profileData);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logout realizado com sucesso!");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-elegant">
      <header className="border-b border-primary/10 bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm animate-fade-in-down">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <img 
                src={logoParoquia} 
                alt="Logo Paróquia" 
                className="h-10 sm:h-12 w-auto object-contain flex-shrink-0"
              />
              <div className="min-w-0">
                <h1 className="text-sm sm:text-base md:text-xl font-bold bg-gradient-primary bg-clip-text text-transparent truncate">Sistema de Escalas</h1>
                <p className="text-xs md:text-sm text-muted-foreground truncate hidden sm:block">Paróquia Senhor Santo Cristo dos Milagres</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              <div className="text-right hidden lg:block">
                <p className="text-xs sm:text-sm font-semibold text-foreground truncate max-w-[150px]">{profile?.nome_completo}</p>
                <p className="text-[10px] sm:text-xs text-primary font-medium">
                  {profile?.is_admin ? "Administrador" : "Usuário"}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout} className="border-primary/20 hover:bg-primary/10 px-2 sm:px-3">
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 sm:py-8 animate-fade-in-up" style={{ animationDelay: "0.2s", animationFillMode: "both" }}>
        {profile?.is_admin ? (
          <Tabs defaultValue="pessoas" className="space-y-4 sm:space-y-6">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-0 h-auto sm:h-10 p-1 bg-white/80 backdrop-blur-sm border border-primary/10">
              <TabsTrigger value="pessoas" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 py-2 data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground">
                <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Pessoas</span>
                <span className="sm:hidden">Pessoas</span>
              </TabsTrigger>
              <TabsTrigger value="nova-escala" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 py-2 data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Nova Escala</span>
                <span className="sm:hidden">Nova</span>
              </TabsTrigger>
              <TabsTrigger value="consultar-escalas" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 py-2 data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground">
                <ClipboardList className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Consultar Escalas</span>
                <span className="sm:hidden">Consultar</span>
              </TabsTrigger>
              <TabsTrigger value="relatorios" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 py-2 data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground">
                <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Relatórios</span>
                <span className="sm:hidden">Relatórios</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pessoas">
              <PessoasTab />
            </TabsContent>

            <TabsContent value="nova-escala">
              <EscalasTab />
            </TabsContent>

            <TabsContent value="consultar-escalas">
              <ConsultarEscalasTab />
            </TabsContent>

            <TabsContent value="relatorios">
              <RelatoriosTab />
            </TabsContent>
          </Tabs>
        ) : (
          <Card className="border-primary/10 shadow-elegant bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-gradient-primary flex items-center justify-center shadow-red">
                  <Sparkles className="h-8 w-8 text-primary-foreground" />
                </div>
              </div>
              <CardTitle className="text-2xl bg-gradient-primary bg-clip-text text-transparent">Bem-vindo ao Sistema!</CardTitle>
              <CardDescription className="text-base">
                Sua conta foi criada com sucesso
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Aguarde a aprovação do administrador para acessar todas as funcionalidades do sistema.
              </p>
              <p className="text-sm text-muted-foreground">
                Entre em contato com o coordenador da sua comunidade para obter permissões de acesso.
              </p>
              <div className="pt-4">
                <Button variant="elegant" onClick={() => navigate("/escalas-publicas")}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Ver Escalas Públicas
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Dashboard;