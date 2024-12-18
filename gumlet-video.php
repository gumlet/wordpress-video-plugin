<?php
if ( ! defined( 'ABSPATH' ) ) exit;

 /*
 * Plugin Name:       Gumlet Video
 * Description:       Video Hosting Plugin for WordPress
 * Plugin URI:        https://github.com/gumlet/wordpress-video-plugin
 * Version:           1.1
 * Author:            Gumlet
 * Author URI:        https://www.gumlet.com
 * Text Domain:       gumlet-video
 * License:           GPLv2
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 */


include('includes/video-options.php');

if (!defined('GUMLET_PLUGIN_VERSION')) {
    define('GUMLET_PLUGIN_VERSION', '1.0');
}

function gumlet_oembed_provider() {
    wp_oembed_add_provider( '#https?://play\.gumlet\.io/embed/.*#i', 'https://api.gumlet.com/v1/oembed', true );
    wp_oembed_add_provider( '#https?://gumlet\.tv/watch/.*#i', 'https://api.gumlet.com/v1/oembed', true );
}


function gumlet_video_shortcode($atts)
{
    $watermark = get_option('gumlet_video_settings');
    $sc_args = shortcode_atts(
        array(
            'width' => '100%',
            'height' => '100%',
            'cc_enabled' => get_option('gumlet_default_cc_enabled'),
            'id'    => 'id',
            'annotate'=> true,
            'user_analytics'=> get_option('gumlet_default_user_analytics'),
            'autoplay'=> false,
            'loop'=> false,
            'controls'=> 'on',
        ),
        $atts
    );
    $width = $sc_args['width'];
    $height = $sc_args['height'];
    $id = $sc_args['id'];
    $annotate = $sc_args['annotate'];
    $cc_enabled = $sc_args['cc_enabled'];
    $user_analytics = $sc_args['user_analytics'];

    if (!$atts['id']) {
        return "Required argument id for embedded video not found.";
    } else {
        $video = $id;
    }
    
    $watermark_text = '';
    $logged_in = is_user_logged_in();
    if($annotate && $logged_in) {
        $current_user = wp_get_current_user();
        if(isset($watermark['dynamic_watermark_name']) && $watermark['dynamic_watermark_name']) {
            $watermark_text .= $current_user->display_name . " ";
        }
        if(isset($watermark['dynamic_watermark_email']) && $watermark['dynamic_watermark_email']) {
            $watermark_text .= $current_user->user_email. " ";
        }
        if(isset($watermark['dynamic_watermark_user_id']) && $watermark['dynamic_watermark_user_id']) {
            $watermark_text .= $current_user->ID;
        }
    }
    $analytics_text = '';
    if($user_analytics && $logged_in) {
        $analytics_text = 'gm_user_id='.$current_user->ID.
                            '&gm_user_name='. urlencode($current_user->display_name).
                            '&gm_user_email='.$current_user->user_email;
    }
   
    $uniq = 'u' . wp_rand();
    $url = "https://play.gumlet.io/embed/$video?";
    if ($sc_args['autoplay']) {
        $url .= "autoplay=true&";
    }
    if ($sc_args['loop']) {
        $url .= "loop=true&";
    }
    if ($sc_args['controls'] == 'off') {
        $url .= "disable_player_controls=false&";
    }
    if(!!$cc_enabled) {
        $url .= "caption=true&";
    }
    if($watermark_text != '') {
        $url .= "watermark_text=".$watermark_text."&";
    }
    if($analytics_text != '') {
        $url .= $analytics_text;
    }
    if($width != "100%") {
        $opening_div = '<div>';
        $style = 'width="'.$width.'" height="'.$height.'" style="border:none;"';
        $closing_div = '</div>';
    } else {
        $opening_div = '<div style="padding:56.25% 0 0 0;position:relative;">';
        $style = 'style="border:none; position: absolute; top:0; left:0; height: 100%; width: 100%;"';
        $closing_div = '</div>';
    }
    
    $output = 
        $opening_div.'
        <iframe src="'.$url.'" id="'.$uniq.'" loading="lazy" title="Gumlet video player"' .$style.' 
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen;" frameborder="0"></iframe>'.
        $closing_div;
        
    return $output;
}

add_shortcode('gumlet', 'gumlet_video_shortcode');



function gumlet_video_plugin_admin_action_links($links, $file)
{
    if ($file === plugin_basename(__FILE__)) {
        $settings_link = '<a href="options-general.php?page=gumlet-video-options">Settings</a>';
        array_unshift($links, $settings_link);
    }
    return $links;
}

add_filter('plugin_action_links', 'gumlet_video_plugin_admin_action_links', 10, 2);

register_activation_hook(__FILE__, 'gumlet_video_plugin_activate');

add_action( 'init', 'gumlet_oembed_provider' );

function gumlet_video_plugin_activate()
{
    // plugin activation code here...
    if (!get_option('gumlet_video_settings')) {
        update_option('gumlet_video_settings', ["dynamic_watermark_email" => 0, "dynamic_watermark_name"=> 0, "dynamic_watermark_user_id"=> 0]);
    }
    if(!get_option('gumlet_default_cc_enabled')) {
        update_option('gumlet_default_cc_enabled', 1);
    }
    if(!get_option('gumlet_default_user_analytics')) {
        update_option('gumlet_default_user_analytics', 1);
    }
}