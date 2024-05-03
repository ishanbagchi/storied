import { FC } from 'react'

interface Props {
	children: React.ReactNode
}

const PageHeader: FC<Props> = ({ children }) => {
	return <h1 className="text-4xl mb-4 ">{children}</h1>
}

export default PageHeader
