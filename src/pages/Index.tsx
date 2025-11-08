import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, Sparkles } from "lucide-react";
import logoParoquia from "@/assets/logo-paroquia.webp";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-elegant flex flex-col">
      {/* Header minimalista */}
      <header className="border-b border-primary/10 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img 
                src={logoParoquia} 
                alt="Logo Paróquia" 
                className="h-10 w-auto object-contain"
              />
              <span className="text-sm font-medium text-muted-foreground hidden sm:inline">
                Sistema de Escalas
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full text-center space-y-8">
          {/* Logo com animação */}
          <div className="flex justify-center mb-8 animate-bounce-in">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-hero opacity-20 blur-3xl rounded-full animate-pulse"></div>
              <img 
                src={logoParoquia} 
                alt="Logo Paróquia Senhor Santo Cristo dos Milagres" 
                className="relative h-40 md:h-56 w-auto object-contain drop-shadow-2xl"
              />
            </div>
          </div>

          {/* Título principal */}
          <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: "0.2s", animationFillMode: "both" }}>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold bg-gradient-hero bg-clip-text text-transparent leading-tight">
              Paróquia Senhor Santo Cristo dos Milagres
            </h1>
            <div className="flex items-center justify-center gap-2 text-lg sm:text-xl md:text-2xl text-muted-foreground">
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
              <p>Sistema de Escalas Litúrgicas</p>
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-4 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.4s", animationFillMode: "both" }}>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed">
              Bem-vindo ao sistema de organização das escalas de acólitos, coroinhas e cerimoniários da nossa paróquia.
            </p>
            <p className="text-sm sm:text-base text-muted-foreground/80">
              Uma plataforma desenvolvida para facilitar a gestão e consulta das escalas litúrgicas de todas as comunidades.
            </p>
          </div>

          {/* Botão de Escalas Públicas */}
          <div className="pt-8 animate-fade-in-up" style={{ animationDelay: "0.6s", animationFillMode: "both" }}>
            <Button 
              size="lg" 
              variant="elegant" 
              onClick={() => navigate("/escalas-publicas")}
              className="shadow-elegant text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 h-auto"
            >
              <Calendar className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
              Consultar Escalas Públicas
            </Button>
          </div>

          {/* Informação discreta sobre acesso */}
          <div className="pt-12 animate-fade-in" style={{ animationDelay: "0.8s", animationFillMode: "both" }}>
            <p className="text-xs sm:text-sm text-muted-foreground/60">
              Sistema desenvolvido para a comunidade paroquial
            </p>
          </div>
        </div>
      </main>

      {/* Footer minimalista */}
      <footer className="border-t border-primary/10 py-6 bg-white/60 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs sm:text-sm text-muted-foreground">
            © 2025 Paróquia Senhor Santo Cristo dos Milagres
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
