<?php
/**
 * Server-side Gumlet REST API client.
 *
 * @package Gumlet_Video
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Thin wrapper around wp_remote_request for api.gumlet.com/v1.
 */
class Gumlet_API_Client {

	const BASE_URL        = 'https://api.gumlet.com/v1';
	const WORKSPACE_CACHE_TTL = 300;

	/**
	 * Get stored API key.
	 *
	 * @return string
	 */
	public static function get_api_key() {
		$key = get_option( 'gumlet_api_key', '' );
		return is_string( $key ) ? $key : '';
	}

	/**
	 * Resolve API key: optional override (e.g. unsaved key from settings form) else stored option.
	 *
	 * @param string|null $override Raw key from request; null means use stored only.
	 * @return string
	 */
	protected static function resolve_api_key( $override = null ) {
		if ( null !== $override ) {
			$trial = is_string( $override ) ? trim( $override ) : '';
			if ( '' !== $trial ) {
				return sanitize_text_field( $trial );
			}
		}
		return self::get_api_key();
	}

	/**
	 * Transient key for workspace list cache.
	 *
	 * @return string
	 */
	protected static function workspace_cache_key() {
		$key = self::get_api_key();
		return 'gumlet_workspaces_' . md5( $key );
	}

	/**
	 * Clear workspace cache (e.g. after key change).
	 */
	public static function clear_workspace_cache() {
		delete_transient( self::workspace_cache_key() );
	}

	/**
	 * Perform HTTP request to Gumlet API.
	 *
	 * @param string            $method GET, POST, DELETE.
	 * @param string            $path   Path starting with / e.g. /video/workspaces.
	 * @param array|null        $query  Query string args.
	 * @param array|string|null $body              JSON-decodable array or raw string for POST.
	 * @param string|null       $api_key_override Non-empty: use this Bearer key instead of the saved option (not persisted).
	 * @return array|WP_Error Decoded JSON array on success, WP_Error on failure.
	 */
	public static function request( $method, $path, $query = null, $body = null, $api_key_override = null ) {
		$api_key = self::resolve_api_key( $api_key_override );
		if ( '' === $api_key ) {
			return new WP_Error(
				'gumlet_no_api_key',
				__( 'Gumlet API key is not configured. Add it under WordPress Dashboard → Settings → Gumlet Video → API.', 'gumlet-video' ),
				array( 'status' => 400 )
			);
		}

		$url = self::BASE_URL . $path;
		if ( ! empty( $query ) && is_array( $query ) ) {
			$url = add_query_arg( $query, $url );
		}

		$args = array(
			'method'  => $method,
			'timeout' => 60,
			'headers' => array(
				'Authorization' => 'Bearer ' . $api_key,
				'Accept'          => 'application/json',
			),
		);

		if ( 'POST' === $method || 'PUT' === $method || 'PATCH' === $method ) {
			$args['headers']['Content-Type'] = 'application/json';
			if ( is_array( $body ) ) {
				$args['body'] = wp_json_encode( $body );
			} elseif ( is_string( $body ) ) {
				$args['body'] = $body;
			}
		}

		$response = wp_remote_request( $url, $args );

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		$code = wp_remote_retrieve_response_code( $response );
		$raw  = wp_remote_retrieve_body( $response );
		$data = json_decode( $raw, true );

		if ( $code >= 400 ) {
			$message = __( 'Gumlet API error.', 'gumlet-video' );
			if ( is_array( $data ) && isset( $data['error']['message'] ) ) {
				$message = $data['error']['message'];
			} elseif ( is_array( $data ) && isset( $data['message'] ) ) {
				$message = $data['message'];
			}
			$err_code = 'gumlet_api_error';
			if ( is_array( $data ) && isset( $data['error']['code'] ) ) {
				$err_code = sanitize_key( $data['error']['code'] );
			}
			return new WP_Error( $err_code, $message, array( 'status' => $code, 'body' => $data ) );
		}

		return is_array( $data ) ? $data : array();
	}

	/**
	 * List workspaces (cached).
	 *
	 * @param bool        $force_refresh    Skip transient (when using stored key only).
	 * @param string|null $api_key_override If non-empty, probe Gumlet with this key; skips cache read/write.
	 * @return array|WP_Error { all_sources: [...] } shape from API.
	 */
	public static function get_workspaces( $force_refresh = false, $api_key_override = null ) {
		$has_probe_key = ( null !== $api_key_override && '' !== trim( (string) $api_key_override ) );
		if ( $has_probe_key ) {
			return self::request(
				'GET',
				'/video/workspaces',
				array( 'offset' => '0', 'size' => '100' ),
				null,
				$api_key_override
			);
		}

		$cache_key = self::workspace_cache_key();
		if ( ! $force_refresh ) {
			$cached = get_transient( $cache_key );
			if ( false !== $cached && is_array( $cached ) ) {
				return $cached;
			}
		}

		$result = self::request( 'GET', '/video/workspaces', array( 'offset' => '0', 'size' => '100' ) );
		if ( is_wp_error( $result ) ) {
			return $result;
		}

		set_transient( $cache_key, $result, self::WORKSPACE_CACHE_TTL );
		return $result;
	}

	/**
	 * List assets in a workspace.
	 *
	 * @param string $workspace_id Workspace / collection id.
	 * @param array  $query        Optional: title, status, offset, size, sortBy, orderBy, type.
	 * @return array|WP_Error
	 */
	public static function list_assets( $workspace_id, $query = array() ) {
		$workspace_id = sanitize_text_field( $workspace_id );
		if ( '' === $workspace_id ) {
			return new WP_Error( 'gumlet_missing_workspace', __( 'Workspace ID is required.', 'gumlet-video' ), array( 'status' => 400 ) );
		}

		$path = '/video/assets/list/' . rawurlencode( $workspace_id );
		return self::request( 'GET', $path, $query );
	}

	/**
	 * Get single asset details.
	 *
	 * @param string $asset_id Asset id.
	 * @return array|WP_Error
	 */
	public static function get_asset( $asset_id ) {
		$asset_id = sanitize_text_field( $asset_id );
		if ( '' === $asset_id ) {
			return new WP_Error( 'gumlet_missing_asset', __( 'Asset ID is required.', 'gumlet-video' ), array( 'status' => 400 ) );
		}

		$path = '/video/assets/' . rawurlencode( $asset_id );
		return self::request( 'GET', $path );
	}

	/**
	 * Create direct upload asset (returns upload_url).
	 *
	 * @param array $payload Body for POST /video/assets/upload.
	 * @return array|WP_Error
	 */
	public static function create_direct_upload( $payload ) {
		if ( ! is_array( $payload ) ) {
			return new WP_Error( 'gumlet_invalid_payload', __( 'Invalid upload payload.', 'gumlet-video' ), array( 'status' => 400 ) );
		}
		return self::request( 'POST', '/video/assets/upload', null, $payload );
	}
}
