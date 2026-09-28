import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

let supabaseClient: SupabaseClient | null = null;
let isConfigured = false;

function initClient(): SupabaseClient | null {
  if (supabaseClient) return supabaseClient;

  const SUPABASE_URL = process.env.SUPABASE_URL?.trim();
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY?.trim();

  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    try {
      supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });
      isConfigured = true;
      console.log(`[Supabase] Client initialized successfully with URL: ${SUPABASE_URL}`);
    } catch (err: any) {
      console.error('[Supabase] Failed to initialize Supabase client:', err.message);
    }
  } else {
    console.warn('[Supabase] SUPABASE_URL or SUPABASE_ANON_KEY is not defined. Running in local fallback mode.');
  }

  return supabaseClient;
}

// Auto-run once
initClient();

export function getSupabaseClient(): SupabaseClient | null {
  return supabaseClient;
}

export function isSupabaseConfigured(): boolean {
  return isConfigured && supabaseClient !== null;
}

/**
 * Register a new user via Supabase Auth
 */
export async function registerWithSupabase(params: {
  email: string;
  password: string;
  name: string;
  phone?: string | null;
  city?: string | null;
  pincode?: string | null;
  role?: 'user' | 'admin';
}) {
  if (!supabaseClient) {
    throw new Error('Supabase client is not configured');
  }

  const { data, error } = await supabaseClient.auth.signUp({
    email: params.email,
    password: params.password,
    options: {
      data: {
        name: params.name,
        phone: params.phone || null,
        city: params.city || null,
        pincode: params.pincode || null,
        role: params.role || 'user',
      },
    },
  });

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Sign in existing user via Supabase Auth
 */
export async function loginWithSupabase(email: string, password: string) {
  if (!supabaseClient) {
    throw new Error('Supabase client is not configured');
  }

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Verifies a Supabase JWT access token and returns user details
 */
export async function verifySupabaseToken(token: string) {
  if (!supabaseClient) {
    return null;
  }

  try {
    const { data: { user }, error } = await supabaseClient.auth.getUser(token);
    if (error || !user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email || '',
      role: (user.user_metadata?.role as 'user' | 'admin') || 'user',
      name: (user.user_metadata?.name as string) || user.email?.split('@')[0] || 'User',
    };
  } catch (err) {
    return null;
  }
}

export function getStorageBucketName(): string {
  return process.env.SUPABASE_STORAGE_BUCKET?.trim() || 'prescriptions';
}

/**
 * Ensures the target Supabase storage bucket exists
 */
export async function ensureStorageBucket(bucketName?: string): Promise<boolean> {
  if (!supabaseClient) return false;
  const targetBucket = bucketName || getStorageBucketName();

  try {
    const { data: buckets, error: listError } = await supabaseClient.storage.listBuckets();
    if (listError) {
      console.warn('[Supabase Storage] Could not list buckets:', listError.message);
      return false;
    }

    const exists = buckets?.some((b) => b.name === targetBucket);
    if (!exists) {
      const { error: createError } = await supabaseClient.storage.createBucket(targetBucket, {
        public: true,
        fileSizeLimit: 10 * 1024 * 1024, // 10MB limit
      });
      if (createError) {
        console.warn(`[Supabase Storage] Could not create bucket "${targetBucket}":`, createError.message);
        return false;
      }
      console.log(`[Supabase Storage] Created public bucket "${targetBucket}".`);
    }
    return true;
  } catch (err: any) {
    console.warn('[Supabase Storage] Error verifying bucket:', err.message);
    return false;
  }
}

/**
 * Uploads a prescription slip or image to Supabase Storage
 */
export async function uploadPrescriptionToSupabase(params: {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  userId?: string;
}): Promise<{ url: string; path: string } | null> {
  if (!supabaseClient) {
    throw new Error('Supabase client is not configured');
  }

  const bucketName = getStorageBucketName();
  const cleanName = params.originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const timestamp = Date.now();
  const filePath = `${params.userId || 'guest'}/${timestamp}_${cleanName}`;

  // Attempt upload
  const { data, error } = await supabaseClient.storage
    .from(bucketName)
    .upload(filePath, params.buffer, {
      contentType: params.mimeType,
      upsert: true,
    });

  if (error) {
    console.error('[Supabase Storage] Upload error:', error.message);
    throw new Error(`Supabase Storage upload failed: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabaseClient.storage
    .from(bucketName)
    .getPublicUrl(data.path);

  return {
    url: urlData.publicUrl,
    path: data.path,
  };
}
