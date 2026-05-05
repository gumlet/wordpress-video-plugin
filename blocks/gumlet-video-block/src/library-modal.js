/**
 * Modal to browse Gumlet workspaces and pick an asset.
 */
import { useState, useEffect } from '@wordpress/element';
import {
	Modal,
	SelectControl,
	TextControl,
	Button,
	Spinner,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { listWorkspaces, listAssets } from './api';
import { assetThumb, assetTitle } from './library-utils';

/**
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {Function} props.onRequestClose
 * @param {Function} props.onSelect Called with asset id string.
 */
export default function LibraryModal( {
	isOpen,
	onRequestClose,
	onSelect,
} ) {
	const [ workspaces, setWorkspaces ] = useState( [] );
	const [ workspaceId, setWorkspaceId ] = useState( '' );
	const [ search, setSearch ] = useState( '' );
	const [ searchDebounced, setSearchDebounced ] = useState( '' );
	const [ assets, setAssets ] = useState( [] );
	const [ total, setTotal ] = useState( 0 );
	const [ loading, setLoading ] = useState( false );
	const [ loadingMore, setLoadingMore ] = useState( false );
	const [ error, setError ] = useState( null );
	const pageSize = 40;

	useEffect( () => {
		const t = setTimeout( () => {
			setSearchDebounced( search );
		}, 400 );
		return () => clearTimeout( t );
	}, [ search ] );

	// Load workspaces when modal opens.
	useEffect( () => {
		if ( ! isOpen ) {
			return;
		}
		let cancelled = false;
		( async () => {
			setError( null );
			setLoading( true );
			try {
				const res = await listWorkspaces( false );
				const list = res?.all_sources || [];
				if ( cancelled ) {
					return;
				}
				setWorkspaces( list );
				setWorkspaceId( list[ 0 ]?.id || '' );
			} catch ( e ) {
				if ( ! cancelled ) {
					setError(
						e?.message ||
							__(
								'Could not load workspaces. Set your API key under Settings → Gumlet Video → API.',
								'gumlet-video'
							)
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
	}, [ isOpen ] );

	// Load first page when filters change.
	useEffect( () => {
		if ( ! isOpen || ! workspaceId ) {
			return;
		}
		let cancelled = false;
		( async () => {
			setLoading( true );
			setError( null );
			try {
				const q = {
					offset: '0',
					size: String( pageSize ),
				};
				if ( searchDebounced ) {
					q.title = searchDebounced;
				}
				const res = await listAssets( workspaceId, q );
				if ( cancelled ) {
					return;
				}
				const rows = res?.all_assets || [];
				setTotal( Number( res?.total_asset_count || 0 ) );
				setAssets( rows );
			} catch ( e ) {
				if ( ! cancelled ) {
					setError(
						e?.message ||
							__( 'Could not load assets.', 'gumlet-video' )
					);
					setAssets( [] );
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
	}, [ isOpen, workspaceId, searchDebounced, pageSize ] );

	const onLoadMore = async () => {
		if ( ! workspaceId ) {
			return;
		}
		setLoadingMore( true );
		setError( null );
		try {
			const q = {
				offset: String( assets.length ),
				size: String( pageSize ),
			};
			if ( searchDebounced ) {
				q.title = searchDebounced;
			}
			const res = await listAssets( workspaceId, q );
			const rows = res?.all_assets || [];
			setTotal( Number( res?.total_asset_count || 0 ) );
			setAssets( ( prev ) => [ ...prev, ...rows ] );
		} catch ( e ) {
			setError(
				e?.message || __( 'Could not load more assets.', 'gumlet-video' )
			);
		} finally {
			setLoadingMore( false );
		}
	};

	const workspaceOptions = workspaces.map( ( w ) => ( {
		label: w.name || w.id,
		value: w.id,
	} ) );

	const hasMore = assets.length < total;

	if ( ! isOpen ) {
		return null;
	}

	return (
		<Modal
			title={ __( 'Choose Gumlet video', 'gumlet-video' ) }
			onRequestClose={ onRequestClose }
			className="gumlet-library-modal"
			style={ { maxWidth: '900px' } }
		>
			{ error && (
				<p style={ { color: '#b32d2e' } } role="alert">
					{ error }
				</p>
			) }

			<div
				style={ {
					display: 'grid',
					gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
					gap: '12px',
					marginBottom: '12px',
					alignItems: 'end',
				} }
			>
				<div style={ { minWidth: 0 } }>
					<SelectControl
						label={ __( 'Workspace', 'gumlet-video' ) }
						value={ workspaceId }
						options={
							workspaceOptions.length
								? workspaceOptions
								: [
										{
											label: __(
												'— Select —',
												'gumlet-video'
											),
											value: '',
										},
								  ]
						}
						onChange={ setWorkspaceId }
						disabled={ loading && ! workspaces.length }
					/>
				</div>
				<div style={ { minWidth: 0 } }>
					<TextControl
						label={ __( 'Search by title', 'gumlet-video' ) }
						value={ search }
						onChange={ setSearch }
						placeholder={ __(
							'Filter assets…',
							'gumlet-video'
						) }
					/>
				</div>
			</div>

			{ loading && ! assets.length ? (
				<div style={ { textAlign: 'center', padding: '24px' } }>
					<Spinner />
				</div>
			) : (
				<div
					style={ {
						maxHeight: '420px',
						overflowY: 'auto',
						border: '1px solid #ddd',
						borderRadius: '4px',
						padding: '8px',
					} }
				>
					<div
						style={ {
							display: 'grid',
							gridTemplateColumns:
								'repeat(4, minmax(0, 1fr))',
							gap: '10px',
						} }
					>
						{ assets.map( ( asset ) => {
							const id = asset.asset_id;
							const thumb = assetThumb( asset );
							const title = assetTitle( asset );
							const status = asset.status || '';
							return (
								<button
									key={ id }
									type="button"
									onClick={ () => {
										onSelect( id );
										onRequestClose();
									} }
									style={ {
										border: '1px solid #ccc',
										borderRadius: '4px',
										padding: '6px',
										background: '#fff',
										cursor: 'pointer',
										textAlign: 'left',
									} }
								>
									<div
										style={ {
											aspectRatio: '16/9',
											background: '#eee',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											overflow: 'hidden',
											borderRadius: '2px',
											marginBottom: '6px',
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
											<span
												style={ {
													fontSize: '11px',
													color: '#666',
												} }
											>
												{ __( 'No thumb', 'gumlet-video' ) }
											</span>
										) }
									</div>
									<div
										style={ {
											fontSize: '12px',
											fontWeight: 600,
											lineHeight: 1.3,
											overflow: 'hidden',
											textOverflow: 'ellipsis',
											display: '-webkit-box',
											WebkitLineClamp: 2,
											WebkitBoxOrient: 'vertical',
										} }
									>
										{ title }
									</div>
									<div
										style={ {
											fontSize: '11px',
											color: '#666',
											marginTop: '4px',
										} }
									>
										{ status }
									</div>
								</button>
							);
						} ) }
					</div>

					{ ! assets.length && ! loading && (
						<p style={ { textAlign: 'center', color: '#666' } }>
							{ __(
								'No assets found. Try another workspace or search.',
								'gumlet-video'
							) }
						</p>
					) }

					{ hasMore && (
						<div style={ { textAlign: 'center', marginTop: '12px' } }>
							<Button
								variant="secondary"
								onClick={ onLoadMore }
								disabled={ loadingMore }
							>
								{ loadingMore ? (
									<Spinner />
								) : (
									__( 'Load more', 'gumlet-video' )
								) }
							</Button>
						</div>
					) }
				</div>
			) }
		</Modal>
	);
}
