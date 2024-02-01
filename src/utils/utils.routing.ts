import { PLUGIN_BASE_URL } from '../constants';

/**
 * Prefixes the route with the base URL of the plugin
 * @param route - The route to be prefixed
 * @returns The prefixed route
 */
export function prefixRoute(route: string): string {
    return `${PLUGIN_BASE_URL}/${route}`;
}
