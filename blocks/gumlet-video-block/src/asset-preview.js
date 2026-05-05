/**
 * Show Gumlet asset metadata in the block editor (thumbnail, title, duration, status).
 */
import { useState, useEffect } from '@wordpress/element';
import { Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { getAsset } from './api';
import { gumletStatusShowsEncodeProgress } from './gumlet-asset-progress';

function formatDuration( sec ) {
	if ( sec == null || Number.isNaN( Number( sec ) ) ) {
		return '—';
	}
	const s = Math.floor( Number( sec ) );
	const m = Math.floor( s / 60 );
	const r = s % 60;
	return m > 0 ? `${ m }m ${ r }s` : `${ r }s`;
}

/**
 * @param {object} props
 * @param {string} props.assetId
 */
export default function AssetPreview( { assetId } ) {
	const [ data, setData ] = useState( null );
	const [ loading, setLoading ] = useState( true );
	const [ error, setError ] = useState( null );

	useEffect( () => {
		if ( ! assetId ) {
			setData( null );
			setLoading( false );
			return;
		}
		let cancelled = false;
		( async () => {
			setLoading( true );
			setError( null );
			try {
				const a = await getAsset( assetId );
				if ( ! cancelled ) {
					setData( a );
				}
			} catch ( e ) {
				if ( ! cancelled ) {
					setError(
						e?.message ||
							__( 'Could not load asset details.', 'gumlet-video' )
					);
				}
			} finally {
				if ( ! cancelled ) {
					setLoading( false );
				}
			}
		} )();
		return () => {
			cancelled = true;
		};
	}, [ assetId ] );

	if ( ! assetId ) {
		return null;
	}

	if ( loading ) {
		return (
			<div style={ { padding: '8px 0' } }>
				<Spinner />
			</div>
		);
	}

	if ( error ) {
		return (
			<p style={ { color: '#b32d2e', fontSize: '12px' } } role="alert">
				{ error }
			</p>
		);
	}

	const thumb = data?.output?.thumbnail_url?.[ 0 ];
	const title =
		( data?.input?.title && String( data.input.title ).trim() ) ||
		data?.asset_id ||
		'—';
	const duration = formatDuration( data?.input?.duration );
	const status = data?.status || '—';
	const prog =
		gumletStatusShowsEncodeProgress( data?.status ) &&
		data?.progress != null
			? `${ data.progress }%`
			: '';

	return (
		<div
			className="gumlet-asset-preview"
			style={ {
				display: 'flex',
				gap: '12px',
				alignItems: 'flex-start',
				marginBottom: '12px',
				padding: '10px',
				background: '#f6f7f7',
				border: '1px solid #ddd',
				borderRadius: '4px',
			} }
		>
			<div
				style={ {
					width: '120px',
					flexShrink: 0,
					aspectRatio: '16/9',
					background: '#eee',
					borderRadius: '2px',
					overflow: 'hidden',
				} }
			>
				{ thumb ? (
					<img
						src={ thumb }
						alt=""
						style={ {
							width: '100%',
							height: '100%',
							objectFit: 'cover',
						} }
					/>
				) : (
					<div
						style={ {
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							height: '100%',
							fontSize: '11px',
							color: '#666',
						} }
					>
						{ __( 'No thumbnail', 'gumlet-video' ) }
					</div>
				) }
			</div>
			<div style={ { flex: 1, minWidth: 0 } }>
				<div style={ { fontWeight: 600, marginBottom: '4px' } }>
					{ title }
				</div>
				<div style={ { fontSize: '12px', color: '#555' } }>
					<strong>{ __( 'Duration:', 'gumlet-video' ) }</strong>{ ' ' }
					{ duration }
				</div>
				<div style={ { fontSize: '12px', color: '#555' } }>
					<strong>{ __( 'Status:', 'gumlet-video' ) }</strong>{ ' ' }
					{ status }
					{ prog ? ` (${ prog })` : '' }
				</div>
				<div style={ { fontSize: '11px', color: '#777', marginTop: '4px' } }>
					{ __( 'Asset ID:', 'gumlet-video' ) }{ ' ' }
					<code>{ data?.asset_id }</code>
				</div>
			</div>
		</div>
	);
}
