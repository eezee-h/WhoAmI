create extension if not exists pgcrypto;

create table if not exists site_user (
    page_username varchar(50) primary key,
    login_id varchar(100) not null unique,
    password_hash varchar(255) not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists home_profile (
    page_username varchar(50) primary key
        references site_user(page_username) on delete cascade,
    display_name varchar(100) not null,
    tagline text,
    snapshot text,
    avatar_base64 text,
    avatar_x integer not null default 0,
    avatar_y integer not null default 0,
    keywords text[] not null default '{}',
    theme varchar(20) not null default 'black',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists home_section (
    id uuid primary key default gen_random_uuid(),
    page_username varchar(50) not null
        references site_user(page_username) on delete cascade,
    section_kind varchar(30) not null,
    title varchar(100) not null,
    sort_order integer not null default 0,
    is_visible boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint home_section_kind_check
        check (section_kind in ('archive', 'activity', 'project', 'card'))
);

create table if not exists archive_item (
    id uuid primary key default gen_random_uuid(),
    section_id uuid not null
        references home_section(id) on delete cascade,
    title varchar(150) not null,
    organization varchar(150),
    date_text text,
    summary text,
    description text,
    image_base64 text,
    link_url text,
    featured boolean not null default false,
    sort_order integer not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists contact_link (
    id uuid primary key default gen_random_uuid(),
    page_username varchar(50) not null
        references site_user(page_username) on delete cascade,
    contact_type varchar(30) not null,
    label varchar(100),
    value text not null,
    sort_order integer not null default 0,
    is_visible boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint contact_link_type_check
        check (contact_type in ('email', 'github', 'instagram', 'linkedin', 'twitter', 'facebook'))
);

create table if not exists card_item (
    id uuid primary key default gen_random_uuid(),
    section_id uuid not null
        references home_section(id) on delete cascade,
    title varchar(150) not null,
    subtitle varchar(150),
    date_text text,
    summary text,
    thumbnail_base64 text,
    featured boolean not null default false,
    sort_order integer not null default 0,
    tags text[] not null default '{}',
    info_cards jsonb not null default '[]'::jsonb,
    links text[] not null default '{}',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists card_block (
    id uuid primary key default gen_random_uuid(),
    card_id uuid not null
        references card_item(id) on delete cascade,
    block_type varchar(30) not null,
    payload jsonb not null default '{}'::jsonb,
    sort_order integer not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint card_block_type_check
        check (block_type in ('text', 'image', 'embed'))
);

create index if not exists idx_home_section_page_username
    on home_section(page_username, sort_order);

create index if not exists idx_archive_item_section_id
    on archive_item(section_id, sort_order);

create index if not exists idx_contact_link_page_username
    on contact_link(page_username, sort_order);

create index if not exists idx_card_item_section_id
    on card_item(section_id, sort_order);

create index if not exists idx_card_block_card_id
    on card_block(card_id, sort_order);
