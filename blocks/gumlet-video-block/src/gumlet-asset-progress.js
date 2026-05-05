/**
 * Gumlet asset status and when to show encode `progress` from the API.
 */

export function normalizeStatus( st ) {
	return String( st || '' ).toLowerCase();
}

/**
 * Statuses where Gumlet's `progress` reflects queue / transcode work.
 * Others (e.g. generating-subtitles) often stay at 0% and should not show a numeric percent.
 *
 * @param {string|undefined|null} status asset.status
 * @return {boolean}
 */
export function gumletStatusShowsEncodeProgress( status ) {
	const s = normalizeStatus( status );
	return (
		s === 'processing' ||
		s === 'queued' ||
		s === 'downloading' ||
		s === 'pre-processing' ||
		s === 'validating'
	);
}

/**
 * Raw progress 0..1 from asset (any status).
 *
 * @param {object|null|undefined} asset
 * @return {number|null}
 */
export function gumletProgressToFraction( asset ) {
	const p =
		asset?.progress != null
			? asset.progress
			: asset?.output?.progress != null
				? asset.output.progress
				: null;
	if ( p == null || Number.isNaN( Number( p ) ) ) {
		return null;
	}
	const n = Number( p );
	if ( n > 1 ) {
		return Math.min( 1, Math.max( 0, n / 100 ) );
	}
	return Math.min( 1, Math.max( 0, n ) );
}

/**
 * Progress 0..1 only for encode-relevant statuses; otherwise null.
 *
 * @param {object|null|undefined} asset
 * @return {number|null}
 */
export function gumletEncodeProgressFraction( asset ) {
	if ( ! gumletStatusShowsEncodeProgress( asset?.status ) ) {
		return null;
	}
	return gumletProgressToFraction( asset );
}
