import { defaultStore } from '@/store';

export function isMobileData(): boolean {
	if (!navigator.connection || !navigator.connection.type) return false;
	return navigator.connection.type === 'cellular';
}

export function initializeDetectNetworkChange(): void {
	if (!navigator.connection || !navigator.connection.type) return;
	if (!('onchange' in navigator.connection)) return;

	navigator.connection.addEventListener('change', () => {
		if (!navigator.connection || !navigator.connection.type) return;
		// console.log(`Network type changed to: ${navigator.connection.type}, useCompressedImage: ${isMobileData()}`);
		defaultStore.set('useCompressedImage', navigator.connection.type === 'cellular');
	});
}
