import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
	return createServerClient(
		'https://wvqfwszflytpkditlmsa.supabase.co',
		'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2cWZ3c3pmbHl0cGtkaXRsbXNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNjM5NjIsImV4cCI6MjA3MTczOTk2Mn0.ht9B8x1arXXR8fhjjRS5uY2E69UBwKUNCNPYv_mV7oE',
		{
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
		}
	)
}
