// src/index.js

import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	TextControl,
	ToggleControl,
	SelectControl,
} from '@wordpress/components';

/**
 * Generates the Gumlet video embed URL with the provided parameters
 */
function generateEmbedUrl(attributes) {
	const {
		assetId,
		autoplay,
		loop,
		controls,
		ccEnabled,
		userAnalytics
	} = attributes;

	let url = `https://play.gumlet.io/embed/${assetId}?`;
	
	if (autoplay) url += "autoplay=true&";
	if (loop) url += "loop=true&";
	if (!controls) url += "disable_player_controls=false&";
	if (ccEnabled) url += "caption=true&";
	
	// User analytics will be handled server-side
	return url.slice(0, -1); // Remove trailing & or ?
}

/**
 * Edit component: provides controls and preview
 */
function EditComponent({ attributes, setAttributes }) {
	const {
		assetId,
		width,
		height,
		ccEnabled,
		autoplay,
		loop,
		controls,
		userAnalytics
	} = attributes;

	const blockProps = useBlockProps({
		className: `align${attributes.align}`,
	});

	const dimensionOptions = [
		{ label: '100%', value: '100%' },
		{ label: '75%', value: '75%' },
		{ label: '50%', value: '50%' },
		{ label: '25%', value: '25%' },
		{ label: 'Custom', value: 'custom' }
	];

	return (
		<>
			<InspectorControls>
				<PanelBody title={__('Gumlet Video Settings', 'gumlet-video')}>
					<TextControl
						label={__('Asset ID', 'gumlet-video')}
						value={assetId}
						onChange={(newVal) => setAttributes({ assetId: newVal })}
						help={__('Enter the Gumlet Asset ID.', 'gumlet-video')}
					/>
					
					<SelectControl
						label={__('Width', 'gumlet-video')}
						value={width}
						options={dimensionOptions}
						onChange={(newVal) => setAttributes({ width: newVal })}
					/>

					{width === 'custom' && (
						<TextControl
							label={__('Custom Width', 'gumlet-video')}
							value={width}
							onChange={(newVal) => setAttributes({ width: newVal })}
							help={__('Enter width in px or %', 'gumlet-video')}
						/>
					)}

					<SelectControl
						label={__('Height', 'gumlet-video')}
						value={height}
						options={dimensionOptions}
						onChange={(newVal) => setAttributes({ height: newVal })}
					/>

					{height === 'custom' && (
						<TextControl
							label={__('Custom Height', 'gumlet-video')}
							value={height}
							onChange={(newVal) => setAttributes({ height: newVal })}
							help={__('Enter height in px or %', 'gumlet-video')}
						/>
					)}

					<ToggleControl
						label={__('Enable Closed Captions', 'gumlet-video')}
						checked={ccEnabled}
						onChange={(newVal) => setAttributes({ ccEnabled: newVal })}
					/>

					<ToggleControl
						label={__('Autoplay', 'gumlet-video')}
						checked={autoplay}
						onChange={(newVal) => setAttributes({ autoplay: newVal })}
					/>

					<ToggleControl
						label={__('Loop', 'gumlet-video')}
						checked={loop}
						onChange={(newVal) => setAttributes({ loop: newVal })}
					/>

					<ToggleControl
						label={__('Show Player Controls', 'gumlet-video')}
						checked={controls}
						onChange={(newVal) => setAttributes({ controls: newVal })}
					/>

					<ToggleControl
						label={__('Enable User Analytics', 'gumlet-video')}
						checked={userAnalytics}
						onChange={(newVal) => setAttributes({ userAnalytics: newVal })}
					/>
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				{assetId ? (
					<div className="gumlet-video-container" style={{
						position: 'relative',
						paddingTop: '56.25%', // 16:9 Aspect Ratio
						width: width,
						margin: '0 auto'
					}}>
						<iframe
							src={generateEmbedUrl(attributes)}
							style={{
								position: 'absolute',
								top: 0,
								left: 0,
								width: '100%',
								height: '100%',
								border: 'none'
							}}
							title={__('Gumlet Video Player', 'gumlet-video')}
							allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen;"
							frameBorder="0"
						/>
					</div>
				) : (
					<p style={{ textAlign: 'center', padding: '2em', backgroundColor: '#f0f0f0', border: '1px dashed #999' }}>
						{__('Please enter an Asset ID in the block settings.', 'gumlet-video')}
					</p>
				)}
			</div>
		</>
	);
}

/**
 * Save component: We'll let the server-side handle the rendering
 * to ensure proper user analytics and watermarking
 */
function SaveComponent({ attributes }) {
	return null; // Server-side rendering will handle this
}

/**
 * Register the block
 */
registerBlockType('gumlet/gumlet-video-block', {
	edit: EditComponent,
	save: SaveComponent,
});
