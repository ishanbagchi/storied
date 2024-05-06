import { FC } from 'react'
import PageHeader from '../../../_components/PageHeader'
import ProductForm from '../../_components/ProductForm'
import db from '@/db/db'

interface Props {
	params: {
		id: string
	}
}

const NewProductPage: FC<Props> = async ({ params: { id } }) => {
	const product = await db.product.findUnique({
		where: { id },
	})

	return (
		<>
			<PageHeader>Edit Product</PageHeader>
			<ProductForm product={product || undefined} />
		</>
	)
}

export default NewProductPage
