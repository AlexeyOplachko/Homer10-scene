import { AbsoluteTimeRange } from "@grafana/data";
import { create } from 'zustand';
import { QueryItem } from "./query";


export interface QueryHistoryStore {
    queryHistory: QueryItem[]
    setQueryHistory: (query: QueryItem[]) => void
    addToQueryHistory: (query: QueryItem) => void
    setTimeRangeForLastQuery: (timeRange: AbsoluteTimeRange) => void
}

export const useQueryHistoryStore = create<QueryHistoryStore>((set) => ({
    queryHistory: [],
    setQueryHistory: (queryHistory: QueryItem[]) => set({ queryHistory: queryHistory }),
    addToQueryHistory: (query: QueryItem) => set((state) => ({ queryHistory: addToQueryHistory(state.queryHistory, query) })),
    setTimeRangeForLastQuery: (timeRange: AbsoluteTimeRange) => set((state) => ({ queryHistory: setTimeRangeForLastQuery(state.queryHistory, timeRange) }))
}))

const addToQueryHistory = (state: QueryItem[], query: QueryItem) => {
    if (state.length >= 10) {
        const newQueryHistory = structuredClone(state)
        newQueryHistory.pop()
        return [query, ...newQueryHistory]

    } else {
        return [query, ...state]
    }
}

const setTimeRangeForLastQuery = (state: QueryItem[], timeRange: AbsoluteTimeRange) => {
    if (state.length > 0) {
        const newQueryHistory = structuredClone(state)
        newQueryHistory[0].timeRange = timeRange
        return newQueryHistory
    } else {
        return state
    }
}
