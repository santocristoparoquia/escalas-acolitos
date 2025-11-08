import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const PessoasTab = () => {
  const [pessoas, setPessoas] = useState<any[]>([]);
  const [comunidades, setComunidades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPessoa, setEditingPessoa] = useState<any>(null);
  
  const [formData, setFormData] = useState<{
    nome_completo: string;
    funcao: "acolito" | "coroinha" | "cerimoniario";
    comunidade_id: string;
    telefone: string;
    ativo: boolean;
  }>({
    nome_completo: "",
    funcao: "coroinha",
    comunidade_id: "",
    telefone: "",
    ativo: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    const { data: pessoasData } = await supabase
      .from("pessoas")
      .select("*, comunidades(nome)")
      .order("nome_completo");
    
    const { data: comunidadesData } = await supabase
      .from("comunidades")
      .select("*")
      .order("nome");
    
    setPessoas(pessoasData || []);
    setComunidades(comunidadesData || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingPessoa) {
        const { error } = await supabase
          .from("pessoas")
          .update(formData)
          .eq("id", editingPessoa.id);
        
        if (error) throw error;
        toast.success("Pessoa atualizada com sucesso!");
      } else {
        const { error } = await supabase
          .from("pessoas")
          .insert([formData]);
        
        if (error) throw error;
        toast.success("Pessoa cadastrada com sucesso!");
      }
      
      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta pessoa?")) return;
    
    try {
      const { error } = await supabase
        .from("pessoas")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      toast.success("Pessoa excluída com sucesso!");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Erro ao excluir");
    }
  };

  const resetForm = () => {
    setFormData({
      nome_completo: "",
      funcao: "coroinha",
      comunidade_id: "",
      telefone: "",
      ativo: true,
    });
    setEditingPessoa(null);
  };

  const openEditDialog = (pessoa: any) => {
    setEditingPessoa(pessoa);
    setFormData({
      nome_completo: pessoa.nome_completo,
      funcao: pessoa.funcao,
      comunidade_id: pessoa.comunidade_id || "",
      telefone: pessoa.telefone || "",
      ativo: pessoa.ativo,
    });
    setDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gestão de Pessoas</CardTitle>
            <CardDescription>Cadastro de acólitos, coroinhas e cerimoniários</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nova Pessoa
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingPessoa ? "Editar Pessoa" : "Nova Pessoa"}</DialogTitle>
                <DialogDescription>
                  Preencha os dados da pessoa
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo *</Label>
                  <Input
                    id="nome"
                    value={formData.nome_completo}
                    onChange={(e) => setFormData({ ...formData, nome_completo: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="funcao">Função *</Label>
                  <Select
                    value={formData.funcao}
                    onValueChange={(value) => setFormData({ ...formData, funcao: value as "acolito" | "coroinha" | "cerimoniario" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="coroinha">Coroinha</SelectItem>
                      <SelectItem value="acolito">Acólito</SelectItem>
                      <SelectItem value="cerimoniario">Cerimoniário</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comunidade">Comunidade</Label>
                  <Select
                    value={formData.comunidade_id}
                    onValueChange={(value) => setFormData({ ...formData, comunidade_id: value })}
                  >
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
                  <Label htmlFor="telefone">Telefone *</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, "");
                      if (value.length <= 11) {
                        if (value.length <= 2) {
                          value = value.replace(/^(\d{0,2})/, "($1");
                        } else if (value.length <= 7) {
                          value = value.replace(/^(\d{2})(\d{0,5})/, "($1) $2");
                        } else {
                          value = value.replace(/^(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
                        }
                      }
                      setFormData({ ...formData, telefone: value });
                    }}
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                    required
                  />
                </div>

                <DialogFooter>
                  <Button type="submit">
                    {editingPessoa ? "Atualizar" : "Cadastrar"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Comunidade</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pessoas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      Nenhuma pessoa cadastrada
                    </TableCell>
                  </TableRow>
                ) : (
                  pessoas.map((pessoa) => (
                    <TableRow key={pessoa.id}>
                      <TableCell className="font-medium">{pessoa.nome_completo}</TableCell>
                      <TableCell className="capitalize">{pessoa.funcao}</TableCell>
                      <TableCell>{pessoa.comunidades?.nome || "-"}</TableCell>
                      <TableCell>
                        {pessoa.telefone || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={pessoa.ativo ? "default" : "secondary"}>
                          {pessoa.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(pessoa)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(pessoa.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PessoasTab;