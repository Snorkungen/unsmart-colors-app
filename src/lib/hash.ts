// Snorkungen 2022
/*
    Encode JSON into hash 

    getters - 
        data - get deSerialized data

    methods -
        update - update data stored on hash
        delete - delete data stored on hash
        subscribe - store function that will be called on update
        unsubscribe - removes function
*/

export type HashSubscriberFunc<T> = (data: T | undefined) => void;

export type HashConfig<T> = {
    serialize(data: T): string
    deSerialize(data: string): T;
}

const DEFAULT_HASH_CONFIG: HashConfig<any> = {
    serialize: (data) => JSON.stringify(data),
    deSerialize: (data) => JSON.parse(data)
}

export default function useHash<T>({
    serialize,
    deSerialize
}: HashConfig<T> = DEFAULT_HASH_CONFIG) {
    if (typeof window == "undefined") {
        throw new Error("Window is undefined.")
    }

    const subscribers: Array<HashSubscriberFunc<T>> = [];

    const dispatch = (data: T | undefined): void => {
        for (let subscriber of subscribers) {
            subscriber(data);
        }
    }

    const getData = (): T | undefined => {
        try {
            return deSerialize(decodeURIComponent(window.location.hash.substring(1)));
        } catch (error) { return undefined; }
    }

    window.addEventListener("hashchange", (e) => dispatch(getData()))

    return {
        get data(): T | undefined { return getData(); },
        update(data: T): void {
            window.location.hash = serialize(data);
        },
        delete(): void {
            window.location.hash = ""
        },
        subscribe(subscriber: HashSubscriberFunc<T>): number {
            return subscribers.push(subscriber);
        },
        unSubscribe(subscriberIdx: number): boolean {
            return delete subscribers[subscriberIdx - 1];
        }
    }
}