import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { format, parseISO, isBefore, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Pencil, Trash2, Eye, Share2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Escala {
  id: string;
  data: string;
  horario: string;
  observacoes: string | null;
  comunidade_id: string;
  comunidade?: { nome: string };
  participantes?: Array<{ pessoa_id: string; pessoa?: { nome_completo: string; funcao: string } }>;
}

const ConsultarEscalasTab = () => {
  const [escalas, setEscalas] = useState<Escala[]>([]);
  const [comunidades, setComunidades] = useState<any[]>([]);
  const [pessoas, setPessoas] = useState<any[]>([]);
  const [selectedComunidade, setSelectedComunidade] = useState<string>("todas");
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), "yyyy-MM"));
  const [editingEscala, setEditingEscala] = useState<Escala | null>(null);
  const [selectedPessoas, setSelectedPessoas] = useState<string[]>([]);
  const [observacoes, setObservacoes] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [showShareDialog, setShowShareDialog] = useState(false);

  useEffect(() => {
    fetchData();
  }, [selectedComunidade, selectedMonth]);

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

    let query = supabase
      .from("escalas")
      .select(`
        *,
        comunidade:comunidades(nome),
        participantes:escala_participantes(
          pessoa_id,
          pessoa:pessoas(nome_completo, funcao)
        )
      `)
      .gte("data", `${selectedMonth}-01`)
      .lt("data", format(new Date(selectedMonth + "-01").setMonth(new Date(selectedMonth + "-01").getMonth() + 1), "yyyy-MM-dd"))
      .order("data")
      .order("horario");

    if (selectedComunidade !== "todas") {
      query = query.eq("comunidade_id", selectedComunidade);
    }

    const { data, error } = await query;

    if (error) {
      toast.error("Erro ao carregar escalas");
      return;
    }

    setEscalas(data || []);
  };

  const canEdit = (data: string) => {
    const escalaDate = parseISO(data);
    const currentMonth = startOfMonth(new Date());
    return !isBefore(escalaDate, currentMonth);
  };

  const handleEdit = (escala: Escala) => {
    if (!canEdit(escala.data)) {
      toast.error("Não é possível editar escalas de meses anteriores");
      return;
    }
    setEditingEscala(escala);
    setSelectedPessoas(escala.participantes?.map(p => p.pessoa_id) || []);
    setObservacoes(escala.observacoes || "");
  };

  const handleSaveEdit = async () => {
    if (!editingEscala) return;

    try {
      const { error: escalaError } = await supabase
        .from("escalas")
        .update({ observacoes })
        .eq("id", editingEscala.id);

      if (escalaError) throw escalaError;

      await supabase
        .from("escala_participantes")
        .delete()
        .eq("escala_id", editingEscala.id);

      const participantes = selectedPessoas.map((pessoaId) => ({
        escala_id: editingEscala.id,
        pessoa_id: pessoaId,
      }));

      const { error: participantesError } = await supabase
        .from("escala_participantes")
        .insert(participantes);

      if (participantesError) throw participantesError;

      toast.success("Escala atualizada com sucesso!");
      setEditingEscala(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar escala");
    }
  };

  const handleDelete = async (id: string, data: string) => {
    if (!canEdit(data)) {
      toast.error("Não é possível excluir escalas de meses anteriores");
      return;
    }

    if (!confirm("Tem certeza que deseja excluir esta escala?")) return;

    try {
      await supabase.from("escala_participantes").delete().eq("escala_id", id);
      const { error } = await supabase.from("escalas").delete().eq("id", id);

      if (error) throw error;

      toast.success("Escala excluída com sucesso!");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Erro ao excluir escala");
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/escalas-publicas`;
    setShareUrl(url);
    setShowShareDialog(true);
    navigator.clipboard.writeText(url);
    toast.success("Link copiado para a área de transferência!");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Consultar Escalas</span>
            <Button onClick={handleShare} variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Compartilhar Link Público
            </Button>
          </CardTitle>
          <CardDescription>Visualize e edite as escalas criadas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Comunidade</label>
              <Select value={selectedComunidade} onValueChange={setSelectedComunidade}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as Comunidades</SelectItem>
                  {comunidades.map((com) => (
                    <SelectItem key={com.id} value={com.id}>
                      {com.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Mês/Ano</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-md"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {escalas.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Nenhuma escala encontrada para os filtros selecionados.
            </CardContent>
          </Card>
        ) : (
          escalas.map((escala) => (
            <Card key={escala.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="font-semibold">
                        {format(parseISO(escala.data), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </span>
                      <span className="text-muted-foreground">•</span>
                      <span className="font-medium">{escala.horario}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Comunidade:</span>{" "}
                      <span className="text-muted-foreground">{escala.comunidade?.nome}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Participantes:</span>{" "}
                      <div className="mt-1 flex flex-wrap gap-2">
                        {escala.participantes?.map((p, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-xs"
                          >
                            {p.pessoa?.nome_completo} ({p.pessoa?.funcao})
                          </span>
                        ))}
                      </div>
                    </div>
                    {escala.observacoes && (
                      <div className="text-sm">
                        <span className="font-medium">Observações:</span>{" "}
                        <span className="text-muted-foreground">{escala.observacoes}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    {canEdit(escala.data) ? (
                      <>
                        <Button variant="outline" size="icon" onClick={() => handleEdit(escala)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(escala.id, escala.data)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <Button variant="outline" size="icon" disabled>
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={!!editingEscala} onOpenChange={(open) => !open && setEditingEscala(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Escala</DialogTitle>
            <DialogDescription>
              {editingEscala && format(parseISO(editingEscala.data), "dd/MM/yyyy", { locale: ptBR })} -{" "}
              {editingEscala?.horario}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Participantes</label>
              <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-3">
                {pessoas.map((pessoa) => (
                  <div key={pessoa.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`edit-${pessoa.id}`}
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
                    <label htmlFor={`edit-${pessoa.id}`} className="text-sm cursor-pointer flex-1">
                      {pessoa.nome_completo} - {pessoa.funcao}
                    </label>
                  </div>
                ))}
              </div>
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

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setEditingEscala(null)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveEdit}>Salvar Alterações</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link Público das Escalas</DialogTitle>
            <DialogDescription>
              Compartilhe este link para que todos possam visualizar as escalas
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="p-3 bg-muted rounded-md break-all text-sm">
              {shareUrl}
            </div>
            <Button onClick={() => {
              navigator.clipboard.writeText(shareUrl);
              toast.success("Link copiado!");
            }} className="w-full">
              Copiar Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConsultarEscalasTab;