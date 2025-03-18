<?php
/**
 * Server-side rendering of the `gumlet/gumlet-video-block` block.
 */

function gumlet_video_block_render_callback($attributes) {
    // Get block attributes with defaults
    $asset_id = isset($attributes['assetId']) ? $attributes['assetId'] : '';
    $width = isset($attributes['width']) ? $attributes['width'] : '100%';
    $height = isset($attributes['height']) ? $attributes['height'] : '100%';
    $cc_enabled = isset($attributes['ccEnabled']) ? $attributes['ccEnabled'] : true;
    $autoplay = isset($attributes['autoplay']) ? $attributes['autoplay'] : false;
    $loop = isset($attributes['loop']) ? $attributes['loop'] : false;
    $controls = isset($attributes['controls']) ? $attributes['controls'] : true;
    $user_analytics = isset($attributes['userAnalytics']) ? $attributes['userAnalytics'] : true;
    $align = isset($attributes['align']) ? $attributes['align'] : 'none';

    if (empty($asset_id)) {
        return '<p>' . __('Please provide a Gumlet Asset ID.', 'gumlet-video') . '</p>';
    }

    // Build the video URL with parameters
    $url = "https://play.gumlet.io/embed/{$asset_id}?";
    
    if ($autoplay) $url .= "autoplay=true&";
    if ($loop) $url .= "loop=true&";
    if (!$controls) $url .= "disable_player_controls=false&";
    if ($cc_enabled) $url .= "caption=true&";

    // Add user analytics if enabled and user is logged in
    $watermark_text = '';
    $analytics_text = '';
    
    if (is_user_logged_in()) {
        $current_user = wp_get_current_user();
        $watermark = get_option('gumlet_video_settings', array());

        if ($user_analytics) {
            // Add user analytics parameters
            $analytics_text = 'gm_user_id=' . $current_user->ID .
                            '&gm_user_name=' . urlencode($current_user->display_name) .
                            '&gm_user_email=' . $current_user->user_email;
            $url .= $analytics_text . '&';
        }

        // Add watermark if configured
        if (isset($watermark['dynamic_watermark_name']) && $watermark['dynamic_watermark_name']) {
            $watermark_text .= $current_user->display_name . " ";
        }
        if (isset($watermark['dynamic_watermark_email']) && $watermark['dynamic_watermark_email']) {
            $watermark_text .= $current_user->user_email . " ";
        }
        if (isset($watermark['dynamic_watermark_user_id']) && $watermark['dynamic_watermark_user_id']) {
            $watermark_text .= $current_user->ID;
        }

        if (!empty($watermark_text)) {
            $url .= "watermark_text=" . urlencode(trim($watermark_text)) . "&";
        }
    }

    // Remove trailing & or ?
    $url = rtrim($url, '&?');

    // Determine container style based on width
    $container_style = '';
    $iframe_style = 'border:none;';

    if ($width === '100%') {
        $container_style = 'position:relative;padding-top:56.25%;'; // 16:9 aspect ratio
        $iframe_style .= 'position:absolute;top:0;left:0;width:100%;height:100%;';
    } else {
        $iframe_style .= "width:{$width};height:{$height};";
    }

    // Build the output HTML
    $wrapper_class = 'gumlet-video-container';
    if ($align !== 'none') {
        $wrapper_class .= ' align' . $align;
    }

    $output = sprintf(
        '<div class="%s" style="%s">
            <iframe src="%s" 
                    loading="lazy"
                    title="%s"
                    style="%s"
                    allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen;"
                    frameborder="0">
            </iframe>
        </div>',
        esc_attr($wrapper_class),
        esc_attr($container_style),
        esc_url($url),
        esc_attr__('Gumlet Video Player', 'gumlet-video'),
        esc_attr($iframe_style)
    );

    return $output;
} 