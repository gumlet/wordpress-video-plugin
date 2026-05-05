=== Gumlet Video ===

Contributors: adityapatadia, akbansa
Tags: video embed, dymanic watermarking, content security
Text Domain: gumlet-video
Author URI: https://www.gumlet.com
Requires at least: 5.0
Tested up to: 6.9
Stable tag: 1.3.0
Requires PHP: 7.2
License: GPLv2
License URI: https://www.gnu.org/licenses/old-licenses/gpl-2.0.html

Unlock the full power of video with Gumlet’s official plugin for WordPress. Instantly upload, browse, and embed videos from your Gumlet account, apply advanced dynamic watermarking, access rich user-level analytics, and customize playback through intuitive shortcodes and a dedicated Gutenberg block. Secure, customizable, and built for creators who demand more from their video experience.

== Description ==

> **Gumlet Video enables you to easily upload, browse, and embed videos from your Gumlet account directly within WordPress. Enjoy advanced dynamic watermarking, robust player customization, powerful user analytics, and seamless video embedding—everything you need for secure, modern video delivery.**
>
> * Instantly browse your Gumlet video library, upload new content, and view asset details from the block editor (requires a Gumlet API key via **Settings → Gumlet Video → API**; available to administrators only).
> * Automatically enhance video security with dynamic watermarking.
> * Choose to display specific user information (name, email, ID) as a visible, dynamic watermark on video playback.
> * Use simple shortcodes to embed videos anywhere on your site.
> * Add videos via a dedicated Gutenberg block for a native editing experience.
> * Responsive video embeds by default, with options for custom dimensions.
> * Ultra-fast CDN delivery powered by AWS CloudFront (215+ locations globally).
> * Track detailed, user-level analytics to gain actionable insights on video engagement.
> * All video playback and assets are served from the play.gumlet.io domain, owned and operated by [Gumlet](https://www.gumlet.com). For more information, see our [Privacy Policy](https://www.gumlet.com/privacy/) and [Terms of Service](https://www.gumlet.com/terms/).

Gumlet Video is the all-in-one solution for securely managing and delivering your WordPress video content!


== Screenshots ==

1. Gumlet Video Library inside WordPress Media
2. Usage of Gumlet Video inside Editor
3. Gumlet Video Plugin settings
4. API Key and Connection Test
5. File Upload directly to Gumlet
6. Gumlet dashboard settings for dynamic watermark
7. How does it work?
8. Shortcode usage

== Installation Guide for Dynamic Watermark ==

1. Enable the dymanic watermark and set the visual configuration in the player settings options on Video CMS. Visit [https://dashboard.gumlet.com/video/manage?tab=edit_player](https://dashboard.gumlet.com/video/manage?tab=edit_player)

2. Select options (name, email, user_id) from the Gumlet WordPress plugin settings and save to show them over the video.

3. Use Gumlet shortcode to embed videos anywhere across WordPress website.

4. Sample shortcode to use - `[gumlet id=653f6137411da17d32e574a5]`

5. Define the width, height of the Embed inside the shortcode - `[gumlet id=653f6137411da17d32e574a5 width=800 height=600]`

6. Set audio track and caption language - `[gumlet id=653f6137411da17d32e574a5 audio_track_language=en caption_language=es]`

7. Embed videos directly with Gutenberg block

= API key (library & upload) =

1. Open your [Gumlet account API access](https://dash.gumlet.com/developer/api-keys) and create an API key.

2. In WordPress go to **Settings → Gumlet Video** and open the **API** tab. Paste the key and save. Use **Test connection** to verify.

3. In the **Gumlet Video** block, use **Browse library** to pick a video, or **Upload video file** to send a file directly to Gumlet (the file uploads from your browser to Gumlet; it is not stored in your Media Library). You can still paste an Asset ID manually.

4. Only users with the **Administrator** role can use these features; the key never leaves your server except for server-to-server calls to Gumlet.



= Get in touch! =

Still not sure? Come chat with us, we will honestly help you make the right choice.

* [Website](https://gumlet.com) (Chat available)
* Write to us at: support@gumlet.com
* Twitter - [gumletapp](https://twitter.com/gumletapp)
* Facebook - [gumletapp](https://www.facebook.com/gumletapp)



== Frequently Asked Questions ==

= Can I upload videos to my Gumlet account from WordPress? =

Yes, you can upload files to your Gumlet workspace within WordPress. You can also browse existing videos and embed them within WordPress.

= Can I use email and name in the dynamic watermark? =

Yes, you can use name, email and user_id in a combination as per your need.

= Is it free to use? =

Gumlet Video plugin is free to use. However, to use the dynamic watermark on your videos, you would need a Business plan. Learn more about plans [here](https://www.gumlet.com/pricing/?tab=video)

= Why can't editors use Browse library / Upload? =

Those actions call the Gumlet API through WordPress. Only users who can **manage_options** (typically Administrators) are allowed to use the proxy by design, so the API key stays limited to trusted roles.

== Changelog ==

= 1.3.0 =
* Added Gumlet API integration: server-side REST proxy (`/wp-json/gumlet-video/v1/*`), Settings → API tab for storing the API key and testing the connection
* Gutenberg block: Browse library (workspace/search), direct upload to Gumlet, and asset metadata preview (thumbnail, title, duration, status)
* Gumlet Video Library: Browse library (workspace/search), direct upload to Gumlet, and asset metadata preview (thumbnail, title, duration, status)
* Plugin version bump to 1.3.0

= 1.2.1 =
* Added support for latest WP versions

= 1.2.0 =
* Added audio_track_language parameter to shortcode for setting default audio track language
* Added caption_language parameter to shortcode for setting default caption language
* Added Default Audio Track Language and Default Caption Language controls to Gutenberg block

= 1.1.1 =
* Update docs for Gutenberg block support

= 1.0.5 =
* Added Gutenberg block support for Gumlet video embedding
* Updated security settings

= 1.0.4 =
* Fixed security issues - XSS

= 1.0.3 =
* Added support for user level analytics
* Fixed bug for non-logged in user for dynamic watermark

= 1.0 =
* First plugin version
* Shortcode to Embed Gumlet video
* Support for configuring dynamic watermarking parameters
