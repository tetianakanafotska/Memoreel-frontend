import React, { useState, useContext, useEffect } from 'react';
import {
	PopUpButtons,
	MediaForm,
	MediaItem,
	Marquee,
	Loading,
} from '@components';
import { AddMediaButton } from '@components/PopUpButtons';
import { AuthContext } from '@context';
import assetsService from '../../services/assets.service';
import usersService from '../../services/users.service';
import { Container, Row, Col } from 'react-bootstrap';
import styles from './index.module.sass';
import boardStyles from '@components/Board/index.module.sass';

const Dashboard = () => {
	const { user } = useContext(AuthContext);
	const [openPopUp, setOpenPopUp] = useState(false);
	const [openMediaForm, setOpenMediaForm] = useState(false);
	const [assetType, setAssetType] = useState(null);
	const [allAssets, setAllAssets] = useState([]);
	const [loading, setLoading] = useState(true);

	const deleteAsset = (assetId) => {
		assetsService
			.delete(assetId)
			.then((res) => {
				setAllAssets((prevAssets) =>
					prevAssets.filter((asset) => asset._id !== assetId)
				);
			})
			.catch((err) => {
				console.error('Error deleting asset', err);
			});
	};

	const editAsset = (assetId, editedContent) => {
		assetsService
			.put(assetId, {
				content: editedContent,
			})
			.then((res) => {
				const updatedAsset = res.data;
				setAllAssets((prevAssets) =>
					prevAssets.map((asset) =>
						asset._id === assetId ? updatedAsset : asset
					)
				);
			})
			.catch((err) => {
				console.error('Error updating asset', err);
			});
	};

	const handleOpenPopUp = () => {
		setOpenPopUp(!openPopUp);
	};

	useEffect(() => {
		const currentDate = new Date().toISOString().slice(0, 10);
		if (user) {
			usersService.getCurrentBoard(user._id, currentDate).then((res) => {
				if (res.data.length !== 0) {
					setAllAssets(res.data[0].assets);
					setLoading(false);
				} else {
					setLoading(false);
				}
			});
		}
	}, [user]);

	return loading ? (
		<Loading />
	) : (
		<>
			{openMediaForm && (
				<div className={styles.dashboard_mediaForm}>
					<div className={styles.dashboard_mediaForm_bgr}>
						<MediaForm
							assetType={assetType}
							setOpenPopUp={setOpenPopUp}
							setOpenMediaForm={setOpenMediaForm}
							setAllAssets={setAllAssets}
							deleteAsset={deleteAsset}
							userId={user._id}
						/>
					</div>
				</div>
			)}
			<section className={styles.dashboard}>
				<Marquee
					phrases={[
						'For days worth remembering',
						user
							? `What's on your mind, ${user.name} ?`
							: "What's on your mind?",
						'What made you laugh today?',
					]}
					className={boardStyles.marquee}
				/>

				<div className={styles.dashboard_addContent}>
					<AddMediaButton
						onClick={() => {
							handleOpenPopUp();
							setOpenMediaForm((prev) => (prev ? false : false));
						}}
						openPopUp={openPopUp}
					/>

					{openPopUp && (
						<PopUpButtons
							assetType={assetType}
							setAssetType={setAssetType}
							setOpenMediaForm={setOpenMediaForm}
							openMediaForm={openMediaForm}
						/>
					)}
				</div>

				{allAssets.length > 0 ? (
					<div className={boardStyles.board}>
						{allAssets
							.slice()
							.reverse()
							.map((asset) => (
								<MediaItem
									key={asset._id}
									asset={asset}
									editAsset={editAsset}
									deleteAsset={deleteAsset}
									enableEditing={true}
								/>
							))}
					</div>
				) : (
					<div id='errorMessage'>Create content for today!</div>
				)}
			</section>
		</>
	);
};

export default Dashboard;
