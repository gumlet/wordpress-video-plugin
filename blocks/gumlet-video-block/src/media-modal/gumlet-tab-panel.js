/**
 * Gumlet tab content inside the native wp.media modal.
 */
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import GumletUploader from '../uploader';
import LibraryBrowseInline from './library-browse-inline';

/**
 * @param {object} props
 * @param {Function} props.onAssetChosen Called with Gumlet asset id when upload or browse completes.
 */
export default function GumletTabPanel( { onAssetChosen } ) {
	const [ uploadStatus, setUploadStatus ] = useState( '' );

	return (
		<div
			className="gumlet-media-modal-tab-panel"
			style={ { padding: '16px' } }
		>
			<LibraryBrowseInline onSelect={ onAssetChosen } />

			<h3
				style={ {
					margin: '0 0 12px',
					fontSize: '13px',
					fontWeight: 600,
				} }
			>
				{ __( 'Upload video or audio', 'gumlet-video' ) }
			</h3>
			<GumletUploader
				onUploaded={ onAssetChosen }
				onStatus={ setUploadStatus }
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
		</div>
	);
}
