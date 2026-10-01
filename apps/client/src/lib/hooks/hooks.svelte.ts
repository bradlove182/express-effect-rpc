import { Array, Duration, Effect, Fiber, pipe, Queue, Stream, Struct } from "effect"
import { apiClient, CatalogQuery } from "catalog-core"
import { onDestroy, tick } from "svelte"
import { goto } from "$app/navigation"
import { page } from "$app/state"

export function useApiClient() {

    let client = $state<Effect.Success<typeof apiClient>>(Effect.runSync(apiClient))

    return {
        client
    }
}

/**
 * A reactive hook that syncs an object's state with URL search parameters.
 * Automatically updates the URL query string when the state object changes.
 * Uses goto.replace to update the URL without adding to browser history.
 *
 * @param getter - A function that returns an object containing the search parameters to sync with URL
 * @example
 * const searchParams = $state({ query: 'test', page: '1' });
 * useSearchParams(() => searchParams);
 * // URL updates to "?query=test&page=1"
 */
export function useSearchParams<T extends CatalogQuery>(getter: () => T) {
    const state = $derived.by(() => {
        // We strip Effect _tags here so they do not show up in the url params
        const { _tag, ...current} = getter()

        return pipe(
            Struct.keys(current),
            Array.reduce({} as Record<string, string>, (acc, key) => {
                if (current[key] === undefined) {
                    return acc
                }
                acc[key] = JSON.stringify(current[key])
                return acc
            }),
        )
    })

    let hasSynced = false

    $effect(() => {
        const params = new URLSearchParams()
        for (const key of Struct.keys(state)) {
            params.set(key, state[key])
        }

        const search = params.toString()

        // The first run is an empty query, before the URL is read back into state.
        if (!hasSynced) {
            hasSynced = true
            if (search === "") {
                return
            }
        }

        if (search === page.url.searchParams.toString()) {
            return
        }

        void tick().then(() => {
            // Not a hand-written route string for `resolve()` to check —
            // this only ever echoes back the current page's own
            // (already-resolved) pathname with an updated query string.
            void goto(
                search.length > 0 ? `${page.url.pathname}?${search}` : page.url.pathname,
                {
                    state: page.state,
                    shallow: true,
                    replace: true
                }
            )
        })
    })

    const getParam = (key: keyof T): T[keyof T] | undefined => {
        const value = page.url.searchParams.get(key.toString())
        return value ? JSON.parse(value) : undefined
    }

    return {
        getParam,
    }
}

export function useDebounce<A, E>(
    f: (a: A) => Effect.Effect<void, E>,
    delay: Duration.Input,
): (a: A) => void {
    const queue = Effect.runSync(Queue.make<A>());
    const fiber = Effect.runFork(
        Stream.fromQueue(queue).pipe(
            Stream.debounce(delay),
            Stream.runForEach(f),
        ),
    );

    onDestroy(() => {
        Effect.runFork(Fiber.interrupt(fiber));
    });

    return (a) => {
        Effect.runSync(Queue.offer(queue, a));
    };
}
