const { Client } = require('pg');

const client = new Client({
  host: 'db.wudajoggduutfhwbzsxp.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'Prasad@gapfinder',
  ssl: { rejectUnauthorized: false },
});

const schema = `
create extension if not exists vector;
create table if not exists documents(id uuid primary key default gen_random_uuid(),user_id uuid not null default auth.uid(),name text,kind text,created_at timestamptz default now());
create table if not exists chunks(id uuid primary key default gen_random_uuid(),user_id uuid not null default auth.uid(),document_id uuid references documents on delete cascade,idx int,content text,embedding vector(768));
create table if not exists topics(id uuid primary key default gen_random_uuid(),user_id uuid not null default auth.uid(),name text,position int);
create table if not exists attempts(id uuid primary key default gen_random_uuid(),user_id uuid not null default auth.uid(),score int,created_at timestamptz default now());
create table if not exists answers(id uuid primary key default gen_random_uuid(),user_id uuid not null default auth.uid(),attempt_id uuid references attempts on delete cascade,topic text,question text,chosen int,correct int,is_correct bool,explanation text,citation text);
create table if not exists plans(id uuid primary key default gen_random_uuid(),user_id uuid not null default auth.uid(),content jsonb,created_at timestamptz default now());
create index if not exists chunks_embedding_idx on chunks using hnsw (embedding vector_cosine_ops);
create or replace function match_chunks(q vector(768),k int) returns table(id uuid,content text,doc text,idx int,sim float) language sql stable security invoker as $$ select c.id,c.content,d.name,c.idx,1-(c.embedding<=>q) from chunks c join documents d on d.id=c.document_id where c.user_id=auth.uid() order by c.embedding<=>q limit k $$;
`;

async function main() {
  try {
    console.log('Connecting to Supabase Postgres...');
    await client.connect();
    console.log('Connected! Running schema...');
    await client.query(schema);
    console.log('SUCCESS: Schema created!');
  } catch (e) {
    console.error('ERROR:', e.message);
  } finally {
    await client.end();
  }
}

main();
