<?php

function gumlet_oembed_provider() {
    if ( ! function_exists( 'wp_oembed_add_provider' ) ) {

            require_once ABSPATH . WPINC . '/embed.php';
    }
    wp_oembed_add_provider( '#https?://play\.gumlet\.io/embed/.*#i', 'https://api.gumlet.com/v1/oembed', true );
    wp_oembed_add_provider( '#https?://gumlet\.tv/watch/.*#i', 'https://api.gumlet.com/v1/oembed', true );
}

add_action( 'init', 'gumlet_oembed_provider' );

