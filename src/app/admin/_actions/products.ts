'use server'

import db from '@/db/db'
import { z } from 'zod'
import fs from 'fs/promises'
import { notFound, redirect } from 'next/navigation'

const fileSchema = z.instanceof(File, { message: 'Invalid file type' })
const imageSchema = fileSchema.refine(
	(file) => file.size === 0 || file.type.startsWith('image/'),
	'Invalid image type',
)

const addSchema = z.object({
	name: z.string().min(1),
	priceInRupees: z.coerce.number().int().positive().min(1),
	description: z.string().min(1),
	file: fileSchema.refine((file) => file.size > 0, 'Required'),
	image: imageSchema.refine((file) => file.size > 0, 'Required'),
})

export const addProduct = async (_prevState: unknown, formData: FormData) => {
	const result = addSchema.safeParse(Object.fromEntries(formData.entries()))
	if (!result.success) {
		return result.error.formErrors.fieldErrors
	}

	const data = result.data

	await fs.mkdir('products', { recursive: true })
	const filePath = `products/${crypto.randomUUID()}-${data.file.name}`
	await fs.writeFile(filePath, Buffer.from(await data.file.arrayBuffer()))

	await fs.mkdir('public/products', { recursive: true })
	const imagePath = `/products/${crypto.randomUUID()}-${data.image.name}`
	await fs.writeFile(
		`public${imagePath}`,
		Buffer.from(await data.image.arrayBuffer()),
	)

	await db.product.create({
		data: {
			isAvailableForPurchase: false,
			name: data.name,
			priceInRupees: data.priceInRupees,
			description: data.description,
			filePath,
			imagePath,
		},
	})

	redirect('/admin/products')
}

const editSchema = addSchema.extend({
	file: fileSchema.optional(),
	image: imageSchema.optional(),
})

export const updateProduct = async (
	id: string,
	_prevState: unknown,
	formData: FormData,
) => {
	const result = editSchema.safeParse(Object.fromEntries(formData.entries()))
	if (!result.success) {
		return result.error.formErrors.fieldErrors
	}

	const data = result.data
	const product = await db.product.findUnique({ where: { id } })

	if (!product) {
		return notFound()
	}

	let filePath = product.filePath
	if (data.file && data.file.size > 0) {
		await fs.unlink(product.filePath)
		filePath = `products/${crypto.randomUUID()}-${data.file.name}`
		await fs.writeFile(filePath, Buffer.from(await data.file.arrayBuffer()))
	}

	let imagePath = product.imagePath
	if (data.image && data.image.size > 0) {
		await fs.unlink(`public${product.imagePath}`)
		imagePath = `/products/${crypto.randomUUID()}-${data.image.name}`
		await fs.writeFile(
			`public${imagePath}`,
			Buffer.from(await data.image.arrayBuffer()),
		)
	}

	await db.product.update({
		where: { id },
		data: {
			name: data.name,
			priceInRupees: data.priceInRupees,
			description: data.description,
			filePath,
			imagePath,
		},
	})

	redirect('/admin/products')
}

export const toggleProductAvailability = async (
	id: string,
	isAvailableForPurchase: boolean,
) => {
	await db.product.update({
		where: { id },
		data: { isAvailableForPurchase },
	})
}

export const deleteProduct = async (id: string) => {
	const product = await db.product.delete({ where: { id } })

	if (!product) {
		return notFound()
	}

	await fs.unlink(product.filePath)
	await fs.unlink(`public${product.imagePath}`)
}
