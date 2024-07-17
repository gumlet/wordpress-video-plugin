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
        <div class="wrap">
    <h1>
        <img src="<?php echo plugins_url('includes/assets/images/gumlet-logo.png', __DIR__); ?>" alt="gumlet Logo"
            style="width:200px; margin-left: -12px;">
    </h1>
    
    <form method="post" action="<?php echo admin_url('options.php'); ?>">

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
                                    <?php esc_html_e('Show Subtitles automatically', 'gumlet'); ?>
                                </label>
                            </th>
                            <td>
                                <input id="gumlet_default_cc_enabled" type="checkbox" name="gumlet_default_cc_enabled" value="1"
                                    <?php checked(get_option('gumlet_default_cc_enabled')) ?> />
                                <p style="color: #666">If this is enabled, the videos having subtitles will show it by default.</p>
                            </td>
                        </tr>
                        <script>
                            let options = <?php echo json_encode($this->options); ?>
                        </script>
                        <tr id="dynamic_watermark_options">
                            <th>
                                <label class="description" for="">
                                    <?php esc_html_e('Dynamic Watermark Options', 'gumlet'); ?>
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

                                <p style="color: #666">For collections with dynamic watermarking enabled, the above selected options will show over the video.</p>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <script>
                // const dynamicElem = document.getElementById("gumlet_video_settings[dynamic_watermark]");
                // dynamicElem.addEventListener("change", hideShowOptions);
                // function hideShowOptions() {
                //     let hideShowStyle = dynamicElem.checked ? "table-row": "none"
                //     document.getElementById("dynamic_watermark_options").style.display = hideShowStyle;
                // }
                // hideShowOptions(dynamicElem)
            </script>
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
        add_options_page('Gumlet', 'Gumlet', 'manage_options', 'gumlet-video-options', [ $this, 'gumlet_options_page' ]);
    }

    /**
     *  Creates our settings in the options table.
     */
    public function gumlet_register_settings()
    {
        register_setting('gumlet_video_settings_group', 'gumlet_video_settings');
        register_setting('gumlet_video_settings_group', 'gumlet_default_cc_enabled', ["type"=> 'boolean', "default"=>true]);
        // register_setting('gumlet_video_settings_group', 'gumlet_responsive', ["type"=> 'boolean', "default"=>true]);
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