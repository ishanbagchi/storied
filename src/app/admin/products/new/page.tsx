import { FC } from 'react'
import PageHeader from '../../_components/PageHeader'
import ProductForm from '../_components/ProductForm'

interface Props {}

const NewProductPage: FC<Props> = ({}) => {
	return (
		<>
			<PageHeader>New Product</PageHeader>
			<ProductForm />
		</>
	)
}

export default NewProductPage
