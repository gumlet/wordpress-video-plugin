<?php
/**
 * WordPress REST API proxy for Gumlet (API key stays server-side).
 *
 * @package Gumlet_Video
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers gumlet-video/v1 routes.
 */
class Gumlet_REST_Controller {

	const NS = 'gumlet-video/v1';

	/**
	 * Register hooks.
	 */
	public static function init() {
		add_action( 'rest_api_init', array( __CLASS__, 'register_routes' ) );
	}

	/**
	 * Permission: administrators only (matches plan).
	 *
	 * @return bool
	 */
	public static function permission_manage_options() {
		return current_user_can( 'manage_options' );
	}

	/**
	 * Register REST routes.
	 */
	public static function register_routes() {
		register_rest_route(
			self::NS,
			'/workspaces',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( __CLASS__, 'get_workspaces' ),
				'permission_callback' => array( __CLASS__, 'permission_manage_options' ),
			)
		);

		// Register list route before /assets/{id} so ?workspace_id= does not collide.
		register_rest_route(
			self::NS,
			'/assets',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( __CLASS__, 'list_assets' ),
				'permission_callback' => array( __CLASS__, 'permission_manage_options' ),
				'args'                => array(
					'workspace_id' => array(
						'description'       => __( 'Gumlet workspace / collection ID.', 'gumlet-video' ),
						'type'              => 'string',
						'required'          => true,
						'sanitize_callback' => 'sanitize_text_field',
					),
					'title'        => array(
						'type'              => 'string',
						'sanitize_callback' => 'sanitize_text_field',
					),
					'offset'       => array(
						'type'              => 'integer',
						'default'           => 0,
						'sanitize_callback' => 'absint',
					),
					'size'         => array(
						'type'              => 'integer',
						'default'           => 40,
						'sanitize_callback' => 'absint',
					),
				),
			)
		);

		register_rest_route(
			self::NS,
			'/assets/(?P<id>[a-zA-Z0-9]+)',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( __CLASS__, 'get_asset' ),
				'permission_callback' => array( __CLASS__, 'permission_manage_options' ),
				'args'                => array(
					'id' => array(
						'description' => __( 'Gumlet asset ID.', 'gumlet-video' ),
						'type'        => 'string',
						'required'    => true,
					),
				),
			)
		);

		register_rest_route(
			self::NS,
			'/uploads',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( __CLASS__, 'create_upload' ),
				'permission_callback' => array( __CLASS__, 'permission_manage_options' ),
				'args'                => array(
					'workspace_id' => array(
						'description'       => __( 'Gumlet workspace / collection ID.', 'gumlet-video' ),
						'type'              => 'string',
						'required'          => true,
						'sanitize_callback' => 'sanitize_text_field',
					),
					'title'        => array(
						'type'              => 'string',
						'sanitize_callback' => 'sanitize_text_field',
					),
					'description'  => array(
						'type'              => 'string',
						'sanitize_callback' => 'sanitize_textarea_field',
					),
					'playlist_id'  => array(
						'type'              => 'string',
						'sanitize_callback' => 'sanitize_text_field',
					),
					'tag'          => array(
						'type' => array( 'string', 'array' ),
					),
				),
			)
		);

		register_rest_route(
			self::NS,
			'/test-connection',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( __CLASS__, 'test_connection' ),
				'permission_callback' => array( __CLASS__, 'permission_manage_options' ),
			)
		);
	}

	/**
	 * GET /workspaces
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function get_workspaces( $request ) {
		$refresh = $request->get_param( 'refresh' );
		$result  = Gumlet_API_Client::get_workspaces( ! empty( $refresh ) );
		if ( is_wp_error( $result ) ) {
			return self::error_response( $result );
		}
		return rest_ensure_response( $result );
	}

	/**
	 * GET /assets — list
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function list_assets( $request ) {
		$workspace_id = sanitize_text_field( (string) $request->get_param( 'workspace_id' ) );

		$size = absint( $request->get_param( 'size' ) );
		if ( $size < 1 ) {
			$size = 40;
		}

		$query = array(
			// Curated set of statuses we want to surface in WordPress admin UIs.
			'status'  => 'downloading,queued,processing,ready,generating-subtitles,pre-processing,processed,validated,validating',
			'offset'  => (string) absint( $request->get_param( 'offset' ) ),
			'size'    => (string) $size,
			'sortBy'  => 'updated_at',
			'orderBy' => 'desc',
		);

		$title = $request->get_param( 'title' );
		if ( is_string( $title ) && '' !== $title ) {
			$query['title'] = sanitize_text_field( $title );
		}

		$result = Gumlet_API_Client::list_assets( $workspace_id, $query );
		if ( is_wp_error( $result ) ) {
			return self::error_response( $result );
		}
		return rest_ensure_response( $result );
	}

	/**
	 * GET /assets/{id}
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function get_asset( $request ) {
		$id     = $request->get_param( 'id' );
		$result = Gumlet_API_Client::get_asset( $id );
		if ( is_wp_error( $result ) ) {
			return self::error_response( $result );
		}
		return rest_ensure_response( $result );
	}

	/**
	 * POST /uploads — create direct upload; returns asset_id + upload_url for browser PUT.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function create_upload( $request ) {
		$params = $request->get_json_params();
		if ( ! is_array( $params ) ) {
			$params = array();
		}

		$workspace_id = isset( $params['workspace_id'] ) ? sanitize_text_field( wp_unslash( $params['workspace_id'] ) ) : '';
		$title        = isset( $params['title'] ) ? sanitize_text_field( wp_unslash( $params['title'] ) ) : '';

		if ( '' === $workspace_id ) {
			return new WP_Error( 'gumlet_missing_workspace', __( 'workspace_id is required.', 'gumlet-video' ), array( 'status' => 400 ) );
		}
		if ( '' === $title ) {
			$title = __( 'Untitled upload', 'gumlet-video' );
		}

		$body = array(
			'workspace_id' => $workspace_id,
			'title'        => $title,
			'metadata'     => self::build_upload_metadata(),
		);
		if ( ! empty( $params['tag'] ) && is_array( $params['tag'] ) ) {
			$body['tag'] = array_map( 'sanitize_text_field', wp_unslash( $params['tag'] ) );
		} elseif ( ! empty( $params['tag'] ) && is_string( $params['tag'] ) ) {
			$body['tag'] = array( sanitize_text_field( wp_unslash( $params['tag'] ) ) );
		}
		if ( ! empty( $params['description'] ) ) {
			$body['description'] = sanitize_textarea_field( wp_unslash( $params['description'] ) );
		}
		if ( ! empty( $params['playlist_id'] ) ) {
			$body['playlist_id'] = sanitize_text_field( wp_unslash( $params['playlist_id'] ) );
		}
		$result = Gumlet_API_Client::create_direct_upload( $body );
		if ( is_wp_error( $result ) ) {
			return self::error_response( $result );
		}
		return rest_ensure_response( $result );
	}

	/**
	 * POST /test-connection
	 *
	 * JSON body may include `api_key` to validate the value typed in the settings form before Save.
	 * If `api_key` is omitted or empty, the saved option is used.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function test_connection( WP_REST_Request $request ) {
		$params   = $request->get_json_params();
		$override = null;
		if ( is_array( $params ) && isset( $params['api_key'] ) && is_string( $params['api_key'] ) ) {
			$override = $params['api_key'];
		}
		$result = Gumlet_API_Client::get_workspaces( true, $override );
		if ( is_wp_error( $result ) ) {
			return self::error_response( $result );
		}
		$sources = isset( $result['all_sources'] ) && is_array( $result['all_sources'] ) ? $result['all_sources'] : array();
		return rest_ensure_response(
			array(
				'ok'      => true,
				'count'   => count( $sources ),
				'message' => __( 'Connected to Gumlet successfully.', 'gumlet-video' ),
			)
		);
	}

	/**
	 * Metadata attached to every WordPress-originated Gumlet upload.
	 *
	 * @return array<string, string>
	 */
	protected static function build_upload_metadata() {
		$metadata = array(
			'source_platform' => 'wordpress',
		);

		if ( defined( 'GUMLET_PLUGIN_VERSION' ) ) {
			$metadata['plugin_version'] = sanitize_text_field( GUMLET_PLUGIN_VERSION );
		}

		$site_url = home_url( '/', 'https' );
		if ( is_string( $site_url ) && '' !== $site_url ) {
			$metadata['site_url'] = esc_url_raw( $site_url );
		}

		return array_filter( $metadata );
	}

	/**
	 * Convert WP_Error to REST response with proper status.
	 *
	 * @param WP_Error $error Error.
	 * @return WP_Error
	 */
	protected static function error_response( WP_Error $error ) {
		$status = 500;
		$data   = $error->get_error_data();
		if ( is_array( $data ) && isset( $data['status'] ) ) {
			$status = (int) $data['status'];
		}
		return new WP_Error(
			$error->get_error_code(),
			$error->get_error_message(),
			array( 'status' => $status )
		);
	}
}
