import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Calendar, Users, Clock, Shield, Sparkles } from "lucide-react";
import logoParoquia from "@/assets/logo-paroquia.webp";

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Calendar,
      title: "Escalas Organizadas",
      description: "Gerencie e visualize as escalas de acólitos e coroinhas de forma simples e eficiente"
    },
    {
      icon: Users,
      title: "Gestão de Pessoas",
      description: "Cadastre e organize os membros das comunidades com facilidade"
    },
    {
      icon: Clock,
      title: "Horários Flexíveis",
      description: "Configure horários personalizados para cada comunidade e celebração"
    },
    {
      icon: Shield,
      title: "Acesso Público",
      description: "Compartilhe as escalas publicamente para que todos possam consultar"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-elegant">
      {/* Header - Sem botões de login visíveis */}
      <header className="border-b border-primary/10 bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm animate-fade-in-down">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <img 
                src={logoParoquia} 
                alt="Logo Paróquia Senhor Santo Cristo dos Milagres" 
                className="h-12 sm:h-16 w-auto object-contain"
              />
              <div className="hidden sm:block">
                <h1 className="text-base sm:text-lg md:text-xl font-bold text-foreground leading-tight">
                  Paróquia Senhor Santo Cristo dos Milagres
                </h1>
                <p className="text-xs md:text-sm text-muted-foreground">Sistema de Escalas Litúrgicas</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate("/escalas-publicas")} 
                className="text-xs sm:text-sm"
              >
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline">Ver Escalas</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 sm:py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto">
          <div className="mb-6 sm:mb-8 flex justify-center animate-bounce-in">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-hero opacity-20 blur-3xl rounded-full"></div>
              <img 
                src={logoParoquia} 
                alt="Logo Paróquia" 
                className="relative h-24 sm:h-32 w-auto object-contain drop-shadow-2xl"
              />
            </div>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-4 sm:mb-6 animate-fade-in-up px-4">
            Sistema de Escalas de Acólitos e Coroinhas
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 animate-fade-in-up max-w-2xl mx-auto px-4 leading-relaxed" style={{ animationDelay: "0.2s", animationFillMode: "both" }}>
            Organize e compartilhe as escalas litúrgicas da sua paróquia com elegância e praticidade
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center animate-fade-in-up px-4" style={{ animationDelay: "0.4s", animationFillMode: "both" }}>
            <Button 
              size="lg" 
              variant="elegant" 
              onClick={() => navigate("/escalas-publicas")} 
              className="shadow-elegant w-full sm:w-auto text-sm sm:text-base"
            >
              <Calendar className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Consultar Escalas Públicas
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-12 sm:py-16">
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 shadow-elegant border border-primary/5 animate-fade-in-up" style={{ animationDelay: "0.3s", animationFillMode: "both" }}>
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-3 sm:mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Recursos do Sistema
          </h3>
          <p className="text-center text-sm sm:text-base text-muted-foreground mb-8 sm:mb-12 max-w-2xl mx-auto px-4">
            Uma plataforma completa para gestão eficiente das escalas litúrgicas
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-red hover:-translate-y-1 bg-white/80 backdrop-blur-sm animate-scale-in"
                style={{ animationDelay: `${0.1 * index}s`, animationFillMode: "both" }}
              >
                <CardContent className="pt-6 p-4 sm:p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-gradient-primary flex items-center justify-center mb-3 sm:mb-4 shadow-red">
                      <feature.icon className="h-6 w-6 sm:h-7 sm:w-7 text-primary-foreground" />
                    </div>
                    <h4 className="font-bold text-base sm:text-lg mb-2 text-foreground">{feature.title}</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-12 sm:py-16 mb-8">
        <Card className="bg-gradient-hero border-0 shadow-elegant animate-fade-in-up" style={{ animationDelay: "0.5s", animationFillMode: "both" }}>
          <CardContent className="pt-8 sm:pt-12 pb-8 sm:pb-12 text-center px-4">
            <div className="max-w-3xl mx-auto">
              <Sparkles className="h-10 w-10 sm:h-12 sm:w-12 text-accent mx-auto mb-4" />
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-primary-foreground px-4">
                Consulte as Escalas
              </h3>
              <p className="text-sm sm:text-base md:text-lg text-primary-foreground/90 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-4">
                Veja quando você está escalado para as celebrações litúrgicas da sua comunidade
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
                <Button 
                  size="lg" 
                  variant="gold" 
                  onClick={() => navigate("/escalas-publicas")}
                  className="shadow-gold w-full sm:w-auto text-sm sm:text-base"
                >
                  <Calendar className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Ver Escalas Públicas
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-primary/10 mt-12 sm:mt-16 py-6 sm:py-8 bg-white/60 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-3 sm:mb-4">
            <img 
              src={logoParoquia} 
              alt="Logo Paróquia" 
              className="h-10 sm:h-12 w-auto object-contain opacity-80"
            />
          </div>
          <p className="text-sm sm:text-base text-foreground font-semibold mb-1 sm:mb-2">© 2025 Paróquia Senhor Santo Cristo dos Milagres</p>
          <p className="text-xs sm:text-sm text-muted-foreground">Sistema de Gestão de Escalas Litúrgicas</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
