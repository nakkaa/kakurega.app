import { defaultStore } from '@/store';

export function isSupportNavigatorConnection(): boolean {
	const connection = (navigator as any).connection;
	return connection && connection.type && ('onchange' in connection);
}

export function isMobileData(): boolean {
	const connection = (navigator as any).connection;
	if (!isSupportNavigatorConnection()) return false;
	return connection.type === 'cellular';
}

export function initializeDetectNetworkChange(): void {
	const connection = (navigator as any).connection;
	if (!isSupportNavigatorConnection()) return;

	connection.addEventListener('change', () => {
		if (!connection || !connection.type) return;
		defaultStore.set('enableDataSaverMode', connection.type === 'cellular');
	});
}
