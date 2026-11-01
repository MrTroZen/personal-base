# Supabase database setup

The versioned schema is in `supabase/migrations`. No service-role key is required.

For local verification, install Docker, then run:

```powershell
npx supabase start
npx supabase db reset
```

To apply the migration to the hosted project:

```powershell
npx supabase login
npx supabase link --project-ref <project-ref>
npx supabase db push --dry-run
npx supabase db push
```

If the hosted project already has manual schema changes, run `npx supabase db pull` before pushing so its migration history is preserved.
