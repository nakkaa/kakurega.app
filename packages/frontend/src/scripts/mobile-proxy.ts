import { url } from '@/config';
import { defaultStore } from '@/store';

export function proxyImg(proxyUrl: string): string {
	if (!defaultStore.state.useCompressedImage) return proxyUrl;
	return `${url}/mobile-proxy?url=${proxyUrl}` + (defaultStore.state.betaTestKey ? `&key=${defaultStore.state.betaTestKey}` : '');
}
