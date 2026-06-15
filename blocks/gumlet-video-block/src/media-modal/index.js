/**
 * Adds a Gumlet Video tab to the native WordPress media modal (wp.media).
 */
import { createRoot } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import GumletTabPanel from './gumlet-tab-panel';
import onAssetChosen from './on-asset-chosen';

const TAB_ID = 'gumletVideo';
const TAB_PRIORITY = 35;

/** @type {Map<object, import('react-dom/client').Root>} */
const frameRoots = new WeakMap();

let patched = false;

/**
 * @param {object} frame wp.media frame.
 */
function unmountFrameRoot( frame ) {
	const root = frameRoots.get( frame );
	if ( root ) {
		root.unmount();
		frameRoots.delete( frame );
	}
}

/**
 * @param {object} frame wp.media frame.
 */
function renderGumletTab( frame ) {
	unmountFrameRoot( frame );

	const GumletContent = wp.Backbone.View.extend( {
		tagName: 'div',
		className: 'gumlet-media-modal-tab attachments-browser',
		render() {
			this.el.innerHTML = '<div class="gumlet-media-modal-mount"></div>';
			return this;
		},
	} );

	const view = new GumletContent();
	frame.content.set( view );

	const mountNode = view.el.querySelector( '.gumlet-media-modal-mount' );
	if ( ! mountNode ) {
		return;
	}

	const root = createRoot( mountNode );
	frameRoots.set( frame, root );

	root.render(
		<GumletTabPanel
			onAssetChosen={ ( assetId ) => onAssetChosen( assetId, frame ) }
		/>
	);
}

/**
 * Bind Gumlet tab handlers on a single frame instance.
 *
 * @param {object} frame wp.media frame.
 */
function bindFrameInstance( frame ) {
	if ( frame.__gumletTabBound ) {
		return;
	}
	frame.__gumletTabBound = true;

	frame.states.add( [
		new wp.media.controller.State( {
			id: TAB_ID,
			title: __( 'Gumlet Video', 'gumlet-video' ),
			priority: TAB_PRIORITY,
		} ),
	] );

	frame.on( 'content:render:' + TAB_ID, () => {
		renderGumletTab( frame );
	} );

	frame.on( 'close', () => {
		unmountFrameRoot( frame );
	} );

	frame.on( 'content:render', () => {
		const mode = frame.content.mode();
		if ( mode && mode !== TAB_ID ) {
			unmountFrameRoot( frame );
		}
	} );
}

/**
 * Resolve a nested property path such as "MediaFrame.Select".
 *
 * @param {object} root     Root object, e.g. wp.media.view.
 * @param {string} path     Dot-separated path.
 * @return {*|undefined}
 */
function getNestedClass( root, path ) {
	return path.split( '.' ).reduce( ( obj, key ) => obj?.[ key ], root );
}

/**
 * Patch a MediaFrame subclass prototype (Select, Post, etc.).
 *
 * @param {string} frameKey Dot path on wp.media.view, e.g. MediaFrame.Select.
 */
function patchMediaFramePrototype( frameKey ) {
	const FrameClass = getNestedClass( wp.media.view, frameKey );
	if ( ! FrameClass?.prototype || FrameClass.__gumletPatched ) {
		return false;
	}

	const originalInitialize = FrameClass.prototype.initialize;
	const originalBrowseRouter = FrameClass.prototype.browseRouter;

	FrameClass.prototype.initialize = function initialize( ...args ) {
		originalInitialize.apply( this, args );
		bindFrameInstance( this );
	};

	if ( originalBrowseRouter ) {
		FrameClass.prototype.browseRouter = function browseRouter(
			routerView
		) {
			originalBrowseRouter.apply( this, arguments );
			routerView.set( {
				[ TAB_ID ]: {
					text: __( 'Gumlet Video', 'gumlet-video' ),
					priority: TAB_PRIORITY,
				},
			} );
		};
	}

	FrameClass.__gumletPatched = true;
	return true;
}

/**
 * Patch wp.media frame classes once they are available.
 *
 * @return {boolean} True when at least one frame class was patched.
 */
function patchMediaFrames() {
	if ( patched || ! window.wp?.media?.view ) {
		return patched;
	}

	const frameKeys = [
		'MediaFrame.Select',
		'MediaFrame.Post',
		'MediaFrame.MediaLibrary',
	];

	let didPatch = false;
	for ( const frameKey of frameKeys ) {
		if ( patchMediaFramePrototype( frameKey ) ) {
			didPatch = true;
		}
	}

	if ( didPatch ) {
		patched = true;
		wrapWpMediaFactory();
	}

	return patched;
}

/**
 * Ensure frames are patched right before wp.media() creates one.
 */
function wrapWpMediaFactory() {
	const media = window.wp?.media;
	if ( ! media || media.__gumletWrapped ) {
		return;
	}

	const factory =
		typeof media === 'function' ? media : media.constructor || null;
	if ( typeof factory !== 'function' ) {
		return;
	}

	const originalMedia = factory;
	const wrappedMedia = function wrappedMedia( ...args ) {
		patchMediaFrames();
		return originalMedia.apply( this, args );
	};

	Object.assign( wrappedMedia, originalMedia );
	wrappedMedia.__gumletWrapped = true;

	window.wp.media = wrappedMedia;
}

function initGumletMediaModal() {
	if ( patchMediaFrames() ) {
		return;
	}

	let attempts = 0;
	const timer = window.setInterval( () => {
		attempts += 1;
		if ( patchMediaFrames() || attempts >= 50 ) {
			window.clearInterval( timer );
		}
	}, 200 );
}

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', initGumletMediaModal );
} else {
	initGumletMediaModal();
}

window.addEventListener( 'load', initGumletMediaModal );
