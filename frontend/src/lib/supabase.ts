import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if credentials are configured (not placeholders)
const isConfigured = 
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://dlaxfhmwhqtacazjbdxq.supabase.co' && 
  supabaseAnonKey !== 'sb_publishable_4VqgjsA7z25CfoysP8_JSQ_Txdcn7Yl' &&
  supabaseUrl.startsWith('http');

// // Validate Supabase credentials before initializing
// if (!isConfigured) {
//   console.warn('⚠️ Supabase credentials not configured - running in demo mode');
//   console.info('To enable data persistence, create a .env file with:');
//   console.info('\nSee frontend/.env.example for template');
// }

// Use dummy URL if not configured to prevent crash (must be valid URL format)
const validUrl = isConfigured ? supabaseUrl : 'https://dlaxfhmwhqtacazjbdxq.supabase.co';
const validKey = isConfigured ? supabaseAnonKey : 'sb_publishable_4VqgjsA7z25CfoysP8_JSQ_Txdcn7Yl';

export const supabase = createClient(validUrl, validKey);

export interface ChartData {
  id?: number;
  email: string;
  chart_type: string;
  chart_data: any;
  created_at?: string;
  updated_at?: string;
}

/**
 * Check if Supabase is properly configured
 */
export function isSupabaseConfigured(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL || '';
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  return !!(
    url && 
    key && 
    url !== 'your_supabase_project_url' && 
    key !== 'your_supabase_anon_key' &&
    url.startsWith('http')
  );
}

/**
 * Save or update chart data for a user email
 */
export async function saveChartData(email: string, chartType: string, data: any) {
  if (!isSupabaseConfigured()) {
    console.warn('⚠️ Supabase not configured. Data will not be saved.');
    throw new Error('Supabase not configured. Please add credentials to .env file.');
  }

  try {
    // Check if data already exists for this email and chart type
    const { data: existing, error: fetchError } = await supabase
      .from('chart_data')
      .select('*')
      .eq('email', email)
      .eq('chart_type', chartType)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    if (existing) {
      // Update existing record
      const { data: updated, error: updateError } = await supabase
        .from('chart_data')
        .update({ 
          chart_data: data,
          updated_at: new Date().toISOString()
        })
        .eq('email', email)
        .eq('chart_type', chartType)
        .select()
        .single();

      if (updateError) throw updateError;
      return updated;
    } else {
      // Insert new record
      const { data: inserted, error: insertError } = await supabase
        .from('chart_data')
        .insert({
          email,
          chart_type: chartType,
          chart_data: data,
        })
        .select()
        .single();

      if (insertError) throw insertError;
      return inserted;
    }
  } catch (error) {
    console.error('Error saving chart data:', error);
    throw error;
  }
}

/**
 * Get chart data for a user email
 */
export async function getChartData(email: string, chartType: string): Promise<ChartData | null> {
  if (!isSupabaseConfigured()) {
    console.warn('⚠️ Supabase not configured. Cannot retrieve data.');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('chart_data')
      .select('*')
      .eq('email', email)
      .eq('chart_type', chartType)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching chart data:', error);
    return null;
  }
}
