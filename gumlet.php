<?php
/**
 * 
 * @package gumlet-wordpress-video
 * @author akbansa
 * @license BSD-2
 * 
 * Plugin Name: Gumlet Video Plugin
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



function gumlet_video_plugin_admin_action_links($links, $file)
{
    if ($file === plugin_basename(__FILE__)) {
        $settings_link = '<a href="options-general.php?page=gumlet-options">Settings</a>';
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
        update_option('gumlet_video_settings', ["lazy_load" => 1, "original_images" => 1, "auto_compress"=> 1, "server_webp"=> 0]);
    }
}