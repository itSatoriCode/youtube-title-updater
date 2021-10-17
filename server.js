import dotenv from 'dotenv';

import { google } from 'googleapis';

dotenv.config();
const VIDEO_ID = process.env.VIDEO_ID;

const main = async () => {
	try {
		const auth = getAuthorization();
		const views = await getViews(auth);
		const title = await updateTitle(auth, views);
	} catch (error) {
		console.error(error);
	}
};

const getAuthorization = () => {
	var OAuth2 = google.auth.OAuth2;

	const credentials = JSON.parse(process.env.CLIENT_SECRET);
	var clientSecret = credentials.installed.client_secret;
	var clientId = credentials.installed.client_id;
	var redirectUrl = credentials.installed.redirect_uris[0];
	var oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);

	oauth2Client.credentials = JSON.parse(process.env.OAUTH_TOKEN);
	return oauth2Client;
};

const getViews = (auth) => {
	const service = google.youtube('v3');
	return new Promise((resolve, reject) => {
		service.videos.list(
			{
				auth: auth,
				part: 'statistics',
				id: VIDEO_ID,
			},
			(err, response) => {
				if (err) return reject(err);
				console.log(response);
				resolve(response.data.items[0].statistics.viewCount);
			}
		);
	});
};

const updateTitle = (auth, views) => {
	const service = google.youtube('v3');
	return new Promise((resolve, reject) => {
		service.videos.update(
			{
				auth: auth,
				part: 'snippet',
				resource: {
					id: VIDEO_ID,
					snippet: {
						title: `This Video Has ${new Intl.NumberFormat('en-US').format(
							views
						)} Views, Explained (Tutorial)`,
						categoryId: 27,
					},
				},
			},
			(error, response) => {
				if (error) return reject(error);
				console.log(response);
				resolve(response.data.snippet.title);
			}
		);
	});
};

main();
