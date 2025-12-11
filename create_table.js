import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function createSettingsTable() {
  try {
    console.log('Creating sim_tracking_settings table...');

    // First, let's try to insert a row to see if the table exists
    const { data, error } = await supabase
      .from('sim_tracking_settings')
      .select('id')
      .limit(1);

    if (error && error.code === 'PGRST205') {
      console.log('Table does not exist. Please create it manually in Supabase dashboard with this SQL:');
      console.log(`
CREATE TABLE public.sim_tracking_settings (
  id uuid primary key default gen_random_uuid(),
  authorization_token text not null,
  consent_auth_token text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

CREATE INDEX idx_sim_tracking_settings_active ON public.sim_tracking_settings (is_active);

-- Insert a default row
INSERT INTO public.sim_tracking_settings (authorization_token, consent_auth_token, is_active)
VALUES ('', '', true);
      `);
    } else {
      console.log('Table exists or can be accessed');
      console.log('Current data:', data);
    }
  } catch (e) {
    console.error('Error:', e);
  }
}

createSettingsTable();
