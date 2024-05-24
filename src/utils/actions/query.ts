// import { SET_QUERY } from "utils/reducers/query.reducer";

// export const setQuery = (query: QueryHistoryItem) => ({ type: SET_QUERY, payload: query })
import { AbsoluteTimeRange } from '@grafana/data';
import { create } from 'zustand'
export interface QueryStore extends QueryItem {
    setQuery: (query: QueryItem) => void
}
export interface QueryItem {
    query: string;
    timeRange?: AbsoluteTimeRange
    values?: Values
}
interface Values {
    [key: string]: Value[] | string
}
interface Value {
    value: string
    label: string
}
export const useQueryStore = create<QueryStore>((set) => ({
    query: '',
    timeRange: {
        from: Date.now() - 1000 * 60 * 15, // Default to now-15m 
        to: Date.now()
    },
    setQuery: (query: QueryItem) => set((state) => ({ ...state, ...query })),
}))
