-- Backup SQL para instalação em outro servidor
-- Sistema de Escalas - Paróquia Senhor Santo Cristo dos Milagres
-- Data: 2025-01-08

-- ================================================
-- 1. CRIAR TIPOS ENUM
-- ================================================

CREATE TYPE public.funcao_type AS ENUM ('acolito', 'coroinha', 'cerimoniario');

-- ================================================
-- 2. CRIAR TABELAS
-- ================================================

-- Tabela: profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_completo TEXT NOT NULL,
  email TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela: comunidades
CREATE TABLE public.comunidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela: pessoas
CREATE TABLE public.pessoas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_completo TEXT NOT NULL,
  telefone TEXT,
  funcao public.funcao_type NOT NULL,
  comunidade_id UUID REFERENCES public.comunidades(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela: horarios
CREATE TABLE public.horarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comunidade_id UUID NOT NULL REFERENCES public.comunidades(id) ON DELETE CASCADE,
  dia_semana INTEGER NOT NULL CHECK (dia_semana >= 0 AND dia_semana <= 6),
  hora TIME NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela: escalas
CREATE TABLE public.escalas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data DATE NOT NULL,
  horario TIME NOT NULL,
  comunidade_id UUID NOT NULL REFERENCES public.comunidades(id) ON DELETE CASCADE,
  observacoes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela: escala_participantes
CREATE TABLE public.escala_participantes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escala_id UUID NOT NULL REFERENCES public.escalas(id) ON DELETE CASCADE,
  pessoa_id UUID NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ================================================
-- 3. CRIAR VIEWS
-- ================================================

-- View: escalas_publicas
CREATE OR REPLACE VIEW public.escalas_publicas AS
SELECT 
  e.id,
  e.data,
  e.horario,
  e.observacoes,
  c.nome AS comunidade_nome,
  json_agg(
    json_build_object(
      'nome_completo', p.nome_completo,
      'funcao', p.funcao
    ) ORDER BY p.funcao, p.nome_completo
  ) AS participantes
FROM public.escalas e
JOIN public.comunidades c ON e.comunidade_id = c.id
LEFT JOIN public.escala_participantes ep ON e.id = ep.escala_id
LEFT JOIN public.pessoas p ON ep.pessoa_id = p.id
GROUP BY e.id, e.data, e.horario, e.observacoes, c.nome;

-- View: estatisticas_mensais
CREATE OR REPLACE VIEW public.estatisticas_mensais AS
SELECT 
  date_trunc('month', e.data) AS mes,
  p.id AS pessoa_id,
  p.nome_completo,
  p.funcao,
  c.nome AS comunidade,
  COUNT(*) AS total_escalas
FROM public.escalas e
JOIN public.escala_participantes ep ON e.id = ep.escala_id
JOIN public.pessoas p ON ep.pessoa_id = p.id
JOIN public.comunidades c ON e.comunidade_id = c.id
GROUP BY date_trunc('month', e.data), p.id, p.nome_completo, p.funcao, c.nome;

-- ================================================
-- 4. HABILITAR ROW LEVEL SECURITY (RLS)
-- ================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comunidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pessoas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.horarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escalas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escala_participantes ENABLE ROW LEVEL SECURITY;

-- ================================================
-- 5. CRIAR POLÍTICAS RLS
-- ================================================

-- Políticas para profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Políticas para comunidades
CREATE POLICY "Anyone can view communities" ON public.comunidades
  FOR SELECT USING (true);

CREATE POLICY "Only admins can manage communities" ON public.comunidades
  FOR ALL USING (
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid())
  );

-- Políticas para pessoas
CREATE POLICY "Anyone can view active people" ON public.pessoas
  FOR SELECT USING (
    ativo = true OR 
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Only admins can manage people" ON public.pessoas
  FOR ALL USING (
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid())
  );

-- Políticas para horarios
CREATE POLICY "Anyone can view schedules" ON public.horarios
  FOR SELECT USING (true);

CREATE POLICY "Only admins can manage schedules" ON public.horarios
  FOR ALL USING (
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid())
  );

-- Políticas para escalas
CREATE POLICY "Anyone can view schedules" ON public.escalas
  FOR SELECT USING (true);

CREATE POLICY "Only admins can manage schedules" ON public.escalas
  FOR ALL USING (
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid())
  );

-- Políticas para escala_participantes
CREATE POLICY "Anyone can view participants" ON public.escala_participantes
  FOR SELECT USING (true);

CREATE POLICY "Only admins can manage participants" ON public.escala_participantes
  FOR ALL USING (
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid())
  );

-- ================================================
-- 6. CRIAR FUNÇÕES E TRIGGERS
-- ================================================

-- Função para criar perfil automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome_completo, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome_completo', 'Usuário'),
    NEW.email
  );
  RETURN NEW;
END;
$$;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ================================================
-- 7. DADOS INICIAIS (OPCIONAL)
-- ================================================

-- Inserir comunidades de exemplo (descomente se necessário)
-- INSERT INTO public.comunidades (nome) VALUES
--   ('Nossa Senhora'),
--   ('São José'),
--   ('Sagrado Coração');

-- ================================================
-- 8. ÍNDICES PARA PERFORMANCE
-- ================================================

CREATE INDEX idx_pessoas_comunidade ON public.pessoas(comunidade_id);
CREATE INDEX idx_pessoas_funcao ON public.pessoas(funcao);
CREATE INDEX idx_escalas_data ON public.escalas(data);
CREATE INDEX idx_escalas_comunidade ON public.escalas(comunidade_id);
CREATE INDEX idx_escala_participantes_escala ON public.escala_participantes(escala_id);
CREATE INDEX idx_escala_participantes_pessoa ON public.escala_participantes(pessoa_id);

-- ================================================
-- NOTAS DE INSTALAÇÃO
-- ================================================

-- 1. Execute este script em um banco de dados PostgreSQL limpo
-- 2. Certifique-se de que a extensão auth está habilitada (para Supabase)
-- 3. Configure as variáveis de ambiente:
--    - VITE_SUPABASE_URL
--    - VITE_SUPABASE_PUBLISHABLE_KEY
-- 4. Configure o Supabase Auth para permitir registro de usuários
-- 5. O primeiro usuário deve ser promovido manualmente a admin:
--    UPDATE public.profiles SET is_admin = true WHERE email = 'seu-email@exemplo.com';

-- ================================================
-- FIM DO BACKUP
-- ================================================
