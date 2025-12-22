-- Enable UUID extension if not enabled
create extension if not exists "uuid-ossp";

-- 1. Create the Posts table
create table public.posts (
  id uuid default uuid_generate_v4() primary key,
  slug text not null unique,
  title text not null,
  excerpt text,
  content text,
  cover_image text,
  date date default current_date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable Row Level Security (RLS)
alter table public.posts enable row level security;

-- 3. Create Policies for Posts
-- Allow public read access to all posts
create policy "Public posts are viewable by everyone"
  on public.posts for select
  using ( true );

-- Allow authenticated users (Admin) to perform all actions
create policy "Admins can manage posts"
  on public.posts for all
  using ( auth.role() = 'authenticated' );

-- 4. Storage Setup (for 'uploads' bucket)
-- Note: You can also create this in the Dashboard, but here is the SQL way.
insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', true)
on conflict (id) do nothing;

-- 5. Storage Policies
-- Allow public read access to files
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'uploads' );

-- Allow authenticated upload/delete
create policy "Auth Upload"
  on storage.objects for insert
  with check ( bucket_id = 'uploads' and auth.role() = 'authenticated' );

create policy "Auth Update"
  on storage.objects for update
  using ( bucket_id = 'uploads' and auth.role() = 'authenticated' );

create policy "Auth Delete"
  on storage.objects for delete
  using ( bucket_id = 'uploads' and auth.role() = 'authenticated' );
