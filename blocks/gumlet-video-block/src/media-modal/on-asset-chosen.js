/**
 * Handle Gumlet asset selection from the wp.media modal tab.
 */
import { createBlock } from '@wordpress/blocks';
import { dispatch, select } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';

/**
 * @param {string} assetId Gumlet asset id.
 * @param {object|null} frame wp.media frame instance to close.
 */
export default function onAssetChosen( assetId, frame ) {
	if ( ! assetId ) {
		return;
	}

	const blockEditorStore = 'core/block-editor';
	let blockEditorDispatch = null;
	let blockEditorSelect = null;

	try {
		blockEditorDispatch = dispatch( blockEditorStore );
		blockEditorSelect = select( blockEditorStore );
	} catch ( e ) {
		blockEditorDispatch = null;
		blockEditorSelect = null;
	}

	if ( blockEditorDispatch && blockEditorSelect ) {
		const clientId = blockEditorSelect.getSelectedBlockClientId();
		const block = clientId ? blockEditorSelect.getBlock( clientId ) : null;

		if (
			block &&
			block.name === 'gumlet/gumlet-video-block' &&
			! block.attributes?.id
		) {
			blockEditorDispatch.updateBlockAttributes( clientId, {
				id: assetId,
			} );
		} else {
			const newBlock = createBlock( 'gumlet/gumlet-video-block', {
				id: assetId,
			} );
			blockEditorDispatch.insertBlocks( newBlock );
		}

		if ( frame && typeof frame.close === 'function' ) {
			frame.close();
		}
		return;
	}

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

	if ( frame && typeof frame.close === 'function' ) {
		setTimeout( () => frame.close(), 1500 );
	}
}
