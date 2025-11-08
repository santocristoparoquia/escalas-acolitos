-- Remove email column from pessoas table
ALTER TABLE pessoas DROP COLUMN IF EXISTS email;

-- Create a view for public schedule access
CREATE OR REPLACE VIEW escalas_publicas AS
SELECT 
  e.id,
  e.data,
  e.horario,
  e.observacoes,
  c.nome as comunidade_nome,
  json_agg(
    json_build_object(
      'nome_completo', p.nome_completo,
      'funcao', p.funcao
    ) ORDER BY p.nome_completo
  ) as participantes
FROM escalas e
JOIN comunidades c ON e.comunidade_id = c.id
LEFT JOIN escala_participantes ep ON e.id = ep.escala_id
LEFT JOIN pessoas p ON ep.pessoa_id = p.id
GROUP BY e.id, e.data, e.horario, e.observacoes, c.nome
ORDER BY e.data, e.horario;

-- Allow public read access to the view
GRANT SELECT ON escalas_publicas TO anon, authenticated;