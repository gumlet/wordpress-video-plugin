# Gumlet Wordpress Video Plugin


An official plugin by Gumlet for video embedding, dynamic watermark configuration, user level analytics and shortcode.

Description
-----------

> **The plugin offers dynamic watermarking, player customisation and embed shortcode for Gumlet videos**
>
> * Automate your video security using dynamic watermark support
> * Select specific user data such as name, email, id to show as the dynamic watermark
> * Use shortcode to embed videos quickly
> * Add videos using gutenberg block
> * Responsive video embeds or use custom dimensions
> * CDN delivery by AWS CloudFront (215+ locations)
> * Track user level analytics for deeper insights
> * Browse Gumlet workspaces, upload videos from the block editor, and preview asset metadata (requires API key – see below)

This is the plugin you ever need to secure videos!

### Gumlet API key (library & upload)

1. Create an API key in your [Gumlet dashboard](https://dash.gumlet.com/developer/api-keys).
2. In WordPress: **Settings → Gumlet Video → API**: paste the key, save, then **Test connection**.
3. In the **Gumlet Video** block use **Browse library** or **Upload video file**, or paste an Asset ID manually.

The API key is stored in your WordPress database and used only on the server to call Gumlet; uploads go from the browser directly to Gumlet’s storage using a signed URL. Only users who can **manage_options** (typically Administrators) can use these tools.


Installation Guide for Dynamic Watermark
----------------------------------------

1. Enable the dynamic watermark and set the visual configuration in the player settings options on Video CMS. Visit [https://dashboard.gumlet.com/video/manage?tab=edit_player](https://dashboard.gumlet.com/video/manage?tab=edit_player)

2. Select options (name, email, user_id) from the Gumlet WordPress plugin settings and save them to show them over the video.

3. Use Gumlet shortcode to embed videos anywhere across the WordPress website.

4. Sample shortcode to use - `[gumlet id=653f6137411da17d32e574a5]`

5. Define the width and height of the Embed inside the shortcode - `[gumlet id=653f6137411da17d32e574a5 width=800 height=600]`

6. Embed videos directly with Gutenberg block



Get in touch!
-------------

Still not sure? Come chat with us, we will honestly help you make the right choice.

* [Website](https://gumlet.com) (Chat available)
* Write to us at: support@gumlet.com
* Twitter - [gumletapp](https://twitter.com/gumletapp)
* Facebook - [gumletapp](https://www.facebook.com/gumletapp)



Frequently Asked Questions
--------------------------

> **Can I use email and name in the dynamic watermark?**

> Yes, you can use name, email, and user_id in a combination as per your need.

> **Is it free to use?**

> Gumlet Video plugin is free to use. However, to use the dynamic watermark on your videos, you would need a Business plan. Learn more about plans [here](https://www.gumlet.com/pricing/?tab=video)
