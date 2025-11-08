-- Create enum for roles
CREATE TYPE public.funcao_type AS ENUM ('acolito', 'coroinha', 'cerimoniario');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_completo TEXT NOT NULL,
  email TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome_completo, email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'nome_completo', 'Usuário'),
    new.email
  );
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create communities table
CREATE TABLE public.comunidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.comunidades ENABLE ROW LEVEL SECURITY;

-- Communities policies (visible to all authenticated users)
CREATE POLICY "Anyone can view communities"
  ON public.comunidades FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage communities"
  ON public.comunidades FOR ALL
  TO authenticated
  USING ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()));

-- Insert default communities
INSERT INTO public.comunidades (nome) VALUES
  ('Matriz Santo Cristo'),
  ('Com N.S da Paz'),
  ('Com N.S Aparecida'),
  ('Com N.S do Perpétuo Socorro'),
  ('Com S F Xavier'),
  ('Com Santo Afonso'),
  ('Com Santa Isabel'),
  ('Com São João Batista');

-- Create people table (acolytes/altar boys)
CREATE TABLE public.pessoas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_completo TEXT NOT NULL,
  funcao funcao_type NOT NULL,
  comunidade_id UUID REFERENCES public.comunidades(id) ON DELETE SET NULL,
  telefone TEXT,
  email TEXT,
  ativo BOOLEAN DEFAULT true,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.pessoas ENABLE ROW LEVEL SECURITY;

-- People policies
CREATE POLICY "Anyone can view active people"
  ON public.pessoas FOR SELECT
  TO authenticated
  USING (ativo = true OR (SELECT is_admin FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Only admins can manage people"
  ON public.pessoas FOR ALL
  TO authenticated
  USING ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()));

-- Create mass schedules table
CREATE TABLE public.horarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comunidade_id UUID REFERENCES public.comunidades(id) ON DELETE CASCADE NOT NULL,
  dia_semana INTEGER NOT NULL CHECK (dia_semana >= 0 AND dia_semana <= 6),
  hora TIME NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(comunidade_id, dia_semana, hora)
);

ALTER TABLE public.horarios ENABLE ROW LEVEL SECURITY;

-- Schedules policies
CREATE POLICY "Anyone can view schedules"
  ON public.horarios FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage schedules"
  ON public.horarios FOR ALL
  TO authenticated
  USING ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()));

-- Create monthly schedules table
CREATE TABLE public.escalas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data DATE NOT NULL,
  horario TIME NOT NULL,
  comunidade_id UUID REFERENCES public.comunidades(id) ON DELETE CASCADE NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

ALTER TABLE public.escalas ENABLE ROW LEVEL SECURITY;

-- Schedules policies
CREATE POLICY "Anyone can view schedules"
  ON public.escalas FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage schedules"
  ON public.escalas FOR ALL
  TO authenticated
  USING ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()));

-- Create schedule participants table (many-to-many)
CREATE TABLE public.escala_participantes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escala_id UUID REFERENCES public.escalas(id) ON DELETE CASCADE NOT NULL,
  pessoa_id UUID REFERENCES public.pessoas(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(escala_id, pessoa_id)
);

ALTER TABLE public.escalas ENABLE ROW LEVEL SECURITY;

-- Participants policies
CREATE POLICY "Anyone can view participants"
  ON public.escala_participantes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage participants"
  ON public.escala_participantes FOR ALL
  TO authenticated
  USING ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()));

-- Create view for schedule statistics
CREATE OR REPLACE VIEW public.estatisticas_mensais AS
SELECT 
  p.id as pessoa_id,
  p.nome_completo,
  p.funcao,
  c.nome as comunidade,
  DATE_TRUNC('month', e.data) as mes,
  COUNT(*) as total_escalas
FROM public.escala_participantes ep
JOIN public.pessoas p ON p.id = ep.pessoa_id
JOIN public.escalas e ON e.id = ep.escala_id
JOIN public.comunidades c ON c.id = p.comunidade_id
GROUP BY p.id, p.nome_completo, p.funcao, c.nome, DATE_TRUNC('month', e.data)
ORDER BY mes DESC, total_escalas DESC;