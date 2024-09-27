<?php

if ( ! defined( 'ABSPATH' ) ) exit;

 /*
 * Plugin Name:       Gumlet Video
 * Description:       Video Hosting Plugin for WordPress
 * Plugin URI:        https://github.com/gumlet/wordpress-video-plugin
 * Version:           1.0
 * Author:            Gumlet
 * Author URI:        https://www.gumlet.com
 * License:           GPLv2
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 */

function gumlet_oembed_provider() {
    if ( ! function_exists( 'wp_oembed_add_provider' ) ) {

            require_once ABSPATH . WPINC . '/embed.php';
    }
    wp_oembed_add_provider( '#https?://play\.gumlet\.io/embed/.*#i', 'https://api.gumlet.com/v1/oembed', true );
    wp_oembed_add_provider( '#https?://gumlet\.tv/watch/.*#i', 'https://api.gumlet.com/v1/oembed', true );
}

add_action( 'init', 'gumlet_oembed_provider' );

