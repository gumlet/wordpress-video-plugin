<?php
/**
 * 
 * @package gumlet-wordpress-video
 * @author akbansa
 * @license BSD-2
 * 
 * Plugin Name: Gumlet Video
 * Plugin URI: https://www.gumlet.com
 * Description: Video Hosting Plugin for WordPress
 * Version: 1.0
 * Author: Gumlet
 * Author URI: https://www.gumlet.com
 * License: BSD-2
 */


include('includes/logger.php');
include('includes/video-options.php');

if (!defined('GUMLET_VIDEO_DEBUG')) {
    define('GUMLET_VIDEO_DEBUG', isset($_GET['GUMLET_VIDEO_DEBUG']) ? $_GET['GUMLET_VIDEO_DEBUG'] : false);
}

if (GUMLET_VIDEO_DEBUG) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
}

if (!defined('GUMLET_PLUGIN_VERSION')) {
    define('GUMLET_PLUGIN_VERSION', '1.0');
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

    if (!$atts['id']) {
        return "Required argument id for embedded video not found.";
    } else {
        $video = $id;
    }
    
    $watermark_text = '';
    if($annotate) {
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
   
    $uniq = 'u' . rand();
    // $url = "https://play.gumlet.io/embed/$video?otp=$OTP&playbackInfo=$playbackInfo";
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
        $url .= "watermark_text=".$watermark_text;
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
    
    $output = <<<END
    
        $opening_div
        <iframe
        src="$url" id="$uniq" loading="lazy" title="Gumlet video player"
        $style
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen;" frameborder="0"></iframe>
        $closing_div
        <script>
        </script>
    END;
        
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


function gumlet_video_plugin_activate()
{
    // plugin activation code here...
    if (!get_option('gumlet_video_settings')) {
        update_option('gumlet_video_settings', ["dynamic_watermark" => 0, "dynamic_watermark_email" => 0, "dynamic_watermark_name"=> 0, "dynamic_watermark_user_id"=> 0]);
    }
}