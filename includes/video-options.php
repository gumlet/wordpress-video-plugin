<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class Gumlet_Video_Settings
{

    /**
     * The instance of the class.
     *
     * @var Gumlet_Video_Settings
     */
    protected static $instance;

    /**
     * Plugin options
     *
     * @var array
     */
    protected $options = [];


    public function __construct()
    {
        $this->options = get_option('gumlet_video_settings', []);
        add_action('admin_init', [ $this, 'gumlet_register_settings' ]);
        add_action('admin_menu', [ $this, 'gumlet_add_options_link' ]);
        add_action('admin_init', [$this, "load_plugin_script_files"]);
    }

    /**
     * Plugin loader instance.
     *
     * @return Gumlet_Video_Settings
     */
    public static function instance()
    {
        if (! isset(self::$instance)) {
            self::$instance = new self;
        }

        return self::$instance;
    }

    /**
     * Renders options page
     */
    public function gumlet_options_page()
    {
        ?>
        <div class="wrap">
    <h1>
        <img src="<?php echo esc_url(plugins_url('includes/assets/images/gumlet-logo.png', __DIR__)); ?>" alt="gumlet Logo" class="top-logo">
    </h1>
    
    <form method="post" action="<?php echo esc_url(admin_url('options.php')); ?>">

        <?php settings_fields('gumlet_video_settings_group'); ?>
        <div class="mytabs">
            <input type="radio" id="tabAdvanced" name="mytabs" checked>
            <label for="tabAdvanced" class="mytablabel">Settings</label>
            <div class="tab">
                <table class="form-table">
                    <tbody>
                        <tr>
                            <th>
                                <label class="description" for="gumlet_default_cc_enabled">
                                    <?php esc_html_e('Show subtitles automatically', 'gumlet-video'); ?>
                                </label>
                            </th>
                            <td>
                                <input id="gumlet_default_cc_enabled" type="checkbox" name="gumlet_default_cc_enabled" value="1"
                                    <?php checked(get_option('gumlet_default_cc_enabled')) ?> />
                                <p class="help-text">If this is enabled, the videos having subtitles will show it by default.</p>
                            </td>
                        </tr>
                        <tr>
                            <th>
                                <label class="description" for="gumlet_default_user_analytics">
                                    <?php esc_html_e('Track user analytics', 'gumlet-video'); ?>
                                </label>
                            </th>
                            <td>
                                <input id="gumlet_default_user_analytics" type="checkbox" name="gumlet_default_user_analytics" value="1"
                                    <?php checked(get_option('gumlet_default_user_analytics')) ?> />
                                <p class="help-text">If this is enabled, the analytics will also have user data when they are logged in.</p>
                            </td>
                        </tr>
                        <tr id="dynamic_watermark_options">
                            <th>
                                <label class="description" for="">
                                    <?php esc_html_e('Dynamic Watermark Options', 'gumlet-video'); ?>
                                </label>
                            </th>
                            <td>
                                <label class="description" for="gumlet_video_settings[dynamic_watermark_name]">
                                    <?php esc_html_e('Name', 'gumlet-video'); ?>
                                </label>

                                <input id="gumlet_video_settings[dynamic_watermark_name]" type="checkbox" name="gumlet_video_settings[dynamic_watermark_name]"
                                    value=1 <?php checked(1, $this->get_option('dynamic_watermark_name')) ?> />

                                <label class="description" for="gumlet_video_settings[dynamic_watermark_email]">
                                    <?php esc_html_e('Email', 'gumlet-video'); ?>
                                </label>
                                <input id="gumlet_video_settings[dynamic_watermark_email]" type="checkbox" name="gumlet_video_settings[dynamic_watermark_email]"
                                    value=1 <?php checked(1, $this->get_option('dynamic_watermark_email')) ?> />

                                <label class="description" for="gumlet_video_settings[dynamic_watermark_user_id]">
                                    <?php esc_html_e('User ID', 'gumlet-video'); ?>
                                </label>
                                <input id="gumlet_video_settings[dynamic_watermark_user_id]" type="checkbox" name="gumlet_video_settings[dynamic_watermark_user_id]"
                                    value=1 <?php checked(1, $this->get_option('dynamic_watermark_user_id')) ?> />

                                <p class='help-text'>For collections with dynamic watermarking enabled, the above selected options will show over the video.</p>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
        </div>
        <input type="submit" class="button-primary" value="<?php esc_html_e('Save Options', 'gumlet-video'); ?>" />

    </form>
    <br>
    <p class="description">
        This plugin is powered by
        <a href="https://www.gumlet.com" target="_blank">Gumlet</a>. You can find and contribute to the code on
        <a href="https://github.com/gumlet/wordpress-video-plugin" target="_blank">GitHub</a>.
    </p>
</div>
		<?php
    }

    /**
     *  Adds link to options page in Admin > Settings menu.
     */
    public function gumlet_add_options_link()
    {
        add_options_page('Gumlet', 'Gumlet Video', 'manage_options', 'gumlet-video-options', [ $this, 'gumlet_options_page' ]);
    }

    /**
     *  Creates our settings in the options table.
     */
    public function gumlet_register_settings()
    {
        register_setting('gumlet_video_settings_group', 'gumlet_video_settings', function($input) {
            if(!empty($input) && is_array($input)) {
                $allowed_keys = array( 'dynamic_watermark_email', 'dynamic_watermark_name', 'dynamic_watermark_user_id' );
                $sanitized_array = array();
                foreach ( $input as $key => $value ) {
                    $key = sanitize_key( $key );
                    if ( in_array( $key, $allowed_keys, true ) ) {
                        $sanitized_array[ $key ] = filter_var( $value, FILTER_VALIDATE_BOOLEAN );
                    }
                }
                return $sanitized_array;
            }
            return ["dynamic_watermark_email" => 0, "dynamic_watermark_name"=> 0, "dynamic_watermark_user_id"=> 0];
        });
        
        register_setting('gumlet_video_settings_group', 'gumlet_default_cc_enabled', function($input) {
            if(!empty($input)) {
                return filter_var( $input, FILTER_VALIDATE_BOOLEAN );
            }
            return 0;
        });
        register_setting('gumlet_video_settings_group', 'gumlet_default_user_analytics', function($input) {
            if(!empty($input)) {
                return filter_var( $input, FILTER_VALIDATE_BOOLEAN );
            }
            return 0;
        });
    }


    public function load_plugin_script_files(){
        wp_register_style('admin_tabs', esc_url(plugins_url('includes/assets/css/tabs.css', __DIR__)), false, '1.0.4');
        wp_enqueue_style('admin_tabs');
    }
    

    /**
     * Get option and handle if option is not set
     *
     * @param string $key
     *
     * @return mixed
     */
    protected function get_option($key)
    {
        return isset($this->options[ $key ]) ? $this->options[ $key ] : '';
    }
}

Gumlet_Video_Settings::instance();