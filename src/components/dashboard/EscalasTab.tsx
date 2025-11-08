import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const EscalasTab = () => {
  const [comunidades, setComunidades] = useState<any[]>([]);
  const [pessoas, setPessoas] = useState<any[]>([]);
  const [selectedComunidade, setSelectedComunidade] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedHorario, setSelectedHorario] = useState<string>("08:00");
  const [selectedPessoas, setSelectedPessoas] = useState<string[]>([]);
  const [observacoes, setObservacoes] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: comunidadesData } = await supabase
      .from("comunidades")
      .select("*")
      .order("nome");
    
    const { data: pessoasData } = await supabase
      .from("pessoas")
      .select("*")
      .eq("ativo", true)
      .order("nome_completo");
    
    setComunidades(comunidadesData || []);
    setPessoas(pessoasData || []);
  };

  const handleSaveEscala = async () => {
    if (!selectedComunidade || !selectedDate || selectedPessoas.length === 0) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data: escala, error: escalaError } = await supabase
        .from("escalas")
        .insert({
          data: format(selectedDate, "yyyy-MM-dd"),
          horario: selectedHorario,
          comunidade_id: selectedComunidade,
          observacoes: observacoes || null,
          created_by: user?.id,
        })
        .select()
        .single();

      if (escalaError) throw escalaError;

      const participantes = selectedPessoas.map((pessoaId) => ({
        escala_id: escala.id,
        pessoa_id: pessoaId,
      }));

      const { error: participantesError } = await supabase
        .from("escala_participantes")
        .insert(participantes);

      if (participantesError) throw participantesError;

      toast.success("Escala criada com sucesso!");
      setSelectedPessoas([]);
      setObservacoes("");
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar escala");
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Nova Escala</CardTitle>
          <CardDescription>Crie uma nova escala de serviço</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Comunidade *</label>
            <Select value={selectedComunidade} onValueChange={setSelectedComunidade}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma comunidade" />
              </SelectTrigger>
              <SelectContent>
                {comunidades.map((com) => (
                  <SelectItem key={com.id} value={com.id}>
                    {com.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Data *</label>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              locale={ptBR}
              className="rounded-md border"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Horário *</label>
            <Select value={selectedHorario} onValueChange={setSelectedHorario}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="08:00">08:00</SelectItem>
                <SelectItem value="10:00">10:00</SelectItem>
                <SelectItem value="19:30">19:30</SelectItem>
                <SelectItem value="20:00">20:00</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pessoas Escaladas</CardTitle>
          <CardDescription>Selecione quem vai servir</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {pessoas.map((pessoa) => (
              <div key={pessoa.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={pessoa.id}
                  checked={selectedPessoas.includes(pessoa.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedPessoas([...selectedPessoas, pessoa.id]);
                    } else {
                      setSelectedPessoas(selectedPessoas.filter((id) => id !== pessoa.id));
                    }
                  }}
                  className="rounded border-gray-300"
                />
                <label htmlFor={pessoa.id} className="text-sm cursor-pointer flex-1">
                  {pessoa.nome_completo} - {pessoa.funcao}
                </label>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Observações</label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              className="w-full min-h-20 px-3 py-2 text-sm border rounded-md"
              placeholder="Ex: chegar 30 min antes"
            />
          </div>

          <Button onClick={handleSaveEscala} className="w-full">
            Salvar Escala
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default EscalasTab;