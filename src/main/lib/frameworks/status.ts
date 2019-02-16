import { uniq } from 'lodash'

export type Status = 'queued' | 'running' | 'passed' | 'failed' | 'incomplete' | 'skipped' | 'warning' | 'partial' | 'empty' | 'idle'

export type FrameworkStatus = Status | 'refreshing' | 'error'

/**
 * Compute an overarching generic status based on a set of statuses.
 *
 * @param components An array of statuses with which to compute the final one.
 */
export function parseStatus (components: Array<Status>): Status {
    if (!components.length) {
        return 'empty'
    }

    // Exclude empty status before parsing all parts (e.g. all idle parts with
    // the occasional empty part should result in idle status, not partial).
    // We assume, therefore, than an empty part has no effect on the total
    // result. This goes against assuming empty parts should trigger a warning.
    components = components.filter(component => component !== 'empty')

    components = uniq(components)
    if (components.length === 1) {
        return components[0]
    }

    if (components.includes('failed')) {
        return 'failed'
    }

    if (components.includes('warning')) {
        return 'warning'
    }

    if (components.includes('incomplete')) {
        return 'incomplete'
    }

    // If there are mixed queued and non-queued components, we'll consider the
    // final status as running, assuming this is transient because the status
    // will update again until queued components are run or process is stopped,
    // in which case we'll manually change from running to something else.
    if (components.includes('queued')) {
        return 'running'
    }

    return 'partial'
}

/**
 * Compute an overarching framework status based on a set of statuses. This
 * differs slightly from @parseStatus only because frameworks support a few
 * additional statuses.
 *
 * @param components An array of statuses with which to compute the final one.
 */
export function parseFrameworkStatus (components: Array<FrameworkStatus>): FrameworkStatus {
    if (!components.length) {
        return 'empty'
    }

    components = uniq(components)
    if (components.length === 1) {
        return components[0]
    }

    if (components.includes('running')) {
        return 'running'
    }

    if (components.includes('error')) {
        return 'error'
    }

    if (components.includes('refreshing')) {
        return 'refreshing'
    }

    return parseStatus(components as Array<Status>)
}
