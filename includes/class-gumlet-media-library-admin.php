<?php
/**
 * Media → Gumlet Video Library admin screen.
 *
 * @package Gumlet_Video
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers submenu and scripts.
 */
class Gumlet_Media_Library_Admin {

	/**
	 * Hook registration.
	 */
	public static function init() {
		add_action( 'admin_menu', array( __CLASS__, 'register_menu' ) );
		add_action( 'admin_enqueue_scripts', array( __CLASS__, 'enqueue_media_library' ), 10 );
		add_action( 'admin_enqueue_scripts', array( __CLASS__, 'enqueue_new_post_asset' ), 20 );
	}

	/**
	 * Media submenu (same capability as REST proxy).
	 */
	public static function register_menu() {
		add_submenu_page(
			'upload.php',
			__( 'Gumlet Video Library', 'gumlet-video' ),
			__( 'Gumlet Video Library', 'gumlet-video' ),
			'manage_options',
			'gumlet-video-library',
			array( __CLASS__, 'render_page' )
		);
	}

	/**
	 * Render root mount + intro (React fills the grid).
	 */
	public static function render_page() {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'You do not have permission to access this page.', 'gumlet-video' ) );
		}
		echo '<div class="wrap gumlet-video-library-wrap">';
		echo '<h1>' . esc_html__( 'Gumlet Video Library', 'gumlet-video' ) . '</h1>';
		echo '<p class="description">' . esc_html__(
			'Browse and upload video or audio to your Gumlet account, then start a new post with a selected asset.',
			'gumlet-video'
		) . '</p>';
		echo '<div id="gumlet-media-library-root"></div>';
		echo '</div>';
	}

	/**
	 * Enqueue built admin app on our screen only.
	 *
	 * @param string $hook_suffix Current admin page.
	 */
	public static function enqueue_media_library( $hook_suffix ) {
		if ( 'media_page_gumlet-video-library' !== $hook_suffix ) {
			return;
		}

		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		$path = GUMLET_VIDEO_PLUGIN_DIR . 'blocks/gumlet-video-block/build/media-library.js';

		if ( ! is_readable( $path ) ) {
			return;
		}

		$script_url = plugins_url(
			'blocks/gumlet-video-block/build/media-library.js',
			GUMLET_VIDEO_PLUGIN_FILE
		);

		$asset_file = GUMLET_VIDEO_PLUGIN_DIR . 'blocks/gumlet-video-block/build/media-library.asset.php';
		$asset      = is_readable( $asset_file ) ? require $asset_file : array(
			'dependencies' => array(),
			'version'      => GUMLET_PLUGIN_VERSION,
		);

		wp_enqueue_script(
			'gumlet-media-library',
			$script_url,
			$asset['dependencies'],
			$asset['version'],
			true
		);

		// Ensure @wordpress/components controls (buttons, selects, etc.) are styled
		// on this standalone admin page across WordPress environments.
		wp_enqueue_style( 'wp-components' );

		wp_localize_script(
			'gumlet-media-library',
			'gumletMediaLibrary',
			array(
				'restRoot'     => esc_url_raw( rest_url() ),
				'nonce'        => wp_create_nonce( 'wp_rest' ),
				'newPostUrl'   => esc_url_raw( admin_url( 'post-new.php' ) ),
				'settingsUrl'  => esc_url_raw( admin_url( 'options-general.php?page=gumlet-video-options' ) ),
				'strings'      => array(
					'copied' => __( 'Asset ID copied to clipboard.', 'gumlet-video' ),
				),
			)
		);
	}

	/**
	 * When opening post-new.php?gumlet_asset_id=…, insert Gumlet block once.
	 *
	 * @param string $hook_suffix Current admin page.
	 */
	public static function enqueue_new_post_asset( $hook_suffix ) {
		// Only empty editor: avoid inserting a block when editing an existing post with a stray query arg.
		if ( 'post-new.php' !== $hook_suffix ) {
			return;
		}
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}
		$gumlet_raw = filter_input( INPUT_GET, 'gumlet_asset_id', FILTER_DEFAULT );
		if ( ! is_string( $gumlet_raw ) ) {
			return;
		}
		$id = sanitize_text_field( $gumlet_raw );
		if ( '' === $id ) {
			return;
		}

		$js = sprintf(
			'(function(){var assetId=%1$s;if(!assetId||typeof wp==="undefined")return;wp.domReady(function(){setTimeout(function(){if(!wp.blocks||!wp.data||!wp.data.dispatch("core/block-editor"))return;var b=wp.blocks.createBlock("gumlet/gumlet-video-block",{id:assetId});wp.data.dispatch("core/block-editor").insertBlocks(b,0);try{var u=new URL(window.location.href);u.searchParams.delete("gumlet_asset_id");window.history.replaceState({},"",u.toString());}catch(e){}},150);});})();',
			wp_json_encode( $id )
		);

		wp_register_script(
			'gumlet-new-post-asset',
			false,
			array( 'wp-blocks', 'wp-data', 'wp-dom-ready', 'wp-edit-post' ),
			GUMLET_PLUGIN_VERSION,
			true
		);
		wp_enqueue_script( 'gumlet-new-post-asset' );
		wp_add_inline_script( 'gumlet-new-post-asset', $js );
	}
}
