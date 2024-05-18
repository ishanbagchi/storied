import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import db from '@/db/db'
import { formatCurrency, formatNumber } from '@/lib/formatters'

const getSalesData = async () => {
	const data = await db.order.aggregate({
		_sum: {
			priceInRupees: true,
		},
		_count: true,
	})

	return {
		amount: data._sum.priceInRupees || 0,
		numberOfSales: data._count,
	}
}

const getUserData = async () => {
	const [userCount, orderData] = await Promise.all([
		db.user.count(),
		db.order.aggregate({
			_sum: {
				priceInRupees: true,
			},
		}),
	])

	const averageOrderValue =
		userCount === 0 ? 0 : (orderData._sum.priceInRupees || 0) / userCount

	return {
		userCount,
		averageOrderValue,
	}
}

const getProductsData = async () => {
	const [activeCount, inactiveCount] = await Promise.all([
		await db.product.count({
			where: {
				isAvailableForPurchase: true,
			},
		}),
		await db.product.count({
			where: {
				isAvailableForPurchase: false,
			},
		}),
	])

	return {
		activeCount,
		inactiveCount,
	}
}

export default async function AdminDashboard() {
	const [salesData, userData, productsData] = await Promise.all([
		getSalesData(),
		getUserData(),
		getProductsData(),
	])

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			<DashboardCard
				title="Sales"
				subtitle={`${formatNumber(salesData.numberOfSales)} Orders`}
				body={formatCurrency(salesData.amount)}
			/>
			<DashboardCard
				title="Customers"
				subtitle={`${formatCurrency(
					userData.averageOrderValue,
				)} Average Value`}
				body={formatNumber(userData.userCount)}
			/>
			<DashboardCard
				title="Active Products"
				subtitle={`${formatNumber(
					productsData.inactiveCount,
				)} Inactive`}
				body={formatNumber(productsData.activeCount)}
			/>
		</div>
	)
}

type DashboardCardProps = {
	title: string
	subtitle: string
	body: string
}

function DashboardCard({ title, subtitle, body }: DashboardCardProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				<CardDescription>{subtitle}</CardDescription>
			</CardHeader>
			<CardContent>{body}</CardContent>
		</Card>
	)
}
