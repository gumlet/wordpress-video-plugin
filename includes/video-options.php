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
        add_action('admin_enqueue_scripts', [ $this, 'enqueue_settings_scripts' ]);
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
        <input type="hidden" name="gumlet_api_key_clear" id="gumlet_api_key_clear" value="0" />
        <div class="mytabs">
            <input type="radio" id="tabGeneral" name="mytabs" checked>
            <label for="tabGeneral" class="mytablabel"><?php esc_html_e('Settings', 'gumlet-video'); ?></label>
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

            <input type="radio" id="tabApi" name="mytabs">
            <label for="tabApi" class="mytablabel"><?php esc_html_e('API', 'gumlet-video'); ?></label>
            <div class="tab">
                <table class="form-table">
                    <tbody>
                        <tr>
                            <th scope="row">
                                <label for="gumlet_api_key"><?php esc_html_e('Gumlet API key', 'gumlet-video'); ?></label>
                            </th>
                            <td>
                                <input
                                    id="gumlet_api_key"
                                    name="gumlet_api_key"
                                    type="password"
                                    class="regular-text"
                                    value=""
                                    autocomplete="off"
                                    placeholder="<?php esc_attr_e('Paste your API key', 'gumlet-video'); ?>"
                                />
                                <?php if ( get_option( 'gumlet_api_key', '' ) !== '' ) : ?>
                                <span style="margin-top: 10px;">
                                    <button type="button" class="button button-secondary" id="gumlet-remove-api-key" aria-label="<?php esc_attr_e( 'Remove saved API key', 'gumlet-video' ); ?>">
                                        <span class="dashicons dashicons-dismiss" style="vertical-align: text-top; margin-right: 4px;" aria-hidden="true"></span>
                                        <?php esc_html_e( 'Remove key', 'gumlet-video' ); ?>
                                    </button>
                                </span>
                                <?php endif; ?>
                                <p class="help-text">
                                    <?php esc_html_e('Required for browsing assets and uploading from the Gumlet Video block in the editor. The key is stored on your server and never exposed to visitors.', 'gumlet-video'); ?>
                                    <a href="https://dash.gumlet.com/developer/api-keys" target="_blank" rel="noopener noreferrer"><?php esc_html_e('Get your API key', 'gumlet-video'); ?></a>
                                </p>
                                <?php if ( get_option( 'gumlet_api_key', '' ) !== '' ) : ?>
                                    <p class="description" style="margin-top: 4px;color: #258c25;"><?php esc_html_e('A key is already saved. Enter a new key to replace it, or leave blank to keep the current key.', 'gumlet-video'); ?></p>
                                    
                                <?php endif; ?>
                                <p style="margin-top: 24px;">
                                    <button type="button" class="button" id="gumlet-test-api"><?php esc_html_e('Test connection', 'gumlet-video'); ?></button>
                                    <span id="gumlet-test-api-result" style="margin-left:8px;"></span>
                                </p>
                                <p class="description" style="margin-top: 4px; font-size: 12px;">
                                    <?php esc_html_e('Test connection checks the key you typed above when the field is not empty; otherwise it uses the key already saved in the database.', 'gumlet-video'); ?>
                                </p>
                                <p class="description" style="margin-top: 2px; font-size: 12px;">
                                    <?php esc_html_e('You do not need to save first to try a new key. You can test the key by clicking the "Test connection" button.', 'gumlet-video'); ?>
                                </p>
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

        register_setting(
            'gumlet_video_settings_group',
            'gumlet_api_key',
            array(
                'type'              => 'string',
                'sanitize_callback' => array( $this, 'sanitize_api_key' ),
                'default'           => '',
            )
        );
    }

    /**
     * Keep existing API key when the password field is left blank on save.
     *
     * @param mixed $input Raw option value.
     * @return string
     */
    public function sanitize_api_key( $input ) {
        // phpcs:ignore WordPress.Security.NonceVerification.Missing -- options.php verifies settings_fields nonce before save.
        if ( isset( $_POST['gumlet_api_key_clear'] ) && '1' === sanitize_text_field( wp_unslash( $_POST['gumlet_api_key_clear'] ) ) ) {
            if ( class_exists( 'Gumlet_API_Client' ) ) {
                Gumlet_API_Client::clear_workspace_cache();
            }
            return '';
        }
        $input = is_string( $input ) ? trim( $input ) : '';
        if ( '' === $input ) {
            return (string) get_option( 'gumlet_api_key', '' );
        }
        if ( class_exists( 'Gumlet_API_Client' ) ) {
            Gumlet_API_Client::clear_workspace_cache();
        }
        return sanitize_text_field( $input );
    }

    /**
     * Scripts for settings page (Test connection).
     *
     * @param string $hook_suffix Current admin page.
     */
    public function enqueue_settings_scripts( $hook_suffix ) {
        if ( 'settings_page_gumlet-video-options' !== $hook_suffix ) {
            return;
        }
        wp_enqueue_style( 'dashicons' );
        wp_register_script(
            'gumlet-video-settings',
            false,
            array(),
            defined( 'GUMLET_PLUGIN_VERSION' ) ? GUMLET_PLUGIN_VERSION : '1.3.0',
            true
        );
        wp_enqueue_script( 'gumlet-video-settings' );
        wp_localize_script(
            'gumlet-video-settings',
            'gumletVideoSettings',
            array(
                'restUrl'       => esc_url_raw( rest_url( 'gumlet-video/v1/' ) ),
                'nonce'         => wp_create_nonce( 'wp_rest' ),
                'removeConfirm' => __( 'Remove the saved Gumlet API key? Library browse and uploads in the editor will stop working until you save a new key.', 'gumlet-video' ),
            )
        );
        $inline = <<<'JS'
(function() {
  var btn = document.getElementById('gumlet-test-api');
  var out = document.getElementById('gumlet-test-api-result');
  var keyInput = document.getElementById('gumlet_api_key');
  var removeBtn = document.getElementById('gumlet-remove-api-key');
  var clearFlag = document.getElementById('gumlet_api_key_clear');
  if (removeBtn && clearFlag && typeof gumletVideoSettings !== 'undefined' && gumletVideoSettings.removeConfirm) {
    removeBtn.addEventListener('click', function() {
      if (!window.confirm(gumletVideoSettings.removeConfirm)) return;
      clearFlag.value = '1';
      if (keyInput) keyInput.value = '';
      var f = clearFlag.form;
      if (f) f.submit();
    });
  }
  if (!btn || !out || typeof gumletVideoSettings === 'undefined') return;
  btn.addEventListener('click', function() {
    out.textContent = '';
    btn.disabled = true;
    var payload = {};
    if (keyInput && keyInput.value && String(keyInput.value).trim() !== '') {
      payload.api_key = String(keyInput.value).trim();
    }
    fetch(gumletVideoSettings.restUrl + 'test-connection', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        'X-WP-Nonce': gumletVideoSettings.nonce
      },
      body: JSON.stringify(payload)
    }).then(function(r) {
      return r.json().then(function(data) {
        if (!r.ok) {
          var msg = (data && data.message) ? data.message : r.statusText;
          out.style.color = '#b32d2e';
          out.textContent = msg;
          return;
        }
        out.style.color = '#008a20';
        out.textContent = data.message || 'OK';
      });
    }).catch(function() {
      out.style.color = '#b32d2e';
      out.textContent = 'Request failed';
    }).finally(function() {
      btn.disabled = false;
    });
  });
})();
JS;
        wp_add_inline_script( 'gumlet-video-settings', $inline );
    }

    public function load_plugin_script_files(){
        wp_register_style('admin_tabs', esc_url(plugins_url('includes/assets/css/tabs.css', __DIR__)), false, '1.0.5');
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