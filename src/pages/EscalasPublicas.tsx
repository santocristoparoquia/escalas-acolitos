import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Church, Home, Sparkles } from "lucide-react";
import logoParoquia from "@/assets/logo-paroquia.webp";

interface EscalaPublica {
  id: string;
  data: string;
  horario: string;
  observacoes: string | null;
  comunidade_nome: string;
  participantes: Array<{ nome_completo: string; funcao: string }>;
}

const EscalasPublicas = () => {
  const navigate = useNavigate();
  const [escalas, setEscalas] = useState<EscalaPublica[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), "yyyy-MM"));
  const [comunidades, setComunidades] = useState<string[]>([]);
  const [selectedComunidade, setSelectedComunidade] = useState<string>("todas");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
  };

  useEffect(() => {
    fetchData();
  }, [selectedMonth]);

  const fetchData = async () => {
    const { data, error } = await supabase
      .from("escalas_publicas")
      .select("*")
      .gte("data", `${selectedMonth}-01`)
      .lt("data", format(new Date(selectedMonth + "-01").setMonth(new Date(selectedMonth + "-01").getMonth() + 1), "yyyy-MM-dd"));

    if (error) {
      console.error("Erro ao carregar escalas públicas:", error);
      return;
    }

    setEscalas((data || []) as EscalaPublica[]);
    
    const uniqueComunidades = [...new Set((data || []).map(e => e.comunidade_nome))];
    setComunidades(uniqueComunidades);
  };

  const filteredEscalas = selectedComunidade === "todas"
    ? escalas
    : escalas.filter(e => e.comunidade_nome === selectedComunidade);

  return (
    <div className="min-h-screen bg-gradient-elegant">
      {/* Header */}
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
                <h1 className="text-sm sm:text-base md:text-lg font-bold text-foreground truncate">Escalas Públicas</h1>
                <p className="text-xs md:text-sm text-muted-foreground truncate hidden sm:block">Paróquia Senhor Santo Cristo dos Milagres</p>
              </div>
            </div>
            <div className="flex gap-1 sm:gap-2 flex-shrink-0">
              <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="px-2 sm:px-3">
                <Home className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline text-xs sm:text-sm">Início</span>
              </Button>
              {isAuthenticated ? (
                <Button size="sm" variant="elegant" onClick={() => navigate("/dashboard")} className="text-xs sm:text-sm px-2 sm:px-4">
                  Dashboard
                </Button>
              ) : (
                <Button size="sm" variant="elegant" onClick={() => navigate("/auth")} className="px-2 sm:px-3">
                  <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                  <span className="hidden sm:inline text-xs sm:text-sm">Entrar</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 sm:py-8">
        {/* Título e Descrição */}
        <div className="text-center mb-6 sm:mb-8 animate-fade-in-up">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3 bg-gradient-primary bg-clip-text text-transparent px-4">
            Consulta de Escalas
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground px-4">
            Confira as escalas litúrgicas das comunidades
          </p>
        </div>

        {/* Filtros */}
        <Card className="mb-6 sm:mb-8 border-primary/10 shadow-red bg-white/90 backdrop-blur-sm animate-scale-in" style={{ animationDelay: "0.2s", animationFillMode: "both" }}>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-primary text-base sm:text-lg">
              <Church className="h-4 w-4 sm:h-5 sm:w-5" />
              Filtros de Pesquisa
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Selecione a comunidade e o período desejado</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
            <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-medium text-foreground">Comunidade</label>
                <Select value={selectedComunidade} onValueChange={setSelectedComunidade}>
                  <SelectTrigger className="border-primary/20 focus:border-primary text-xs sm:text-sm h-9 sm:h-10">
                    <SelectValue placeholder="Selecione uma comunidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas as Comunidades</SelectItem>
                    {comunidades.map((com) => (
                      <SelectItem key={com} value={com}>{com}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-medium text-foreground flex items-center gap-2">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                  Mês e Ano
                </label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-3 py-2 border border-primary/20 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-xs sm:text-sm h-9 sm:h-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Escalas */}
        {filteredEscalas.length === 0 ? (
          <Card className="border-primary/10 bg-white/90 backdrop-blur-sm animate-fade-in-up" style={{ animationDelay: "0.3s", animationFillMode: "both" }}>
            <CardContent className="pt-8 sm:pt-12 pb-8 sm:pb-12 text-center px-4">
              <Church className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground/40 mx-auto mb-3 sm:mb-4" />
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
                Nenhuma escala encontrada para o período selecionado.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEscalas.map((escala, index) => (
              <Card 
                key={escala.id} 
                className="border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-red hover:-translate-y-1 bg-white/90 backdrop-blur-sm animate-fade-in-up"
                style={{ animationDelay: `${0.1 * (index % 6)}s`, animationFillMode: "both" }}
              >
                <CardHeader className="bg-gradient-primary text-primary-foreground rounded-t-lg pb-3 sm:pb-4 p-4 sm:p-6">
                  <CardTitle className="text-base sm:text-lg md:text-xl flex items-start sm:items-center gap-2 flex-wrap">
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mt-0.5 sm:mt-0" />
                    <span className="break-words leading-tight">
                      {format(parseISO(escala.data), "EEEE, dd 'de' MMMM", { locale: ptBR })}
                    </span>
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm text-primary-foreground/90 font-medium">
                    {escala.horario} • {escala.comunidade_nome}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-primary mb-2 sm:mb-3 flex items-center gap-2">
                        <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
                        Participantes
                      </h4>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {escala.participantes.map((p, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-gradient-primary text-primary-foreground font-medium text-xs shadow-sm break-words max-w-full"
                          >
                            <span className="truncate">{p.nome_completo}</span>
                            <span className="ml-1 text-[10px] sm:text-xs opacity-90 flex-shrink-0">({p.funcao})</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {escala.observacoes && (
                      <div className="pt-2 sm:pt-3 border-t border-primary/10">
                        <p className="text-xs sm:text-sm font-semibold text-primary mb-1">Observações:</p>
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed break-words">{escala.observacoes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-primary/10 mt-12 sm:mt-16 py-6 sm:py-8 bg-white/60 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-2 sm:mb-3">
            <img 
              src={logoParoquia} 
              alt="Logo Paróquia" 
              className="h-8 sm:h-10 w-auto object-contain opacity-80"
            />
          </div>
          <p className="text-xs sm:text-sm text-foreground font-semibold mb-1">Paróquia Senhor Santo Cristo dos Milagres</p>
          <p className="text-[10px] sm:text-xs text-muted-foreground">Sistema de Escalas Litúrgicas</p>
        </div>
      </footer>
    </div>
  );
};

export default EscalasPublicas;
