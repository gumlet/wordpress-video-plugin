/**
 * Shared helpers for Gumlet asset list UIs (block modal + Media admin).
 *
 * @param {object} asset Gumlet asset object.
 * @return {string}
 */
export function assetThumb( asset ) {
	const urls = asset?.output?.thumbnail_url;
	if ( Array.isArray( urls ) && urls.length ) {
		return urls[ 0 ];
	}
	return '';
}

/**
 * @param {object} asset Gumlet asset object.
 * @return {string}
 */
export function assetTitle( asset ) {
	const t = asset?.input?.title;
	if ( t && String( t ).trim() ) {
		return String( t ).trim();
	}
	return asset?.asset_id || '';
}
