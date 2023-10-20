<!--
SPDX-FileCopyrightText: syuilo and other misskey contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div class="_gaps_m">
	<MkButton v-if="oldMutedWords" inline rounded @click="showOldMuteWords()">{{ i18n.ts.showOldMuteWords }}</MkButton>
	<div>
		<MkTextarea v-model="mutedWords">
			<span>{{ i18n.ts._wordMute.muteWords }}</span>
			<template #caption>{{ i18n.ts._wordMute.muteWordsDescription }}<br>{{ i18n.ts._wordMute.muteWordsDescription2 }}</template>
		</MkTextarea>
	</div>
	<MkButton primary inline :disabled="!changed" @click="save()"><i class="ti ti-device-floppy"></i> {{ i18n.ts.save }}</MkButton>
	<MkSwitch v-model="showMutedInfo">
		<template #label>{{ i18n.ts.showMutedInfo }}<span class="_beta">{{ i18n.ts.originalFeature }}</span></template>
		<template #caption>{{ i18n.ts.showMutedInfoDescription }}</template>
	</MkSwitch>
</div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import MkTextarea from '@/components/MkTextarea.vue';
import MkButton from '@/components/MkButton.vue';
import MkSwitch from '@/components/MkSwitch.vue';
import { unisonReload } from '@/scripts/unison-reload.js';
import * as os from '@/os.js';
import { defaultStore } from '@/store.js';
import { $i } from '@/account.js';
import { i18n } from '@/i18n.js';

const render = (mutedWords: string[][]) => mutedWords.map(x => {
	if (Array.isArray(x)) {
		return x.join(' ');
	} else {
		return x;
	}
}).join('\n');

const tab = ref('soft');
const mutedWords = ref(render($i!.mutedWords));
const oldMutedWords = ref(render(defaultStore.state.mutedWords));
const changed = ref(false);
const showMutedInfo = computed(defaultStore.makeGetterSetter('showMutedInfo'));

watch(mutedWords, () => {
	changed.value = true;
});

watch(showMutedInfo, async () => {
	await apply();
});

async function save() {
	const parseMutes = (mutes) => {
		// split into lines, remove empty lines and unnecessary whitespace
		let lines = mutes.trim().split('\n').map(line => line.trim()).filter(line => line !== '');

		// check each line if it is a RegExp or not
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			const regexp = line.match(/^\/(.+)\/(.*)$/);
			if (regexp) {
				// check that the RegExp is valid
				try {
					new RegExp(regexp[1], regexp[2]);
					// note that regex lines will not be split by spaces!
				} catch (err: any) {
					// invalid syntax: do not save, do not reset changed flag
					os.alert({
						type: 'error',
						title: i18n.ts.regexpError,
						text: i18n.t('regexpErrorDescription', { tab: 'word mute', line: i + 1 }) + '\n' + err.toString(),
					});
					// re-throw error so these invalid settings are not saved
					throw err;
				}
			} else {
				lines[i] = line.split(' ');
			}
		}

		return lines;
	};

	let parsed;
	try {
		parsed = parseMutes(mutedWords.value);
	} catch (err) {
		// already displayed error message in parseMutes
		return;
	}

	await os.api('i/update', {
		mutedWords: parsed,
	});

	changed.value = false;
}

async function showOldMuteWords() {
	os.alert({
		type: 'info',
		text: oldMutedWords.value,
	});
}

async function apply() {
	const { canceled } = await os.confirm({
		type: 'info',
		text: i18n.ts.reloadToApplySetting,
	});
	if (canceled) return;

	unisonReload();
}
</script>
