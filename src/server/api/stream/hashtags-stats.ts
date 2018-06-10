import * as websocket from 'websocket';
import Xev from 'xev';

const ev = new Xev();

export default function(request: websocket.request, connection: websocket.connection): void {
	const onStats = stats => {
		connection.send(JSON.stringify({
			type: 'stats',
			body: stats
		}));
	};

	connection.on('message', async data => {
		const msg = JSON.parse(data.utf8Data);

		switch (msg.type) {
			case 'requestLog':
				ev.once('hashtagsStatsLog:' + msg.id, statsLog => {
					connection.send(JSON.stringify({
						type: 'statsLog',
						body: statsLog
					}));
				});
				ev.emit('requestHashtagsStatsLog', msg.id);
				break;
		}
	});

	ev.addListener('hashtagsStats', onStats);

	connection.on('close', () => {
		ev.removeListener('hashtagsStats', onStats);
	});
}
