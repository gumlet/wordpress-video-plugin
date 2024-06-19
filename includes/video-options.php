<?php

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
        <!-- <head>
          <link rel="stylesheet" type="text/css" href="gumlet.css">
        </head> -->
        <div class="wrap">
    <h1>
        <img src="<?php echo plugins_url('assets/images/gumlet-logo.png', __DIR__); ?>" alt="gumlet Logo"
            style="width:200px; margin-left: -12px;">
    </h1>
    <?php
            if( isset($_GET['settings-updated']) ){
          ?>
    <div class="notice notice-warning">
        <p><strong>Heads up! Clear cache:</strong> We recommend you clear cache after enabling Gumlet.</p>
    </div>
    <?php
            }
          ?>
    <!-- <div class="notice notice-info">
        <p><strong>Important!</strong> Gumlet <strong>does not</strong> work well with other lazy-load plugins. We
            recommend you <strong>disable</strong> all other lazy-load plugins and lazy-load settings in themes.</p>
        <p><strong>Need help getting started?</strong> It's easy! Check out our
            <a href="https://docs.gumlet.com/docs/image-integration-wordpress" target="_blank">instructions.</a>
        </p>
    </div> -->

    <form method="post" action="<?php echo admin_url('options.php'); ?>">

        <?php settings_fields('gumlet_video_settings_group'); ?>
        <div class="mytabs">
            <input type="radio" id="tabsettings" name="mytabs" checked="checked">
            <label for="tabsettings" class="mytablabel">Settings</label>
            <div class="tab">
                <table class="form-table">
                    <tbody>
                        <tr>
                            <th>
                                <label class="description" for="gumlet_video_settings[api_key]">
                                    <?php esc_html_e('Gumlet API Key', 'gumlet'); ?> *
                                </label>
                            </th>
                            <td>
                                <input id="gumlet_video_settings[api_key]" type="password" name="gumlet_video_settings[api_key]"
                                    placeholder="******"
                                    value="<?php echo $this->get_option('api_key'); ?>" required="required"
                                    class="regular-text code" />
                                <p style="color: #666">&nbsp;Get the API key from <a href="https://dashboard.gumlet.com/user/apikey" target="_blank">https://dashboard.gumlet.com/user/apikey</a></p>
                            </td>
                        </tr>
                        <tr>
                            <th>
                                <label class="description" for="gumlet_video_settings[dynamic_watermark]">
                                    <?php esc_html_e('Dynamic Watermark', 'gumlet'); ?>
                                </label>
                            </th>
                            <td>
                                <input id="gumlet_video_settings[dynamic_watermark]" type="checkbox" name="gumlet_video_settings[dynamic_watermark]"
                                    value="1" <?php checked(1, $this->get_option('dynamic_watermark')) ?> />
                            </td>
                        </tr>
                        <script>
                            let options = <?php echo json_encode($this->options); ?>
                        </script>
                        <tr id="dynamic_watermark_options">
                            <th>
                                <label class="description" for="">
                                    <?php esc_html_e('Watermark Options', 'gumlet'); ?>
                                </label>
                            </th>
                            <td>
                                <label class="description" for="gumlet_video_settings[dynamic_watermark_name]">
                                    <?php esc_html_e('Name', 'gumlet'); ?>
                                </label>

                                <input id="gumlet_video_settings[dynamic_watermark_name]" type="checkbox" name="gumlet_video_settings[dynamic_watermark_name]"
                                    value=1 <?php checked(1, $this->get_option('dynamic_watermark_name')) ?> />

                                <label class="description" for="gumlet_video_settings[dynamic_watermark_email]">
                                    <?php esc_html_e('Email', 'gumlet'); ?>
                                </label>
                                <input id="gumlet_video_settings[dynamic_watermark_email]" type="checkbox" name="gumlet_video_settings[dynamic_watermark_email]"
                                    value=1 <?php checked(1, $this->get_option('dynamic_watermark_email')) ?> />

                                <label class="description" for="gumlet_video_settings[dynamic_watermark_user_id]">
                                    <?php esc_html_e('User ID', 'gumlet'); ?>
                                </label>
                                <input id="gumlet_video_settings[dynamic_watermark_user_id]" type="checkbox" name="gumlet_video_settings[dynamic_watermark_user_id]"
                                    value=1 <?php checked(1, $this->get_option('dynamic_watermark_user_id')) ?> />
                            </td>
                        </tr>
                    </tbody>
                </table>
                <script>
                const dynamicElem = document.getElementById("gumlet_video_settings[dynamic_watermark]");
                dynamicElem.addEventListener("change", hideShowOptions);
                function hideShowOptions() {
                    let hideShowStyle = dynamicElem.checked ? "table-row": "none"
                    document.getElementById("dynamic_watermark_options").style.display = hideShowStyle;
                }
                hideShowOptions(dynamicElem)
            </script>
            </div>
            <input type="radio" id="tabadvanced" name="mytabs">
            <label for="tabadvanced" class="mytablabel">Advanced</label>
            <div class="tab">
                <table class="form-table">
                    <tbody>
                        <tr>
                            <th>
                                <label class="description" for="gumlet_video_settings[original_images]">
                                    <?php esc_html_e('Use Original Images', 'gumlet'); ?>
                                </label>
                            </th>
                            <td>
                                <input id="gumlet_video_settings[original_images]" type="checkbox"
                                    name="gumlet_video_settings[original_images]" value="1" <?php
                                    checked($this->get_option('original_images')) ?> />
                                <p style="color: #666">If this is enabled (recommended), plugin will use original images
                                    before processing. <br>If this is not enabled, Gumlet will use images resized by
                                    wordpress for further processing.</p>
                            </td>
                        </tr>
                        <tr>
                            <th>
                                <label class="description" for="gumlet_video_settings[server_webp]">
                                    <?php esc_html_e('Browser Webp Detect', 'gumlet'); ?>
                                </label>
                            </th>
                            <td>
                                <input id="gumlet_video_settings[server_webp]" type="checkbox"
                                    name="gumlet_video_settings[server_webp]" value="1" <?php
                                    checked($this->get_option('server_webp')) ?> />
                                <p style="color: #666">If this is enabled, plugin will detect Webp support from browser
                                    rather than from server.(recommended OFF)</p>
                            </td>
                        </tr>
                        <tr>
                            <th>
                                <label class="description" for="gumlet_width_from_img">
                                    <?php esc_html_e('Use <img> Width', 'gumlet'); ?>
                                </label>
                            </th>
                            <td>
                                <input id="gumlet_width_from_img" type="checkbox" name="gumlet_width_from_img" value="1"
                                    <?php checked(get_option('gumlet_width_from_img')) ?> />
                                <p style="color: #666">If this is enabled, plugin will use width from &lt;img&gt;
                                    element width attribute rather than calculating actual width.</p>
                            </td>
                        </tr>
                        <tr>
                            <th>
                                <label class="description" for="gumlet_width_from_flex">
                                    <?php esc_html_e('Use Flex Width', 'gumlet'); ?>
                                </label>
                            </th>
                            <td>
                                <input id="gumlet_width_from_flex" type="checkbox" name="gumlet_width_from_flex" value="1"
                                    <?php checked(get_option('gumlet_width_from_flex')) ?> />
                                <p style="color: #666">If this is enabled, plugin will use width from Flex CSS propery rather than calculating actual width.</p>
                            </td>
                        </tr>
                        <tr>
                            <th>
                                <label class="description" for="gumlet_min_width">
                                    <?php esc_html_e('Minimum Width', 'gumlet'); ?>
                                </label>
                            </th>
                            <td>
                                <input id="gumlet_min_width" type="number" name="gumlet_min_width" min="0" max="5000" value="<?php echo get_option('gumlet_min_width'); ?>" />
                                <p style="color: #666">If set, this will be minimum pixel width for image serving.</p>
                            </td>
                        </tr>
                        <tr>
                            <th>
                                <label class="description" for="gumlet_video_settings[exclude_images]">
                                    <?php esc_html_e('Exclude Image URLs', 'gumlet'); ?>
                                </label>
                            </th>
                            <td>
                                <textarea id="gumlet_video_settings[exclude_images]" style="width: 500px; height: 100px"
                                    placeholder="Enter every URL in new line."
                                    name="gumlet_video_settings[exclude_images]"><?php print($this->get_option('exclude_images')) ?></textarea>
                                <p style="color: #666">The URLs you enter here will not be processed by Gumlet. Please
                                    enter one URL per line.</p>
                            </td>
                        </tr>
                        <tr>
                            <th>
                                <label class="description" for="gumlet_video_settings[exclude_post_types]">
                                    <?php esc_html_e('Exclude Post Types', 'gumlet'); ?>
                                </label>
                            </th>
                            <td>
                                <textarea id="gumlet_video_settings[exclude_post_types]" style="width: 500px; height: 100px"
                                    placeholder="Enter each post type in new line."
                                    name="gumlet_video_settings[exclude_post_types]"><?php print($this->get_option('exclude_post_types')) ?></textarea>
                                <p style="color: #666">Enter post types here to exclude those posts from being processed with Gumlet.</p>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <input type="submit" class="button-primary" value="<?php esc_html_e('Save Options', 'gumlet'); ?>" />
        <style>
        
        .mytabs {
            display: flex;
            flex-wrap: wrap;
            margin: 5px auto;
        }

        .mytabs input[type="radio"] {
            display: none;
        }

        .mytabs .tab {
            width: 100%;
            padding: 20px;
            background: #fff;
            order: 1;
            display: none;
        }
        .mytabs .mytablabel {
            padding: 10px;
            background: #e2e2e2;
        }

        .mytabs input[type='radio']:checked + label + .tab {
            display: block;
        }

        .mytabs input[type="radio"]:checked + label {
            background: #fff;
        }
        </style>

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
        add_options_page('Gumlet', 'Gumlet', 'manage_options', 'gumlet-options', [ $this, 'gumlet_options_page' ]);
    }

    /**
     *  Creates our settings in the options table.
     */
    public function gumlet_register_settings()
    {
        register_setting('gumlet_video_settings_group', 'gumlet_video_settings');
        register_setting('gumlet_video_settings_group', 'gumlet_width_from_img', ["type"=> 'boolean', "default"=>true]);
        register_setting('gumlet_video_settings_group', 'gumlet_width_from_flex', ["type"=> 'boolean', "default"=>false]);
        register_setting('gumlet_video_settings_group', 'gumlet_min_width', ["type"=> 'intrger']);
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