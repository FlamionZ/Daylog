import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ulgdftsjwcreglnnbcro.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsZ2RmdHNqd2NyZWdsbm5iY3JvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTgyODgwNSwiZXhwIjoyMTA1NDA0ODA1fQ.FV4_t0hJyfk8UpvZ8-CkBRn-XghWaCqBOC239hMwg-c';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('--- SYNCING MONEV DATA TO SUPABASE ---');

  // 1. List users from Supabase Auth
  const { data: usersData, error: userError } = await supabase.auth.admin.listUsers();
  if (userError) {
    console.error('Error fetching auth users:', userError);
    return;
  }

  console.log(`Found ${usersData.users.length} user(s) in auth.users.`);

  for (const user of usersData.users) {
    console.log(`Processing user: ${user.id} (${user.email})`);

    // Update or insert profile
    const { error: profileError } = await supabase.from('profiles').upsert(
      {
        user_id: user.id,
        full_name: 'Muhammad Rakha Abimanyu',
        timezone: 'Asia/Jakarta',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    );
    if (profileError) {
      console.error('Error upserting profile:', profileError);
    } else {
      console.log('✓ Profile updated: Muhammad Rakha Abimanyu');
    }

    // Check if user has an existing active internship
    const { data: existingInternships } = await supabase
      .from('internships')
      .select('id')
      .eq('user_id', user.id);

    if (existingInternships && existingInternships.length > 0) {
      // Update existing active internship
      const { error: updateError } = await supabase
        .from('internships')
        .update({
          company_name: 'PT. Tiga Serangkai Pustaka Mandiri',
          role_title: 'Software Developer — Fullstack, Frontend, Backend, Mobile & Desktop',
          location: 'KOTA SURAKARTA',
          start_date: '2026-09-21',
          end_date: '2027-03-20',
          default_start_time: '08:00:00',
          default_end_time: '17:00:00',
          notes: 'Program MagangHub Kemnaker RI — Periode 21 September 2026 s/d 20 Maret 2027.',
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating internship:', updateError);
      } else {
        console.log('✓ Updated existing internship to PT. Tiga Serangkai Pustaka Mandiri');
      }
    } else {
      // Create new active internship
      const { error: insertError } = await supabase.from('internships').insert({
        user_id: user.id,
        company_name: 'PT. Tiga Serangkai Pustaka Mandiri',
        role_title: 'Software Developer — Fullstack, Frontend, Backend, Mobile & Desktop',
        location: 'KOTA SURAKARTA',
        start_date: '2026-09-21',
        end_date: '2027-03-20',
        default_start_time: '08:00:00',
        default_end_time: '17:00:00',
        notes: 'Program MagangHub Kemnaker RI — Periode 21 September 2026 s/d 20 Maret 2027.',
        is_active: true,
      });

      if (insertError) {
        console.error('Error inserting internship:', insertError);
      } else {
        console.log('✓ Created active internship for PT. Tiga Serangkai Pustaka Mandiri');
      }
    }
  }

  // Also check if there are any orphaned internships or profiles
  console.log('Done syncing Monev data.');
}

run().catch(console.error);
