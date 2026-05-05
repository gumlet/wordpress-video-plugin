// src/index.js

import { useState, createInterpolateElement } from '@wordpress/element';
import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	TextControl,
	ToggleControl,
	SelectControl,
	Button,
} from '@wordpress/components';
import GumletIcon from './icon';
import LibraryModal from './library-modal';
import GumletUploader from './uploader';
import AssetPreview from './asset-preview';

registerBlockType( 'gumlet/gumlet-video-block', {
	icon: GumletIcon,
	edit: EditComponent,
	save: SaveComponent,
} );

/**
 * Generates the Gumlet video embed URL with the provided parameters
 */
function generateEmbedUrl( attributes ) {
	const {
		id,
		autoplay,
		loop,
		audio_track_language,
		caption_language,
	} = attributes;

	let url = `https://play.gumlet.io/embed/${ id }?`;

	if ( autoplay ) {
		url += 'autoplay=true&';
	}
	if ( loop ) {
		url += 'loop=true&';
	}
	if ( audio_track_language ) {
		url += `audio_track_language=${ encodeURIComponent(
			audio_track_language
		) }&`;
	}
	if ( caption_language ) {
		url += `caption_language=${ encodeURIComponent(
			caption_language
		) }&`;
	}

	return url.replace( /[?&]$/, '' );
}

/**
 * Edit component: provides controls and preview
 */
function EditComponent( { attributes, setAttributes } ) {
	const {
		id,
		width,
		height,
		autoplay,
		loop,
		audio_track_language,
		caption_language,
	} = attributes;

	const [ libraryOpen, setLibraryOpen ] = useState( false );
	const [ uploadStatus, setUploadStatus ] = useState( '' );
	const [ uploadActive, setUploadActive ] = useState( false );

	const blockProps = useBlockProps( {
		className: `align${ attributes.align }`,
	} );

	const dimensionOptions = [
		{ label: '100%', value: '100%' },
		{ label: '75%', value: '75%' },
		{ label: '50%', value: '50%' },
		{ label: '25%', value: '25%' },
		{
			label: 'Custom',
			value: 'custom',
			placeholder: 'e.g. 1000px or 50%',
		},
	];

	const handleDimensionChange = ( dimension, value, isCustom = false ) => {
		if ( value === 'custom' ) {
			setAttributes( { [ dimension ]: '' } );
		} else if ( isCustom ) {
			setAttributes( { [ dimension ]: value } );
		} else {
			setAttributes( { [ dimension ]: value } );
		}
	};

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Gumlet Video Settings', 'gumlet-video' ) }>
					{ ( id || ! uploadActive ) && (
						<TextControl
							label={ __( 'Asset ID', 'gumlet-video' ) }
							value={ id }
							onChange={ ( newVal ) =>
								setAttributes( { id: newVal } )
							}
							help={ __(
								'Enter the Gumlet Asset ID or use Browse library / Upload below.',
								'gumlet-video'
							) }
						/>
					) }

					<SelectControl
						label={ __( 'Width', 'gumlet-video' ) }
						value={
							width === ''
								? 'custom'
								: dimensionOptions.some(
										( opt ) => opt.value === width
								  )
								? width
								: 'custom'
						}
						options={ dimensionOptions }
						onChange={ ( newVal ) =>
							handleDimensionChange( 'width', newVal )
						}
					/>

					{ ( width === '' ||
						! dimensionOptions.some(
							( opt ) => opt.value === width
						) ) && (
						<TextControl
							label={ __( 'Custom Width', 'gumlet-video' ) }
							value={ width }
							onChange={ ( newVal ) =>
								handleDimensionChange(
									'width',
									newVal,
									true
								)
							}
							placeholder={ __(
								'e.g. 1000px or 50%',
								'gumlet-video'
							) }
							help={ __(
								'Enter width in px or %',
								'gumlet-video'
							) }
						/>
					) }

					<SelectControl
						label={ __( 'Height', 'gumlet-video' ) }
						value={
							height === ''
								? 'custom'
								: dimensionOptions.some(
										( opt ) => opt.value === height
								  )
								? height
								: 'custom'
						}
						options={ dimensionOptions }
						onChange={ ( newVal ) =>
							handleDimensionChange( 'height', newVal )
						}
					/>

					{ ( height === '' ||
						! dimensionOptions.some(
							( opt ) => opt.value === height
						) ) && (
						<TextControl
							label={ __( 'Custom Height', 'gumlet-video' ) }
							value={ height }
							onChange={ ( newVal ) =>
								handleDimensionChange(
									'height',
									newVal,
									true
								)
							}
							placeholder={ __(
								'e.g. 1000px or 50%',
								'gumlet-video'
							) }
							help={ __(
								'Enter height in px or %',
								'gumlet-video'
							) }
						/>
					) }

					<ToggleControl
						label={ __( 'Autoplay', 'gumlet-video' ) }
						checked={ autoplay }
						onChange={ ( newVal ) =>
							setAttributes( { autoplay: newVal } )
						}
					/>

					<ToggleControl
						label={ __( 'Loop', 'gumlet-video' ) }
						checked={ loop }
						onChange={ ( newVal ) =>
							setAttributes( { loop: newVal } )
						}
					/>

					<TextControl
						label={ __(
							'Default Audio Track Language',
							'gumlet-video'
						) }
						value={ audio_track_language }
						onChange={ ( newVal ) =>
							setAttributes( {
								audio_track_language: newVal,
							} )
						}
						help={ __(
							'Enter the language code for the audio track (e.g., en, es, fr).',
							'gumlet-video'
						) }
					/>

					<TextControl
						label={ __(
							'Default Caption Language',
							'gumlet-video'
						) }
						value={ caption_language }
						onChange={ ( newVal ) =>
							setAttributes( {
								caption_language: newVal,
							} )
						}
						help={ __(
							'Enter the language code for captions (e.g., en, es, fr).',
							'gumlet-video'
						) }
					/>
				</PanelBody>
			</InspectorControls>

			<LibraryModal
				isOpen={ libraryOpen }
				onRequestClose={ () => setLibraryOpen( false ) }
				onSelect={ ( assetId ) =>
					setAttributes( { id: assetId } )
				}
			/>

			<div { ...blockProps }>
				{ ! id ? (
					<div
						style={ {
							textAlign: 'left',
							padding: '1.5em',
							backgroundColor: '#f0f0f0',
							border: '1px dashed #999',
							marginBottom: '1em',
						} }
					>
						<p style={ { marginTop: 0 } }>
							<strong>
								{ __(
									'Gumlet Video',
									'gumlet-video'
								) }
							</strong>
						</p>
						<p style={ { fontSize: '13px', color: '#555' } }>
							{ createInterpolateElement(
								__(
									'Browse your Gumlet library, upload a video or audio file (from <a>Gumlet API Dashboard</a>), or paste an Asset ID.',
									'gumlet-video'
								),
								{
									a: (
										<a
											href="https://dash.gumlet.com/developer/api-keys"
											target="_blank"
											rel="noopener noreferrer"
											style={ { color: '#2271b1' } }
										>
											{ __( 'Gumlet API Dashboard', 'gumlet-video' ) }
										</a>
									),
								}
							) }
						</p>
						<div
							style={ {
								display: 'flex',
								flexWrap: 'wrap',
								gap: '8px',
								marginBottom: '12px',
							} }
						>
							<Button
								variant="primary"
								onClick={ () => setLibraryOpen( true ) }
							>
								{ __( 'Browse library', 'gumlet-video' ) }
							</Button>
						</div>
						<GumletUploader
							onUploaded={ ( assetId ) =>
								setAttributes( { id: assetId } )
							}
							onStatus={ setUploadStatus }
							onUploadActiveChange={ setUploadActive }
						/>
						{ uploadStatus && (
							<p
								style={ {
									fontSize: '12px',
									color: '#2271b1',
									marginBottom: '12px',
								} }
							>
								{ uploadStatus }
							</p>
						) }
						{ ! uploadActive && (
							<TextControl
								label={ __(
									'Or enter Asset ID manually',
									'gumlet-video'
								) }
								value={ id }
								onChange={ ( newVal ) =>
									setAttributes( { id: newVal } )
								}
								placeholder={ __(
									'e.g. 653f6137411da17d32e574a5',
									'gumlet-video'
								) }
							/>
						) }
					</div>
				) : (
					<>
						<AssetPreview assetId={ id } />
						<div
							className="gumlet-video-container"
							style={ {
								position: 'relative',
								paddingTop: '56.25%',
								width,
								margin: '0 auto',
							} }
						>
							<iframe
								src={ generateEmbedUrl( attributes ) }
								style={ {
									position: 'absolute',
									top: 0,
									left: 0,
									width: '100%',
									height: '100%',
									border: 'none',
								} }
								title={ __(
									'Gumlet Video Player',
									'gumlet-video'
								) }
								allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen;"
								frameBorder="0"
							/>
						</div>
					</>
				) }
			</div>
		</>
	);
}

/**
 * Save component: server-side rendering handles output (shortcode parity).
 */
function SaveComponent() {
	return null;
}
