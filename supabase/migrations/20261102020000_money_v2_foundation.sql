alter table public.transactions
  drop constraint transactions_kind_valid;

alter table public.transactions
  rename column occurred_on to transaction_date;

alter index public.transactions_user_occurred_idx
  rename to transactions_user_transaction_date_idx;

alter table public.transactions
  add column category text not null default 'Other',
  add constraint transactions_kind_valid
    check (kind in ('income', 'expense', 'investment')),
  add constraint transactions_category_not_blank
    check (btrim(category) <> ''),
  add constraint transactions_category_length
    check (char_length(category) <= 60);
