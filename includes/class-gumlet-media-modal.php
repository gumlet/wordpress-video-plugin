<?php
/**
 * Enqueue Gumlet tab extension for the native wp.media modal.
 *
 * @package Gumlet_Video
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers scripts for wp.media Gumlet tab.
 */
class Gumlet_Media_Modal {

	/**
	 * Hook registration.
	 */
	public static function init() {
		add_action( 'enqueue_block_editor_assets', array( __CLASS__, 'enqueue' ) );
		add_action( 'admin_enqueue_scripts', array( __CLASS__, 'enqueue' ) );
	}

	/**
	 * Whether the current user may use Gumlet API features.
	 *
	 * @return bool
	 */
	protected static function should_enqueue() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return false;
		}

		return '' !== Gumlet_API_Client::get_api_key();
	}

	/**
	 * Enqueue media-modal script when API key is configured.
	 */
	public static function enqueue() {
		if ( ! self::should_enqueue() ) {
			return;
		}

		$path = GUMLET_VIDEO_PLUGIN_DIR . 'blocks/gumlet-video-block/build/media-modal.js';

		if ( ! is_readable( $path ) ) {
			return;
		}

		wp_enqueue_media();

		$script_url = plugins_url(
			'blocks/gumlet-video-block/build/media-modal.js',
			GUMLET_VIDEO_PLUGIN_FILE
		);

		$asset_file = GUMLET_VIDEO_PLUGIN_DIR . 'blocks/gumlet-video-block/build/media-modal.asset.php';
		$asset      = is_readable( $asset_file ) ? require $asset_file : array(
			'dependencies' => array(),
			'version'      => GUMLET_PLUGIN_VERSION,
		);

		$dependencies = array_merge(
			$asset['dependencies'],
			array(
				'media-models',
				'media-views',
				'wp-edit-post',
			)
		);

		wp_enqueue_script(
			'gumlet-media-modal',
			$script_url,
			$dependencies,
			$asset['version'],
			true
		);

		wp_enqueue_style( 'wp-components' );

		wp_localize_script(
			'gumlet-media-modal',
			'gumletMediaModal',
			array(
				'restRoot'    => esc_url_raw( rest_url() ),
				'nonce'       => wp_create_nonce( 'wp_rest' ),
				'newPostUrl'  => esc_url_raw( admin_url( 'post-new.php' ) ),
				'settingsUrl' => esc_url_raw( admin_url( 'options-general.php?page=gumlet-video-options' ) ),
			)
		);
	}
}
