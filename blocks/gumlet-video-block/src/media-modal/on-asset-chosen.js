/**
 * Handle Gumlet asset selection from the wp.media modal tab.
 */
import { createBlock, getBlockType } from '@wordpress/blocks';
import { dispatch, select } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';

const BLOCK_NAME = 'gumlet/gumlet-video-block';

/**
 * True when this screen has a live block editor that can accept our block.
 * select('core/block-editor') can be truthy on other admin screens (e.g. LifterLMS)
 * after wp-blocks/wp-data load, but block types are not registered there.
 * createBlock() then recurses on core/missing and overflows the stack.
 *
 * @return {{ select: object, dispatch: object }|null}
 */
function getLiveBlockEditor() {
	if ( typeof getBlockType !== 'function' || ! getBlockType( BLOCK_NAME ) ) {
		return null;
	}

	try {
		const editorSelect = select( 'core/block-editor' );
		const editorDispatch = dispatch( 'core/block-editor' );
		if (
			typeof editorSelect?.getSelectedBlockClientId !== 'function' ||
			typeof editorDispatch?.insertBlocks !== 'function'
		) {
			return null;
		}
		return { select: editorSelect, dispatch: editorDispatch };
	} catch ( e ) {
		return null;
	}
}

/**
 * @param {string} assetId
 * @return {string}
 */
function gumletShortcode( assetId ) {
	return '[gumlet id=' + assetId + ']';
}

/**
 * Insert into TinyMCE / classic / plugin editors that hook send_to_editor.
 *
 * @param {string} assetId
 * @return {boolean}
 */
function insertIntoTextEditor( assetId ) {
	const shortcode = gumletShortcode( assetId );
	if ( typeof window.send_to_editor === 'function' ) {
		window.send_to_editor( shortcode );
		return true;
	}
	if ( window.wp?.media?.editor?.insert ) {
		window.wp.media.editor.insert( shortcode );
		return true;
	}
	return false;
}

/**
 * Fallback when no editor can receive the video.
 *
 * @param {string} assetId
 */
function showNewPostNotice( assetId ) {
	const config =
		typeof window !== 'undefined' ? window.gumletMediaModal || {} : {};
	const newPostBase = config.newPostUrl || '/wp-admin/post-new.php';
	const separator = newPostBase.includes( '?' ) ? '&' : '?';
	const newPostUrl =
		newPostBase +
		separator +
		'gumlet_asset_id=' +
		encodeURIComponent( assetId );

	const message = document.createElement( 'div' );
	message.className = 'notice notice-success gumlet-media-modal-notice';
	message.style.margin = '12px 0 0';

	const paragraph = document.createElement( 'p' );
	const label = document.createElement( 'strong' );
	label.textContent = sprintf(
		/* translators: %s: Gumlet asset ID */
		__( 'Gumlet asset selected: %s', 'gumlet-video' ),
		assetId
	);
	paragraph.appendChild( label );
	paragraph.appendChild( document.createTextNode( ' ' ) );

	const link = document.createElement( 'a' );
	link.href = newPostUrl;
	link.textContent = __( 'New post with this video', 'gumlet-video' );
	paragraph.appendChild( link );
	message.appendChild( paragraph );

	const mount = document.querySelector( '.gumlet-media-modal-tab-panel' );
	if ( mount ) {
		mount.appendChild( message );
	}
}

/**
 * @param {object|null} frame wp.media frame instance to close.
 * @param {number} [delay]
 */
function closeFrame( frame, delay = 0 ) {
	if ( ! frame || typeof frame.close !== 'function' ) {
		return;
	}
	if ( delay > 0 ) {
		setTimeout( () => frame.close(), delay );
		return;
	}
	frame.close();
}

/**
 * @param {string} assetId Gumlet asset id.
 * @param {object|null} frame wp.media frame instance to close.
 */
export default function onAssetChosen( assetId, frame ) {
	if ( ! assetId ) {
		return;
	}

	const editor = getLiveBlockEditor();
	if ( editor ) {
		const clientId = editor.select.getSelectedBlockClientId();
		const block = clientId ? editor.select.getBlock( clientId ) : null;

		if (
			block &&
			block.name === BLOCK_NAME &&
			! block.attributes?.id
		) {
			editor.dispatch.updateBlockAttributes( clientId, {
				id: assetId,
			} );
		} else {
			editor.dispatch.insertBlocks(
				createBlock( BLOCK_NAME, { id: assetId } )
			);
		}

		closeFrame( frame );
		return;
	}

	if ( insertIntoTextEditor( assetId ) ) {
		closeFrame( frame );
		return;
	}

	showNewPostNotice( assetId );
	closeFrame( frame, 1500 );
}
