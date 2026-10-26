create extension if not exists vector;
create table documents(id uuid primary key default gen_random_uuid(),user_id uuid not null default auth.uid(),name text,kind text,created_at timestamptz default now());
create table chunks(id uuid primary key default gen_random_uuid(),user_id uuid not null default auth.uid(),document_id uuid references documents on delete cascade,idx int,content text,embedding vector(768));
create table topics(id uuid primary key default gen_random_uuid(),user_id uuid not null default auth.uid(),name text,position int);
create table attempts(id uuid primary key default gen_random_uuid(),user_id uuid not null default auth.uid(),score int,created_at timestamptz default now());
create table answers(id uuid primary key default gen_random_uuid(),user_id uuid not null default auth.uid(),attempt_id uuid references attempts on delete cascade,topic text,question text,chosen int,correct int,is_correct bool,explanation text,citation text);
create table plans(id uuid primary key default gen_random_uuid(),user_id uuid not null default auth.uid(),content jsonb,created_at timestamptz default now());
do $$ declare t text; begin foreach t in array array['documents','chunks','topics','attempts','answers','plans'] loop
 execute format('alter table %I enable row level security',t);
 execute format('create policy own on %I for all using (user_id=auth.uid()) with check (user_id=auth.uid())',t);
end loop; end $$;
create index on chunks using hnsw (embedding vector_cosine_ops);
create function match_chunks(q vector(768),k int) returns table(id uuid,content text,doc text,idx int,sim float)
language sql stable security invoker as $$
 select c.id,c.content,d.name,c.idx,1-(c.embedding<=>q) from chunks c join documents d on d.id=c.document_id
 where c.user_id=auth.uid() order by c.embedding<=>q limit k $$;
