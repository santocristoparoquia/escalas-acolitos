import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

const RelatoriosTab = () => {
  const [relatorios, setRelatorios] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRelatorios();
  }, [selectedMonth]);

  const fetchRelatorios = async () => {
    setLoading(true);
    const inicio = format(startOfMonth(selectedMonth), "yyyy-MM-dd");
    const fim = format(endOfMonth(selectedMonth), "yyyy-MM-dd");

    const { data } = await supabase
      .from("escalas")
      .select(`
        id,
        data,
        escala_participantes (
          pessoas (
            id,
            nome_completo,
            funcao,
            comunidades (nome)
          )
        )
      `)
      .gte("data", inicio)
      .lte("data", fim);

    // Process data to count services per person
    const counts: any = {};
    
    data?.forEach((escala) => {
      escala.escala_participantes?.forEach((ep: any) => {
        const pessoa = ep.pessoas;
        if (pessoa) {
          if (!counts[pessoa.id]) {
            counts[pessoa.id] = {
              nome: pessoa.nome_completo,
              funcao: pessoa.funcao,
              comunidade: pessoa.comunidades?.nome || "-",
              total: 0,
            };
          }
          counts[pessoa.id].total++;
        }
      });
    });

    const relatoriosArray = Object.values(counts).sort((a: any, b: any) => b.total - a.total);
    setRelatorios(relatoriosArray);
    setLoading(false);
  };

  const generateMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    
    for (let i = -3; i <= 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      options.push(date);
    }
    
    return options;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Relatórios Mensais</CardTitle>
            <CardDescription>Estatísticas de participação</CardDescription>
          </div>
          <Select
            value={selectedMonth.toISOString()}
            onValueChange={(value) => setSelectedMonth(new Date(value))}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {generateMonthOptions().map((date) => (
                <SelectItem key={date.toISOString()} value={date.toISOString()}>
                  {format(date, "MMMM 'de' yyyy", { locale: ptBR })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
                  <TableHead>Posição</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Comunidade</TableHead>
                  <TableHead className="text-right">Total de Escalas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {relatorios.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Nenhum dado encontrado para este mês
                    </TableCell>
                  </TableRow>
                ) : (
                  relatorios.map((rel: any, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-bold">#{index + 1}</TableCell>
                      <TableCell className="font-medium">{rel.nome}</TableCell>
                      <TableCell className="capitalize">{rel.funcao}</TableCell>
                      <TableCell>{rel.comunidade}</TableCell>
                      <TableCell className="text-right font-bold">{rel.total}</TableCell>
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

export default RelatoriosTab;