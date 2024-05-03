'use server'

import db from '@/db/db'
import { z } from 'zod'
import fs from 'fs/promises'
import { redirect } from 'next/navigation'

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

export const addProduct = async (prevState: unknown, formData: FormData) => {
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

	db.product.create({
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
