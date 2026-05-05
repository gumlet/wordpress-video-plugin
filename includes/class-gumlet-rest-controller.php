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
						'description' => __( 'Gumlet workspace / collection ID.', 'gumlet-video' ),
						'type'        => 'string',
						'required'    => true,
					),
					'title'        => array( 'type' => 'string' ),
					'status'       => array( 'type' => 'string' ),
					'tag'          => array( 'type' => 'string' ),
					'offset'       => array( 'type' => 'string', 'default' => '0' ),
					'size'         => array( 'type' => 'string', 'default' => '32' ),
					'sortBy'       => array( 'type' => 'string' ),
					'orderBy'      => array( 'type' => 'string' ),
					'type'         => array( 'type' => 'string' ),
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
		$workspace_id = $request->get_param( 'workspace_id' );
		$query        = ['status' => 'downloading,queued,processing,ready,generating-subtitles,pre-processing,processed,validated,validating'];
		foreach ( array( 'title', 'offset', 'size', 'sortBy', 'orderBy', 'type', 'playlist_id' ) as $key ) {
			$val = $request->get_param( $key );
			if ( null !== $val && '' !== $val ) {
				$query[ $key ] = $val;
			}
		}
		if ( ! isset( $query['offset'] ) ) {
			$query['offset'] = '0';
		}
		if ( ! isset( $query['size'] ) ) {
			$query['size'] = '32';
		}

		$result = Gumlet_API_Client::list_assets( $workspace_id, $query );
		if (is_wp_error( $result ) ) {
			if(WP_DEBUG) {
				error_log(
					'[gumlet-video] list_assets Gumlet error: ' . $result->get_error_code() . ' — ' . $result->get_error_message()
				);
			}

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
		);

		if ( ! empty( $params['collection_id'] ) ) {
			$body['collection_id'] = sanitize_text_field( wp_unslash( $params['collection_id'] ) );
		}
		if ( ! empty( $params['format'] ) ) {
			$body['format'] = sanitize_text_field( wp_unslash( $params['format'] ) );
		}
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
