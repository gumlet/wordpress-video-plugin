/**
 * WordPress REST proxy for Gumlet (API key stays server-side).
 */
import apiFetch from '@wordpress/api-fetch';

const REST_NS = 'gumlet-video/v1';

/**
 * @param {boolean} refresh Bypass workspace cache.
 */
export async function listWorkspaces( refresh = false ) {
	const path =
		REST_NS + '/workspaces' + ( refresh ? '?refresh=1' : '' );
	return apiFetch( { path } );
}

/**
 * Build path + query for GET assets list.
 *
 * @param {string} workspaceId
 * @param {Record<string, string>} query title, offset, size, sortBy, orderBy, status, type
 * @return {string}
 */
export function buildAssetListPath( workspaceId, query = {} ) {
	const params = new URLSearchParams( {
		workspace_id: workspaceId,
		...( query.title ? { title: query.title } : {} ),
		offset: query.offset !== undefined ? String( query.offset ) : '0',
		size: query.size !== undefined ? String( query.size ) : '32',
		...( query.sortBy ? { sortBy: query.sortBy } : {} ),
		...( query.orderBy ? { orderBy: query.orderBy } : {} ),
		...( query.status ? { status: query.status } : {} ),
		...( query.type ? { type: query.type } : {} ),
	} );
	return `${ REST_NS }/assets?${ params.toString() }`;
}

/**
 * @param {string} workspaceId
 * @param {Record<string, string>} query title, offset, size, sortBy, orderBy, status, type
 */
export async function listAssets( workspaceId, query = {} ) {
	return apiFetch( { path: buildAssetListPath( workspaceId, query ) } );
}

/**
 * @param {string} assetId
 */
export async function getAsset( assetId ) {
	const id = encodeURIComponent( assetId );
	return apiFetch( { path: `${ REST_NS }/assets/${ id }` } );
}

/**
 * Create direct upload on Gumlet; returns asset_id and upload_url for PUT.
 *
 * @param {object} payload workspace_id, title, tag?, format?
 */
export async function createUpload( payload ) {
	return apiFetch( {
		path: REST_NS + '/uploads',
		method: 'POST',
		data: payload,
	} );
}
