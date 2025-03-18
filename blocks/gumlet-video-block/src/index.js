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
		id,
		autoplay,
		loop
	} = attributes;

	let url = `https://play.gumlet.io/embed/${id}?`;
	
	if (autoplay) url += "autoplay=true&";
	if (loop) url += "loop=true&";
	
	// User analytics will be handled server-side
	return url.slice(0, -1); // Remove trailing & or ?
}

/**
 * Edit component: provides controls and preview
 */
function EditComponent({ attributes, setAttributes }) {
	const {
		id,
		width,
		height,
		ccEnabled,
		autoplay,
		loop,
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

	// Helper function to handle dimension changes
	const handleDimensionChange = (dimension, value, isCustom = false) => {
		if (isCustom) {
			setAttributes({ [dimension]: value });
		} else {
			setAttributes({ [dimension]: value });
		}
	};

	return (
		<>
			<InspectorControls>
				<PanelBody title={__('Gumlet Video Settings', 'gumlet-video')}>
					<TextControl
						label={__('Asset ID', 'gumlet-video')}
						value={id}
						onChange={(newVal) => setAttributes({ id: newVal })}
						help={__('Enter the Gumlet Asset ID.', 'gumlet-video')}
					/>
					
					<SelectControl
						label={__('Width', 'gumlet-video')}
						value={width === 'custom' ? 'custom' : width}
						options={dimensionOptions}
						onChange={(newVal) => handleDimensionChange('width', newVal)}
					/>

					{width === 'custom' && (
						<TextControl
							label={__('Custom Width', 'gumlet-video')}
							value={width}
							onChange={(newVal) => handleDimensionChange('width', newVal, true)}
							help={__('Enter width in px or %', 'gumlet-video')}
						/>
					)}

					<SelectControl
						label={__('Height', 'gumlet-video')}
						value={height === 'custom' ? 'custom' : height}
						options={dimensionOptions}
						onChange={(newVal) => handleDimensionChange('height', newVal)}
					/>

					{height === 'custom' && (
						<TextControl
							label={__('Custom Height', 'gumlet-video')}
							value={height}
							onChange={(newVal) => handleDimensionChange('height', newVal, true)}
							help={__('Enter height in px or %', 'gumlet-video')}
						/>
					)}

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
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				{!id ? (
					<div style={{ 
						textAlign: 'center', 
						padding: '2em', 
						backgroundColor: '#f0f0f0', 
						border: '1px dashed #999',
						marginBottom: '1em'
					}}>
						<TextControl
							label={__('Enter Gumlet Asset ID', 'gumlet-video')}
							value={id}
							onChange={(newVal) => setAttributes({ id: newVal })}
							placeholder={__('e.g., abc123xyz', 'gumlet-video')}
							help={__('Paste your Gumlet Asset ID here to embed the video.', 'gumlet-video')}
						/>
					</div>
				) : (
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
