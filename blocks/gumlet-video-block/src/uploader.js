/**
 * Direct upload: create asset on Gumlet, PUT file to signed URL, then embed or wait for ready.
 */
import { useState, useEffect, useRef } from '@wordpress/element';
import { Button, SelectControl, Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { listWorkspaces, createUpload, getAsset } from './api';
import {
	GUMLET_UPLOAD_ACCEPT,
	isAllowedGumletUploadFile,
	getInvalidGumletUploadTypeMessage,
} from './upload-media-validation';
import {
	normalizeStatus,
	gumletEncodeProgressFraction,
} from './gumlet-asset-progress';

/**
 * PUT file bytes to pre-signed storage URL (browser → S3).
 *
 * @param {string} url
 * @param {File}   file
 * @param {Function} onProgress 0..1
 */
function putFile( url, file, onProgress ) {
	return new Promise( ( resolve, reject ) => {
		const xhr = new XMLHttpRequest();
		xhr.open( 'PUT', url );
		xhr.upload.onprogress = ( e ) => {
			if ( e.lengthComputable ) {
				onProgress( e.loaded / e.total );
			}
		};
		xhr.onload = () => {
			if ( xhr.status >= 200 && xhr.status < 300 ) {
				resolve();
			} else {
				reject(
					new Error(
						`Upload failed (${ xhr.status }): ${ xhr.statusText }`
					)
				);
			}
		};
		xhr.onerror = () =>
			reject( new Error( __( 'Network error during upload.', 'gumlet-video' ) ) );
		xhr.send( file );
	} );
}

/** Delay between Gumlet status checks (confirm / processing). */
const GUMLET_STATUS_POLL_MS = 5500;

/**
 * Poll until Gumlet moves the asset out of upload-pending (ingest acknowledged).
 *
 * @param {string} assetId
 * @param {object} opts
 * @param {number} [opts.intervalMs] default ~5.5s between checks
 * @param {number} [opts.maxAttempts]
 */
async function waitUntilPastUploadPending(
	assetId,
	{ intervalMs = GUMLET_STATUS_POLL_MS, maxAttempts = 120 } = {}
) {
	for ( let i = 0; i < maxAttempts; i++ ) {
		const asset = await getAsset( assetId );
		const st = normalizeStatus( asset?.status );
		if ( st === 'errored' ) {
			throw new Error(
				__(
					'Gumlet reported an error while ingesting this upload.',
					'gumlet-video'
				)
			);
		}
		if ( st !== 'upload-pending' ) {
			return asset;
		}
		await new Promise( ( r ) => setTimeout( r, intervalMs ) );
	}
	throw new Error(
		__(
			'Timed out waiting for Gumlet to finish receiving the file. Try again or embed using the Asset ID from your Gumlet dashboard.',
			'gumlet-video'
		)
	);
}

/**
 * Poll asset until ready or errored (or timeout).
 *
 * @param {string} assetId
 * @param {object} [opts]
 * @param {number} [opts.maxAttempts]
 * @param {Function} [opts.onPoll] Called with each asset payload while polling.
 */
async function waitForReady( assetId, { maxAttempts = 90, onPoll } = {} ) {
	for ( let i = 0; i < maxAttempts; i++ ) {
		const asset = await getAsset( assetId );
		if ( typeof onPoll === 'function' ) {
			onPoll( asset );
		}
		const st = normalizeStatus( asset?.status );
		if ( st === 'ready' || st === 'errored' ) {
			if ( st === 'errored' ) {
				throw new Error(
					__(
						'Gumlet reported an error while processing this video.',
						'gumlet-video'
					)
				);
			}
			return asset;
		}
		await new Promise( ( r ) => setTimeout( r, GUMLET_STATUS_POLL_MS ) );
	}
	const last = await getAsset( assetId );
	if ( typeof onPoll === 'function' ) {
		onPoll( last );
	}
	return last;
}

/**
 * @param {object} props
 * @param {Function} props.onUploaded Called with asset id when user embeds or when processing finishes.
 * @param {Function} props.onStatus    Optional (message: string) progress text.
 * @param {Function} props.onUploadActiveChange Optional (active: boolean) while upload / confirm / embed-choice flow runs.
 * @param {boolean}    [props.useParentWorkspace] Hide workspace control; use parentWorkspaceId for uploads.
 * @param {string}     [props.parentWorkspaceId] Required when useParentWorkspace.
 * @param {boolean}    [props.adminLibrary] Media admin: after ingest, reset uploader (no embed / wait UI).
 * @param {Function}   [props.onAfterIngest] Called with asset id once Gumlet leaves upload-pending (file received).
 */
export default function GumletUploader( {
	onUploaded,
	onStatus,
	onUploadActiveChange,
	useParentWorkspace = false,
	parentWorkspaceId = '',
	adminLibrary = false,
	onAfterIngest = null,
} ) {
	const fileInputRef = useRef( null );
	const onUploadActiveChangeRef = useRef( onUploadActiveChange );
	onUploadActiveChangeRef.current = onUploadActiveChange;
	const [ workspaces, setWorkspaces ] = useState( [] );
	const [ workspaceId, setWorkspaceId ] = useState( '' );
	const [ busy, setBusy ] = useState( false );
	const [ progress, setProgress ] = useState( 0 );
	const [ error, setError ] = useState( null );
	/** After upload leaves upload-pending: offer embed while Gumlet keeps processing */
	const [ embedChoice, setEmbedChoice ] = useState( null );
	/** User chose "Wait until ready" — keep progress UI visible until ready */
	const [ waitingForReady, setWaitingForReady ] = useState( false );
	/** Gumlet processing progress 0..1 from API `progress` while status is processing (null = unknown). */
	const [ remoteProgress, setRemoteProgress ] = useState( null );

	useEffect( () => {
		const active =
			busy || !! embedChoice || waitingForReady;
		if ( typeof onUploadActiveChangeRef.current === 'function' ) {
			onUploadActiveChangeRef.current( active );
		}
	}, [ busy, embedChoice, waitingForReady ] );

	useEffect( () => {
		return () => {
			if ( typeof onUploadActiveChangeRef.current === 'function' ) {
				onUploadActiveChangeRef.current( false );
			}
		};
	}, [] );

	// While user chooses embed vs wait, refresh status + processing % from Gumlet.
	useEffect( () => {
		const assetId = embedChoice?.assetId;
		if ( ! assetId ) {
			return;
		}
		let cancelled = false;
		const poll = async () => {
			try {
				const asset = await getAsset( assetId );
				if ( cancelled ) {
					return;
				}
				setRemoteProgress( gumletEncodeProgressFraction( asset ) );
				setEmbedChoice( ( prev ) => {
					if ( ! prev || prev.assetId !== assetId ) {
						return prev;
					}
					return {
						...prev,
						status: asset?.status || prev.status,
					};
				} );
			} catch {
				/* ignore transient poll errors */
			}
		};
		poll();
		const timer = setInterval( poll, GUMLET_STATUS_POLL_MS );
		return () => {
			cancelled = true;
			clearInterval( timer );
		};
	}, [ embedChoice?.assetId ] );

	useEffect( () => {
		if ( useParentWorkspace ) {
			return;
		}
		let cancelled = false;
		( async () => {
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
								'Could not load workspaces.',
								'gumlet-video'
							)
					);
				}
			}
		} )();
		return () => {
			cancelled = true;
		};
	}, [ useParentWorkspace ] );

	const workspaceOptions = workspaces.map( ( w ) => ( {
		label: w.name || w.id,
		value: w.id,
	} ) );

	const finishAndEmbed = ( assetId ) => {
		setEmbedChoice( null );
		setWaitingForReady( false );
		setProgress( 0 );
		setRemoteProgress( null );
		if ( onStatus ) {
			onStatus( '' );
		}
		onUploaded( assetId );
	};

	const uploadWorkspaceId = useParentWorkspace
		? parentWorkspaceId
		: workspaceId;

	const onPickFile = async ( ev ) => {
		const file = ev.target.files?.[ 0 ];
		ev.target.value = '';
		if ( ! file || ! uploadWorkspaceId ) {
			return;
		}
		if ( ! isAllowedGumletUploadFile( file ) ) {
			setError( getInvalidGumletUploadTypeMessage() );
			return;
		}
		setError( null );
		setEmbedChoice( null );
		setWaitingForReady( false );
		setRemoteProgress( null );
		setBusy( true );
		setProgress( 0 );
		if ( onStatus ) {
			onStatus( __( 'Creating upload…', 'gumlet-video' ) );
		}
		let skipProgressReset = false;
		try {
			const title =
				file.name?.replace( /\.[^/.]+$/, '' ) ||
				__( 'Untitled', 'gumlet-video' );
			const created = await createUpload( {
				workspace_id: uploadWorkspaceId,
				title,
			} );
			const assetId = created?.asset_id;
			const uploadUrl = created?.upload_url;
			if ( ! assetId || ! uploadUrl ) {
				throw new Error(
					__(
						'Invalid response from Gumlet (missing asset or upload URL).',
						'gumlet-video'
					)
				);
			}
			/* Progress bar shows upload / confirm; avoid duplicating text via onStatus in the block. */
			if ( onStatus ) {
				onStatus( '' );
			}
			await putFile( uploadUrl, file, setProgress );
			setProgress( 1 );
			const asset = await waitUntilPastUploadPending( assetId );
			if ( typeof onAfterIngest === 'function' ) {
				onAfterIngest( assetId );
			}
			const st = normalizeStatus( asset?.status );
			if ( adminLibrary || st === 'ready' ) {
				finishAndEmbed( assetId );
				return;
			}
			setBusy( false );
			/* Keep file bar at 100% until remote processing % is known */
			setProgress( 1 );
			setRemoteProgress( gumletEncodeProgressFraction( asset ) );
			setEmbedChoice( {
				assetId,
				status: asset?.status || '',
			} );
			if ( onStatus ) {
				onStatus( '' );
			}
			skipProgressReset = true;
		} catch ( e ) {
			const msg =
				e?.message ||
				__( 'Upload failed.', 'gumlet-video' );
			setError( msg );
			setRemoteProgress( null );
			if ( onStatus ) {
				onStatus( '' );
			}
		} finally {
			setBusy( false );
			if ( ! skipProgressReset ) {
				setProgress( 0 );
			}
		}
	};

	const onEmbedNow = () => {
		if ( ! embedChoice?.assetId ) {
			return;
		}
		finishAndEmbed( embedChoice.assetId );
	};

	const onWaitUntilReady = async () => {
		if ( ! embedChoice?.assetId ) {
			return;
		}
		const assetId = embedChoice.assetId;
		setEmbedChoice( null );
		setWaitingForReady( true );
		setBusy( true );
		setProgress( 1 );
		setError( null );
		if ( onStatus ) {
			onStatus( '' );
		}
		try {
			await waitForReady( assetId, {
				onPoll: ( asset ) => {
					setRemoteProgress( gumletEncodeProgressFraction( asset ) );
				},
			} );
			finishAndEmbed( assetId );
		} catch ( e ) {
			const msg =
				e?.message ||
				__( 'Processing failed.', 'gumlet-video' );
			setError( msg );
			setProgress( 0 );
			setRemoteProgress( null );
			if ( onStatus ) {
				onStatus( '' );
			}
		} finally {
			setBusy( false );
			setWaitingForReady( false );
		}
	};

	const controlsLocked = busy || !! embedChoice || waitingForReady;

	const showProgressBar =
		( busy && progress > 0 ) || !! embedChoice || waitingForReady;
	const gumletPct =
		remoteProgress != null
			? Math.round(
					Math.min( 1, Math.max( 0, remoteProgress ) ) * 100
			  )
			: null;
	const processingPhase = !! embedChoice || waitingForReady;
	const barIndeterminate = processingPhase && gumletPct == null;
	const barCaption = waitingForReady
		? __( 'Processing on Gumlet…', 'gumlet-video' )
		: embedChoice
			? __( 'Processing on Gumlet…', 'gumlet-video' )
			: busy && progress >= 1
				? __( 'Confirming upload with Gumlet…', 'gumlet-video' )
				: __( 'Uploading file…', 'gumlet-video' );
	const fileBarPercent = Math.round(
		Math.min( 1, Math.max( 0, progress ) ) * 100
	);
	const progressBarValue = processingPhase
		? gumletPct != null
			? gumletPct
			: undefined
		: barIndeterminate
			? undefined
			: fileBarPercent;
	const labelPercent = processingPhase ? gumletPct : fileBarPercent;

	return (
		<div className="gumlet-uploader" style={ { marginBottom: '12px' } }>
			{ ! useParentWorkspace && (
				<div style={ { marginBottom: '8px' } }>
					<SelectControl
						label={ __( 'Upload workspace', 'gumlet-video' ) }
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
						disabled={ controlsLocked }
					/>
				</div>
			) }
			<div style={ { display: 'flex', alignItems: 'center', gap: '8px' } }>
				<Button
					variant="secondary"
					onClick={ () => fileInputRef.current?.click() }
					disabled={
						controlsLocked || ! uploadWorkspaceId
					}
				>
					{ busy ? (
						<Spinner />
					) : (
						__( 'Upload video or audio file', 'gumlet-video' )
					) }
				</Button>
				<input
					ref={ fileInputRef }
					type="file"
					accept={ GUMLET_UPLOAD_ACCEPT }
					style={ { display: 'none' } }
					onChange={ onPickFile }
				/>
				{ busy && progress > 0 && progress < 1 && (
					<span style={ { fontSize: '12px', color: '#555' } }>
						{ Math.round( progress * 100 ) }%
					</span>
				) }
			</div>
			{ showProgressBar && (
				<div style={ { marginTop: '10px' } }>
					<div
						style={ {
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
							fontSize: '12px',
							color: '#50575e',
							marginBottom: '4px',
							gap: '8px',
						} }
					>
						<span>{ barCaption }</span>
						{ labelPercent != null ? (
							<span style={ { fontWeight: 600 } }>
								{ labelPercent }%
							</span>
						) : (
							barIndeterminate && <Spinner />
						) }
					</div>
					<progress
						className="gumlet-upload-progress"
						style={ {
							width: '100%',
							height: '10px',
							verticalAlign: 'middle',
						} }
						max={ 100 }
						value={ progressBarValue }
					/>
				</div>
			) }
			{ embedChoice && (
				<div
					style={ {
						marginTop: '12px',
						padding: '12px',
						background: '#fff',
						border: '1px solid #c3c4c7',
						borderRadius: '4px',
					} }
				>
					<p style={ { margin: '0 0 8px', fontSize: '13px' } }>
						{ __(
							'Your file is on Gumlet and processing has started. You can embed the player now (thanks to instant transcoding) or wait until the asset is fully ready.',
							'gumlet-video'
						) }
					</p>
					{ embedChoice.status && (
						<p
							style={ {
								margin: '0 0 10px',
								fontSize: '12px',
								color: '#646970',
							} }
						>
							{ __( 'Current status:', 'gumlet-video' ) }{ ' ' }
							<strong>{ embedChoice.status }</strong>
							{ gumletPct != null
								? ` (${ gumletPct }%)`
								: '' }
						</p>
					) }
					<div
						style={ {
							display: 'flex',
							flexWrap: 'wrap',
							gap: '8px',
						} }
					>
						<Button variant="primary" onClick={ onEmbedNow }>
							{ __( 'Embed now', 'gumlet-video' ) }
						</Button>
						<Button variant="secondary" onClick={ onWaitUntilReady }>
							{ __( 'Wait until ready', 'gumlet-video' ) }
						</Button>
					</div>
				</div>
			) }
			{ error && (
				<p style={ { color: '#b32d2e', marginTop: '8px' } } role="alert">
					{ error }
				</p>
			) }
		</div>
	);
}
