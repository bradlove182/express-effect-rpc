import { Effect } from "effect"
import { apiClient } from "catalog-core"

export function useApiClient() {

    let client = $state<Effect.Success<typeof apiClient>>(Effect.runSync(apiClient))

    return {
        client
    }
}
