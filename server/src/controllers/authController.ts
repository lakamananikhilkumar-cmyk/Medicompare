import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../db/index.js';
import { signupSchema, loginSchema, profileUpdateSchema } from '../validators/schemas.js';
import { generateToken, type AuthUser } from '../middleware/auth.js';
import {
  isSupabaseConfigured,
  registerWithSupabase,
  loginWithSupabase,
} from '../services/supabaseService.js';

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const validated = signupSchema.parse(req.body);

    // Check if email already registered locally
    const existing = await query('SELECT id FROM profiles WHERE LOWER(email) = LOWER($1)', [validated.email]);
    if (existing.rows.length > 0) {
      res.status(409).json({
        error: 'Conflict',
        message: 'An account with this email address already exists.',
      });
      return;
    }

    let supabaseUserId: string | null = null;
    let supabaseToken: string | null = null;

    // Attempt Supabase Auth registration
    if (isSupabaseConfigured()) {
      try {
        const supabaseRes = await registerWithSupabase({
          email: validated.email,
          password: validated.password,
          name: validated.name,
          phone: validated.phone,
          city: validated.city,
          pincode: validated.pincode,
        });
        if (supabaseRes.user) {
          supabaseUserId = supabaseRes.user.id;
          supabaseToken = supabaseRes.session?.access_token || null;
        }
      } catch (sbErr: any) {
        console.warn('[Supabase Auth] Registration notice:', sbErr.message);
        // If email invalid or rate limit on Supabase, but allow local registration to proceed
      }
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(validated.password, salt);

    const insertResult = await query<{
      id: string;
      name: string;
      email: string;
      role: 'user' | 'admin';
      phone: string | null;
      city: string | null;
      pincode: string | null;
      created_at: string;
    }>(
      `INSERT INTO profiles (name, email, password_hash, phone, city, pincode, role)
       VALUES ($1, $2, $3, $4, $5, $6, 'user')
       RETURNING id, name, email, role, phone, city, pincode, created_at`,
      [validated.name, validated.email.toLowerCase(), passwordHash, validated.phone || null, validated.city || null, validated.pincode || null]
    );

    const profile = insertResult.rows[0];
    const authUser: AuthUser = {
      id: supabaseUserId || profile.id,
      email: profile.email,
      role: profile.role,
      name: profile.name,
    };
    const token = supabaseToken || generateToken(authUser);

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: authUser.id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        phone: profile.phone,
        city: profile.city,
        pincode: profile.pincode,
        createdAt: profile.created_at,
      },
    });
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Validation Error', details: err.errors });
      return;
    }
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to create account.' });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const validated = loginSchema.parse(req.body);

    let supabaseToken: string | null = null;
    let supabaseUser: any = null;

    // 1. If Supabase configured, attempt Supabase Auth first
    if (isSupabaseConfigured()) {
      try {
        const sbRes = await loginWithSupabase(validated.email, validated.password);
        if (sbRes.session && sbRes.user) {
          supabaseToken = sbRes.session.access_token;
          supabaseUser = sbRes.user;
        }
      } catch (sbErr: any) {
        // Fall back to local database check (e.g. for demo accounts)
      }
    }

    // 2. Check local profiles database
    const userRes = await query<{
      id: string;
      name: string;
      email: string;
      password_hash: string;
      role: 'user' | 'admin';
      phone: string | null;
      city: string | null;
      pincode: string | null;
      created_at: string;
    }>('SELECT id, name, email, password_hash, role, phone, city, pincode, created_at FROM profiles WHERE LOWER(email) = LOWER($1)', [validated.email]);

    // If verified via Supabase Auth and profile exists locally
    if (supabaseToken && supabaseUser) {
      const profile = userRes.rows[0] || {
        id: supabaseUser.id,
        name: supabaseUser.user_metadata?.name || validated.email.split('@')[0],
        email: validated.email,
        role: 'user',
        phone: null,
        city: null,
        pincode: null,
        created_at: new Date().toISOString(),
      };

      res.json({
        message: 'Login successful via Supabase Auth',
        token: supabaseToken,
        user: {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          role: profile.role,
          phone: profile.phone,
          city: profile.city,
          pincode: profile.pincode,
        },
      });
      return;
    }

    // 3. Fallback: Local database bcrypt match
    if (userRes.rows.length === 0) {
      res.status(401).json({ error: 'Unauthorized', message: 'Invalid email or password.' });
      return;
    }

    const user = userRes.rows[0];
    const passwordMatch = await bcrypt.compare(validated.password, user.password_hash);
    if (!passwordMatch) {
      res.status(401).json({ error: 'Unauthorized', message: 'Invalid email or password.' });
      return;
    }

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };
    const token = generateToken(authUser);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        city: user.city,
        pincode: user.pincode,
      },
    });
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Validation Error', details: err.errors });
      return;
    }
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to authenticate.' });
  }
}

export async function getMe(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized', message: 'Not authenticated' });
    return;
  }

  const userRes = await query<{
    id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
    phone: string | null;
    city: string | null;
    pincode: string | null;
    created_at: string;
  }>('SELECT id, name, email, role, phone, city, pincode, created_at FROM profiles WHERE id = $1', [req.user.id]);

  if (userRes.rows.length === 0) {
    res.status(404).json({ error: 'Not Found', message: 'User profile not found.' });
    return;
  }

  const user = userRes.rows[0];
  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      city: user.city,
      pincode: user.pincode,
      createdAt: user.created_at,
    },
  });
}

export async function updateProfile(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const validated = profileUpdateSchema.parse(req.body);

    const updateRes = await query<{
      id: string;
      name: string;
      email: string;
      role: 'user' | 'admin';
      phone: string | null;
      city: string | null;
      pincode: string | null;
    }>(
      `UPDATE profiles
       SET name = COALESCE($1, name),
           phone = COALESCE($2, phone),
           city = COALESCE($3, city),
           pincode = COALESCE($4, pincode),
           updated_at = NOW()
       WHERE id = $5
       RETURNING id, name, email, role, phone, city, pincode`,
      [validated.name ?? null, validated.phone ?? null, validated.city ?? null, validated.pincode ?? null, req.user.id]
    );

    res.json({
      message: 'Profile updated successfully',
      user: updateRes.rows[0],
    });
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Validation Error', details: err.errors });
      return;
    }
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to update profile.' });
  }
}

export async function logout(_req: Request, res: Response): Promise<void> {
  // Stateless JWT, client clears storage
  res.json({ message: 'Logged out successfully' });
}
