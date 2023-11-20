import { markRaw } from 'vue';
import { Storage } from '@/pizzax.js';

export const zenStore = markRaw(new Storage('zenMode', {
	showWidgets: {
		where: 'deviceAccount',
		default: true,
	},
}));
