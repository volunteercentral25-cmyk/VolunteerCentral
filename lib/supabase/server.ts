import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
	const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

	if (!supabaseUrl || !supabaseAnonKey) {
		throw new Error(
			'Missing environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required'
		)
	}

	return createServerClient(supabaseUrl, supabaseAnonKey, {
		cookies: {
			async getAll() {
				const store = await cookies()
				return store.getAll()
			},
			async setAll(cookiesToSet) {
				try {
					const store = await cookies()
					cookiesToSet.forEach(({ name, value, options }) => store.set(name, value, options))
				} catch {
					// Called from a Server Component; ignore as middleware can refresh sessions
				}
			},
		},
	})
}
