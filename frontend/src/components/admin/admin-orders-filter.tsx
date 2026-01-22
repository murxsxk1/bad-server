import { ordersActions, ordersSelector } from '@slices/orders'
import { useActionCreators, useDispatch, useSelector } from '@store/hooks'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { fetchOrdersWithFilters } from '../../services/slice/orders/thunk'
import { AppRoute } from '../../utils/constants'
import Filter from '../filter'
import styles from './admin.module.scss'
import { ordersFilterFields } from './helpers/ordersFilterFields'
import { StatusType } from '@types'

type SelectOption<T extends string = string> = {
    value: T
    label: string
}

type OrderFilters = {
    status?: SelectOption<StatusType> | null
    [key: string]: string | number | SelectOption | null | undefined
}

export default function AdminFilterOrders() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [, setSearchParams] = useSearchParams()

    const { updateFilter, clearFilters } = useActionCreators(ordersActions)
    const filterOrderOption = useSelector(ordersSelector.selectFilterOption)

    const handleFilter = (filters: OrderFilters) => {
        const status =
            filters.status && typeof filters.status === 'object'
                ? filters.status.value
                : undefined

        dispatch(
            updateFilter({
                ...filters,
                status,
            })
        )

        const queryParams: Record<string, string> = {}

        Object.entries(filters).forEach(([key, value]) => {
            if (!value) return

            if (typeof value === 'object' && 'value' in value) {
                queryParams[key] = String(value.value)
            } else {
                queryParams[key] = String(value)
            }
        })

        setSearchParams(queryParams)
        navigate(
            `${AppRoute.AdminOrders}?${new URLSearchParams(
                queryParams
            ).toString()}`
        )
    }

    const handleClearFilters = () => {
        dispatch(clearFilters())
        setSearchParams({})
        dispatch(fetchOrdersWithFilters({}))
        navigate(AppRoute.AdminOrders)
    }

    return (
        <>
            <h2 className={styles.admin__title}>Фильтры</h2>
            <Filter
                fields={ordersFilterFields}
                onFilter={handleFilter}
                onClear={handleClearFilters}
                defaultValue={filterOrderOption}
            />
        </>
    )
}
