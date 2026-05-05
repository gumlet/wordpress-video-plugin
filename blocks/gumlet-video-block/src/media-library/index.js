/**
 * Media → Gumlet Video Library (standalone admin).
 */
import {
	render,
	createElement,
	useState,
	useEffect,
	useCallback,
} from '@wordpress/element';
import {
	SelectControl,
	TextControl,
	Button,
	Spinner,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { assetThumb, assetTitle } from '../library-utils';
import { listWorkspaces, listAssets } from '../api';
import GumletUploader from '../uploader';

const cfg =
	typeof window !== 'undefined' ? window.gumletMediaLibrary || {} : {};

if ( cfg.restRoot && cfg.nonce ) {
	if ( typeof apiFetch.createNonceMiddleware === 'function' ) {
		apiFetch.use( apiFetch.createNonceMiddleware( cfg.nonce ) );
	}
	if ( typeof apiFetch.createRootURLMiddleware === 'function' ) {
		apiFetch.use( apiFetch.createRootURLMiddleware( cfg.restRoot ) );
	}
}

function embedPreviewUrl( assetId ) {
	return `https://play.gumlet.io/embed/${ encodeURIComponent( assetId ) }`;
}

function newPostWithAssetUrl( assetId ) {
	const base = cfg.newPostUrl || '';
	try {
		const u = new URL( base, window.location.origin );
		u.searchParams.set( 'gumlet_asset_id', assetId );
		return u.toString();
	} catch {
		return (
			base +
			( base.includes( '?' ) ? '&' : '?' ) +
			'gumlet_asset_id=' +
			encodeURIComponent( assetId )
		);
	}
}

function MediaLibraryApp() {
	const pageSize = 32;
	const [ workspaces, setWorkspaces ] = useState( [] );
	const [ workspaceId, setWorkspaceId ] = useState( '' );
	const [ search, setSearch ] = useState( '' );
	const [ searchDebounced, setSearchDebounced ] = useState( '' );
	const [ assets, setAssets ] = useState( [] );
	const [ total, setTotal ] = useState( 0 );
	const [ loading, setLoading ] = useState( false );
	const [ loadingMore, setLoadingMore ] = useState( false );
	const [ error, setError ] = useState( null );
	const [ selectedId, setSelectedId ] = useState( null );
	const [ copyNotice, setCopyNotice ] = useState( false );

	useEffect( () => {
		const t = setTimeout( () => {
			setSearchDebounced( search );
		}, 400 );
		return () => clearTimeout( t );
	}, [ search ] );

	useEffect( () => {
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
	}, [] );

	useEffect( () => {
		if ( ! workspaceId ) {
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
					sortBy: 'created_at',
					orderBy: 'desc',
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
				setSelectedId( null );
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
	}, [ workspaceId, searchDebounced, pageSize ] );

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
				sortBy: 'created_at',
				orderBy: 'desc',
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
	const selectedAsset =
		selectedId && assets.find( ( a ) => a.asset_id === selectedId );

	const reloadFirstPage = useCallback( async () => {
		if ( ! workspaceId ) {
			return;
		}
		try {
			const q = {
				offset: '0',
				size: String( pageSize ),
				sortBy: 'created_at',
				orderBy: 'desc',
			};
			if ( searchDebounced ) {
				q.title = searchDebounced;
			}
			const res = await listAssets( workspaceId, q );
			setTotal( Number( res?.total_asset_count || 0 ) );
			setAssets( res?.all_assets || [] );
		} catch {
			/* best-effort refresh after upload */
		}
	}, [ workspaceId, searchDebounced, pageSize ] );

	const copyId = async () => {
		if ( ! selectedId ) {
			return;
		}
		try {
			await navigator.clipboard.writeText( selectedId );
			setCopyNotice( true );
			setTimeout( () => setCopyNotice( false ), 2500 );
		} catch {
			setCopyNotice( false );
		}
	};

	return (
		<div className="gumlet-media-library-app" style={ { marginTop: '16px' } }>
			{ error && (
				<p style={ { color: '#b32d2e' } } role="alert">
					{ error }
					{ cfg.settingsUrl ? (
						<>
							{ ' ' }
							<a href={ cfg.settingsUrl }>
								{ __( 'Open API settings', 'gumlet-video' ) }
							</a>
						</>
					) : null }
				</p>
			) }

			<div
				style={ {
					display: 'grid',
					gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
					gap: '12px',
					marginBottom: '16px',
					alignItems: 'end',
					maxWidth: '920px',
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

			<div
				style={ {
					maxWidth: '920px',
					marginBottom: '20px',
					padding: '14px 16px',
					background: '#fff',
					border: '1px solid #c3c4c7',
					borderRadius: '4px',
				} }
			>
				<h2
					style={ {
						margin: '0 0 10px',
						fontSize: '14px',
						fontWeight: 600,
					} }
				>
					{ __( 'Upload to Gumlet', 'gumlet-video' ) }
				</h2>
				<p
					style={ {
						margin: '0 0 12px',
						fontSize: '13px',
						color: '#646970',
					} }
				>
					{ __(
						'Uses the workspace selected above. Only video and audio files are allowed.',
						'gumlet-video'
					) }
				</p>
				<GumletUploader
					useParentWorkspace
					parentWorkspaceId={ workspaceId }
					adminLibrary
					onAfterIngest={ reloadFirstPage }
					onUploaded={ ( assetId ) => {
						setSelectedId( assetId );
						setCopyNotice( false );
						reloadFirstPage();
					} }
				/>
			</div>

			{ loading && ! assets.length ? (
				<div style={ { textAlign: 'center', padding: '48px' } }>
					<Spinner />
				</div>
			) : (
				<div
					style={ {
						maxHeight: 'min(70vh, 640px)',
						overflowY: 'auto',
						border: '1px solid #c3c4c7',
						borderRadius: '4px',
						padding: '12px',
						background: '#fff',
						maxWidth: '920px',
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
							const isSel = selectedId === id;
							return (
								<div
									key={ id }
									style={ {
										border: isSel
											? '2px solid #2271b1'
											: '1px solid #c3c4c7',
										borderRadius: '4px',
										padding: '6px',
										background: '#fff',
										display: 'flex',
										flexDirection: 'column',
									} }
								>
									<button
										type="button"
										onClick={ () =>
											setSelectedId(
												id === selectedId ? null : id
											)
										}
										style={ {
											border: 'none',
											background: 'transparent',
											padding: 0,
											cursor: 'pointer',
											textAlign: 'left',
											width: '100%',
											flex: '1 1 auto',
											outline: 'none',
										} }
									>
										<div
											style={ {
												aspectRatio: '16/9',
												background: '#f0f0f1',
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
														color: '#646970',
													} }
												>
													{ __(
														'No thumb',
														'gumlet-video'
													) }
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
												color: '#646970',
												marginTop: '4px',
											} }
										>
											{ status }
										</div>
									</button>
									<Button
										variant="secondary"
										size="small"
										href={ newPostWithAssetUrl( id ) }
										style={ {
											width: '100%',
											marginTop: '8px',
											justifyContent: 'center',
										} }
									>
										{ __(
											'New post with this video',
											'gumlet-video'
										) }
									</Button>
								</div>
							);
						} ) }
					</div>

					{ ! assets.length && ! loading && (
						<p style={ { textAlign: 'center', color: '#646970' } }>
							{ __(
								'No assets found. Try another workspace or search.',
								'gumlet-video'
							) }
						</p>
					) }

					{ hasMore && (
						<div style={ { textAlign: 'center', marginTop: '14px' } }>
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

			{ selectedAsset && (
				<div
					style={ {
						marginTop: '20px',
						padding: '16px',
						maxWidth: '920px',
						border: '1px solid #c3c4c7',
						borderRadius: '4px',
						background: '#f6f7f7',
					} }
				>
					<h2
						style={ {
							margin: '0 0 8px',
							fontSize: '14px',
							fontWeight: 600,
						} }
					>
						{ __( 'Selected video', 'gumlet-video' ) }
					</h2>
					<p style={ { margin: '0 0 10px', fontSize: '13px' } }>
						<strong>{ __( 'Title:', 'gumlet-video' ) }</strong>{ ' ' }
						{ assetTitle( selectedAsset ) }
					</p>
					<p style={ { margin: '0 0 10px', fontSize: '13px' } }>
						<strong>{ __( 'Asset ID:', 'gumlet-video' ) }</strong>{ ' ' }
						<code
							style={ {
								fontSize: '13px',
								wordBreak: 'break-all',
							} }
						>
							{ selectedId }
						</code>
					</p>
					{ copyNotice && (
						<p
							style={ {
								margin: '0 0 10px',
								fontSize: '13px',
								color: '#008a20',
							} }
							role="status"
						>
							{ cfg.strings?.copied ||
								__( 'Asset ID copied to clipboard.', 'gumlet-video' ) }
						</p>
					) }
					<div
						style={ {
							display: 'flex',
							flexWrap: 'wrap',
							gap: '8px',
							alignItems: 'center',
						} }
					>
						<Button variant="secondary" onClick={ copyId }>
							{ __( 'Copy Asset ID', 'gumlet-video' ) }
						</Button>
						<Button
							variant="primary"
							href={ newPostWithAssetUrl( selectedId ) }
						>
							{ __( 'New post with this video', 'gumlet-video' ) }
						</Button>
						<Button
							variant="link"
							href={ embedPreviewUrl( selectedId ) }
							target="_blank"
							rel="noopener noreferrer"
						>
							{ __( 'Open player preview', 'gumlet-video' ) }
						</Button>
					</div>
				</div>
			) }
		</div>
	);
}

const root = document.getElementById( 'gumlet-media-library-root' );
if ( root ) {
	render( createElement( MediaLibraryApp ), root );
}
