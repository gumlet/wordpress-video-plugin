<?php
/**
 * @author: akbansa
 */

class GumletVideoLogger {
    private static $instance;
    private $logPath;
    /**
     * Make sure only one instance is running.
     */
    public static function instance()
    {
        if (!isset (self::$instance)) {
            self::$instance = new self;
        }
        return self::$instance;
    }

    private function __construct() {
        $upload_dir = wp_upload_dir();
        $this->logPath = $upload_dir['basedir'] . '/gumlet_video_logs.log';
        if (GUMLET_VIDEO_DEBUG === 'delete') {
            @unlink($this->logPath);
            $this->log("START FRESH", GUMLET_VIDEO_DEBUG);
        }
    }

    public function log($msg, $extra = false) {
        if (GUMLET_VIDEO_DEBUG) {
            file_put_contents($this->logPath, '[' . date('Y-m-d H:i:s') . "] $msg" . ($extra ? json_encode($extra, JSON_PRETTY_PRINT) : '') . "\n", FILE_APPEND);
        }
    }
}