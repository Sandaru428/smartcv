import { NextResponse } from 'next/server'
import { createClientPub } from '@/utils/supabase/server'

export async function GET(req: Request) {
	try {
		const url = new URL(req.url)
		const id = url.searchParams.get('id')

		const supabase = await createClientPub()

		// get current user
		const { data: userRes } = await supabase.auth.getUser()
		const user = userRes.user
		if (!user) return new NextResponse('Unauthorized', { status: 401 })

		const qb = supabase.from('projects')

		if (id) {
			const { data, error } = await qb.select('*').eq('id', id).eq('user_id', user.id).limit(1).maybeSingle()
			if (error) return new NextResponse(error.message, { status: 500 })
			if (!data) return new NextResponse('Not found', { status: 404 })
			return NextResponse.json(data)
		}

		const { data, error } = await qb.select('*').eq('user_id', user.id).order('updated_at', { ascending: false })
		if (error) return new NextResponse(error.message, { status: 500 })

		return NextResponse.json(data)
	} catch (err: unknown) {
		const m = err instanceof Error ? err.message : String(err)
		return new NextResponse(m, { status: 500 })
	}
}

export async function POST(req: Request) {
	try {
		const body = await req.json()
		const { name = 'Untitled Project', templateId = null, data = {}, step = 0 } = body

		const supabase = await createClientPub()
		const { data: userRes } = await supabase.auth.getUser()
		const user = userRes.user
		if (!user) return new NextResponse('Unauthorized', { status: 401 })

		const { data: inserted, error } = await supabase
			.from('projects')
			.insert([{ name, template_id: templateId, data, step, user_id: user.id }])
			.select('*')
			.limit(1)

		if (error) return new NextResponse(error.message, { status: 500 })

		const project = inserted?.[0] ?? null

			// insert mapping into profile_projects join table so Supabase will show relationships
			try {
				if (project && project.id) {
					// use upsert to avoid duplicate key errors
					await supabase.from('profile_projects').upsert([
						{ profile_id: user.id, project_id: project.id },
					])
				}
			} catch (e) {
				console.warn('Failed to insert into profile_projects', e)
			}

		return NextResponse.json(project)
	} catch (err: unknown) {
		const m = err instanceof Error ? err.message : String(err)
		return new NextResponse(m, { status: 500 })
	}
}

export async function PUT(req: Request) {
	try {
		const url = new URL(req.url)
		const id = url.searchParams.get('id')
		if (!id) return new NextResponse('Missing id', { status: 400 })

		const body = await req.json()
		const { name, templateId, data, step } = body

		const supabase = await createClientPub()
		const { data: userRes } = await supabase.auth.getUser()
		const user = userRes.user
		if (!user) return new NextResponse('Unauthorized', { status: 401 })

		const updates: Record<string, unknown> = {}
		if (name !== undefined) updates.name = name
		if (templateId !== undefined) updates.template_id = templateId
		if (data !== undefined) updates.data = data
		if (step !== undefined) updates.step = step

		const { data: updated, error } = await supabase
			.from('projects')
			.update(updates)
			.eq('id', id)
			.eq('user_id', user.id)
			.select('*')
			.limit(1)

		if (error) return new NextResponse(error.message, { status: 500 })

		return NextResponse.json(updated?.[0] ?? null)
	} catch (err: unknown) {
		const m = err instanceof Error ? err.message : String(err)
		return new NextResponse(m, { status: 500 })
	}
}
