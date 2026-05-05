/**
 * Client-side checks for Gumlet direct uploads (video + audio only).
 */
import { __ } from '@wordpress/i18n';

/** HTML file input `accept` value for picker filtering. */
export const GUMLET_UPLOAD_ACCEPT = 'video/*,audio/*';

const ALLOWED_EXT = new Set( [
	'mp4',
	'webm',
	'mov',
	'mkv',
	'avi',
	'm4v',
	'wmv',
	'ogv',
	'mp3',
	'wav',
	'aac',
	'm4a',
	'ogg',
	'oga',
	'flac',
	'opus',
	'caf',
] );

/**
 * @param {File|undefined|null} file
 * @return {boolean}
 */
export function isAllowedGumletUploadFile( file ) {
	if ( ! file || typeof file !== 'object' ) {
		return false;
	}
	const type = String( file.type || '' ).toLowerCase();
	if ( type.startsWith( 'video/' ) || type.startsWith( 'audio/' ) ) {
		return true;
	}
	const name = String( file.name || '' );
	const m = name.match( /\.([a-z0-9]+)$/i );
	if ( m && ALLOWED_EXT.has( m[ 1 ].toLowerCase() ) ) {
		return true;
	}
	return false;
}

/**
 * @return {string} Localized error for disallowed file types.
 */
export function getInvalidGumletUploadTypeMessage() {
	return __(
		'Please choose a video or audio file.',
		'gumlet-video'
	);
}
