'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { formatCurrency } from '@/lib/formatters'
import { FC, useState } from 'react'
import { addProduct, updateProduct } from '../../_actions/products'
import { useFormState, useFormStatus } from 'react-dom'
import { Product } from '@prisma/client'
import Image from 'next/image'

interface Props {
	product?: Product
}

const ProductForm: FC<Props> = ({ product }) => {
	const [error, action] = useFormState(
		!product ? addProduct : updateProduct.bind(null, product.id),
		{},
	)
	const [priceInRupees, setPriceInRupees] = useState<number | undefined>(
		product?.priceInRupees,
	)

	return (
		<form action={action} className="space-y-8">
			<div className="space-y-2">
				<Label htmlFor="name">Name</Label>
				<Input
					type="text"
					id="name"
					name="name"
					required
					defaultValue={product?.name || ''}
				/>
				{error.name ? (
					<div className="text-destructive text-red-500">
						{error.name}
					</div>
				) : null}
			</div>
			<div className="space-y-2">
				<Label htmlFor="priceInRupees">Price</Label>
				<Input
					type="number"
					id="priceInRupees"
					name="priceInRupees"
					required
					value={priceInRupees}
					onChange={(e) =>
						setPriceInRupees(Number(e.target.value) || undefined)
					}
				/>
				<div className="text-muted-foreground">
					{formatCurrency(priceInRupees || 0)}
				</div>
				{error.priceInRupees ? (
					<div className="text-destructive text-red-500">
						{error.priceInRupees}
					</div>
				) : null}
			</div>
			<div className="space-y-2">
				<Label htmlFor="description">Description</Label>
				<Textarea
					id="description"
					name="description"
					required
					defaultValue={product?.description || ''}
				/>
				{error.description ? (
					<div className="text-destructive text-red-500">
						{error.description}
					</div>
				) : null}
			</div>
			<div className="space-y-2">
				<Label htmlFor="file">File</Label>
				<Input type="file" id="file" name="file" required={!product} />
				{product ? (
					<div className="text-muted-foreground">
						{product.filePath}
					</div>
				) : null}
				{error.file ? (
					<div className="text-destructive text-red-500">
						{error.file}
					</div>
				) : null}
			</div>
			<div className="space-y-2">
				<Label htmlFor="image">Image</Label>
				<Input
					type="file"
					id="image"
					name="image"
					required={!product}
				/>
				{product ? (
					<Image
						src={product.imagePath}
						className="text-muted-foreground"
						width={200}
						height={200}
						alt={product.name}
					/>
				) : null}
				{error.image ? (
					<div className="text-destructive text-red-500">
						{error.image}
					</div>
				) : null}
			</div>
			<SubmitButton />
		</form>
	)
}

const SubmitButton = () => {
	const { pending } = useFormStatus()
	return (
		<Button type="submit" disabled={pending}>
			{pending ? 'Saving...' : 'Save'}
		</Button>
	)
}

export default ProductForm
